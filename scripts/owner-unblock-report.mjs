import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const outputDir = path.join(process.cwd(), "reports", "owner-unblock");
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
      `& ${["npx", "vercel", ...args].map(quotePwsh).join(" ")}`,
    ]);
  }

  return runStrict("npx", ["vercel", ...args]);
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
    deploymentId: extractDeploymentId(status.target_url),
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

const githubStatus = parseJson(
  run("gh", ["api", `repos/${repo}/commits/${headSha}/status`]),
  null,
);
const statuses = summarizeStatuses(githubStatus);
const intended = statuses.filter((status) => intendedContexts.includes(status.context));
const duplicates = statuses.filter((status) => duplicateContexts.includes(status.context));
const buildRateLimitedContexts = statuses.filter((status) => status.buildRateLimited);
const vercelWhoamiResult = runVercel(["whoami"]);
const vercelTeamsResult = runVercel(["teams", "ls"]);
const vercelWhoami = vercelWhoamiResult.ok ? vercelWhoamiResult.output : "unavailable";
const vercelTeams = vercelTeamsResult.ok ? vercelTeamsResult.output : "unavailable";
const duplicateInspections = duplicates.map((status) => ({
  ...status,
  inspection: inspectDeployment(status.deploymentId),
}));
const missingOwnerScope =
  vercelWhoami !== vercelOwnerScope &&
  !new RegExp(`\\b${vercelOwnerScope.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(
    vercelTeams,
  );
const blockers = [];

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

if (buildRateLimitedContexts.length > 0) {
  blockers.push(
    `Vercel build rate limit is blocking deployment for: ${buildRateLimitedContexts
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
  duplicateInspections,
  buildRateLimitedContexts,
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
  .map(
    (status) =>
      `- ${status.context}: ${status.state} (${status.projectSlug || "unknown project"}) ${status.targetUrl || ""}`,
  )
  .join("\n") || "- none found"}

## Duplicate Vercel Contexts

${report.duplicateInspections
  .map((status) => {
    const access = status.inspection.accessible ? "inspectable locally" : "not inspectable locally";
    const rateLimit = status.buildRateLimited ? "\n  - Build rate limited: yes" : "";
    return `- ${status.context}: ${status.state} (${status.projectSlug || "unknown project"}) ${status.targetUrl || ""}${rateLimit}\n  - Deployment id: \`${status.deploymentId || "unavailable"}\`\n  - Local inspection: ${access}`;
  })
  .join("\n") || "- none found"}

## Vercel Build Rate Limit

${report.buildRateLimitedContexts
  .map((status) => `- ${status.context}: ${status.targetUrl || "no target URL"}`)
  .join("\n") || "- none detected"}

## Blockers

${report.blockers.map((blocker) => `- ${blocker}`).join("\n") || "- none"}

## Owner Actions

1. Sign in to Vercel with access to \`${report.vercelOwnerScope}\`.
2. If the report shows \`upgradeToPro=build-rate-limit\`, wait for the build quota to reset, reduce duplicate project builds, or upgrade the owning Vercel team plan before redeploying.
3. Open the failed duplicate project from the commit status target URL when a deployment id is available.
4. If \`rs-web-digital\` is not the intended production project, disconnect its GitHub integration or archive/delete that duplicate project.
5. Keep the intended \`romega-digitals\` project connected and passing.
6. Move \`romega-solutions.com\` and \`www.romega-solutions.com\` to the intended project.
7. Re-run \`pnpm run report:readiness\` after the duplicate context is gone and production checks pass.
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
