import Link from "next/link";
import { ChinaChildWordmark } from "@/components/brand/ChinaChildWordmark";
import CookieSettingsButton from "@/components/consent/CookieSettingsButton";
import TrustProfileLogo from "@/components/layout/TrustProfileLogo";
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
  TAX_DEDUCTION_COMPACT,
  TRUST_PROFILE_LINKS,
} from "@/lib/site-config";

export default function Footer() {
  const siteHost = new URL(SITE_URL).host;

  return (
    <footer className="site-footer rounded-t-[60px] bg-[#1E1E1E] py-16 text-[#ededed]">
      <div className="page-shell-wide grid gap-12 pb-12 sm:pb-16 md:grid-cols-[1.2fr_0.8fr]">
        <div className="max-w-xl">
          <ChinaChildWordmark className="h-6 w-auto text-white" />
          <p className="mt-4 text-sm leading-[1.55] text-white/65">
            Онлайн-школа китайского языка ChinaChild (HSK+). Лицензированная
            программа по достижению разговорного уровня уже через 6 месяцев
            обучения. Программы для детей от 7 лет, подростков, студентов и взрослых.
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
          <div className="mt-7">
            <div className="text-xs font-medium text-white/65">
              Площадки и отзывы
            </div>
            <div className="mt-3 grid gap-4">
              <div className="flex flex-wrap gap-4">
                {TRUST_PROFILE_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`${link.label} ChinaChild`}
                    className="inline-flex h-10 items-center justify-center text-white/80 transition duration-150 hover:-translate-y-0.5 hover:text-white hover:opacity-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/45"
                  >
                    <TrustProfileLogo label={link.label} logo={link.logo} surface="dark" />
                  </a>
                ))}
              </div>
              <div className="grid gap-2">
                <div className="text-xs font-medium text-white/65">Рейтинг сайта</div>
                <a
                  href="https://webmaster.yandex.ru/siteinfo/?site=https://chinachild.ru"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="ИКС chinachild.ru в Яндекс.Вебмастере"
                  className="yandex-iks-badge focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white/45"
                >
                  <span className="yandex-iks-badge-mark" aria-hidden="true">Я</span>
                  <span className="yandex-iks-badge-value">20</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        <nav aria-label="Подвал сайта" className="grid gap-3 sm:grid-cols-2">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch={false}
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
          <div className="text-white/65">
            ОГРНИП {LICENSEE.ogrnip} · Юридический адрес: {LICENSEE.address}
          </div>
          <div>
            Образовательная лицензия № {LICENSE_DETAILS.registrationNumber} от 18.12.2025,
            выдана {LICENSE_REGION_INSTRUMENTAL}. Программа «{LICENSE_PROGRAM}».
            {" "}{TAX_DEDUCTION_COMPACT}{" "}
            <Link
              href="/license"
              prefetch={false}
              className="underline underline-offset-4 hover:text-white"
            >
              Подробнее о лицензии
            </Link>
          </div>
          <div className="mt-1">
            <CookieSettingsButton />
          </div>
          <div className="mt-4 text-white/60">
            © {new Date().getFullYear()} ChinaChild. Все права защищены.
          </div>
        </div>
      </div>
    </footer>
  );
}
