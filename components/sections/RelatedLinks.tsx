import Link from "next/link";
import Reveal from "@/components/ui/Reveal";

type LinkItem = { title: string; href: string; description: string; tone: string };

const defaultItems: LinkItem[] = [
  {
    title: "Подготовка к HSK 1–6",
    href: "/courses/hsk-preparation",
    description: "Все уровни международного экзамена в одном маршруте — от базы до продвинутого.",
    tone: "card-violet-soft",
  },
  {
    title: "Онлайн-курсы китайского",
    href: "/courses/online-chinese",
    description: "Программа для тех, кто никогда не учил китайский. С телефона или ноутбука.",
    tone: "card-cream",
  },
  {
    title: "Школьникам 12+",
    href: "/courses/chinese-for-kids",
    description: "Индивидуальный курс с преподавателем — скидка 10% при оплате за 2 месяца.",
    tone: "card-sky",
  },
  {
    title: "Взрослым с нуля",
    href: "/courses/chinese-for-adults",
    description: "Лицензированный курс HSK 1–2 — разговорный уровень за 6 месяцев.",
    tone: "card-peach-soft",
  },
  {
    title: "Бизнес-китайский",
    href: "/courses/business-chinese",
    description: "Корпоративные мини-группы, отчётность для HR и закрывающие документы.",
    tone: "card-lime-soft",
  },
  {
    title: "О школе и лицензия",
    href: "/about",
    description: "Команда из выпускников ЮФУ и ДГТУ с опытом 10+ лет, лицензия Москвы.",
    tone: "card-cream-soft",
  },
];

export default function RelatedLinks({ items = defaultItems }: { items?: LinkItem[] }) {
  return (
    <section className="page-shell-wide section-space">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="section-title">Перейти к разделу</h2>
        <p className="section-description">
          Внутренняя навигация по основным посадочным страницам школы китайского языка ChinaChild.
        </p>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Reveal key={item.href}>
            <Link
              href={item.href}
              className={`card-block group flex h-full flex-col transition hover:-translate-y-1 ${item.tone}`}
            >
              <h3 className="text-[1.25rem] font-medium tracking-[-0.01em] text-[#1a1a1a] leading-[1.2]">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-[1.55] text-[#4b4b4b]">{item.description}</p>
              <div className="mt-auto pt-6 text-sm font-medium text-[#1a1a1a] underline-offset-4 group-hover:underline">
                Открыть →
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
