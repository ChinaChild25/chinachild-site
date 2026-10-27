import { createHash } from "node:crypto";
import { getClient } from "@/lib/leads/store";
import { hashIp, checkRateLimit } from "@/lib/leads/rate-limit";
import { validSubmissionId } from "@/lib/leads/submission-identity";

export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const expected = new URL(request.url).origin;
  if (origin !== expected || !request.headers.get("content-type")?.startsWith("application/json")) return Response.json({ ok: false }, { status: 403 });
  if (Number(request.headers.get("content-length") || 0) > 8192) return Response.json({ ok: false }, { status: 413 });
  const reader = request.body?.getReader();
  if (!reader) return Response.json({ ok: false }, { status: 400 });
  const decoder = new TextDecoder();
  let text = "";
  let size = 0;
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      size += chunk.value.byteLength;
      if (size > 8192) { await reader.cancel(); return Response.json({ ok: false }, { status: 413 }); }
      text += decoder.decode(chunk.value, { stream: true });
    }
    text += decoder.decode();
  } catch { return Response.json({ ok: false }, { status: 400 }); }
  let events: Array<{ id: string; token: string; createdAt: number }>;
  try {
    const input = JSON.parse(text);
    if (!Array.isArray(input.events) || !input.events.length || input.events.length > 25) throw new Error();
    events = input.events;
    if (events.some(v => !v || !validSubmissionId(v.id) || !/^[0-9a-f]{64}$/.test(v.token) || !Number.isFinite(v.createdAt) || v.createdAt <= 0 || v.createdAt > Date.now()+300_000)) throw new Error();
  } catch { return Response.json({ ok: false }, { status: 400 }); }
  const limit = await checkRateLimit(hashIp(`withdrawal:${request.headers.get("x-forwarded-for")?.split(",")[0] || "unknown"}`), 30);
  if (!limit.allowed) return Response.json({ ok: false }, { status: 429 });
  const client = getClient();
  if (!client) return Response.json({ ok: false }, { status: 503 });
  try {
    for (const event of events) {
      if (event.createdAt + (12 * 60 + 5) * 60_000 <= Date.now()) continue;
      const result = await client.rpc("withdraw_lead_measurement", {
        p_lead_id: event.id, p_token_hash: createHash("sha256").update(event.token).digest("hex"),
        p_expires_at: new Date(event.createdAt + (12 * 60 + 5) * 60_000).toISOString(),
      });
      if (result.error) throw new Error("Withdrawal persistence failed");
      if (result.data !== true) return Response.json({ ok: false }, { status: 403 });
    }
    return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
  } catch { return Response.json({ ok: false }, { status: 503 }); }
}
