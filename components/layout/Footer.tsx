import Link from "next/link";
import CookieSettingsButton from "@/components/consent/CookieSettingsButton";
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
  const siteHost = new URL(SITE_URL).host;

  return (
    <footer className="site-footer rounded-t-[60px] bg-[#1E1E1E] py-16 text-[#ededed]">
      <div className="page-shell-wide grid gap-12 pb-12 sm:pb-16 md:grid-cols-[1.2fr_0.8fr]">
        <div className="max-w-xl">
          <div className="text-[1.5rem] font-medium tracking-[-0.01em] text-white">ChinaChild</div>
          <p className="mt-4 text-sm leading-[1.55] text-white/65">
            Онлайн-школа китайского языка ChinaChild (HSK+). Лицензированная
            программа по достижению разговорного уровня уже через 6 месяцев
            обучения. Обучение для подростков с 12 лет и взрослых.
          </p>
          <div className="mt-6 grid gap-2 text-sm text-white">
            <a href={`tel:${CONTACT_PHONE_TEL}`} className="font-medium transition hover:opacity-70">
              {CONTACT_PHONE}
            </a>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="text-white/65 transition hover:text-white"
            >
              {CONTACT_EMAIL}
            </a>
            <a href={SITE_URL} className="text-white/65 transition hover:text-white">
              {siteHost}
            </a>
          </div>
        </div>

        <nav aria-label="Подвал сайта" className="grid gap-3 sm:grid-cols-2">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-white/65 transition hover:text-white"
            >
              {link.title}
            </Link>
          ))}
        </nav>
      </div>

      <div className="page-shell-wide mt-12 sm:mt-16">
        <div className="border-t border-white/10 pt-12 grid gap-3 text-xs leading-[1.6] text-white/55">
          <div>
            {LICENSEE.legalName} · ИНН {LICENSEE.inn}
          </div>
          <div className="text-white/45">
            ОГРНИП {LICENSEE.ogrnip} · Юридический адрес: {LICENSEE.address}
          </div>
          <div>
            Образовательная лицензия № {LICENSE_DETAILS.registrationNumber} от 18.12.2025,
            выдана {LICENSE_REGION_INSTRUMENTAL}. Программа «{LICENSE_PROGRAM}».
            Налоговый вычет 13% — до 15 600 ₽ в год.{" "}
            <Link href="/license" className="underline underline-offset-4 hover:text-white">
              Подробнее о лицензии
            </Link>
          </div>
          <div className="mt-1">
            <CookieSettingsButton />
          </div>
          <div className="mt-4 text-white/35">
            © {new Date().getFullYear()} ChinaChild. Все права защищены.
          </div>
        </div>
      </div>
    </footer>
  );
}
