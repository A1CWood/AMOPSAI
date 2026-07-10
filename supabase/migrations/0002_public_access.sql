-- AMOPSAI phase 2: flip from "gate everything" to "public by default, gate
-- specific write actions." Contacts becomes publicly readable, the
-- append-only log_entries audit trail is dropped (Log reverted to
-- copy-paste templates, no longer needs a login or authorship tracking),
-- and two new publicly-readable/authenticated-write tables back the Warm
-- Status Schedule page.

-- ---------------------------------------------------------------------------
-- contacts: open select to everyone, not just authenticated.
-- ---------------------------------------------------------------------------
drop policy "contacts_select_authenticated" on public.contacts;

create policy "contacts_select_public"
  on public.contacts for select
  to anon, authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- log_entries: no longer used - Log is back to static copy-paste templates
-- with no login requirement, so there's nothing to attribute entries to.
-- ---------------------------------------------------------------------------
drop table public.log_entries cascade;

-- ---------------------------------------------------------------------------
-- warm_status_days / warm_status_entries: back the Warm Status Schedule
-- page. Publicly readable; writes require a signed-in editor. No author
-- tracking - these are editable public info, not an audit trail.
-- ---------------------------------------------------------------------------
create table public.warm_status_days (
  id uuid primary key default gen_random_uuid(),
  date date not null unique,
  created_at timestamptz not null default now()
);

alter table public.warm_status_days enable row level security;

create policy "warm_status_days_select_public"
  on public.warm_status_days for select
  to anon, authenticated
  using (true);

create policy "warm_status_days_insert_authenticated"
  on public.warm_status_days for insert
  to authenticated
  with check (true);

create policy "warm_status_days_delete_authenticated"
  on public.warm_status_days for delete
  to authenticated
  using (true);

create table public.warm_status_entries (
  id uuid primary key default gen_random_uuid(),
  day_id uuid not null references public.warm_status_days (id) on delete cascade,
  callsign text not null,
  eta text,
  etd text,
  show_time text,
  airfield_open text,
  airfield_close text,
  created_at timestamptz not null default now(),
  constraint eta_or_etd_required check (eta is not null or etd is not null)
);

create index warm_status_entries_day_id_idx on public.warm_status_entries (day_id);

alter table public.warm_status_entries enable row level security;

create policy "warm_status_entries_select_public"
  on public.warm_status_entries for select
  to anon, authenticated
  using (true);

create policy "warm_status_entries_insert_authenticated"
  on public.warm_status_entries for insert
  to authenticated
  with check (true);

create policy "warm_status_entries_update_authenticated"
  on public.warm_status_entries for update
  to authenticated
  using (true)
  with check (true);

create policy "warm_status_entries_delete_authenticated"
  on public.warm_status_entries for delete
  to authenticated
  using (true);
