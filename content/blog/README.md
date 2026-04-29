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

- Авто-линкер (`lib/blog-autolinker.tsx`) сам ставит до 12 ссылок в каждой статье на курсы, города, термины глоссария — не нужно проставлять вручную
- Article schema, OG-метаданные, atom-feed, sitemap — всё генерируется автоматически
- При добавлении статьи запустите `npm run build` локально для проверки
- Для срочной индексации после публикации триггерните `/api/indexnow` через `?secret=ENV_INDEXNOW_SECRET`
