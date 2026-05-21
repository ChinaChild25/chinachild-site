"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import RadarChart from "@/components/diagnostic/RadarChart";
import ShareCard from "@/components/diagnostic/ShareCard";
import { useDiagnostic } from "@/lib/diagnostic/state";
import { ARCHETYPES } from "@/lib/diagnostic/archetypes";
import { SITE_URL } from "@/lib/site-config";

export default function SharePage() {
  const router = useRouter();
  const { state, hydrated } = useDiagnostic();

  useEffect(() => {
    if (!hydrated) return;
    if (!state.result) router.replace("/diagnostic");
  }, [hydrated, state.result, router]);

  if (!hydrated || !state.result) {
    return <main className="d-shell-narrow"><div className="d-small">Загружаю…</div></main>;
  }

  const result = state.result;
  const archetype = ARCHETYPES[result.archetype];

  return (
    <main className="d-shell-narrow">
      <Link href="/diagnostic/result" className="d-btn-ghost" style={{ marginBottom: 22, display: "inline-flex" }}>
        ← К результату
      </Link>

      <h1 className="d-h2">Поделиться результатом</h1>
      <p className="d-lead" style={{ marginTop: 14 }}>
        Карточка готова для Instagram-сториз и Telegram. Скачайте подходящий формат.
      </p>

      <section className="d-card d-card-neutral" style={{ marginTop: 28 }}>
        <span className="d-small">Превью</span>
        <div style={{ marginTop: 16, display: "grid", placeItems: "center" }}>
          <div
            style={{
              width: "100%",
              maxWidth: 360,
              aspectRatio: "1 / 1",
              background: "#f5f0e8",
              borderRadius: 24,
              padding: 28,
              border: "1px solid var(--d-line)",
              display: "grid",
              gridTemplateRows: "auto 1fr auto",
              gap: 16,
              textAlign: "center",
            }}
          >
            <div>
              <div className="d-zh" style={{ fontSize: "2rem", fontWeight: 400, letterSpacing: "-0.02em" }}>
                {archetype.zh}
              </div>
              <div className="d-small" style={{ marginTop: 4 }}>{archetype.ru}</div>
            </div>
            <div style={{ display: "grid", placeItems: "center" }}>
              <RadarChart skills={result.skills} size={240} />
            </div>
            <div className="d-small">HSK {result.hsk} · сильнее {result.percentileVsCohort}%</div>
          </div>
        </div>
        <div style={{ marginTop: 22 }}>
          <ShareCard result={result} siteUrl={SITE_URL} />
        </div>
      </section>
    </main>
  );
}
