import assert from "node:assert/strict";
import test from "node:test";
import type { ErrorEvent } from "@sentry/nextjs";
import { monitoringDsn, privateErrorEvent } from "../../lib/monitoring/privacy.ts";

test("monitoring is opt-in and only accepts a public Sentry ingestion DSN", () => {
  const dsn = `https://${"a".repeat(32)}@o123.ingest.de.sentry.io/456`;
  assert.equal(monitoringDsn("true", dsn), dsn);
  for (const flag of [undefined, "false", "1"]) assert.equal(monitoringDsn(flag, dsn), undefined);
  for (const value of ["invalid", dsn.replace("https:", "http:"), dsn.replace("sentry.io", "sentry.io.evil.example"), `${dsn}?email=example`, dsn.replace("@", ":password@")]) {
    assert.equal(monitoringDsn("true", value), undefined);
  }
});

test("only error type and bundled code locations survive sensitive event context", () => {
  const secret = "privacy-canary@example.invalid";
  const event: ErrorEvent = {
    type: undefined,
    event_id: "a".repeat(32), environment: "production", release: "b".repeat(40),
    message: secret, user: { email: secret, ip_address: "127.0.0.1" },
    request: { url: `https://chinachild.ru/zayavka?email=${secret}`, headers: { Cookie: secret }, data: secret },
    contexts: { app: { sensitive: secret } }, extra: { input: secret }, tags: { email: secret },
    breadcrumbs: [{ message: secret }], transaction: secret,
    exception: { values: [{ type: "TypeError", value: secret, stacktrace: { frames: [
      { filename: `https://chinachild.ru/_next/static/chunks/123.js?email=${secret}`, lineno: 5, colno: 7, function: secret, vars: { input: secret }, pre_context: [secret] },
      { filename: "/home/private/.next/server/app/page.js", lineno: 11 },
      { filename: `/home/private/input/${secret}` },
      { filename: `https://chinachild.ru/_next/visitor/${secret}` },
    ] } }] },
  };
  const result = privateErrorEvent(event);
  assert.ok(result);
  assert.ok(!JSON.stringify(result).includes(secret));
  assert.equal(result.exception?.values?.[0].type, "TypeError");
  assert.deepEqual(result.exception?.values?.[0].stacktrace?.frames, [
    { filename: "/_next/static/chunks/123.js", lineno: 5, colno: 7, in_app: false },
    { filename: ".next/server/app/page.js", lineno: 11, in_app: false },
  ]);
  assert.equal(result.user, undefined);
  assert.equal(result.request, undefined);
  assert.equal(result.contexts, undefined);
});

test("non-error payloads are dropped and attacker-controlled exception types are removed", () => {
  assert.equal(privateErrorEvent({ type: undefined }), null);
  assert.equal(privateErrorEvent({ type: "transaction", exception: { values: [{}] } } as unknown as ErrorEvent), null);
  const event = privateErrorEvent({ type: undefined, release: "private release name", exception: { values: [{ type: "private input" }] } });
  assert.equal(event?.exception?.values?.[0].type, "Error");
  assert.equal(event?.release, undefined);
});
