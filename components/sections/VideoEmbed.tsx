import { PROMO_VIDEO } from "@/lib/site-config";

type VideoEmbedProps = {
  /** Дополнительная подпись над видео — eyebrow */
  eyebrow?: string;
  /** H2 над видео */
  title?: string;
  /** Описание под заголовком */
  description?: string;
  /** Контейнер. По умолчанию `card-cream-soft` */
  cardClassName?: string;
};

/**
 * Промо-видео школы. Рендерится ТОЛЬКО если в `PROMO_VIDEO.contentUrl`
 * заполнен URL — иначе компонент возвращает `null`, чтобы пустой
 * `<iframe>` не висел и не ломал CLS.
 *
 * Поддерживает:
 *  - YouTube (https://youtu.be/..., https://www.youtube.com/watch?v=...)
 *  - VK Video (https://vk.com/video-12345_67890, https://vkvideo.ru/...)
 *  - Прямой URL `.mp4` / `.webm` — рендерим `<video>` с poster.
 *
 * Превью (`thumbnailUrl`) обязательно — Google требует ImageObject в
 * VideoObject schema, и одинаково — превью в OG/lazy-loading.
 */
export default function VideoEmbed({
  eyebrow,
  title,
  description,
  cardClassName = "card-block card-block-lg card-cream-soft",
}: VideoEmbedProps) {
  if (!PROMO_VIDEO.contentUrl) {
    return null;
  }

  const embed = buildEmbedSource(PROMO_VIDEO.contentUrl);
  if (!embed) {
    return null;
  }

  return (
    <section className="page-shell-wide section-space">
      <div className={cardClassName}>
        {eyebrow ? (
          <span className="tag-pill">{eyebrow}</span>
        ) : null}
        {title ? (
          <h2 className="mt-4 text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[#1b1b1b] sm:text-4xl">
            {title}
          </h2>
        ) : null}
        {description ? (
          <p className="mt-4 max-w-3xl text-base leading-[1.65] text-[#4b4b4b]">
            {description}
          </p>
        ) : null}
        <div className="mt-8 overflow-hidden rounded-[20px] border border-black/5 bg-black/5">
          {embed.kind === "iframe" ? (
            <div className="relative aspect-video w-full">
              <iframe
                src={embed.src}
                title={PROMO_VIDEO.name || "Видеовизитка ChinaChild"}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                className="absolute inset-0 h-full w-full"
              />
            </div>
          ) : (
            <video
              src={embed.src}
              {...(PROMO_VIDEO.thumbnailUrl ? { poster: PROMO_VIDEO.thumbnailUrl } : {})}
              controls
              preload="none"
              className="block aspect-video w-full bg-black"
            >
              <track kind="captions" />
            </video>
          )}
        </div>
      </div>
    </section>
  );
}

type EmbedSource =
  | { kind: "iframe"; src: string }
  | { kind: "video"; src: string };

function buildEmbedSource(raw: string): EmbedSource | null {
  const url = raw.trim();
  if (!url) return null;

  // YouTube — youtu.be/<id> либо youtube.com/watch?v=<id>
  const ytMatch =
    url.match(/youtu\.be\/([\w-]{6,})/) ||
    url.match(/youtube\.com\/watch\?v=([\w-]{6,})/) ||
    url.match(/youtube\.com\/embed\/([\w-]{6,})/);
  if (ytMatch) {
    const id = ytMatch[1];
    return {
      kind: "iframe",
      src: `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1`,
    };
  }

  // VK Video — vk.com/video<oid>_<vid> или vkvideo.ru/video-<oid>_<vid>
  const vkMatch = url.match(/(?:vk\.com|vkvideo\.ru)\/video(-?\d+)_(\d+)/);
  if (vkMatch) {
    const [, oid, vid] = vkMatch;
    return {
      kind: "iframe",
      src: `https://vkvideo.ru/video_ext.php?oid=${oid}&id=${vid}&hd=2`,
    };
  }

  // Прямой URL .mp4 / .webm / .mov
  if (/\.(mp4|webm|mov)(\?.*)?$/i.test(url)) {
    return { kind: "video", src: url };
  }

  return null;
}
