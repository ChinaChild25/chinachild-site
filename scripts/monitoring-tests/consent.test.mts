import assert from "node:assert/strict";
import test from "node:test";
import type { ErrorEvent } from "@sentry/nextjs";
import { applyAttributionConsent } from "../../lib/attribution/browser.ts";

test("optional SDK waits for consent, stops on withdrawal and survives rapid re-consent", async t => {
  type Options = { enabled?: boolean; beforeSend: (event: ErrorEvent) => ErrorEvent | null; [key: string]: unknown };
  let options: Options | undefined;
  let initialized = 0;
  let captured = 0;
  let finishClose: (() => void) | undefined;
  t.mock.module("@sentry/nextjs", { namedExports: {
    init: (value: Options) => { options = { ...value, enabled: true }; initialized++; },
    getClient: () => options ? { getOptions: () => options } : undefined,
    close: () => new Promise<void>(resolve => { finishClose = () => { options!.enabled = false; resolve(); }; }),
    captureException: () => { captured++; },
    globalHandlersIntegration: () => ({ name: "GlobalHandlers" }),
    browserApiErrorsIntegration: () => ({ name: "BrowserApiErrors" }),
    dedupeIntegration: () => ({ name: "Dedupe" }),
  } });
  const previousEnabled = process.env.NEXT_PUBLIC_SENTRY_ENABLED;
  const previousDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;
  process.env.NEXT_PUBLIC_SENTRY_ENABLED = "true";
  process.env.NEXT_PUBLIC_SENTRY_DSN = `https://${"a".repeat(32)}@o123.ingest.de.sentry.io/456`;
  t.after(() => {
    if (previousEnabled === undefined) delete process.env.NEXT_PUBLIC_SENTRY_ENABLED;
    else process.env.NEXT_PUBLIC_SENTRY_ENABLED = previousEnabled;
    if (previousDsn === undefined) delete process.env.NEXT_PUBLIC_SENTRY_DSN;
    else process.env.NEXT_PUBLIC_SENTRY_DSN = previousDsn;
  });
  const { captureBrowserError, syncErrorMonitoring } = await import("../../lib/monitoring/browser.ts");
  t.after(() => { applyAttributionConsent(false); });

  applyAttributionConsent(false);
  await captureBrowserError(new Error("not consented"));
  assert.equal(initialized, 0);
  applyAttributionConsent(true);
  const pending = syncErrorMonitoring(true);
  applyAttributionConsent(false);
  await pending;
  assert.equal(initialized, 0);

  applyAttributionConsent(true);
  await syncErrorMonitoring(true);
  assert.equal(initialized, 1);
  assert.equal(options?.defaultIntegrations, false);
  assert.equal(options?.tracesSampleRate, undefined);
  assert.deepEqual((options?.integrations as { name: string }[]).map(x => x.name), ["GlobalHandlers", "BrowserApiErrors", "Dedupe"]);
  assert.equal((options?.beforeSendLog as () => null)(), null);
  assert.equal((options?.beforeSendMetric as () => null)(), null);
  await captureBrowserError(new Error("consented"));
  assert.equal(captured, 1);

  applyAttributionConsent(false);
  const closing = syncErrorMonitoring(false);
  assert.equal(options?.beforeSend({ type: undefined, exception: { values: [{ type: "Error" }] } }), null);
  await captureBrowserError(new Error("withdrawn"));
  assert.equal(captured, 1);
  applyAttributionConsent(true);
  const restarting = syncErrorMonitoring(true);
  finishClose!();
  await Promise.all([closing, restarting]);
  assert.equal(initialized, 2);
  assert.equal(options?.enabled, true);
});
