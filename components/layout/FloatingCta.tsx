import Link from "next/link";
import { REGISTER_URL } from "@/lib/site-config";

/**
 * Floating CTA с двойным слоем как у Yandex Practicum:
 * — большой translucent glass-pill backdrop (frosted blur, видно контент сзади)
 * — поверх него чёрная pill-кнопка
 */
export default function FloatingCta() {
  return (
    <div className="floating-cta-shell" aria-hidden={false}>
      <div className="floating-cta-glass">
        <Link
          href={REGISTER_URL}
          target="_blank"
          rel="noreferrer"
          className="floating-cta-btn"
          aria-label="Оставить заявку — открыть регистрацию"
        >
          Оставить заявку
        </Link>
      </div>
    </div>
  );
}
