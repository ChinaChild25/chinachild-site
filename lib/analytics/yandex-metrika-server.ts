import "server-only";

/**
 * Server-side трекинг для Я.Метрики (Measurement Protocol).
 *
 * Зачем: AdBlock/uBlock блокируют клиентский счётчик у ~30-40% пользователей
 * в РФ. Я.Метрика этих юзеров не видит → ПФ (поведенческие факторы) считаются
 * по обрезанной выборке → Яндекс ранжирует по искажённым данным. Дублирование
 * хита с сервера восстанавливает видимость.
 *
 * Как это работает:
 * 1. Клиент при заходе устанавливает cookie `_ym_uid` (JS-счётчик).
 * 2. Сервер при коммите конверсии (lead store) читает `_ym_uid` из cookies
 *    запроса и пингует watch-endpoint с тем же UID.
 * 3. Я.Метрика «склеивает» серверный хит с пользовательской сессией.
 *
 * Гол `lead_submitted` (562860580) — JS-event цель, её сервер триггерить
 * НЕ может (Я.Метрика триггерит JS-event только через `ym('reachGoal',...)`).
 * Чтобы серверная сторона тоже считалась конверсией:
 *   1. В Я.Метрике → Цели → создать URL-цель «URL содержит /lead-success/server».
 *   2. Этот endpoint шлёт хит с page-url = SITE_URL + LEAD_GOAL_PATH.
 *   3. URL-цель срабатывает на хит → Я.Директ видит конверсию.
 *
 * Fire-and-forget: ошибки логируем, но не блокируем ответ пользователю.
 */

const YM_HIT_ENDPOINT = "https://mc.yandex.ru/watch";

/** URL-маркер для URL-цели в Я.Метрике. Не должен совпадать с реальным
 *  маршрутом сайта — это виртуальный хит. */
export const LEAD_GOAL_PATH = "/lead-success/server";

type TrackOpts = {
  /** Полный URL страницы, где случилась конверсия (для page-ref/контекста). */
  sourceUrl?: string;
  /** Cookie header целиком (для извлечения _ym_uid). */
  cookieHeader?: string | null;
  /** User-Agent юзера — Я.Метрика классифицирует устройство/браузер. */
  userAgent?: string | null;
  /** Реальный IP клиента для геолокации. */
  clientIp?: string | null;
};

function extractYmUid(cookieHeader: string | null | undefined): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)_ym_uid=([^;]+)/);
  return match ? match[1] : null;
}

function getSiteOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    "https://chinachild.ru"
  ).replace(/\/$/, "");
}

/**
 * Шлёт хит «совершён лид» в Я.Метрику со стороны сервера.
 * Возвращает Promise, но вызывающий код может его не ждать (fire-and-forget).
 */
export async function trackServerLead(opts: TrackOpts = {}): Promise<void> {
  const counterId = process.env.NEXT_PUBLIC_YM_ID;
  if (!counterId) return;

  const ymUid = extractYmUid(opts.cookieHeader);
  const origin = getSiteOrigin();
  const pageUrl = origin + LEAD_GOAL_PATH;
  const pageRef = opts.sourceUrl ?? origin;

  const url = new URL(`${YM_HIT_ENDPOINT}/${counterId}/1`);
  url.searchParams.set("charset", "utf-8");
  url.searchParams.set("page-url", pageUrl);
  url.searchParams.set("page-ref", pageRef);
  url.searchParams.set("ut", "noindex");
  if (ymUid) url.searchParams.set("yu", ymUid);

  const headers: Record<string, string> = {
    Accept: "image/*,*/*;q=0.8",
  };
  if (opts.userAgent) headers["User-Agent"] = opts.userAgent;
  if (opts.clientIp) headers["X-Forwarded-For"] = opts.clientIp;
  if (ymUid) headers["Cookie"] = `_ym_uid=${ymUid}`;

  try {
    const response = await fetch(url.toString(), {
      method: "GET",
      headers,
      // 3 секунды максимум — иначе ответ пользователю задержится.
      signal: AbortSignal.timeout(3000),
      cache: "no-store",
    });
    if (!response.ok) {
      console.warn("[ym-server] hit non-200", response.status);
    }
  } catch (error) {
    // AbortError / network — не критично, лид уже в Supabase
    console.warn("[ym-server] hit failed", error);
  }
}
