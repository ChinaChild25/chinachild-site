"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import LeadModal from "@/components/forms/LeadModal";
import ThemeToggle from "@/components/theme/ThemeToggle";
/**
 * Header navigation is split into two tiers:
 *
 * - `primaryNav` — shown in the horizontal desktop bar. Capped at five items
 *   so the header never wraps even at ~1180px viewport (Praktikum-style
 *   utilitarian density: курсы + продукт + конверсия + траст).
 * - `drawerOnly` — secondary surfaces that only show inside the burger
 *   drawer. Keeps the desktop bar quiet but doesn't lose discoverability
 *   of grammar/dictionary/glossary pages.
 *
 * The drawer renders [...primaryNav, ...drawerOnly] so all routes stay
 * reachable on narrow viewports.
 */
const primaryNav = [
  { label: "Курсы", href: "/courses" },
  { label: "HSK", href: "/learn/hsk" },
  { label: "Тест HSK", href: "/chinese/hsk-test" },
  { label: "Цены", href: "/price" },
  { label: "О школе", href: "/about" },
];

const drawerOnly = [
  { label: "Методика", href: "/methodology" },
  { label: "Команда", href: "/team" },
  { label: "Блог", href: "/blog" },
  { label: "Грамматика", href: "/grammar" },
  { label: "Словарь", href: "/dictionary" },
  { label: "Глоссарий", href: "/glossary" },
];

const drawerNav = [...primaryNav, ...drawerOnly];

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
                priority
              />
            </span>
            <span className="site-header-wordmark">ChinaChild</span>
          </Link>

          <nav
            aria-label="Основная навигация"
            className="site-header-menu"
          >
            <ul className="site-header-nav">
              {primaryNav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="site-header-link">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>

            <ThemeToggle />

            <LeadModal
              triggerClassName="site-header-cta"
              source="header"
              ariaLabel="Заказать звонок — открыть форму"
            >
              Заказать звонок
            </LeadModal>
          </nav>

          <div className="site-header-mobile-actions">
            <ThemeToggle />
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
            {drawerNav.map((item) => (
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
