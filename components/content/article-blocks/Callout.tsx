import type { CalloutVariant } from "@/lib/blog";

type CalloutProps = {
  variant: CalloutVariant;
  title?: string;
  body: string;
};

/** Praktikum-style callout: цельная пастельная подложка из палитры сайта,
 *  без обводки, без иконок-«украшений». Заголовок встроен жирным в первое
 *  предложение, как «Важно запомнить:» в блогах Yandex Praktikum. */
export default function Callout({ variant, title, body }: CalloutProps) {
  return (
    <aside
      className={`article-callout article-callout--${variant}`}
      data-block="callout"
      data-variant={variant}
      role="note"
    >
      <p className="article-callout__body">
        {title ? (
          <strong className="article-callout__title">{title}.</strong>
        ) : null}{" "}
        {body}
      </p>
    </aside>
  );
}
