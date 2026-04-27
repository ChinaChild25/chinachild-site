import JsonLd from "@/components/seo/JsonLd";
import Reveal from "@/components/ui/Reveal";
import SectionShell from "@/components/ui/SectionShell";
import { createFaqSchema } from "@/lib/schema";
import { faqs } from "@/lib/site-data";

export default function FAQSection() {
  return (
    <SectionShell
      id="faq"
      label="FAQ"
      title="Частые вопросы про онлайн-обучение китайскому"
      description="FAQ закрывает реальные возражения пользователей и добавляет FAQPage schema для расширенных сниппетов в поиске."
    >
      {/* FAQPage schema is intentionally colocated with the visible questions. */}
      <JsonLd data={createFaqSchema(faqs)} id="faq-schema" />
      <div className="grid gap-4">
        {faqs.map((item) => (
          <Reveal key={item.question}>
            <details className="surface-card rounded-[26px] p-6">
              <summary className="cursor-pointer list-none text-lg font-extrabold tracking-[-0.03em] text-[#1A1A2E]">
                {item.question}
              </summary>
              <p className="mt-4 text-sm leading-7 text-[#4B5563]">{item.answer}</p>
            </details>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
