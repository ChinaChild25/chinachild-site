import JsonLd from "@/components/seo/JsonLd";
import { createFaqSchema } from "@/lib/schema";
import type { FaqEntry } from "@/lib/blog";

type ArticleFaqProps = {
  items: FaqEntry[];
  title?: string;
  description?: string;
  jsonLd?: boolean;
  schemaId?: string;
};

/** In-article FAQ rendered with the site's existing .faq-card / .faq-row
 *  styling. Mirrors the visual contract of <FAQSection>, but skips the wide
 *  SectionShell so it sits flush inside the 768px article column. */
export default function ArticleFaq({
  items,
  title = "Отвечаем на вопросы",
  description,
  jsonLd = true,
  schemaId,
}: ArticleFaqProps) {
  if (items.length === 0) return null;

  return (
    <section
      className="article-faq"
      data-block="faq"
      aria-label={title}
    >
      <header className="article-faq__head">
        {title ? <h2 className="article-faq__title">{title}</h2> : null}
        {description ? (
          <p className="article-faq__description">{description}</p>
        ) : null}
      </header>
      {jsonLd ? (
        <JsonLd
          data={createFaqSchema(items)}
          id={schemaId ?? "article-faq-schema"}
        />
      ) : null}
      <div className="faq-card article-faq__card">
        {items.map((item) => (
          <details key={item.question} className="faq-row">
            <summary className="faq-summary" data-speakable>
              <span className="faq-question">{item.question}</span>
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
        ))}
      </div>
    </section>
  );
}
