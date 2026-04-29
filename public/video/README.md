# Видео-материалы

Промо-видео и видеоконтент школы. После загрузки заполните поля в `lib/site-config.ts` (объект `PROMO_VIDEO`) — VideoObject schema автоматически появится в site graph.

## Промо-видео главной страницы

### Файлы

- `promo.mp4` — основной видео-файл (если хостите у себя). 1920×1080, ≤ 30 МБ. H.264 + AAC.
- `promo-poster.jpg` — превью кадра (1280×720, до 200 КБ). Показывается до клика на play.
- `promo.webm` *(опционально)* — альтернативный формат для лучшей совместимости.

### Альтернатива: YouTube/VK

Можно не хостить видео локально — просто положите URL в `PROMO_VIDEO.contentUrl`:

```ts
contentUrl: "https://youtu.be/abc123",
thumbnailUrl: "/video/promo-poster.jpg",  // всё равно нужно
```

## Параметры в lib/site-config.ts

После загрузки заполните:

```ts
export const PROMO_VIDEO = {
  contentUrl: "https://youtu.be/...",  // или "/video/promo.mp4"
  thumbnailUrl: "/video/promo-poster.jpg",
  duration: "PT2M30S",      // 2 мин 30 сек в формате ISO 8601
  uploadDate: "2026-05-01",
  name: "ChinaChild — онлайн-школа китайского языка",
  description: "Видеовизитка...",
};
```

## Что входит в SEO

VideoObject schema → отображение видео-поиске Google (отдельная вертикаль).
Добавляет видеоминиатюру в обычные результаты поиска. Усиливает E-E-A-T —
Google видит, что за брендом стоит реальная школа с реальным видео-контентом.

## Опционально: видео-уроки

`lesson-1-pinyin.mp4`, `lesson-2-tones.mp4` и т.д. — отдельные ролики для
страниц курсов. Каждый можно подключить через дополнительные VideoObject
nodes в schema (см. `lib/schema.ts`, функция `createPromoVideoNode` — копируйте
паттерн).
