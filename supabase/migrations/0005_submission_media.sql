-- Photo attachments on submissions.
--
-- Each submission may have 0-5 photo URLs pointing into the `submission-media`
-- Supabase Storage bucket. URLs are stored as public CDN URLs so admins can
-- render them without signed-URL juggling. The bucket itself is public-read,
-- but object paths embed a random UUID per file so they're not enumerable.

alter table public.submissions
  add column if not exists media_urls text[] not null default '{}';

-- Storage bucket. Public-read keeps the admin dashboard simple; uploads are
-- still gated by RLS policies below so only the owning seller can write.
insert into storage.buckets (id, name, public)
values ('submission-media', 'submission-media', true)
on conflict (id) do nothing;

-- RLS on storage.objects: a seller can upload (and read/update/delete) only
-- objects under their own auth.uid() folder, e.g. `<uid>/<file>.jpg`.
drop policy if exists "submission-media: seller can upload own"
  on storage.objects;
create policy "submission-media: seller can upload own"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'submission-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "submission-media: seller can read own"
  on storage.objects;
create policy "submission-media: seller can read own"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'submission-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Public read for everyone (anon role) — needed because the admin dashboard
-- uses anon key + the bucket is configured public. Paths embed a UUID so
-- they're hard to guess.
drop policy if exists "submission-media: public read"
  on storage.objects;
create policy "submission-media: public read"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'submission-media');

drop policy if exists "submission-media: seller can delete own"
  on storage.objects;
create policy "submission-media: seller can delete own"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'submission-media'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
