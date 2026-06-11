import type { Metadata } from "next";
import Image from "next/image";
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
  LICENSE_REGION_INSTRUMENTAL,
  LICENSEE,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site-config";

export const metadata: Metadata = buildMetadata({
  title: "Образовательная лицензия ChinaChild — Москва, программа HSK 1–2",
  description: `Лицензия № ${LICENSE_DETAILS.registrationNumber} от Департамента образования Москвы. Право на налоговый вычет 13% — до 19 500 ₽ в год.`,
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
      // Сканы документа — визуальное подтверждение для E-E-A-T
      // (Google и Yandex поднимают авторитет, когда credential виден).
      image: [
        {
          "@type": "ImageObject",
          "@id": `${SITE_URL}/license#scan-main`,
          url: absoluteUrl("/license/license-scan.webp"),
          contentUrl: absoluteUrl("/license/license-scan.webp"),
          width: 800,
          height: 1132,
          caption: `Скан образовательной лицензии № ${LICENSE_DETAILS.registrationNumber}, выданной ${LICENSE_REGION_INSTRUMENTAL}`,
          inLanguage: "ru-RU",
          creditText: SITE_NAME,
          copyrightNotice: `© ${new Date().getFullYear()} ${SITE_NAME}`,
        },
        {
          "@type": "ImageObject",
          "@id": `${SITE_URL}/license#scan-app`,
          url: absoluteUrl("/license/license-app-1.webp"),
          contentUrl: absoluteUrl("/license/license-app-1.webp"),
          width: 800,
          height: 1132,
          caption: `Приложение к образовательной лицензии № ${LICENSE_DETAILS.registrationNumber} с печатью ${LICENSE_REGION}`,
          inLanguage: "ru-RU",
          creditText: SITE_NAME,
          copyrightNotice: `© ${new Date().getFullYear()} ${SITE_NAME}`,
        },
      ],
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
        description={`Лицензия № ${LICENSE_DETAILS.registrationNumber} выдана ${LICENSE_REGION_INSTRUMENTAL} от ${LICENSE_DETAILS.issueDate}. Программа дополнительного профессионального образования «${LICENSE_PROGRAM}». Даёт ученикам право на налоговый вычет 13% — до 19 500 ₽ в год.`}
        primaryCta={{ label: "Записаться на пробное", modal: true }}
        secondaryCta={{ label: "О школе", href: "/about" }}
      />

      <section className="page-shell-wide section-space">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="card-block card-block-lg card-cream-soft">
            <h2 className="text-[1.5rem] font-medium tracking-[-0.01em] text-[#262626] leading-[1.2]">
              Что даёт лицензия
            </h2>
            <ul className="mt-6 grid gap-4 text-base leading-[1.6] text-[#4b4b4b]">
              <li>
                <strong className="text-[#262626]">Документ об обучении.</strong> По итогам
                курса выдаём документ о прохождении программы дополнительного
                профессионального образования.
              </li>
              <li>
                <strong className="text-[#262626]">Налоговый вычет 13%.</strong> Возвращаете
                до 19 500 ₽ в год через личный кабинет ФНС или работодателя — социальный
                налоговый вычет за обучение, ст. 219 НК РФ.
              </li>
              <li>
                <strong className="text-[#262626]">Государственный надзор.</strong>{" "}
                {LICENSE_REGION} периодически проверяет качество программы — это гарантия
                для ученика и родителя.
              </li>
            </ul>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <figure className="card-block bg-white p-3 sm:p-4">
              <Image
                src="/license/license-scan.webp"
                alt={`Скан образовательной лицензии № ${LICENSE_DETAILS.registrationNumber}, выданной ${LICENSE_REGION_INSTRUMENTAL} от 18.12.2025 — основная страница`}
                title="Образовательная лицензия ChinaChild — основная страница"
                width={800}
                height={1132}
                sizes="(min-width: 1024px) 360px, (min-width: 768px) 50vw, 100vw"
                className="h-auto w-full rounded-[12px] object-contain"
                priority
              />
              <figcaption className="mt-3 text-xs text-[#6b6b6b] leading-[1.5]">
                Уведомление о предоставлении лицензии № {LICENSE_DETAILS.outgoingNumber}
              </figcaption>
            </figure>
            <figure className="card-block bg-white p-3 sm:p-4">
              <Image
                src="/license/license-app-1.webp"
                alt={`Приложение к образовательной лицензии № ${LICENSE_DETAILS.registrationNumber} с печатью ${LICENSE_REGION}`}
                title="Образовательная лицензия ChinaChild — приложение с печатью"
                width={800}
                height={1132}
                sizes="(min-width: 1024px) 360px, (min-width: 768px) 50vw, 100vw"
                className="h-auto w-full rounded-[12px] object-contain"
              />
              <figcaption className="mt-3 text-xs text-[#6b6b6b] leading-[1.5]">
                Приложение с печатью лицензирующего органа
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <div className="card-block card-block-lg card-cream">
          <h2 className="text-[1.5rem] font-medium tracking-[-0.01em] text-[#262626] leading-[1.2] sm:text-[1.75rem]">
            Реквизиты лицензии
          </h2>
          <p className="mt-4 text-sm leading-[1.6] text-[#262626]/70">
            Запись о предоставлении лицензии внесена в реестр лицензий на осуществление
            образовательной деятельности.
          </p>
          <dl className="mt-8 grid gap-x-8 gap-y-5 sm:grid-cols-2 text-sm leading-[1.55] text-[#262626]">
            <div>
              <dt className="text-xs tracking-[0.01em] text-[#262626]/55">
                Регистрационный номер
              </dt>
              <dd className="mt-1.5 font-medium">{LICENSE_DETAILS.registrationNumber}</dd>
            </div>
            <div>
              <dt className="text-xs tracking-[0.01em] text-[#262626]/55">
                Дата выдачи
              </dt>
              <dd className="mt-1.5 font-medium">18 декабря 2025 г.</dd>
            </div>
            <div>
              <dt className="text-xs tracking-[0.01em] text-[#262626]/55">
                Уведомление № исх.
              </dt>
              <dd className="mt-1.5 font-medium">{LICENSE_DETAILS.outgoingNumber}</dd>
            </div>
            <div>
              <dt className="text-xs tracking-[0.01em] text-[#262626]/55">
                Программа
              </dt>
              <dd className="mt-1.5 font-medium">{LICENSE_PROGRAM}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs tracking-[0.01em] text-[#262626]/55">
                Лицензирующий орган
              </dt>
              <dd className="mt-1.5">
                <div className="font-medium">{LICENSE_DETAILS.issuer}</div>
                <div className="mt-1 text-[#262626]/70">{LICENSE_DETAILS.issuerAddress}</div>
                <div className="mt-1 text-[#262626]/70">
                  Тел.: {LICENSE_DETAILS.issuerPhone} · Факс: {LICENSE_DETAILS.issuerFax}
                </div>
                <div className="mt-1 text-[#262626]/70">
                  ОГРН {LICENSE_DETAILS.issuerOgrn} · ИНН {LICENSE_DETAILS.issuerInn} ·
                  КПП {LICENSE_DETAILS.issuerKpp} · ОКПО {LICENSE_DETAILS.issuerOkpo}
                </div>
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-xs tracking-[0.01em] text-[#262626]/55">
                Лицензиат
              </dt>
              <dd className="mt-1.5">
                <div className="font-medium">{LICENSEE.legalName}</div>
                <div className="mt-1 text-[#262626]/70">ИНН {LICENSEE.inn}</div>
                <div className="mt-1 text-[#262626]/70">{LICENSEE.address}</div>
              </dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="page-shell-wide section-space">
        <div className="card-block card-block-lg card-violet">
          <h2 className="text-[1.75rem] font-normal tracking-[-0.02em] text-[#262626] leading-[1.15] sm:text-[2rem]">
            Как получить налоговый вычет 13%
          </h2>
          <ol className="mt-6 grid gap-4 text-base leading-[1.6] text-[#262626]/85">
            <li>
              <strong className="text-[#262626]">1. Сохраните договор и квитанции об оплате.</strong>{" "}
              По запросу пришлём электронные копии — на email, указанный в заявке.
            </li>
            <li>
              <strong className="text-[#262626]">2. Подайте декларацию 3-НДФЛ в ФНС.</strong>{" "}
              Через личный кабинет налогоплательщика на nalog.gov.ru или у работодателя.
            </li>
            <li>
              <strong className="text-[#262626]">3. Получите возврат.</strong>{" "}
              13% от стоимости обучения, до 19 500 ₽ в год — поступают на ваш счёт.
            </li>
          </ol>
          <div className="mt-8 flex flex-wrap gap-3">
            <LeadModal
              triggerClassName={buttonStyles({ size: "large" })}
              source="license-cta"
              suppressFloatingCta
            >
              Записаться на пробное
            </LeadModal>
          </div>
        </div>
      </section>
    </main>
  );
}
