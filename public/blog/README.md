# Изображения для статей блога

Иллюстрации, диаграммы, инфографика для постов в `/blog/[slug]`.

## Формат

- **Hero-изображение**: 1200×630 px (то же соотношение, что OG) — `<slug>-hero.webp`
- **Inline-иллюстрации**: 1200×800 px, важно держать вес ≤ 150 КБ
- **Формат**: WebP по умолчанию, AVIF — если нужно ещё легче

## Имена файлов

Используйте slug статьи + опциональный суффикс:
- `hsk-levels-explained-hero.webp`
- `hsk-levels-explained-table.webp`
- `chinese-grammar-basics-hero.webp`

## Подключение в MDX

В MDX-файле блога используйте обычный markdown:

```md
![Описание для слепых пользователей и Google Images](/blog/<slug>-hero.webp)
```

Или, если нужен `next/image` со сжатием:

```mdx
import Image from "next/image";

<Image
  src="/blog/<slug>-hero.webp"
  alt="..."
  width={1200}
  height={630}
/>
```

## SEO-смысл

- **Image search** — Google ranks images by alt + filename + surrounding text. Хорошие alt'ы → отдельная вертикаль трафика.
- **`sitemap-images.xml`** — автоматически собирает все изображения. После загрузки `npm run build` — попадут в карту.
- **Wei-Vitals (LCP)** — для hero-изображений добавьте `priority` к `<Image>`, иначе LCP проседает.

## Что положить в первую очередь

Hero-изображения для существующих 5 статей:
- `chinese-for-beginners-guide-hero.webp`
- `chinese-grammar-basics-hero.webp`
- `how-long-to-learn-chinese-hero.webp`
- `how-to-learn-chinese-from-scratch-hero.webp`
- `hsk-levels-explained-hero.webp`
