import type { Metadata } from "next";
import type { CSSProperties } from "react";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { LegalReadingShell } from "@/components/legal/legal-reading-shell";
import {
  LegalTableOfContentsDesktop,
  LegalTableOfContentsMobile,
} from "@/components/legal/legal-table-of-contents";
import {
  CAREER_CONSENT_PATH,
  CAREER_CONSENT_SECTIONS,
  CAREER_CONSENT_VERSION,
} from "@/lib/legal/career-consent";
import { buildMetadata } from "@/lib/metadata";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_TEL,
  SITE_URL,
} from "@/lib/site-config";

const TOC_ENTRIES = CAREER_CONSENT_SECTIONS.map(({ id, title }) => ({ id, title }));

export const metadata: Metadata = buildMetadata({
  title: "Согласие кандидата на обработку персональных данных",
  description:
    "Условия обработки персональных данных при отклике на вакансии ChinaChild.",
  path: CAREER_CONSENT_PATH,
});

export default function CareerConsentPage() {
  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Работа в ChinaChild", path: "/careers" },
          { name: "Согласие кандидата", path: CAREER_CONSENT_PATH },
        ]}
      />
      <LegalReadingShell
        main={
          <div className="min-w-0">
            <span className="tag-pill">Документ для кандидатов</span>
            <h1 className="mt-6 text-[2rem] font-semibold leading-[1.08] tracking-[-0.035em] text-[#1b1b1b] sm:text-[2.6rem]">
              Согласие на обработку персональных данных кандидата
            </h1>
            <div className="prose-article mt-8" style={{ zoom: "var(--legal-scale, 1)" } as CSSProperties}>
              <p>
                Редакция {CAREER_CONSENT_VERSION}. Текущая версия доступна по адресу{" "}
                <a href={`${SITE_URL}${CAREER_CONSENT_PATH}`}>
                  {SITE_URL}{CAREER_CONSENT_PATH}
                </a>
                . Согласие применяется только к откликам на вакансии и не объединяет
                кандидатов с учениками или заявками на обучение.
              </p>

              <LegalTableOfContentsMobile sections={TOC_ENTRIES} />

              {CAREER_CONSENT_SECTIONS.map((section, index) => (
                <div key={section.id}>
                  <h2 id={section.id} className="scroll-mt-24">
                    {index + 1}. {section.title}
                  </h2>
                  {section.paragraphs.map((paragraph) => (
                    <p key={paragraph}>{paragraph}</p>
                  ))}
                </div>
              ))}

              <p>
                Контакты оператора: email{" "}
                <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>, телефон{" "}
                <a href={`tel:${CONTACT_PHONE_TEL}`}>{CONTACT_PHONE}</a>.
              </p>
            </div>
          </div>
        }
        sidebar={<LegalTableOfContentsDesktop sections={TOC_ENTRIES} />}
      />
    </main>
  );
}
