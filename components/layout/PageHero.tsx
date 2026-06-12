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
  /** Прямой класс фона блока (переопределяет variant). Для страниц курсов —
   *  чтобы тон совпадал с карточкой курса на главной. */
  heroToneClass?: string;
  illustration?: string;
  illustrationAlt?: string;
  illustrationWidth?: number;
  illustrationHeight?: number;
  /** Если true — иллюстрация не «карточкой по центру», а крупным кадром,
   *  прижатым к правому нижнему углу блока (как на карточках главной). */
  illustrationFill?: boolean;
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
  heroToneClass,
  illustration,
  illustrationAlt = "",
  illustrationWidth = 480,
  illustrationHeight = 480,
  illustrationFill = false,
}: PageHeroProps) {
  const hasContained = Boolean(illustration) && !illustrationFill;
  const hasMedia = Boolean(illustration) && illustrationFill;

  return (
    <section className="page-shell-wide page-hero-section">
      <div
        className={cn(
          "page-hero-card",
          heroToneClass ?? variantClasses[variant],
          hasMedia && "page-hero-card--media"
        )}
      >
        <div
          className={cn(
            "page-hero-layout",
            hasContained && "page-hero-layout--has-illustration"
          )}
        >
          {/* ── Текст ── */}
          <div className="page-hero-content">
            {eyebrow && (
              <span className="eyebrow eyebrow-on-light">{eyebrow}</span>
            )}

            <h1 className="page-hero-title">{title}</h1>

            {description && (
              <p className="page-hero-description">{description}</p>
            )}
          </div>

          {/* ── Иллюстрация-карточка (по центру правой колонки) ── */}
          {hasContained && (
            <div className="page-hero-illustration" aria-hidden>
              <Image
                src={illustration!}
                alt={illustrationAlt || ""}
                width={illustrationWidth}
                height={illustrationHeight}
                className="page-hero-illustration-img"
                priority
              />
            </div>
          )}

          {/* ── CTA ── */}
          {(primaryCta || secondaryCta) && (
            <div className="page-hero-ctas">
              {primaryCta &&
                (isModalCta(primaryCta) ? (
                  <LeadModal
                    triggerClassName={buttonStyles({ size: "large" })}
                    source="page-hero"
                    defaultCourse={primaryCta.defaultCourse}
                    suppressFloatingCta
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
                ))}

              {secondaryCta &&
                (isModalCta(secondaryCta) ? (
                  <LeadModal
                    triggerClassName={buttonStyles({
                      variant: "secondary",
                      size: "large",
                    })}
                    source="page-hero-secondary"
                    defaultCourse={secondaryCta.defaultCourse}
                    suppressFloatingCta
                  >
                    {secondaryCta.label}
                  </LeadModal>
                ) : (
                  <Link
                    href={secondaryCta.href}
                    target={secondaryCta.external ? "_blank" : undefined}
                    rel={secondaryCta.external ? "noreferrer" : undefined}
                    className={buttonStyles({
                      variant: "secondary",
                      size: "large",
                    })}
                  >
                    {secondaryCta.label}
                  </Link>
                ))}
            </div>
          )}
        </div>

        {/* ── Иллюстрация-кадр в правом нижнем углу (стиль карточек главной) ── */}
        {hasMedia && (
          <div className="page-hero-media" aria-hidden>
            <Image
              src={illustration!}
              alt={illustrationAlt || ""}
              width={illustrationWidth}
              height={illustrationHeight}
              className="page-hero-media-img"
              sizes="(min-width: 768px) 44vw, 88vw"
              priority
            />
          </div>
        )}
      </div>
    </section>
  );
}
