-- Field Notes initial schema
-- Run this in the Supabase SQL editor (or via `supabase db push` if using the CLI).

create extension if not exists "pgcrypto";

-- Per-seller profile data, keyed to auth.users.
-- A row is created the first time a seller signs in (see handle_new_user trigger).
create table public.sellers (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  display_name text,
  -- 0 = Sunday, 1 = Monday, ..., 6 = Saturday. Used for the weekly check-in nudge.
  weekly_day_pref smallint check (weekly_day_pref between 0 and 6),
  timezone text default 'America/Los_Angeles',
  created_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.sellers (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- A submission is one filled-out check-in (or one freeform spontaneous note).
-- Answers are stored as JSON to keep the schema flexible while questions are
-- still in flux during the alpha. We can split into a normalized answers table
-- later if the dashboard needs more powerful aggregation.
create type public.feedback_kind as enum ('daily', 'weekly', 'spontaneous');

create table public.submissions (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.sellers(id) on delete cascade,
  kind public.feedback_kind not null,
  -- For daily/weekly: which question set was answered (e.g. "weekly-2026-w22").
  -- Null for spontaneous.
  question_set_id text,
  -- Array of { question_id, prompt, type, answer, input_method }
  answers jsonb not null default '[]'::jsonb,
  -- Spontaneous notes have no question, so the freeform text lives here.
  note text,
  submitted_at timestamptz not null default now()
);

create index submissions_seller_idx on public.submissions (seller_id, submitted_at desc);
create index submissions_kind_idx on public.submissions (kind, submitted_at desc);

-- Row-level security: sellers can read/write only their own rows.
alter table public.sellers enable row level security;
alter table public.submissions enable row level security;

create policy "sellers read own"   on public.sellers   for select using (auth.uid() = id);
create policy "sellers update own" on public.sellers   for update using (auth.uid() = id);

create policy "submissions read own"   on public.submissions for select using (auth.uid() = seller_id);
create policy "submissions insert own" on public.submissions for insert with check (auth.uid() = seller_id);
