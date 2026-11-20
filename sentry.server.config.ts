import * as Sentry from "@sentry/nextjs";
import { ERROR_DATA_COLLECTION, monitoringDsn, privateErrorEvent } from "./lib/monitoring/privacy.ts";

const dsn = monitoringDsn(process.env.SENTRY_ENABLED, process.env.SENTRY_DSN);
if (dsn) Sentry.init({
  dsn, defaultIntegrations: false,
  integrations: [Sentry.onUncaughtExceptionIntegration(), Sentry.onUnhandledRejectionIntegration()],
  enableOpenTelemetrySetup: false,
  enableRuntimeChannelInjection: false,
  dataCollection: ERROR_DATA_COLLECTION,
  tracesSampleRate: undefined, beforeSendLog: () => null, beforeSendMetric: () => null,
  sendClientReports: false, maxBreadcrumbs: 0,
  environment: process.env.NODE_ENV,
  release: process.env.VERCEL_GIT_COMMIT_SHA,
  beforeSend: privateErrorEvent,
});
