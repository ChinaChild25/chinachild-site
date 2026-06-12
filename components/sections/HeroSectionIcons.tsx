"use client";

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

export type OrbitIconName = "star" | "chat" | "mic" | "headphones" | "heart" | "trophy";

export function HeroArrowRightIcon() {
  return <ArrowRight aria-hidden className="home-hero-cta-icon" strokeWidth={1.8} />;
}

export function HeroInfoIcon() {
  return <Info aria-hidden className="home-hero-rating-info" strokeWidth={1.8} />;
}

export function HeroOrbitIcon({ name }: { name: OrbitIconName }) {
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
