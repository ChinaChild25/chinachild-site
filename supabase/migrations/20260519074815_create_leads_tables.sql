create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  phone text not null,
  email text,
  course text,
  call_time text,
  message text,
  consent_pd boolean not null default false,
  consent_marketing boolean not null default false,
  consent_text_version text not null,
  consent_accepted_at timestamptz not null,
  source_page text,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_content text,
  utm_term text,
  yclid text,
  gclid text,
  referrer text,
  ip_hash text,
  user_agent text,
  delivered_email boolean not null default false,
  delivered_email_error text,
  delivered_at timestamptz
);

alter table public.leads enable row level security;

create index if not exists leads_created_at_idx on public.leads (created_at desc);
create index if not exists leads_phone_idx on public.leads (phone);
create index if not exists leads_ip_hash_created_at_idx on public.leads (ip_hash, created_at desc);

create table if not exists public.lead_rate_limit (
  ip_hash text primary key,
  attempts integer not null default 0,
  first_attempt_at timestamptz not null default now(),
  last_attempt_at timestamptz not null default now()
);

alter table public.lead_rate_limit enable row level security;

create index if not exists lead_rate_limit_last_attempt_at_idx
  on public.lead_rate_limit (last_attempt_at desc);
