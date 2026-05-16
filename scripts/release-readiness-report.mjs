import { mkdirSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import path from "node:path";

const outputDir = path.join(process.cwd(), "reports", "release-readiness");
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

function getGithubStatus() {
  const raw = run("gh", ["api", `repos/Romega-Solutions/RS_Web-Digital/commits/${headSha}/status`]);
  return parseJson(raw, null);
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
  }));
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
  const intendedContexts = ["Vercel – romega-digitals", "Vercel – romega-digital"];
  const duplicateContext = "Vercel – rs-web-digital";
  const intended = statuses.filter((status) => intendedContexts.includes(status.context));
  const duplicate = statuses.find((status) => status.context === duplicateContext);

  return {
    intendedPassed:
      intended.length > 0 && intended.every((status) => status.state === "success"),
    intended,
    duplicateContext: duplicate || null,
    duplicateBlocksAggregate: duplicate?.state === "failure",
  };
}

const githubStatus = getGithubStatus();
const statusSummaries = summarizeStatuses(githubStatus);
const latestRun = getLatestWorkflowRun();
const ci = getCiSummary(latestRun);
const vercel = getVercelSummary(statusSummaries);
const blockers = [];

if (branchName !== "redesign/ui-audit-fixes") {
  blockers.push(`Current branch is ${branchName}, expected redesign/ui-audit-fixes.`);
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

if (vercel.duplicateBlocksAggregate) {
  blockers.push("Duplicate Vercel context rs-web-digital is failing and keeps aggregate commit status failed.");
}

blockers.push("Production domain and alias freshness require owner-scope Vercel cutover verification.");
blockers.push("Protected immutable deployment audit requires owner-scope Vercel automation bypass secret.");
blockers.push("Real contact-form delivery requires production email-provider env verification and browser test.");

const report = {
  generatedAt: new Date().toISOString(),
  branch: branchName,
  headSha,
  shortSha,
  remoteTracking,
  cleanWorkingTree: !statusShort,
  ci,
  commitStatusState: githubStatus?.state || "unavailable",
  statuses: statusSummaries,
  vercel,
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
- Submission ready: ${report.submissionReady ? "yes" : "no"}

## Status Contexts

${report.statuses
  .map((status) => `- ${status.context}: ${status.state} - ${status.description || "no description"}`)
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
