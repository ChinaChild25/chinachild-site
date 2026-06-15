import { getAllPosts } from "@/lib/blog";
import { renderSitemap, type UrlEntry } from "@/lib/sitemap-helpers";
import { absoluteUrl } from "@/lib/site-config";
import { resolveTeacherCertificates } from "@/lib/team-certificates";
import { teachers } from "@/lib/site-data";

export const dynamic = "force-static";

/**
 * Image sitemap — declares the OG image associated with every URL so search
 * engines (Yandex, Google) can show them as preview thumbnails in SERP.
 */
export async function GET() {
  const posts = await getAllPosts();
  const now = new Date().toISOString();

  const homeImg = absoluteUrl("/opengraph-image");
  const pageHeroImages: UrlEntry[] = [
    {
      loc: absoluteUrl("/repetitor-kitayskogo"),
      lastmod: now,
      images: [
        {
          loc: absoluteUrl("/heroes/kitajskij-s-nulya-marshrut-obucheniya-optimized.webp"),
          title: "Репетитор китайского языка онлайн — индивидуальный маршрут",
          caption:
            "Иллюстрация индивидуального маршрута обучения китайскому языку с репетитором ChinaChild.",
        },
      ],
    },
    {
      loc: absoluteUrl("/dictionary"),
      lastmod: now,
      images: [
        {
          loc: absoluteUrl("/heroes/kitajskij-slovar.webp"),
          title: "Китайский словарь ChinaChild",
          caption:
            "Иллюстрация словаря ChinaChild с HSK-словами, pinyin и карточками терминов.",
        },
      ],
    },
    {
      loc: absoluteUrl("/grammar"),
      lastmod: now,
      images: [
        {
          loc: absoluteUrl("/heroes/grammatika-kitajskogo-yazyka.webp"),
          title: "Грамматика китайского языка ChinaChild",
          caption:
            "Иллюстрация справочника по грамматике китайского языка с правилами, схемами и примерами.",
        },
      ],
    },
    {
      loc: absoluteUrl("/results"),
      lastmod: now,
      images: [
        {
          loc: absoluteUrl("/heroes/rezultaty-uchenikov-chinachild-optimized.webp"),
          title: "Результаты учеников ChinaChild",
          caption:
            "Иллюстрация прогресса учеников: сертификат, процент результата и учебные цели по китайскому языку.",
        },
      ],
    },
    {
      loc: absoluteUrl("/reviews"),
      lastmod: now,
      images: [
        {
          loc: absoluteUrl("/heroes/otzivi.webp"),
          title: "Отзывы учеников ChinaChild",
          caption:
            "Иллюстрация отзывов учеников ChinaChild о курсах китайского языка и результатах обучения.",
        },
      ],
    },
    {
      loc: absoluteUrl("/cities"),
      lastmod: now,
      images: [
        {
          loc: absoluteUrl("/heroes/kursy-kitajskogo-v-gorodah-rossii.webp"),
          title: "Курсы китайского языка в городах России",
          caption:
            "Иллюстрация онлайн-обучения китайскому языку для учеников из разных городов России.",
        },
      ],
    },
    {
      loc: absoluteUrl("/compare/mini-group-vs-individual"),
      lastmod: now,
      images: [
        {
          loc: absoluteUrl("/heroes/gruppa-ili-individualno.webp"),
          title: "Мини-группа или индивидуально — сравнение форматов",
          caption:
            "Иллюстрация сравнения мини-группы и индивидуальных занятий китайским языком.",
        },
      ],
    },
    {
      loc: absoluteUrl("/learn/beginners"),
      lastmod: now,
      images: [
        {
          loc: absoluteUrl("/heroes/kitajskij-s-nulya-marshrut-obucheniya-optimized.webp"),
          title: "Китайский с нуля — маршрут обучения",
          caption:
            "Иллюстрация маршрута от первых шагов в китайском языке до уверенного учебного результата.",
        },
      ],
    },
    {
      loc: absoluteUrl("/courses/chinese-for-kids"),
      lastmod: now,
      images: [
        {
          loc: absoluteUrl("/heroes/kitajskij-dlya-shkolnikov.webp"),
          title: "Китайский язык для школьников 12+",
          caption:
            "Иллюстрация онлайн-курса китайского языка для школьников 12+ в ChinaChild.",
        },
      ],
    },
  ];

  const entries: UrlEntry[] = [
    {
      loc: absoluteUrl("/"),
      lastmod: now,
      images: [{ loc: homeImg, title: "ChinaChild — онлайн-школа китайского языка" }],
    },
    ...pageHeroImages,
    ...[
      "/about",
      "/methodology",
      "/courses",
      "/courses/online-chinese",
      "/courses/hsk-preparation",
      "/courses/chinese-for-adults",
      "/courses/business-chinese",
    ].map((path): UrlEntry => ({
      loc: absoluteUrl(path),
      lastmod: now,
      images: [{ loc: homeImg, title: "ChinaChild — онлайн-школа китайского языка" }],
    })),
    ...posts.map((post): UrlEntry => ({
      loc: absoluteUrl(`/blog/${post.slug}`),
      lastmod: new Date(post.dateModified).toISOString(),
      images: [
        {
          loc: absoluteUrl(`/blog/${post.slug}/opengraph-image`),
          title: post.title,
          caption: post.description,
        },
      ],
    })),
    // Реальные фото преподавателей — отдельный канал в Yandex.Картинки /
    // Google Images. Подпись и caption строятся из imageAlt / specialization.
    ...teachers
      .filter((t): t is typeof t & { image: string } => Boolean(t.image))
      .map((t): UrlEntry => {
        const portrait = {
          loc: absoluteUrl(t.image),
          title: t.imageAlt ?? `${t.name} — преподаватель китайского языка, ChinaChild`,
          caption: t.specialization,
        };
        const certificateImages = resolveTeacherCertificates(t.certificates).map((cert) => ({
          loc: absoluteUrl(cert.src),
          title: cert.alt,
          caption: cert.caption ?? cert.name,
        }));
        return {
          loc: absoluteUrl(`/team/${t.slug}`),
          lastmod: now,
          images: [portrait, ...certificateImages],
        };
      }),
    // Сканы образовательной лицензии — отдельный канал в Yandex.Картинки
    // и Google Images. На образовательной лицензии Google «вешает»
    // E-E-A-T-сигналы для всей подсайта.
    {
      loc: absoluteUrl("/license"),
      lastmod: now,
      images: [
        {
          loc: absoluteUrl("/license/license-scan.webp"),
          title: "Образовательная лицензия ChinaChild — основная страница",
          caption:
            "Уведомление о предоставлении лицензии на образовательную деятельность, выданное Департаментом образования и науки города Москвы",
        },
        {
          loc: absoluteUrl("/license/license-app-1.webp"),
          title: "Приложение к образовательной лицензии ChinaChild",
          caption:
            "Приложение к лицензии с печатью Департамента образования и науки города Москвы",
        },
      ],
    },
  ];

  return new Response(renderSitemap(entries, true), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
