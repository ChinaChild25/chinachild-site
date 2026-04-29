import Image from "next/image";
import Link from "next/link";
import LeadModal from "@/components/forms/LeadModal";
import { CONTACT_PHONE, CONTACT_PHONE_TEL } from "@/lib/site-config";

const navigation = [
  { label: "Курсы", href: "/courses" },
  { label: "HSK", href: "/courses/hsk-preparation" },
  { label: "Методика", href: "/methodology" },
  { label: "О школе", href: "/about" },
  { label: "Блог", href: "/blog" },
  { label: "Глоссарий", href: "/glossary" },
];

export default function Header() {
  return (
    <header className="site-header" role="banner">
      <div className="site-header-wrapper">
        <Link
          href="/"
          className="site-header-brand"
          aria-label="ChinaChild — на главную"
        >
          <span aria-hidden className="site-header-mark">
            <Image
              src="/brand/logo.svg"
              alt=""
              width={28}
              height={28}
              className="site-header-mark-image"
            />
          </span>
          <span className="site-header-wordmark">ChinaChild</span>
        </Link>

        <nav
          aria-label="Основная навигация"
          className="site-header-menu"
        >
          <ul className="site-header-nav">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="site-header-link">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={`tel:${CONTACT_PHONE_TEL}`}
                className="site-header-link"
                aria-label={`Позвонить ${CONTACT_PHONE}`}
              >
                {CONTACT_PHONE}
              </a>
            </li>
          </ul>

          <LeadModal
            triggerClassName="site-header-cta"
            source="header"
            ariaLabel="Заказать звонок — открыть форму"
          >
            Заказать звонок
          </LeadModal>
        </nav>

        <button
          type="button"
          aria-label="Открыть меню"
          className="site-header-burger"
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}