-- Split the single, ambiguous consent_text_version into per-consent-type version +
-- content-hash pairs. Mirrors the versioned/hashed evidence pattern already used by
-- chinachild-my's offer_acceptances / lesson_rules_acknowledgements tables (see that
-- repo's 20260828150000_offer_acceptances_and_payment_gate.sql): a version string
-- plus a SHA-256 hex hash of the exact document text, both always computed
-- server-side in app/api/contact/route.ts from lib/legal/consent-pd.ts and
-- lib/legal/consent-marketing.ts — a client can never supply or override either.
--
-- consent_text_version predates this split (it mixed PD and marketing consent into
-- one version string with no content hash at all). It is left in place, made
-- nullable, and kept purely as historical record for leads inserted before this
-- migration — new rows stop populating it.
--
-- consent_page_path records the literal page the lead was submitted from.
-- source_page already exists but doubles as a form/CTA identifier for
-- modal-triggered submissions (e.g. "header"), which loses the actual URL when the
-- same modal is reused across dozens of landing pages; this column preserves that
-- URL alongside it.

alter table public.leads
  alter column consent_text_version drop not null;

alter table public.leads
  add column if not exists consent_pd_version text,
  add column if not exists consent_pd_content_hash text,
  add column if not exists consent_marketing_version text,
  add column if not exists consent_marketing_content_hash text,
  add column if not exists consent_page_path text;

alter table public.leads
  drop constraint if exists leads_consent_pd_content_hash_check;
alter table public.leads
  add constraint leads_consent_pd_content_hash_check
    check (consent_pd_content_hash is null or consent_pd_content_hash ~ '^[0-9a-f]{64}$');

alter table public.leads
  drop constraint if exists leads_consent_marketing_content_hash_check;
alter table public.leads
  add constraint leads_consent_marketing_content_hash_check
    check (consent_marketing_content_hash is null or consent_marketing_content_hash ~ '^[0-9a-f]{64}$');

-- Append-only evidence: once a lead row records consent, nothing can rewrite what
-- was consented to, when, from which page, or under which document version/hash —
-- not even a service-role UPDATE. Every other CRM column on this table (crm_stage,
-- notes, delivered_*, metadata, lost_reason_*, ...) keeps updating freely; only the
-- columns listed below are frozen the instant the row is inserted.
create or replace function public.reject_leads_consent_evidence_mutation()
returns trigger
language plpgsql
as $$
begin
  if (new.consent_pd is distinct from old.consent_pd)
    or (new.consent_marketing is distinct from old.consent_marketing)
    or (new.consent_pd_version is distinct from old.consent_pd_version)
    or (new.consent_pd_content_hash is distinct from old.consent_pd_content_hash)
    or (new.consent_marketing_version is distinct from old.consent_marketing_version)
    or (new.consent_marketing_content_hash is distinct from old.consent_marketing_content_hash)
    or (new.consent_accepted_at is distinct from old.consent_accepted_at)
    or (new.consent_page_path is distinct from old.consent_page_path)
    or (new.source_page is distinct from old.source_page)
    or (new.ip_hash is distinct from old.ip_hash)
    or (new.user_agent is distinct from old.user_agent)
  then
    raise exception 'LEAD_CONSENT_EVIDENCE_IMMUTABLE' using errcode = '23514';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_leads_consent_evidence_no_update on public.leads;
create trigger trg_leads_consent_evidence_no_update
  before update on public.leads
  for each row execute function public.reject_leads_consent_evidence_mutation();

notify pgrst, 'reload schema';
