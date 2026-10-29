// Microsoft Clarity: when to load it, the tag that loads it, and the visitor's
// consent choice. Kept free of React so it can be unit-tested with node:test.

export const CLARITY_CONSENT_KEY = "rs-clarity-consent";

export type ClarityConsent = "accepted" | "declined";

type ClarityFn = ((...args: unknown[]) => void) & { q?: unknown[][] };
export type ClarityWindow = { clarity?: ClarityFn };

export type StorageLike = Pick<Storage, "getItem" | "setItem">;

/** Clarity project IDs are short, lowercase letters and digits. */
const CLARITY_ID_PATTERN = /^[a-z0-9]{1,32}$/i;

export function isValidClarityId(id: string | undefined | null): id is string {
  return typeof id === "string" && CLARITY_ID_PATTERN.test(id);
}

/**
 * The project ID to load, or null when Clarity must not load: only on the
 * Production deployment and only with a well-formed ID.
 */
export function clarityProjectId(env: {
  VERCEL_ENV?: string;
  NEXT_PUBLIC_CLARITY_PROJECT_ID?: string;
}): string | null {
  if (env.VERCEL_ENV !== "production") return null;
  const id = env.NEXT_PUBLIC_CLARITY_PROJECT_ID?.trim();
  return isValidClarityId(id) ? id : null;
}

/**
 * Clarity's standard tag, followed by consent so cookies are set. It is only
 * ever rendered after the visitor accepts. The ID is checked again here
 * because it is written into an inline script.
 */
export function claritySnippet(id: string): string {
  if (!isValidClarityId(id)) throw new Error("Invalid Clarity project ID");
  return [
    "(function(c,l,a,r,i,t,y){",
    "c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};",
    't=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;',
    "y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);",
    `})(window,document,"clarity","script","${id}");`,
    'window.clarity("consent");',
  ].join("");
}

/**
 * The tag loads only with consent: an Accept in this visit or one stored from
 * an earlier visit. No choice or a Decline means it never loads.
 */
export function shouldLoadClarity(
  stored: ClarityConsent | null,
  acceptedNow: boolean,
): boolean {
  return acceptedNow || stored === "accepted";
}

export function readConsent(storage: StorageLike | undefined): ClarityConsent | null {
  try {
    const value = storage?.getItem(CLARITY_CONSENT_KEY);
    return value === "accepted" || value === "declined" ? value : null;
  } catch {
    return null;
  }
}

function saveConsent(storage: StorageLike | undefined, value: ClarityConsent): void {
  try {
    storage?.setItem(CLARITY_CONSENT_KEY, value);
  } catch {
    // Private mode or storage full: the choice holds for this page view only.
  }
}

/** Sends consent to Clarity, queueing it if the tag has not loaded yet. */
export function sendConsent(win: ClarityWindow): void {
  if (typeof win.clarity !== "function") {
    const stub: ClarityFn = (...args: unknown[]) => {
      (stub.q = stub.q || []).push(args);
    };
    win.clarity = stub;
  }
  win.clarity!("consent");
}

/** Accept stores the choice; the caller then loads the tag, which sends consent. */
export function acceptClarity(storage: StorageLike | undefined): void {
  saveConsent(storage, "accepted");
}

/** Declining stores the choice and sends nothing to Clarity. */
export function declineClarity(storage: StorageLike | undefined): void {
  saveConsent(storage, "declined");
}

/** Escape closes the banner for this page view without making a choice. */
export function isBannerCloseKey(key: string): boolean {
  return key === "Escape" || key === "Esc";
}

/** The privacy page (and any path starting with /privacy) is never dimmed. */
export function isConsentExemptPath(pathname: string | null | undefined): boolean {
  return typeof pathname === "string" && pathname.startsWith("/privacy");
}

/** The dim shows only while the banner is open, and never on the privacy page. */
export function showConsentBackdrop(open: boolean, pathname: string | null | undefined): boolean {
  return open && !isConsentExemptPath(pathname);
}
