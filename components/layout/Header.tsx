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
    <header className="sticky top-0 z-50 border-b border-[rgba(26,26,46,0.06)] bg-[rgba(255,255,255,0.86)] backdrop-blur-xl">
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
            <div className="text-base font-extrabold tracking-[-0.03em] text-[#1A1A2E]">
              ChinaChild
            </div>
            <div className="text-xs text-[#6B7280]">Онлайн-школа китайского языка</div>
          </div>
        </Link>

        <nav className="hidden items-center gap-7 text-sm font-semibold text-[#4B5563] lg:flex">
          {navigation.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-[#1A1A2E]">
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
            className: "bg-[#FF3D00] text-white hover:bg-[#f03a00]",
          })}
        >
          Начать бесплатно
        </Link>
      </div>
    </header>
  );
}
