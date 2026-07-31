import Image from "next/image";
import Link from "next/link";
import RelatedLinkIcon, { type RelatedLinkIconName } from "@/components/sections/RelatedLinkIcon";
import Reveal from "@/components/ui/Reveal";

type LinkItem = {
  title: string;
  href: string;
  description: string;
  tone: string;
  /** lucide-иконка — fallback, если картинка не задана/не загрузилась. */
  icon: RelatedLinkIconName;
  /** Иллюстрация раздела. Лёгкие SVG — как есть (масштабируемые, чёткие);
      исходно растровые (3D) — оптимизированные webp. */
  image?: string;
  /** Натуральные размеры картинки (для сохранения пропорций без CLS). */
  imageW?: number;
  imageH?: number;
  /** alt/title — осмысленный SEO/E-E-A-T текст в контексте ChinaChild. */
  imageAlt?: string;
  /** Доп. классы позиционирования/размера иконки в правом нижнем углу. */
  imageClassName?: string;
};

// Цвет lucide-fallback — чуть темнее тона карточки. Для картинок не используется.
const toneIconColor: Record<string, string> = {
  "card-violet-soft": "#8076e0",
  "card-cream": "#c4c4c4",
  "card-sky": "#7ca3d3",
  "card-peach-soft": "#df9468",
  "card-lime-soft": "#9fb845",
  "card-cream-soft": "#c4c4c4",
};

// Иллюстрации сидят в правом нижнем углу: верх-лево (северо-запад) всегда видно,
// за край уходит только нижний правый угол. Размер — доля ширины карточки с
// потолком (крупно на широких одноколоночных карточках, аккуратно на узких).
const defaultItems: LinkItem[] = [
  {
    title: "Подготовка к HSK 1–6",
    href: "/courses/hsk-preparation",
    description: "Все уровни международного экзамена в одном маршруте — от базы до продвинутого.",
    tone: "card-violet-soft",
    icon: "award",
    image: "/home-redesign/podgotovka-hsk-papki-dokumenty.webp",
    imageW: 848,
    imageH: 848,
    imageAlt: "3D-папки с документами — подготовка к экзамену HSK 1–6 в онлайн-школе китайского ChinaChild",
    imageClassName: "-bottom-2 -right-2 w-[50%] max-w-[230px]",
  },
  {
    title: "Онлайн-курсы китайского",
    href: "/courses/online-chinese",
    description: "Программа для тех, кто никогда не учил китайский. С телефона или ноутбука.",
    tone: "card-cream",
    icon: "laptop",
    image: "/related/online.svg",
    imageW: 295,
    imageH: 331,
    imageAlt: "Человек держит глобус — онлайн-курсы китайского языка ChinaChild из любой точки мира",
    imageClassName: "-bottom-4 -right-1 w-[36%] max-w-[155px] md:bottom-0 md:w-[40%] md:max-w-[178px]",
  },
  {
    title: "Школьникам 12+",
    href: "/courses/chinese-for-kids",
    description: "Индивидуальный модуль для школьников 12+: 17 990 ₽ за месяц и 8 занятий по 60 минут. Следующий модуль оплачивается отдельно; автоматического списания нет.",
    tone: "card-sky",
    icon: "backpack",
    image: "/related/kids.svg",
    imageW: 80,
    imageH: 72,
    imageAlt: "Хай-файв — индивидуальный курс китайского для школьников 12+ в ChinaChild",
    imageClassName: "-bottom-4 -right-2 w-[40%] max-w-[180px] md:bottom-0 md:w-[44%] md:max-w-[202px]",
  },
  {
    title: "Взрослым с нуля",
    href: "/courses/chinese-for-adults",
    description: "Лицензированный курс HSK 1–2 — разговорный уровень за 6 месяцев.",
    tone: "card-peach-soft",
    icon: "sprout",
    image: "/related/adults.svg",
    imageW: 570,
    imageH: 346,
    imageAlt: "Человек с речевым облаком — разговорный китайский с нуля для взрослых в ChinaChild",
    imageClassName: "bottom-0 -right-2 w-[46%] max-w-[220px]",
  },
  {
    title: "Бизнес-китайский",
    href: "/courses/business-chinese",
    description: "Корпоративные мини-группы, отчётность для HR и закрывающие документы.",
    tone: "card-lime-soft",
    icon: "briefcase",
    image: "/home-redesign/korporativnyy-kitajskiy-papka-dokumenty.webp",
    imageW: 1720,
    imageH: 1100,
    imageAlt: "Чёрная папка с документами — корпоративное обучение китайскому языку для команд в ChinaChild",
    imageClassName: "-bottom-1 -right-1 w-[64%] max-w-[320px]",
  },
  {
    title: "О школе и лицензия",
    href: "/about",
    description: "Команда из выпускников ЮФУ и ДГТУ с опытом 10+ лет, лицензия Москвы.",
    tone: "card-cream-soft",
    icon: "shield-check",
    image: "/home-redesign/litsenzirovannaya-programma-hsk-1-2.webp",
    imageW: 1332,
    imageH: 1056,
    imageAlt: "Лицензия Москвы на программу HSK 1–2 — лицензированная онлайн-школа китайского ChinaChild",
    imageClassName: "-bottom-1 -right-1 w-[54%] max-w-[270px]",
  },
];

export default function RelatedLinks({ items = defaultItems }: { items?: LinkItem[] }) {
  return (
    <section className="page-shell-wide section-space">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="section-title">Перейти к разделу</h2>
        <p className="section-description">
          Выберите направление — программы, расписание и цены ChinaChild собраны по разделам.
        </p>
      </div>
      <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => {
          return (
            <Reveal key={item.href}>
              <Link
                href={item.href}
                className={`card-block group relative flex h-full min-h-[248px] flex-col overflow-hidden transition hover:-translate-y-1 ${item.tone}`}
              >
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.imageAlt ?? item.title}
                    title={item.imageAlt ?? item.title}
                    width={item.imageW ?? 240}
                    height={item.imageH ?? 240}
                    sizes="(min-width: 1280px) 320px, (min-width: 768px) 50vw, 50vw"
                    className={`pointer-events-none absolute h-auto ${item.imageClassName ?? "-bottom-3 -right-3 w-[48%] max-w-[220px]"}`}
                  />
                ) : (
                  <RelatedLinkIcon
                    name={item.icon}
                    className="pointer-events-none absolute -bottom-4 -right-4 aspect-square h-auto w-[34%] max-w-[150px]"
                    color={toneIconColor[item.tone] ?? "#bdbdbd"}
                  />
                )}
                <h3 className="relative max-w-[60%] text-[1.25rem] font-medium tracking-[-0.01em] text-[#262626] leading-[1.2]">
                  {item.title}
                </h3>
                <p className="relative mt-3 max-w-[58%] text-sm leading-[1.55] text-[#4b4b4b]">
                  {item.description}
                </p>
                <div className="relative mt-auto pt-6 text-sm font-medium text-[#262626] underline-offset-4 group-hover:underline">
                  Открыть →
                </div>
              </Link>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
