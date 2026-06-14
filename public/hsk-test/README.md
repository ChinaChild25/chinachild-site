# HSK-test illustrations

Curated assets for the test funnel (Praktikum-style). `<TestArt name="…">`
(`components/hsk-test/TestArt.tsx`) loads `/hsk-test/<name>.png` by default;
names listed in its `WEBP_ASSETS` set are served as `.webp` instead. If a file
is missing it falls back to a calligraphic-hanzi placeholder.

To swap an illustration, keep the same name; only touch the component when the
extension changes (add/remove the name in `WEBP_ASSETS`).

All heavy raster art is WebP (high quality, q86–90) for fast loads. The three
small flat badges stay PNG — they encode smaller than WebP at that size.

## 3D objects (transparent) — storytelling + steps
| File                 | Object                          | Used in |
|----------------------|---------------------------------|---------|
| `shape-folder.webp`  | папка с орбитой                 | step 3 «Покажем уровень» |
| `shape-masks.webp`   | хром-маски                      | step 1 «Зададим вопросы» |
| `shape-spinner.webp` | лоадер-кольцо + стрелка         | step 2 «Посчитаем ответы» |
| `shape-toggle.webp`  | оранжевый тумблер               | step 4 «Подберём курс» |
| `result-shapes.webp` | курсор + перо + плюс (кластер)  | result hero, result preview |
| `center.webp`        | глянцевый тёмный «девайс»       | «Типичная ошибка» collage |
| `rings.webp`         | кольца                          | «Вопросы по структуре HSK» |

## Per-level hero / grid art (transparent 3D)
| File              | Where |
|-------------------|-------|
| `hsk-1.webp`      | HSK 1 hero + grid card |
| `hsk-2.webp`      | HSK 2 hero + grid card |
| `hsk-3.webp`      | HSK 3 hero + grid card |
| `hsk-4.webp` / `hsk-4-dark.webp` | HSK 4 hero + grid (theme variants) |
| `hsk-ladder-1…4.webp` | «Что дальше» ladder/dial, one per level |

## Backgrounds / photos
| File                | Where |
|---------------------|-------|
| `sky.webp`          | панель неба за mock-ом в «Как устроен тест» |
| `gradient.webp`     | фон карточки «Вопросы по структуре HSK» |
| `hero-people.webp`  | promo-hero фан из трёх фото (landing) |
| `result-photo.webp` | фото результата (слоёная карточка) |
| `card1…4.jpg`       | текстуры пастельных карточек в «Типичная ошибка» |

## Badges / vector
| File             | Where |
|------------------|-------|
| `icon1…3.png`    | бейджи карточек «Как устроен тест» (PNG: меньше WebP) |
| `hero-badge.svg` | значок ChinaChild на promo-hero |
| `blue-arrow.svg` | стрелка |
