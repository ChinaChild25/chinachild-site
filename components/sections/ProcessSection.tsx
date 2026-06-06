import Image from "next/image";
import Reveal from "@/components/ui/Reveal";
import styles from "./HomeProcessResults.module.css";

const assetPath = "/home-redesign/";

const steps = [
  {
    label: "Шаг 1",
    title: (
      <>
        Бесплатный тест на
        <br />
        уровень HSK
      </>
    ),
    tone: styles.stepPurple,
    badge: styles.stepBadgePurple,
    titleClassName: "",
    revealClassName: "",
    art: styles.stepOneArt,
    image: "step-1-purple-shape.webp",
    darkImage: null,
    sizes: "(min-width: 1180px) 590px, (min-width: 768px) 50vw, 365px",
  },
  {
    label: "Шаг 2",
    title: (
      <>
        Бесплатное пробное
        <br />
        занятие
      </>
    ),
    tone: styles.stepCream,
    badge: styles.stepBadgeCream,
    titleClassName: "",
    revealClassName: "",
    art: styles.stepTwoArt,
    image: "Step 2 laptop.svg",
    darkImage: "step-2-laptop-dark.svg",
    sizes: "(min-width: 1180px) 380px, (min-width: 768px) 330px, 300px",
  },
  {
    label: "Шаг 3",
    title: (
      <>
        Регистрация и доступ к
        <br />
        личному кабинету
      </>
    ),
    tone: styles.stepLime,
    badge: styles.stepBadgeLime,
    titleClassName: styles.stepThreeTitle,
    revealClassName: styles.stepThreeReveal,
    art: styles.stepThreeArt,
    image: "step-3-green-present.webp",
    darkImage: null,
    sizes: "(min-width: 1180px) 320px, (min-width: 768px) 260px, 220px",
  },
  {
    label: "Шаг 4",
    title: (
      <>
        Занятия и регулярная
        <br />
        практика
      </>
    ),
    tone: styles.stepSky,
    badge: styles.stepBadgeSky,
    titleClassName: "",
    revealClassName: "",
    art: styles.stepFourArt,
    image: "Step 4 Clip path group.svg",
    darkImage: "step-4-clip-path-group-dark.svg",
    sizes: "(min-width: 1180px) 300px, (min-width: 768px) 250px, 220px",
  },
] as const;

export default function ProcessSection() {
  return (
    <section
      id="kak-prokhodit"
      className={`section-space ${styles.processSection}`}
      aria-labelledby="process-section-title"
    >
      <div className={styles.processShell}>
        <div className={`${styles.sectionHeader} section-head-center mx-auto max-w-3xl`}>
          <h2 id="process-section-title" className="section-title">
            Как мы приводим к разговорному уровню
          </h2>
          <p className="section-description">
            Четыре шага от бесплатного теста до регулярной практики в личном кабинете
            школы.
          </p>
        </div>
        <div className={styles.processGrid}>
          {steps.map((step) => (
            <Reveal key={step.label} className={step.revealClassName}>
              <article className={`${styles.stepCard} ${step.tone}`}>
                <div className={styles.stepCopy}>
                  <div className={`${styles.stepBadge} ${step.badge}`}>{step.label}</div>
                  <h3 className={`${styles.stepTitle} ${step.titleClassName ?? ""}`}>
                    {step.title}
                  </h3>
                </div>
                <span className={`${styles.stepArt} ${step.art}`} aria-hidden="true">
                  <Image
                    src={`${assetPath}${step.image}`}
                    alt=""
                    fill
                    sizes={step.sizes}
                    className={`${styles.artImage} ${step.darkImage ? styles.lightArtImage : ""}`}
                  />
                  {step.darkImage ? (
                    <Image
                      src={`${assetPath}${step.darkImage}`}
                      alt=""
                      fill
                      sizes={step.sizes}
                      className={`${styles.artImage} ${styles.darkArtImage}`}
                    />
                  ) : null}
                </span>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
