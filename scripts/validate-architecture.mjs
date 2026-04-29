import fs from "node:fs";
import path from "node:path";
import process from "node:process";

const repoRoot = process.cwd();
const srcRoot = path.join(repoRoot, "src");
const componentsRoot = path.join(srcRoot, "components");
const globalsCssPath = path.join(srcRoot, "app", "globals.css");

const errors = [];

function walk(dir, predicate = () => true) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walk(fullPath, predicate));
      continue;
    }

    if (predicate(fullPath)) {
      files.push(fullPath);
    }
  }

  return files;
}

function toPosix(relativePath) {
  return relativePath.split(path.sep).join("/");
}

function getComponentLayer(filePath) {
  const relativePath = toPosix(path.relative(componentsRoot, filePath));

  if (relativePath.startsWith("atoms/")) {
    return "atoms";
  }

  if (relativePath.startsWith("molecules/")) {
    return "molecules";
  }

  if (relativePath.startsWith("organisms/")) {
    return "organisms";
  }

  if (relativePath.startsWith("templates/")) {
    return "templates";
  }

  return null;
}

function resolveImportTarget(importerPath, importSource) {
  if (importSource.startsWith("@/")) {
    return path.join(srcRoot, importSource.slice(2));
  }

  if (importSource.startsWith(".")) {
    return path.resolve(path.dirname(importerPath), importSource);
  }

  return null;
}

const moduleCssFiles = walk(componentsRoot, (filePath) => filePath.endsWith(".module.css"));
for (const filePath of moduleCssFiles) {
  const content = fs.readFileSync(filePath, "utf8");
  if (!/@reference\s+["'][^"']*globals\.css["'];/.test(content)) {
    errors.push(`Missing @reference to globals.css: ${toPosix(path.relative(repoRoot, filePath))}`);
  }
}

const codeFiles = walk(componentsRoot, (filePath) =>
  [".ts", ".tsx"].includes(path.extname(filePath)),
);

const importRegex = /from\s+["']([^"']+)["']/g;

for (const filePath of codeFiles) {
  const content = fs.readFileSync(filePath, "utf8");
  const layer = getComponentLayer(filePath);
  const relativeFilePath = toPosix(path.relative(repoRoot, filePath));

  for (const match of content.matchAll(importRegex)) {
    const importSource = match[1];
    const resolvedTarget = resolveImportTarget(filePath, importSource);
    const resolvedRelative = resolvedTarget
      ? toPosix(path.relative(componentsRoot, resolvedTarget))
      : "";

    if (
      layer === "atoms" &&
      (resolvedRelative.startsWith("molecules/") ||
        resolvedRelative.startsWith("organisms/") ||
        resolvedRelative.startsWith("templates/"))
    ) {
      errors.push(`Atom imports higher layer: ${relativeFilePath} -> ${importSource}`);
    }

    if (
      layer === "molecules" &&
      (resolvedRelative.startsWith("organisms/") || resolvedRelative.startsWith("templates/"))
    ) {
      errors.push(`Molecule imports higher layer: ${relativeFilePath} -> ${importSource}`);
    }

    if (layer === "organisms" && importSource.endsWith(".module.css")) {
      const importerBase = path.basename(filePath, path.extname(filePath));
      const stylesheetBase = path.basename(importSource, ".module.css");
      if (importerBase !== stylesheetBase) {
        errors.push(
          `Organism imports non-local stylesheet: ${relativeFilePath} -> ${importSource}`,
        );
      }
    }
  }
}

const globalsCss = fs.readFileSync(globalsCssPath, "utf8");
const forbiddenGlobals = [
  /\.site-shell\b/,
  /\.btn\b/,
  /\.form-[a-z0-9-]+\b/,
  /\.prose\b/,
  /\.[a-z0-9-]+__[a-z0-9-]+\b/,
  /\.[a-z0-9-]+--[a-z0-9-]+\b/,
];

for (const pattern of forbiddenGlobals) {
  if (pattern.test(globalsCss)) {
    errors.push(`globals.css contains forbidden component selector matching ${pattern}`);
  }
}

if (errors.length > 0) {
  console.error("Architecture validation failed:");
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log("Architecture validation passed.");
