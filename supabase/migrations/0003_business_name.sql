-- Adds a free-text business_name to sellers so admins can label invited
-- sellers with the shop / brand they represent.
alter table public.sellers add column if not exists business_name text;
