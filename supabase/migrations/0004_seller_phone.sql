-- Sellers' phone numbers, used to deliver invite links via SMS.
-- Stored as free text but expected to be E.164 (e.g. +14155551234).
alter table public.sellers add column if not exists phone text;
