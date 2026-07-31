# Modular pricing decision

Decision date: 2026-07-30

## Approved commercial model

- Product: one individual teacher-led module.
- Price: 17,990 RUR.
- Normal duration: one month.
- Delivery: 8 lessons × 60 minutes = 8 guided hours.
- Renewal: none; the learner buys the next module separately.
- Subscription: false.
- Instalment: false.
- Discount, deadline, urgency, and mandatory multi-month total: none.

The model is active only on `/courses/chinese-for-adults`,
`/courses/chinese-for-kids` (strictly 12+), and
`/courses/hsk-preparation`. The other formats and products remain available
but are not duplicated in the Education feed.

## YML representation

The longer educational journey has no mandatory fixed total, so the feed uses:

```xml
<price>0</price>
<currencyId>RUR</currencyId>
<param name="Ежемесячная цена">17990</param>
<param name="Цена за подписку">false</param>
<param name="Продолжительность" unit="месяц">1</param>
```

This follows Yandex’s distinction between a full fixed course price, a real
monthly course payment, a subscription, and an instalment. A zero full price
is not interpreted as free because a positive monthly price is present.

## Curriculum decision

Every offer has four distinct two-hour stages, sourced from its existing
canonical page. Stage hours sum to eight and match the eight 60-minute
lessons. The module does not promise completion of HSK 1–2, HSK 4, or a
multi-month educational journey within one month.

## Market position

Point-in-time public benchmark reviewed on 2026-07-30:

| Provider | Inspected offer | Public price | Public scope |
| --- | --- | ---: | --- |
| Chinese Online | individual lessons | 16,720 RUR | 8 lessons; duration per lesson not clear in inspected pricing |
| Rocket Chinese | HSK preparation | 19,200 RUR | 8 × 50 minutes |
| BKC | individual Chinese online | 16,800 RUR | block of 8 academic hours |
| Labise | inspected individual tier | 26,990 RUR | 8 × 60 minutes |
| ChinaChild | reviewed modular offer | 17,990 RUR | 8 × 60 minutes; one month; no subscription |

Sources: [Chinese Online](https://chineseonline.ru/),
[Rocket Chinese](https://rocketchinese.ru/programs/podgotovka-k-hsk/),
[BKC](https://www.bkc.ru/languages/chinese/individual/),
[Labise](https://labise.ru/china-exam).

ChinaChild is not positioned as the cheapest offer. Its defensible distinction
is an explicit astronomical-hour scope, separate monthly purchase, canonical
curriculum, licensed school infrastructure, and page/feed consistency.
Competitor terms are volatile and must be rechecked before later claims.
