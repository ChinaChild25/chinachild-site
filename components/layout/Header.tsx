"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import LeadModal from "@/components/forms/LeadModal";
import { CONTACT_PHONE, CONTACT_PHONE_TEL } from "@/lib/site-config";

const navigation = [
  { label: "Курсы", href: "/courses" },
  { label: "HSK", href: "/learn/hsk" },
  { label: "Цены", href: "/price" },
  { label: "Методика", href: "/methodology" },
  { label: "О школе", href: "/about" },
  { label: "Команда", href: "/team" },
  { label: "Блог", href: "/blog" },
  { label: "Грамматика", href: "/grammar" },
  { label: "Словарь", href: "/dictionary" },
  { label: "Глоссарий", href: "/glossary" },
];

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);

  // Close mobile drawer on route change-like scroll up navigation: easiest
  // proxy is closing on Escape and on outside click handled below.
  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  return (
    <>
      <header className="site-header" role="banner">
        <div className="site-header-wrapper">
          <Link
            href="/"
            className="site-header-brand"
            aria-label="ChinaChild — на главную"
            onClick={() => setMenuOpen(false)}
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
            aria-label={menuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={menuOpen}
            aria-controls="mobile-drawer"
            className={`site-header-burger ${menuOpen ? "is-open" : ""}`}
            onClick={() => setMenuOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </header>

      {/* Mobile drawer — fills viewport below the header pill */}
      <div
        id="mobile-drawer"
        className={`mobile-drawer ${menuOpen ? "is-open" : ""}`}
        aria-hidden={!menuOpen}
      >
        <nav aria-label="Мобильная навигация" className="mobile-drawer-inner">
          <ul className="mobile-drawer-nav">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="mobile-drawer-link"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={`tel:${CONTACT_PHONE_TEL}`}
                className="mobile-drawer-link"
                aria-label={`Позвонить ${CONTACT_PHONE}`}
              >
                {CONTACT_PHONE}
              </a>
            </li>
          </ul>

          <LeadModal
            triggerClassName="mobile-drawer-cta"
            source="header-mobile"
            ariaLabel="Заказать звонок — открыть форму"
          >
            Заказать звонок
          </LeadModal>
        </nav>
      </div>
    </>
  );
}
