# Chat Reveal Animation + API Security Hardening — Design

**Date:** 2026-05-26
**Scope:** `src/components/organisms/shared/ChatLauncher.tsx`, `src/app/api/chat/route.ts`
**Status:** Approved — proceeding to implementation

## Problem

The site-wide chat launcher currently:

1. Renders bot replies instantly — answers pop in fully formed, which feels abrupt and less "assistant-like".
2. Has only basic security on `/api/chat`: in-memory per-IP rate limit (20/min), 1000-char input cap, JSON parse guard. Missing origin enforcement, body-size guard, content-type check, response cache headers, and robust IP extraction.

## Goals

- Bot messages reveal **word by word** with a soft fade + slide, in under ~1s per typical reply.
- Respect `prefers-reduced-motion`.
- Tighten `/api/chat` against cross-origin abuse, oversized bodies, mis-typed requests, and casual scraping — without external services.

## Non-goals

- No Upstash / Redis / distributed rate limit.
- No CSRF tokens (endpoint has no auth state).
- No real LLM streaming (route is rule-based).
- No UI restructuring beyond the reveal.

## Design

### Frontend — `WordReveal` component

Inline helper inside `ChatLauncher.tsx`:

- Splits text on whitespace (keeping the original separators for layout).
- Renders each token as `motion.span` with `initial={{opacity:0, y:4}}`, `animate={{opacity:1, y:0}}`, transition `{ duration: 0.14, delay: i * 0.025 }`.
- After the last word lands, calls an optional `onDone` callback.
- During reveal, an `onTick` callback (fired on each animation frame) pins the message scroll container to bottom so the reveal doesn't run off-screen.
- If `useReducedMotion()` returns true → render plain text, no per-word motion, `onDone` fires immediately.

### Frontend — wiring

- Track `latestBotId` in state. Only the message whose id matches gets `shouldAnimate=true`; everything else renders plain text. Prevents re-animation on re-mount or new-message scroll.
- The greeting message (`greet-1`) and any user message never animate.
- Auto-scroll effect upgraded: on `messages` change, scroll to bottom; during active reveal, the `onTick` callback keeps it pinned.

### Backend — security helpers in `route.ts`

Refactor into small, named guards. Each returns `null` on pass or a `NextResponse` to short-circuit:

| Helper | Returns 4xx when |
|---|---|
| `assertMethod` | (handled by exporting only POST + OPTIONS) |
| `assertContentType` | `content-type` is not `application/json` → 415 |
| `assertBodySize` | `content-length` header > 8192 → 413 |
| `assertSameOrigin` | `origin`/`referer` host ∉ allowlist → 403 |
| `applyRateLimit` | per-IP > 20 in 60s window → 429 |
| `validateMessage` | empty after trim, > 1000 chars, or ≥3 URLs → 400 |

**Allowlist** is derived from:
- `process.env.NEXT_PUBLIC_SITE_URL` (canonical site)
- `request.nextUrl.origin` (same-origin fallback for previews)
- In dev (`NODE_ENV !== "production"`), also allow `http://localhost:*`.

**IP extraction order:**
1. `x-vercel-forwarded-for` (first comma-separated value)
2. `x-real-ip`
3. `x-forwarded-for` (first value)
4. `"unknown"` fallback

**Rate-limit map hygiene:** every 200 writes, sweep entries where `resetAt < Date.now()`. Caps memory under sustained traffic on a long-lived Fluid Compute instance.

**Response headers on every 2xx:**
- `cache-control: no-store`
- `x-content-type-options: nosniff`
- `x-robots-tag: noindex`

**OPTIONS handler:** returns `204 No Content` with no `Access-Control-Allow-Origin` — cross-origin preflight fails by design.

### Error messages

All 4xx responses use generic copy (`"Bad request."`, `"Too many requests. Please try again in a moment."`). No internal stack/info leak. Existing 429 copy is kept.

## Testing

Manual:
1. Open chat, send a question — bot reply reveals word-by-word in <1s; auto-scroll keeps last word visible.
2. Toggle macOS Reduce Motion → reply appears instantly, no per-word transitions.
3. From another origin (e.g., `curl -H "origin: https://evil.example" …`) → 403.
4. Send 25 rapid requests → after #20 returns 429.
5. `curl -X POST … -H "content-type: text/plain"` → 415.
6. `curl -X POST … -d "$(head -c 9000 /dev/urandom | base64)"` → 413.
7. Empty message → 400.

## Files changed

- `src/app/api/chat/route.ts` — refactored with security helpers
- `src/components/organisms/shared/ChatLauncher.tsx` — added `WordReveal`, latest-bot tracking, scroll pinning

No new dependencies. No CSS changes. No env-var changes beyond optional `NEXT_PUBLIC_SITE_URL` (already in use elsewhere).
