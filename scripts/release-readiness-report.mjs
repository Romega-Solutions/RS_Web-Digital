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
const responsiveAuditSummaryPath = path.join(
  process.cwd(),
  "reports",
  "responsive-audit",
  "responsive-audit-summary.json",
);
const accessibilityAuditSummaryPath = path.join(
  process.cwd(),
  "reports",
  "accessibility-audit",
  "accessibility-audit-summary.json",
);
const keyboardAuditSummaryPath = path.join(
  process.cwd(),
  "reports",
  "keyboard-audit",
  "keyboard-audit-summary.json",
);
const productFlowAuditSummaryPath = path.join(
  process.cwd(),
  "reports",
  "product-flow-audit",
  "product-flow-audit-summary.json",
);
const visualRenderAuditSummaryPath = path.join(
  process.cwd(),
  "reports",
  "visual-render-audit",
  "visual-render-audit-summary.json",
);
const productionQaReportPath = path.join(
  process.cwd(),
  "reports",
  "production-qa",
  "production-qa.json",
);
const localQaArtifactDir = path.join(process.cwd(), "reports", "local-qa", "latest");
const localQaArtifactPaths = [
  {
    key: "responsive",
    label: "Responsive audit",
    path: path.join(localQaArtifactDir, "reports", "responsive-audit", "responsive-audit-summary.json"),
  },
  {
    key: "accessibility",
    label: "Accessibility audit",
    path: path.join(localQaArtifactDir, "reports", "accessibility-audit", "accessibility-audit-summary.json"),
  },
  {
    key: "keyboard",
    label: "Keyboard audit",
    path: path.join(localQaArtifactDir, "reports", "keyboard-audit", "keyboard-audit-summary.json"),
  },
  {
    key: "productFlow",
    label: "Product-flow audit",
    path: path.join(localQaArtifactDir, "reports", "product-flow-audit", "product-flow-audit-summary.json"),
  },
  {
    key: "visualRender",
    label: "Visual render audit",
    path: path.join(localQaArtifactDir, "reports", "visual-render-audit", "visual-render-audit-summary.json"),
  },
  {
    key: "live",
    label: "Local live deployment audit",
    path: path.join(localQaArtifactDir, "reports", "live-deployment-audit", "live-deployment-audit.json"),
  },
];
const vercelOwnerScope = process.env.READINESS_VERCEL_OWNER_SCOPE || "kpg782s-projects";
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

function normalizeWhitespace(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function extractTitle(html) {
  const match = String(html || "").match(/<title[^>]*>([\s\S]*?)<\/title>/i);
  return match ? normalizeWhitespace(match[1]) : "";
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

function summarizeAuditArtifact(artifact, artifactPath) {
  if (!artifact) {
    return {
      available: false,
      currentHead: false,
      path: path.relative(process.cwd(), artifactPath),
    };
  }

  return {
    available: true,
    currentHead: artifact.headSha === headSha,
    path: path.relative(process.cwd(), artifactPath),
    headSha: artifact.headSha || "unavailable",
    baseUrl: artifact.baseUrl || "unavailable",
    passed: artifact.passed === true,
    finishedAt: artifact.finishedAt || "unavailable",
    failureCount:
      typeof artifact.failureCount === "number"
        ? artifact.failureCount
        : Array.isArray(artifact.failures)
          ? artifact.failures.length
          : null,
  };
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
    "20",
    "--json",
    "databaseId,headSha,status,conclusion,workflowName,url,createdAt,updatedAt",
  ]);
  const runs = parseJson(raw, []);
  const currentHeadRuns = runs.filter((run) => run.headSha === headSha);

  return {
    selected: currentHeadRuns[0] || null,
    latest: runs[0] || null,
    currentHeadRunCount: currentHeadRuns.length,
    scannedRunCount: runs.length,
  };
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

async function fetchTextWithTimeout(url, timeoutMs = 15000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      redirect: "follow",
      signal: controller.signal,
      headers: {
        "user-agent": "rs-web-digital-readiness-probe/1.0",
      },
    });
    const body = await response.text();

    return {
      ok: true,
      status: response.status,
      contentType: response.headers.get("content-type") || "",
      body,
    };
  } catch (error) {
    return {
      ok: false,
      status: null,
      contentType: "",
      body: "",
      error: error instanceof Error ? error.message : String(error),
    };
  } finally {
    clearTimeout(timeout);
  }
}

function joinUrl(baseUrl, routePath) {
  return `${baseUrl.replace(/\/+$/, "")}${routePath}`;
}

async function probeProductionRoute(baseUrl, route) {
  const url = joinUrl(baseUrl, route.path);
  const response = await fetchTextWithTimeout(url);
  const title = route.kind === "html" ? extractTitle(response.body) : "";
  const failures = [];
  let jsonShape = "not_checked";

  if (!response.ok) {
    failures.push(response.error || "Request failed.");
  }

  if (response.status !== route.expectedStatus) {
    failures.push(`Expected HTTP ${route.expectedStatus}, received ${response.status || "unavailable"}.`);
  }

  if (route.kind === "html") {
    if (!title) {
      failures.push("HTML title is missing.");
    } else if (!route.titlePattern.test(title)) {
      failures.push(`Expected title to match ${route.titlePattern}, received "${title}".`);
    }

    if (route.bodyPattern && !route.bodyPattern.test(response.body)) {
      failures.push(`Expected body to match ${route.bodyPattern}.`);
    }
  }

  if (route.kind === "json") {
    try {
      const parsed = JSON.parse(response.body);
      const jobs = Array.isArray(parsed?.jobs) ? parsed.jobs : null;
      jsonShape = jobs ? `jobs:${jobs.length}` : "missing_jobs_array";
      if (!jobs) {
        failures.push("JSON response is missing a jobs array.");
      }
    } catch (error) {
      jsonShape = "invalid_json";
      failures.push(error instanceof Error ? error.message : String(error));
    }
  }

  return {
    path: route.path,
    url,
    status: response.status,
    contentType: response.contentType,
    title,
    jsonShape,
    passed: failures.length === 0,
    failures,
  };
}

async function getProductionDomainProbe(baseUrl) {
  const routes = [
    {
      path: "/",
      kind: "html",
      expectedStatus: 200,
      titlePattern: /Talent, Brand, and Operations Support/i,
      bodyPattern: /Built for growing businesses|Talent, Brand, and Operations Support/i,
    },
    {
      path: "/terms",
      kind: "html",
      expectedStatus: 200,
      titlePattern: /Terms and Conditions/i,
    },
    {
      path: "/contact",
      kind: "html",
      expectedStatus: 200,
      titlePattern: /Contact Romega Solutions/i,
    },
    {
      path: "/api/careers/jobs",
      kind: "json",
      expectedStatus: 200,
    },
  ];
  const checkedAt = new Date().toISOString();
  const results = [];

  for (const route of routes) {
    results.push(await probeProductionRoute(baseUrl, route));
  }

  return {
    baseUrl,
    checkedAt,
    routes: results,
    passed: results.every((route) => route.passed),
    failures: results.flatMap((route) =>
      route.failures.map((failure) => `${route.path}: ${failure}`),
    ),
  };
}

function getCiSummary(workflowRunResult) {
  const workflowRun = workflowRunResult?.selected || null;

  if (!workflowRun) {
    return {
      available: false,
      passed: false,
      note: workflowRunResult?.latest
        ? `No GitHub Actions run for current head was found in the ${workflowRunResult.scannedRunCount} most recent branch runs.`
        : "GitHub Actions run data unavailable from this environment.",
      latestScannedRun: workflowRunResult?.latest
        ? {
            runId: workflowRunResult.latest.databaseId,
            workflowName: workflowRunResult.latest.workflowName,
            status: workflowRunResult.latest.status,
            conclusion: workflowRunResult.latest.conclusion,
            url: workflowRunResult.latest.url,
            headSha: workflowRunResult.latest.headSha,
          }
        : null,
      currentHeadRunCount: workflowRunResult?.currentHeadRunCount || 0,
      scannedRunCount: workflowRunResult?.scannedRunCount || 0,
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
    currentHeadRunCount: workflowRunResult.currentHeadRunCount,
    scannedRunCount: workflowRunResult.scannedRunCount,
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
  const unexpectedContexts = statuses.filter(
    (status) =>
      /^Vercel\b/.test(status.context) &&
      !intendedContexts.includes(status.context) &&
      !blockingDuplicateContexts.includes(status.context),
  );
  const unexpectedFailingContexts = unexpectedContexts.filter((status) => status.state === "failure");
  const rateLimitedContexts = statuses.filter((status) => status.buildRateLimited);

  return {
    intendedContexts,
    blockingDuplicateContexts,
    rateLimitedContexts,
    unexpectedContexts,
    unexpectedFailingContexts,
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
const workflowRuns = getLatestWorkflowRun();
const ci = getCiSummary(workflowRuns);
const vercel = getVercelSummary(statusSummaries);
const expectedBranch = process.env.READINESS_EXPECTED_BRANCH || "redesign/ui-audit-fixes";
const expectedProductionBaseUrl = (
  process.env.READINESS_PRODUCTION_BASE_URL || "https://www.romega-solutions.com"
).replace(/\/+$/, "");
const productionDomainProbe = await getProductionDomainProbe(expectedProductionBaseUrl);
const liveAudit = readJsonFile(liveAuditReportPath);
const contactDeliveryAudit = readJsonFile(contactDeliveryAuditReportPath);
const responsiveAudit = readJsonFile(responsiveAuditSummaryPath);
const accessibilityAudit = readJsonFile(accessibilityAuditSummaryPath);
const keyboardAudit = readJsonFile(keyboardAuditSummaryPath);
const productFlowAudit = readJsonFile(productFlowAuditSummaryPath);
const visualRenderAudit = readJsonFile(visualRenderAuditSummaryPath);
const productionQa = readJsonFile(productionQaReportPath);
const localQaArtifacts = localQaArtifactPaths.map((artifact) => ({
  key: artifact.key,
  label: artifact.label,
  ...summarizeAuditArtifact(readJsonFile(artifact.path), artifact.path),
}));
const localQaAvailable = localQaArtifacts.some((artifact) => artifact.available);
const localQaCurrentHead = localQaArtifacts.every(
  (artifact) => !artifact.available || artifact.currentHead,
);
const localQaPassed =
  localQaArtifacts.length > 0 &&
  localQaArtifacts.every((artifact) => artifact.available && artifact.currentHead && artifact.passed);
const liveAuditCurrentHead = liveAudit?.headSha === headSha;
const contactDeliveryAuditCurrentHead = contactDeliveryAudit?.headSha === headSha;
const responsiveAuditCurrentHead = responsiveAudit?.headSha === headSha;
const accessibilityAuditCurrentHead = accessibilityAudit?.headSha === headSha;
const keyboardAuditCurrentHead = keyboardAudit?.headSha === headSha;
const productFlowAuditCurrentHead = productFlowAudit?.headSha === headSha;
const visualRenderAuditCurrentHead = visualRenderAudit?.headSha === headSha;
const productionQaCurrentHead = productionQa?.headSha === headSha;
const productionQaMatchesExpectedBaseUrl =
  typeof productionQa?.baseUrl === "string" &&
  productionQa.baseUrl.replace(/\/+$/, "") === expectedProductionBaseUrl;
const expectedProductionQaArtifactLabels = new Set([
  "Responsive audit summary",
  "Accessibility audit summary",
  "Keyboard audit summary",
  "Product-flow audit summary",
  "Visual render audit summary",
  "Live deployment audit report",
]);
const productionQaArtifactChecks = Array.isArray(productionQa?.artifactChecks)
  ? productionQa.artifactChecks
  : [];
const productionQaArtifactChecksPassed =
  productionQaArtifactChecks.length === expectedProductionQaArtifactLabels.size &&
  productionQaArtifactChecks.every(
    (artifact) =>
      expectedProductionQaArtifactLabels.has(artifact.label) &&
      artifact.passed === true &&
      artifact.headSha === headSha &&
      typeof artifact.baseUrl === "string" &&
      artifact.baseUrl.replace(/\/+$/, "") === expectedProductionBaseUrl,
  );
const productionQaFinalSyncPassed = productionQa?.readinessFinalSyncResult?.passed === true;
const productionQaPostFinalArtifactSyncPassed =
  productionQa?.readinessPostFinalArtifactResult?.passed === true;
const productionQaRecordedArtifactSyncPassed =
  productionQa?.readinessRecordedArtifactResult?.passed === true;
const productionQaPublishedArtifactSyncPassed =
  productionQa?.readinessPublishedArtifactResult?.passed === true;
const productionQaArtifactConfirmationPassed =
  productionQa?.readinessArtifactConfirmationResult?.passed === true;
const productionQaPassed =
  productionQaCurrentHead &&
  productionQaMatchesExpectedBaseUrl &&
  productionQaArtifactChecksPassed &&
  productionQaFinalSyncPassed &&
  productionQaPostFinalArtifactSyncPassed &&
  productionQaRecordedArtifactSyncPassed &&
  productionQaPublishedArtifactSyncPassed &&
  productionQa?.passed === true;
const productionLiveAuditPassed =
  liveAuditCurrentHead &&
  liveAudit?.passed === true &&
  typeof liveAudit.baseUrl === "string" &&
  liveAudit.baseUrl.replace(/\/+$/, "") === expectedProductionBaseUrl;
const productionResponsiveAuditPassed =
  responsiveAuditCurrentHead &&
  responsiveAudit?.passed === true &&
  typeof responsiveAudit.baseUrl === "string" &&
  responsiveAudit.baseUrl.replace(/\/+$/, "") === expectedProductionBaseUrl;
const productionAccessibilityAuditPassed =
  accessibilityAuditCurrentHead &&
  accessibilityAudit?.passed === true &&
  typeof accessibilityAudit.baseUrl === "string" &&
  accessibilityAudit.baseUrl.replace(/\/+$/, "") === expectedProductionBaseUrl;
const contactDeliveryAuditPassed =
  contactDeliveryAuditCurrentHead &&
  contactDeliveryAudit?.passed === true &&
  contactDeliveryAudit?.mode === "browser" &&
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
const nextActions = [];

function addNextAction(owner, action, evidence) {
  nextActions.push({ owner, action, evidence });
}

function getAuditArtifactFailureSummary(label, artifact) {
  const reasons = [];

  if (!artifact) {
    return `${label} artifact is missing.`;
  }

  if (artifact.headSha !== headSha) {
    reasons.push(`stale head ${artifact.headSha || "unavailable"}`);
  }

  if (
    typeof artifact.baseUrl !== "string" ||
    artifact.baseUrl.replace(/\/+$/, "") !== expectedProductionBaseUrl
  ) {
    reasons.push(`base URL ${artifact.baseUrl || "unavailable"}`);
  }

  if (artifact.passed !== true) {
    const count =
      typeof artifact.failureCount === "number"
        ? ` with ${artifact.failureCount} failure${artifact.failureCount === 1 ? "" : "s"}`
        : "";
    reasons.push(`failing${count}`);
  }

  return `${label} artifact is ${reasons.join(", ")}.`;
}

function getProductionQaFailureSummary() {
  if (!productionQa) {
    return "Production QA bundle artifact is missing.";
  }

  const reasons = [];

  if (!productionQaCurrentHead) {
    reasons.push(`stale head ${productionQa.headSha || "unavailable"}`);
  }

  if (!productionQaMatchesExpectedBaseUrl) {
    reasons.push(`base URL ${productionQa.baseUrl || "unavailable"}`);
  }

  if (productionQa.passed !== true) {
    const count =
      typeof productionQa.failureCount === "number"
        ? ` with ${productionQa.failureCount} failure${productionQa.failureCount === 1 ? "" : "s"}`
        : "";
    reasons.push(`failing${count}`);
  }

  if (!productionQaArtifactChecksPassed) {
    const failedArtifacts = productionQaArtifactChecks
      .filter((artifact) => artifact.passed !== true)
      .map((artifact) => artifact.label)
      .filter(Boolean);
    reasons.push(
      failedArtifacts.length > 0
        ? `failed artifact checks: ${failedArtifacts.join(", ")}`
        : "missing or incomplete artifact checks",
    );
  }

  if (!productionQaFinalSyncPassed) {
    reasons.push("final readiness sync did not pass");
  }

  if (!productionQaPostFinalArtifactSyncPassed) {
    reasons.push("post-final readiness sync did not pass");
  }

  if (!productionQaRecordedArtifactSyncPassed) {
    reasons.push("recorded-artifact readiness sync did not pass");
  }

  if (!productionQaPublishedArtifactSyncPassed) {
    reasons.push("published-artifact readiness sync did not pass");
  }

  return `Production QA bundle artifact is ${reasons.join(", ")}.`;
}

if (expectedBranch && branchName !== expectedBranch) {
  blockers.push(`Current branch is ${branchName}, expected ${expectedBranch}.`);
  addNextAction(
    "repo",
    `Switch to ${expectedBranch} or set READINESS_EXPECTED_BRANCH to the verified release branch.`,
    `Current branch is ${branchName}.`,
  );
}

if (statusShort) {
  blockers.push("Working tree has uncommitted changes.");
  addNextAction(
    "repo",
    "Review the uncommitted diff, then create an authorized checkpoint commit before treating readiness as final.",
    "git status --short is not empty.",
  );
}

if (!ci.passed) {
  blockers.push("Latest GitHub Actions CI run for this head commit is not passing or unavailable.");
  addNextAction(
    "repo",
    "Rerun or fix GitHub Actions for the current head until the latest CI run completes successfully.",
    ci.available
      ? `Latest run ${ci.runId || "unavailable"} is ${ci.status || "unknown"}/${ci.conclusion || "unknown"}.`
      : "GitHub Actions run data is unavailable.",
  );
}

if (!vercel.intendedPassed) {
  blockers.push("Intended Vercel contexts are not all successful or are unavailable.");
  addNextAction(
    "vercel-owner",
    `Redeploy or repair the intended Vercel context(s): ${vercel.intendedContexts.join(", ")}.`,
    "At least one intended Vercel context is missing or not successful.",
  );
}

if (vercel.rateLimitedContexts.length > 0) {
  blockers.push(
    `Vercel build rate limit is blocking deployment for: ${vercel.rateLimitedContexts
      .map((status) => status.context)
      .join(", ")}.`,
  );
  addNextAction(
    "vercel-owner",
    "Wait for Vercel build quota reset, reduce duplicate builds, or upgrade the owning Vercel team plan, then redeploy the latest branch head.",
    `Rate-limited context(s): ${vercel.rateLimitedContexts
      .map((status) => status.context)
      .join(", ")}.`,
  );
}

if (vercel.duplicateBlocksAggregate) {
  const failedDuplicateContexts = vercel.duplicateContexts.filter((status) => status.state === "failure");
  const duplicateEvidence = failedDuplicateContexts
    .map((status) => {
      const parts = [status.context];
      if (status.projectSlug) {
        parts.push(`project ${status.projectSlug}`);
      }
      if (status.deploymentId) {
        parts.push(`deployment ${status.deploymentId}`);
      }
      if (status.deploymentSlug && status.deploymentSlug !== status.deploymentId) {
        parts.push(`URL slug ${status.deploymentSlug}`);
      }

      return parts.join(", ");
    })
    .join(" | ");
  const duplicateInspectionCommands = failedDuplicateContexts
    .filter((status) => Boolean(status.deploymentId))
    .map((status) => `vercel inspect ${status.deploymentId} --logs --scope ${vercelOwnerScope}`);
  const duplicateAction =
    duplicateInspectionCommands.length > 0
      ? `Inspect the failed duplicate deployment logs from owner scope with ${duplicateInspectionCommands
          .map((command) => `\`${command}\``)
          .join(" and ")}, then disconnect, archive, or explicitly mark non-blocking the duplicate Vercel project context before final release.`
      : "Inspect the failed duplicate deployment logs from owner scope, then disconnect, archive, or explicitly mark non-blocking the duplicate Vercel project context before final release.";
  blockers.push(
    `Blocking duplicate Vercel context is failing and keeps aggregate commit status failed: ${failedDuplicateContexts
      .map((status) => status.context)
      .join(", ")}.`,
  );
  addNextAction(
    "vercel-owner",
    duplicateAction,
    duplicateEvidence || "Failing duplicate Vercel context is present.",
  );
}

if (vercel.unexpectedFailingContexts.length > 0) {
  blockers.push(
    `Unexpected Vercel context is failing and may keep aggregate commit status failed: ${vercel.unexpectedFailingContexts
      .map((status) => status.context)
      .join(", ")}.`,
  );
  addNextAction(
    "vercel-owner",
    "Either add the unexpected Vercel context to the intended/non-blocking release policy or disconnect/archive the extra project before final release.",
    `Unexpected failing context(s): ${vercel.unexpectedFailingContexts
      .map((status) => status.context)
      .join(", ")}.`,
  );
}

if (!productionDomainProbe.passed) {
  blockers.push(
    `Production domain probe does not serve the latest app routes for ${expectedProductionBaseUrl}.`,
  );
  addNextAction(
    "vercel-owner",
    `Move or refresh ${expectedProductionBaseUrl} on the intended Vercel project, then rerun pnpm run report:readiness and pnpm run qa:production.`,
    productionDomainProbe.failures.join(" | ") || "Production domain probe failed.",
  );
}

if (!manualEvidence.productionDomainFlagSet) {
  blockers.push("Production domain and alias freshness require owner-scope Vercel cutover verification.");
  addNextAction(
    "vercel-owner",
    `Move or refresh ${expectedProductionBaseUrl} on the intended Vercel project, then run $env:PRODUCTION_QA_BASE_URL="${expectedProductionBaseUrl}"; pnpm run qa:production.`,
    "READINESS_PRODUCTION_DOMAIN_VERIFIED is not set.",
  );
} else if (!productionLiveAuditPassed) {
  blockers.push(
    `Production domain verification flag is set, but the latest current-head live audit artifact does not pass for ${expectedProductionBaseUrl}.`,
  );
  addNextAction(
    "vercel-owner",
    `Rerun the live deployment audit against ${expectedProductionBaseUrl} and set READINESS_PRODUCTION_DOMAIN_VERIFIED only after it passes.`,
    "Production domain verification flag is set without a matching passing live audit artifact.",
  );
}

if (!productionResponsiveAuditPassed) {
  const evidence = getAuditArtifactFailureSummary("Production responsive audit", responsiveAudit);
  blockers.push(evidence);
  addNextAction(
    "vercel-owner",
    `Run $env:RESPONSIVE_AUDIT_BASE_URL="${expectedProductionBaseUrl}"; pnpm run audit:responsive or the production QA bundle after the latest deployment is live.`,
    evidence,
  );
}

if (!productionAccessibilityAuditPassed) {
  const evidence = getAuditArtifactFailureSummary("Production accessibility audit", accessibilityAudit);
  blockers.push(evidence);
  addNextAction(
    "vercel-owner",
    `Run $env:ACCESSIBILITY_AUDIT_BASE_URL="${expectedProductionBaseUrl}"; pnpm run audit:a11y or the production QA bundle after the latest deployment is live.`,
    evidence,
  );
}

if (!productionQaPassed) {
  const evidence = getProductionQaFailureSummary();
  blockers.push(evidence);
  addNextAction(
    "vercel-owner",
    `Run $env:PRODUCTION_QA_BASE_URL="${expectedProductionBaseUrl}"; pnpm run qa:production after Vercel serves the latest branch head on the production domain.`,
    evidence,
  );
}

if (!manualEvidence.protectedDeploymentAuditPassed) {
  blockers.push("Protected immutable deployment audit requires owner-scope Vercel automation bypass secret.");
  addNextAction(
    "vercel-owner",
    "Run the protected deployment audit from the owning Vercel scope with LIVE_AUDIT_VERCEL_BYPASS_SECRET or VERCEL_AUTOMATION_BYPASS_SECRET configured.",
    "READINESS_PROTECTED_DEPLOYMENT_AUDIT_PASSED is not set.",
  );
}

if (!manualEvidence.contactDeliveryFlagSet) {
  blockers.push("Real contact-form delivery requires production email-provider env verification and browser test.");
  addNextAction(
    "vercel-owner",
    "Confirm production email-provider env, approve a real send, run CONTACT_AUDIT_CONFIRM_SEND=true pnpm run audit:contact:delivery, then set READINESS_CONTACT_DELIVERY_VERIFIED.",
    "READINESS_CONTACT_DELIVERY_VERIFIED is not set.",
  );
} else if (!contactDeliveryAuditPassed) {
  blockers.push(
    `Contact delivery verification flag is set, but the latest current-head contact delivery audit artifact does not pass for ${expectedProductionBaseUrl}.`,
  );
  addNextAction(
    "vercel-owner",
    `Rerun the guarded contact delivery audit against ${expectedProductionBaseUrl} and set READINESS_CONTACT_DELIVERY_VERIFIED only after it passes.`,
    "Contact delivery flag is set without a matching passing contact delivery artifact.",
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
  productionDomainProbe,
  localQa: {
    available: localQaAvailable,
    currentHead: localQaCurrentHead,
    passed: localQaPassed,
    artifactDir: path.relative(process.cwd(), localQaArtifactDir),
    artifacts: localQaArtifacts,
  },
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
  responsiveAudit: responsiveAudit
    ? {
        available: true,
        currentHead: responsiveAuditCurrentHead,
        headSha: responsiveAudit.headSha || "unavailable",
        baseUrl: responsiveAudit.baseUrl,
        passed: responsiveAudit.passed === true,
        finishedAt: responsiveAudit.finishedAt,
        failureCount: typeof responsiveAudit.failureCount === "number" ? responsiveAudit.failureCount : null,
      }
    : {
        available: false,
      },
  accessibilityAudit: accessibilityAudit
    ? {
        available: true,
        currentHead: accessibilityAuditCurrentHead,
        headSha: accessibilityAudit.headSha || "unavailable",
        baseUrl: accessibilityAudit.baseUrl,
        passed: accessibilityAudit.passed === true,
        finishedAt: accessibilityAudit.finishedAt,
        failureCount:
          typeof accessibilityAudit.failureCount === "number" ? accessibilityAudit.failureCount : null,
      }
    : {
        available: false,
      },
  keyboardAudit: keyboardAudit
    ? {
        available: true,
        currentHead: keyboardAuditCurrentHead,
        headSha: keyboardAudit.headSha || "unavailable",
        baseUrl: keyboardAudit.baseUrl,
        passed: keyboardAudit.passed === true,
        finishedAt: keyboardAudit.finishedAt,
        failureCount:
          typeof keyboardAudit.failureCount === "number" ? keyboardAudit.failureCount : null,
      }
    : {
        available: false,
      },
  productFlowAudit: productFlowAudit
    ? {
        available: true,
        currentHead: productFlowAuditCurrentHead,
        headSha: productFlowAudit.headSha || "unavailable",
        baseUrl: productFlowAudit.baseUrl,
        passed: productFlowAudit.passed === true,
        finishedAt: productFlowAudit.finishedAt,
        failureCount:
          typeof productFlowAudit.failureCount === "number"
            ? productFlowAudit.failureCount
            : null,
      }
    : {
        available: false,
      },
  visualRenderAudit: visualRenderAudit
    ? {
        available: true,
        currentHead: visualRenderAuditCurrentHead,
        headSha: visualRenderAudit.headSha || "unavailable",
        baseUrl: visualRenderAudit.baseUrl,
        passed: visualRenderAudit.passed === true,
        finishedAt: visualRenderAudit.finishedAt,
        failureCount:
          typeof visualRenderAudit.failureCount === "number"
            ? visualRenderAudit.failureCount
            : null,
        screenshotCount:
          typeof visualRenderAudit.screenshotCount === "number"
            ? visualRenderAudit.screenshotCount
            : null,
      }
    : {
        available: false,
      },
  productionQa: productionQa
    ? {
        available: true,
        currentHead: productionQaCurrentHead,
        matchesExpectedProductionBaseUrl: productionQaMatchesExpectedBaseUrl,
        artifactChecksPassed: productionQaArtifactChecksPassed,
        finalSyncPassed: productionQaFinalSyncPassed,
        postFinalArtifactSyncPassed: productionQaPostFinalArtifactSyncPassed,
        recordedArtifactSyncPassed: productionQaRecordedArtifactSyncPassed,
        publishedArtifactSyncPassed: productionQaPublishedArtifactSyncPassed,
        artifactConfirmationPassed: productionQaArtifactConfirmationPassed,
        headSha: productionQa.headSha || "unavailable",
        baseUrl: productionQa.baseUrl,
        passed: productionQa.passed === true,
        finishedAt: productionQa.finishedAt,
        failureCount: typeof productionQa.failureCount === "number" ? productionQa.failureCount : null,
        contactDeliveryIncluded: productionQa.contactDeliveryIncluded === true,
        gates: Array.isArray(productionQa.gateResults)
          ? productionQa.gateResults.map((result) => ({
              label: result.label,
              passed: result.passed === true,
              status: typeof result.status === "number" ? result.status : null,
              error: result.error || null,
            }))
          : [],
        artifactChecks: Array.isArray(productionQa.artifactChecks)
          ? productionQa.artifactChecks.map((result) => ({
              label: result.label,
              path: result.path,
              passed: result.passed === true,
              baseUrl: result.baseUrl,
              headSha: result.headSha,
              failureCount:
                typeof result.failureCount === "number" ? result.failureCount : null,
              failures: Array.isArray(result.failures) ? result.failures : [],
              failureSamples: Array.isArray(result.failureSamples)
                ? result.failureSamples.slice(0, 3)
                : [],
            }))
          : [],
        readinessInitialResult: productionQa.readinessInitialResult
          ? {
              label: productionQa.readinessInitialResult.label,
              passed: productionQa.readinessInitialResult.passed === true,
              status:
                typeof productionQa.readinessInitialResult.status === "number"
                  ? productionQa.readinessInitialResult.status
                  : null,
            }
          : null,
        readinessRefreshResult: productionQa.readinessRefreshResult
          ? {
              label: productionQa.readinessRefreshResult.label,
              passed: productionQa.readinessRefreshResult.passed === true,
              status:
                typeof productionQa.readinessRefreshResult.status === "number"
                  ? productionQa.readinessRefreshResult.status
                  : null,
            }
          : null,
        readinessFinalSyncResult: productionQa.readinessFinalSyncResult
          ? {
              label: productionQa.readinessFinalSyncResult.label,
              passed: productionQa.readinessFinalSyncResult.passed === true,
              status:
                typeof productionQa.readinessFinalSyncResult.status === "number"
                  ? productionQa.readinessFinalSyncResult.status
                  : null,
            }
          : null,
        readinessPostFinalArtifactResult: productionQa.readinessPostFinalArtifactResult
          ? {
              label: productionQa.readinessPostFinalArtifactResult.label,
              passed: productionQa.readinessPostFinalArtifactResult.passed === true,
              status:
                typeof productionQa.readinessPostFinalArtifactResult.status === "number"
                  ? productionQa.readinessPostFinalArtifactResult.status
                  : null,
            }
          : null,
        readinessRecordedArtifactResult: productionQa.readinessRecordedArtifactResult
          ? {
              label: productionQa.readinessRecordedArtifactResult.label,
              passed: productionQa.readinessRecordedArtifactResult.passed === true,
              status:
                typeof productionQa.readinessRecordedArtifactResult.status === "number"
                  ? productionQa.readinessRecordedArtifactResult.status
                  : null,
            }
          : null,
        readinessPublishedArtifactResult: productionQa.readinessPublishedArtifactResult
          ? {
              label: productionQa.readinessPublishedArtifactResult.label,
              passed: productionQa.readinessPublishedArtifactResult.passed === true,
              status:
                typeof productionQa.readinessPublishedArtifactResult.status === "number"
                  ? productionQa.readinessPublishedArtifactResult.status
                  : null,
            }
          : null,
        readinessArtifactConfirmationResult: productionQa.readinessArtifactConfirmationResult
          ? {
              label: productionQa.readinessArtifactConfirmationResult.label,
              passed: productionQa.readinessArtifactConfirmationResult.passed === true,
              status:
                typeof productionQa.readinessArtifactConfirmationResult.status === "number"
                  ? productionQa.readinessArtifactConfirmationResult.status
                  : null,
            }
          : null,
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
        mode: contactDeliveryAudit.mode || "unavailable",
        sent: contactDeliveryAudit.sent === true,
        submissionAttempted: contactDeliveryAudit.submissionAttempted === true,
        responseReceived: contactDeliveryAudit.responseReceived === true,
        deliveryConfirmed: contactDeliveryAudit.deliveryConfirmed === true,
        finishedAt: contactDeliveryAudit.finishedAt,
        status: contactDeliveryAudit.status,
        failureCount: Array.isArray(contactDeliveryAudit.failures)
          ? contactDeliveryAudit.failures.length
          : null,
        failures: Array.isArray(contactDeliveryAudit.failures)
          ? contactDeliveryAudit.failures
          : [],
      }
    : {
        available: false,
      },
  manualEvidence,
  nextActions,
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
- Current-head CI runs found: ${report.ci.currentHeadRunCount ?? 0} of ${report.ci.scannedRunCount ?? 0} scanned branch runs
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

## Production Domain Probe

- Base URL: ${report.productionDomainProbe.baseUrl}
- Checked: ${report.productionDomainProbe.checkedAt}
- Passed: ${report.productionDomainProbe.passed ? "yes" : "no"}

${report.productionDomainProbe.routes
  .map((route) => {
    const title = route.title ? `, title "${route.title}"` : "";
    const jsonShape = route.jsonShape && route.jsonShape !== "not_checked" ? `, ${route.jsonShape}` : "";
    const failures = route.failures.length ? ` - ${route.failures.join("; ")}` : "";
    return `- ${route.path}: ${route.passed ? "passed" : "failed"} (${route.status ?? "unavailable"}${title}${jsonShape})${failures}`;
  })
  .join("\n")}

## Unexpected Vercel Contexts

${report.vercel.unexpectedContexts
  .map((status) => {
    const rateLimit = status.buildRateLimited ? " [build-rate-limit]" : "";
    const target = status.targetUrl ? ` (${status.targetUrl})` : "";
    return `- ${status.context}: ${status.state}${rateLimit} - ${status.description || "no description"}${target}`;
  })
  .join("\n") || "- none"}

## Local QA Evidence

- Available: ${report.localQa.available ? "yes" : "no"}
- Current head: ${report.localQa.currentHead ? "yes" : "no"}
- Passed: ${report.localQa.passed ? "yes" : "no"}
- Artifact directory: ${report.localQa.artifactDir}

${report.localQa.artifacts
  .map(
    (artifact) =>
      `- ${artifact.label}: ${artifact.available ? (artifact.passed ? "passed" : "failed") : "missing"}; current head: ${artifact.currentHead ? "yes" : "no"}; base URL: ${artifact.baseUrl || "unavailable"}; failures: ${artifact.failureCount ?? "unavailable"}; path: ${artifact.path}`,
  )
  .join("\n")}

Note: local QA evidence proves the current branch gates on localhost. It does not replace production-domain QA, owner-scope Vercel cutover verification, or real contact-delivery evidence.

## Live Audit Evidence

- Available: ${report.liveAudit.available ? "yes" : "no"}
- Current head: ${report.liveAudit.currentHead ? "yes" : "no"}
- Head: ${report.liveAudit.headSha || "unavailable"}
- Base URL: ${report.liveAudit.baseUrl || "unavailable"}
- Passed: ${report.liveAudit.passed ? "yes" : "no"}
- Finished: ${report.liveAudit.finishedAt || "unavailable"}
- Failure count: ${report.liveAudit.failureCount ?? "unavailable"}
- Vercel bypass configured: ${report.liveAudit.vercelProtectionBypassConfigured ? "yes" : "no"}

## Responsive Audit Evidence

- Available: ${report.responsiveAudit.available ? "yes" : "no"}
- Current head: ${report.responsiveAudit.currentHead ? "yes" : "no"}
- Head: ${report.responsiveAudit.headSha || "unavailable"}
- Base URL: ${report.responsiveAudit.baseUrl || "unavailable"}
- Passed: ${report.responsiveAudit.passed ? "yes" : "no"}
- Finished: ${report.responsiveAudit.finishedAt || "unavailable"}
- Failure count: ${report.responsiveAudit.failureCount ?? "unavailable"}

## Accessibility Audit Evidence

- Available: ${report.accessibilityAudit.available ? "yes" : "no"}
- Current head: ${report.accessibilityAudit.currentHead ? "yes" : "no"}
- Head: ${report.accessibilityAudit.headSha || "unavailable"}
- Base URL: ${report.accessibilityAudit.baseUrl || "unavailable"}
- Passed: ${report.accessibilityAudit.passed ? "yes" : "no"}
- Finished: ${report.accessibilityAudit.finishedAt || "unavailable"}
- Failure count: ${report.accessibilityAudit.failureCount ?? "unavailable"}

## Keyboard Audit Evidence

- Available: ${report.keyboardAudit.available ? "yes" : "no"}
- Current head: ${report.keyboardAudit.currentHead ? "yes" : "no"}
- Head: ${report.keyboardAudit.headSha || "unavailable"}
- Base URL: ${report.keyboardAudit.baseUrl || "unavailable"}
- Passed: ${report.keyboardAudit.passed ? "yes" : "no"}
- Finished: ${report.keyboardAudit.finishedAt || "unavailable"}
- Failure count: ${report.keyboardAudit.failureCount ?? "unavailable"}

## Product Flow Audit Evidence

- Available: ${report.productFlowAudit.available ? "yes" : "no"}
- Current head: ${report.productFlowAudit.currentHead ? "yes" : "no"}
- Head: ${report.productFlowAudit.headSha || "unavailable"}
- Base URL: ${report.productFlowAudit.baseUrl || "unavailable"}
- Passed: ${report.productFlowAudit.passed ? "yes" : "no"}
- Finished: ${report.productFlowAudit.finishedAt || "unavailable"}
- Failure count: ${report.productFlowAudit.failureCount ?? "unavailable"}

## Visual Render Audit Evidence

- Available: ${report.visualRenderAudit.available ? "yes" : "no"}
- Current head: ${report.visualRenderAudit.currentHead ? "yes" : "no"}
- Head: ${report.visualRenderAudit.headSha || "unavailable"}
- Base URL: ${report.visualRenderAudit.baseUrl || "unavailable"}
- Passed: ${report.visualRenderAudit.passed ? "yes" : "no"}
- Finished: ${report.visualRenderAudit.finishedAt || "unavailable"}
- Failure count: ${report.visualRenderAudit.failureCount ?? "unavailable"}
- Screenshot count: ${report.visualRenderAudit.screenshotCount ?? "unavailable"}

## Production QA Evidence

- Available: ${report.productionQa.available ? "yes" : "no"}
- Current head: ${report.productionQa.currentHead ? "yes" : "no"}
- Matches expected production URL: ${report.productionQa.matchesExpectedProductionBaseUrl ? "yes" : "no"}
- Artifact checks passed: ${report.productionQa.artifactChecksPassed ? "yes" : "no"}
- Final readiness sync passed: ${report.productionQa.finalSyncPassed ? "yes" : "no"}
- Post-final readiness sync passed: ${report.productionQa.postFinalArtifactSyncPassed ? "yes" : "no"}
- Recorded-artifact readiness sync passed: ${report.productionQa.recordedArtifactSyncPassed ? "yes" : "no"}
- Published-artifact readiness sync passed: ${report.productionQa.publishedArtifactSyncPassed ? "yes" : "no"}
- Artifact confirmation passed: ${report.productionQa.artifactConfirmationPassed ? "yes" : "no"}
- Head: ${report.productionQa.headSha || "unavailable"}
- Base URL: ${report.productionQa.baseUrl || "unavailable"}
- Passed: ${report.productionQa.passed ? "yes" : "no"}
- Finished: ${report.productionQa.finishedAt || "unavailable"}
- Failure count: ${report.productionQa.failureCount ?? "unavailable"}
- Contact delivery included: ${report.productionQa.contactDeliveryIncluded ? "yes" : "no"}

${report.productionQa.gates?.length ? report.productionQa.gates.map((gate) => {
  const error = gate.error ? ` - ${gate.error}` : "";
  return `- ${gate.label}: ${gate.passed ? "passed" : `failed with exit ${gate.status ?? "unavailable"}${error}`}`;
}).join("\n") : "- Gate results unavailable"}
${report.productionQa.readinessInitialResult ? `- ${report.productionQa.readinessInitialResult.label}: ${report.productionQa.readinessInitialResult.passed ? "passed" : `failed with exit ${report.productionQa.readinessInitialResult.status ?? "unavailable"}`}` : "- Initial readiness result unavailable"}
${report.productionQa.readinessRefreshResult ? `- ${report.productionQa.readinessRefreshResult.label}: ${report.productionQa.readinessRefreshResult.passed ? "passed" : `failed with exit ${report.productionQa.readinessRefreshResult.status ?? "unavailable"}`}` : "- Readiness refresh result unavailable"}
${report.productionQa.readinessFinalSyncResult ? `- ${report.productionQa.readinessFinalSyncResult.label}: ${report.productionQa.readinessFinalSyncResult.passed ? "passed" : `failed with exit ${report.productionQa.readinessFinalSyncResult.status ?? "unavailable"}`}` : "- Readiness final sync result unavailable"}
${report.productionQa.readinessPostFinalArtifactResult ? `- ${report.productionQa.readinessPostFinalArtifactResult.label}: ${report.productionQa.readinessPostFinalArtifactResult.passed ? "passed" : `failed with exit ${report.productionQa.readinessPostFinalArtifactResult.status ?? "unavailable"}`}` : "- Readiness post-final artifact sync result unavailable"}
${report.productionQa.readinessRecordedArtifactResult ? `- ${report.productionQa.readinessRecordedArtifactResult.label}: ${report.productionQa.readinessRecordedArtifactResult.passed ? "passed" : `failed with exit ${report.productionQa.readinessRecordedArtifactResult.status ?? "unavailable"}`}` : "- Readiness recorded-artifact sync result unavailable"}
${report.productionQa.readinessPublishedArtifactResult ? `- ${report.productionQa.readinessPublishedArtifactResult.label}: ${report.productionQa.readinessPublishedArtifactResult.passed ? "passed" : `failed with exit ${report.productionQa.readinessPublishedArtifactResult.status ?? "unavailable"}`}` : "- Readiness published-artifact sync result unavailable"}
${report.productionQa.readinessArtifactConfirmationResult ? `- ${report.productionQa.readinessArtifactConfirmationResult.label}: ${report.productionQa.readinessArtifactConfirmationResult.passed ? "passed" : `failed with exit ${report.productionQa.readinessArtifactConfirmationResult.status ?? "unavailable"}`}` : "- Readiness artifact confirmation result unavailable"}

Artifact checks:
${report.productionQa.artifactChecks?.length ? report.productionQa.artifactChecks.map((artifact) => {
  const samples = artifact.failureSamples.length
    ? `\n  - Samples: ${artifact.failureSamples.join(" | ")}`
    : "";
  return `- ${artifact.label}: ${artifact.passed ? "passed" : artifact.failures.join("; ")} (${artifact.path || "unavailable"})${samples}`;
}).join("\n") : "- Artifact checks unavailable"}

## Contact Delivery Evidence

- Available: ${report.contactDeliveryAudit.available ? "yes" : "no"}
- Current head: ${report.contactDeliveryAudit.currentHead ? "yes" : "no"}
- Head: ${report.contactDeliveryAudit.headSha || "unavailable"}
- Base URL: ${report.contactDeliveryAudit.baseUrl || "unavailable"}
- Passed: ${report.contactDeliveryAudit.passed ? "yes" : "no"}
- Mode: ${report.contactDeliveryAudit.mode || "unavailable"}
- Sent: ${report.contactDeliveryAudit.sent ? "yes" : "no"}
- Submission attempted: ${report.contactDeliveryAudit.submissionAttempted ? "yes" : "no"}
- Response received: ${report.contactDeliveryAudit.responseReceived ? "yes" : "no"}
- Delivery confirmed: ${report.contactDeliveryAudit.deliveryConfirmed ? "yes" : "no"}
- Finished: ${report.contactDeliveryAudit.finishedAt || "unavailable"}
- HTTP status: ${report.contactDeliveryAudit.status ?? "unavailable"}
- Failure count: ${report.contactDeliveryAudit.failureCount ?? "unavailable"}
- Failures: ${report.contactDeliveryAudit.failures?.join(" | ") || "none"}

## Status Contexts

${report.statuses
  .map((status) => {
    const rateLimit = status.buildRateLimited ? " [build-rate-limit]" : "";
    const target = status.targetUrl ? ` (${status.targetUrl})` : "";
    const deploymentId = status.deploymentId ? `\n  - Deployment id: \`${status.deploymentId}\`` : "";
    const deploymentSlug =
      status.deploymentSlug && status.deploymentSlug !== status.deploymentId
        ? `\n  - Deployment URL slug: \`${status.deploymentSlug}\``
        : "";
    const projectSlug = status.projectSlug ? `\n  - Vercel project: \`${status.projectSlug}\`` : "";
    return `- ${status.context}: ${status.state}${rateLimit} - ${status.description || "no description"}${target}${projectSlug}${deploymentId}${deploymentSlug}`;
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

## Next Actions

${report.nextActions
  .map((item) => `- ${item.owner}: ${item.action}\n  - Evidence: ${item.evidence}`)
  .join("\n") || "- none"}
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
