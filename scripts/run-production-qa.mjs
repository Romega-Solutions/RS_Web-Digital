import { execFileSync, spawn, spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import path from "node:path";

const isWindows = process.platform === "win32";
const pnpm = "pnpm";
const qaStepTimeoutMs = Number(process.env.PRODUCTION_QA_STEP_TIMEOUT_MS ?? "300000");
const outputDir = path.join(process.cwd(), "reports", "production-qa");
const productionBaseUrl = (
  process.env.PRODUCTION_QA_BASE_URL ||
  process.env.READINESS_PRODUCTION_BASE_URL ||
  "https://www.romega-solutions.com"
).replace(/\/+$/, "");
const headSha = getHeadSha();
const startedAt = new Date().toISOString();
const expectedArtifacts = [
  {
    label: "Responsive audit summary",
    path: path.join(process.cwd(), "reports", "responsive-audit", "responsive-audit-summary.json"),
  },
  {
    label: "Accessibility audit summary",
    path: path.join(
      process.cwd(),
      "reports",
      "accessibility-audit",
      "accessibility-audit-summary.json",
    ),
  },
  {
    label: "Keyboard audit summary",
    path: path.join(process.cwd(), "reports", "keyboard-audit", "keyboard-audit-summary.json"),
  },
  {
    label: "Product-flow audit summary",
    path: path.join(
      process.cwd(),
      "reports",
      "product-flow-audit",
      "product-flow-audit-summary.json",
    ),
  },
  {
    label: "Visual render audit summary",
    path: path.join(
      process.cwd(),
      "reports",
      "visual-render-audit",
      "visual-render-audit-summary.json",
    ),
  },
  {
    label: "Live deployment audit report",
    path: path.join(
      process.cwd(),
      "reports",
      "live-deployment-audit",
      "live-deployment-audit.json",
    ),
  },
];

function getHeadSha() {
  try {
    return execFileSync("git", ["rev-parse", "HEAD"], {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "unknown";
  }
}

function quoteForCmd(value) {
  const stringValue = String(value);
  if (!/[\s"&|<>^]/.test(stringValue)) {
    return stringValue;
  }

  return `"${stringValue.replaceAll('"', '""')}"`;
}

function getCommand(command, args) {
  if (!isWindows) {
    return { command, args };
  }

  const commandLine = [command, ...args.map(quoteForCmd)].join(" ");
  return { command: "cmd.exe", args: ["/d", "/s", "/c", commandLine] };
}

function stopProcessTree(child) {
  if (!child?.pid || child.exitCode !== null) {
    return;
  }

  if (isWindows) {
    spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
      stdio: "ignore",
    });
    return;
  }

  child.kill("SIGTERM");
}

function runPnpm(label, args, env = {}) {
  console.log(`\n==> ${label}`);
  const command = getCommand(pnpm, args);
  return new Promise((resolve) => {
    let timedOut = false;
    const child = spawn(command.command, command.args, {
      cwd: process.cwd(),
      env: { ...process.env, ...env },
      stdio: "inherit",
      shell: false,
      windowsHide: true,
    });

    const timeout = setTimeout(() => {
      timedOut = true;
      stopProcessTree(child);
    }, qaStepTimeoutMs);

    child.on("error", (error) => {
      clearTimeout(timeout);
      console.error(`${label} failed to start: ${error.message}`);
      resolve({
        label,
        passed: false,
        status: 1,
        error: error.message,
      });
    });

    child.on("close", (status) => {
      clearTimeout(timeout);
      if (timedOut) {
        const error = `Timed out after ${qaStepTimeoutMs}ms.`;
        console.error(`${label} ${error}`);
        resolve({
          label,
          passed: false,
          status: 1,
          error,
        });
        return;
      }

      resolve({
        label,
        passed: status === 0,
        status: status ?? 1,
        error: null,
      });
    });
  });
}

function readJsonFile(filePath) {
  if (!existsSync(filePath)) {
    return null;
  }

  try {
    return JSON.parse(readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function summarizeFailure(failure) {
  if (!failure || typeof failure !== "object") {
    return String(failure || "Unknown failure.");
  }

  if (failure.route && failure.viewport) {
    const overflowingElementCount =
      typeof failure.overflowingElementCount === "number"
        ? failure.overflowingElementCount
        : Array.isArray(failure.overflowingElements)
          ? failure.overflowingElements.length
          : null;
    const tapTargetIssueCount =
      typeof failure.tapTargetIssueCount === "number"
        ? failure.tapTargetIssueCount
        : Array.isArray(failure.tapTargetIssues)
          ? failure.tapTargetIssues.length
          : null;
    const parts = [
      `${failure.route} ${failure.viewport}`,
      typeof failure.status === "number" ? `status ${failure.status}` : "",
      typeof failure.horizontalOverflow === "number"
        ? `overflow ${failure.horizontalOverflow}px`
        : "",
      typeof overflowingElementCount === "number"
        ? `${overflowingElementCount} overflowing elements`
        : "",
      typeof tapTargetIssueCount === "number" ? `${tapTargetIssueCount} tap target issues` : "",
    ].filter(Boolean);

    return parts.join(", ");
  }

  if (failure.url && failure.failure) {
    return `${failure.url}: ${failure.failure}`;
  }

  if (failure.route && Array.isArray(failure.violations)) {
    const violations = failure.violations
      .map((violation) => `${violation.id || "unknown"}:${violation.impact || "unknown"}`)
      .join(", ");
    return `${failure.route} status ${failure.status ?? "unknown"} - ${violations}`;
  }

  return JSON.stringify(failure).slice(0, 240);
}

function stripAnsi(value) {
  return String(value).replace(/\u001b\[[0-9;]*m/g, "");
}

function summarizeTestResult(result) {
  if (!result || typeof result !== "object") {
    return String(result || "Unknown test result.");
  }

  const title = result.title || "Unnamed check";
  const status = result.status || "unknown";
  const firstError = Array.isArray(result.errors) && result.errors.length > 0
    ? stripAnsi(result.errors[0]).replace(/\s+/g, " ").trim()
    : "";

  return `${title}: ${status}${firstError ? ` - ${firstError}` : ""}`.slice(0, 240);
}

function getFailureSamples(report, maxCount = 5) {
  if (Array.isArray(report?.failures) && report.failures.length > 0) {
    return report.failures.slice(0, maxCount).map(summarizeFailure);
  }

  if (Array.isArray(report?.results)) {
    const failingResults = report.results.filter((result) => {
      if (!result || typeof result !== "object") {
        return false;
      }

      if (result.status && result.status !== "passed") {
        return true;
      }

      return typeof result.violationCount === "number" && result.violationCount > 0;
    });

    return failingResults.slice(0, maxCount).map((result) => {
      if (result.route && Array.isArray(result.violations)) {
        return summarizeFailure(result);
      }

      return summarizeTestResult(result);
    });
  }

  return [];
}

function formatGateResult(result) {
  if (result.passed) {
    return `- ${result.label}: passed`;
  }

  const status = result.status ?? "unavailable";
  const error = result.error ? ` - ${result.error}` : "";
  return `- ${result.label}: failed with exit ${status}${error}`;
}

function getArtifactChecks() {
  return expectedArtifacts.map((artifact) => {
    const report = readJsonFile(artifact.path);
    const relativePath = path.relative(process.cwd(), artifact.path);
    const failures = [];

    if (!report) {
      failures.push("Artifact is missing or invalid JSON.");
    } else {
      if (report.headSha !== headSha) {
        failures.push(`Expected head ${headSha}, got ${report.headSha || "unavailable"}.`);
      }

      if (typeof report.baseUrl !== "string" || report.baseUrl.replace(/\/+$/, "") !== productionBaseUrl) {
        failures.push(`Expected base URL ${productionBaseUrl}, got ${report.baseUrl || "unavailable"}.`);
      }

      if (report.passed !== true) {
        failures.push("Artifact did not record passed=true.");
      }
    }

    return {
      label: artifact.label,
      path: relativePath,
      headSha: report?.headSha || "unavailable",
      baseUrl: report?.baseUrl || "unavailable",
      passed: failures.length === 0,
      failureCount: typeof report?.failureCount === "number" ? report.failureCount : null,
      finishedAt: report?.finishedAt || null,
      failureSamples: getFailureSamples(report),
      failures,
    };
  });
}

function clearExpectedArtifacts() {
  for (const artifact of expectedArtifacts) {
    rmSync(artifact.path, { force: true });
  }
}

function writeProductionQaReport(
  gateResults,
  readinessInitialResult = null,
  readinessRefreshResult = null,
  readinessFinalSyncResult = null,
  readinessPostFinalArtifactResult = null,
  readinessRecordedArtifactResult = null,
  readinessPublishedArtifactResult = null,
  readinessArtifactConfirmationResult = null,
) {
  const artifactChecks = getArtifactChecks();
  const readinessResults = [
    readinessInitialResult,
    readinessRefreshResult,
    readinessFinalSyncResult,
    readinessPostFinalArtifactResult,
    readinessRecordedArtifactResult,
    readinessPublishedArtifactResult,
    readinessArtifactConfirmationResult,
  ].filter(Boolean);
  const failedResults = [
    ...gateResults.filter((result) => !result.passed),
    ...readinessResults.filter((result) => !result.passed),
    ...artifactChecks.filter((result) => !result.passed),
  ];
  const report = {
    headSha,
    baseUrl: productionBaseUrl,
    startedAt,
    finishedAt: new Date().toISOString(),
    passed: failedResults.length === 0,
    contactDeliveryIncluded: false,
    contactDeliveryNote:
      "Contact delivery is intentionally excluded because audit:contact:delivery sends a real production submission.",
    gateResults,
    artifactChecks,
    readinessResult: readinessInitialResult,
    readinessInitialResult,
    readinessRefreshResult,
    readinessFinalSyncResult,
    readinessPostFinalArtifactResult,
    readinessRecordedArtifactResult,
    readinessPublishedArtifactResult,
    readinessArtifactConfirmationResult,
    failureCount: failedResults.length,
    failures: failedResults.map((result) => ({
      label: result.label,
      status: result.status,
      error: result.error,
      failures: result.failures,
    })),
  };

  const markdown = `# Production QA Report

Generated: ${report.finishedAt}
Head: \`${report.headSha}\`
Base URL: ${report.baseUrl}
Passed: ${report.passed ? "yes" : "no"}
Contact delivery included: no

## Gates

${report.gateResults
  .map(formatGateResult)
  .join("\n")}
${report.readinessInitialResult ? formatGateResult(report.readinessInitialResult) : ""}
${report.readinessRefreshResult ? formatGateResult(report.readinessRefreshResult) : ""}
${report.readinessFinalSyncResult ? formatGateResult(report.readinessFinalSyncResult) : ""}
${report.readinessPostFinalArtifactResult ? formatGateResult(report.readinessPostFinalArtifactResult) : ""}
${report.readinessRecordedArtifactResult ? formatGateResult(report.readinessRecordedArtifactResult) : ""}
${report.readinessPublishedArtifactResult ? formatGateResult(report.readinessPublishedArtifactResult) : ""}
${report.readinessArtifactConfirmationResult ? formatGateResult(report.readinessArtifactConfirmationResult) : ""}

## Artifact Checks

${report.artifactChecks
  .map((result) => {
    const samples = result.failureSamples.length
      ? `\n  - Samples: ${result.failureSamples.join(" | ")}`
      : "";
    return `- ${result.label}: ${result.passed ? "passed" : result.failures.join("; ")}${samples}`;
  })
  .join("\n")}

## Notes

- ${report.contactDeliveryNote}
`;

  mkdirSync(outputDir, { recursive: true });
  writeFileSync(path.join(outputDir, "production-qa.json"), JSON.stringify(report, null, 2));
  writeFileSync(path.join(outputDir, "production-qa.md"), markdown);
  return report;
}

const baseUrlEnv = {
  READINESS_PRODUCTION_BASE_URL: productionBaseUrl,
  RESPONSIVE_AUDIT_BASE_URL: productionBaseUrl,
  ACCESSIBILITY_AUDIT_BASE_URL: productionBaseUrl,
  KEYBOARD_AUDIT_BASE_URL: productionBaseUrl,
  PRODUCT_AUDIT_BASE_URL: productionBaseUrl,
  VISUAL_AUDIT_BASE_URL: productionBaseUrl,
  LIVE_AUDIT_BASE_URL: productionBaseUrl,
};

console.log(`Production QA target: ${productionBaseUrl}`);
console.log("Contact delivery is intentionally excluded; run audit:contact:delivery only after real-send approval.");
clearExpectedArtifacts();

const gateResults = [
  await runPnpm("Production responsive audit", ["run", "audit:responsive"], baseUrlEnv),
  await runPnpm("Production accessibility audit", ["run", "audit:a11y"], baseUrlEnv),
  await runPnpm("Production keyboard audit", ["run", "audit:keyboard"], baseUrlEnv),
  await runPnpm("Production product-flow audit", ["run", "audit:product"], baseUrlEnv),
  await runPnpm("Production visual render audit", ["run", "audit:visual"], baseUrlEnv),
  await runPnpm("Production live deployment audit", ["run", "audit:live"], baseUrlEnv),
];

writeProductionQaReport(gateResults);
const readinessResult = await runPnpm("Release-readiness report", ["run", "report:readiness"], baseUrlEnv);
writeProductionQaReport(gateResults, readinessResult);
const readinessRefreshResult = await runPnpm("Release-readiness report refresh", ["run", "report:readiness"], baseUrlEnv);
writeProductionQaReport(gateResults, readinessResult, readinessRefreshResult);
const readinessFinalSyncResult = await runPnpm("Release-readiness final sync", ["run", "report:readiness"], baseUrlEnv);
writeProductionQaReport(
  gateResults,
  readinessResult,
  readinessRefreshResult,
  readinessFinalSyncResult,
);
const readinessPostFinalArtifactResult = await runPnpm(
  "Release-readiness post-final artifact sync",
  ["run", "report:readiness"],
  baseUrlEnv,
);
writeProductionQaReport(
  gateResults,
  readinessResult,
  readinessRefreshResult,
  readinessFinalSyncResult,
  readinessPostFinalArtifactResult,
);
const readinessRecordedArtifactResult = await runPnpm(
  "Release-readiness recorded artifact sync",
  ["run", "report:readiness"],
  baseUrlEnv,
);
writeProductionQaReport(
  gateResults,
  readinessResult,
  readinessRefreshResult,
  readinessFinalSyncResult,
  readinessPostFinalArtifactResult,
  readinessRecordedArtifactResult,
);
const readinessPublishedArtifactResult = await runPnpm(
  "Release-readiness published artifact sync",
  ["run", "report:readiness"],
  baseUrlEnv,
);
writeProductionQaReport(
  gateResults,
  readinessResult,
  readinessRefreshResult,
  readinessFinalSyncResult,
  readinessPostFinalArtifactResult,
  readinessRecordedArtifactResult,
  readinessPublishedArtifactResult,
);
const readinessArtifactConfirmationResult = await runPnpm(
  "Release-readiness artifact confirmation",
  ["run", "report:readiness"],
  baseUrlEnv,
);
const confirmedProductionQaReport = writeProductionQaReport(
  gateResults,
  readinessResult,
  readinessRefreshResult,
  readinessFinalSyncResult,
  readinessPostFinalArtifactResult,
  readinessRecordedArtifactResult,
  readinessPublishedArtifactResult,
  readinessArtifactConfirmationResult,
);
const readinessConfirmedArtifactSyncResult = await runPnpm(
  "Release-readiness confirmed-artifact sync",
  ["run", "report:readiness"],
  baseUrlEnv,
);
const failedResults = [
  ...confirmedProductionQaReport.failures,
  ...(!readinessConfirmedArtifactSyncResult.passed ? [readinessConfirmedArtifactSyncResult] : []),
];

console.log("\nProduction QA summary:");
for (const result of [
  ...gateResults,
  readinessResult,
  readinessRefreshResult,
  readinessFinalSyncResult,
  readinessPostFinalArtifactResult,
  readinessRecordedArtifactResult,
  readinessPublishedArtifactResult,
  readinessArtifactConfirmationResult,
  readinessConfirmedArtifactSyncResult,
]) {
  const suffix = result.error ? ` - ${result.error}` : "";
  console.log(`- ${result.label}: ${result.passed ? "passed" : `failed with exit ${result.status}`}${suffix}`);
}

if (failedResults.length > 0) {
  console.error("\nProduction QA failed. The readiness report was still regenerated with the latest available artifacts.");
  process.exit(1);
}

console.log("\nProduction QA completed. Run the guarded contact delivery audit separately after email-provider readiness and send approval.");
