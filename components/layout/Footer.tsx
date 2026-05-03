import Link from "next/link";
import { footerLinks } from "@/lib/site-data";
import {
  CONTACT_EMAIL,
  CONTACT_PHONE,
  CONTACT_PHONE_TEL,
  LICENSE_DETAILS,
  LICENSE_PROGRAM,
  LICENSE_REGION_INSTRUMENTAL,
  LICENSEE,
  SITE_URL,
} from "@/lib/site-config";

export default function Footer() {
  return (
    <footer className="border-t border-[rgba(0,0,0,0.06)] bg-[#f3f0e8] py-16 text-[#262626]">
      <div className="page-shell-wide grid gap-12 md:grid-cols-[1.2fr_0.8fr]">
        <div className="max-w-xl">
          <div className="text-[1.5rem] font-medium tracking-[-0.01em]">ChinaChild</div>
          <p className="mt-4 text-sm leading-[1.55] text-[#6b6b6b]">
            Онлайн-школа китайского языка ChinaChild (HSK+). Лицензированная
            программа по достижению разговорного уровня уже через 6 месяцев
            обучения. Обучение для подростков с 12 лет и взрослых.
          </p>
          <div className="mt-6 grid gap-2 text-sm text-[#262626]">
            <a href={`tel:${CONTACT_PHONE_TEL}`} className="font-medium transition hover:opacity-60">
              {CONTACT_PHONE}
            </a>
            <a href={`mailto:${CONTACT_EMAIL}`} className="text-[#6b6b6b] transition hover:text-[#262626]">
              {CONTACT_EMAIL}
            </a>
            <a href={SITE_URL} className="text-[#6b6b6b] transition hover:text-[#262626]">
              chinachild.ru
            </a>
          </div>
        </div>

        <nav aria-label="Подвал сайта" className="grid gap-3 sm:grid-cols-2">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-[#6b6b6b] transition hover:text-[#262626]"
            >
              {link.title}
            </Link>
          ))}
        </nav>
      </div>

      <div className="page-shell-wide mt-32 sm:mt-40">
        <div className="border-t border-[rgba(0,0,0,0.08)] pt-12 grid gap-3 text-xs leading-[1.6] text-[#7a7a7a]">
          <div>
            {LICENSEE.legalName} · ИНН {LICENSEE.inn}
          </div>
          <div>
            Образовательная лицензия № {LICENSE_DETAILS.registrationNumber} от 18.12.2025,
            выдана {LICENSE_REGION_INSTRUMENTAL}. Программа «{LICENSE_PROGRAM}».
            Налоговый вычет 13% — до 15 600 ₽ в год.{" "}
            <Link href="/license" className="underline underline-offset-4 hover:text-[#262626]">
              Подробнее о лицензии
            </Link>
          </div>
          <div className="mt-5 text-[#9a9a9a]">
            © {new Date().getFullYear()} ChinaChild. Все права защищены.
          </div>
        </div>
      </div>
    </footer>
  );
}
