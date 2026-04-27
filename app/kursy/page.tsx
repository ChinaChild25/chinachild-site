import type { Metadata } from "next";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageHero from "@/components/layout/PageHero";
import CoursesSection from "@/components/sections/CoursesSection";
import FAQSection from "@/components/sections/FAQSection";
import PricingSection from "@/components/sections/PricingSection";
import { buildMetadata } from "@/lib/metadata";
import { REGISTER_URL } from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Курсы китайского языка онлайн | ChinaChild",
    description:
      "Курсы китайского языка онлайн для детей, подростков, взрослых и корпоративных команд. Индивидуально, мини-группы и интенсивы в ChinaChild.",
    path: "/kursy",
    keywords: [
      "курсы китайского языка онлайн",
      "китайский для детей",
      "китайский для взрослых",
      "подготовка к HSK",
    ],
  });
}

export default function CoursesPage() {
  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Курсы", path: "/kursy" },
        ]}
      />
      <PageHero
        eyebrow="Курсы"
        title="Курсы китайского языка онлайн в ChinaChild"
        description="Все направления в одном месте: дети, подростки, взрослые и команды. Подбираем формат под уровень и темп — мини-группа, индивидуально или интенсив."
        primaryCta={{ label: "Записаться", href: REGISTER_URL, external: true }}
        secondaryCta={{ label: "Цены", href: "#tseny" }}
      />
      <CoursesSection />
      <PricingSection />
      <FAQSection />
    </main>
  );
}
