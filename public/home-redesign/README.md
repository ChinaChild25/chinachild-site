# Home Redesign Draft Assets

Клади сюда иллюстрации для тренировочной главной `/home-redesign-draft`.

Файлы переименованы в SEO-friendly slug-и: lowercase, ASCII, дефисы вместо пробелов.
В черновике они подключены через `next/image`, поэтому Next.js сможет отдавать
оптимизированные варианты в современных форматах на запросе. Локально `cwebp`
и ImageMagick не установлены, а `sips` WebP не пишет, поэтому исходники пока
остаются PNG/SVG.

- `kitayskiy-dlya-shkolnikov-podrostok-s-noutbukom.webp` — большая карточка «Школьникам»
- `kitayskiy-dlya-vzroslyh-studentka-s-noutbukom.webp` — карточка «Взрослым»
- `podgotovka-hsk-papki-dokumenty.webp` — карточка «Подготовка к HSK»
- `korporativnyy-kitajskiy-gruppa-sotrudnikov.webp`, `korporativnyy-kitajskiy-papka-dokumenty.webp`, `progress-komandy-78-procent.svg` — широкая карточка «Группы для бизнеса»
- `litsenzirovannaya-programma-hsk-1-2.webp` — карточка «Лицензированная программа HSK 1–2»
- `progress-hsk-razgovornyy-uroven.svg` — карточка «Разговорный уровень за 6 месяцев»
- `mini-gruppy-do-5-chelovek-3d.webp`, `mini-gruppa-studentka-1.webp`, `mini-gruppa-studentka-2.webp`, `mini-gruppa-student-3.webp`, `mini-gruppa-studentka-4.webp` — карточка «Мини-группы до 5 человек»
- `prepodavatel-yufu-dgtu-1.webp`, `prepodavatel-yufu-dgtu-2.webp`, `prepodavatel-yufu-dgtu-3.webp` — карточка «Преподаватели ЮФУ и ДГТУ»
- `lichnyy-kabinet-chinachild-zapisi-urokov.webp` — карточка «Личный кабинет с записями уроков»
- `keshbek-za-obuchenie-kitayskomu-5-10.webp` — карточка «Дополнительный кэшбэк 5–10%»

Если заменяешь файл на другой формат или имя, поменяй путь в `components/sections/home-redesign/HomeRedesignDraftSections.tsx`.
