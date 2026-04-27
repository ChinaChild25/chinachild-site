import Link from "next/link";
import { footerLinks } from "@/lib/site-data";
import { APP_URL, CONTACT_EMAIL, SITE_URL } from "@/lib/site-config";

export default function Footer() {
  return (
    <footer className="border-t border-[rgba(26,26,46,0.08)] bg-[#1A1A2E] py-14 text-white">
      <div className="page-shell grid gap-10 md:grid-cols-[1.2fr_0.8fr]">
        <div className="max-w-xl">
          <div className="text-2xl font-extrabold tracking-[-0.03em]">ChinaChild</div>
          <p className="mt-4 text-sm leading-7 text-white/74">
            SEO-посадочная страница и личный кабинет работают как единая воронка:
            заявка, пробный урок, обучение и повторные продажи внутри платформы.
          </p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm text-white/74">
            <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-white">
              {CONTACT_EMAIL}
            </a>
            <a href={SITE_URL} className="hover:text-white">
              chinachild.ru
            </a>
            <a href={APP_URL} className="hover:text-white">
              app.chinachild.ru
            </a>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-white/74 transition hover:text-white"
            >
              {link.title}
            </Link>
          ))}
        </div>
      </div>
    </footer>
  );
}
