import type { Metadata } from "next";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import LeadModal from "@/components/forms/LeadModal";
import PageHero from "@/components/layout/PageHero";
import { buttonStyles } from "@/components/ui/button";
import { buildMetadata } from "@/lib/metadata";
import {
  absoluteUrl,
  LICENSE_DETAILS,
  LICENSE_PROGRAM,
  LICENSE_REGION,
  LICENSEE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site-config";

export const metadata: Metadata = buildMetadata({
  title: "Образовательная лицензия ChinaChild — Москва, программа HSK 1–2",
  description: `Образовательная лицензия № ${LICENSE_DETAILS.registrationNumber}, выданная ${LICENSE_REGION} от ${LICENSE_DETAILS.issueDate}. Право на налоговый вычет 13% — до 15 600 ₽ в год.`,
  path: "/license",
  keywords: [
    "лицензия школы китайского",
    "ChinaChild лицензия",
    "налоговый вычет за обучение китайскому",
    "лицензированные курсы китайского",
    LICENSE_DETAILS.registrationNumber,
  ],
});

const licenseGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOccupationalCredential",
      "@id": `${SITE_URL}/license#credential`,
      name: `Образовательная лицензия № ${LICENSE_DETAILS.registrationNumber}`,
      description: `Лицензия на ведение образовательной деятельности по программе дополнительного профессионального образования "${LICENSE_PROGRAM}". Регистрационный № ${LICENSE_DETAILS.registrationNumber}, выдана ${LICENSE_DETAILS.issueDate}.`,
      credentialCategory: "license",
      educationalLevel: "Дополнительное профессиональное образование",
      identifier: LICENSE_DETAILS.registrationNumber,
      dateCreated: LICENSE_DETAILS.issueDate,
      url: absoluteUrl("/license"),
      recognizedBy: {
        "@type": "GovernmentOrganization",
        name: LICENSE_REGION,
        address: LICENSE_DETAILS.issuerAddress,
        telephone: LICENSE_DETAILS.issuerPhone,
        identifier: [
          { "@type": "PropertyValue", propertyID: "ОГРН", value: LICENSE_DETAILS.issuerOgrn },
          { "@type": "PropertyValue", propertyID: "ИНН", value: LICENSE_DETAILS.issuerInn },
          { "@type": "PropertyValue", propertyID: "КПП", value: LICENSE_DETAILS.issuerKpp },
          { "@type": "PropertyValue", propertyID: "ОКПО", value: LICENSE_DETAILS.issuerOkpo },
        ],
      },
      about: {
        "@type": "EducationalOrganization",
        name: SITE_NAME,
        legalName: LICENSEE.legalName,
        url: SITE_URL,
        identifier: [
          { "@type": "PropertyValue", propertyID: "ИНН", value: LICENSEE.inn },
        ],
        address: LICENSEE.address,
      },
    },
  ],
};

export default function LicensePage() {
  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Лицензия", path: "/license" },
        ]}
      />
      <JsonLd data={licenseGraph} id="license-credential" />

      <PageHero
        eyebrow="Документы"
        title="Образовательная лицензия ChinaChild"
        description={`Лицензия № ${LICENSE_DETAILS.registrationNumber} выдана ${LICENSE_REGION} от ${LICENSE_DETAILS.issueDate}. Программа дополнительного профессионального образования «${LICENSE_PROGRAM}». Даёт ученикам право на налоговый вычет 13% — до 15 600 ₽ в год.`}
        primaryCta={{ label: "Записаться на пробное", modal: true }}
        secondaryCta={{ label: "О школе", href: "/about" }}
      />

      <section className="page-shell-wide section-space">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="card-block card-block-lg card-cream-soft">
            <h2 className="text-[1.5rem] font-medium tracking-[-0.01em] text-[#1a1a1a] leading-[1.2]">
              Что даёт лицензия
            </h2>
            <ul className="mt-6 grid gap-4 text-base leading-[1.6] text-[#4b4b4b]">
              <li>
                <strong className="text-[#1a1a1a]">Документ об обучении.</strong> По итогам
                курса выдаём документ о прохождении программы дополнительного
                профессионального образования.
              </li>
              <li>
                <strong className="text-[#1a1a1a]">Налоговый вычет 13%.</strong> Возвращаете
                до 15 600 ₽ в год через личный кабинет ФНС или работодателя — социальный
                налоговый вычет за обучение, ст. 219 НК РФ.
              </li>
              <li>
                <strong className="text-[#1a1a1a]">Государственный надзор.</strong>{" "}
                {LICENSE_REGION} периодически проверяет качество программы — это гарантия
                для ученика и родителя.
              </li>
            </ul>
          </div>

          {/* Image placeholder — replace /public/license/license-scan.webp
              with the real licence scan (1200×800, центрировать документ).
              Если файл не положен, рендерится цветная заглушка. */}
          <div className="card-block bg-white flex items-center justify-center min-h-[400px] relative overflow-hidden">
            <div className="text-center px-6">
              <div className="text-xs font-medium uppercase tracking-[0.16em] text-[#9a9a9a]">
                Скан лицензии
              </div>
              <div className="mt-3 text-sm text-[#6b6b6b] max-w-xs mx-auto leading-[1.55]">
                Положите файл{" "}
                <code className="rounded bg-[rgba(0,0,0,0.05)] px-1.5 py-0.5 text-xs">
                  /public/license/license-scan.webp
                </code>{" "}
                и раскомментируйте <code>{"<Image />"}</code> в{" "}
                <code className="rounded bg-[rgba(0,0,0,0.05)] px-1.5 py-0.5 text-xs">
                  app/license/page.tsx
                </code>
              </div>
            </div>
            {/*
              <Image
                src="/license/license-scan.webp"
                alt="Скан образовательной лицензии ChinaChild, выданной Департаментом образования и науки города Москвы"
                width={1200}
                height={800}
                className="object-contain w-full h-full"
                priority
              />
            */}
          </div>
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <div className="card-block card-block-lg card-cream">
          <h2 className="text-[1.5rem] font-medium tracking-[-0.01em] text-[#1a1a1a] leading-[1.2] sm:text-[1.75rem]">
            Реквизиты лицензии
          </h2>
          <p className="mt-4 text-sm leading-[1.6] text-[#1a1a1a]/70">
            Запись о предоставлении лицензии внесена в реестр лицензий на осуществление
            образовательной деятельности.
          </p>
          <dl className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2 text-sm leading-[1.55] text-[#1a1a1a]">
            <div>
              <dt className="text-xs uppercase tracking-[0.08em] text-[#1a1a1a]/55">
                Регистрационный номер
              </dt>
              <dd className="mt-1.5 font-medium">{LICENSE_DETAILS.registrationNumber}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.08em] text-[#1a1a1a]/55">
                Дата выдачи
              </dt>
              <dd className="mt-1.5 font-medium">18 декабря 2025 г.</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.08em] text-[#1a1a1a]/55">
                Уведомление № исх.
              </dt>
              <dd className="mt-1.5 font-medium">{LICENSE_DETAILS.outgoingNumber}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-[0.08em] text-[#1a1a1a]/55">
                Программа
              </dt>
              <dd className="mt-1.5 font-medium">{LICENSE_PROGRAM}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs uppercase tracking-[0.08em] text-[#1a1a1a]/55">
                Лицензирующий орган
              </dt>
              <dd className="mt-1.5">
                <div className="font-medium">{LICENSE_DETAILS.issuer}</div>
                <div className="mt-1 text-[#1a1a1a]/70">{LICENSE_DETAILS.issuerAddress}</div>
                <div className="mt-1 text-[#1a1a1a]/70">
                  Тел.: {LICENSE_DETAILS.issuerPhone} · Факс: {LICENSE_DETAILS.issuerFax}
                </div>
                <div className="mt-1 text-[#1a1a1a]/70">
                  ОГРН {LICENSE_DETAILS.issuerOgrn} · ИНН {LICENSE_DETAILS.issuerInn} ·
                  КПП {LICENSE_DETAILS.issuerKpp} · ОКПО {LICENSE_DETAILS.issuerOkpo}
                </div>
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs uppercase tracking-[0.08em] text-[#1a1a1a]/55">
                Лицензиат
              </dt>
              <dd className="mt-1.5">
                <div className="font-medium">{LICENSEE.legalName}</div>
                <div className="mt-1 text-[#1a1a1a]/70">ИНН {LICENSEE.inn}</div>
                <div className="mt-1 text-[#1a1a1a]/70">{LICENSEE.address}</div>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <div className="card-block card-block-lg card-violet">
          <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] text-[#1a1a1a] leading-[1.15] sm:text-[2rem]">
            Как получить налоговый вычет 13%
          </h2>
          <ol className="mt-6 grid gap-4 text-base leading-[1.6] text-[#1a1a1a]/85">
            <li>
              <strong className="text-[#1a1a1a]">1. Сохраните договор и квитанции об оплате.</strong>{" "}
              По запросу пришлём электронные копии — на email, указанный в заявке.
            </li>
            <li>
              <strong className="text-[#1a1a1a]">2. Подайте декларацию 3-НДФЛ в ФНС.</strong>{" "}
              Через личный кабинет налогоплательщика на nalog.gov.ru или у работодателя.
            </li>
            <li>
              <strong className="text-[#1a1a1a]">3. Получите возврат.</strong>{" "}
              13% от стоимости обучения, до 15 600 ₽ в год — поступают на ваш счёт.
            </li>
          </ol>
          <div className="mt-8 flex flex-wrap gap-3">
            <LeadModal
              triggerClassName={buttonStyles({ size: "large" })}
              source="license-cta"
            >
              Записаться на пробное
            </LeadModal>
          </div>
        </div>
      </section>
    </main>
  );
}
