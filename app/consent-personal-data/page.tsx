import type { Metadata } from "next";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import { buildMetadata } from "@/lib/metadata";
import { CONTACT_EMAIL, CONTACT_PHONE, CONTACT_PHONE_TEL, SITE_URL } from "@/lib/site-config";
import { CONSENT_PD_PATH, CONSENT_PD_SECTIONS, CONSENT_PD_VERSION } from "@/lib/legal/consent-pd";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Согласие на обработку персональных данных | ChinaChild",
    description:
      "Согласие на обработку персональных данных при подаче заявки, проведении пробного занятия и организации обучения в ChinaChild.",
    path: CONSENT_PD_PATH,
  });
}

export default function ConsentPersonalDataPage() {
  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Согласие на обработку персональных данных", path: CONSENT_PD_PATH },
        ]}
      />
      <section className="page-shell section-space pt-10">
        <div className="mx-auto max-w-3xl">
          <span className="tag-pill">Legal</span>
          <h1 className="mt-6 text-[2rem] font-semibold leading-[1.08] tracking-[-0.035em] text-[#1b1b1b] sm:text-[2.6rem]">
            Согласие на обработку персональных данных
          </h1>
          <div className="prose-article mt-8">
            <p>
              Редакция {CONSENT_PD_VERSION}. Текущая версия доступна по адресу:{" "}
              <a href={`${SITE_URL}${CONSENT_PD_PATH}`}>{SITE_URL}{CONSENT_PD_PATH}</a>. Это
              согласие отдельно от{" "}
              <a href="/privacy-policy">Политики конфиденциальности</a> и от{" "}
              <a href="/advertising-consent">согласия на получение рекламных сообщений</a>.
            </p>

            <h2>В этой статье</h2>
            <ul>
              {CONSENT_PD_SECTIONS.map((section, index) => (
                <li key={section.id}>
                  <a href={`#${section.id}`}>
                    {index + 1}. {section.title}
                  </a>
                </li>
              ))}
            </ul>

            {CONSENT_PD_SECTIONS.map((section, index) => (
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
