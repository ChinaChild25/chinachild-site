import Link from "next/link";
import LeadModal from "@/components/forms/LeadModal";
import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type CtaLink = { label: string; href: string; external?: boolean };
type CtaModal = { label: string; modal: true; defaultCourse?: string };
type Cta = CtaLink | CtaModal;

type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  primaryCta?: Cta;
  secondaryCta?: Cta;
  variant?: "violet" | "cream" | "lime" | "sky";
};

function isModalCta(cta: Cta): cta is CtaModal {
  return "modal" in cta && cta.modal === true;
}

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
              "mt-6 text-[2.25rem] font-normal leading-[1.1] tracking-[-0.02em] sm:text-[3rem] lg:text-[3.5rem]",
              onDark ? "text-white" : "text-[#1e1e1e]",
            )}
          >
            {title}
          </h1>
          {description ? (
            <p
              className={cn(
                "mt-6 max-w-2xl text-base leading-[1.55] sm:text-[1.125rem]",
                onDark ? "text-white/85" : "text-[#4b4b4b]",
              )}
            >
              {description}
            </p>
          ) : null}

          {(primaryCta || secondaryCta) && (
            <div className="mt-8 flex flex-wrap gap-3">
              {primaryCta ? (
                isModalCta(primaryCta) ? (
                  <LeadModal
                    triggerClassName={buttonStyles({ size: "large" })}
                    source="page-hero"
                    defaultCourse={primaryCta.defaultCourse}
                  >
                    {primaryCta.label}
                  </LeadModal>
                ) : (
                  <Link
                    href={primaryCta.href}
                    target={primaryCta.external ? "_blank" : undefined}
                    rel={primaryCta.external ? "noreferrer" : undefined}
                    className={buttonStyles({ size: "large" })}
                  >
                    {primaryCta.label}
                  </Link>
                )
              ) : null}
              {secondaryCta ? (
                isModalCta(secondaryCta) ? (
                  <LeadModal
                    triggerClassName={buttonStyles({ variant: "secondary", size: "large" })}
                    source="page-hero-secondary"
                    defaultCourse={secondaryCta.defaultCourse}
                  >
                    {secondaryCta.label}
                  </LeadModal>
                ) : (
                  <Link
                    href={secondaryCta.href}
                    target={secondaryCta.external ? "_blank" : undefined}
                    rel={secondaryCta.external ? "noreferrer" : undefined}
                    className={buttonStyles({ variant: "secondary", size: "large" })}
                  >
                    {secondaryCta.label}
                  </Link>
                )
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
