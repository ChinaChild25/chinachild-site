# Блог ChinaChild

Каждый файл `.mdx` в этой папке становится отдельной статьёй `/blog/[slug]`.

## Структура

См. `_TEMPLATE.mdx.example`. Поля frontmatter:
- `title` — заголовок статьи (до 70 символов для SERP)
- `description` — мета-описание (130–160 символов)
- `excerpt` — лид для карточки на индексной странице
- `category` — рубрика (одна из тематических)
- `readingTime` — оценочное время чтения
- `date` — дата публикации (ISO)
- `dateModified` — дата последнего обновления
- `author` — slug преподавателя из `lib/site-data.ts` (`anastasia-ponomareva`, `anastasia-erina`, `zhao-li`)
- `keywords` — через запятую, попадают в `<meta keywords>` и в `Article` schema

## Что уже есть (5 статей)

- `chinese-for-beginners-guide.mdx`
- `chinese-grammar-basics.mdx`
- `how-long-to-learn-chinese.mdx`
- `how-to-learn-chinese-from-scratch.mdx`
- `hsk-levels-explained.mdx`

## Контент-план для domination (40+ статей)

5 статей — это «тонкий контент» для Google. Цель — 40+ статей в 5 кластерах, чтобы накопить тематический авторитет.

### Кластер: HSK
- `kak-podgotovitsya-k-hsk-1` — Как подготовиться к HSK 1 за 3 месяца
- `slovarnyy-zapas-hsk-1` — Словарный запас HSK 1: 150 слов с примерами
- `slovarnyy-zapas-hsk-2` — Словарный запас HSK 2: 300 слов
- `ekzamen-hsk-1-struktura` — Экзамен HSK 1: задания и проходной балл
- `gde-sdavat-hsk-v-rossii-2026` — Где сдать HSK в России в 2026
- `hsk-vs-hskk` — HSK vs HSKK (устный): чем различаются
- `hsk-3-podgotovka` — Подготовка к HSK 3: словарь + грамматика + тексты
- `hsk-4-poshagovo` — Подготовка к HSK 4 пошагово: 6-месячный план

### Кластер: начинающим
- `kitayskiy-alfavit-mif` — Китайский алфавит — это миф
- `skolko-ieroglifov-nuzhno` — Сколько иероглифов нужно для разговора
- `kak-zapominat-ieroglify` — Как запоминать иероглифы: 5 методов
- `tony-kitayskogo-osnovy` — Тоны китайского: основы и постановка
- `pervye-50-fraz-dlya-turista` — Первые 50 фраз для туриста в Китае
- `kitayskiy-vs-yaponskiy-vs-koreyskiy` — Что легче учить
- `oshibki-novichkov-v-kitayskom` — 7 типичных ошибок начинающих

### Кластер: дети и родители
- `so-skolki-let-uchit-kitayskiy` — Со скольки лет учить китайский
- `kitayskiy-v-shkole` — Китайский в школе: программа и подготовка
- `olimpiady-po-kitayskomu-2026` — Олимпиады по китайскому языку 2026
- `oge-ege-kitayskiy` — ОГЭ/ЕГЭ по китайскому: нужен ли репетитор
- `multfilmy-na-kitayskom-dlya-detey` — Топ-10 мультфильмов на китайском
- `motivirovat-rebenka-uchit-kitayskiy` — Как мотивировать ребёнка

### Кластер: бизнес
- `zachem-biznesu-kitayskiy` — Зачем бизнесу китайский язык
- `delovaya-perepiska-s-kitaytsami` — Деловая переписка с китайскими партнёрами
- `peregovory-s-kitaytsami` — Переговоры с китайцами: культурные ошибки
- `korporativnoe-obuchenie-roi` — Корпоративное обучение китайскому: ROI
- `vstrecha-s-kitayskim-partnerom-protokol` — Протокол первой встречи

### Кластер: культура и мотивация
- `pochemu-kitayskiy-trudnee-chem-dumayut` — Почему китайский труднее, чем кажется
- `kak-ne-brosit-cherez-3-mesyatsa` — Как не бросить китайский через 3 месяца
- `istorii-vypusknikov` — Истории выпускников ChinaChild
- `kitayskaya-kalligrafiya-osnovy` — Основы китайской каллиграфии

### Сезонные / актуальные (выходят раз в квартал)
- `kak-vstretit-kitayskiy-noviy-god` — К Лунному Новому году
- `chto-podarit-kitayskomu-partneru` — К Празднику середины осени
- `chto-pochitat-na-kitayskom-letom` — Сезонный список книг

## Полезное

- Авто-линкер (`lib/blog-autolinker.tsx`) сам ставит до 18 ссылок в каждой статье на курсы, города, термины глоссария — не нужно проставлять вручную
- Article schema, OG-метаданные, atom-feed, sitemap — всё генерируется автоматически
- При добавлении статьи запустите `npm run build` локально для проверки
- Для срочной индексации после публикации триггерните `/api/indexnow` через `?secret=ENV_INDEXNOW_SECRET`
- TOC рендерится автоматически на статьях с ≥4 H2 — id заголовков считаются через `slugifyHeading` (см. `lib/blog.ts`), якоря стабильны между билдами

## Inline-иллюстрации: `:::image` (OpenAI gpt-image-1)

Сценарий: вставь блок с пустым `src` и заполненным `prompt`, скрипт сгенерирует PNG.

```
:::image
{
  "src": "",
  "alt": "Короткое описание для alt и figcaption",
  "caption": "Подпись под картинкой (опционально, иначе alt)",
  "prompt": "Подробный английский промпт для gpt-image-1: стиль, фон, цвета, надписи. Без лиц, без китайских иероглифов в изображении."
}
:::
```

Запуск генерации (один раз после `vercel env pull .env.local`):

```bash
npm run gen:images:dry   # показать план без вызова OpenAI
npm run gen:images       # сгенерировать недостающие
```

Скрипт идемпотентен: блоки с заполненным `src` пропускает; повторный запуск создаёт только новые. Файлы кладутся в `public/blog/<slug>/<NN>-<hash>.png`. Hash — детерминированный от `slug + prompt + size + model`, поэтому одинаковые промпты не дублируют файлы.

Параметры через env: `IMAGE_MODEL` (по умолчанию `gpt-image-1`), `IMAGE_SIZE` (`1536x1024` — 3:2 hero), `IMAGE_QUALITY` (`low`|`medium`|`high`), `ONLY=slug1,slug2`.

## Inline-аудио: `:::audio` (OpenAI TTS)

Сценарий: блок с китайским текстом, пиньинем и переводом. Скрипт получает MP3 от OpenAI и привязывает.

```
:::audio
{
  "src": "",
  "hanzi": "你好",
  "pinyin": "nǐ hǎo",
  "translation": "Здравствуйте",
  "ttsText": "你好"
}
:::
```

`ttsText` опционален — если не задан, скрипт берёт `hanzi`. `voice` тоже можно задать в блоке (`alloy`|`echo`|`fable`|`onyx`|`nova`|`shimmer`); по умолчанию — `OPENAI_TTS_VOICE` или `nova`.

```bash
npm run gen:audio:dry    # план
npm run gen:audio        # генерация
```

Файлы кладутся в `public/audio/blog/<slug>/<hash>.mp3`. Одинаковые `ttsText + voice + model` шарят кэш — если другая статья уже сгенерировала тот же файл по другому пути, скрипт переиспользует существующий MP3 на диске.

Стоимость: tts-1 ~$15/M символов, типичная статья (5–10 коротких реплик) — менее $0.01. gpt-image-1 high quality 1536×1024 — около $0.19 за картинку.

## Полный workflow для новой статьи с медиа

1. Написать MDX, вставить нужное число `:::image` и `:::audio` блоков с пустыми `src`.
2. `vercel env pull .env.local --environment=preview --yes` (один раз, если `.env.local` не свежий).
3. `npm run gen:images:dry && npm run gen:audio:dry` — посмотреть план и стоимость.
4. `npm run gen:images && npm run gen:audio` — реальная генерация, MDX обновится с `src` автоматически.
5. `git add public/blog public/audio content/blog && git commit`.
6. После деплоя — `/api/indexnow?secret=...` для срочной переиндексации.
