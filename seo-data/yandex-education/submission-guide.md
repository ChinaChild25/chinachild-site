# Yandex Education submission guide

## Current state

The production feed contains three reviewed modular offers and passes strict
structural, local, and production validation. The repository artifacts and
eligibility checklist are current. The feed is deployed but has not been
uploaded to Yandex Webmaster. Its production URL is:

`https://chinachild.ru/yandex-education.yml`

Technical status:
`deployed and production-validated — ready for owner upload to Yandex`.

## Current review artifacts

- `competitor-offer-benchmark.csv` is deterministically generated from
  `competitor-offer-benchmark.md`.
- `offer-page-consistency.csv` is deterministically generated from
  `offer-page-consistency.md` and checked against the typed module terms.
- `eligibility-checklist.csv` records 3 enabled offers, positive monthly
  price, one-month duration, 4 stages, 8 guided hours, and direct canonical
  URLs.
- `curriculum-stage-evidence.md` maps all 12 stages to repository sources,
  lesson pairs, hours, and offer-specific evidence.

Regenerate and check them with:

```bash
npm run seo:yandex-education:artifacts
npm run seo:yandex-education:artifacts -- --check
```

## Required pre-upload checks

1. Review `modular-pricing-decision.md`, `curriculum-stage-evidence.md`, the
   current checklist, and the three canonical offer pages.
2. Confirm each module is currently orderable for 17,990 RUR, lasts one month,
   contains 8 individual 60-minute lessons, does not auto-renew, and allows the
   learner to buy the next module separately.
3. Confirm operational staffing and availability for all three offers.
4. Call the published phone and verify the monitored email. Confirm staffing
   daily from 09:00 to 21:00 Moscow time, the normal 1–2 hour response in that
   period, and that a moderation application received in that period can be
   handled within three working hours. Night applications start from the next
   response period.
5. Confirm IP and licence status and reconcile visible terms with actual
   invoices, payment links, and contracts.
6. Check Yandex Webmaster for malware/security issues and for an existing
   duplicate Education feed.
7. Submit an internal test lead only if a safe test-identification workflow is
   configured and the lead cannot be mistaken for a real customer. Otherwise,
   rely on the automated lead suite and verify the production form opens,
   loads SmartCaptcha, and enforces validation without persisting a lead.
8. Run a local production build, start it, and execute:

   ```bash
   npm run seo:yandex-education -- --base-url=http://127.0.0.1:42107
   ```

9. Immediately before upload, execute:

   ```bash
   npm run seo:yandex-education -- --base-url=https://chinachild.ru
   ```

10. Inspect the XML directly and compare price, audience, duration, stages,
   canonical URL, and visible page text for all three offers.

## Manual upload

In Yandex Webmaster open **Услуги и предложения в поиске → Фиды и ошибки**,
choose **Загрузить фид**, select **Образование**, and enter the production feed
URL. Select Russia only after confirming identical availability and published
terms throughout the region.

Yandex first checks feed errors and then performs provider-side moderation.
A valid feed does not guarantee acceptance, enhanced display, traffic, rank,
or leads. Correct mismatches at the shared source rather than patching the XML.

## Monitoring and rollback

Use `feed-conversion-measurement.md` for the activation baseline and funnel.
Keep offer IDs stable. Revalidate after any price, URL, category, duration,
format, stage, availability, legal, logo, or contact change.

For rollback, remove the feed in Webmaster first. Publishing an empty
`<offers>` element is Yandex’s documented removal mechanism; use it only as a
deliberate fallback. Do not remove the public endpoint while Webmaster still
references it.
