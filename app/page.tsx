import type { Metadata } from "next";
import AudienceSection from "@/components/sections/AudienceSection";
import BlogPreviewSection from "@/components/sections/BlogPreviewSection";
import CoursesSection from "@/components/sections/CoursesSection";
import FAQSection from "@/components/sections/FAQSection";
import HeroSection from "@/components/sections/HeroSection";
import PricingSection from "@/components/sections/PricingSection";
import ProcessSection from "@/components/sections/ProcessSection";
import ResultsSection from "@/components/sections/ResultsSection";
import ReviewsSection from "@/components/sections/ReviewsSection";
import TeachersSection from "@/components/sections/TeachersSection";
import WhySection from "@/components/sections/WhySection";
import { getLatestPosts } from "@/lib/blog";
import { buildMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title:
      "ChinaChild — Онлайн-школа китайского языка | Курсы для детей и взрослых",
    description:
      "Учите китайский онлайн с носителями и сертифицированными преподавателями. Курсы для детей с 5 лет, подростков и взрослых. Первый урок бесплатно. Запишитесь сегодня!",
    path: "/",
    keywords: [
      "китайский язык онлайн",
      "онлайн школа китайского языка",
      "обучение китайскому языку",
      "курсы китайского для детей",
      "курсы китайского для взрослых",
    ],
  });
}

export default async function HomePage() {
  const latestPosts = await getLatestPosts(3);

  return (
    <main>
      <HeroSection />
      <AudienceSection />
      <WhySection />
      <CoursesSection />
      <ProcessSection />
      <TeachersSection />
      <ReviewsSection />
      <ResultsSection />
      <PricingSection />
      <FAQSection />
      <BlogPreviewSection posts={latestPosts} />
    </main>
  );
}
