import { existsSync, readFileSync } from "node:fs";

const envFile = process.env.PRODUCTION_ENV_FILE || ".env.vercel.local";

const requiredVariables = [
  {
    name: "NEXT_PUBLIC_SITE_URL",
    validate: (value) => /^https:\/\/[a-z0-9.-]+(?:\/)?$/i.test(value),
    message: "must be an https URL without paths beyond an optional trailing slash",
  },
  {
    name: "RESEND_API_KEY",
    validate: (value) => value.length >= 10 && !/^your-/i.test(value),
    message: "must be configured with a real provider key",
  },
  {
    name: "ADMIN_EMAIL",
    validate: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value),
    message: "must be a valid email address",
  },
];

const optionalVariables = [
  {
    name: "RECAPTCHA_SECRET_KEY",
    validate: (value) => value.length >= 10 && !/^your-/i.test(value),
    message: "should be a real secret when configured",
  },
  {
    name: "RECAPTCHA_TIMEOUT_MS",
    validate: (value) => Number.isInteger(Number(value)) && Number(value) > 0,
    message: "must be a positive integer when configured",
  },
  {
    name: "JOBS_API_URL",
    validate: (value) => /^https:\/\//i.test(value) && !/^your-/i.test(value),
    message: "must be an https URL when configured",
  },
];

const disallowedProductionValues = [
  {
    name: "EMAIL_CONTACT_FALLBACK_ENABLED",
    invalid: (value) => value.toLowerCase() === "true",
    message: "must not be true in production",
  },
];

function parseEnvFile(filePath) {
  if (!existsSync(filePath)) {
    return {};
  }

  const env = {};
  const content = readFileSync(filePath, "utf8");

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const match = trimmed.match(/^([A-Za-z_][A-Za-z0-9_]*)=(.*)$/);
    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    let value = rawValue.trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }

  return env;
}

function getEnvValue(fileEnv, name) {
  return fileEnv[name] ?? process.env[name] ?? "";
}

function redactedStatus(value) {
  return value ? "configured" : "missing";
}

const fileEnv = parseEnvFile(envFile);
const failures = [];
const warnings = [];
const results = [];

for (const variable of requiredVariables) {
  const value = getEnvValue(fileEnv, variable.name);
  const passed = Boolean(value) && variable.validate(value);
  if (!passed) {
    failures.push(`${variable.name} ${value ? variable.message : "is required"}`);
  }
  results.push({ name: variable.name, required: true, status: redactedStatus(value), passed });
}

for (const variable of optionalVariables) {
  const value = getEnvValue(fileEnv, variable.name);
  const passed = !value || variable.validate(value);
  if (!passed) {
    warnings.push(`${variable.name} ${variable.message}`);
  }
  results.push({ name: variable.name, required: false, status: redactedStatus(value), passed });
}

for (const variable of disallowedProductionValues) {
  const value = getEnvValue(fileEnv, variable.name);
  const passed = !value || !variable.invalid(value);
  if (!passed) {
    failures.push(`${variable.name} ${variable.message}`);
  }
  results.push({ name: variable.name, required: false, status: redactedStatus(value), passed });
}

const source = existsSync(envFile)
  ? envFile
  : "process environment only; set PRODUCTION_ENV_FILE after pulling Vercel env";

console.log(`Production env check source: ${source}`);
for (const result of results) {
  const label = result.required ? "required" : "optional";
  console.log(`- ${result.name} (${label}): ${result.status} ${result.passed ? "ok" : "check"}`);
}

if (warnings.length > 0) {
  console.warn("\nWarnings:");
  for (const warning of warnings) {
    console.warn(`- ${warning}`);
  }
}

if (failures.length > 0) {
  console.error("\nProduction env check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log("\nProduction env check passed.");
}
