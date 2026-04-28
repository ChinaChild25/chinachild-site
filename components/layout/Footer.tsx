import Link from "next/link";
import { footerLinks } from "@/lib/site-data";
import {
  APP_URL,
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_TEL,
  LICENSE_PROGRAM,
  LICENSE_REGION,
  SITE_URL,
} from "@/lib/site-config";

export default function Footer() {
  return (
    <footer className="border-t border-[rgba(0,0,0,0.06)] bg-[#f6f5f2] py-16 text-[#1b1b1b]">
      <div className="page-shell grid gap-10 md:grid-cols-[1.2fr_0.8fr]">
        <div className="max-w-xl">
          <div className="text-2xl font-bold tracking-[-0.03em]">ChinaChild</div>
          <p className="mt-4 text-sm leading-7 text-[#6b6b6b]">
            Онлайн-школа китайского языка ChinaChild (HSK+). Лицензированная
            программа по достижению разговорного уровня уже через 6 месяцев
            обучения. Обучение для подростков с 12 лет и взрослых.
          </p>
          <div className="mt-6 grid gap-2 text-sm text-[#1b1b1b]">
            <a href={`tel:${CONTACT_PHONE_TEL}`} className="font-semibold transition hover:text-[#5c5cff]">
              {CONTACT_PHONE}
            </a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#6b6b6b] transition hover:text-[#1b1b1b]">
              {CONTACT_EMAIL}
            </a>
            <a href={SITE_URL} className="text-[#6b6b6b] transition hover:text-[#1b1b1b]">
              chinachild.ru
            </a>
            <a href={APP_URL} className="text-[#6b6b6b] transition hover:text-[#1b1b1b]">
              app.chinachild.ru
            </a>
          </div>
        </div>

        <nav aria-label="Подвал сайта" className="grid gap-3 sm:grid-cols-2">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-[#6b6b6b] transition hover:text-[#1b1b1b]"
            >
              {link.title}
            </Link>
          ))}
        </nav>
      </div>
      <div className="page-shell mt-10 border-t border-[rgba(0,0,0,0.08)] pt-6 text-xs leading-6 text-[#9a9a9a]">
        © {new Date().getFullYear()} ChinaChild. Образовательная лицензия выдана{" "}
        {LICENSE_REGION} на программу {LICENSE_PROGRAM}. Налоговый вычет 13% — до 15 600 ₽ в год.
      </div>
    </footer>
  );
}
