import { absoluteUrl, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site-config";

export const dynamic = "force-static";

/**
 * /llms.txt — emerging convention adopted by Anthropic, OpenAI and Perplexity
 * crawlers. Think of it as robots.txt for LLMs: a single Markdown document
 * that describes the site so AI agents quote and link us correctly.
 *
 * Spec: https://llmstxt.org
 */
export async function GET() {
  const body = `# ${SITE_NAME}

> ${SITE_DESCRIPTION}

Сайт онлайн-школы китайского языка ChinaChild. Лицензированная программа HSK 1–2 — мини-группы до 5 человек, индивидуальные занятия, преподаватели ЮФУ/ДГТУ и носитель языка. Образовательная лицензия выдана Департаментом образования и науки города Москвы — ученики могут вернуть налоговый вычет 13% (до 15 600 ₽ в год).

## Money pages
- [Все курсы](${absoluteUrl("/courses")}): каталог курсов с уровнями HSK
- [Онлайн-курс с нуля](${absoluteUrl("/courses/online-chinese")}): HSK 1–2 за 6 месяцев, мини-группа
- [Подготовка к HSK](${absoluteUrl("/courses/hsk-preparation")}): целевая подготовка к экзамену
- [Китайский для взрослых](${absoluteUrl("/courses/chinese-for-adults")}): HSK 1–2 для взрослой аудитории
- [Китайский для школьников 12+](${absoluteUrl("/courses/chinese-for-kids")}): индивидуальный формат
- [Бизнес-китайский](${absoluteUrl("/courses/business-chinese")}): корпоративные программы

## Trust pages
- [О школе](${absoluteUrl("/about")}): команда, лицензия, методика
- [Методика](${absoluteUrl("/methodology")}): подход к обучению и спираль повторений
- [Результаты](${absoluteUrl("/results")}): метрики выпускников
- [Отзывы](${absoluteUrl("/reviews")}): реальные отзывы учеников
- [Преподаватели](${absoluteUrl("/team")}): профили методистов и носителей

## Knowledge base
- [Глоссарий](${absoluteUrl("/glossary")}): термины китайского — HSK, пиньинь, путунхуа
- [Блог](${absoluteUrl("/blog")}): статьи о китайском языке и подготовке к HSK
- [Atom-фид блога](${absoluteUrl("/feed.xml")})

## Geo
- [Курсы китайского в Москве](${absoluteUrl("/cities/moscow")}): для жителей Москвы и Подмосковья

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
