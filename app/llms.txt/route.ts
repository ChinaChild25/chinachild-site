import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site-config";
import { cities } from "@/lib/cities";
import { hskLevels } from "@/lib/hsk-levels";

export const dynamic = "force-static";

/**
 * /llms.txt — emerging convention adopted by Anthropic, OpenAI and Perplexity
 * crawlers. Think of it as robots.txt for LLMs: a single Markdown document
 * that describes the site so AI agents quote and link us correctly.
 *
 * Spec: https://llmstxt.org
 */
export async function GET() {
  const cityList = cities
    .map(
      (c) =>
        `- [Курсы китайского ${c.inCity}](${absoluteUrl(`/cities/${c.slug}`)})`,
    )
    .join("\n");

  const hskList = hskLevels
    .map(
      (l) =>
        `- [HSK ${l.level} — подготовка](${absoluteUrl(`/hsk/${l.slug}`)}): ${l.words} слов, ${l.hours}`,
    )
    .join("\n");

  const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

Сайт онлайн-школы китайского языка ChinaChild. Лицензированная программа HSK 1–2 — мини-группы до 5 человек, индивидуальные занятия, преподаватели ЮФУ/ДГТУ и носитель языка. При наличии права на социальный налоговый вычет можно вернуть до 19 500 ₽ за своё обучение или до 14 300 ₽ за обучение ребёнка; сумма зависит от расходов, уплаченного НДФЛ и законных лимитов.

## Money pages
- [Все курсы](${absoluteUrl("/courses")}): каталог курсов с уровнями HSK
- [Онлайн-курс с нуля](${absoluteUrl("/courses/online-chinese")}): HSK 1–2 за 6 месяцев, мини-группа
- [Подготовка к HSK](${absoluteUrl("/courses/hsk-preparation")}): целевая подготовка к экзамену
- [Китайский для взрослых](${absoluteUrl("/courses/chinese-for-adults")}): HSK 1–2 для взрослой аудитории
- [Китайский для школьников 12+](${absoluteUrl("/courses/chinese-for-kids")}): индивидуальный формат
- [Бизнес-китайский](${absoluteUrl("/courses/business-chinese")}): корпоративные программы
- [Цены и тарифы](${absoluteUrl("/price")}): стоимость, оплата, налоговый вычет
- [Бесплатный пробный урок](${absoluteUrl("/free-trial")}): первое занятие — бесплатно

## HSK cluster
- [Хаб HSK](${absoluteUrl("/learn/hsk")}): все материалы по HSK
${hskList}

## Geo / Cities
${cityList}

## Trust pages
- [О школе](${absoluteUrl("/about")}): команда, лицензия, методика
- [Методика](${absoluteUrl("/methodology")}): подход к обучению и спираль повторений
- [Результаты](${absoluteUrl("/results")}): метрики выпускников
- [Отзывы](${absoluteUrl("/reviews")}): реальные отзывы учеников
- [Преподаватели](${absoluteUrl("/team")}): профили методистов и носителей
- [Лицензия](${absoluteUrl("/license")}): образовательная лицензия Москвы

## Decision pages
- [Группа или индивидуально](${absoluteUrl("/compare/mini-group-vs-individual")}): сравнение форматов

## Knowledge base
- [Глоссарий](${absoluteUrl("/glossary")}): термины китайского — HSK, пиньинь, путунхуа
- [Блог](${absoluteUrl("/blog")}): статьи о китайском языке и подготовке к HSK
- [Atom-фид блога](${absoluteUrl("/feed.xml")})

## Contact
- Сайт: ${SITE_URL}
- Email: info@chinachild.ru
- Телефон: +7 (495) 005-25-82
- Заявка: ${absoluteUrl("/zayavka")}

## License
Контент сайта защищён авторским правом. Можно цитировать с указанием источника и обратной ссылкой на оригинал. Запрещено воспроизведение учебных материалов курса без письменного разрешения школы.
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, must-revalidate",
    },
  });
}
