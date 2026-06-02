# Production Migration Audit: chinachild-site -> chinachild.ru

Дата аудита: 2026-05-19  
Цель: оценить готовность Next.js сайта к замене текущего сайта на Tilda на основном домене `chinachild.ru`.  
Фокус: SEO для Яндекс/Google, лидогенерация, РФ-юридика, производительность, готовность домена.

## 0. Структура проекта

### Стек и роутинг

- ✅ **Next.js App Router**: маршруты находятся в `app/**`, `pages/**` отсутствует.
- Версия из `package.json`: `next@^15.5.15`, `react@^19.2.5`, `react-dom@^19.2.5`.
- Локальный Next guide из инструкции `AGENTS.md` не найден: `node_modules/next/dist/docs/` отсутствует в установленном пакете.
- Основной layout: `app/layout.tsx`.
- Глобальная metadata-утилита: `lib/metadata.ts`.
- Централизованный URL/контакты/реквизиты: `lib/site-config.ts`.

### Источники контента

- **Статический TS-контент**: курсы, преподаватели, отзывы, FAQ, цены, футер в `lib/site-data.ts`; города в `lib/cities.ts`; HSK-уровни в `lib/hsk-levels.ts`.
- **MDX-like файлы без MDX runtime**: блог в `content/blog/*.mdx` парсится вручную через `lib/blog.ts`; глоссарий в `content/glossary/*.mdx` через `lib/glossary.ts`.
- **Supabase public read**: грамматика, словарь, HSK decks и слова читаются через `lib/supabase/public-content.ts`, `lib/content/grammar.ts`, `lib/content/dictionary.ts`; при отсутствии env или ошибке сети код возвращает пустые данные.
- **Static assets**: изображения преподавателей `public/team/**`, лицензия `public/license/**`, hero-изображения `public/heroes/**`.
- **Лидогенерация**: клиентская форма `components/forms/LeadForm.tsx`, API route `app/api/contact/route.ts`, fan-out в Telegram/Resend/webhook через `lib/lead-dispatch.ts`.

### Основные зависимости

- Runtime: `@next/third-parties`, `@supabase/supabase-js`, `@vercel/speed-insights`, `hanzi-writer`, `lucide-react`, `server-only`, `clsx`, `tailwind-merge`.
- Dev: TypeScript, ESLint 9, `eslint-config-next`, Tailwind CSS 4, PostCSS, Autoprefixer.
- Не установлены: `zod`, `react-hook-form`, captcha SDK, email SDK package; email отправляется через прямой `fetch` к Resend API.

### Карта маршрутов

| Route | Тип | Контент |
|---|---:|---|
| `/` | static | Главная: hero, курсы, платформа, преподаватели, отзывы, FAQ, блог preview; `app/page.tsx`, `lib/site-data.ts`, `content/blog` |
| `/about` | static | О школе, контакты, лицензия, команда; `app/about/page.tsx` |
| `/team`, `/team/[slug]` | static/SSG | Преподаватели и био; `app/team/**`, `lib/site-data.ts` |
| `/courses`, `/courses/*` | static | Посадочные курсов: online, HSK, adults, kids, business; `app/courses/**`, `components/sections/CourseLanding.tsx` |
| `/price`, `/free-trial`, `/zayavka` | static | Цены и заявки; `app/price/page.tsx`, `app/free-trial/page.tsx`, `app/zayavka/page.tsx` |
| `/blog`, `/blog/[slug]`, `/blog/category/[slug]` | static/SSG | Блог из `content/blog/*.mdx`; `lib/blog.ts`, `lib/blog-hubs.ts` |
| `/glossary`, `/glossary/[slug]` | static/SSG | Глоссарий из `content/glossary/*.mdx`; `lib/glossary.ts` |
| `/grammar`, `/grammar/[slug]`, `/grammar/tags/*`, `/grammar/sections/*` | dynamic/SSG ISR | Грамматика из Supabase, revalidate 300; `lib/content/grammar.ts` |
| `/dictionary`, `/dictionary/hsk/*`, `/dictionary/word/[slug]` | dynamic/SSG ISR | Словарь и HSK decks из Supabase, revalidate 300; `lib/content/dictionary.ts` |
| `/hsk/[slug]`, `/learn/hsk` | SSG/static ISR | HSK landing cluster; `lib/hsk-levels.ts` |
| `/cities`, `/cities/[slug]` | static/SSG ISR | Гео-лендинги по городам РФ; `lib/cities.ts` |
| `/reviews`, `/results`, `/methodology`, `/license`, `/docs` | static | Доверие/E-E-A-T/документы |
| `/public-treaty`, `/user-agreement`, `/privacy-policy` | static | Юридические страницы |
| `/search` | dynamic | Серверный поиск по блогу и глоссарию |
| `/sitemap.xml`, `/sitemap-pages.xml`, `/sitemap-blog.xml`, `/sitemap-images.xml`, `/robots.txt`, `/feed.xml`, `/llms.txt` | route handlers | SEO-фиды |
| `/api/contact`, `/api/indexnow` | route handlers | Заявки и IndexNow |

## 1. Технический SEO

| Пункт | Статус | Что есть сейчас | Что не так | Приоритет | Как фиксить |
|---|---:|---|---|---:|---|
| `sitemap.xml` | ⚠️ частично | `app/sitemap.xml/route.ts` делает sitemap index; `app/sitemap-pages.xml/route.ts`, `app/sitemap-blog.xml/route.ts`, `app/sitemap-images.xml/route.ts` генерируют URL через `absoluteUrl()` | Если `NEXT_PUBLIC_SITE_URL` не задан, все sitemap URL становятся техническим fallback-доменом; `.env.example` уже указывает cutover-домен | P0 | На production задать `NEXT_PUBLIC_SITE_URL=https://chinachild.ru`, пересобрать и проверить XML |
| `robots.txt` | ⚠️ частично | `app/robots.txt/route.ts`: Allow all, Disallow `/api/`, Yandex Clean-param, Host, Sitemap | Host и Sitemap зависят от `SITE_URL`, сейчас риск Vercel host; нет запрета индексации preview-домена на уровне production/preview окружений | P0 | После смены env проверить `/robots.txt`; для preview-доменов добавить защиту от индексации или отдельный robots |
| Canonical URL | ⚠️ частично | `lib/metadata.ts` ставит абсолютный canonical через `absoluteUrl(path)`; root canonical в `app/layout.tsx` | Готово архитектурно, но ломается на дефолтном `SITE_URL`; часть страниц без своего metadata наследует root/общие значения или static metadata | P0 | Исправить env/default URL; пройти страницы без `generateMetadata`: `/cities`, `/compare/*`, `/learn/hsk`, `/license`, `/price`, `/team`, `/zayavka`, `/free-trial` уже имеют static metadata, но проверить canonical в HTML |
| Title/description | ⚠️ частично | Большинство страниц имеют `generateMetadata` или `metadata` через `buildMetadata`: `app/about/page.tsx`, `app/blog/**`, `app/courses/**`, `app/grammar/**`, legal pages | Не у всех маршрутов есть `generateMetadata`; часть использует static `metadata`, а часть, вероятно, наследует root metadata (`/cities`, `/compare/*`, `/learn/hsk`, `/license`, `/price`) | P1 | Добавить/проверить уникальные metadata для всех commercial/trust страниц; особенно `/price`, `/license`, `/cities`, `/learn/hsk` |
| Open Graph + Twitter | ⚠️ частично | `buildMetadata()` добавляет OG/Twitter; `app/opengraph-image.tsx`, route-level OG для blog/course pages | `twitter-image.tsx` реэкспортирует `runtime`, build предупреждает, что Next не распознает `runtime`; OG URL тоже зависят от `SITE_URL` | P1 | Убрать проблемный re-export runtime или задать exports напрямую; проверить production OG/Twitter через URL inspector |
| JSON-LD schema.org | ✅ готово | `lib/schema.ts`, `components/seo/JsonLd.tsx`; Organization, WebSite, Course, FAQPage, BreadcrumbList, Article/LearningResource, Review/AggregateRating, Person | Хорошее покрытие; LocalBusiness для city pages есть в `app/cities/[slug]/page.tsx`; `Course` есть в `components/sections/CourseLanding.tsx` и `CoursesSection.tsx` | P2 | После домена прогнать Rich Results / Schema Validator, поправить warnings |
| URL structure | ✅ готово | Читаемые транслит/англ slug: `/courses/online-chinese`, `/blog/hsk-levels-explained`, `/cities/moscow`, `/grammar/...` | Для РФ-аудитории англ slugs допустимы; есть старые редиректы с русских транслит URL, но нет полного Tilda inventory | P1 | Составить карту всех старых Tilda URL и добавить 301/308 redirects |
| `not-found.tsx` и `error.tsx` | ⚠️ частично | Есть кастомный `app/not-found.tsx` с noindex и ссылками | `app/error.tsx` отсутствует; runtime ошибки покажут дефолтный error boundary | P1 | Добавить корневой `app/error.tsx` с дружелюбным текстом, noindex и ссылкой на заявку/курсы |
| `next/image` + alt | ⚠️ частично | `next/image` в `Header`, `PageHero`, `Avatar`, `CertificateGallery`, `license`; alt в данных преподавателей/лицензии | Build warnings: `<img>` в `app/blog/[slug]/page.tsx:94` и `components/sections/PlatformShowcase.tsx:189`; декоративные alt пустые корректны для логотипа/metrika | P1 | Заменить контентные `<img>` на `Image` там, где известны размеры; оставить noscript/metrika как исключение |
| Редиректы внутри сайта | ⚠️ частично | `next.config.ts` содержит 308 для `/kursy`, `/onlajn-kursy`, `/hsk`, `/dlya-*`, нескольких старых blog slug | Покрытие похоже ручное и неполное для полной замены Tilda; нет списка всех старых URL и UTM/canonical политики для старого домена | P0 | Перед DNS cutover выгрузить Tilda sitemap/страницы, составить redirect map 1:1, добавить redirects и проверить 404 crawl |

## 2. Контент и E-E-A-T

| Пункт | Статус | Что есть сейчас | Что не так | Приоритет | Как фиксить |
|---|---:|---|---|---:|---|
| Страница «О нас» / «О школе» | ✅ готово | `/about`, `app/about/page.tsx`; лицензия, команда, контакты, методика | Нет полного юр.адреса в контактном блоке страницы, хотя есть в legal/config | P1 | Добавить реквизиты/адрес в контактный блок `/about` |
| Страница преподавателей с био | ✅ готово | `/team`, `/team/[slug]`, `lib/site-data.ts`; bio, education, certificates, Person schema | Хорошее E-E-A-T покрытие | P2 | Добавить внешние `sameAs` профили, если есть реальные публичные страницы |
| Страница автора | ⚠️ частично | Blog post связывает автора с `teachers` через `authorSlug`; карточка автора есть в `app/blog/[slug]/page.tsx` | Отдельного URL автора как автора блога нет, используется `/team/[slug]`; это нормально, но в статье нет явной ссылки на профиль автора | P1 | В карточке автора сделать ссылку на `/team/[slug]` и добавить `sameAs`/author URL в Article schema |
| Контакты с юр.адресом и телефоном | ⚠️ частично | Телефон/email есть в footer/about/legal; юр.адрес есть в `LICENSEE.address` и legal pages | В футере нет адреса и ОГРНИП; на `/about` контактный блок без юр.адреса | P1 | Вывести `LICENSEE.address`, `LICENSEE.ogrnip`, телефон/email в футере и `/about` |
| Публичная оферта / соглашение | ✅ готово | `/public-treaty`, `/user-agreement`, footer links | Есть дата публикации и реквизиты | P2 | Юристу финально проверить формулировки под фактическую схему оплаты |
| Политика конфиденциальности | ✅ готово | `/privacy-policy`, footer link | Описывает cookies, аналитику, ПДн, несовершеннолетних | P2 | Добавить отдельную страницу/текст согласия на обработку ПДн, если юрист требует отдельный документ |
| Cookie banner | ❌ нет | В policy cookies описаны; в коде баннер/consent component не найден | Метрика/GA грузятся сразу в `app/layout.tsx`; явного согласия/уведомления нет | P0 | Добавить cookie banner с категориями или минимум уведомление с согласием; до согласия не грузить GA/необязательные cookies |

## 3. Аналитика

| Пункт | Статус | Что есть сейчас | Что не так | Приоритет | Как фиксить |
|---|---:|---|---|---:|---|
| Яндекс.Метрика | ✅ готово | `components/analytics/YandexMetrika.tsx`, подключена в `app/layout.tsx`; `.env.local` содержит `NEXT_PUBLIC_YM_ID`; цель `lead_submitted` | Нет cookie consent gate; цели ограничены одной заявкой | P0/P1 | Сначала consent gate, затем добавить цели: open_form, phone_click, email_click, course_cta, quiz/test clicks |
| Яндекс.Вебмастер | ✅ готово | `NEXT_PUBLIC_YANDEX_VERIFICATION` в `.env.local`; также есть public verification file `public/yandex_17435cb33967d4ab.html` | После смены домена нужно подтвердить именно `chinachild.ru` | P1 | Проверить meta/file в Яндекс.Вебмастере после DNS |
| Google Analytics 4 | ✅ готово | `components/analytics/GoogleAnalytics.tsx`, `@next/third-parties/google`, `.env.local` содержит `NEXT_PUBLIC_GA_ID` | Нет consent gate; нет расширенной карты событий | P0/P1 | Завязать загрузку GA на cookie consent; расширить event taxonomy |
| Google Search Console | ✅ готово | `NEXT_PUBLIC_GOOGLE_VERIFICATION` в `.env.local`; `public/google54888911d7826dee.html` | Нужно подтвердить production-домен после cutover | P1 | Проверить ownership и sitemap submit в GSC |
| Единая утилита событий | ⚠️ частично | `lib/analytics.ts` с `trackEvent()`; `LeadForm` имеет локальный `trackLeadSubmitted()` | Дублирование логики событий, не все клики используют утилиту | P1 | Перевести формы/CTA/контактные клики на `trackEvent()` и единые имена целей |

## 4. Лидогенерация

| Пункт | Статус | Что есть сейчас | Что не так | Приоритет | Как фиксить |
|---|---:|---|---|---:|---|
| Формы заявок | ✅ готово | `LeadForm` на `/zayavka`, `/free-trial`; `LeadModal` в header, floating CTA, course landings, city pages, trust pages | Поля: name, phone, course, callTime, marketing, consent, honeypot; email поддержан API, но не показан в форме | P1 | Добавить optional email, если нужен email follow-up; добавить phone/email click events |
| API route | ✅ готово | `app/api/contact/route.ts`, node runtime, dynamic; sanitize, phone/email regex, honeypot, consent check | Нет rate limit/captcha; при отсутствии каналов доставки API вернет ok с `attempted: 0` | P0 | Добавить обязательную production-конфигурацию каналов и ошибку/алерт при `attempted=0`; добавить rate limit/captcha |
| SMTP/email provider | ⚠️ частично | `lib/lead-dispatch.ts` поддерживает Resend API через `RESEND_API_KEY`, `LEAD_EMAIL_FROM`, `LEAD_EMAIL_TO`; Telegram/webhook тоже поддержаны | Эти env не описаны в `.env.example`; в локальной проверке не найдены в `.env.local` | P0 | Описать env в `.env.example`, настроить Vercel production env, отправить тестовую заявку |
| Капча | ❌ нет | Есть honeypot | Honeypot не защищает от targeted spam; публичная форма и API без rate limit | P1 | Добавить Yandex SmartCaptcha/hCaptcha или server-side rate limit по IP + UA |
| Хранение лидов | ❌ нет | Логи Vercel + отправка в Telegram/Resend/webhook | Нет durable storage; при сбое внешнего канала лид может потеряться | P0 | Сохранять lead в БД/CRM/Supabase перед fan-out; delivery делать вторично |
| Согласие на ПД | ⚠️ частично | Checkbox в `LeadForm`, API требует `consent === true`, ссылка на `/privacy-policy` | Checkbox `defaultChecked`; для 152-ФЗ лучше явное действие без предвыбора | P0 | Убрать `defaultChecked`, добавить отдельный текст согласия и версию документа |
| Валидация | ⚠️ частично | HTML constraints + server regex/sanitize в `app/api/contact/route.ts` | Нет `zod`/schema validation; client/server правила расходятся | P1 | Ввести общую schema validation на сервере, клиенту показывать ошибки из API |

## 5. Доверие

| Пункт | Статус | Что есть сейчас | Что не так | Приоритет | Как фиксить |
|---|---:|---|---|---:|---|
| Блок отзывов | ✅ готово | `components/sections/ReviewsSection.tsx`, `/reviews`, `reviews` в `lib/site-data.ts`, Review schema | Отзывов только 4, без внешних источников/скринов | P1 | Добавить ссылки/скрины/платформы источников или расширить отзывы |
| Логотипы партнёров | ❌ нет | В коде не найден блок partner logos | Для B2B/доверия нет визуальных подтверждений | P2 | Добавить только реальные партнеры/клиенты с разрешением |
| Ссылки на соцсети | ❌ нет | Есть share buttons на Telegram/VK (`components/ui/ShareButtons.tsx`) | Нет ссылок на официальные соцсети школы в footer/header/schema `sameAs` | P1 | Добавить реальные VK/Telegram/YouTube/etc. в footer и `Organization.sameAs` |
| Сертификаты | ✅ готово | Лицензия `/license`, сканы `public/license/**`; сертификаты преподавателей в `lib/site-data.ts` и `CertificateGallery` | Некоторые файлы сертификатов могут отсутствовать, helper фильтрует их | P2 | Проверить наличие всех файлов из `teachers.certificates` |
| Кейсы учеников | ⚠️ частично | `/results`, отзывы; blog has business case content in `content/blog/business-chinese-online-courses.mdx` | Нет отдельного structured case-study блока/страницы с результатами и доказательствами | P2 | Добавить 2-3 anonymized кейса с исходной целью, сроком, результатом |

## 6. Юридическое: РФ, 152-ФЗ

| Пункт | Статус | Что есть сейчас | Что не так | Приоритет | Как фиксить |
|---|---:|---|---|---:|---|
| Явное согласие на ПД в каждой форме | ⚠️ частично | `LeadForm` содержит required checkbox, API требует consent | Checkbox предвыбран (`defaultChecked`); маркетинговое согласие тоже предвыбрано | P0 | Сделать оба checkbox непредвыбранными; хранить timestamp, текст/версию согласия, source |
| Юр.адрес, ОГРН/ОГРНИП, ИНН в футере | ⚠️ частично | Footer показывает `LICENSEE.legalName`, ИНН, лицензию; legal pages показывают адрес/ОГРНИП | Footer не показывает ОГРНИП и адрес | P0 | Добавить `LICENSEE.ogrnip` и `LICENSEE.address` в footer |
| Cookie-уведомление | ❌ нет | `/privacy-policy` описывает cookies | Баннер не найден, GA/Метрика стартуют сразу | P0 | Добавить cookie banner/consent mode и блокировку необязательных скриптов до согласия |

## 7. Производительность

### `next build` output

Команда: `npm run build`  
Результат: ✅ build completed successfully.

Важные предупреждения:

- `Next.js can't recognize the exported runtime field in "/twitter-image"` из-за `app/twitter-image.tsx` re-export.
- `Using edge runtime on a page currently disables static generation for that page`.
- ESLint warnings:
  - `app/blog/[slug]/page.tsx:94` uses `<img>`.
  - `components/sections/PlatformShowcase.tsx:189` uses `<img>`.
  - unused vars in `components/content/DictionarySearchResults.tsx`, `lib/content/dictionary.ts`, `lib/schema.ts`.
- During SSG: `TypeError: fetch failed`, `getaddrinfo ENOTFOUND wcucqejmjzxhhkqyqvgo.supabase.co`; build still finished because Supabase loaders degrade gracefully.

Key build table:

```text
Route (app)                                                      Size  First Load JS  Revalidate  Expire
┌ ○ /                                                         2.76 kB         125 kB
├ ○ /_not-found                                                 187 B         102 kB
├ ○ /about                                                      207 B         114 kB
├ ƒ /api/contact                                                187 B         102 kB
├ ƒ /api/indexnow                                               187 B         102 kB
├ ○ /blog                                                       207 B         114 kB
├ ● /blog/[slug]                                                176 B         111 kB          1d      1y
├ ○ /cities                                                     588 B         123 kB
├ ● /cities/[slug]                                              207 B         114 kB          1d      1y
├ ○ /courses                                                    207 B         114 kB
├ ○ /courses/business-chinese                                   600 B         123 kB
├ ○ /courses/chinese-for-adults                                 600 B         123 kB
├ ○ /courses/chinese-for-kids                                   600 B         123 kB
├ ○ /courses/hsk-preparation                                    600 B         123 kB
├ ○ /courses/online-chinese                                     600 B         123 kB
├ ƒ /dictionary                                                2.7 kB         117 kB
├ ○ /dictionary/hsk                                             207 B         114 kB          5m      1y
├ ● /dictionary/word/[slug]                                   4.13 kB         110 kB          5m      1y
├ ○ /free-trial                                               2.94 kB         108 kB
├ ○ /glossary                                                   588 B         123 kB
├ ● /glossary/[slug]                                            175 B         106 kB          1d      1y
├ ƒ /grammar                                                   2.3 kB         116 kB
├ ● /grammar/[slug]                                           2.18 kB         108 kB          5m      1y
├ ● /hsk/[slug]                                                 937 B         123 kB          1d      1y
├ ○ /learn/hsk                                                  207 B         114 kB          1d      1y
├ ○ /license                                                    207 B         114 kB
├ ○ /methodology                                                600 B         123 kB
├ ○ /price                                                      581 B         123 kB
├ ○ /privacy-policy                                             175 B         106 kB
├ ○ /public-treaty                                              175 B         106 kB
├ ○ /reviews                                                    207 B         114 kB
├ ƒ /search                                                     175 B         106 kB
├ ○ /sitemap-pages.xml                                          187 B         102 kB          5m      1y
├ ○ /team                                                       588 B         123 kB
├ ● /team/[slug]                                                574 B         120 kB
└ ○ /zayavka                                                  2.94 kB         108 kB
+ First Load JS shared by all                                  102 kB
```

| Пункт | Статус | Что есть сейчас | Что не так | Приоритет | Как фиксить |
|---|---:|---|---|---:|---|
| Размер бандла | ✅ готово | First Load JS mostly 102-125 kB; shared 102 kB | Для SEO лендингов приемлемо | P2 | После продакшена проверить Lighthouse/Web Vitals на реальном домене |
| Server vs Client Components | ⚠️ частично | App Router server by default; client only для Header, forms, theme, reveal, analytics, dictionary search, hanzi/stroke UI | `Header` весь client из-за меню/theme/modal; `FloatingCta` и формы грузятся глобально, повышая JS на всех страницах | P1 | Разнести header на server shell + client mobile/menu islands; лениво грузить lead modal |
| Кэширование, ISR, SSG | ✅ готово | Blog/cities/hsk/glossary SSG+ISR; grammar/dictionary revalidate 300; route handlers force-static где надо | Supabase DNS/network во время SSG может дать пустой контент, хотя build не падает | P1 | На production build обеспечить env+network; добавить build-time smoke check количества grammar/dictionary URL |
| Тяжёлые клиентские библиотеки | ⚠️ частично | `hanzi-writer` вероятно используется в interactive stroke components; `@supabase/supabase-js` server-only для public content | Нужно проверить, не попадает ли `hanzi-writer` на страницы без stroke UI; глобальный LeadModal грузится в header/floating | P2 | Запустить bundle analyzer; динамически импортировать stroke/lead modal при необходимости |

## 8. Внутренняя структура

| Пункт | Статус | Что есть сейчас | Что не так | Приоритет | Как фиксить |
|---|---:|---|---|---:|---|
| Перелинковка между статьями | ⚠️ частично | `lib/blog-autolinker.tsx` автолинкует blog article text; footer/header/RelatedLinks сильные | В blog article нет блока related posts в конце | P1 | Добавить related posts по category/keywords и CTA в конце статьи |
| Breadcrumbs | ✅ готово | `components/layout/Breadcrumbs.tsx` + JSON-LD; подключены почти везде | Хорошее покрытие | P2 | Проверить визуально на мобильном |
| Похожие материалы | ⚠️ частично | `components/sections/RelatedLinks.tsx` для landing pages; grammar article links to platform/free trial/all rules | Blog/glossary/dictionary word pages не имеют явного related блока | P1 | Добавить related articles/terms/words по тегам/категориям |
| Поиск по сайту | ⚠️ частично | `/search` ищет по blog и glossary; form на странице | Не ищет Supabase grammar/dictionary, нет поисковой строки в header | P2 | Расширить поиск на grammar/dictionary и добавить entry point в header/footer |

## 9. Готовность к смене домена

| Пункт | Статус | Что есть сейчас | Что не так | Приоритет | Как фиксить |
|---|---:|---|---|---:|---|
| Hardcoded `chinachild-site.vercel.app` | ⚠️ частично | Оставлен только как текущий технический fallback в `lib/site-config.ts` и в cutover/audit документации | canonical/sitemap/robots/feed/legal links зависят от production env | P0 | На cutover поставить `NEXT_PUBLIC_SITE_URL=https://chinachild.ru` и redeploy |
| `NEXT_PUBLIC_SITE_URL` | ⚠️ частично | Есть в `.env.example`; `SITE_URL` читает env в `lib/site-config.ts` | В `.env.local` переменная не найдена; build использовал default Vercel URL | P0 | Задать `NEXT_PUBLIC_SITE_URL=https://chinachild.ru` во всех production env и локально для проверки |
| Canonical generation | ⚠️ частично | `absoluteUrl()` используется в `lib/metadata.ts`, sitemap, robots, legal pages | Абсолютно зависит от `SITE_URL`; fallback опасный | P0 | Сделать fallback production-safe или fail-fast при production build без `NEXT_PUBLIC_SITE_URL` |
| Sitemap absolute URLs | ⚠️ частично | Все через `absoluteUrl()` | При неверном env будут Vercel absolute URLs | P0 | Проверить curl/браузером `/sitemap.xml` и вложенные sitemap после деплоя |
| Open Graph URLs | ⚠️ частично | `metadataBase: new URL(SITE_URL)` и `openGraph.url` | При неверном env OG URL на Vercel; `twitter-image` warning | P1 | Проверить rendered meta tags на `chinachild.ru`; исправить twitter image export |
| Hardcoded URL в meta/текстах | ⚠️ частично | В текстах есть `chinachild.ru` как брендовый домен; platform fallback обновлён на `https://my.chinachild.ru` | `lib/site-config.ts` всё ещё имеет технический fallback для текущего Vercel production | P0 | Не полагаться на fallback после cutover; поставить production env и проверить rendered metadata |

## Общий summary

### Оценка готовности

**74 / 100**

Проект технически зрелый: App Router, SSG/ISR, sitemap/robots/feed, schema.org, статьи, глоссарий, команда, лицензия, legal pages, лид-формы и analytics уже есть. Но для миграции на основной SEO-домен есть несколько P0-рисков: production URL сейчас небезопасно fallback'ится на Vercel, нет полного redirect map с Tilda, нет cookie consent, лиды не сохраняются надежно, а юридические реквизиты/согласия в формах нужно довести до более строгого уровня.

### Топ-5 P0 блокеров

1. **`SITE_URL` production env must be set before cutover**  
   Файл: `lib/site-config.ts`; локальный build показал отсутствие `NEXT_PUBLIC_SITE_URL` в `.env.local`. Риск: canonical, sitemap, robots Host, OG, feed, legal links уйдут на fallback-домен.

2. **Redirect map must be deployed and audited**  
   Файл: `docs/cutover/redirect-map.csv`; `next.config.ts` загружает карту редиректов. Риск остаётся до production redeploy и `npm run audit:redirects`.

3. **Нет cookie banner / consent gate при включенных Яндекс.Метрике и GA4**  
   Файлы: `app/layout.tsx`, `components/analytics/YandexMetrika.tsx`, `components/analytics/GoogleAnalytics.tsx`; policy есть, баннера нет. Риск: юридический и репутационный для РФ/ЕЭЗ-трафика.

4. **Лиды не сохраняются durable-first и могут потеряться**  
   Файлы: `app/api/contact/route.ts`, `lib/lead-dispatch.ts`; есть Telegram/Resend/webhook fan-out, но нет БД/CRM storage и production env не описаны в `.env.example`.

5. **152-ФЗ/юридические реквизиты в UI неполные**  
   Файлы: `components/forms/LeadForm.tsx`, `components/layout/Footer.tsx`; consent checkbox предвыбран, marketing checkbox предвыбран, footer без ОГРНИП и адреса.

### Оценка трудозатрат на P0

- Production URL/env/fallback + проверка sitemap/robots/meta: **2-4 часа**.
- Полный redirect map Tilda -> Next.js: **0.5-2 дня**, зависит от количества старых Tilda URL и доступности экспорта.
- Cookie banner + consent-gated analytics: **0.5-1.5 дня**.
- Durable lead storage + production delivery smoke test: **0.5-1.5 дня**.
- Юридические UI-правки по ПДн/футеру: **2-6 часов** без учета юриста.

Итого реалистично: **2-5 рабочих дней** до спокойного production cutover, если нет скрытого большого Tilda URL inventory.
