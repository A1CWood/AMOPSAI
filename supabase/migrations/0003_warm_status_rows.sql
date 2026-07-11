-- Replaces the per-aircraft warm_status_entries model with a generic
-- ordered "rows" model. A day is no longer a set of per-flight cards each
-- carrying their own show/open/close - it's a single freeform ordered list
-- of typed rows (show time, airfield open, a flight, airfield close) that
-- an editor builds up in whatever order makes sense, then the UI flattens
-- into one chronological timeline for display.

drop table public.warm_status_entries cascade;

create table public.warm_status_rows (
  id uuid primary key default gen_random_uuid(),
  day_id uuid not null references public.warm_status_days (id) on delete cascade,
  position integer not null default 0,
  row_type text not null check (row_type in ('show', 'open', 'flight', 'close')),
  time text, -- used when row_type in ('show', 'open', 'close')
  callsign text, -- used when row_type = 'flight'
  eta text, -- used when row_type = 'flight'
  etd text, -- used when row_type = 'flight'
  created_at timestamptz not null default now(),
  constraint flight_requires_callsign_and_time check (
    row_type != 'flight' or (callsign is not null and (eta is not null or etd is not null))
  ),
  constraint non_flight_requires_time check (
    row_type = 'flight' or time is not null
  )
);

create index warm_status_rows_day_id_idx on public.warm_status_rows (day_id);

alter table public.warm_status_rows enable row level security;

create policy "warm_status_rows_select_public"
  on public.warm_status_rows for select
  to anon, authenticated
  using (true);

create policy "warm_status_rows_insert_authenticated"
  on public.warm_status_rows for insert
  to authenticated
  with check (true);

create policy "warm_status_rows_update_authenticated"
  on public.warm_status_rows for update
  to authenticated
  using (true)
  with check (true);

create policy "warm_status_rows_delete_authenticated"
  on public.warm_status_rows for delete
  to authenticated
  using (true);
