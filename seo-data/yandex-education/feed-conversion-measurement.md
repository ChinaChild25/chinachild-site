# Yandex Education conversion measurement

## Funnel events

Only the three reviewed canonical offer pages emit the following non-PII
context:

| Step | Event | Trigger |
| --- | --- | --- |
| Offer view | `education_offer_view` | One client-side event when an eligible page mounts |
| CTA / form open | `education_offer_cta_click` | User opens a lead modal from an eligible page |
| Form start | `education_offer_form_start` | First focus inside that modal’s form |
| Persisted lead | existing `lead_submitted` / GA4 `generate_lead` | API confirms a stored lead |

Parameters: `offer_id`, `offer_path`, `offer_audience`,
`module_price_rub`, `module_lesson_count`, `module_lesson_minutes`, plus the
existing course and source. Names, phones, email addresses, free-text comments,
captcha tokens, and lead IDs are never sent as event parameters.

The existing lead conversion remains the only success goal. The new funnel
events are diagnostic events, not duplicate conversions. Persisted-lead
deduplication by lead ID remains intact.

## Attribution and reporting

The feed uses canonical URLs without invented duplicate query parameters.
Segment Education traffic by landing path plus Yandex referral/click
attributes available in Metrica and GA4. Do not infer Education traffic merely
from all Yandex organic sessions.

Record a pre-upload baseline for each offer page, then compare 14-, 30-, and
60-day post-activation windows:

1. offer views;
2. CTA/form-open rate;
3. form-start rate;
4. persisted leads;
5. persisted-lead rate per offer view;
6. qualified leads and sales from the CRM or owner review.

Annotate deployment, Webmaster upload, moderation acceptance, feed edits, and
pricing changes. Do not attribute a change solely to the feed when campaigns,
rankings, seasonality, page changes, or measurement coverage also changed.
The PASS 1 enhanced-export slice covers only 14 days and partial URLs and is
not a complete historical baseline.
