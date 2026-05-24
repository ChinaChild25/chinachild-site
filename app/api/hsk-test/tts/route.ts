import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Cache the synthesized clip aggressively — the audio for "你好" never
// changes. The s-maxage covers the CDN/Edge, immutable signals the client.
const CACHE_HEADER = "public, s-maxage=31536000, max-age=86400, immutable";

interface TtsPayload {
  text: string;
  /** OpenAI TTS voice. Defaults to a clear, neutral one. */
  voice?: "alloy" | "echo" | "fable" | "onyx" | "nova" | "shimmer";
}

/**
 * OpenAI TTS proxy for HSK-test audio questions.
 *
 * Why a server route at all? Because we don't want the OPENAI_API_KEY in
 * the browser, and we want a stable per-text cache so repeated playback
 * of the same syllable doesn't re-hit OpenAI on every render.
 *
 * Pricing: tts-1 is ~$15/M characters. A single syllable is ~5 chars, so
 * 100,000 plays ≈ $7.50. The CDN cache pins each unique text to one call.
 */
export async function POST(req: Request) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is not configured" },
      { status: 503 },
    );
  }

  let body: TtsPayload;
  try {
    body = (await req.json()) as TtsPayload;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const text = (body.text ?? "").trim();
  if (!text || text.length > 200) {
    return NextResponse.json(
      { error: "text required (1..200 chars)" },
      { status: 400 },
    );
  }
  const voice = body.voice ?? "nova";

  const upstream = await fetch("https://api.openai.com/v1/audio/speech", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "tts-1",
      voice,
      input: text,
      response_format: "mp3",
      // The model handles Mandarin natively; voice="nova" reads Chinese
      // with intelligible tones for the HSK levels 1–4 we target here.
    }),
  });

  if (!upstream.ok || !upstream.body) {
    const errText = await upstream.text().catch(() => "");
    return NextResponse.json(
      { error: `OpenAI TTS ${upstream.status}: ${errText.slice(0, 200)}` },
      { status: 502 },
    );
  }

  const audio = await upstream.arrayBuffer();
  return new Response(audio, {
    status: 200,
    headers: {
      "Content-Type": "audio/mpeg",
      "Cache-Control": CACHE_HEADER,
      "Content-Length": String(audio.byteLength),
    },
  });
}
