import type { Metadata } from "next";
import BlogPreviewSection from "@/components/sections/BlogPreviewSection";
import FAQSection from "@/components/sections/FAQSection";
import HeroSection from "@/components/sections/HeroSection";
import {
  AudienceRedesignDraftSection,
  WhyRedesignDraftSection,
} from "@/components/sections/home-redesign/HomeRedesignDraftSections";
import PlatformShowcase from "@/components/sections/PlatformShowcase";
import PricingSection from "@/components/sections/PricingSection";
import ProcessSection from "@/components/sections/ProcessSection";
import RelatedLinks from "@/components/sections/RelatedLinks";
import ResultsSection from "@/components/sections/ResultsSection";
import ReviewsSection from "@/components/sections/ReviewsSection";
import TeachersSection from "@/components/sections/TeachersSection";
import { getLatestPosts } from "@/lib/blog";
import { buildMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "ChinaChild — онлайн-школа китайского языка HSK 1–6",
    description:
      "Онлайн-школа китайского ChinaChild: программа HSK 1–2, разговорный уровень за 6 месяцев, мини-группы. Налоговый вычет 13% — для 12+ и взрослых.",
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
      <AudienceRedesignDraftSection />
      <WhyRedesignDraftSection />
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
