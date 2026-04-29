import type { Metadata } from "next";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import JsonLd from "@/components/seo/JsonLd";
import LeadModal from "@/components/forms/LeadModal";
import PageHero from "@/components/layout/PageHero";
import { buttonStyles } from "@/components/ui/button";
import { buildMetadata } from "@/lib/metadata";
import {
  absoluteUrl,
  LICENSE_PROGRAM,
  LICENSE_REGION,
  SITE_NAME,
  SITE_URL,
} from "@/lib/site-config";

export const metadata: Metadata = buildMetadata({
  title: "Образовательная лицензия ChinaChild — Москва, программа HSK 1–2",
  description:
    "Образовательная лицензия ChinaChild выдана Департаментом образования и науки города Москвы на программу HSK 1–2. Лицензия даёт право на налоговый вычет 13% — до 15 600 ₽ в год.",
  path: "/license",
  keywords: [
    "лицензия школы китайского",
    "ChinaChild лицензия",
    "налоговый вычет за обучение китайскому",
    "лицензированные курсы китайского",
  ],
});

const licenseGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "EducationalOccupationalCredential",
      "@id": `${SITE_URL}/license#credential`,
      name: `Образовательная лицензия — ${LICENSE_PROGRAM}`,
      description: `Лицензия на ведение образовательной деятельности по программе дополнительного профессионального образования "${LICENSE_PROGRAM}".`,
      credentialCategory: "license",
      educationalLevel: "Дополнительное профессиональное образование",
      url: absoluteUrl("/license"),
      recognizedBy: {
        "@type": "GovernmentOrganization",
        name: LICENSE_REGION,
      },
      about: {
        "@type": "EducationalOrganization",
        name: SITE_NAME,
        url: SITE_URL,
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
        description={`Лицензия на ведение образовательной деятельности выдана ${LICENSE_REGION}. Программа: ${LICENSE_PROGRAM}. Лицензия даёт ученикам право на налоговый вычет 13% — до 15 600 ₽ в год.`}
        primaryCta={{ label: "Записаться на пробное", modal: true }}
        secondaryCta={{ label: "О школе", href: "/about" }}
      />

      <section className="page-shell-wide section-space">
        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="card-block card-block-lg card-cream-soft">
            <h2 className="text-2xl font-bold tracking-[-0.03em] text-[#1b1b1b]">
              Что даёт лицензия
            </h2>
            <ul className="mt-6 grid gap-4 text-base leading-7 text-[#4b4b4b]">
              <li>
                <strong className="text-[#1b1b1b]">Документ об обучении.</strong> По итогам
                курса выдаём документ о прохождении программы дополнительного
                профессионального образования.
              </li>
              <li>
                <strong className="text-[#1b1b1b]">Налоговый вычет 13%.</strong> Возвращаете
                до 15 600 ₽ в год через личный кабинет ФНС или работодателя — Lump-sum
                deduction за обучение, разрешённый ст. 219 НК РФ.
              </li>
              <li>
                <strong className="text-[#1b1b1b]">Государственный надзор.</strong>{" "}
                {LICENSE_REGION} периодически проверяет качество программы — это гарантия
                для ученика и родителя.
              </li>
            </ul>
          </div>

          {/* Image placeholder — replace /public/license/license-scan.webp
              with the real licence scan (1200×800, центрировать документ).
              Если файл не положен, рендерится цветная заглушка. */}
          <div className="card-block bg-white border border-[rgba(0,0,0,0.08)] flex items-center justify-center min-h-[400px] relative overflow-hidden">
            <div className="text-center px-6">
              <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9a9a9a]">
                Скан лицензии
              </div>
              <div className="mt-3 text-sm text-[#6b6b6b] max-w-xs mx-auto">
                Положите файл{" "}
                <code className="rounded bg-[rgba(0,0,0,0.05)] px-1.5 py-0.5 text-xs">
                  /public/license/license-scan.webp
                </code>{" "}
                и раскомментируйте <code>{"<Image />"}</code> ниже в{" "}
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
        <div className="card-block card-block-lg card-violet">
          <h2 className="text-3xl font-bold tracking-[-0.035em] text-white sm:text-4xl">
            Как получить налоговый вычет 13%
          </h2>
          <ol className="mt-6 grid gap-4 text-base leading-7 text-white/85">
            <li>
              <strong className="text-white">1. Сохраните договор и квитанции об оплате.</strong>{" "}
              По запросу пришлём электронные копии — на email, указанный в заявке.
            </li>
            <li>
              <strong className="text-white">2. Подайте декларацию 3-НДФЛ в ФНС.</strong>{" "}
              Через личный кабинет налогоплательщика на nalog.gov.ru или у работодателя.
            </li>
            <li>
              <strong className="text-white">3. Получите возврат.</strong>{" "}
              13% от стоимости обучения, до 15 600 ₽ в год — поступают на ваш счёт.
            </li>
          </ol>
          <div className="mt-8 flex flex-wrap gap-3">
            <LeadModal
              triggerClassName={buttonStyles({ variant: "secondary", size: "large" })}
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
