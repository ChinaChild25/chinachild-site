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
    <header className="sticky top-0 z-50 border-b border-[rgba(0,0,0,0.06)] bg-white/95 backdrop-blur">
      <div className="page-shell flex min-h-[72px] items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-[-0.03em] text-[#1b1b1b]">
          <span
            aria-hidden
            className="grid h-9 w-9 place-items-center rounded-2xl bg-[var(--violet)] text-base font-bold text-white"
          >
            中
          </span>
          <span className="text-lg">ChinaChild</span>
        </Link>

        <nav
          className="hidden items-center gap-7 text-sm font-medium text-[#1b1b1b] lg:flex"
          aria-label="Основная навигация"
        >
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:opacity-60">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <a
            href={`tel:${CONTACT_PHONE_TEL}`}
            className="hidden text-sm font-semibold text-[#1b1b1b] lg:block"
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
      </div>
    </header>
  );
}
