import type { CSSProperties } from "react";
import {
  ArrowRight,
  Headphones,
  Heart,
  Info,
  MessageCircleMore,
  Mic,
  Star,
  Trophy,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import LeadModal from "@/components/forms/LeadModal";
import { buttonStyles } from "@/components/ui/button";
import { siteFacts } from "@/lib/site-data";

const orbitItems: Array<{
  src: string;
  alt: string;
  icon: OrbitIconName;
  className: string;
  iconSide: "left" | "right";
  iconColor: string;
  priority?: boolean;
}> = [
  {
    src: "/hero/orbit/Asian%20male%20student%20portrait.webp",
    alt: "Студент ChinaChild",
    icon: "star",
    className: "home-hero-orbit-card--top-left",
    iconSide: "right",
    iconColor: "#c9c9c9",
    priority: true,
  },
  {
    src: "/hero/orbit/purple-haired%20male%20student%20portrait.webp",
    alt: "Студент ChinaChild",
    icon: "chat",
    className: "home-hero-orbit-card--top-right",
    iconSide: "right",
    iconColor: "#8274ff",
    priority: true,
  },
  {
    src: "/hero/orbit/female%20student%20with%20glasses.webp",
    alt: "Студентка ChinaChild",
    icon: "mic",
    className: "home-hero-orbit-card--left",
    iconSide: "left",
    iconColor: "#70b8ff",
  },
  {
    src: "/hero/orbit/smiling%20male%20student%20with%20backpack.webp",
    alt: "Студент ChinaChild",
    icon: "headphones",
    className: "home-hero-orbit-card--right",
    iconSide: "right",
    iconColor: "#bdb49f",
  },
  {
    src: "/hero/orbit/smiling%20indian%20female%20student.webp",
    alt: "Студентка ChinaChild",
    icon: "heart",
    className: "home-hero-orbit-card--bottom-left",
    iconSide: "left",
    iconColor: "#c56cff",
  },
  {
    src: "/hero/orbit/african%20college%20student%20portrait.webp",
    alt: "Студент ChinaChild",
    icon: "trophy",
    className: "home-hero-orbit-card--bottom-right",
    iconSide: "right",
    iconColor: "#d78daf",
  },
];

type OrbitIconName = "star" | "chat" | "mic" | "headphones" | "heart" | "trophy";

function HeroOrbitIcon({ name }: { name: OrbitIconName }) {
  const className = "home-hero-orbit-icon-svg";
  switch (name) {
    case "star":
      return <Star aria-hidden className={className} strokeWidth={1.8} />;
    case "chat":
      return <MessageCircleMore aria-hidden className={className} strokeWidth={1.8} />;
    case "mic":
      return <Mic aria-hidden className={className} strokeWidth={1.8} />;
    case "headphones":
      return <Headphones aria-hidden className={className} strokeWidth={1.8} />;
    case "heart":
      return <Heart aria-hidden className={className} strokeWidth={1.8} />;
    case "trophy":
      return <Trophy aria-hidden className={className} strokeWidth={1.8} />;
  }
}

export default function HeroSection() {
  return (
    <section className="home-hero page-shell-wide" aria-labelledby="home-hero-title">
      <div className="home-hero-stage">
        <div className="home-hero-orbit" aria-hidden="true">
          <svg className="home-hero-orbit-line" viewBox="0 0 200 100" preserveAspectRatio="none">
            <path d="M30 15 C80 4 120 3 168 12 C184 20 192 35 186 49 C192 63 184 76 168 82 C120 96 80 96 32 82 C16 76 8 62 14 48 C8 34 16 22 30 15 Z" />
          </svg>
          <span className="home-hero-orbit-dots">
            <span className="home-hero-orbit-dot home-hero-orbit-dot--one" />
            <span className="home-hero-orbit-dot home-hero-orbit-dot--two" />
            <span className="home-hero-orbit-dot home-hero-orbit-dot--three" />
            <span className="home-hero-orbit-dot home-hero-orbit-dot--four" />
            <span className="home-hero-orbit-dot home-hero-orbit-dot--five" />
          </span>

          {orbitItems.map((item) => {
            return (
              <div
                key={`${item.src}-${item.className}`}
                className={`home-hero-orbit-card ${item.className}`}
                style={{ "--hero-orbit-icon-color": item.iconColor } as CSSProperties}
              >
                <Image
                  src={item.src}
                  alt={item.alt}
                  fill
                  sizes="(max-width: 767px) 64px, (max-width: 1279px) 96px, 132px"
                  className="home-hero-orbit-image"
                  priority={item.priority}
                />
                <span className={`home-hero-orbit-icon home-hero-orbit-icon--${item.iconSide}`}>
                  <HeroOrbitIcon name={item.icon} />
                </span>
              </div>
            );
          })}
        </div>

        <div className="home-hero-content">
          <Link
            href="#otzyvy"
            className="home-hero-rating"
            aria-label="Средняя оценка выпускников по отзывам"
          >
            <span aria-hidden className="home-hero-rating-star">★</span>
            <span className="home-hero-rating-value">{siteFacts.aggregateRating} из 5</span>
            <span className="home-hero-rating-copy">· на основании отзывов выпускников</span>
            <Info aria-hidden className="home-hero-rating-info" strokeWidth={1.8} />
          </Link>

          <div className="home-hero-license">
            Лицензированная программа · Москва
          </div>

          <h1 id="home-hero-title" className="home-hero-title">
            <span>Курсы китайского языка</span>
            <span>
              онлайн <span className="home-hero-title-dash" aria-hidden />
            </span>
            <span>разговорный уровень</span>
            <span>за 6 месяцев</span>
          </h1>

          <div className="home-hero-mobile-avatars" aria-hidden="true">
            {orbitItems.map((item) => (
              <span key={`mobile-${item.src}`} className="home-hero-mobile-avatar">
                <Image
                  src={item.src}
                  alt=""
                  fill
                  sizes="60px"
                  className="home-hero-mobile-avatar-image"
                />
              </span>
            ))}
          </div>

          <p className="home-hero-description">
            Онлайн-школа ChinaChild. Лицензированный курс HSK 1–2: фонетика,
            грамматика, лексика, аудирование, чтение и говорение в единой логике.
            Подходит подросткам с 12 лет и взрослым без подготовки.
          </p>

          <div className="home-hero-actions">
            <LeadModal
              triggerClassName={buttonStyles({
                size: "large",
                className: "home-hero-primary-cta",
              })}
              source="hero"
            >
              <span>Записаться на пробный урок</span>
              <ArrowRight aria-hidden className="home-hero-cta-icon" strokeWidth={1.8} />
            </LeadModal>
            <Link
              href="/courses"
              className={buttonStyles({
                variant: "secondary",
                size: "large",
                className: "home-hero-secondary-cta",
              })}
            >
              Смотреть курсы
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
