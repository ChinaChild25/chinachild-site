# Глоссарий ChinaChild

Каждый файл `.mdx` в этой папке становится отдельной страницей `/glossary/[slug]`.

## Структура файла

См. `_TEMPLATE.mdx.example` — копируйте его и переименовывайте.

Поля frontmatter:
- `term` — отображаемое название термина (с заглавной буквы)
- `shortDefinition` — одно предложение, идёт в OG-описание и под заголовок
- `related` — список слагов через запятую (`hsk, pinyin, putonghua`)
- `updatedAt` — ISO-дата (`2026-04-29T00:00:00.000Z`); попадает в schema.org `dateModified` и sitemap

## Что уже есть

- `hsk.mdx` — экзамен HSK
- `pinyin.mdx` — пиньинь
- `putonghua.mdx` — путунхуа

## Рекомендованные следующие термины (по SEO-приоритету)

Длинный хвост по китайскому — самый дешёвый трафик в нише. Ниже список из 50 терминов, которые имеет смысл добавить:

### Высокий приоритет — экзамены и уровни
- `tones` — тоны путунхуа
- `hanzi` — иероглифы
- `mandarin` — мандаринский диалект
- `hsk-1`, `hsk-2`, `hsk-3`, `hsk-4`, `hsk-5`, `hsk-6` — отдельные слаги по уровням
- `hskk` — устный экзамен HSKK
- `taocl` — экзамен по бизнес-китайскому

### Средний приоритет — лингвистика
- `chengyu` — чэнъюй (фразеологизмы)
- `measure-words` — счётные слова
- `radicals` — ключи иероглифов
- `tone-marks` — диакритика над пиньинем
- `tone-sandhi` — изменение тонов в речи
- `simplified-vs-traditional` — упрощённые и традиционные иероглифы
- `wenyan` — классический китайский (вэньянь)
- `baihua` — современный язык байхуа

### Низкий приоритет — культура и контекст
- `confucius-institute` — Институт Конфуция
- `chinesetest` — портал chinesetest.cn
- `ching-ming` — Цинмин (праздник)
- `lunar-new-year` — Китайский Новый год
- `mid-autumn-festival` — праздник середины осени
- `wechat` — WeChat
- `weibo` — Weibo
- `douyin` — Douyin (китайский TikTok)
- `xiaohongshu` — Xiaohongshu / RED

### Учебные методики
- `spaced-repetition` — интервальные повторения
- `pleco` — словарь Pleco
- `anki` — Anki для иероглифов
- `du-chinese` — приложение Du Chinese
- `hellochinese` — приложение HelloChinese
- `lingq` — LingQ
- `comprehensible-input` — понятный ввод

### Преподавание и сертификаты
- `tcsl` — Teaching Chinese as a Second Language
- `cefr-china` — соответствие HSK уровням CEFR
- `business-chinese` — деловой китайский
- `medical-chinese` — медицинский китайский
- `legal-chinese` — юридический китайский

### Российский контекст
- `mgu-confucius` — Институт Конфуция при МГУ
- `spbgu-confucius` — Институт Конфуция при СПбГУ
- `kazan-confucius`, `dvfu-confucius`, `nstu-confucius`, `ufu-confucius` — другие центры
- `russian-china-trade` — российско-китайская торговля и язык
- `tax-deduction` — налоговый вычет за обучение

После каждого добавленного термина:
1. Запустите `npm run build` локально, проверьте что страница рендерится
2. Закоммитьте — Vercel задеплоит сам
3. Cron `/api/indexnow` отправит новый URL в Yandex/Bing на следующий день
