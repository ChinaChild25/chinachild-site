import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { CONTACT_PHONE, CONTACT_PHONE_TEL, REGISTER_URL } from "@/lib/site-config";

const navigation = [
  { label: "Курсы", href: "/courses" },
  { label: "HSK", href: "/courses/hsk-preparation" },
  { label: "Методика", href: "/methodology" },
  { label: "О школе", href: "/about" },
  { label: "Блог", href: "/blog" },
];

export default function Header() {
  return (
    <header
      className="sticky top-0 z-50"
      role="banner"
    >
      {/* Frosted glass plate — translucent, blurred, with subtle border */}
      <div className="border-b border-[rgba(0,0,0,0.06)] bg-white/65 backdrop-blur-xl backdrop-saturate-150">
        <nav
          aria-label="Основная навигация"
          className="page-shell flex min-h-[72px] items-center justify-between gap-4"
        >
          <Link
            href="/"
            className="flex items-center gap-2 font-bold tracking-[-0.03em] text-[#1b1b1b]"
            aria-label="ChinaChild — на главную"
          >
            <span
              aria-hidden
              className="grid h-9 w-9 place-items-center rounded-2xl bg-[var(--violet)] text-base font-bold text-white"
            >
              中
            </span>
            <span className="text-lg">ChinaChild</span>
          </Link>

          <ul className="hidden items-center gap-7 text-sm font-medium text-[#1b1b1b] lg:flex">
            {navigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="transition hover:opacity-60">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-4">
            <a
              href={`tel:${CONTACT_PHONE_TEL}`}
              className="hidden text-sm font-semibold text-[#1b1b1b] lg:block"
              aria-label={`Позвонить ${CONTACT_PHONE}`}
            >
              {CONTACT_PHONE}
            </a>
            <Link
              href={REGISTER_URL}
              target="_blank"
              rel="noreferrer"
              className={buttonStyles({ size: "compact" })}
            >
              Записаться
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
