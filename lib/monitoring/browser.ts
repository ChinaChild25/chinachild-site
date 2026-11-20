"use client";

import { hasAnalyticsConsent } from "../attribution/browser.ts";
import { ERROR_DATA_COLLECTION, monitoringDsn, privateErrorEvent } from "./privacy.ts";

let sdk: typeof import("@sentry/nextjs") | undefined;
let loading: Promise<void> | undefined;
let closing: Promise<void> | undefined;

export function syncErrorMonitoring(allowed: boolean): Promise<void> {
  if (!allowed) {
    if (sdk) closing = sdk.close(0).then(() => {}).catch(() => {});
    return closing ?? Promise.resolve();
  }
  const dsn = monitoringDsn(process.env.NEXT_PUBLIC_SENTRY_ENABLED, process.env.NEXT_PUBLIC_SENTRY_DSN);
  if (!dsn || !hasAnalyticsConsent()) return Promise.resolve();
  if (loading) return loading;
  loading = Promise.resolve(closing).then(async () => {
    if (!hasAnalyticsConsent()) return;
    const client = sdk?.getClient();
    if (client && client.getOptions().enabled !== false) return;
    const sentrySdk = await import("@sentry/nextjs");
    // Consent can be withdrawn while the optional chunk is loading.
    if (!hasAnalyticsConsent()) return;
    sdk = sentrySdk;
    sdk.init({
      dsn, defaultIntegrations: false,
      integrations: [sdk.globalHandlersIntegration(), sdk.browserApiErrorsIntegration(), sdk.dedupeIntegration()],
      dataCollection: ERROR_DATA_COLLECTION,
      tracesSampleRate: undefined, replaysSessionSampleRate: 0, replaysOnErrorSampleRate: 0,
      beforeSendLog: () => null, beforeSendMetric: () => null,
      sendClientReports: false, maxBreadcrumbs: 0,
      environment: process.env.NODE_ENV,
      beforeSend: event => hasAnalyticsConsent() ? privateErrorEvent(event) : null,
    });
  }).catch(() => { /* Monitoring cannot block the site or the consent control. */ })
    .finally(() => { loading = undefined; });
  return loading;
}

export async function captureBrowserError(error: Error): Promise<void> {
  if (!hasAnalyticsConsent()) return;
  await syncErrorMonitoring(true);
  if (hasAnalyticsConsent()) sdk?.captureException(error);
}
