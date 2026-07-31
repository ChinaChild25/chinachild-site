# Offer/page consistency

| offer_id | canonical_path | price | duration | lessons | stage_hours | audience | subscription | next_module | visible_page | JSON-LD | feed |
| --- | --- | ---: | --- | --- | ---: | --- | --- | --- | --- | --- | --- |
| adult-individual-monthly-module | /courses/chinese-for-adults | 17,990 RUR | 1 month | 8 × 60 min | 8 | adults | false | separate purchase | yes | yes | yes |
| schoolchildren-12plus-individual-monthly-module | /courses/chinese-for-kids | 17,990 RUR | 1 month | 8 × 60 min | 8 | strictly 12+ | false | separate purchase | yes | yes | yes |
| hsk-individual-monthly-module | /courses/hsk-preparation | 17,990 RUR | 1 month | 8 × 60 min | 8 | adults and 12+ | false | separate purchase | yes | yes | yes |

The shared sources are `lib/course-packages.ts` for price/lesson terms and
`lib/course-modules.ts` for offer identity, audience, descriptions, and stage
plans. The YML adapter, visible module section, JSON-LD, and analytics context
derive from those sources.
