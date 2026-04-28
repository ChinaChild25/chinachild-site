import Link from "next/link";
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
      <div className="site-header-pill">
        <nav
          aria-label="Основная навигация"
          className="site-header-inner"
        >
          <Link
            href="/"
            className="site-header-brand"
            aria-label="ChinaChild — на главную"
          >
            <span aria-hidden className="site-header-mark">
              中
            </span>
            <span className="site-header-wordmark">ChinaChild</span>
          </Link>

          <ul className="site-header-nav">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="site-header-link">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="site-header-actions">
            <a
              href={`tel:${CONTACT_PHONE_TEL}`}
              className="site-header-phone"
              aria-label={`Позвонить ${CONTACT_PHONE}`}
            >
              {CONTACT_PHONE}
            </a>
            <Link href="/courses" className="site-header-cta">
              В каталог
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
