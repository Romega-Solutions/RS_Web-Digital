"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  TURNSTILE_SCRIPT_URL,
  TurnstileRunner,
  type AttemptResult,
  type TurnstileWidgetApi,
} from "@/lib/turnstile/attempt";

declare global {
  interface Window {
    turnstile?: TurnstileWidgetApi;
  }
}

type ScriptState = "idle" | "loading" | "loaded" | "failed";

const SCRIPT_MARKER = "data-turnstile-api";

type Options = {
  // Empty when the check is off for this form: nothing is loaded or run.
  siteKey: string;
  action: string;
};

// Owns the Cloudflare widget for one form. The Cloudflare script is requested
// only once the visitor first touches the form, and the check runs only when
// they submit, so a page that is only looked at never contacts Cloudflare.
export function useTurnstile({ siteKey, action }: Options) {
  const enabled = siteKey !== "";
  const containerRef = useRef<HTMLDivElement | null>(null);
  const runnerRef = useRef<TurnstileRunner | null>(null);
  const scriptState = useRef<ScriptState>("idle");
  const [interactive, setInteractive] = useState(false);

  const loadScript = useCallback(() => {
    if (typeof window === "undefined") return;
    if (window.turnstile) {
      scriptState.current = "loaded";
      runnerRef.current?.scriptLoaded();
      return;
    }
    let tag = document.querySelector<HTMLScriptElement>(`script[${SCRIPT_MARKER}]`);
    if (tag && scriptState.current === "failed") {
      // A tag that already failed never fires again; replace it so a retry can recover.
      tag.remove();
      tag = null;
    }
    const onLoad = () => {
      scriptState.current = "loaded";
      runnerRef.current?.scriptLoaded();
    };
    const onError = () => {
      scriptState.current = "failed";
      runnerRef.current?.scriptFailed();
    };
    if (tag) {
      if (scriptState.current !== "loading") scriptState.current = "loading";
      tag.addEventListener("load", onLoad, { once: true });
      tag.addEventListener("error", onError, { once: true });
      return;
    }
    scriptState.current = "loading";
    tag = document.createElement("script");
    tag.src = TURNSTILE_SCRIPT_URL;
    tag.async = true;
    tag.defer = true;
    tag.setAttribute(SCRIPT_MARKER, "");
    tag.addEventListener("load", onLoad, { once: true });
    tag.addEventListener("error", onError, { once: true });
    document.head.appendChild(tag);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const runner = new TurnstileRunner({
      siteKey,
      action,
      getContainer: () => containerRef.current,
      getApi: () => window.turnstile,
      ensureScript: loadScript,
      onInteractive: setInteractive,
    });
    runnerRef.current = runner;
    return () => {
      runner.dispose();
      if (runnerRef.current === runner) runnerRef.current = null;
    };
  }, [enabled, siteKey, action, loadScript]);

  // Called on the first touch of the form.
  const prepare = useCallback(() => {
    if (enabled && scriptState.current === "idle") loadScript();
  }, [enabled, loadScript]);

  // Runs one check and resolves with a fresh token, or the reason it did not
  // produce one. It always resolves.
  const check = useCallback((): Promise<AttemptResult> => {
    const runner = runnerRef.current;
    if (!runner) return Promise.resolve({ ok: false, reason: "unavailable" });
    return runner.run();
  }, []);

  return { enabled, containerRef, interactive, prepare, check };
}
