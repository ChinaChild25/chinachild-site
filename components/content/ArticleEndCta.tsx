import Link from "next/link";
import LeadModal from "@/components/forms/LeadModal";
import { buttonStyles } from "@/components/ui/button";

/**
 * Блок заявки в конце статьи.
 *
 * До сентября 2026 у страницы статьи не было ни одного пути к заявке: ни формы,
 * ни ссылки на тест, ни похожих материалов. Блог давал 69% органики и 0,113%
 * конверсии против 0,699% у остального сайта.
 *
 * Экзаменационные статьи ведут на бесплатный тест уровня: он самый вовлекающий
 * элемент сайта (89% дошедших до результата), но из блога в него приходило
 * меньше половины процента читателей.
 */
type ArticleEndCtaProps = {
  slug: string;
  category: string;
};

const EXAM_CATEGORIES = new Set(["Экзамены", "HSK"]);

export default function ArticleEndCta({ slug, category }: ArticleEndCtaProps) {
  const examOriented = EXAM_CATEGORIES.has(category);

  const title = examOriented
    ? "Узнайте свой уровень и получите план подготовки"
    : "Не уверены, с чего начать?";

  const body = examOriented
    ? "Пройдите бесплатный тест — он определит уровень по шкале HSK за 15 минут. Куратор разберёт результат и подберёт программу под вашу цель и срок."
    : "Методист разберёт вашу цель, определит текущий уровень и подберёт программу и преподавателя. Бесплатно и без обязательств.";

  return (
    <aside className="mx-auto mt-16 max-w-3xl">
      <div className="card-block card-cream-soft">
        <span className="eyebrow eyebrow-on-light">ChinaChild</span>
        <h2 className="mt-4 text-[1.5rem] font-medium leading-[1.2] tracking-[-0.01em] text-[#1b1b1b] sm:text-[1.75rem]">
          {title}
        </h2>
        <p className="mt-3 max-w-[520px] text-base leading-[1.55] text-[#4b4b4b]">
          {body}
        </p>
        <div className="mt-7 flex flex-wrap items-center gap-3">
          <LeadModal
            triggerClassName={buttonStyles({ size: "large" })}
            source={`blog-${slug}`}
            defaultCourse={examOriented ? "hsk-preparation" : ""}
            ariaLabel="Записаться на бесплатный пробный урок"
            suppressFloatingCta
          >
            Записаться на пробный урок
          </LeadModal>
          <Link
            href={examOriented ? "/chinese/hsk-test" : "/courses"}
            className={buttonStyles({ variant: "secondary", size: "large" })}
          >
            {examOriented ? "Пройти бесплатный тест" : "Посмотреть программы"}
          </Link>
        </div>
      </div>
    </aside>
  );
}
