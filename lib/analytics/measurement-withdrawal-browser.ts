"use client";
import { hasAnalyticsConsent } from "../attribution/browser.ts";
const KEY = "cc-measurement-withdrawal:";
const WINDOW_MS = (12 * 60 + 5) * 60_000;
type Entry = { id: string; token: string; createdAt: number; withdrawn: boolean };
let memory: Entry[] = [];
let inFlight = false;
let listening = false;
function read(): Entry[] {
  try {
    const entries: Entry[] = [];
    for (const key of Object.keys(window.localStorage).filter(k => k.startsWith(KEY)).slice(0, 100)) {
      try { const v = JSON.parse(window.localStorage.getItem(key) || "null");
        if (v && /^[0-9a-f-]{36}$/i.test(v.id) && /^[0-9a-f]{64}$/.test(v.token) && Number.isFinite(v.createdAt) && v.createdAt <= Date.now() + 300_000 && v.createdAt + WINDOW_MS > Date.now()) entries.push(v);
        else window.localStorage.removeItem(key);
      } catch { window.localStorage.removeItem(key); }
    }
    memory = [...entries, ...memory.filter(v => !entries.some(e => e.id === v.id) && v.createdAt + WINDOW_MS > Date.now())].slice(-100);
  } catch { /* memory fallback */ }
  return memory;
}
function save(entries: Entry[]) {
  memory = entries;
  for (const entry of entries) {
    try { const current = JSON.parse(window.localStorage.getItem(KEY + entry.id) || "null");
      window.localStorage.setItem(KEY + entry.id, JSON.stringify({ ...entry, withdrawn: entry.withdrawn || current?.withdrawn === true }));
    } catch { /* necessary privacy request stays in memory */ }
  }
}
function listen() {
  if (!listening && typeof window !== "undefined") { listening = true; window.addEventListener("online", () => { void flushMeasurementWithdrawals(); }); }
}
export function prepareLeadMeasurement(id: string) {
  if (!hasAnalyticsConsent()) return {};
  try { const consent = JSON.parse(window.localStorage.getItem("cookie-consent-v2") || "null"); if (consent?.analytics !== true || consent.version !== "v3") return {}; } catch { /* memory-only consent remains valid */ }
  listen(); const entries = read(); let entry = entries.find(v => v.id === id);
  if (!entry) { if (entries.length >= 100) return {}; entry = { id, token: (crypto.randomUUID() + crypto.randomUUID()).replaceAll("-", ""), createdAt: Date.now(), withdrawn: false }; save([...entries, entry]); }
  if (entry.withdrawn) return {};
  return { measurement_withdrawal_token: entry.token, measurement_created_at: entry.createdAt };
}
export function withdrawLeadMeasurements() {
  if (typeof window === "undefined") return;
  listen(); save(read().map(v => ({ ...v, withdrawn: true }))); void flushMeasurementWithdrawals();
}
/** Event-driven only: <=4 requests/100 events per invocation, one active invocation, no timers/polling. */
export async function flushMeasurementWithdrawals() {
  if (typeof window === "undefined" || inFlight) return;
  listen(); inFlight = true;
  try {
    for (let batchIndex = 0; batchIndex < 4; batchIndex++) {
      const batch = read().filter(v => v.withdrawn).slice(0, 25); if (!batch.length) break;
      const response = await fetch("/api/measurement-withdrawal", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ events: batch }), keepalive: true, signal: AbortSignal.timeout(5_000) });
      if (!response.ok) break;
      const ids = new Set(batch.map(v => v.id)); memory = memory.filter(v => !ids.has(v.id));
      for (const id of ids) { try { window.localStorage.removeItem(KEY + id); } catch { /* memory cleared */ } }
    }
  } catch { /* Privacy-action credentials survive offline; no ClientID, URL, UTM or contact data. */ }
  finally { inFlight = false; }
}
