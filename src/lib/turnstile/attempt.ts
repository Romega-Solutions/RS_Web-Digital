// Browser side of the Turnstile check, kept free of React so it can be tested
// with a fake widget. One runner owns one widget. Each submit asks it for one
// fresh token (run), and every way an attempt can end, including the script
// never loading, hands back an answer so the form is never left on "Checking".
//
// The widget is rendered in "execute" mode with every automatic retry and
// refresh turned off: it runs only when the visitor submits, and a token is
// used once and then thrown away (reset), because Cloudflare accepts a token a
// single time.

export const TURNSTILE_SCRIPT_URL = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";

// How long the automatic check may take before the attempt is given up, and how
// long a visitor gets once Cloudflare shows a box they have to tick.
export const AUTO_CHECK_TIMEOUT_MS = 15_000;
export const INTERACTIVE_TIMEOUT_MS = 180_000;

export type TurnstileWidgetApi = {
  render(container: HTMLElement | string, options: Record<string, unknown>): string | undefined;
  execute(widgetId: string): void;
  reset(widgetId: string): void;
  remove(widgetId: string): void;
};

export type AttemptFailureReason = "unavailable" | "timeout" | "error" | "expired" | "unsupported";

export type AttemptResult =
  | { ok: true; token: string }
  | { ok: false; reason: AttemptFailureReason };

export type RunnerOptions = {
  siteKey: string;
  action: string;
  getContainer: () => HTMLElement | null;
  getApi: () => TurnstileWidgetApi | undefined;
  // Starts loading the Cloudflare script if it is not loading yet.
  ensureScript: () => void;
  // True while Cloudflare is showing a box the visitor has to deal with.
  onInteractive?: (visible: boolean) => void;
  autoTimeoutMs?: number;
  interactiveTimeoutMs?: number;
  setTimer?: (callback: () => void, ms: number) => unknown;
  clearTimer?: (handle: unknown) => void;
};

type Pending = { resolve: (result: AttemptResult) => void; promise: Promise<AttemptResult>; started: boolean };

export class TurnstileRunner {
  private widgetId: string | undefined;
  private pending: Pending | null = null;
  private timer: unknown = null;
  private disposed = false;

  private readonly options: RunnerOptions;

  constructor(options: RunnerOptions) {
    this.options = options;
  }

  run(): Promise<AttemptResult> {
    if (this.disposed) return Promise.resolve({ ok: false, reason: "unavailable" });
    if (this.pending) return this.pending.promise;

    let resolve!: (result: AttemptResult) => void;
    const promise = new Promise<AttemptResult>((res) => {
      resolve = res;
    });
    this.pending = { resolve, promise, started: false };
    this.startTimer(this.options.autoTimeoutMs ?? AUTO_CHECK_TIMEOUT_MS);
    this.options.ensureScript();
    this.tryStart();
    return promise;
  }

  // The script tag reported it loaded.
  scriptLoaded(): void {
    this.tryStart();
  }

  // The script tag reported an error (blocked, offline, ad blocker).
  scriptFailed(): void {
    this.settle({ ok: false, reason: "unavailable" });
  }

  dispose(): void {
    this.disposed = true;
    this.settle({ ok: false, reason: "unavailable" });
    this.removeWidget();
  }

  private startTimer(ms: number) {
    this.clearTimer();
    const set = this.options.setTimer ?? ((callback, delay) => setTimeout(callback, delay));
    this.timer = set(() => this.settle({ ok: false, reason: "timeout" }), ms);
  }

  private clearTimer() {
    if (this.timer === null) return;
    const clear = this.options.clearTimer ?? ((handle) => clearTimeout(handle as ReturnType<typeof setTimeout>));
    clear(this.timer);
    this.timer = null;
  }

  private tryStart() {
    const pending = this.pending;
    if (!pending || pending.started) return;
    const api = this.options.getApi();
    if (!api) return;
    const container = this.options.getContainer();
    if (!container) {
      this.settle({ ok: false, reason: "unavailable" });
      return;
    }
    try {
      if (this.widgetId === undefined) {
        const id = api.render(container, this.renderOptions());
        if (!id) {
          this.settle({ ok: false, reason: "unavailable" });
          return;
        }
        this.widgetId = id;
      }
      pending.started = true;
      api.execute(this.widgetId);
    } catch {
      this.settle({ ok: false, reason: "unavailable" });
    }
  }

  private renderOptions(): Record<string, unknown> {
    return {
      sitekey: this.options.siteKey,
      action: this.options.action,
      execution: "execute",
      appearance: "interaction-only",
      retry: "never",
      "refresh-expired": "never",
      "refresh-timeout": "never",
      "response-field": false,
      callback: (token: unknown) => {
        if (typeof token === "string" && token) this.settleIfStarted({ ok: true, token });
      },
      "error-callback": () => {
        this.settleIfStarted({ ok: false, reason: "error" });
        return true;
      },
      "timeout-callback": () => this.settleIfStarted({ ok: false, reason: "timeout" }),
      "expired-callback": () => this.settleIfStarted({ ok: false, reason: "expired" }),
      "unsupported-callback": () => {
        this.settleIfStarted({ ok: false, reason: "unsupported" });
        return true;
      },
      "before-interactive-callback": () => {
        if (!this.pending) return;
        this.startTimer(this.options.interactiveTimeoutMs ?? INTERACTIVE_TIMEOUT_MS);
        this.options.onInteractive?.(true);
      },
      "after-interactive-callback": () => {
        this.options.onInteractive?.(false);
        if (this.pending) this.startTimer(this.options.autoTimeoutMs ?? AUTO_CHECK_TIMEOUT_MS);
      },
    };
  }

  private settleIfStarted(result: AttemptResult) {
    if (this.pending?.started) this.settle(result);
  }

  private settle(result: AttemptResult) {
    const pending = this.pending;
    if (!pending) return;
    this.pending = null;
    this.clearTimer();
    this.options.onInteractive?.(false);
    // A used or failed widget cannot be run again until it is reset.
    const api = this.options.getApi();
    if (api && this.widgetId !== undefined) {
      try {
        api.reset(this.widgetId);
      } catch {
        /* the next run renders again if needed */
      }
    }
    pending.resolve(result);
  }

  private removeWidget() {
    const api = this.options.getApi();
    if (api && this.widgetId !== undefined) {
      try {
        api.remove(this.widgetId);
      } catch {
        /* nothing left to clean up */
      }
    }
    this.widgetId = undefined;
  }
}
