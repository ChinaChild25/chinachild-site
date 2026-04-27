import type { Metadata } from "next";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import CoursesSection from "@/components/sections/CoursesSection";
import FAQSection from "@/components/sections/FAQSection";
import PricingSection from "@/components/sections/PricingSection";
import { buildMetadata } from "@/lib/metadata";

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
      <section className="page-shell section-space pt-8">
        <span className="section-label">Курсы</span>
        <h1 className="section-title">Курсы китайского языка онлайн в ChinaChild</h1>
        <p className="section-description">
          Собрали все основные направления: дети, подростки, взрослые и бизнес.
          Страница работает как SEO-хаб и как навигационный экран перед заявкой.
        </p>
      </section>
      <CoursesSection />
      <PricingSection />
      <FAQSection />
    </main>
  );
}
