import type { IndividualCourseModule } from "@/lib/course-modules";
import {
  INDIVIDUAL_MODULE_CONTINUATION_COPY,
  INDIVIDUAL_MODULE_TERMS,
} from "@/lib/course-modules";

export default function IndividualModuleSection({
  module,
}: {
  module: IndividualCourseModule;
}) {
  return (
    <section
      id="individual-module"
      className="page-shell-wide section-space"
      aria-labelledby="individual-module-title"
    >
      <div className="card-block card-block-lg card-violet-soft">
        <div className="max-w-3xl">
          <span className="tag-pill">Индивидуальный модуль</span>
          <h2
            id="individual-module-title"
            className="mt-4 text-[1.75rem] font-normal tracking-[-0.02em] leading-[1.15] text-[var(--ink)] sm:text-4xl"
          >
            {module.name} — {INDIVIDUAL_MODULE_TERMS.priceLabel} за месяц
          </h2>
          <p className="mt-4 text-base leading-[1.65] text-[var(--muted-strong)]">
            {INDIVIDUAL_MODULE_TERMS.lessonCount} индивидуальных занятий по{" "}
            {INDIVIDUAL_MODULE_TERMS.lessonMinutes} минут с преподавателем, всего{" "}
            {INDIVIDUAL_MODULE_TERMS.guidedHours} часов. Это не подписка и не
            рассрочка.
          </p>
          <p className="mt-3 text-base leading-[1.65] text-[var(--muted-strong)]">
            {INDIVIDUAL_MODULE_CONTINUATION_COPY}
          </p>
          <p className="mt-3 text-sm leading-[1.6] text-[var(--muted-strong)]">
            {module.description}
          </p>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {module.stages.map((stage) => (
            <article
              key={stage.order}
              className="card-block card-cream-soft h-full"
            >
              <span className="tag-pill">Этап {stage.order} · {stage.hours} ч</span>
              <h3 className="mt-4 text-[1.2rem] font-medium tracking-[-0.01em] leading-[1.2] text-[var(--ink)]">
                {stage.title}
              </h3>
              <p className="mt-3 text-sm leading-[1.6] text-[var(--muted-strong)]">
                {stage.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
