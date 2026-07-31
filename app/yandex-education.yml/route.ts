import {
  renderYandexEducationFeed,
  YANDEX_EDUCATION_OFFERS,
} from "@/lib/yandex-education";

export const dynamic = "force-static";

export async function GET() {
  const xml = renderYandexEducationFeed({
    offers: YANDEX_EDUCATION_OFFERS,
  });

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, must-revalidate",
      "X-Yandex-Education-Readiness":
        YANDEX_EDUCATION_OFFERS.length > 0
          ? "ready-for-validation"
          : "blocked-no-active-offers",
    },
  });
}
