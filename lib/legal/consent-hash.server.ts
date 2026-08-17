import "server-only"

import { createHash } from "node:crypto"

import { serializeConsentPdContent } from "./consent-pd.ts"
import { serializeConsentMarketingContent } from "./consent-marketing.ts"

/** SHA-256 (hex) of the exact canonical PD-consent content — proves WHAT was accepted, not just which version string. */
export function getConsentPdContentHash(): string {
  return createHash("sha256").update(serializeConsentPdContent()).digest("hex")
}

/** SHA-256 (hex) of the exact canonical advertising-consent content shown alongside the lead form. */
export function getConsentMarketingContentHash(): string {
  return createHash("sha256").update(serializeConsentMarketingContent()).digest("hex")
}
