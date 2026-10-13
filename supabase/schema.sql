-- Run once in the Supabase SQL Editor.
create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references auth.users(id) on delete cascade,
  serial_number text not null unique check (serial_number ~ '^[A-Z0-9_-]{1,80}$'),
  holder_name text not null check (char_length(trim(holder_name)) between 1 and 200),
  course_name text not null check (char_length(trim(course_name)) between 1 and 200),
  valid_from date not null,
  expiry_date date not null check (expiry_date >= valid_from),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);
create index certificates_owner_idx on public.certificates(owner_id);
alter table public.certificates enable row level security;
revoke all on public.certificates from anon, authenticated;
grant select, insert, update, delete on public.certificates to anon, authenticated;
-- All visitors can manage every entry, including OFF entries.
create policy "Visitors manage entries" on public.certificates for all to anon, authenticated using (true) with check (true);
-- Only exact serial lookups are exposed publicly. OFF entries and owner IDs are never returned.
create function public.verify_certificate(p_serial text)
returns table (serial_number text, holder_name text, course_name text, valid_from date, expiry_date date)
language sql stable security definer set search_path = ''
as $$
  select c.serial_number, c.holder_name, c.course_name, c.valid_from, c.expiry_date
  from public.certificates c
  where c.serial_number = upper(trim(p_serial)) and c.is_active = true
  limit 1;
$$;
revoke all on function public.verify_certificate(text) from public;
grant execute on function public.verify_certificate(text) to anon, authenticated;
