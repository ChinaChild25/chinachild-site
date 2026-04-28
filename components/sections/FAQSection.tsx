import JsonLd from "@/components/seo/JsonLd";
import Reveal from "@/components/ui/Reveal";
import SectionShell from "@/components/ui/SectionShell";
import { createFaqSchema } from "@/lib/schema";
import { faqs } from "@/lib/site-data";

export default function FAQSection() {
  return (
    <SectionShell
      id="faq"
      title="Отвечаем на вопросы"
      description="Если не нашли свой вопрос — напишите, и мы ответим лично в течение рабочего дня."
    >
      <JsonLd data={createFaqSchema(faqs)} id="faq-schema" />
      <div
        className="faq-card"
        itemScope
        itemType="https://schema.org/FAQPage"
      >
        {faqs.map((item) => (
          <Reveal key={item.question}>
            <details
              className="faq-row"
              itemScope
              itemProp="mainEntity"
              itemType="https://schema.org/Question"
            >
              <summary className="faq-summary" data-speakable>
                <span className="faq-question" itemProp="name">
                  {item.question}
                </span>
                <span aria-hidden className="faq-toggle">
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    className="faq-toggle-plus"
                    focusable="false"
                  >
                    <path
                      d="M10 3.5 L10 16.5 M3.5 10 L16.5 10"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 20 20"
                    className="faq-toggle-cross"
                    focusable="false"
                  >
                    <path
                      d="M5 5 L15 15 M15 5 L5 15"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>
              </summary>
              <div
                itemProp="acceptedAnswer"
                itemScope
                itemType="https://schema.org/Answer"
                className="faq-answer-wrap"
              >
                <p className="faq-answer" itemProp="text" data-speakable>
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
