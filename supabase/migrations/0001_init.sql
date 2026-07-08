-- AMOPSAI initial schema: profiles, contacts, log_entries.
-- Applied via `supabase db push` or pasted into the Supabase SQL Editor.

-- ---------------------------------------------------------------------------
-- profiles
-- Mirrors auth.users so client code can display/join on a user's identity
-- without needing access to the protected auth schema directly.
-- ---------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  display_name text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_authenticated"
  on public.profiles for select
  to authenticated
  using (true);

create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- contacts
-- Read-only in the app; seeded once via scripts/migrate-contacts.ts using the
-- service-role key. No insert/update/delete policy is defined on purpose, so
-- authenticated/anon roles cannot write to this table at all.
-- ---------------------------------------------------------------------------
create table public.contacts (
  id uuid primary key default gen_random_uuid(),
  company text,
  name text not null,
  phone text,
  alt_phone text,
  email text,
  address text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.contacts enable row level security;

create policy "contacts_select_authenticated"
  on public.contacts for select
  to authenticated
  using (true);

-- ---------------------------------------------------------------------------
-- log_entries
-- Append-only shift-log audit trail. Templates live in code
-- (src/data/log-templates.ts); this table stores the filled-in result.
-- template_title/body are denormalized so history stays stable even if a
-- template's wording changes later. No update/delete policy: entries cannot
-- be edited or removed once submitted, by design.
-- ---------------------------------------------------------------------------
create table public.log_entries (
  id uuid primary key default gen_random_uuid(),
  template_code text not null,
  template_title text not null,
  body text not null,
  fields jsonb not null default '{}'::jsonb,
  author_id uuid not null references public.profiles (id),
  shift_date date not null default current_date,
  created_at timestamptz not null default now(),
  search_vector tsvector generated always as (
    to_tsvector(
      'simple',
      coalesce(template_code, '') || ' ' || coalesce(template_title, '') || ' ' || coalesce(body, '')
    )
  ) stored
);

create index log_entries_created_at_idx on public.log_entries (created_at desc);
create index log_entries_search_idx on public.log_entries using gin (search_vector);

alter table public.log_entries enable row level security;

create policy "log_entries_select_authenticated"
  on public.log_entries for select
  to authenticated
  using (true);

create policy "log_entries_insert_own"
  on public.log_entries for insert
  to authenticated
  with check (author_id = auth.uid());
