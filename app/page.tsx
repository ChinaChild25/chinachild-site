import type { Metadata } from "next";
import AudienceSection from "@/components/sections/AudienceSection";
import BlogPreviewSection from "@/components/sections/BlogPreviewSection";
import CoursesSection from "@/components/sections/CoursesSection";
import FAQSection from "@/components/sections/FAQSection";
import HeroSection from "@/components/sections/HeroSection";
import PlatformShowcase from "@/components/sections/PlatformShowcase";
import PricingSection from "@/components/sections/PricingSection";
import ProcessSection from "@/components/sections/ProcessSection";
import RelatedLinks from "@/components/sections/RelatedLinks";
import ResultsSection from "@/components/sections/ResultsSection";
import ReviewsSection from "@/components/sections/ReviewsSection";
import TeachersSection from "@/components/sections/TeachersSection";
import WhySection from "@/components/sections/WhySection";
import { getLatestPosts } from "@/lib/blog";
import { buildMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title:
      "ChinaChild — онлайн-школа китайского языка | Курсы HSK 1–6, обучение с нуля",
    description:
      "Онлайн-школа китайского языка ChinaChild. Лицензированная программа HSK 1–2: разговорный уровень за 6 месяцев. Мини-группы до 5 человек, налоговый вычет 13%, обучение для подростков 12+ и взрослых.",
    path: "/",
    keywords: [
      "китайский язык онлайн",
      "онлайн школа китайского языка",
      "обучение китайскому языку",
      "курсы китайского языка",
      "китайский с нуля",
      "подготовка к HSK",
      "HSK онлайн",
      "разговорный китайский",
      "репетитор китайского",
      "выучить китайский",
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
      <PlatformShowcase />
      <TeachersSection />
      <ReviewsSection />
      <ResultsSection />
      <PricingSection />
      <RelatedLinks />
      <FAQSection />
      <BlogPreviewSection posts={latestPosts} />
    </main>
  );
}
