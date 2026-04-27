import Link from "next/link";
import { REGISTER_URL } from "@/lib/site-config";

export default function FloatingCta() {
  return (
    <Link
      href={REGISTER_URL}
      target="_blank"
      rel="noreferrer"
      className="floating-cta btn-pill btn-pill-default btn-ink"
    >
      Оставить заявку
    </Link>
  );
}
