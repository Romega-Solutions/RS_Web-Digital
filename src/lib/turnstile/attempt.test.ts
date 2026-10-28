import assert from "node:assert/strict";
import test from "node:test";
import { TurnstileRunner, pickWidgetSize, type AttemptResult, type TurnstileWidgetApi } from "./attempt.ts";

type Opts = Record<string, (...args: unknown[]) => unknown>;

// A stand-in for Cloudflare's widget and for the browser's timers.
function setup(options: { scriptReady?: boolean; renderReturns?: string | undefined; throwOnExecute?: boolean } = {}) {
  const log: string[] = [];
  let widgetOptions: Opts = {};
  let api: TurnstileWidgetApi | undefined;
  let renders = 0;
  const timers = new Map<number, { cb: () => void; ms: number }>();
  let nextTimer = 1;
  const interactive: boolean[] = [];

  const widget: TurnstileWidgetApi = {
    render(_container, opts) {
      renders += 1;
      widgetOptions = opts as Opts;
      log.push("render");
      return "renderReturns" in options ? options.renderReturns : "w1";
    },
    execute(id) {
      log.push(`execute:${id}`);
      if (options.throwOnExecute) throw new Error("boom");
    },
    reset(id) {
      log.push(`reset:${id}`);
    },
    remove(id) {
      log.push(`remove:${id}`);
    },
  };
  if (options.scriptReady !== false) api = widget;
  let scriptRequests = 0;

  const runner = new TurnstileRunner({
    siteKey: "site",
    action: "contact",
    getContainer: () => ({}) as HTMLElement,
    getApi: () => api,
    ensureScript: () => {
      scriptRequests += 1;
    },
    onInteractive: (visible) => interactive.push(visible),
    autoTimeoutMs: 1000,
    interactiveTimeoutMs: 5000,
    setTimer: (cb, ms) => {
      const id = nextTimer++;
      timers.set(id, { cb, ms });
      return id;
    },
    clearTimer: (handle) => timers.delete(handle as number),
  });

  return {
    runner,
    log,
    interactive,
    callbacks: () => widgetOptions,
    loadScript() {
      api = widget;
      runner.scriptLoaded();
    },
    fireTimer() {
      const [id, timer] = [...timers.entries()][0] ?? [];
      assert.ok(timer, "a timer should be running");
      timers.delete(id!);
      timer.cb();
    },
    timerMs: () => [...timers.values()].map((t) => t.ms),
    timersRunning: () => timers.size,
    renders: () => renders,
    scriptRequests: () => scriptRequests,
  };
}

const settled = (promise: Promise<AttemptResult>) =>
  Promise.race([promise, new Promise<"pending">((resolve) => setTimeout(() => resolve("pending"), 5))]);

test("the widget is rendered in execute mode with every automatic retry off", async () => {
  const t = setup();
  const result = t.runner.run();
  const o = t.callbacks();
  assert.equal(o.sitekey, "site");
  assert.equal(o.action, "contact");
  assert.equal(o.execution, "execute");
  assert.equal(o.appearance, "interaction-only");
  assert.equal(o.retry, "never");
  assert.equal(o["refresh-expired"], "never");
  assert.equal(o["refresh-timeout"], "never");
  assert.equal(o["response-field"], false);
  o.callback("token-1");
  assert.deepEqual(await result, { ok: true, token: "token-1" });
});

test("a token ends the attempt and the widget is reset for the next one", async () => {
  const t = setup();
  const first = t.runner.run();
  t.callbacks().callback("t1");
  assert.deepEqual(await first, { ok: true, token: "t1" });
  assert.equal(t.timersRunning(), 0);
  assert.deepEqual(t.log, ["render", "execute:w1", "reset:w1"]);

  const second = t.runner.run();
  t.callbacks().callback("t2");
  assert.deepEqual(await second, { ok: true, token: "t2" });
  assert.equal(t.renders(), 1, "the widget is rendered once and reused");
  assert.deepEqual(t.log, ["render", "execute:w1", "reset:w1", "execute:w1", "reset:w1"]);
});

test("every failure callback ends the attempt", async () => {
  const cases: Array<[string, string]> = [
    ["error-callback", "error"],
    ["timeout-callback", "timeout"],
    ["expired-callback", "expired"],
    ["unsupported-callback", "unsupported"],
  ];
  for (const [callback, reason] of cases) {
    const t = setup();
    const result = t.runner.run();
    t.callbacks()[callback]("110200");
    assert.deepEqual(await result, { ok: false, reason });
    assert.equal(t.timersRunning(), 0);
  }
});

test("the error callback reports itself as handled", () => {
  const t = setup();
  void t.runner.run();
  assert.equal(t.callbacks()["error-callback"]("x"), true);
});

test("a script that is still loading starts the check once it arrives", async () => {
  const t = setup({ scriptReady: false });
  const result = t.runner.run();
  assert.equal(t.scriptRequests(), 1);
  assert.equal(t.renders(), 0);
  t.loadScript();
  assert.equal(t.renders(), 1);
  t.callbacks().callback("late");
  assert.deepEqual(await result, { ok: true, token: "late" });
});

test("a script that fails to load ends the attempt at once", async () => {
  const t = setup({ scriptReady: false });
  const result = t.runner.run();
  t.runner.scriptFailed();
  assert.deepEqual(await result, { ok: false, reason: "unavailable" });
  assert.equal(t.timersRunning(), 0);
});

test("a script that never answers ends the attempt when the time is up", async () => {
  const t = setup({ scriptReady: false });
  const result = t.runner.run();
  assert.deepEqual(t.timerMs(), [1000]);
  t.fireTimer();
  assert.deepEqual(await result, { ok: false, reason: "timeout" });
});

test("a check that never reports back ends when the time is up and the widget is reset", async () => {
  const t = setup();
  const result = t.runner.run();
  t.fireTimer();
  assert.deepEqual(await result, { ok: false, reason: "timeout" });
  assert.ok(t.log.includes("reset:w1"));
});

test("a visible challenge gets the longer time, and the short one again afterwards", async () => {
  const t = setup();
  const result = t.runner.run();
  t.callbacks()["before-interactive-callback"]();
  assert.deepEqual(t.timerMs(), [5000]);
  assert.deepEqual(t.interactive, [true]);
  t.callbacks()["after-interactive-callback"]();
  assert.deepEqual(t.timerMs(), [1000]);
  t.callbacks().callback("solved");
  assert.deepEqual(await result, { ok: true, token: "solved" });
  assert.equal(t.interactive.at(-1), false);
});

test("an unanswered challenge cannot leave the form waiting forever", async () => {
  const t = setup();
  const result = t.runner.run();
  t.callbacks()["before-interactive-callback"]();
  t.fireTimer();
  assert.deepEqual(await result, { ok: false, reason: "timeout" });
  assert.equal(t.interactive.at(-1), false);
});

test("an answer is used once: a second callback after the attempt is ignored", async () => {
  const t = setup();
  const first = t.runner.run();
  const callbacks = t.callbacks();
  callbacks.callback("t1");
  await first;
  callbacks.callback("stale");
  callbacks["error-callback"]();
  const second = t.runner.run();
  assert.equal(await settled(second), "pending");
  callbacks.callback("t2");
  assert.deepEqual(await second, { ok: true, token: "t2" });
});

test("a late callback from the old attempt cannot answer a new one before it starts", async () => {
  const t = setup({ scriptReady: false });
  const first = t.runner.run();
  t.runner.scriptFailed();
  await first;
  const second = t.runner.run();
  assert.equal(await settled(second), "pending");
  t.loadScript();
  t.callbacks().callback("fresh");
  assert.deepEqual(await second, { ok: true, token: "fresh" });
});

test("an empty token is not an answer", async () => {
  const t = setup();
  const result = t.runner.run();
  t.callbacks().callback("");
  assert.equal(await settled(result), "pending");
  t.callbacks().callback("real");
  assert.deepEqual(await result, { ok: true, token: "real" });
});

test("a second run while one is under way shares the same answer", async () => {
  const t = setup();
  const a = t.runner.run();
  const b = t.runner.run();
  assert.equal(a, b);
  t.callbacks().callback("one");
  assert.deepEqual(await b, { ok: true, token: "one" });
});

test("if the widget cannot start, the attempt ends instead of waiting", async () => {
  assert.deepEqual(await setup({ renderReturns: undefined }).runner.run(), { ok: false, reason: "unavailable" });
  assert.deepEqual(await setup({ throwOnExecute: true }).runner.run(), { ok: false, reason: "unavailable" });
});

test("disposing ends a waiting attempt and removes the widget", async () => {
  const t = setup();
  const result = t.runner.run();
  t.runner.dispose();
  assert.deepEqual(await result, { ok: false, reason: "unavailable" });
  assert.ok(t.log.includes("remove:w1"));
  assert.deepEqual(await t.runner.run(), { ok: false, reason: "unavailable" });
});

test("a very narrow container gets the compact widget, anything else the normal one", () => {
  assert.equal(pickWidgetSize(238), "compact");
  assert.equal(pickWidgetSize(299), "compact");
  assert.equal(pickWidgetSize(300), "normal");
  assert.equal(pickWidgetSize(600), "normal");
  assert.equal(pickWidgetSize(0), "normal");
  assert.equal(pickWidgetSize(undefined), "normal");
});
