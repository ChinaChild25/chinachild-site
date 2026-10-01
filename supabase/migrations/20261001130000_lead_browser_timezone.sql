-- Browser-reported IANA timezone used by the CRM to plan follow-up contact.
alter table public.leads
  add column if not exists timezone text;

notify pgrst, 'reload schema';
