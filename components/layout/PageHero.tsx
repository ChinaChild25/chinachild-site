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

export default function PageHero({
  eyebrow,
  title,
  description,
  primaryCta,
  secondaryCta,
  variant = "violet",
}: PageHeroProps) {
  // Все четыре пастели — светлые, поэтому текст всегда тёмный.
  // Это исправляет проблему белого h1 на лавандовом #D8D3FF, где он не читался.
  return (
    <section className="page-shell-wide pt-6 pb-12 sm:pt-10 lg:pb-16">
      <div className={cn("card-block card-block-lg", variantClasses[variant])}>
        <div className="max-w-3xl">
          {eyebrow ? (
            <span className="eyebrow eyebrow-on-light">{eyebrow}</span>
          ) : null}
          <h1 className="mt-6 text-[2.25rem] font-medium leading-[1.08] tracking-[-0.025em] text-[#262626] sm:text-[3rem] lg:text-[3.5rem]">
            {title}
          </h1>
          {description ? (
            <p className="mt-6 max-w-2xl text-base leading-[1.55] text-[#262626]/72 sm:text-[1.125rem]">
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
