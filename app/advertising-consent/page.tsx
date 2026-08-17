import type { Metadata } from "next";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { buildMetadata } from "@/lib/metadata";
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_TEL, SITE_URL } from "@/lib/site-config";
import {
  CONSENT_MARKETING_PATH,
  CONSENT_MARKETING_SECTIONS,
  CONSENT_MARKETING_VERSION,
} from "@/lib/legal/consent-marketing";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Согласие на получение рекламных сообщений | ChinaChild",
    description:
      "Отдельное и добровольное согласие на получение рекламных сообщений о курсах и специальных предложениях ChinaChild.",
    path: CONSENT_MARKETING_PATH,
  });
}

export default function AdvertisingConsentPage() {
  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Согласие на получение рекламных сообщений", path: CONSENT_MARKETING_PATH },
        ]}
      />
      <section className="page-shell section-space pt-10">
        <div className="mx-auto max-w-3xl">
          <span className="tag-pill">Legal</span>
          <h1 className="mt-6 text-[2rem] font-semibold leading-[1.08] tracking-[-0.035em] text-[#1b1b1b] sm:text-[2.6rem]">
            Согласие на получение рекламных сообщений
          </h1>
          <div className="prose-article mt-8">
            <p>
              Редакция {CONSENT_MARKETING_VERSION}. Текущая версия доступна по адресу:{" "}
              <a href={`${SITE_URL}${CONSENT_MARKETING_PATH}`}>
                {SITE_URL}{CONSENT_MARKETING_PATH}
              </a>
              . Это согласие необязательное и не связано с{" "}
              <a href="/consent-personal-data">согласием на обработку персональных данных</a> или{" "}
              <a href="/privacy-policy">Политикой конфиденциальности</a>: отказ от него никак не
              влияет на обработку заявки, проведение пробного занятия или организацию обучения.
            </p>

            {CONSENT_MARKETING_SECTIONS.map((section, index) => (
              <div key={section.id}>
                <h2 id={section.id}>
                  {index + 1}. {section.title}
                </h2>
                {section.paragraphs.map((paragraph, pIndex) => (
                  <p key={pIndex}>{paragraph}</p>
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
      </section>
    </main>
  );
}
