# Реестр целей аналитики — Яндекс.Метрика и Google Analytics

> Status: operational checklist. Code defines emitted events; external
> dashboard configuration must be verified in the current vendor UI.

> Обычные funnel-события отправляются через `trackEvent()`, а подтверждённый
> сохранённый лид использует разные основные имена провайдеров:
> серверный `lead_submitted` в Метрике и клиентский `generate_lead` в GA4.
> Этот документ —
> **операционный чек-лист**; он не подтверждает состояние внешних интерфейсов.

## Зачем заводить цели вручную

Обычный `window.ym(id, "reachGoal", "<name>")` попадает в отчёты только если
цель зарегистрирована в `Настройки → Цели`. Канонический `lead_submitted`
отправляется не из браузера, а сервером через Measurement Protocol после
сохранения заявки и использует ту же JavaScript-цель.

Аналогично в Google Analytics 4: цель (Conversion) должна быть включена в `Admin → Events → Mark as conversion`.

---

## Чек-лист: Яндекс.Метрика → Настройки → Цели

Зайти в кабинет Метрики, открыть счётчик `NEXT_PUBLIC_YM_ID`, перейти в раздел «Цели» и создать каждую как **JavaScript-событие** с указанным идентификатором.

### Контакты и CTA

- [ ] `phone_click` — клик по любому `tel:` ссылке (Header, Footer, free-trial, zayavka, city pages, about, repetitor-kitayskogo)
- [ ] `email_click` — клик по любому `mailto:` ссылке
- [ ] `whatsapp_click` — клик по `wa.me` / `whatsapp.com`
- [ ] `course_cta_click` — открытие лид-модалки (с параметрами `source` и `course`)
- [ ] `lead_submitted` — успешная отправка формы (главная конверсия)

### Просмотры ключевых страниц

- [ ] `pricing_view` — заход на `/price`
- [ ] `free_trial_view` — заход на `/free-trial`

### HSK-тест (`/chinese/hsk-test`)

- [ ] `hsk_test_started` — клик «Начать тест» на лендинге или карточке уровня
- [ ] `hsk_test_answered` — ответ на отдельный вопрос (квота: 30+ срабатываний за сессию)
- [ ] `hsk_test_completed` — пользователь увидел экран результата
- [ ] `hsk_test_details_clicked` — переход с результата к подробностям уровня HSK; funnel-событие, не лид
- [ ] `hsk_test_restarted` — повторный запуск
- [ ] `hsk_test_shared` — поделиться результатом (с параметром `network`)

### Диагностика (`/diagnostic` — адаптивный CAT)

- [ ] `diagnostic_started` — вход на лендинг
- [ ] `calibration_completed` — заполнена калибровка (experience, goal, minutesPerDay)
- [ ] `test_question_answered` — ответ на вопрос (квота: 10–20 срабатываний)
- [ ] `test_completed` — алгоритм CAT завершил оценку
- [ ] `result_viewed` — просмотр экрана результата
- [ ] `share_clicked` — клик по кнопке шеринга (с параметром `channel`)
- [ ] `share_card_downloaded` — скачивание share-card (story / square)
- [ ] `course_cta_clicked` — клик «Записаться» на экране результата
- [ ] `tutor_chat_started` — открытие AI-tutor-чата
- [ ] `tutor_message_sent` — отправка сообщения в AI-tutor

### Классификация лидов Метрики

`lead_submitted` / цель `562860580` — единственная выбранная основная лид-цель.
Сайт делает одну серверную попытку отправки на сохранённую заявку, если доступен
настоящий ClientID Метрики. Браузер не вызывает для неё `reachGoal` и не
публикует одноимённое событие в `dataLayer`. Если ClientID недоступен, заявка
всё равно сохраняется, но конверсию нельзя связать с визитом и сервер ничего не
подменяет. Даже настоящий ClientID не гарантирует атрибуцию, если Метрика не
находит подходящий недавний визит. Автоцели, историческая `hsk_test_lead` и
старая цель fallback `563512735` не складываются с канонической целью.

---

## Чек-лист: Google Analytics 4

В GA4 события автоматически попадают в отчёты (в отличие от Метрики), но для конверсий нужно отметить их в `Admin → Events → Mark as key event`:

- [x] `generate_lead` → key event для подтверждённого сохранённого лида
- [ ] `phone_click` → conversion ✓
- [ ] `course_cta_click` → conversion ✓
- [ ] `course_cta_clicked` (из диагностики) → conversion ✓

Остальные события полезны для построения воронок и поведенческих отчётов — оставить как обычные events.

---

## Параметры событий

Многие события несут полезные параметры. Чтобы они появлялись в отчётах Метрики, нужно их добавить в `Параметры визитов → Параметры посетителей → Параметры достижений цели` (для каждой цели):

| Цель | Параметры |
|---|---|
| `phone_click` | `href`, `path` |
| `email_click` | `href`, `path` |
| `course_cta_click` | `source`, `course` |
| `hsk_test_started` | `level`, `mode` |
| `hsk_test_answered` | `level`, `questionId`, `correct` |
| `hsk_test_completed` | `level`, `mode`, `score`, `verdict` |
| `hsk_test_details_clicked` | `level`, `recommendedLevel` |
| `hsk_test_shared` | `level`, `network` |
| `calibration_completed` | `experience`, `goal`, `minutesPerDay` |
| `test_completed` | `ability`, `hsk`, `archetype`, `questions` |
| `share_clicked` | `channel` |
| `share_card_downloaded` | `format` |
| `tutor_message_sent` | `length` |

---

## Как добавить новую цель в код

1. Добавить идентификатор в `Goals` объект в [lib/analytics.ts](../lib/analytics.ts).
2. Вызвать `trackEvent(Goals.NEW_GOAL, { ...params })` в нужном месте кода (или через специализированные хелперы `HskTestGoals` / `track`).
3. Завести цель в Метрике (см. чек-лист выше).
4. Обновить этот документ.

---

## Где смотреть отчёты

- **Метрика:** Отчёты → Стандартные отчёты → Конверсии (по целям). Воронки: Отчёты → Конверсии → Воронки.
- **GA4:** Reports → Engagement → Events.
- **Дашборд в реальном времени:** Метрика → Карта кликов / Карта скроллинга для UX-инсайтов.
