"use client";

import Image from "next/image";
import Link from "next/link";
import { CircleUser } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import LeadModal from "@/components/forms/LeadModal";
import ThemeToggle from "@/components/theme/ThemeToggle";
import { platformBaseUrl } from "@/lib/content/platform-links";
import { LEGAL_DOCUMENT_PATHS } from "@/lib/legal/document-paths";
import { cn } from "@/lib/utils";
import { ChinaChildWordmark } from "@/components/brand/ChinaChildWordmark";
/**
 * Header navigation is split into three tiers:
 *
 * - `desktopDirectNav` — always visible in the desktop glass bar.
 * - `desktopDropdowns` — desktop-only Praktikum-style groups with chevrons.
 * - `drawerOnly` — secondary surfaces that stay flat inside the mobile drawer.
 *
 * The mobile drawer stays intentionally simple: no nested disclosure pattern
 * below the desktop breakpoint.
 */
type NavItem = {
  label: string;
  href: string;
  description?: string;
  align?: "center";
  span?: "full";
  tone?: "accent";
};

const mobilePrimaryNav = [
  { label: "Курсы", href: "/courses" },
  { label: "HSK", href: "/learn/hsk" },
  { label: "Тест HSK", href: "/chinese/hsk-test" },
  { label: "Цены", href: "/price" },
  { label: "Работа", href: "/careers" },
  { label: "О школе", href: "/about" },
];

const desktopDirectNav = [
  { label: "Цены", href: "/price" },
  { label: "Работа", href: "/careers" },
  { label: "О школе", href: "/about" },
];

const desktopDropdowns: Array<{
  id: string;
  label: string;
  panelClassName: string;
  items: NavItem[];
}> = [
  {
    id: "materials",
    label: "Материалы",
    panelClassName: "site-header-dropdown-panel--materials",
    items: [
      { label: "Глоссарий", href: "/glossary" },
      { label: "Блог", href: "/blog" },
      { label: "Грамматика", href: "/grammar" },
      { label: "Словарь", href: "/dictionary" },
      { label: "Методика", href: "/methodology" },
      { label: "Хаб HSK", href: "/learn/hsk" },
      {
        label: "Тест HSK",
        href: "/chinese/hsk-test",
        align: "center",
        span: "full",
        tone: "accent",
      },
    ],
  },
  {
    id: "learning",
    label: "Все курсы",
    panelClassName: "site-header-dropdown-panel--learning",
    items: [
      { label: "Все курсы", href: "/courses", span: "full" },
      { label: "Репетитор китайского", href: "/repetitor-kitayskogo", span: "full" },
      { label: "Подготовка к HSK", href: "/courses/hsk-preparation" },
      { label: "Онлайн-курсы", href: "/courses/online-chinese" },
      { label: "Детям от 7 лет", href: "/courses/chinese-for-kids" },
      { label: "Взрослым с нуля", href: "/courses/chinese-for-adults" },
      { label: "Бизнес-китайский", href: "/courses/business-chinese", span: "full" },
      {
        label: "Бесплатный пробный",
        href: "/free-trial",
        description: "Познакомиться с платформой",
        span: "full",
        tone: "accent",
      },
    ],
  },
];

const drawerOnly = [
  { label: "Методика", href: "/methodology" },
  { label: "Команда", href: "/team" },
  { label: "Блог", href: "/blog" },
  { label: "Грамматика", href: "/grammar" },
  { label: "Словарь", href: "/dictionary" },
  { label: "Глоссарий", href: "/glossary" },
];

const drawerNav = [...mobilePrimaryNav, ...drawerOnly];

// Личный кабинет живёт на отдельном хосте платформы (my.chinachild.ru).
const accountUrl = platformBaseUrl();

export default function Header() {
  const pathname = usePathname();
  const isLegalPage = LEGAL_DOCUMENT_PATHS.has(pathname);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openDesktopMenu, setOpenDesktopMenu] = useState<string | null>(null);
  const desktopMenuRef = useRef<HTMLElement | null>(null);
  const triggerRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const panelRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [panelCoords, setPanelCoords] = useState<Record<string, { top: number; right: number }>>({});
  const [portalReady, setPortalReady] = useState(false);

  // Portal target must be resolved client-side only — SSR has no document.body.
  useEffect(() => setPortalReady(true), []);

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

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (desktopMenuRef.current?.contains(target)) return;
      // Panels live in a body portal (escaping the wrapper's backdrop-filter
      // root so the dropdown glass can actually blur the page). They are not
      // DOM descendants of the menu, so check them explicitly.
      const insidePanel = Object.values(panelRefs.current).some((p) =>
        p?.contains(target),
      );
      if (insidePanel) return;
      setOpenDesktopMenu(null);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenDesktopMenu(null);
    };

    document.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  // Position the portaled panel under its trigger. Recompute on resize/scroll
  // while open so the panel tracks layout shifts.
  useLayoutEffect(() => {
    if (!openDesktopMenu) return;
    const trigger = triggerRefs.current[openDesktopMenu];
    if (!trigger) return;
    const id = openDesktopMenu;
    const update = () => {
      const rect = trigger.getBoundingClientRect();
      setPanelCoords((prev) => ({
        ...prev,
        [id]: {
          top: rect.bottom + 7,
          right: window.innerWidth - rect.right,
        },
      }));
    };
    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, { passive: true });
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
    };
  }, [openDesktopMenu]);

  return (
    <>
      <header className="site-header" role="banner">
        <div className={cn("site-header-wrapper", isLegalPage && "site-header-wrapper--stacked")}>
          <div className="site-header-wrapper__top">
            <Link
              href="/"
              className="site-header-brand"
              aria-label="ChinaChild — на главную"
              onClick={() => setMenuOpen(false)}
            >
              <span aria-hidden className="site-header-mark">
                <Image
                  src="/brand/chinachild-mark.svg"
                  alt=""
                  width={28}
                  height={28}
                  className="site-header-mark-image site-header-mark-image--light"
                  priority
                />
                <Image
                  src="/brand/chinachild-mark-dark.svg"
                  alt=""
                  width={28}
                  height={28}
                  className="site-header-mark-image site-header-mark-image--dark"
                  loading="lazy"
                />
              </span>
              <ChinaChildWordmark className="h-[13px] w-auto" />
            </Link>

            <nav
              aria-label="Основная навигация"
              className="site-header-menu"
              ref={desktopMenuRef}
            >
              <ul className="site-header-nav">
                {desktopDirectNav.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="site-header-link">
                      {item.label}
                    </Link>
                  </li>
                ))}
                {desktopDropdowns.map((group) => {
                  const isOpen = openDesktopMenu === group.id;
                  return (
                    <li key={group.id} className="site-header-dropdown">
                      <button
                        ref={(el) => {
                          triggerRefs.current[group.id] = el;
                        }}
                        type="button"
                        className="site-header-dropdown-trigger"
                        aria-expanded={isOpen}
                        aria-controls={`site-header-dropdown-${group.id}`}
                        onClick={() => setOpenDesktopMenu(isOpen ? null : group.id)}
                      >
                        {group.label}
                        <span className="site-header-chevron" aria-hidden />
                      </button>
                    </li>
                  );
                })}
                <li>
                  <a
                    href={accountUrl}
                    className="site-header-link site-header-account"
                  >
                    <CircleUser size={18} strokeWidth={1.75} aria-hidden />
                    <span>Личный кабинет</span>
                  </a>
                </li>
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

          {/* Legal reading pages portal their compact section-nav row in here (see
              LegalTableOfContentsMobile) so it reads as one continuous glass pill with the
              nav above it, split only by a hairline divider — not a second floating card. */}
          {isLegalPage ? <div id="site-header-legal-slot" className="site-header-wrapper__legal lg:hidden" /> : null}
        </div>
      </header>

      {/* Dropdown panels are portaled to <body> so they escape the
          wrapper's backdrop-filter scope. Without this, the panel's own
          backdrop-filter samples the wrapper's already-filtered area
          instead of the page underneath, killing the frosted-lens look. */}
      {portalReady &&
        createPortal(
          <>
            {desktopDropdowns.map((group) => {
              const isOpen = openDesktopMenu === group.id;
              const coords = panelCoords[group.id];
              return (
                <div
                  key={group.id}
                  ref={(el) => {
                    panelRefs.current[group.id] = el;
                  }}
                  id={`site-header-dropdown-${group.id}`}
                  className={`site-header-dropdown-panel ${group.panelClassName} ${
                    isOpen ? "is-open" : ""
                  }`}
                  style={
                    coords
                      ? { top: `${coords.top}px`, right: `${coords.right}px` }
                      : undefined
                  }
                >
                  <div className="site-header-dropdown-grid">
                    {group.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        prefetch={isOpen ? null : false}
                        className={`site-header-dropdown-card ${
                          item.span === "full" ? "site-header-dropdown-card--full" : ""
                        } ${item.align === "center" ? "site-header-dropdown-card--center" : ""} ${
                          item.description ? "site-header-dropdown-card--with-description" : ""
                        } ${item.tone === "accent" ? "site-header-dropdown-card--accent" : ""}`}
                        onClick={() => setOpenDesktopMenu(null)}
                      >
                        <span>{item.label}</span>
                        {item.description ? <small>{item.description}</small> : null}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </>,
          document.body,
        )}

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
                  prefetch={menuOpen ? null : false}
                  className="mobile-drawer-link"
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <a
                href={accountUrl}
                className="mobile-drawer-link mobile-drawer-link--account"
                onClick={() => setMenuOpen(false)}
              >
                <CircleUser size={20} strokeWidth={1.75} aria-hidden />
                Личный кабинет
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
