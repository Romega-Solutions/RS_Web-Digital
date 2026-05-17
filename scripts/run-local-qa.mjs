import { createServer } from "node:net";
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";
import path from "node:path";

const isWindows = process.platform === "win32";
const pnpm = "pnpm";
const qaStepTimeoutMs = Number(process.env.LOCAL_QA_STEP_TIMEOUT_MS ?? "300000");
const liveAuditPort = Number(process.env.LOCAL_LIVE_AUDIT_PORT ?? "3008");
const liveAuditBaseUrl = `http://127.0.0.1:${liveAuditPort}`;
const localQaArtifactDir = path.join(process.cwd(), "reports", "local-qa", "latest");
const auditArtifactPaths = [
  path.join("reports", "responsive-audit", "responsive-audit-summary.json"),
  path.join("reports", "accessibility-audit", "accessibility-audit-summary.json"),
  path.join("reports", "keyboard-audit", "keyboard-audit-summary.json"),
  path.join("reports", "product-flow-audit", "product-flow-audit-summary.json"),
  path.join("reports", "visual-render-audit", "visual-render-audit-summary.json"),
  path.join("reports", "live-deployment-audit", "live-deployment-audit.json"),
];

const qaEnvFallback = {
  NEXT_PUBLIC_SITE_URL: "https://www.romega-solutions.com",
  RESEND_API_KEY: "local-qa-nonsecret-placeholder",
  ADMIN_EMAIL: "admin@example.com",
};

const requiredProductionEnv = Object.keys(qaEnvFallback);

function hasProductionEnvSource() {
  if (existsSync(process.env.PRODUCTION_ENV_FILE ?? ".env.vercel.local")) {
    return true;
  }

  return requiredProductionEnv.every((name) => Boolean(process.env[name]));
}

function runPnpm(label, args, options = {}) {
  console.log(`\n==> ${label}`);
  const command = getCommand(pnpm, args);
  return new Promise((resolve, reject) => {
    let timedOut = false;
    const child = spawn(command.command, command.args, {
      cwd: process.cwd(),
      env: { ...process.env, ...options.env },
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
      const wrappedError = new Error(`${label} failed to start: ${error.message}`);
      wrappedError.status = 1;
      reject(wrappedError);
    });

    child.on("close", (status) => {
      clearTimeout(timeout);
      if (timedOut) {
        const error = new Error(`${label} timed out after ${qaStepTimeoutMs}ms.`);
        error.status = 1;
        reject(error);
        return;
      }

      if (status !== 0) {
        const error = new Error(`${label} failed with exit ${status ?? 1}.`);
        error.status = status ?? 1;
        reject(error);
        return;
      }

      resolve();
    });
  });
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

function assertPortAvailable(port) {
  return new Promise((resolve, reject) => {
    const tester = createServer()
      .once("error", (error) => {
        if (error.code === "EADDRINUSE") {
          reject(
            new Error(
              `Port ${port} is already in use. Stop that process or set LOCAL_LIVE_AUDIT_PORT to a free port.`,
            ),
          );
          return;
        }

        reject(error);
      })
      .once("listening", () => {
        tester.close(resolve);
      })
      .listen(port, "127.0.0.1");
  });
}

async function waitForUrl(url, timeoutMs = 120_000) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url, { redirect: "manual" });
      if (response.status < 500) {
        return;
      }
    } catch {
      // The server is still starting.
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  throw new Error(`Timed out waiting for ${url}`);
}

function startProductionServer(port) {
  console.log(`\n==> Start local production server on ${liveAuditBaseUrl}`);
  const command = getCommand(pnpm, [
    "exec",
    "next",
    "start",
    "-H",
    "127.0.0.1",
    "-p",
    String(port),
  ]);
  return spawn(command.command, command.args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
    shell: false,
    windowsHide: true,
  });
}

function stopProcessTree(child) {
  if (!child?.pid || child.exitCode !== null) {
    return;
  }

  console.log("\n==> Stop local production server");
  if (isWindows) {
    spawnSync("taskkill", ["/PID", String(child.pid), "/T", "/F"], {
      stdio: "ignore",
    });
    return;
  }

  child.kill("SIGTERM");
}

function readArtifactBaseUrl(absolutePath) {
  try {
    const artifact = JSON.parse(readFileSync(absolutePath, "utf8"));
    return typeof artifact?.baseUrl === "string" ? artifact.baseUrl : "";
  } catch {
    return "";
  }
}

function isLocalArtifact(absolutePath) {
  const baseUrl = readArtifactBaseUrl(absolutePath);
  return /https?:\/\/(127\.0\.0\.1|localhost)(?::\d+)?/i.test(baseUrl);
}

function getExistingArtifactSnapshots({ productionOnly = false } = {}) {
  return auditArtifactPaths
    .map((relativePath) => {
      const absolutePath = path.join(process.cwd(), relativePath);
      return existsSync(absolutePath) ? { relativePath, absolutePath } : null;
    })
    .filter(Boolean)
    .filter((artifact) => !productionOnly || !isLocalArtifact(artifact.absolutePath));
}

function copyArtifactsToDirectory(artifacts, targetDir) {
  mkdirSync(targetDir, { recursive: true });

  for (const artifact of artifacts) {
    const targetPath = path.join(targetDir, artifact.relativePath);
    mkdirSync(path.dirname(targetPath), { recursive: true });
    copyFileSync(artifact.absolutePath, targetPath);
  }
}

function archiveLocalQaArtifacts() {
  const currentArtifacts = getExistingArtifactSnapshots();

  if (currentArtifacts.length === 0) {
    return;
  }

  rmSync(localQaArtifactDir, { recursive: true, force: true });
  copyArtifactsToDirectory(currentArtifacts, localQaArtifactDir);
  console.log(`\n==> Archived local QA audit artifacts to ${path.relative(process.cwd(), localQaArtifactDir)}`);
}

function restoreArtifactSnapshots(snapshots) {
  for (const relativePath of auditArtifactPaths) {
    rmSync(path.join(process.cwd(), relativePath), { force: true });
  }

  for (const snapshot of snapshots) {
    const sourcePath = path.join(localQaArtifactDir, "..", "pre-local-qa", snapshot.relativePath);
    mkdirSync(path.dirname(snapshot.absolutePath), { recursive: true });
    copyFileSync(sourcePath, snapshot.absolutePath);
  }

  console.log("\n==> Cleared local audit artifacts and restored pre-existing production artifacts before readiness reports");
}

const envForProductionCheck = hasProductionEnvSource() ? {} : qaEnvFallback;
const preLocalQaArtifacts = getExistingArtifactSnapshots({ productionOnly: true });
const preLocalQaBackupDir = path.join(localQaArtifactDir, "..", "pre-local-qa");

if (preLocalQaArtifacts.length > 0) {
  rmSync(preLocalQaBackupDir, { recursive: true, force: true });
  copyArtifactsToDirectory(preLocalQaArtifacts, preLocalQaBackupDir);
}

if (Object.keys(envForProductionCheck).length > 0) {
  console.log(
    "No .env.vercel.local or required production env vars found; using non-secret placeholder values for the local env-shape gate only.",
  );
}

let server;
let qaExitCode = 0;
try {
  await runPnpm("Lint and architecture validation", ["run", "lint"]);
  await runPnpm("TypeScript typecheck", ["run", "typecheck"]);
  await runPnpm("Production env shape check", ["run", "check:env:production"], {
    env: envForProductionCheck,
  });
  await runPnpm("Next.js production build", ["run", "build"]);
  await runPnpm("Responsive audit", ["run", "audit:responsive"]);
  await runPnpm("Accessibility audit", ["run", "audit:a11y"]);
  await runPnpm("Keyboard audit", ["run", "audit:keyboard"]);
  await runPnpm("Product-flow audit", ["run", "audit:product"]);
  await runPnpm("Visual render audit", ["run", "audit:visual"]);

  await assertPortAvailable(liveAuditPort);
  server = startProductionServer(liveAuditPort);
  await waitForUrl(liveAuditBaseUrl);
  await runPnpm("Local live deployment audit", ["run", "audit:live"], {
    env: { LIVE_AUDIT_BASE_URL: liveAuditBaseUrl },
  });
} catch (error) {
  qaExitCode = typeof error?.status === "number" ? error.status : 1;
  console.error(error instanceof Error ? error.message : String(error));
} finally {
  stopProcessTree(server);
  archiveLocalQaArtifacts();
  restoreArtifactSnapshots(preLocalQaArtifacts);
}

if (qaExitCode !== 0) {
  process.exit(qaExitCode);
}

await runPnpm("Release-readiness report", ["run", "report:readiness"]);
await runPnpm("Vercel owner-unblock report", ["run", "report:owner-unblock"]);

console.log(
  "\nLocal QA completed. Local audit artifacts were archived under reports/local-qa/latest, and production-readiness artifacts were preserved for the readiness reports.",
);
