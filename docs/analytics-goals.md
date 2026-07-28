# Реестр целей аналитики — Яндекс.Метрика и Google Analytics

> Status: operational checklist. Code defines emitted events; external
> dashboard configuration must be verified in the current vendor UI.

> Все цели уже отправляются из кода через `trackEvent()` ([lib/analytics.ts](../lib/analytics.ts)). Этот документ — **операционный чек-лист**: какие цели нужно завести в самих интерфейсах Метрики/GA, чтобы события попадали в отчёты.

## Зачем заводить цели вручную

`window.ym(id, "reachGoal", "<name>")` уходит на сервер Метрики всегда, но **попадает в отчёты только если эта цель явно зарегистрирована в `Настройки → Цели`**. Без регистрации события молча игнорируются.

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
- [ ] `hsk_test_lead` — клик «Записаться на курс» на экране результата (главный goal для теста)
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

### Главные конверсии (отметить как «Главные» в Метрике)

Для удобства отчётов и фильтра воронки рекомендую отметить эти 3 цели как «**Главные**» в Метрике:

1. `lead_submitted` — итоговая конверсия (лид в CRM)
2. `phone_click` — конверсия по телефону
3. `hsk_test_lead` / `course_cta_clicked` — лид с продуктовой воронки тестов

---

## Чек-лист: Google Analytics 4

В GA4 события автоматически попадают в отчёты (в отличие от Метрики), но для конверсий нужно отметить их в `Admin → Events → Mark as key event`:

- [ ] `lead_submitted` → conversion ✓
- [ ] `phone_click` → conversion ✓
- [ ] `course_cta_click` → conversion ✓
- [ ] `hsk_test_lead` → conversion ✓
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
| `hsk_test_lead` | `level`, `recommendedLevel` |
| `hsk_test_shared` | `level`, `network` |
| `lead_submitted` | `course`, `source` |
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
