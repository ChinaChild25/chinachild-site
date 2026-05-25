# Yandex Webmaster — статус по всем рекомендациям и самостоятельным проверкам

Полный разбор по чек-листу из панели Yandex Webmaster (`webmaster.yandex.ru` → «Диагностика»). По каждому пункту: статус, где это реализовано и что осталось сделать вручную в UI Вебмастера.

Last updated: 2026-05-25.

---

## Активные рекомендации (1)

### 1. Привязать счётчик Яндекс.Метрики
- **Статус:** код готов, требуется действие в UI.
- **Где в коде:** Метрика подключена в [components/analytics/YandexMetrika.tsx](../components/analytics/YandexMetrika.tsx), монтируется в [app/layout.tsx](../app/layout.tsx). Counter ID хранится в `NEXT_PUBLIC_YM_ID`. Счётчик стартует в cookie-less режиме до согласия пользователя и переключается в full-mode (webvisor + clickmap) после accept.
- **Что сделать вручную:**
  1. Открыть `webmaster.yandex.ru` → выбрать сайт `chinachild.ru` (или текущий `chinachild-site.vercel.app`).
  2. «Настройка» → «Привязка Я.Метрики».
  3. Выбрать счётчик с тем же Яндекс ID (`NEXT_PUBLIC_YM_ID`).
  4. Подтвердить.

---

## Самостоятельные проверки (21)

### 1. Настроены уведомления об изменениях на сайте от Вебмастера
- **Статус:** требуется действие в UI Вебмастера.
- **Что сделать:** `webmaster.yandex.ru` → сайт → «Настройка» → «Уведомления». Включить email-уведомления на адрес `info@chinachild.ru` (или личный) обо ВСЕХ событиях: ошибки индексации, нарушения, проблемы с CWV, изменения трафика, фатальные/критичные/возможные проблемы.

### 2. Настроена система оповещений от сайта (например, новый отзыв)
- **Статус:** код реализует это для лидов; оповещения по отзывам — out of scope (отзывы статичные, не UGC).
- **Где в коде:** [lib/lead-dispatch.ts](../lib/lead-dispatch.ts) — fan-out новых заявок в Telegram/Resend/webhook. Конфигурируется env: `LEAD_TELEGRAM_BOT_TOKEN`, `LEAD_TELEGRAM_CHAT_ID`, `RESEND_API_KEY`, `LEAD_EMAIL_TO`.
- **Что сделать:** убедиться что хотя бы один канал заполнен в Vercel env (production scope).

### 3. Собраны целевые поисковые запросы
- **Статус:** маркетинговая задача вне кода.
- **Что сделать:** в Вебмастере → «Поисковые запросы» → «Управление группами» — добавить семантическое ядро (HSK 1–6, китайский для подростков, бизнес-китайский, конкретные посадочные). Используйте Wordstat + YDS для подбора.

### 4. Поисковые запросы объединены в группы для удобного мониторинга
- **Статус:** UI-задача в Вебмастере.
- **Что сделать:** в том же разделе создать группы: «Брендовые», «HSK», «Города», «Бизнес-китайский», «Подростки», «Информационные» — и распределить запросы.

### 5. Под целевые поисковые запросы найдены или созданы посадочные страницы
- **Статус:** ✅ покрытие большое. Курсы, HSK-кластер, города, грамматика, словарь, блог, глоссарий, репетитор китайского.
- **Где в коде:**
  - Money: [app/courses/](../app/courses/), [app/price/page.tsx](../app/price/page.tsx), [app/free-trial/page.tsx](../app/free-trial/page.tsx), [app/zayavka/page.tsx](../app/zayavka/page.tsx).
  - HSK: [app/learn/hsk/page.tsx](../app/learn/hsk/page.tsx), [app/hsk/](../app/hsk/), [app/chinese/hsk-test/](../app/chinese/hsk-test/).
  - Гео: [app/cities/](../app/cities/) — 50+ городов.
  - Информационные: [app/blog/](../app/blog/), [app/glossary/](../app/glossary/), [app/grammar/](../app/grammar/), [app/dictionary/](../app/dictionary/).
  - Репетитор: [app/repetitor-kitayskogo/page.tsx](../app/repetitor-kitayskogo/page.tsx).

### 6. Сайт поддерживается основными браузерами
- **Статус:** ✅ Next.js 15 + React 19 + Tailwind 4. Поддерживается evergreen (Chrome/Edge/Firefox/Safari) + Safari iOS 16+ из коробки.
- **Что проверять руками:** в Вебмастере → «Турбо для контентных сайтов» — пропускаем (deprecated). Запускайте `npm run dev` и тестируйте на Safari/Firefox после крупных правок UI.

### 7. Целевые страницы не запрещены для индексации
- **Статус:** ✅ реализовано. Все money/trust/контентные страницы — `index: true, follow: true` через [lib/metadata.ts](../lib/metadata.ts). Транзитные flow-страницы (`/chinese/hsk-test/take`, `/chinese/hsk-test/result`, `/diagnostic/test`, `/diagnostic/calibration`, `/diagnostic/analyzing`, `/diagnostic/tutor`, `/diagnostic/share`, `/diagnostic/result`) — `noindex` через свои `layout.tsx`.
- **Robots:** [app/robots.txt/route.ts](../app/robots.txt/route.ts). `Disallow: /api/`, остальное открыто.

### 8. Страницы сайта переданы индексирующим роботам
- **Статус:** ✅ реализовано.
- **Где в коде:**
  - Sitemap index: [app/sitemap.xml/route.ts](../app/sitemap.xml/route.ts) → ссылается на pages/blog/images.
  - Pages: [app/sitemap-pages.xml/route.ts](../app/sitemap-pages.xml/route.ts) — все продуктовые/трастовые/информационные URL.
  - Blog: [app/sitemap-blog.xml/route.ts](../app/sitemap-blog.xml/route.ts).
  - Images: [app/sitemap-images.xml/route.ts](../app/sitemap-images.xml/route.ts).
  - IndexNow: [app/api/indexnow/route.ts](../app/api/indexnow/route.ts) — для мгновенной отправки новых URL.
- **Что сделать вручную:** в Вебмастере → «Файлы Sitemap» → добавить `https://chinachild.ru/sitemap.xml`.

### 9. Важный контент страниц попадает в поисковую базу
- **Статус:** ✅ SSR/SSG включён для всех индексируемых маршрутов. HSK уровни, города, курсы, грамматика, словарь, блог, глоссарий — все рендерятся на сервере.
- **Проверка:** `curl -s https://chinachild-site.vercel.app/courses/hsk-preparation | grep -c "HSK"` — должен возвращать ненулевое число.

### 10. Важные страницы сайта добавлены в Мониторинг важных страниц
- **Статус:** UI-задача в Вебмастере.
- **Что сделать:** в Вебмастере → «Индексирование» → «Важные страницы» → добавить (лимит 100):
  - `/`, `/courses`, `/courses/online-chinese`, `/courses/hsk-preparation`, `/courses/chinese-for-adults`, `/courses/chinese-for-kids`, `/courses/business-chinese`
  - `/price`, `/free-trial`, `/zayavka`
  - `/learn/hsk`, `/hsk/hsk-1` ... `/hsk/hsk-6`
  - `/chinese/hsk-test`, `/about`, `/methodology`, `/license`, `/reviews`, `/results`, `/team`
  - `/repetitor-kitayskogo`
  - Топ-10 городов: `/cities/moscow`, `/cities/saint-petersburg` etc.

### 11. Определён основной адрес сайта
- **Статус:** ✅ реализовано в robots.txt (`Host:`), в canonical через `metadataBase: new URL(SITE_URL)` ([lib/metadata.ts](../lib/metadata.ts)), и через JSON-LD `@id` нодов ([lib/schema.ts](../lib/schema.ts)).
- **Env:** `NEXT_PUBLIC_SITE_URL=https://chinachild.ru` обязательно в production scope Vercel.
- **Что сделать:** в Вебмастере → «Индексирование» → «Переезд сайта» → подтвердить, что главное зеркало — `chinachild.ru` (без `www`).

### 12. Дубли страниц и малоценные страницы либо недоступны роботам, либо приклеены к основным
- **Статус:** ✅ canonical на каждой странице через `buildMetadata({ path })` → `absoluteUrl(path)`. Транзитные state-flow страницы — noindex + canonical на лендинг.
- **UTM-параметры:** robots содержит Yandex `Clean-param` директиву для `utm_*`, `yclid`, `gclid`, `fbclid`, `ysclid`, `etext`, `ymclid`, `gad_source` ([app/robots.txt/route.ts](../app/robots.txt/route.ts)).

### 13. Сайт содержит ценностный и уникальный контент
- **Статус:** контентная работа, не код.
- **Защита от копирования:** см. [docs/yandex-webmaster-original-texts.md](./yandex-webmaster-original-texts.md) — workflow «Оригинальные тексты» через Вебмастер.

### 14. Навигация, функциональность и интерфейс сайта помогают пользователю
- **Статус:** ✅ Header с меню курсов/HSK/блога, breadcrumbs на всех страницах ([components/layout/Breadcrumbs.tsx](../components/layout/Breadcrumbs.tsx)), глобальный поиск `/search`, floating CTA, lead-modal, footer с навигацией.
- **Что проверять руками:** мобильная навигация, accessibility (skip-link, focus states).

### 15. У сайта сформулировано УТП и ценностные отличия от конкурентов
- **Статус:** контентная задача. УТП («HSK 1–2 за 6 месяцев, разговорный уровень, мини-группы до 5, налоговый вычет 13%») заложено в [lib/site-data.ts](../lib/site-data.ts) и hero-блоках. Если нужно усилить — добавить отдельную секцию «Чем мы отличаемся» на главной/about.

### 16. На сайте указана информация, формирующая доверие пользователя
- **Статус:** ✅ практически идеально.
- **Где в коде:**
  - Лицензия и реквизиты в футере ([components/layout/Footer.tsx](../components/layout/Footer.tsx)): ИНН, ОГРНИП, юр. адрес, № лицензии, телефон, **email** (добавлен 2026-05-25).
  - Страница `/license` со сканами и реквизитами Департамента образования Москвы.
  - Цены на `/price` и `/courses/*` (не «по запросу»).
  - JSON-LD Organization с `taxID`, `legalName`, `address`, `contactPoint`, `hasCredential` ([lib/schema.ts](../lib/schema.ts)).
- **Что можно усилить (опционально):** добавить ссылки на официальные соцсети (VK/Telegram/YouTube) в футер и в `Organization.sameAs`. Сейчас `sameAs` содержит только `SITE_HOME_URL`. Если соцсетей пока нет — пропускаем.

### 17. Хорошие оригинальные заголовки и описания страниц
- **Статус:** ✅ каждый индексируемый маршрут вызывает `buildMetadata` с уникальным `title` + `description` + `keywords`.
- **Проверка:** `for f in $(find app -name "page.tsx" -not -path "*/api/*"); do grep -l "buildMetadata\|generateMetadata" $f || echo "MISSING: $f"; done`. Все «MISSING» — это транзитные flow-страницы, у которых теперь есть noindex layout.

### 18. Настроена микроразметка сайта
- **Статус:** ✅ глубоко.
- **Где в коде:** [lib/schema.ts](../lib/schema.ts) — site-wide `@graph`: Organization, EducationalOrganization, LocalBusiness, WebSite, ImageObject (logo), Service, HowTo, Speakable, **SiteNavigationElement** (добавлены 2026-05-25), Course (по всем курсам), Person (преподаватели). На страницах — WebPage, BreadcrumbList, FAQPage, Article/LearningResource, AggregateRating, Review, VideoObject.
- **Проверка:** прогнать `https://chinachild.ru` в Yandex `https://webmaster.yandex.ru/tools/microtest/` и Google Rich Results Test.

### 19. Настроены быстрые ссылки
- **Статус:** ✅ помощь поисковику через `SiteNavigationElement` JSON-LD (12 топ-маршрутов, [lib/schema.ts](../lib/schema.ts) → `createSiteNavigationNodes`). Sitelinks Searchbox через `WebSite.potentialAction` (Yandex и Google).
- **Что от Яндекса:** быстрые ссылки формирует робот сам. Дополнительно в Вебмастере → «Информация о сайте» → «Быстрые ссылки» можно вручную отредактировать список после того, как они появятся (обычно после 1–3 месяцев в индексе).

### 20. Участие в тематических блоках (для медицинских и образовательных услуг)
- **Статус:** UI-задача в Вебмастере. ChinaChild — образовательная организация.
- **Что сделать:** Вебмастер → «Информация о сайте» → «Тематические блоки» → подать заявку в категорию «Образование» → подкатегорию «Языковые курсы / Иностранные языки». Робот проверит наличие лицензии (`/license` → Департамент образования Москвы) и одобрит.

### 21. Сайт подключён к программе партнёрских обогащённых ответов
- **Статус:** UI-задача в Вебмастере. Опционально.
- **Что сделать:** Вебмастер → «Информация о сайте» → «Обогащённые ответы». Подать заявку с указанием тематик (онлайн-обучение китайскому). После апрува Яндекс сможет вытаскивать FAQ/Course/Price блоки в SERP. Учитывая что FAQPage / Course / Price-микроразметка уже стоит, есть высокий шанс апрува.

---

## Что было сделано в коде (changelog)

| Дата | Файл | Изменение |
|---|---|---|
| 2026-05-25 | [app/icon0.svg](../app/icon0.svg) (new) | SVG-фавикон 120×120 — требование Яндекса для отображения иконки в выдаче. |
| 2026-05-25 | [app/manifest.ts](../app/manifest.ts) | Добавлен SVG в `icons[]` (PWA manifest). |
| 2026-05-25 | [app/twitter-image.tsx](../app/twitter-image.tsx) | Убран re-export `runtime` (build warning). |
| 2026-05-25 | [components/layout/Footer.tsx](../components/layout/Footer.tsx) | Добавлен `info@chinachild.ru` — trust-signal. |
| 2026-05-25 | [lib/schema.ts](../lib/schema.ts) | Добавлены `SiteNavigationElement` ноды (для быстрых ссылок в SERP). |
| 2026-05-25 | [app/chinese/hsk-test/take/layout.tsx](../app/chinese/hsk-test/take/layout.tsx) (new) | noindex транзитной flow-страницы. |
| 2026-05-25 | [app/chinese/hsk-test/result/layout.tsx](../app/chinese/hsk-test/result/layout.tsx) (new) | noindex транзитной flow-страницы. |
| 2026-05-25 | `app/diagnostic/{test,calibration,analyzing,tutor,share,result}/layout.tsx` (new) | noindex для 6 транзитных страниц AI-диагностики. |
| 2026-05-25 | [app/sitemap-pages.xml/route.ts](../app/sitemap-pages.xml/route.ts) | Добавлен `/repetitor-kitayskogo`. |

## Команды для верификации после деплоя

```bash
# Проверка наличия SVG-фавикона 120×120
curl -sf https://chinachild.ru/icon0.svg | head -c 200

# Проверка noindex на транзитных страницах
curl -sf https://chinachild.ru/chinese/hsk-test/take | grep robots
curl -sf https://chinachild.ru/diagnostic/test | grep robots

# Sitemap охватывает /repetitor-kitayskogo
curl -sf https://chinachild.ru/sitemap-pages.xml | grep repetitor

# Микроразметка содержит SiteNavigationElement
curl -sf https://chinachild.ru/ | grep -c SiteNavigationElement

# Footer содержит email
curl -sf https://chinachild.ru/ | grep -c "info@chinachild"

# Микроразметка валидна
# Открыть https://webmaster.yandex.ru/tools/microtest/ и проверить главную
```
