export type CityData = {
  slug: string;
  name: string;
  /** Genitive form for "in [city]" — for Russian declension in titles */
  inCity: string;
  /** Where the user lives — used in body copy */
  ofCity: string;
  /** Russian region name for PostalAddress.addressRegion */
  region: string;
  /** Wikipedia link for sameAs / areaServed */
  wikipedia: string;
  /** Time zone hint shown in body */
  timezone: string;
  /** Where you can take HSK in this city — Confucius Institute or other */
  hskCenter: string;
  /** Surrounding suburbs / commuter belt mentioned in body */
  suburbs: string;
  /** Whether the school's licence specifically applies to this region */
  licensedRegion: boolean;
  /** Optional unique selling point for this city */
  hook?: string;
  /** Unique meta description per city (140-158 chars). Keeps each city page
   *  distinguishable in SERP — avoids near-duplicate description signal that
   *  hurts Яндекс ranking for geo-clusters. */
  metaDescription: string;
};

export const cities: CityData[] = [
  {
    slug: "moscow",
    name: "Москва",
    inCity: "в Москве",
    ofCity: "Москвы",
    region: "Москва",
    wikipedia: "https://ru.wikipedia.org/wiki/Москва",
    timezone: "Московское время (MSK / UTC+3)",
    hskCenter:
      "Институт Конфуция при МГУ им. М.В. Ломоносова и другие центры Москвы",
    suburbs: "ТиНАО, Балашихе, Химках, Реутове, Зеленограде",
    licensedRegion: true,
    hook:
      "Образовательная лицензия выдана Департаментом образования и науки города Москвы — налоговый вычет 13% (до 19 500 ₽ в год) для жителей города и Подмосковья.",
    metaDescription:
      "Онлайн-курсы китайского в Москве: лицензия Москвы, HSK 1–2 за 6 месяцев, мини-группы до 5, налоговый вычет до 19 500 ₽. Подготовка к HSK в МГУ и КФУ.",
  },
  {
    slug: "saint-petersburg",
    name: "Санкт-Петербург",
    inCity: "в Санкт-Петербурге",
    ofCity: "Санкт-Петербурга",
    region: "Санкт-Петербург",
    wikipedia: "https://ru.wikipedia.org/wiki/Санкт-Петербург",
    timezone: "Московское время (MSK / UTC+3)",
    hskCenter: "Институт Конфуция при СПбГУ",
    suburbs: "Кудрово, Мурино, Девяткино, Шушары, Колпино",
    licensedRegion: false,
    metaDescription:
      "Онлайн-курсы китайского в Санкт-Петербурге: HSK 1–2 за 6 месяцев, мини-группы до 5, носитель путунхуа Чжао Ли. Подготовка к HSK в Институте Конфуция СПбГУ.",
  },
  {
    slug: "kazan",
    name: "Казань",
    inCity: "в Казани",
    ofCity: "Казани",
    region: "Республика Татарстан",
    wikipedia: "https://ru.wikipedia.org/wiki/Казань",
    timezone: "Московское время (MSK / UTC+3)",
    hskCenter: "Институт Конфуция при Казанском федеральном университете",
    suburbs: "Зеленодольске, Иннополисе, Высокогорском районе",
    licensedRegion: false,
    metaDescription:
      "Онлайн-курсы китайского в Казани: HSK 1–2 за 6 месяцев, мини-группы до 5, носитель путунхуа. Удобный МСК-часовой пояс. Подготовка к HSK в КФУ.",
  },
  {
    slug: "ekaterinburg",
    name: "Екатеринбург",
    inCity: "в Екатеринбурге",
    ofCity: "Екатеринбурга",
    region: "Свердловская область",
    wikipedia: "https://ru.wikipedia.org/wiki/Екатеринбург",
    timezone: "Екатеринбургское время (UTC+5)",
    hskCenter: "Институт Конфуция при Уральском федеральном университете",
    suburbs: "Верхней Пышме, Берёзовском, Среднеуральске",
    licensedRegion: false,
    metaDescription:
      "Онлайн-курсы китайского в Екатеринбурге: HSK 1–2 за 6 месяцев, мини-группы до 5, носитель путунхуа. Расписание под UTC+5. Подготовка к HSK в УрФУ.",
  },
  {
    slug: "novosibirsk",
    name: "Новосибирск",
    inCity: "в Новосибирске",
    ofCity: "Новосибирска",
    region: "Новосибирская область",
    wikipedia: "https://ru.wikipedia.org/wiki/Новосибирск",
    timezone: "Новосибирское время (UTC+7)",
    hskCenter:
      "Институт Конфуция при Новосибирском государственном техническом университете",
    suburbs: "Бердске, Искитиме, Краснообске, Кольцово",
    licensedRegion: false,
    hook:
      "Сибирский регион — один из самых активных рынков для китайского языка благодаря приграничной торговле и научному сотрудничеству.",
    metaDescription:
      "Онлайн-курсы китайского в Новосибирске: HSK 1–2 за 6 месяцев, мини-группы до 5, носитель путунхуа. Расписание под UTC+7. Подготовка к HSK в НГТУ.",
  },
  {
    slug: "krasnodar",
    name: "Краснодар",
    inCity: "в Краснодаре",
    ofCity: "Краснодара",
    region: "Краснодарский край",
    wikipedia: "https://ru.wikipedia.org/wiki/Краснодар",
    timezone: "Московское время (MSK / UTC+3)",
    hskCenter: "Институт Конфуция при Кубанском государственном университете",
    suburbs: "Динской, Северском, Тимашёвске, Новороссийске, Сочи",
    licensedRegion: false,
    metaDescription:
      "Онлайн-курсы китайского в Краснодаре: HSK 1–2 за 6 месяцев, мини-группы до 5, носитель путунхуа. Подготовка к HSK в Институте Конфуция КубГУ.",
  },
  {
    slug: "rostov-on-don",
    name: "Ростов-на-Дону",
    inCity: "в Ростове-на-Дону",
    ofCity: "Ростова-на-Дону",
    region: "Ростовская область",
    wikipedia: "https://ru.wikipedia.org/wiki/Ростов-на-Дону",
    timezone: "Московское время (MSK / UTC+3)",
    hskCenter:
      "Институт Конфуция при Южном федеральном университете (ЮФУ)",
    suburbs: "Аксае, Батайске, Азове, Таганроге",
    licensedRegion: false,
    hook:
      "Часть нашей преподавательской команды — выпускники ЮФУ и ДГТУ, поэтому методика курса во многом сформирована южнороссийской школой востоковедения.",
    metaDescription:
      "Онлайн-курсы китайского в Ростове-на-Дону: HSK 1–2 за 6 месяцев, мини-группы до 5, методика преподавателей ЮФУ и ДГТУ. Подготовка к HSK в Институте Конфуция.",
  },
  {
    slug: "vladivostok",
    name: "Владивосток",
    inCity: "во Владивостоке",
    ofCity: "Владивостока",
    region: "Приморский край",
    wikipedia: "https://ru.wikipedia.org/wiki/Владивосток",
    timezone: "Владивостокское время (UTC+10)",
    hskCenter: "Институт Конфуция при ДВФУ",
    suburbs: "Артёме, Уссурийске, Находке",
    licensedRegion: false,
    hook:
      "Дальневосточный регион — один из ключевых для китайского языка: близость к Китаю, прямые транспортные коридоры и активное деловое сотрудничество с КНР.",
    metaDescription:
      "Онлайн-курсы китайского во Владивостоке: HSK 1–2 за 6 месяцев, мини-группы до 5, носитель путунхуа. Расписание под UTC+10. Подготовка к HSK в ДВФУ.",
  },
];

export function getCityBySlug(slug: string): CityData | null {
  return cities.find((c) => c.slug === slug) ?? null;
}

export function getCitySlugs(): string[] {
  return cities.map((c) => c.slug);
}
