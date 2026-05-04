import Image from "next/image";
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
  /** Путь к иллюстрации (из /public). Если не указан — одноколоночный layout. */
  illustration?: string;
  illustrationAlt?: string;
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
  illustration,
  illustrationAlt = "",
}: PageHeroProps) {
  return (
    <section className="page-shell-wide page-hero-section">
      <div className={cn("page-hero-card", variantClasses[variant])}>
        <div className={cn("page-hero-layout", illustration && "page-hero-layout--has-illustration")}>

          {/* ── Текстовая колонка ── */}
          <div className="page-hero-content">
            {eyebrow && (
              <span className="eyebrow eyebrow-on-light">{eyebrow}</span>
            )}
            <h1 className="page-hero-title">{title}</h1>
            {description && (
              <p className="page-hero-description">{description}</p>
            )}
            {(primaryCta || secondaryCta) && (
              <div className="page-hero-ctas">
                {primaryCta && (
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
                )}
                {secondaryCta && (
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
                )}
              </div>
            )}
          </div>

          {/* ── Иллюстрация ── */}
          {illustration && (
            <div className="page-hero-illustration" aria-hidden>
              <Image
                src={illustration}
                alt={illustrationAlt}
                width={480}
                height={480}
                className="page-hero-illustration-img"
                priority
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}