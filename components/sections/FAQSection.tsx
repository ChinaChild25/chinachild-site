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
      {/* Microdata FAQPage — duplicates JSON-LD for Yandex */}
      <div
        className="mx-auto max-w-3xl divide-y divide-[rgba(0,0,0,0.08)] border-y border-[rgba(0,0,0,0.08)]"
        itemScope
        itemType="https://schema.org/FAQPage"
      >
        {faqs.map((item) => (
          <Reveal key={item.question}>
            <details
              className="group py-6"
              itemScope
              itemProp="mainEntity"
              itemType="https://schema.org/Question"
            >
              <summary
                className="faq-question flex cursor-pointer list-none items-center justify-between gap-4 text-base font-semibold tracking-[-0.01em] text-[#1b1b1b] sm:text-lg"
                data-speakable
              >
                <span itemProp="name">{item.question}</span>
                <span
                  aria-hidden
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[rgba(0,0,0,0.12)] text-xl font-light text-[#1b1b1b] transition group-open:rotate-45"
                >
                  +
                </span>
              </summary>
              <div
                itemProp="acceptedAnswer"
                itemScope
                itemType="https://schema.org/Answer"
              >
                <p
                  className="faq-answer mt-4 text-sm leading-7 text-[#4b4b4b]"
                  itemProp="text"
                  data-speakable
                >
                  {item.answer}
                </p>
              </div>
            </details>
          </Reveal>
        ))}
      </div>
    </SectionShell>
  );
}
