# PASS 6 curriculum stage evidence

Review date: 2026-07-31

## Allocation rule

`lib/course-modules.ts:3-14` defines one module as eight 60-minute guided
lessons (eight guided hours). Each offer has four ordered stages of two guided
hours, so the stage allocation is lessons 1–2, 3–4, 5–6, and 7–8. The lesson
pairs report the feed allocation; they do not claim that an individual
teacher cannot adapt examples or pacing to the learner's starting level.

## Adults

Canonical offer: `/courses/chinese-for-adults`

| Stage | Lessons represented | Assigned hours | Repository-backed content source | Evidence specific to this offer |
| --- | --- | ---: | --- | --- |
| 1. Пиньинь и тоны | 1–2 | 2 | `lib/course-modules.ts:53-60`; `app/courses/chinese-for-adults/page.tsx:28-35, 87-99, 135-140` | The adult page starts the HSK 1–2 route with phonetics and tones, describes adult pronunciation fears, and uses the trial lesson to diagnose phonetics and the learner's existing base. The typed stage explicitly adapts the material to the adult's current level. |
| 2. Лексика и иероглифы | 3–4 | 2 | `lib/course-modules.ts:61-67`; `app/courses/chinese-for-adults/page.tsx:28-35, 68-78, 95-123` | The page supports basic characters and short reading, then grounds vocabulary in adult travel, relocation, work, transport, ticket and restaurant situations. This is adult task vocabulary, not the schoolchildren context. |
| 3. Грамматика и диалоги | 5–6 | 2 | `lib/course-modules.ts:68-74`; `app/courses/chinese-for-adults/page.tsx:28-49, 109-123, 147-151` | The adult offer explicitly combines grammar, speaking and practical dialogues, with Russian-language explanations and personal feedback. Its sample outcomes are adult everyday scenarios such as transport and restaurants. |
| 4. Аудирование и проверка прогресса | 7–8 | 2 | `lib/course-modules.ts:75-81`; `app/courses/chinese-for-adults/page.tsx:127-151`; `lib/hsk-levels.ts:47-76, 104-114` | The HSK 1–2 adult route includes listening as a defined skill; the page adds between-lesson pronunciation practice and a checkpoint every four lessons. The final stage therefore closes the adult's individually adapted module with listening, consolidation and a progress check. |

## Schoolchildren 12+

Canonical offer: `/courses/chinese-for-kids`

| Stage | Lessons represented | Assigned hours | Repository-backed content source | Evidence specific to this offer |
| --- | --- | ---: | --- | --- |
| 1. Диагностика, пиньинь и тоны | 1–2 | 2 | `lib/course-modules.ts:95-102`; `app/courses/chinese-for-kids/page.tsx:28-35, 59-72, 95-100` | The 12+ page names phonetics and tones as the starting material, explains the adolescent learning context, and has the teacher assess the child's level. This is a school-age diagnostic, distinct from the adult goal interview. |
| 2. Лексика о себе, семье и школе | 3–4 | 2 | `lib/course-modules.ts:103-109`; `app/courses/chinese-for-kids/page.tsx:28-35, 87-92`; `lib/hsk-levels.ts:79-97` | The schoolchildren roadmap starts with phrases about self and family. The repository HSK 1 curriculum supplies both family and school sample sentences and lists school as a topic area. The 12+ page additionally defines age-specific, non-preschool contexts, which justifies the school-focused selection. |
| 3. Грамматика и живые диалоги | 5–6 | 2 | `lib/course-modules.ts:110-116`; `app/courses/chinese-for-kids/page.tsx:28-42, 87-92, 103-106`; `lib/hsk-levels.ts:96-108` | The page promises live dialogues in an individual adolescent pace; the HSK 1 source supplies the simple SVO, question, negation and classroom-use structures. The school schedule and peer-dialogue positioning distinguish delivery from the adult scenarios. |
| 4. Аудирование и отчёт о прогрессе | 7–8 | 2 | `lib/course-modules.ts:117-123`; `app/courses/chinese-for-kids/page.tsx:87-100, 109-113`; `lib/hsk-levels.ts:64-76, 104-108` | The schoolchildren roadmap includes listening, while the page promises a parent-facing progress report every four lessons and an assistant that tracks weak words and pronunciation. The parent report makes this stage specific to the 12+ offer. |

## HSK preparation

Canonical offer: `/courses/hsk-preparation`

| Stage | Lessons represented | Assigned hours | Repository-backed content source | Evidence specific to this offer |
| --- | --- | ---: | --- | --- |
| 1. Диагностика и экзаменационная цель | 1–2 | 2 | `lib/course-modules.ts:136-143`; `app/courses/hsk-preparation/page.tsx:32-45, 112-115` | The starting test identifies the current HSK level, and the plan is tied to a target level, exam date and score-related goal. This is exam diagnosis rather than general-language onboarding. |
| 2. Целевая лексика и грамматика | 3–4 | 2 | `lib/course-modules.ts:144-150`; `app/courses/hsk-preparation/page.tsx:85-109, 112-116`; `lib/hsk-levels.ts:14-45` | The page selects vocabulary by its frequency in HSK tests and by the learner's target level. The repository level model provides level-specific vocabulary, characters, grammar and exam sections, so the stage is explicitly exam-scoped. |
| 3. Задания в формате HSK | 5–6 | 2 | `lib/course-modules.ts:151-157`; `app/courses/hsk-preparation/page.tsx:40-45, 112-117`; `lib/hsk-levels.ts:31-44, 64-76` | The canonical page states that every lesson uses real HSK task formats and names listening, reading and writing. These are examination sections, not a generic dialogue stage. |
| 4. Пробник и разбор ошибок | 7–8 | 2 | `lib/course-modules.ts:158-164`; `app/courses/hsk-preparation/page.tsx:112-117` | Timed mock tests, lost-point analysis and a next-module plan are directly stated. The timed assessment and score-loss review are unique to the examination offer. |

## Cross-offer conclusion

All 12 stages have repository-backed content, a defined two-lesson allocation
and a positive two-hour allocation. Adults and schoolchildren legitimately
share the HSK 1–2 foundations (phonetics, vocabulary, grammar and listening),
but their contexts, diagnostics and progress outputs differ. HSK preparation
uses target-level selection, exam sections, timed mocks and lost-point
analysis. No unsupported, generic, or unjustifiably duplicated stage was
found, so no curriculum, page copy, feed data, or UI was changed.
