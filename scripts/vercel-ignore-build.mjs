import { execFileSync } from "node:child_process";

const docsOnlyPatterns = [
  /^README\.md$/i,
  /^docs\//i,
  /^\.github\/pull_request_template\.md$/i,
];

function getChangedFiles() {
  const override = process.env.VERCEL_IGNORE_CHANGED_FILES;

  if (override) {
    return override
      .split(/\r?\n|,/)
      .map((file) => file.trim())
      .filter(Boolean);
  }

  try {
    return execFileSync("git", ["diff", "--name-only", "HEAD^", "HEAD"], {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    })
      .split(/\r?\n/)
      .map((file) => file.trim())
      .filter(Boolean);
  } catch (error) {
    console.error("Unable to inspect changed files for Vercel ignore step.");
    if (error.stderr) {
      console.error(String(error.stderr).trim());
    }
    process.exit(1);
  }
}

const changedFiles = getChangedFiles();
const docsOnly =
  changedFiles.length > 0 &&
  changedFiles.every((file) =>
    docsOnlyPatterns.some((pattern) => pattern.test(file.replaceAll("\\", "/"))),
  );

if (docsOnly) {
  console.log("Skipping Vercel build because only documentation files changed:");
  for (const file of changedFiles) {
    console.log(`- ${file}`);
  }
  process.exit(0);
}

console.log("Running Vercel build because app, config, workflow, or script files changed.");
if (changedFiles.length > 0) {
  for (const file of changedFiles) {
    console.log(`- ${file}`);
  }
}
process.exit(1);
