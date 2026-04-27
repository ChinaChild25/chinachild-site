import Image from "next/image";
import Link from "next/link";
import { buttonStyles } from "@/components/ui/button";
import { REGISTER_URL } from "@/lib/site-config";

const navigation = [
  { label: "Курсы", href: "/kursy" },
  { label: "Преподаватели", href: "/prepodavateli" },
  { label: "Цены", href: "/#tseny" },
  { label: "Блог", href: "/blog" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[rgba(15,23,42,0.08)] bg-[rgba(250,251,255,0.78)] backdrop-blur-2xl">
      <div className="page-shell flex min-h-[78px] items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/brand-mark.svg"
            alt="Логотип ChinaChild"
            width={44}
            height={44}
            priority
          />
          <div>
            <div className="text-base font-extrabold tracking-[-0.03em] text-[#0F172A]">
              ChinaChild
            </div>
            <div className="text-xs text-[#64748B]">Онлайн-школа китайского языка</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-2 rounded-full border border-[rgba(148,163,184,0.24)] bg-white/70 p-1.5 text-sm font-semibold text-[#334155] shadow-[0_12px_30px_rgba(15,23,42,0.08)] lg:flex">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-2 transition hover:bg-white hover:text-[#0F172A]"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <Link
          href={REGISTER_URL}
          target="_blank"
          rel="noreferrer"
          className={buttonStyles({
            size: "compact",
            className:
              "bg-[linear-gradient(135deg,#111827,#1E293B)] text-white hover:bg-[linear-gradient(135deg,#0B1220,#172335)]",
          })}
        >
          Начать бесплатно
        </Link>
      </div>
    </header>
  );
}
