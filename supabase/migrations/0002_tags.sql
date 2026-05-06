-- Add tags to submissions. Tags are a free-form string array so research can
-- evolve the taxonomy without a schema change — the predefined chip set lives
-- in src/lib/tags.ts.

alter table public.submissions
  add column if not exists tags text[] not null default '{}'::text[];

create index if not exists submissions_tags_idx
  on public.submissions using gin (tags);
