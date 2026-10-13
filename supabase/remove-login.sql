-- Apply to the existing project. Existing entries are preserved.
begin;
alter table public.certificates alter column owner_id drop not null;
drop policy if exists "Owners read their entries" on public.certificates;
drop policy if exists "Owners create entries" on public.certificates;
drop policy if exists "Owners update entries" on public.certificates;
drop policy if exists "Owners delete entries" on public.certificates;
drop policy if exists "Visitors manage entries" on public.certificates;
grant select, insert, update, delete on public.certificates to anon, authenticated;
create policy "Visitors manage entries" on public.certificates
  for all to anon, authenticated using (true) with check (true);
commit;
