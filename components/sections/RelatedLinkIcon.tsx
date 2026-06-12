"use client";

import {
  Award,
  Backpack,
  Briefcase,
  Laptop,
  ShieldCheck,
  Sprout,
} from "lucide-react";

export type RelatedLinkIconName =
  | "award"
  | "backpack"
  | "briefcase"
  | "laptop"
  | "shield-check"
  | "sprout";

export default function RelatedLinkIcon({
  name,
  className,
  color,
}: {
  name: RelatedLinkIconName;
  className?: string;
  color?: string;
}) {
  const props = {
    "aria-hidden": true,
    strokeWidth: 1.4,
    className,
    style: { color },
  } as const;

  switch (name) {
    case "award":
      return <Award {...props} />;
    case "backpack":
      return <Backpack {...props} />;
    case "briefcase":
      return <Briefcase {...props} />;
    case "laptop":
      return <Laptop {...props} />;
    case "shield-check":
      return <ShieldCheck {...props} />;
    case "sprout":
      return <Sprout {...props} />;
  }
}
