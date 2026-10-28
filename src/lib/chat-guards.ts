// Small guards for the public chat endpoint: a request body reader that stops at
// a size limit, a per-visitor rate limiter, and a soft hourly budget for the
// paid model calls. All of it lives in one server instance's memory, so on
// Vercel each instance counts for itself. That makes these limits a speed bump,
// not an exact quota; a firewall rule in Vercel is the hard limit (see
// docs/security-hardening.md).

export const CHAT_MAX_BODY_BYTES = 8 * 1024;
export const CHAT_RATE_WINDOW_MS = 60_000;
export const CHAT_RATE_MAX_PER_WINDOW = 10;
export const CHAT_MODEL_BUDGET_WINDOW_MS = 60 * 60_000;
export const CHAT_MODEL_BUDGET_PER_WINDOW = 300;

export type BodyResult =
  | { ok: true; value: unknown }
  | { ok: false; status: 400 | 413 };

/**
 * Reads a JSON body without trusting Content-Length: the stream is counted as it
 * arrives and cancelled as soon as it goes over the limit, so a chunked or
 * understated upload never fills memory.
 */
export async function readJsonWithLimit(request: Request, maxBytes: number): Promise<BodyResult> {
  const declared = request.headers.get("content-length");
  if (declared !== null && Number(declared) > maxBytes) return { ok: false, status: 413 };

  const stream = request.body;
  if (!stream) return { ok: false, status: 400 };

  const reader = stream.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      total += value.byteLength;
      if (total > maxBytes) {
        await reader.cancel().catch(() => {});
        return { ok: false, status: 413 };
      }
      chunks.push(value);
    }
  } catch {
    return { ok: false, status: 400 };
  }

  const bytes = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    bytes.set(chunk, offset);
    offset += chunk.byteLength;
  }
  try {
    return { ok: true, value: JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes)) };
  } catch {
    return { ok: false, status: 400 };
  }
}

export type Clock = () => number;

/** At most `max` requests per key in each window; finished windows are swept now and then. */
export function createRateLimiter(
  windowMs: number,
  max: number,
  now: Clock = Date.now,
  sweepEvery = 200,
) {
  const records = new Map<string, { count: number; resetAt: number }>();
  let writes = 0;
  return {
    allow(key: string): boolean {
      const t = now();
      writes += 1;
      if (writes % sweepEvery === 0) {
        for (const [k, record] of records) if (record.resetAt < t) records.delete(k);
      }
      const record = records.get(key);
      if (!record || record.resetAt < t) {
        records.set(key, { count: 1, resetAt: t + windowMs });
        return true;
      }
      if (record.count >= max) return false;
      record.count += 1;
      return true;
    },
    size: () => records.size,
  };
}

/** A shared allowance for everyone: `take()` is true until the window's budget is used up. */
export function createBudget(windowMs: number, max: number, now: Clock = Date.now) {
  let used = 0;
  let resetAt = 0;
  return {
    take(): boolean {
      const t = now();
      if (t >= resetAt) {
        used = 0;
        resetAt = t + windowMs;
      }
      if (used >= max) return false;
      used += 1;
      return true;
    },
  };
}
