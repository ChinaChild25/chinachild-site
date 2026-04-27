import Link from "next/link";
import { footerLinks } from "@/lib/site-data";
import { APP_URL, CONTACT_EMAIL, SITE_URL } from "@/lib/site-config";

export default function Footer() {
  return (
    <footer className="border-t border-[rgba(0,0,0,0.06)] bg-[#f6f5f2] py-16 text-[#1b1b1b]">
      <div className="page-shell grid gap-10 md:grid-cols-[1.2fr_0.8fr]">
        <div className="max-w-xl">
          <div className="text-2xl font-bold tracking-[-0.03em]">ChinaChild</div>
          <p className="mt-4 text-sm leading-7 text-[#6b6b6b]">
            Онлайн-школа китайского языка. Учим детей и взрослых говорить
            уверенно — с диагностикой уровня, живыми занятиями и платформой
            для практики между уроками.
          </p>
          <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-[#6b6b6b]">
            <a href={`mailto:${CONTACT_EMAIL}`} className="transition hover:text-[#1b1b1b]">
              {CONTACT_EMAIL}
            </a>
            <a href={SITE_URL} className="transition hover:text-[#1b1b1b]">
              chinachild.ru
            </a>
            <a href={APP_URL} className="transition hover:text-[#1b1b1b]">
              app.chinachild.ru
            </a>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-[#6b6b6b] transition hover:text-[#1b1b1b]"
            >
              {link.title}
            </Link>
          ))}
        </div>
      </div>
      <div className="page-shell mt-10 border-t border-[rgba(0,0,0,0.08)] pt-6 text-xs text-[#9a9a9a]">
        © {new Date().getFullYear()} ChinaChild. Образовательные услуги для детей и взрослых.
      </div>
    </footer>
  );
}
