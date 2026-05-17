import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const outputDir = path.join(process.cwd(), "reports", "release-readiness");
const liveAuditReportPath = path.join(
  process.cwd(),
  "reports",
  "live-deployment-audit",
  "live-deployment-audit.json",
);
const contactDeliveryAuditReportPath = path.join(
  process.cwd(),
  "reports",
  "contact-delivery-audit",
  "contact-delivery-audit.json",
);
const branchName = run("git", ["branch", "--show-current"]) || "unknown";
const headSha = run("git", ["rev-parse", "HEAD"]) || "unknown";
const shortSha = headSha.slice(0, 7);
const statusShort = run("git", ["status", "--short"]) || "";
const remoteTracking = run("git", ["status", "--short", "--branch"]) || "";

function run(command, args, options = {}) {
  try {
    return execFileSync(command, args, {
      cwd: process.cwd(),
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
      ...options,
    }).trim();
  } catch {
    return "";
  }
}

function parseJson(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
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

function parseOptionalCsvEnv(name, fallback) {
  const value = process.env[name];
  if (!value) {
    return fallback;
  }

  if (/^(none|off|false)$/i.test(value.trim())) {
    return [];
  }

  return parseCsvEnv(name, fallback);
}

function isTruthyEnv(name) {
  return /^(1|true|yes)$/i.test(process.env[name] || "");
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

function getGithubStatus() {
  const raw = run("gh", ["api", `repos/Romega-Solutions/RS_Web-Digital/commits/${headSha}/status`]);
  return parseJson(raw, null);
}

function getGithubDeployments() {
  const raw = run("gh", [
    "api",
    "repos/Romega-Solutions/RS_Web-Digital/deployments",
    "--paginate",
  ]);
  const deployments = parseJson(raw, []);

  return deployments
    .filter((deployment) => deployment.sha === headSha)
    .map((deployment) => {
      const statusRaw = run("gh", [
        "api",
        `repos/Romega-Solutions/RS_Web-Digital/deployments/${deployment.id}/statuses`,
      ]);
      const latestStatus = parseJson(statusRaw, [])[0] || null;

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

function getLatestWorkflowRun() {
  const raw = run("gh", [
    "run",
    "list",
    "--branch",
    branchName,
    "--limit",
    "1",
    "--json",
    "databaseId,headSha,status,conclusion,workflowName,url,createdAt,updatedAt",
  ]);
  return parseJson(raw, [])[0] || null;
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
  }));
}

function isVercelBuildRateLimited(targetUrl = "") {
  try {
    const url = new URL(targetUrl);
    return url.searchParams.get("upgradeToPro") === "build-rate-limit";
  } catch {
    return /upgradeToPro=build-rate-limit/i.test(targetUrl);
  }
}

function getCiSummary(workflowRun) {
  if (!workflowRun) {
    return {
      available: false,
      passed: false,
      note: "GitHub Actions run data unavailable from this environment.",
    };
  }

  return {
    available: true,
    passed:
      workflowRun.headSha === headSha &&
      workflowRun.status === "completed" &&
      workflowRun.conclusion === "success",
    runId: workflowRun.databaseId,
    workflowName: workflowRun.workflowName,
    status: workflowRun.status,
    conclusion: workflowRun.conclusion,
    url: workflowRun.url,
    headSha: workflowRun.headSha,
  };
}

function getVercelSummary(statuses) {
  const intendedContexts = parseCsvEnv("READINESS_INTENDED_VERCEL_CONTEXTS", [
    "Vercel – romega-digitals",
  ]);
  const blockingDuplicateContexts = parseOptionalCsvEnv(
    "READINESS_BLOCKING_DUPLICATE_VERCEL_CONTEXTS",
    ["Vercel – rs-web-digital"],
  );
  const intended = statuses.filter((status) => intendedContexts.includes(status.context));
  const duplicateContexts = statuses.filter((status) =>
    blockingDuplicateContexts.includes(status.context),
  );
  const rateLimitedContexts = statuses.filter((status) => status.buildRateLimited);

  return {
    intendedContexts,
    blockingDuplicateContexts,
    rateLimitedContexts,
    intendedPassed:
      intended.length === intendedContexts.length &&
      intended.every((status) => status.state === "success"),
    intended,
    duplicateContexts,
    duplicateBlocksAggregate: duplicateContexts.some((status) => status.state === "failure"),
  };
}

const githubStatus = getGithubStatus();
const deployments = getGithubDeployments();
const statusSummaries = summarizeStatuses(githubStatus);
const latestRun = getLatestWorkflowRun();
const ci = getCiSummary(latestRun);
const vercel = getVercelSummary(statusSummaries);
const expectedBranch = process.env.READINESS_EXPECTED_BRANCH || "redesign/ui-audit-fixes";
const expectedProductionBaseUrl = (
  process.env.READINESS_PRODUCTION_BASE_URL || "https://www.romega-solutions.com"
).replace(/\/+$/, "");
const liveAudit = readJsonFile(liveAuditReportPath);
const contactDeliveryAudit = readJsonFile(contactDeliveryAuditReportPath);
const liveAuditCurrentHead = liveAudit?.headSha === headSha;
const contactDeliveryAuditCurrentHead = contactDeliveryAudit?.headSha === headSha;
const productionLiveAuditPassed =
  liveAuditCurrentHead &&
  liveAudit?.passed === true &&
  typeof liveAudit.baseUrl === "string" &&
  liveAudit.baseUrl.replace(/\/+$/, "") === expectedProductionBaseUrl;
const contactDeliveryAuditPassed =
  contactDeliveryAuditCurrentHead &&
  contactDeliveryAudit?.passed === true &&
  typeof contactDeliveryAudit.baseUrl === "string" &&
  contactDeliveryAudit.baseUrl.replace(/\/+$/, "") === expectedProductionBaseUrl;
const manualEvidence = {
  productionDomainCutoverVerified:
    isTruthyEnv("READINESS_PRODUCTION_DOMAIN_VERIFIED") && productionLiveAuditPassed,
  productionDomainFlagSet: isTruthyEnv("READINESS_PRODUCTION_DOMAIN_VERIFIED"),
  protectedDeploymentAuditPassed: isTruthyEnv("READINESS_PROTECTED_DEPLOYMENT_AUDIT_PASSED"),
  contactDeliveryVerified:
    isTruthyEnv("READINESS_CONTACT_DELIVERY_VERIFIED") && contactDeliveryAuditPassed,
  contactDeliveryFlagSet: isTruthyEnv("READINESS_CONTACT_DELIVERY_VERIFIED"),
};
const blockers = [];

if (expectedBranch && branchName !== expectedBranch) {
  blockers.push(`Current branch is ${branchName}, expected ${expectedBranch}.`);
}

if (statusShort) {
  blockers.push("Working tree has uncommitted changes.");
}

if (!ci.passed) {
  blockers.push("Latest GitHub Actions CI run for this head commit is not passing or unavailable.");
}

if (!vercel.intendedPassed) {
  blockers.push("Intended Vercel contexts are not all successful or are unavailable.");
}

if (vercel.rateLimitedContexts.length > 0) {
  blockers.push(
    `Vercel build rate limit is blocking deployment for: ${vercel.rateLimitedContexts
      .map((status) => status.context)
      .join(", ")}.`,
  );
}

if (vercel.duplicateBlocksAggregate) {
  blockers.push(
    `Blocking duplicate Vercel context is failing and keeps aggregate commit status failed: ${vercel.duplicateContexts
      .filter((status) => status.state === "failure")
      .map((status) => status.context)
      .join(", ")}.`,
  );
}

if (!manualEvidence.productionDomainFlagSet) {
  blockers.push("Production domain and alias freshness require owner-scope Vercel cutover verification.");
} else if (!productionLiveAuditPassed) {
  blockers.push(
    `Production domain verification flag is set, but the latest current-head live audit artifact does not pass for ${expectedProductionBaseUrl}.`,
  );
}

if (!manualEvidence.protectedDeploymentAuditPassed) {
  blockers.push("Protected immutable deployment audit requires owner-scope Vercel automation bypass secret.");
}

if (!manualEvidence.contactDeliveryFlagSet) {
  blockers.push("Real contact-form delivery requires production email-provider env verification and browser test.");
} else if (!contactDeliveryAuditPassed) {
  blockers.push(
    `Contact delivery verification flag is set, but the latest current-head contact delivery audit artifact does not pass for ${expectedProductionBaseUrl}.`,
  );
}

const report = {
  generatedAt: new Date().toISOString(),
  branch: branchName,
  expectedBranch,
  headSha,
  shortSha,
  remoteTracking,
  cleanWorkingTree: !statusShort,
  ci,
  commitStatusState: githubStatus?.state || "unavailable",
  statuses: statusSummaries,
  deployments,
  vercel,
  expectedProductionBaseUrl,
  liveAudit: liveAudit
    ? {
        available: true,
        currentHead: liveAuditCurrentHead,
        headSha: liveAudit.headSha || "unavailable",
        baseUrl: liveAudit.baseUrl,
        passed: liveAudit.passed === true,
        vercelProtectionBypassConfigured: liveAudit.vercelProtectionBypassConfigured === true,
        finishedAt: liveAudit.finishedAt,
        failureCount: Array.isArray(liveAudit.failures) ? liveAudit.failures.length : null,
      }
    : {
        available: false,
      },
  contactDeliveryAudit: contactDeliveryAudit
    ? {
        available: true,
        currentHead: contactDeliveryAuditCurrentHead,
        headSha: contactDeliveryAudit.headSha || "unavailable",
        baseUrl: contactDeliveryAudit.baseUrl,
        passed: contactDeliveryAudit.passed === true,
        sent: contactDeliveryAudit.sent === true,
        finishedAt: contactDeliveryAudit.finishedAt,
        status: contactDeliveryAudit.status,
        failureCount: Array.isArray(contactDeliveryAudit.failures)
          ? contactDeliveryAudit.failures.length
          : null,
      }
    : {
        available: false,
      },
  manualEvidence,
  submissionReady: blockers.length === 0,
  blockers,
};

const markdown = `# Release Readiness Report

Generated: ${report.generatedAt}
Branch: \`${report.branch}\`
Head: \`${report.headSha}\`

## Summary

- Clean working tree: ${report.cleanWorkingTree ? "yes" : "no"}
- Latest CI for this head: ${report.ci.passed ? "passed" : "not passed or unavailable"}
- Commit status state: \`${report.commitStatusState}\`
- Intended Vercel contexts: ${report.vercel.intendedPassed ? "passed" : "not fully passed"}
- Vercel build rate limited: ${report.vercel.rateLimitedContexts.length > 0 ? "yes" : "no"}
- Submission ready: ${report.submissionReady ? "yes" : "no"}

## Manual Evidence Flags

- \`READINESS_INTENDED_VERCEL_CONTEXTS\`: ${report.vercel.intendedContexts.join(", ")}
- \`READINESS_BLOCKING_DUPLICATE_VERCEL_CONTEXTS\`: ${report.vercel.blockingDuplicateContexts.join(", ") || "none"}
- \`READINESS_EXPECTED_BRANCH\`: ${report.expectedBranch || "none"}
- \`READINESS_PRODUCTION_BASE_URL\`: ${report.expectedProductionBaseUrl}
- \`READINESS_PRODUCTION_DOMAIN_VERIFIED\`: ${report.manualEvidence.productionDomainFlagSet ? "yes" : "no"}
- \`READINESS_PROTECTED_DEPLOYMENT_AUDIT_PASSED\`: ${report.manualEvidence.protectedDeploymentAuditPassed ? "yes" : "no"}
- \`READINESS_CONTACT_DELIVERY_VERIFIED\`: ${report.manualEvidence.contactDeliveryFlagSet ? "yes" : "no"}

## Live Audit Evidence

- Available: ${report.liveAudit.available ? "yes" : "no"}
- Current head: ${report.liveAudit.currentHead ? "yes" : "no"}
- Head: ${report.liveAudit.headSha || "unavailable"}
- Base URL: ${report.liveAudit.baseUrl || "unavailable"}
- Passed: ${report.liveAudit.passed ? "yes" : "no"}
- Finished: ${report.liveAudit.finishedAt || "unavailable"}
- Failure count: ${report.liveAudit.failureCount ?? "unavailable"}
- Vercel bypass configured: ${report.liveAudit.vercelProtectionBypassConfigured ? "yes" : "no"}

## Contact Delivery Evidence

- Available: ${report.contactDeliveryAudit.available ? "yes" : "no"}
- Current head: ${report.contactDeliveryAudit.currentHead ? "yes" : "no"}
- Head: ${report.contactDeliveryAudit.headSha || "unavailable"}
- Base URL: ${report.contactDeliveryAudit.baseUrl || "unavailable"}
- Passed: ${report.contactDeliveryAudit.passed ? "yes" : "no"}
- Sent: ${report.contactDeliveryAudit.sent ? "yes" : "no"}
- Finished: ${report.contactDeliveryAudit.finishedAt || "unavailable"}
- HTTP status: ${report.contactDeliveryAudit.status ?? "unavailable"}
- Failure count: ${report.contactDeliveryAudit.failureCount ?? "unavailable"}

## Status Contexts

${report.statuses
  .map((status) => {
    const rateLimit = status.buildRateLimited ? " [build-rate-limit]" : "";
    const target = status.targetUrl ? ` (${status.targetUrl})` : "";
    return `- ${status.context}: ${status.state}${rateLimit} - ${status.description || "no description"}${target}`;
  })
  .join("\n") || "- unavailable"}

## GitHub Deployment URLs

${report.deployments
  .map((deployment) => {
    const envUrl = deployment.environmentUrl ? `\n  - Environment URL: ${deployment.environmentUrl}` : "";
    const targetUrl = deployment.targetUrl ? `\n  - Target URL: ${deployment.targetUrl}` : "";
    return `- ${deployment.environment}: ${deployment.state} - ${deployment.description || "no description"}${envUrl}${targetUrl}`;
  })
  .join("\n") || "- unavailable"}

## Blockers

${report.blockers.map((blocker) => `- ${blocker}`).join("\n") || "- none"}
`;

mkdirSync(outputDir, { recursive: true });
writeFileSync(path.join(outputDir, "release-readiness.json"), JSON.stringify(report, null, 2));
writeFileSync(path.join(outputDir, "release-readiness.md"), markdown);

console.log(`Release readiness report written to ${path.relative(process.cwd(), outputDir)}`);
console.log(`Submission ready: ${report.submissionReady ? "yes" : "no"}`);
if (report.blockers.length > 0) {
  console.log("Blockers:");
  for (const blocker of report.blockers) {
    console.log(`- ${blocker}`);
  }
}
