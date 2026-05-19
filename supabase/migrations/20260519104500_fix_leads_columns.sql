-- Idempotent fix-up: the initial 20260519074815 migration uses
-- "create table if not exists", which is a no-op when a prior table already
-- exists in the project. Production hit
--   "Could not find the 'consent_accepted_at' column of 'leads'"
-- because the table predated the schema in 20260519074815. Add every column
-- the API writes via ADD COLUMN IF NOT EXISTS so this migration is safe to
-- run whether the table is fresh, partial, or already complete.

create table if not exists public.leads (
  id uuid primary key default gen_random_uuid()
);

alter table public.leads
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists name text,
  add column if not exists phone text,
  add column if not exists email text,
  add column if not exists course text,
  add column if not exists call_time text,
  add column if not exists message text,
  add column if not exists consent_pd boolean not null default false,
  add column if not exists consent_marketing boolean not null default false,
  add column if not exists consent_text_version text,
  add column if not exists consent_accepted_at timestamptz,
  add column if not exists source_page text,
  add column if not exists utm_source text,
  add column if not exists utm_medium text,
  add column if not exists utm_campaign text,
  add column if not exists utm_content text,
  add column if not exists utm_term text,
  add column if not exists yclid text,
  add column if not exists gclid text,
  add column if not exists referrer text,
  add column if not exists ip_hash text,
  add column if not exists user_agent text,
  add column if not exists delivered_email boolean not null default false,
  add column if not exists delivered_email_error text,
  add column if not exists delivered_at timestamptz;

alter table public.leads enable row level security;

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_phone_idx on public.leads (phone);
create index if not exists leads_ip_hash_created_at_idx on public.leads (ip_hash, created_at desc);

create table if not exists public.lead_rate_limit (
  ip_hash text primary key
);

alter table public.lead_rate_limit
  add column if not exists attempts integer not null default 0,
  add column if not exists first_attempt_at timestamptz not null default now(),
  add column if not exists last_attempt_at timestamptz not null default now();

alter table public.lead_rate_limit enable row level security;

create index if not exists lead_rate_limit_last_attempt_at_idx
  on public.lead_rate_limit (last_attempt_at desc);
