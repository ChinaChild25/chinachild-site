import type { Metadata } from "next";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import PageHero from "@/components/layout/PageHero";
import FAQSection from "@/components/sections/FAQSection";
import { ChartUp, GlobeCharacter, SpeechBubbles } from "@/components/decor/Decor";
import { buildMetadata } from "@/lib/metadata";
import { REGISTER_URL } from "@/lib/site-config";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata({
    title: "Китайский для старшеклассников и абитуриентов | ChinaChild",
    description:
      "Курс китайского языка для подростков 16–17 лет: подготовка к HSK 2–3, к олимпиадам и поступлению в вузы Китая. Лицензированная программа, мини-группы до 5 человек.",
    path: "/dlya-podrostkov",
    keywords: [
      "китайский для подростков",
      "китайский для старшеклассников",
      "HSK 2 для школьников",
      "подготовка к HSK для подростков",
    ],
  });
}

const features = [
  {
    card: "card-violet-soft",
    title: "Подготовка к HSK 2–3",
    body:
      "Контрольные точки экзамена, тренировка типовых заданий и стратегия времени. Помогаем структурно идти к сертификату.",
    icon: <ChartUp className="absolute -right-2 -bottom-4 h-32 w-36 opacity-95" />,
  },
  {
    card: "card-cream",
    title: "Аутентичные тексты и аудио",
    body:
      "Разбираем фрагменты китайских СМИ, видео и подкастов — навык, который реально нужен для поступления в Китай.",
    icon: <GlobeCharacter className="absolute -right-2 -bottom-2 h-32 w-32 opacity-95" />,
  },
  {
    card: "card-lime-soft",
    title: "Разговорные клубы",
    body:
      "Регулярная живая практика в мини-группах — снимаем языковой барьер до того, как подросток окажется на собеседовании.",
    icon: <SpeechBubbles className="absolute -right-2 -bottom-2 h-32 w-36 opacity-95" />,
  },
];

export default function TeensLandingPage() {
  return (
    <main>
      <Breadcrumbs
        items={[
          { name: "Главная", path: "/" },
          { name: "Старшеклассникам", path: "/dlya-podrostkov" },
        ]}
      />
      <PageHero
        eyebrow="Старшеклассники 16–17"
        title="Китайский для старшеклассников и абитуриентов"
        description="Подготовка к HSK 2–3, олимпиадам и поступлению в вузы Китая. Лицензированная программа, мини-группы до 5 человек, преподаватели ЮФУ и ДГТУ."
        primaryCta={{ label: "Записаться на диагностику", href: REGISTER_URL, external: true }}
        secondaryCta={{ label: "Смотреть курсы", href: "/kursy" }}
      />

      <section className="page-shell section-space">
        <div className="grid gap-5 md:grid-cols-3">
          {features.map((item) => (
            <article key={item.title} className={`card-block relative h-full overflow-hidden ${item.card}`}>
              <h2 className="relative z-10 text-xl font-bold tracking-[-0.03em] text-[#1b1b1b]">
                {item.title}
              </h2>
              <p className="relative z-10 mt-3 max-w-[88%] text-sm leading-7 text-[#4b4b4b]">{item.body}</p>
              {item.icon}
            </article>
          ))}
        </div>
      </section>

      <FAQSection />
    </main>
  );
}
