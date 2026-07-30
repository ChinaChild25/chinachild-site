import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { trackLeadSubmitted } from "../../lib/analytics.ts";
import {
  getCachedYandexClientId,
  startYandexClientIdCapture,
} from "../../lib/analytics/yandex-client-id.ts";
import { validateYandexClientId } from "../../lib/analytics/yandex-client-id-value.ts";
import { deliverYandexLeadEvent } from "../../lib/analytics/yandex-metrika-delivery.ts";
import {
  buildServerLeadMeasurementBody,
  extractYandexClientId,
  resolveYandexClientId,
  validateYandexMeasurementConfig,
  YANDEX_LEAD_EVENT,
  YANDEX_MEASUREMENT_ENDPOINT,
} from "../../lib/analytics/yandex-metrika-measurement-request.ts";
import { isSpamPayload } from "../../lib/leads/anti-abuse.ts";
import { isPersistedLeadResponse } from "../../lib/leads/contact-response.ts";
import {
  beginLeadSubmission,
  releaseLeadSubmission,
} from "../../lib/leads/submission-gate.ts";

const validMeasurementEnv = {
  NEXT_PUBLIC_YM_ID: "123",
  YANDEX_METRIKA_MEASUREMENT_TOKEN: "test-token-placeholder",
  NEXT_PUBLIC_SITE_URL: "https://chinachild.ru/",
};

test("contact responses distinguish persisted leads from spam decoys and legacy success shapes", () => {
  assert.equal(
    isPersistedLeadResponse({
      ok: true,
      accepted: true,
      persisted: true,
      id: "lead-123",
    }),
    true,
  );
  assert.equal(
    isPersistedLeadResponse({ ok: true, accepted: false, persisted: false }),
    false,
  );
  assert.equal(isPersistedLeadResponse({ ok: true, id: "lead-123" }), false);
});

test("form-age and honeypot checks use the form availability timestamp", () => {
  const now = 2_000;
  assert.equal(
    isSpamPayload({ form_started_at: String(now - 1_000) }, now),
    false,
  );
  assert.equal(
    isSpamPayload({ form_started_at: String(now - 100) }, now),
    true,
  );
  assert.equal(
    isSpamPayload({ form_started_at: String(now - 1_000), company: "bot" }, now),
    true,
  );
});

test("submission gate blocks same-tick duplicates and allows a retry after rejection", () => {
  const gate = { current: false };
  assert.equal(beginLeadSubmission(gate), true);
  assert.equal(beginLeadSubmission(gate), false);
  releaseLeadSubmission(gate);
  assert.equal(beginLeadSubmission(gate), true);
});

test("persisted lead client analytics emit GA4 once without Yandex or dataLayer lead events", () => {
  const ymCalls: unknown[][] = [];
  const gtagCalls: unknown[][] = [];
  const dataLayer: unknown[] = [];
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      ym: (...args: unknown[]) => ymCalls.push(args),
      gtag: (...args: unknown[]) => gtagCalls.push(args),
      dataLayer,
    },
  });

  try {
    const input = {
      leadId: "stored-lead-dedup-test",
      course: "hsk-preparation",
      source: "hsk-result",
    };
    assert.equal(trackLeadSubmitted(input), true);
    assert.equal(trackLeadSubmitted(input), false);
    assert.equal(ymCalls.length, 0);
    assert.equal(gtagCalls.length, 1);
    assert.deepEqual(gtagCalls[0]?.slice(0, 2), ["event", "generate_lead"]);
    assert.equal(dataLayer.length, 0);
  } finally {
    if (originalWindow) {
      Object.defineProperty(globalThis, "window", originalWindow);
    } else {
      Reflect.deleteProperty(globalThis, "window");
    }
  }
});

test("shared browser helper captures and validates the official Yandex ClientID", () => {
  const calls: unknown[][] = [];
  const originalWindow = Object.getOwnPropertyDescriptor(globalThis, "window");
  const originalCounterId = process.env.NEXT_PUBLIC_YM_ID;

  Object.defineProperty(globalThis, "window", {
    configurable: true,
    value: {
      ym: (...args: unknown[]) => {
        calls.push(args);
        const callback = args[2];
        if (typeof callback === "function") callback("1710232430899999999");
      },
      addEventListener: () => {},
      removeEventListener: () => {},
      setTimeout: globalThis.setTimeout.bind(globalThis),
      clearTimeout: globalThis.clearTimeout.bind(globalThis),
    },
  });
  process.env.NEXT_PUBLIC_YM_ID = "123";

  try {
    const stop = startYandexClientIdCapture();
    stop();
    assert.deepEqual(calls[0]?.slice(0, 2), [123, "getClientID"]);
    assert.equal(getCachedYandexClientId(), "1710232430899999999");
    assert.equal(validateYandexClientId(" 12345 "), "12345");
    assert.equal(validateYandexClientId("not-a-client"), null);
    assert.equal(validateYandexClientId(""), null);
  } finally {
    if (originalWindow) {
      Object.defineProperty(globalThis, "window", originalWindow);
    } else {
      Reflect.deleteProperty(globalThis, "window");
    }
    if (originalCounterId === undefined) {
      delete process.env.NEXT_PUBLIC_YM_ID;
    } else {
      process.env.NEXT_PUBLIC_YM_ID = originalCounterId;
    }
  }
});

test("Measurement Protocol body sends the canonical event and never a virtual pageview", () => {
  const valid = validateYandexMeasurementConfig(validMeasurementEnv);
  assert.equal(valid.ok, true);
  if (!valid.ok) return;

  const body = buildServerLeadMeasurementBody({
    config: valid.config,
    clientId: "1710232430899999999",
    sourceUrl: "https://chinachild.ru/chinese/hsk-test/result",
    eventTimeSeconds: 1_700_000_000,
  });
  assert.equal(YANDEX_MEASUREMENT_ENDPOINT, "https://mc.yandex.ru/collect");
  assert.equal(new URL(YANDEX_MEASUREMENT_ENDPOINT).search, "");
  assert.equal(YANDEX_LEAD_EVENT, "lead_submitted");
  assert.equal(body.get("tid"), "123");
  assert.equal(body.get("cid"), "1710232430899999999");
  assert.equal(body.get("t"), "event");
  assert.equal(body.get("ea"), "lead_submitted");
  assert.equal(
    body.get("dl"),
    "https://chinachild.ru/chinese/hsk-test/result",
  );
  assert.equal(body.get("et"), "1700000000");
  assert.equal(body.get("ms"), validMeasurementEnv.YANDEX_METRIKA_MEASUREMENT_TOKEN);
  assert.equal(body.get("dr"), null);
  assert.equal(body.get("dt"), null);
  assert.doesNotMatch(body.toString(), /lead-success%2Fserver|t=pageview/);

  const semanticSource = buildServerLeadMeasurementBody({
    config: valid.config,
    clientId: "1710232430899999999",
    sourceUrl: "hsk-test-result-level-4",
  });
  assert.equal(semanticSource.get("dl"), "https://chinachild.ru/");
});

test("ClientID resolution validates payload, falls back to _ym_uid, and honors precedence", () => {
  const cookie = "foo=bar; _ym_uid=1710232430899999999; baz=1";
  assert.equal(extractYandexClientId(cookie), "1710232430899999999");
  assert.equal(
    resolveYandexClientId({
      explicitClientId: "987654321",
      cookieHeader: cookie,
    }),
    "987654321",
  );
  assert.equal(
    resolveYandexClientId({
      explicitClientId: "not-a-client",
      cookieHeader: cookie,
    }),
    "1710232430899999999",
  );
  assert.equal(
    resolveYandexClientId({
      explicitClientId: "not-a-client",
      cookieHeader: "_ym_uid=also-invalid",
    }),
    null,
  );
  assert.equal(extractYandexClientId("_ym_uid=%E0%A4%A"), null);
});

test("delivery uses one POST with the token in its body and the explicit ClientID", async () => {
  const requests: Array<{ url: string; init?: RequestInit }> = [];
  const result = await deliverYandexLeadEvent(
    {
      env: validMeasurementEnv,
      explicitClientId: "987654321",
      cookieHeader: "_ym_uid=1710232430899999999",
      sourceUrl: "https://chinachild.ru/free-trial",
    },
    async (input, init) => {
      requests.push({ url: String(input), init });
      return new Response("", { status: 200 });
    },
  );

  assert.deepEqual(result, { ok: true, status: 200 });
  assert.equal(requests.length, 1);
  assert.equal(requests[0]?.url, YANDEX_MEASUREMENT_ENDPOINT);
  assert.equal(requests[0]?.init?.method, "POST");
  const body = requests[0]?.init?.body;
  assert.ok(body instanceof URLSearchParams);
  assert.equal(body.get("cid"), "987654321");
  assert.equal(body.get("t"), "event");
  assert.equal(body.get("ea"), "lead_submitted");
  assert.equal(body.get("ms"), validMeasurementEnv.YANDEX_METRIKA_MEASUREMENT_TOKEN);
  assert.doesNotMatch(requests[0]?.url ?? "", /test-token-placeholder/);
});

test("missing ClientID and missing configuration are non-fatal and make no request", async () => {
  let requestCount = 0;
  const fetchMock: typeof fetch = async () => {
    requestCount += 1;
    return new Response("", { status: 200 });
  };

  const missingClientId = await deliverYandexLeadEvent(
    { env: validMeasurementEnv },
    fetchMock,
  );
  assert.deepEqual(missingClientId, {
    ok: false,
    kind: "client_id_unavailable",
    error: "Yandex Metrica ClientID is unavailable",
  });

  const missingConfiguration = await deliverYandexLeadEvent(
    {
      env: { NEXT_PUBLIC_YM_ID: "123" },
      explicitClientId: "987654321",
    },
    fetchMock,
  );
  assert.deepEqual(missingConfiguration, {
    ok: false,
    kind: "configuration",
    error: "YANDEX_METRIKA_MEASUREMENT_TOKEN is not configured",
  });
  assert.equal(requestCount, 0);
  assert.doesNotMatch(JSON.stringify(missingConfiguration), /test-token-placeholder/);
});

test("HSK lead keeps mount-time age and details click remains a non-lead event", async () => {
  const root = process.cwd();
  const inline = await readFile(
    path.join(root, "components/hsk-test/HskTestLeadInline.tsx"),
    "utf8",
  );
  const resultPage = await readFile(
    path.join(root, "app/chinese/hsk-test/result/page.tsx"),
    "utf8",
  );
  const hskAnalytics = await readFile(
    path.join(root, "lib/hsk-test/analytics.ts"),
    "utf8",
  );
  assert.match(inline, /useState\(\(\) => Date\.now\(\)\)/);
  assert.match(inline, /form_started_at: String\(formStartedAt\)/);
  assert.doesNotMatch(inline, /form_started_at: String\(Date\.now\(\)\)/);
  assert.match(inline, /isPersistedLeadResponse\(data\)/);
  assert.match(inline, /yandex_client_id: getCachedYandexClientId\(\)/);
  assert.doesNotMatch(inline, /HskTestGoals\.lead/);
  assert.match(resultPage, /HskTestGoals\.detailsClicked/);
  assert.doesNotMatch(resultPage, /HskTestGoals\.lead|hsk_test_lead/);
  assert.match(
    hskAnalytics,
    /detailsClicked:[\s\S]*trackHskTest\("details_clicked"/,
  );
  assert.doesNotMatch(hskAnalytics, /hsk_test_lead/);
});

test("both lead forms use the shared ClientID helper and one persisted-only server schedule", async () => {
  const root = process.cwd();
  const sharedForm = await readFile(
    path.join(root, "components/forms/LeadForm.tsx"),
    "utf8",
  );
  const hskForm = await readFile(
    path.join(root, "components/hsk-test/HskTestLeadInline.tsx"),
    "utf8",
  );
  const contactRoute = await readFile(
    path.join(root, "app/api/contact/route.ts"),
    "utf8",
  );

  for (const form of [sharedForm, hskForm]) {
    assert.match(form, /startYandexClientIdCapture/);
    assert.match(form, /yandex_client_id: getCachedYandexClientId\(\)/);
    assert.match(form, /isPersistedLeadResponse\(data\)/);
    assert.equal(form.match(/fetch\("\/api\/contact"/g)?.length, 1);
    assert.ok(
      form.indexOf("isPersistedLeadResponse(data)") <
        form.indexOf("trackLeadSubmitted({"),
    );
  }

  const spamResponse = contactRoute.indexOf("accepted: false, persisted: false");
  const storeCall = contactRoute.indexOf("const stored = await storeLead");
  const storeFailure = contactRoute.indexOf("if (!stored.ok)");
  const schedule = contactRoute.indexOf("after(async () =>");
  const successResponse = contactRoute.indexOf("accepted: true,");
  assert.ok(spamResponse >= 0 && spamResponse < storeCall);
  assert.ok(storeFailure >= 0 && storeFailure < schedule);
  assert.ok(schedule < successResponse);
  assert.equal(contactRoute.match(/after\(async \(\) =>/g)?.length, 1);
  assert.match(contactRoute, /explicitClientId: body\.yandex_client_id/);
  assert.match(contactRoute, /accepted: false, persisted: false/);
  assert.doesNotMatch(contactRoute, /void trackServerLead/);
});

test("repository-controlled lead code contains no obsolete or duplicate Yandex mechanism", async () => {
  const root = process.cwd();
  const files = await Promise.all(
    [
      "lib/analytics.ts",
      "lib/analytics/yandex-metrika-measurement-request.ts",
      "lib/analytics/yandex-metrika-server.ts",
      "app/api/contact/route.ts",
      "components/forms/LeadForm.tsx",
      "components/hsk-test/HskTestLeadInline.tsx",
    ].map((file) => readFile(path.join(root, file), "utf8")),
  );
  const source = files.join("\n");
  assert.doesNotMatch(source, /SERVER_LEAD_GOAL_PATH|\/lead-success\/server/);
  assert.doesNotMatch(
    trackLeadSubmitted.toString(),
    /reachGoal|window\.ym|dataLayer/,
  );
});
