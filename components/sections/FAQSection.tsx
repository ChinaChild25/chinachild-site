import Reveal from "@/components/ui/Reveal";
import SectionShell from "@/components/ui/SectionShell";
import { faqs, type FaqItem } from "@/lib/site-data";

type FAQSectionProps = {
  id?: string;
  title?: string;
  description?: string;
  items?: FaqItem[];
  schemaId?: string;
};

export default function FAQSection({
  id = "faq",
  title = "Отвечаем на вопросы",
  description,
  items = faqs,
}: FAQSectionProps) {
  const resolvedDescription =
    description ??
    (items === faqs && title === "Отвечаем на вопросы"
      ? "Если не нашли свой вопрос — напишите, и мы ответим лично в течение рабочего дня."
      : undefined);

  return (
    <SectionShell
      id={id}
      title={title}
      description={resolvedDescription}
    >
      <div className="faq-card">
        {items.map((item) => (
          <Reveal key={item.question}>
            <details className="faq-row">
              <summary className="faq-summary" data-speakable>
                <span className="faq-question">
                  {item.question}
                </span>
                <svg
                  aria-hidden
                  className="faq-icon-plus"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
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
                  aria-hidden
                  className="faq-icon-close"
                  width="20"
                  height="20"
                  viewBox="0 0 20 20"
                  focusable="false"
                >
                  <path
                    d="M5 5 L15 15 M15 5 L5 15"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinecap="round"
                  />
                </svg>
              </summary>
              <div className="faq-answer-wrap">
                <p className="faq-answer" data-speakable>
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
