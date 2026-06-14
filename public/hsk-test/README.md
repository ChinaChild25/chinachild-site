# HSK-test illustrations

Curated assets for the test funnel (Praktikum-style). `<TestArt name="…">`
(`components/hsk-test/TestArt.tsx`) loads `/hsk-test/<name>.png`; if a file is
missing it falls back to a calligraphic-hanzi placeholder.

All files are real PNG (alpha preserved). To swap an illustration, just
overwrite the file with the same name — no code change needed.

## People photos (rounded cards) — promo hero fan
| File            | Who                          |
|-----------------|------------------------------|
| `person-1.png`  | парень в зелёной футболке    |
| `person-2.png`  | девушка (центр, крупная)     |
| `person-3.png`  | парень в синем поло          |

## 3D objects (transparent) — storytelling + steps
| File                | Object                          | Used in |
|---------------------|----------------------------------|---------|
| `shape-cap.png`     | выпускная шапочка               | quiz intro, who-1 |
| `shape-folder.png`  | папка с орбитой                 | quiz «лексика», step 3 |
| `shape-masks.png`   | хром-маски (PRO)                | quiz «грамматика», step 1 |
| `shape-spinner.png` | лоадер-кольцо + стрелка         | quiz «чтение», step 2 |
| `shape-toggle.png`  | оранжевый тумблер               | quiz «аудирование», step 4 |
| `result-shapes.png` | курсор + перо + плюс (кластер)  | quiz «финал», who-4, result hero |

## Embossed white icons (matte) — dark «who» chips
| File               | Icon            |
|--------------------|-----------------|
| `icon-globe.png`   | глобус          |
| `icon-compass.png` | компас / ромб   |

## Result page
| File                | Where                                    |
|---------------------|------------------------------------------|
| `result-photo.png`  | фото результата (парень, слоёная карточка) |
| `result-shapes.png` | 3D-шейпы поверх фото                      |

## Decorative
| File              | Where                                  |
|-------------------|----------------------------------------|
| `gradient.png`    | фон карточки «по методике HSK»         |
| `card-accent.png` | сиреневый угол-карточка (доп. акцент)  |
| `rings.svg`       | кольца (опционально, декор)            |
