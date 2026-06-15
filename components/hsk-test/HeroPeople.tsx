import Image from "next/image";

/**
 * Hero people composition — a single pre-arranged fan of three photos
 * (public/hsk-test/hero-people.webp, transparent) with the ChinaChild badge
 * overlapping the bottom-centre, recreating the Praktikum hero composition.
 *
 * This collage is the LCP element on the /chinese/hsk-test landing, so it goes
 * through next/image with `priority` (preload + high fetch priority) and serves
 * a right-sized AVIF/WebP variant — the photo renders at ≤560px but the source
 * is 1200px wide. The badge is a tiny SVG; it stays a plain <img>.
 */
export default function HeroPeople() {
  return (
    <div className="hsk-hero-people" aria-hidden>
      <Image
        src="/hsk-test/hero-people.webp"
        alt=""
        width={1200}
        height={687}
        sizes="(max-width: 600px) 90vw, 560px"
        className="hsk-hero-people-img"
        priority
        draggable={false}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/hsk-test/hero-badge.svg"
        alt=""
        className="hsk-hero-people-badge"
        draggable={false}
      />
    </div>
  );
}
