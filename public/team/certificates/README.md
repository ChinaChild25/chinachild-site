# Сертификаты и дипломы преподавателей

Сканы для блока «Документы и сертификаты» на странице `/team/[slug]`.
Подключаются так же, как лицензия на `/license`: файл в `public` + запись в `lib/site-data.ts`.

## Формат

- **Ориентация**: вертикальный документ (как лицензия) — 800×1132 px или близко
- **Формат**: WebP
- **Размер файла**: цель ≤ 200 КБ
- **Содержимое**: текст и печати должны читаться; при необходимости скройте лишние персональные данные

## Имена файлов

Совпадают с полем `src` в `lib/site-data.ts` (без префикса `/team/certificates/`):

| Преподаватель | Файлы |
|---------------|--------|
| anastasia-ponomareva | `anastasia-ponomareva-hsk-2.webp`, `anastasia-ponomareva-diploma.webp` |
| anastasia-erina | `anastasia-erina-hsk-4.webp` |
| zhao-li | `zhao-li-hsk-6.webp`, `zhao-li-diploma-bachelor.webp` |
| milena-karlova | `milena-karlova-hsk-4.webp`, `milena-karlova-diploma.webp` |

## После загрузки

1. Положите WebP в эту папку с именем из таблицы
2. Проверьте, что путь в `certificates[].src` в `lib/site-data.ts` совпадает
3. Задеплойте — секция появится на профиле автоматически (пока файла нет, блок скрыт)

## SEO

Сканы попадают в `hasCredential` (schema.org) и в `sitemap-images.xml` — аналогично лицензии.
