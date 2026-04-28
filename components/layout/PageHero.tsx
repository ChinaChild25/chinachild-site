import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  primaryCta?: { label: string; href: string; external?: boolean };
  secondaryCta?: { label: string; href: string };
  variant?: "violet" | "cream" | "lime" | "sky";
};

const variantClasses = {
  violet: "card-violet",
  cream: "card-cream",
  lime: "card-lime",
  sky: "card-sky",
} as const;

const isLight = (variant: PageHeroProps["variant"]) => variant === "violet";

export default function PageHero({
  eyebrow,
  title,
  description,
  primaryCta,
  secondaryCta,
  variant = "violet",
}: PageHeroProps) {
  const onDark = isLight(variant);
  return (
    <section className="page-shell-wide pt-4 pb-10 sm:pt-6 lg:pb-14">
      <div className={cn("card-block card-block-lg", variantClasses[variant])}>
        <div className="max-w-3xl">
          {eyebrow ? (
            <span className={cn("eyebrow", !onDark && "bg-black/8 text-[#1b1b1b]")}>{eyebrow}</span>
          ) : null}
          <h1
            className={cn(
              "mt-6 text-[2.2rem] font-bold leading-[1.04] tracking-[-0.04em] sm:text-[3rem] lg:text-[3.4rem]",
              onDark ? "text-white" : "text-[#1b1b1b]",
            )}
          >
            {title}
          </h1>
          {description ? (
            <p
              className={cn(
                "mt-6 max-w-2xl text-base leading-7 sm:text-lg",
                onDark ? "text-white/85" : "text-[#4b4b4b]",
              )}
            >
              {description}
            </p>
          ) : null}

          {(primaryCta || secondaryCta) && (
            <div className="mt-8 flex flex-wrap gap-3">
              {primaryCta ? (
                <Link
                  href={primaryCta.href}
                  target={primaryCta.external ? "_blank" : undefined}
                  rel={primaryCta.external ? "noreferrer" : undefined}
                  className={buttonStyles({ size: "large" })}
                >
                  {primaryCta.label}
                </Link>
              ) : null}
              {secondaryCta ? (
                <Link
                  href={secondaryCta.href}
                  className={buttonStyles({ variant: "secondary", size: "large" })}
                >
                  {secondaryCta.label}
                </Link>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
