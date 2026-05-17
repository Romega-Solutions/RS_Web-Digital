import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const outputDir = path.join(process.cwd(), "reports", "owner-unblock");
const productionQaReportPath = path.join(
  process.cwd(),
  "reports",
  "production-qa",
  "production-qa.json",
);
const readinessReportPath = path.join(
  process.cwd(),
  "reports",
  "release-readiness",
  "release-readiness.json",
);
const contactDeliveryAuditReportPath = path.join(
  process.cwd(),
  "reports",
  "contact-delivery-audit",
  "contact-delivery-audit.json",
);
const repo = process.env.OWNER_UNBLOCK_REPO || "Romega-Solutions/RS_Web-Digital";
const intendedContexts = parseCsvEnv("OWNER_UNBLOCK_INTENDED_VERCEL_CONTEXTS", [
  "Vercel – romega-digitals",
]);
const duplicateContexts = parseCsvEnv("OWNER_UNBLOCK_DUPLICATE_VERCEL_CONTEXTS", [
  "Vercel – rs-web-digital",
]);
const vercelOwnerScope = process.env.OWNER_UNBLOCK_VERCEL_SCOPE || "kpg782s-projects";
const headSha = run("git", ["rev-parse", "HEAD"]) || "unknown";
const branchName = run("git", ["branch", "--show-current"]) || "unknown";

function run(command, args, options = {}) {
  try {
    return execFileSync(command, args, {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      ...options,
    }).trim();
  } catch (error) {
    const stdout = error.stdout?.toString?.().trim() || "";
    const stderr = error.stderr?.toString?.().trim() || "";
    return [stdout, stderr].filter(Boolean).join("\n").trim();
  }
}

function runStrict(command, args) {
  try {
    const output = execFileSync(command, args, {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    }).trim();

    return {
      ok: true,
      output,
    };
  } catch (error) {
    return {
      ok: false,
      output: [error.stdout?.toString?.().trim(), error.stderr?.toString?.().trim()]
        .filter(Boolean)
        .join("\n")
        .trim(),
    };
  }
}

function quotePwsh(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

function runVercel(args) {
  if (process.platform === "win32") {
    return runStrict("pwsh", [
      "-NoProfile",
      "-Command",
      `& ${["vercel", ...args].map(quotePwsh).join(" ")}`,
    ]);
  }

  return runStrict("vercel", args);
}

function parseJson(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
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

function parseCsvEnv(name, fallback) {
  const value = process.env[name];
  if (!value) {
    return fallback;
  }

  const parsed = value
    .split(",")
    .map((item) => item.trim().replace(/\s+-\s+/, " – "))
    .filter(Boolean);

  return parsed.length > 0 ? parsed : fallback;
}

function summarizeStatuses(statusPayload) {
  if (!statusPayload?.statuses) {
    return [];
  }

  return statusPayload.statuses.map((status) => ({
    context: status.context,
    state: status.state,
    description: status.description,
    targetUrl: status.target_url,
    buildRateLimited: isVercelBuildRateLimited(status.target_url),
    deploymentId:
      extractDeploymentIdFromDescription(status.description) ||
      extractDeploymentId(status.target_url),
    deploymentSlug: extractDeploymentId(status.target_url),
    projectSlug: extractVercelProjectSlug(status.target_url),
  }));
}

function getGithubDeployments() {
  const deployments = parseJson(
    run("gh", ["api", `repos/${repo}/deployments`, "--paginate"]),
    [],
  );

  return deployments
    .filter((deployment) => deployment.sha === headSha)
    .map((deployment) => {
      const latestStatus = parseJson(
        run("gh", ["api", `repos/${repo}/deployments/${deployment.id}/statuses`]),
        [],
      )[0];

      return {
        id: deployment.id,
        environment: deployment.environment,
        state: latestStatus?.state || "unavailable",
        description: latestStatus?.description || deployment.description || "",
        environmentUrl: latestStatus?.environment_url || "",
        targetUrl: latestStatus?.target_url || "",
        logUrl: latestStatus?.log_url || "",
        createdAt: latestStatus?.created_at || deployment.created_at,
      };
    });
}

function findDeploymentForContext(status) {
  if (!status?.projectSlug) {
    return null;
  }

  return deployments.find((deployment) =>
    deployment.environment?.toLowerCase().endsWith(status.projectSlug.toLowerCase()),
  );
}

function extractDeploymentId(targetUrl = "") {
  try {
    const url = new URL(targetUrl);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts.length >= 3 ? parts[2] : "";
  } catch {
    const parts = targetUrl.split("/").filter(Boolean);
    return parts.length >= 4 ? parts.at(-1) : "";
  }
}

function extractDeploymentIdFromDescription(description = "") {
  const match = String(description).match(/\b(dpl_[A-Za-z0-9]+)\b/);
  return match?.[1] || "";
}

function extractVercelProjectSlug(targetUrl = "") {
  try {
    const url = new URL(targetUrl);
    const parts = url.pathname.split("/").filter(Boolean);
    return parts.length >= 2 ? parts[1] : "";
  } catch {
    const parts = targetUrl.split("/").filter(Boolean);
    const vercelIndex = parts.findIndex((part) => part === "vercel.com");
    return vercelIndex >= 0 && parts.length > vercelIndex + 2 ? parts[vercelIndex + 2] : "";
  }
}

function isVercelBuildRateLimited(targetUrl = "") {
  try {
    const url = new URL(targetUrl);
    return url.searchParams.get("upgradeToPro") === "build-rate-limit";
  } catch {
    return /upgradeToPro=build-rate-limit/i.test(targetUrl);
  }
}

function inspectDeployment(deploymentId) {
  if (!deploymentId) {
    return {
      attempted: false,
      accessible: false,
      note: "No Vercel deployment id was available in the commit status target URL.",
    };
  }

  const result = runVercel(["inspect", deploymentId, "--logs"]);

  return {
    attempted: true,
    accessible: result.ok,
    deploymentId,
    output: redact(result.output).slice(0, 4000),
  };
}

function redact(value = "") {
  return value
    .replace(/(token|secret|key|password)=\S+/gi, "$1=<redacted>")
    .replace(/(Authorization:\s*Bearer\s+)\S+/gi, "$1<redacted>");
}

function formatFailureCount(count) {
  if (typeof count !== "number") {
    return "";
  }

  return ` (${count} ${count === 1 ? "failure" : "failures"})`;
}

const githubStatus = parseJson(
  run("gh", ["api", `repos/${repo}/commits/${headSha}/status`]),
  null,
);
const deployments = getGithubDeployments();
const statuses = summarizeStatuses(githubStatus);
const intended = statuses.filter((status) => intendedContexts.includes(status.context));
const duplicates = statuses.filter((status) => duplicateContexts.includes(status.context));
const unexpectedVercelContexts = statuses.filter(
  (status) =>
    /^Vercel\b/.test(status.context) &&
    !intendedContexts.includes(status.context) &&
    !duplicateContexts.includes(status.context),
);
const unexpectedFailingVercelContexts = unexpectedVercelContexts.filter(
  (status) => status.state === "failure",
);
const buildRateLimitedContexts = statuses.filter((status) => status.buildRateLimited);
const vercelWhoamiResult = runVercel(["whoami"]);
const vercelTeamsResult = runVercel(["teams", "ls"]);
const vercelWhoami = vercelWhoamiResult.ok ? vercelWhoamiResult.output : "unavailable";
const vercelTeams = vercelTeamsResult.ok ? vercelTeamsResult.output : "unavailable";
const productionQa = readJsonFile(productionQaReportPath);
const readiness = readJsonFile(readinessReportPath);
const contactDeliveryAudit = readJsonFile(contactDeliveryAuditReportPath);
const duplicateInspections = duplicates.map((status) => ({
  ...status,
  githubDeployment: findDeploymentForContext(status),
  inspection: inspectDeployment(status.deploymentId),
}));
const missingOwnerScope =
  vercelWhoami !== vercelOwnerScope &&
  !new RegExp(`\\b${vercelOwnerScope.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(
    vercelTeams,
  );
const blockers = [];
const productionQaCurrentHead = productionQa?.headSha === headSha;
const readinessCurrentHead = readiness?.headSha === headSha;
const contactDeliveryCurrentHead = contactDeliveryAudit?.headSha === headSha;

if (missingOwnerScope) {
  blockers.push(
    `Current Vercel login is not in owner scope ${vercelOwnerScope}; owner-scope deployment, env, and domain changes cannot be completed locally.`,
  );
}

if (duplicates.some((status) => status.state === "failure")) {
  blockers.push(
    `Duplicate Vercel context is failing: ${duplicates
      .filter((status) => status.state === "failure")
      .map((status) => status.context)
      .join(", ")}.`,
  );
}

const inaccessibleDuplicateInspections = duplicateInspections.filter(
  (status) => status.inspection.attempted && !status.inspection.accessible,
);
const duplicateInspectCommands = duplicateInspections
  .filter((status) => Boolean(status.inspection.deploymentId))
  .map((status) => ({
    context: status.context,
    projectSlug: status.projectSlug || "unknown project",
    deploymentId: status.inspection.deploymentId,
    command: `vercel inspect ${status.inspection.deploymentId} --logs --scope ${vercelOwnerScope}`,
  }));

if (inaccessibleDuplicateInspections.length > 0) {
  blockers.push(
    `Failed duplicate Vercel deployment logs require owner scope: ${inaccessibleDuplicateInspections
      .map((status) => status.inspection.deploymentId)
      .join(", ")}.`,
  );
}

if (buildRateLimitedContexts.length > 0) {
  blockers.push(
    `Vercel build rate limit is blocking deployment for: ${buildRateLimitedContexts
      .map((status) => status.context)
      .join(", ")}.`,
  );
}

if (unexpectedFailingVercelContexts.length > 0) {
  blockers.push(
    `Unexpected Vercel context is failing: ${unexpectedFailingVercelContexts
      .map((status) => status.context)
      .join(", ")}.`,
  );
}

if (intended.length !== intendedContexts.length || intended.some((status) => status.state !== "success")) {
  blockers.push("Intended Vercel context is not fully successful.");
}

const report = {
  generatedAt: new Date().toISOString(),
  repo,
  branch: branchName,
  headSha,
  commitStatusState: githubStatus?.state || "unavailable",
  vercelOwnerScope,
  vercelWhoami,
  missingOwnerScope,
  intendedContexts,
  duplicateContexts,
  intended,
  unexpectedVercelContexts,
  unexpectedFailingVercelContexts,
  deployments,
  duplicateInspections,
  duplicateInspectCommands,
  buildRateLimitedContexts,
  productionReadiness: {
    readinessAvailable: Boolean(readiness),
    readinessCurrentHead,
    submissionReady: readiness?.submissionReady === true,
    expectedProductionBaseUrl: readiness?.expectedProductionBaseUrl || "unavailable",
    productionDomainProbePassed: readiness?.productionDomainProbe?.passed === true,
    productionQaAvailable: Boolean(productionQa),
    productionQaCurrentHead,
    productionQaBaseUrl: productionQa?.baseUrl || "unavailable",
    productionQaPassed: productionQa?.passed === true,
    productionQaFailureCount:
      typeof productionQa?.failureCount === "number" ? productionQa.failureCount : null,
    productionQaArtifactConfirmationPassed:
      productionQa?.readinessArtifactConfirmationResult?.passed === true,
    productionQaGates: Array.isArray(productionQa?.gateResults)
      ? productionQa.gateResults.map((gate) => ({
          label: gate.label,
          passed: gate.passed === true,
          status: typeof gate.status === "number" ? gate.status : null,
          error: gate.error || null,
        }))
      : [],
    productionQaArtifactChecks: Array.isArray(productionQa?.artifactChecks)
      ? productionQa.artifactChecks.map((artifact) => ({
          label: artifact.label,
          passed: artifact.passed === true,
          failureCount:
            typeof artifact.failureCount === "number" ? artifact.failureCount : null,
          failureSamples: Array.isArray(artifact.failureSamples)
            ? artifact.failureSamples.slice(0, 3)
            : [],
        }))
      : [],
    readinessBlockers: Array.isArray(readiness?.blockers) ? readiness.blockers : [],
    localQaAvailable: readiness?.localQa?.available === true,
    localQaCurrentHead: readiness?.localQa?.currentHead === true,
    localQaPassed: readiness?.localQa?.passed === true,
    localQaArtifactDir: readiness?.localQa?.artifactDir || "unavailable",
    localQaArtifacts: Array.isArray(readiness?.localQa?.artifacts)
      ? readiness.localQa.artifacts.map((artifact) => ({
          label: artifact.label,
          passed: artifact.passed === true,
          currentHead: artifact.currentHead === true,
          baseUrl: artifact.baseUrl || "unavailable",
          failureCount:
            typeof artifact.failureCount === "number" ? artifact.failureCount : null,
        }))
      : [],
    contactDeliveryAvailable: Boolean(contactDeliveryAudit),
    contactDeliveryCurrentHead,
    contactDeliveryBaseUrl: contactDeliveryAudit?.baseUrl || "unavailable",
    contactDeliveryMode: contactDeliveryAudit?.mode || "unavailable",
    contactDeliveryPassed: contactDeliveryAudit?.passed === true,
    contactDeliverySent: contactDeliveryAudit?.sent === true,
    contactDeliverySubmissionAttempted:
      contactDeliveryAudit?.submissionAttempted === true,
    contactDeliveryResponseReceived: contactDeliveryAudit?.responseReceived === true,
    contactDeliveryConfirmed: contactDeliveryAudit?.deliveryConfirmed === true,
    contactDeliveryFailures: Array.isArray(contactDeliveryAudit?.failures)
      ? contactDeliveryAudit.failures
      : [],
  },
  blockers,
};

const markdown = `# Vercel Owner Unblock Report

Generated: ${report.generatedAt}
Branch: \`${report.branch}\`
Head: \`${report.headSha}\`
Commit status: \`${report.commitStatusState}\`

## Local Vercel Access

- Current login: \`${report.vercelWhoami}\`
- Required owner scope: \`${report.vercelOwnerScope}\`
- Owner scope available locally: ${report.missingOwnerScope ? "no" : "yes"}

## Intended Vercel Contexts

${report.intended
  .map((status) => {
    const deployment = findDeploymentForContext(status);
    const environmentUrl = deployment?.environmentUrl
      ? `\n  - Environment URL: ${deployment.environmentUrl}`
      : "";
    return `- ${status.context}: ${status.state} (${status.projectSlug || "unknown project"}) ${status.targetUrl || ""}${environmentUrl}`;
  })
  .join("\n") || "- none found"}

## Duplicate Vercel Contexts

${report.duplicateInspections
  .map((status) => {
    const access = status.inspection.accessible ? "inspectable locally" : "not inspectable locally";
    const rateLimit = status.buildRateLimited ? "\n  - Build rate limited: yes" : "";
    const environmentUrl = status.githubDeployment?.environmentUrl
      ? `\n  - Environment URL: ${status.githubDeployment.environmentUrl}`
      : "";
    const inspectOutput = status.inspection.output
      ? `\n  - Inspection output: ${status.inspection.output.replace(/\n/g, " | ")}`
      : "";
    const deploymentSlug =
      status.deploymentSlug && status.deploymentSlug !== status.deploymentId
        ? `\n  - Deployment URL slug: \`${status.deploymentSlug}\``
        : "";
    return `- ${status.context}: ${status.state} (${status.projectSlug || "unknown project"}) ${status.targetUrl || ""}${environmentUrl}${rateLimit}\n  - Deployment id: \`${status.deploymentId || "unavailable"}\`${deploymentSlug}\n  - Local inspection: ${access}${inspectOutput}`;
  })
  .join("\n") || "- none found"}

## Unexpected Vercel Contexts

${report.unexpectedVercelContexts
  .map((status) => {
    const rateLimit = status.buildRateLimited ? "\n  - Build rate limited: yes" : "";
    return `- ${status.context}: ${status.state} (${status.projectSlug || "unknown project"}) ${status.targetUrl || ""}${rateLimit}`;
  })
  .join("\n") || "- none found"}

## GitHub Deployment URLs

${report.deployments
  .map((deployment) => {
    const environmentUrl = deployment.environmentUrl
      ? `\n  - Environment URL: ${deployment.environmentUrl}`
      : "";
    return `- ${deployment.environment}: ${deployment.state} - ${deployment.description || "no description"}${environmentUrl}`;
  })
  .join("\n") || "- unavailable"}

## Vercel Build Rate Limit

${report.buildRateLimitedContexts
  .map((status) => `- ${status.context}: ${status.targetUrl || "no target URL"}`)
  .join("\n") || "- none detected"}

## Production Readiness Snapshot

- Readiness artifact current head: ${report.productionReadiness.readinessCurrentHead ? "yes" : "no"}
- Submission ready: ${report.productionReadiness.submissionReady ? "yes" : "no"}
- Expected production URL: ${report.productionReadiness.expectedProductionBaseUrl}
- Production domain probe passed: ${report.productionReadiness.productionDomainProbePassed ? "yes" : "no"}
- Production QA artifact current head: ${report.productionReadiness.productionQaCurrentHead ? "yes" : "no"}
- Production QA URL: ${report.productionReadiness.productionQaBaseUrl}
- Production QA passed: ${report.productionReadiness.productionQaPassed ? "yes" : "no"}
- Production QA failure count: ${report.productionReadiness.productionQaFailureCount ?? "unavailable"}
- Production QA artifact confirmation passed: ${report.productionReadiness.productionQaArtifactConfirmationPassed ? "yes" : "no"}

Local QA:
- Available: ${report.productionReadiness.localQaAvailable ? "yes" : "no"}
- Current head: ${report.productionReadiness.localQaCurrentHead ? "yes" : "no"}
- Passed: ${report.productionReadiness.localQaPassed ? "yes" : "no"}
- Artifact directory: ${report.productionReadiness.localQaArtifactDir}

${report.productionReadiness.localQaArtifacts
  .map((artifact) => {
    const failureCount = formatFailureCount(artifact.failureCount);
    return `- ${artifact.label}: ${artifact.passed ? "passed" : `failed${failureCount}`}; current head: ${artifact.currentHead ? "yes" : "no"}; base URL: ${artifact.baseUrl}`;
  })
  .join("\n") || "- unavailable"}

Production QA gates:
${report.productionReadiness.productionQaGates
  .map((gate) => {
    const error = gate.error ? ` - ${gate.error}` : "";
    return `- ${gate.label}: ${gate.passed ? "passed" : `failed with exit ${gate.status ?? "unavailable"}${error}`}`;
  })
  .join("\n") || "- unavailable"}

Artifact checks:
${report.productionReadiness.productionQaArtifactChecks
  .map((artifact) => {
    const failureCount = formatFailureCount(artifact.failureCount);
    const samples = artifact.failureSamples.length
      ? `\n  - Samples: ${artifact.failureSamples.join(" | ")}`
      : "";
    return `- ${artifact.label}: ${artifact.passed ? "passed" : `failed${failureCount}`}${samples}`;
  })
  .join("\n") || "- unavailable"}

Readiness blockers:
${report.productionReadiness.readinessBlockers
  .map((blocker) => `- ${blocker}`)
  .join("\n") || "- unavailable"}

Contact delivery:
- Artifact available: ${report.productionReadiness.contactDeliveryAvailable ? "yes" : "no"}
- Current head: ${report.productionReadiness.contactDeliveryCurrentHead ? "yes" : "no"}
- Base URL: ${report.productionReadiness.contactDeliveryBaseUrl}
- Mode: ${report.productionReadiness.contactDeliveryMode}
- Passed: ${report.productionReadiness.contactDeliveryPassed ? "yes" : "no"}
- Sent: ${report.productionReadiness.contactDeliverySent ? "yes" : "no"}
- Submission attempted: ${report.productionReadiness.contactDeliverySubmissionAttempted ? "yes" : "no"}
- Response received: ${report.productionReadiness.contactDeliveryResponseReceived ? "yes" : "no"}
- Delivery confirmed: ${report.productionReadiness.contactDeliveryConfirmed ? "yes" : "no"}
- Failures: ${report.productionReadiness.contactDeliveryFailures.join(" | ") || "none"}

## Blockers

${report.blockers.map((blocker) => `- ${blocker}`).join("\n") || "- none"}

## Owner Actions

1. Sign in to Vercel with access to \`${report.vercelOwnerScope}\`.
2. If the report shows \`upgradeToPro=build-rate-limit\`, wait for the build quota to reset, reduce duplicate project builds, or upgrade the owning Vercel team plan before redeploying.
3. Open the failed duplicate project from the commit status target URL when a deployment id is available. If using the CLI, run ${report.duplicateInspectCommands.length > 0 ? report.duplicateInspectCommands.map((item) => `\`${item.command}\``).join(", ") : `\`vercel inspect <deployment-id> --logs --scope ${report.vercelOwnerScope}\``} from an owner-scoped login.
4. Review unexpected Vercel contexts. Add intentional projects to the release policy, or disconnect/archive extra projects that keep failing commit status.
5. If \`rs-web-digital\` is not the intended production project, disconnect its GitHub integration or archive/delete that duplicate project.
6. Keep the intended \`romega-digitals\` project connected and passing.
7. Move \`romega-solutions.com\` and \`www.romega-solutions.com\` to the intended project.
8. Run \`$env:PRODUCTION_QA_BASE_URL="https://www.romega-solutions.com"; pnpm run qa:production\` after cutover. This clears stale per-gate production artifacts, runs every non-contact production responsive, accessibility, keyboard, product-flow, visual, and live deployment gate, writes \`reports/production-qa/\`, checks every expected gate artifact, records post-final, recorded-artifact, published-artifact, and artifact-confirmation readiness evidence, and leaves the readiness report displaying that confirmation even if one production gate fails.
9. Run the guarded real contact delivery audit only after production email-provider env is configured and sending is approved.
10. Re-run \`pnpm run report:readiness\` after the duplicate context is gone and all production-domain artifacts pass. The readiness report must also show the built-in production-domain probe passing for \`/\`, \`/terms\`, \`/contact\`, and \`/api/careers/jobs\`.
`;

mkdirSync(outputDir, { recursive: true });
writeFileSync(path.join(outputDir, "owner-unblock.json"), JSON.stringify(report, null, 2));
writeFileSync(path.join(outputDir, "owner-unblock.md"), markdown);

console.log(`Owner unblock report written to ${path.relative(process.cwd(), outputDir)}`);
console.log(`Owner scope available locally: ${report.missingOwnerScope ? "no" : "yes"}`);
if (report.blockers.length > 0) {
  console.log("Blockers:");
  for (const blocker of report.blockers) {
    console.log(`- ${blocker}`);
  }
}

if (!existsSync(path.join(process.cwd(), ".git"))) {
  console.log("Warning: command was not run from a git repository root.");
}
