"use client";

import Courses from "@/components/sections/Courses";
import FAQ from "@/components/sections/FAQ";
import Section from "@/components/ui/section";
import { organizationSchema, faqSchema } from "@/lib/schema";

export default function Home() {
  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "60px 20px" }}>
      
      {/* JSON-LD SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            faqSchema([
              {
                q: "Сколько стоит обучение?",
                a: "От 990₽ за занятие",
              },
              {
                q: "Есть ли пробный урок?",
                a: "Да, первый урок бесплатный",
              },
            ])
          ),
        }}
      />

      {/* HERO */}
      <section>
        <h1 style={{ fontSize: 56, fontWeight: 800 }}>
          Китайский язык онлайн
        </h1>

        <p style={{ color: "#666", marginTop: 16 }}>
          Обучение для детей и взрослых с HSK преподавателями
        </p>
      </section>

      {/* COURSES */}
      <Courses />

      {/* WHY */}
      <Section title="Почему ChinaChild">
        <ul>
          <li>HSK 5–6 преподаватели</li>
          <li>Онлайн 1-на-1</li>
          <li>AI практика языка</li>
        </ul>
      </Section>

      {/* FAQ */}
      <FAQ />

    </main>
  );
}
