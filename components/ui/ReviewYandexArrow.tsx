// Кружок со стрелкой в углу карточки отзыва — «чернильный» вариант того же
// affordance, что у карточки преподавателя (TeacherCard). Появляется только
// на отзывах, у которых есть ссылка на Яндекс.Карты; при ховере карточки
// (group) стрелка проворачивается на 90°. Стили — .review-card-icon в globals.css.
export default function ReviewYandexArrow() {
  return (
    <span className="review-card-icon" aria-hidden="true">
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="transition-transform duration-200 group-hover:rotate-90"
      >
        <path d="M4 20 20 4" />
        <path d="M9 4h11v11" />
      </svg>
    </span>
  );
}
