# AMOPS

Eielson AFB Airfield Management Operations web app: Next.js (App Router) + Supabase, deployed on Vercel.

Ported from a static HTML/CSS/JS site (see git history on `main`). Parking, Snow Priorities, and AISR tools were dropped in this rewrite - full replacements are planned separately.

## Local setup

```bash
npm install
cp .env.local.example .env.local   # fill in from your Supabase project settings
npm run dev
```

## Database

Schema lives in `supabase/migrations/0001_init.sql` (profiles, contacts, log_entries + RLS policies). Apply it via `supabase db push` or paste it into the Supabase SQL Editor.

Seed the contacts directory once from `scripts/seed-data/amops-contacts.csv`:

```bash
npm run migrate:contacts
```

Requires `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` (service role key is local-only, never deployed to Vercel).

## Auth

Accounts are invite-only - no public signup route. Create users via the Supabase Dashboard (Authentication → Invite User) or CLI; they land on `/update-password` to set a password on first login.

## Log templates

`src/data/log-templates.ts` holds the ~26 shift-log templates (ported from the old "3616 Template" page) as structured fields instead of raw copy/paste text. This is a first-pass draft based on reading the original text - it needs review by someone with AMOPS reporting domain knowledge before relying on it for real shift logs (see the comment at the top of that file for specific ambiguities).
