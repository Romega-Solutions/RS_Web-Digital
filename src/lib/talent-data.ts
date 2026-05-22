// Server-only data layer for the public Talent showcase.
//
// Fetches published candidates from the RS-Tool-Ticketing-System's
// /api/public/talents endpoint (bearer-token gated). The endpoint
// already filters to is_public_talent = TRUE and strips email/phone/
// resume-url/internal fields before returning, so the marketing site
// only ever sees showcase-safe data.

import type { TalentProfile } from "@/components/organisms/talent/talentData";

type UpstreamTalent = {
  id: number;
  applicationCode: string | null;
  fullName: string;
  position: string | null;
  location: string | null;
  summary: string | null;
  skills: string[];
  linkedinUrl: string | null;
  experience: Array<{ company?: string | null; title?: string | null }> | null;
  experienceYears: number | null;
  publishedAt: string;
};

type UpstreamResponse = {
  ok?: boolean;
  talents?: UpstreamTalent[];
  updatedAt?: string;
  error?: string;
};

const TICKETING_APP_URL = (
  process.env.TICKETING_APP_URL || "http://localhost:3000"
).replace(/\/+$/, "");

const CATEGORY_RULES: Array<{ match: RegExp; label: string }> = [
  { match: /assist|ea\b|executive support|operations|admin/i, label: "Virtual Assistant" },
  { match: /design|brand|creative|ux|ui|art director/i, label: "Designers" },
  { match: /develop|engineer|software|frontend|backend|full[- ]?stack/i, label: "Developers" },
  { match: /sales|account exec|business development|bdr|sdr/i, label: "Sales Experts" },
  { match: /ai|ml|data|machine learning|llm/i, label: "AI & Data" },
  { match: /market|growth|content|seo|copy/i, label: "Marketing" },
  { match: /finance|accounting|bookkeep|controller/i, label: "Finance & Ops" },
];

function deriveCategory(position: string | null): string {
  if (!position) return "Available Talent";
  for (const rule of CATEGORY_RULES) {
    if (rule.match.test(position)) return rule.label;
  }
  return "Available Talent";
}

function deriveSeniority(years: number | null): TalentProfile["experienceLevel"] {
  if (years == null) return "Senior";
  if (years < 2) return "Junior";
  if (years < 5) return "Mid-Level";
  if (years < 9) return "Senior";
  if (years < 14) return "Lead";
  return "Principal";
}

function deriveTagline(summary: string | null, position: string | null): string {
  if (summary) {
    const cleaned = summary.replace(/\s+/g, " ").trim();
    const firstSentence = cleaned.match(/^.+?[.!?](?:\s|$)/)?.[0]?.trim();
    const base = firstSentence && firstSentence.length > 30 ? firstSentence : cleaned;
    if (base.length <= 160) return base;
    return `${base.slice(0, 157).trimEnd()}…`;
  }
  if (position) return `${position} available for project, embedded, or long-term engagements.`;
  return "Available for project, embedded, or long-term engagements.";
}

function anonymizeName(fullName: string): string {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "Candidate";
  if (parts.length === 1) return parts[0];
  const first = parts[0];
  const lastInitial = parts[parts.length - 1][0]?.toUpperCase() ?? "";
  return lastInitial ? `${first} ${lastInitial}.` : first;
}

function mapTalent(row: UpstreamTalent): TalentProfile {
  return {
    id: row.applicationCode || `TL-${row.id}`,
    name: anonymizeName(row.fullName),
    role: row.position?.trim() || "Available Talent",
    location: row.location?.trim() || "Remote",
    category: deriveCategory(row.position),
    experienceLevel: deriveSeniority(row.experienceYears),
    tagline: deriveTagline(row.summary, row.position),
    skills: row.skills.slice(0, 8),
  };
}

export async function fetchPublishedTalent(): Promise<TalentProfile[]> {
  const token = process.env.PUBLIC_APPLICATIONS_TOKEN;
  if (!token) return [];

  try {
    const response = await fetch(
      `${TICKETING_APP_URL}/api/public/talents`,
      {
        headers: { Authorization: `Bearer ${token}` },
        next: { revalidate: 300 },
      },
    );

    if (!response.ok) {
      console.error(
        `[talent-data] ticketing endpoint returned ${response.status}`,
      );
      return [];
    }

    const payload = (await response.json()) as UpstreamResponse;
    if (!payload.ok || !Array.isArray(payload.talents)) return [];

    return payload.talents.map(mapTalent);
  } catch (err) {
    console.error(
      "[talent-data] couldn't reach ticketing /api/public/talents:",
      err instanceof Error ? err.message : err,
    );
    return [];
  }
}
