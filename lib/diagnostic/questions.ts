import type { Question } from "./types";

/**
 * Хардкод-банк вопросов для CAT-движка.
 *
 * Поле difficulty — это θ-аналог из IRT, шкала примерно [-2.5 ; +2.5].
 * Распределение по HSK подобрано так, чтобы движок мог расти и падать
 * в обе стороны от старта (θ=0, HSK ~ 2):
 *
 *   HSK 1  → difficulty около [-1.8 .. -1.0]
 *   HSK 2  → difficulty около [-0.7 .. -0.1]
 *   HSK 3  → difficulty около [+0.1 .. +0.9]
 *   HSK 4  → difficulty около [+1.0 .. +1.8]
 *   HSK 5  → difficulty около [+1.9 .. +2.5]
 *
 * Идентификаторы стабильные ("a-001", "b-001" …) — на них завязана
 * аналитика и проверка «не выдавать одно и то же дважды».
 */
export const QUESTION_BANK: Question[] = [
  // ============================================================
  // ТИП A — Recognition: иероглиф → значение
  // ============================================================
  // HSK 1
  { id: "a-001", type: "A", difficulty: -1.8, hsk: 1, hanzi: "你", pinyin: "nǐ", options: ["ты", "он", "я", "мы"], correctIndex: 0 },
  { id: "a-002", type: "A", difficulty: -1.7, hsk: 1, hanzi: "好", pinyin: "hǎo", options: ["плохой", "хороший", "большой", "маленький"], correctIndex: 1 },
  { id: "a-003", type: "A", difficulty: -1.6, hsk: 1, hanzi: "我", pinyin: "wǒ", options: ["ты", "он", "я", "она"], correctIndex: 2 },
  { id: "a-004", type: "A", difficulty: -1.5, hsk: 1, hanzi: "是", pinyin: "shì", options: ["нет", "быть/являться", "иметь", "хотеть"], correctIndex: 1 },
  { id: "a-005", type: "A", difficulty: -1.4, hsk: 1, hanzi: "人", pinyin: "rén", options: ["человек", "дом", "вода", "огонь"], correctIndex: 0 },
  { id: "a-006", type: "A", difficulty: -1.3, hsk: 1, hanzi: "中", pinyin: "zhōng", options: ["конец", "начало", "середина", "край"], correctIndex: 2 },
  { id: "a-007", type: "A", difficulty: -1.2, hsk: 1, hanzi: "学", pinyin: "xué", options: ["работать", "играть", "учиться", "отдыхать"], correctIndex: 2 },
  { id: "a-008", type: "A", difficulty: -1.1, hsk: 1, hanzi: "家", pinyin: "jiā", options: ["школа", "дом/семья", "офис", "город"], correctIndex: 1 },
  // HSK 2
  { id: "a-009", type: "A", difficulty: -0.6, hsk: 2, hanzi: "时间", pinyin: "shíjiān", options: ["место", "время", "пространство", "погода"], correctIndex: 1 },
  { id: "a-010", type: "A", difficulty: -0.5, hsk: 2, hanzi: "朋友", pinyin: "péngyǒu", options: ["учитель", "друг", "родитель", "брат"], correctIndex: 1 },
  { id: "a-011", type: "A", difficulty: -0.4, hsk: 2, hanzi: "工作", pinyin: "gōngzuò", options: ["отдых", "работа", "праздник", "встреча"], correctIndex: 1 },
  { id: "a-012", type: "A", difficulty: -0.3, hsk: 2, hanzi: "学校", pinyin: "xuéxiào", options: ["больница", "магазин", "школа", "ресторан"], correctIndex: 2 },
  { id: "a-013", type: "A", difficulty: -0.2, hsk: 2, hanzi: "便宜", pinyin: "piányí", options: ["дорогой", "далёкий", "близкий", "дешёвый"], correctIndex: 3 },
  // HSK 3
  { id: "a-014", type: "A", difficulty: 0.2, hsk: 3, hanzi: "经常", pinyin: "jīngcháng", options: ["иногда", "редко", "часто", "никогда"], correctIndex: 2 },
  { id: "a-015", type: "A", difficulty: 0.3, hsk: 3, hanzi: "影响", pinyin: "yǐngxiǎng", options: ["влияние", "сравнение", "решение", "опасность"], correctIndex: 0 },
  { id: "a-016", type: "A", difficulty: 0.4, hsk: 3, hanzi: "提高", pinyin: "tígāo", options: ["снижать", "повышать", "сохранять", "терять"], correctIndex: 1 },
  { id: "a-017", type: "A", difficulty: 0.6, hsk: 3, hanzi: "解决", pinyin: "jiějué", options: ["создавать", "повторять", "решать", "избегать"], correctIndex: 2 },
  { id: "a-018", type: "A", difficulty: 0.8, hsk: 3, hanzi: "需要", pinyin: "xūyào", options: ["нужно", "можно", "нельзя", "должен"], correctIndex: 0 },
  // HSK 4
  { id: "a-019", type: "A", difficulty: 1.2, hsk: 4, hanzi: "态度", pinyin: "tàidù", options: ["скорость", "отношение/позиция", "обстановка", "движение"], correctIndex: 1 },
  { id: "a-020", type: "A", difficulty: 1.4, hsk: 4, hanzi: "竞争", pinyin: "jìngzhēng", options: ["сотрудничество", "конкуренция", "обсуждение", "поддержка"], correctIndex: 1 },
  { id: "a-021", type: "A", difficulty: 1.6, hsk: 4, hanzi: "积累", pinyin: "jīlěi", options: ["терять", "копить/накапливать", "тратить", "забывать"], correctIndex: 1 },
  // HSK 5
  { id: "a-022", type: "A", difficulty: 2.0, hsk: 5, hanzi: "促进", pinyin: "cùjìn", options: ["тормозить", "способствовать", "копировать", "избегать"], correctIndex: 1 },
  { id: "a-023", type: "A", difficulty: 2.3, hsk: 5, hanzi: "贡献", pinyin: "gòngxiàn", options: ["вред", "просьба", "вклад", "поручение"], correctIndex: 2 },

  // ============================================================
  // ТИП B — Tone identification
  // ============================================================
  // HSK 1
  { id: "b-001", type: "B", difficulty: -1.6, hsk: 1, syllable: "ni", hanzi: "你", correctTone: 3, translation: "ты" },
  { id: "b-002", type: "B", difficulty: -1.5, hsk: 1, syllable: "hao", hanzi: "好", correctTone: 3, translation: "хороший" },
  { id: "b-003", type: "B", difficulty: -1.4, hsk: 1, syllable: "ma", hanzi: "妈", correctTone: 1, translation: "мама" },
  { id: "b-004", type: "B", difficulty: -1.3, hsk: 1, syllable: "ba", hanzi: "爸", correctTone: 4, translation: "папа" },
  { id: "b-005", type: "B", difficulty: -1.2, hsk: 1, syllable: "shu", hanzi: "书", correctTone: 1, translation: "книга" },
  { id: "b-006", type: "B", difficulty: -1.1, hsk: 1, syllable: "shui", hanzi: "水", correctTone: 3, translation: "вода" },
  // HSK 2
  { id: "b-007", type: "B", difficulty: -0.5, hsk: 2, syllable: "lai", hanzi: "来", correctTone: 2, translation: "приходить" },
  { id: "b-008", type: "B", difficulty: -0.3, hsk: 2, syllable: "mai", hanzi: "买", correctTone: 3, translation: "покупать" },
  { id: "b-009", type: "B", difficulty: -0.2, hsk: 2, syllable: "mai", hanzi: "卖", correctTone: 4, translation: "продавать" },
  // HSK 3
  { id: "b-010", type: "B", difficulty: 0.3, hsk: 3, syllable: "huai", hanzi: "坏", correctTone: 4, translation: "плохой" },
  { id: "b-011", type: "B", difficulty: 0.5, hsk: 3, syllable: "ying", hanzi: "影", correctTone: 3, translation: "тень/влияние" },
  { id: "b-012", type: "B", difficulty: 0.7, hsk: 3, syllable: "le", hanzi: "了", correctTone: 5, translation: "частица завершения" },
  // HSK 4
  { id: "b-013", type: "B", difficulty: 1.3, hsk: 4, syllable: "qiang", hanzi: "墙", correctTone: 2, translation: "стена" },
  { id: "b-014", type: "B", difficulty: 1.5, hsk: 4, syllable: "xian", hanzi: "险", correctTone: 3, translation: "опасный" },
  // HSK 5
  { id: "b-015", type: "B", difficulty: 2.0, hsk: 5, syllable: "cu", hanzi: "促", correctTone: 4, translation: "торопить" },

  // ============================================================
  // ТИП C — Speaking (даём только при θ > 0)
  // ============================================================
  { id: "c-001", type: "C", difficulty: 0.2, hsk: 2, hanzi: "你好", pinyin: "nǐ hǎo", translation: "Здравствуйте", expected: ["你好", "nihao", "ni hao", "ni3 hao3"] },
  { id: "c-002", type: "C", difficulty: 0.4, hsk: 2, hanzi: "谢谢", pinyin: "xièxie", translation: "Спасибо", expected: ["谢谢", "xiexie", "xie xie"] },
  { id: "c-003", type: "C", difficulty: 0.6, hsk: 3, hanzi: "我是学生", pinyin: "wǒ shì xuéshēng", translation: "Я студент", expected: ["我是学生", "wo shi xuesheng"] },
  { id: "c-004", type: "C", difficulty: 0.9, hsk: 3, hanzi: "我会说中文", pinyin: "wǒ huì shuō zhōngwén", translation: "Я умею говорить по-китайски", expected: ["我会说中文", "wo hui shuo zhongwen"] },
  { id: "c-005", type: "C", difficulty: 1.4, hsk: 4, hanzi: "今天天气怎么样", pinyin: "jīntiān tiānqì zěnmeyàng", translation: "Какая сегодня погода?", expected: ["今天天气怎么样", "jintian tianqi zenmeyang"] },

  // ============================================================
  // ТИП D — Sentence construction
  // ============================================================
  // HSK 1
  {
    id: "d-001",
    type: "D",
    difficulty: -1.4,
    hsk: 1,
    translation: "Я люблю тебя.",
    tiles: [
      { hanzi: "我", pinyin: "wǒ" },
      { hanzi: "爱", pinyin: "ài" },
      { hanzi: "你", pinyin: "nǐ" },
    ],
    correctOrder: [0, 1, 2],
  },
  {
    id: "d-002",
    type: "D",
    difficulty: -1.1,
    hsk: 1,
    translation: "Он китаец.",
    tiles: [
      { hanzi: "他", pinyin: "tā" },
      { hanzi: "是", pinyin: "shì" },
      { hanzi: "中国人", pinyin: "Zhōngguó rén" },
    ],
    correctOrder: [0, 1, 2],
  },
  // HSK 2
  {
    id: "d-003",
    type: "D",
    difficulty: -0.4,
    hsk: 2,
    translation: "Завтра я пойду в школу.",
    tiles: [
      { hanzi: "明天", pinyin: "míngtiān" },
      { hanzi: "我", pinyin: "wǒ" },
      { hanzi: "去", pinyin: "qù" },
      { hanzi: "学校", pinyin: "xuéxiào" },
    ],
    correctOrder: [0, 1, 2, 3],
  },
  {
    id: "d-004",
    type: "D",
    difficulty: -0.2,
    hsk: 2,
    translation: "Я купил два кофе.",
    tiles: [
      { hanzi: "我", pinyin: "wǒ" },
      { hanzi: "买了", pinyin: "mǎi le" },
      { hanzi: "两杯", pinyin: "liǎng bēi" },
      { hanzi: "咖啡", pinyin: "kāfēi" },
    ],
    correctOrder: [0, 1, 2, 3],
  },
  // HSK 3
  {
    id: "d-005",
    type: "D",
    difficulty: 0.4,
    hsk: 3,
    translation: "Если завтра пойдёт дождь, я не пойду.",
    tiles: [
      { hanzi: "如果", pinyin: "rúguǒ" },
      { hanzi: "明天", pinyin: "míngtiān" },
      { hanzi: "下雨", pinyin: "xiàyǔ" },
      { hanzi: "我就", pinyin: "wǒ jiù" },
      { hanzi: "不去了", pinyin: "bù qù le" },
    ],
    correctOrder: [0, 1, 2, 3, 4],
  },
  {
    id: "d-006",
    type: "D",
    difficulty: 0.7,
    hsk: 3,
    translation: "Этот ресторан гораздо лучше прошлого.",
    tiles: [
      { hanzi: "这家", pinyin: "zhè jiā" },
      { hanzi: "餐厅", pinyin: "cāntīng" },
      { hanzi: "比上一家", pinyin: "bǐ shàng yī jiā" },
      { hanzi: "好多了", pinyin: "hǎo duō le" },
    ],
    correctOrder: [0, 1, 2, 3],
  },
  // HSK 4
  {
    id: "d-007",
    type: "D",
    difficulty: 1.3,
    hsk: 4,
    translation: "Хотя я устал, но всё равно продолжу работать.",
    tiles: [
      { hanzi: "虽然", pinyin: "suīrán" },
      { hanzi: "我累了", pinyin: "wǒ lèi le" },
      { hanzi: "但是", pinyin: "dànshì" },
      { hanzi: "还要", pinyin: "hái yào" },
      { hanzi: "继续工作", pinyin: "jìxù gōngzuò" },
    ],
    correctOrder: [0, 1, 2, 3, 4],
  },
  // HSK 5
  {
    id: "d-008",
    type: "D",
    difficulty: 2.1,
    hsk: 5,
    translation: "Этот проект способствовал развитию городской экономики.",
    tiles: [
      { hanzi: "这个项目", pinyin: "zhège xiàngmù" },
      { hanzi: "促进了", pinyin: "cùjìn le" },
      { hanzi: "城市", pinyin: "chéngshì" },
      { hanzi: "经济", pinyin: "jīngjì" },
      { hanzi: "的发展", pinyin: "de fāzhǎn" },
    ],
    correctOrder: [0, 1, 2, 3, 4],
  },

  // ============================================================
  // ТИП E — Reading
  // ============================================================
  // HSK 1
  {
    id: "e-001",
    type: "E",
    difficulty: -1.0,
    hsk: 1,
    passage: "我叫王明。我是中国人。我有一个妹妹。",
    question: "Кто рассказчик?",
    options: ["русский, у него есть сестра", "китаец, у него есть младшая сестра", "китаец, у него есть младший брат", "японец, у него есть мама"],
    correctIndex: 1,
  },
  // HSK 2
  {
    id: "e-002",
    type: "E",
    difficulty: -0.3,
    hsk: 2,
    passage: "今天是星期六。早上我和朋友去公园。下午我们一起吃饭。",
    question: "Что они делали днём?",
    options: ["спали", "учились", "ели", "ходили в парк"],
    correctIndex: 2,
  },
  // HSK 3
  {
    id: "e-003",
    type: "E",
    difficulty: 0.5,
    hsk: 3,
    passage: "小李最近搬家了。新房子离公司很近，走路只要十分钟。他很高兴。",
    question: "Почему Сяо Ли рад?",
    options: ["квартира больше", "квартира ближе к работе", "квартира дешевле", "у него новые соседи"],
    correctIndex: 1,
  },
  {
    id: "e-004",
    type: "E",
    difficulty: 0.9,
    hsk: 3,
    passage: "学习外语最重要的不是天分，而是每天坚持。一个小时的复习比一周的临时抱佛脚有用得多。",
    question: "Главная мысль текста?",
    options: ["важен талант", "важна регулярность", "важны книги", "важна цель"],
    correctIndex: 1,
  },
  // HSK 4
  {
    id: "e-005",
    type: "E",
    difficulty: 1.5,
    hsk: 4,
    passage: "随着互联网的发展，越来越多的人选择在网上购物。这种方式不仅方便，而且价格通常比实体店便宜。然而，网购也带来了一些问题，比如商品质量难以保证。",
    question: "Каков вывод автора?",
    options: ["онлайн-шопинг идеален", "офлайн всегда дороже", "у онлайн-шопинга есть и плюсы, и минусы", "качество товаров в интернете лучше"],
    correctIndex: 2,
  },
  // HSK 5
  {
    id: "e-006",
    type: "E",
    difficulty: 2.2,
    hsk: 5,
    passage: "中国传统的茶文化已有数千年的历史。它不仅仅是一种饮品，更承载着丰富的文化内涵：在长辈面前敬茶被视为礼仪，朋友之间品茶是交流的方式。",
    question: "Главная идея?",
    options: ["чай — это просто напиток", "чай — это символ молодёжи", "чай — носитель культурного смысла", "чай пьют только пожилые"],
    correctIndex: 2,
  },

  // ============================================================
  // ТИП F — Stroke order (только при θ > 0.5)
  // ============================================================
  { id: "f-001", type: "F", difficulty: 0.6, hsk: 1, hanzi: "口", correctOrder: true },
  { id: "f-002", type: "F", difficulty: 0.8, hsk: 1, hanzi: "人", correctOrder: false },
  { id: "f-003", type: "F", difficulty: 1.0, hsk: 2, hanzi: "中", correctOrder: true },
  { id: "f-004", type: "F", difficulty: 1.3, hsk: 2, hanzi: "好", correctOrder: false },
  { id: "f-005", type: "F", difficulty: 1.6, hsk: 3, hanzi: "学", correctOrder: true },
];
