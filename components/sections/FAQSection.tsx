import JsonLd from "@/components/seo/JsonLd";
import Reveal from "@/components/ui/Reveal";
import SectionShell from "@/components/ui/SectionShell";
import { createFaqSchema } from "@/lib/schema";
import { faqs } from "@/lib/site-data";

export default function FAQSection() {
  return (
    <SectionShell
      id="faq"
      title="Ответы на частые вопросы"
      description="Если не нашли свой вопрос — напишите, и мы ответим лично в течение рабочего дня."
    >
      <JsonLd data={createFaqSchema(faqs)} id="faq-schema" />
      <div className="mx-auto max-w-3xl divide-y divide-[rgba(0,0,0,0.08)] border-y border-[rgba(0,0,0,0.08)]">
        {faqs.map((item) => (
          <Reveal key={item.question}>
            <details className="group py-6">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold tracking-[-0.01em] text-[#1b1b1b] sm:text-lg">
                <span>{item.question}</span>
                <span
                  aria-hidden
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[rgba(0,0,0,0.12)] text-xl font-light text-[#1b1b1b] transition group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <p className="mt-4 text-sm leading-7 text-[#4b4b4b]">{item.answer}</p>
            </details>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
