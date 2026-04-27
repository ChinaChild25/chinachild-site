import Image from "next/image";
import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { CONTACT_PHONE, CONTACT_PHONE_TEL, REGISTER_URL } from "@/lib/site-config";

const navigation = [
  { label: "Курсы", href: "/kursy" },
  { label: "HSK", href: "/hsk" },
  { label: "Тест уровня", href: "/test-hsk" },
  { label: "Преподаватели", href: "/prepodavateli" },
  { label: "Блог", href: "/blog" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(0,0,0,0.06)] bg-white/95 backdrop-blur">
      <div className="page-shell flex min-h-[72px] items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/brand-mark.svg"
            alt="Логотип ChinaChild"
            width={36}
            height={36}
            priority
          />
          <span className="text-lg font-bold tracking-[-0.03em] text-[#1b1b1b]">
            ChinaChild
          </span>
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-[#1b1b1b] lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="transition hover:opacity-60"
            >
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
