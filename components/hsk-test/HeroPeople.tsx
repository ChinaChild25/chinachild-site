/**
 * Hero people composition — a single pre-arranged fan of three photos
 * (public/hsk-test/hero-people.png, transparent) with the ChinaChild badge
 * overlapping the bottom-centre, recreating the Praktikum hero composition.
 */
export default function HeroPeople() {
  return (
    <div className="hsk-hero-people" aria-hidden>
      {/* eslint-disable @next/next/no-img-element */}
      <img
        src="/hsk-test/hero-people.png"
        alt=""
        className="hsk-hero-people-img"
        draggable={false}
      />
      <img
        src="/hsk-test/hero-badge.svg"
        alt=""
        className="hsk-hero-people-badge"
        draggable={false}
      />
      {/* eslint-enable @next/next/no-img-element */}
    </div>
  );
}
