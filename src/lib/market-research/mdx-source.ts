// Server-only. Reads Market Research posts from MDX files in the repo
// (src/content/market-research/<slug>.mdx). The slug is the file name.
//
// Only the YAML frontmatter is parsed here. The article body is compiled by
// @next/mdx when the article page imports the file. Every post is validated
// on read, so a malformed post fails the build instead of shipping broken.

import fs from "node:fs";
import path from "node:path";
import { parse as parseYaml } from "yaml";
import type { PostAuthor, ResearchPost } from "./types";

const CONTENT_DIR = path.join(process.cwd(), "src", "content", "market-research");
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const MAX_SUMMARY_LENGTH = 300;

function fail(file: string, message: string): never {
  throw new Error(`[market-research] ${file}: ${message}`);
}

/** The YAML block between the leading `---` fences of an MDX file. */
function readFrontmatter(file: string, source: string): Record<string, unknown> {
  const match = source.replace(/^﻿/, "").match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
  if (!match) fail(file, "missing frontmatter block (--- ... ---) at the top of the file");

  let data: unknown;
  try {
    data = parseYaml(match[1]);
  } catch (error) {
    fail(file, `frontmatter is not valid YAML: ${error instanceof Error ? error.message : error}`);
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    fail(file, "frontmatter must be a set of key: value pairs");
  }
  return data as Record<string, unknown>;
}

function requireString(file: string, data: Record<string, unknown>, key: string): string {
  const value = data[key];
  if (typeof value !== "string" || value.trim() === "") {
    fail(file, `frontmatter "${key}" is required and must be a non-empty string`);
  }
  return value.trim();
}

function optionalHttpsUrl(file: string, value: unknown, label: string): string | undefined {
  if (value === undefined || value === null || value === "") return undefined;
  if (typeof value !== "string") fail(file, `${label} must be a string`);
  try {
    if (new URL(value).protocol !== "https:") throw new Error("not https");
  } catch {
    fail(file, `${label} must be an absolute https URL, got "${value}"`);
  }
  return value;
}

function parseDate(file: string, value: unknown): string {
  // YAML turns an unquoted 2026-09-18 into a Date, so accept both forms.
  const iso = value instanceof Date ? value.toISOString().slice(0, 10) : value;
  if (typeof iso !== "string" || !DATE_PATTERN.test(iso) || Number.isNaN(Date.parse(iso))) {
    fail(file, `frontmatter "date" must be a valid YYYY-MM-DD date, got "${String(value)}"`);
  }
  return iso;
}

function parseAuthors(file: string, value: unknown): PostAuthor[] {
  if (!Array.isArray(value) || value.length === 0) {
    fail(file, 'frontmatter "authors" must be a non-empty list');
  }
  return value.map((entry, index) => {
    const author = entry as Record<string, unknown> | null;
    if (!author || typeof author !== "object" || typeof author.name !== "string" || !author.name.trim()) {
      fail(file, `authors[${index}] needs a "name"`);
    }
    return {
      name: author.name.trim(),
      ...(typeof author.teamId === "string" ? { teamId: author.teamId } : {}),
      ...(optionalHttpsUrl(file, author.url, `authors[${index}].url`)
        ? { url: author.url as string }
        : {}),
    };
  });
}

function parseCover(file: string, data: Record<string, unknown>): ResearchPost["cover"] {
  const src = requireString(file, data, "cover");
  if (!src.startsWith("/") && !src.startsWith("https://")) {
    fail(file, `frontmatter "cover" must start with "/" or "https://", got "${src}"`);
  }
  const width = data.coverWidth;
  const height = data.coverHeight;
  if (!Number.isInteger(width) || !Number.isInteger(height) || (width as number) <= 0 || (height as number) <= 0) {
    fail(file, 'frontmatter "coverWidth" and "coverHeight" are required positive integers');
  }
  return {
    src,
    alt: requireString(file, data, "coverAlt"),
    width: width as number,
    height: height as number,
  };
}

function readPost(fileName: string): ResearchPost {
  const slug = fileName.replace(/\.mdx$/, "");
  if (!SLUG_PATTERN.test(slug)) {
    fail(fileName, "file name must be lowercase kebab-case (letters, numbers, hyphens)");
  }

  const data = readFrontmatter(fileName, fs.readFileSync(path.join(CONTENT_DIR, fileName), "utf8"));

  const summary = requireString(fileName, data, "summary");
  if (summary.length > MAX_SUMMARY_LENGTH) {
    fail(fileName, `"summary" is ${summary.length} characters; keep it under ${MAX_SUMMARY_LENGTH}`);
  }

  return {
    slug,
    title: requireString(fileName, data, "title"),
    date: parseDate(fileName, data.date),
    summary,
    cover: parseCover(fileName, data),
    authors: parseAuthors(fileName, data.authors),
    originalUrl: optionalHttpsUrl(fileName, data.originalUrl, "originalUrl"),
  };
}

export function listMdxPosts(): ResearchPost[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];

  return fs
    .readdirSync(CONTENT_DIR)
    .filter((fileName) => fileName.endsWith(".mdx"))
    .map(readPost)
    .sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}
