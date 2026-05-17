import { createServer } from "node:net";
import { existsSync } from "node:fs";
import { spawn, spawnSync } from "node:child_process";

const isWindows = process.platform === "win32";
const pnpm = "pnpm";
const liveAuditPort = Number(process.env.LOCAL_LIVE_AUDIT_PORT ?? "3008");
const liveAuditBaseUrl = `http://127.0.0.1:${liveAuditPort}`;

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
  const result = spawnSync(command.command, command.args, {
    cwd: process.cwd(),
    env: { ...process.env, ...options.env },
    stdio: "inherit",
    shell: false,
  });

  if (result.error) {
    console.error(`${label} failed to start: ${result.error.message}`);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
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

const envForProductionCheck = hasProductionEnvSource() ? {} : qaEnvFallback;

if (Object.keys(envForProductionCheck).length > 0) {
  console.log(
    "No .env.vercel.local or required production env vars found; using non-secret placeholder values for the local env-shape gate only.",
  );
}

runPnpm("Lint and architecture validation", ["run", "lint"]);
runPnpm("TypeScript typecheck", ["run", "typecheck"]);
runPnpm("Production env shape check", ["run", "check:env:production"], {
  env: envForProductionCheck,
});
runPnpm("Next.js production build", ["run", "build"]);
runPnpm("Responsive audit", ["run", "audit:responsive"]);
runPnpm("Accessibility audit", ["run", "audit:a11y"]);
runPnpm("Keyboard audit", ["run", "audit:keyboard"]);
runPnpm("Product-flow audit", ["run", "audit:product"]);
runPnpm("Visual render audit", ["run", "audit:visual"]);

let server;
try {
  await assertPortAvailable(liveAuditPort);
  server = startProductionServer(liveAuditPort);
  await waitForUrl(liveAuditBaseUrl);
  runPnpm("Local live deployment audit", ["run", "audit:live"], {
    env: { LIVE_AUDIT_BASE_URL: liveAuditBaseUrl },
  });
} finally {
  stopProcessTree(server);
}

runPnpm("Release-readiness report", ["run", "report:readiness"]);
runPnpm("Vercel owner-unblock report", ["run", "report:owner-unblock"]);

console.log("\nLocal QA completed. Review the generated readiness reports for external production blockers.");
