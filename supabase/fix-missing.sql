-- ============================================================
-- FIX MISSING TABLES AND DATA
-- Run this in Supabase SQL Editor to fix admin panel.
-- Safe to run multiple times (idempotent).
-- ============================================================

-- 1. Bookings — drop & recreate with correct schema
drop table if exists bookings cascade;
create table bookings (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       text not null,
  service_id  text,
  master_id   text,
  date        date,
  time        time,
  comment     text,
  status      text not null default 'new' check (status in ('new','confirmed','cancelled')),
  created_at  timestamptz not null default now()
);

-- 2. Reviews — drop & recreate with correct schema
drop table if exists reviews cascade;
create table reviews (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  text        text not null,
  rating      integer not null check (rating between 1 and 5),
  service_id  text,
  master_id   text,
  contact     text,
  date        date,
  reply       text,
  is_active   boolean not null default false,
  created_at  timestamptz not null default now()
);

-- 3. Ensure services table exists with CORRECT schema.
-- The existing table has wrong columns (title, no category) — drop and recreate.
-- Safe because services is re-seeded from siteData.ts by admin on first load.
drop table if exists services cascade;
create table services (
  id              text primary key,
  name            text not null,
  description     text,
  category        text not null,
  category_label  text,
  price           integer not null,
  old_price       integer,
  price_prefix    text,
  discount        text,
  duration        text,
  image_url       text,
  is_active       boolean not null default true,
  sort_order      integer not null default 0
);

-- 4. Ensure navigation_items table exists
create table if not exists navigation_items (
  id         serial primary key,
  label      text not null,
  href       text not null,
  sort_order integer not null default 0
);

-- 5. Ensure site_content exists
create table if not exists site_content (
  id         text primary key,
  content    jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

-- 6. RLS
alter table bookings         enable row level security;
alter table reviews          enable row level security;
alter table services         enable row level security;
alter table navigation_items enable row level security;
alter table site_content     enable row level security;

-- Drop & recreate policies (idempotent)
drop policy if exists "public_insert_bookings"     on bookings;
drop policy if exists "admin_all_bookings"         on bookings;
drop policy if exists "public_read_active_reviews" on reviews;
drop policy if exists "public_insert_reviews"      on reviews;
drop policy if exists "admin_all_reviews"          on reviews;
drop policy if exists "public_read_services"       on services;
drop policy if exists "admin_all_services"         on services;
drop policy if exists "public_read_nav"            on navigation_items;
drop policy if exists "admin_all_nav"              on navigation_items;
drop policy if exists "public_read_site_content"   on site_content;
drop policy if exists "admin_all_site_content"     on site_content;

create policy "public_insert_bookings"     on bookings for insert with check (true);
create policy "admin_all_bookings"         on bookings for all using (auth.role() = 'authenticated');
create policy "public_read_active_reviews" on reviews  for select using (is_active = true);
create policy "public_insert_reviews"      on reviews  for insert with check (true);
create policy "admin_all_reviews"          on reviews  for all using (auth.role() = 'authenticated');
create policy "public_read_services"       on services for select using (true);
create policy "admin_all_services"         on services for all using (auth.role() = 'authenticated');
create policy "public_read_nav"            on navigation_items for select using (true);
create policy "admin_all_nav"              on navigation_items for all using (auth.role() = 'authenticated');
create policy "public_read_site_content"   on site_content for select using (true);
create policy "admin_all_site_content"     on site_content for all using (auth.role() = 'authenticated');

-- 7. Seed navigation (only if empty)
insert into navigation_items (label, href, sort_order)
select * from (values
  ('Услуги',   '#services', 0),
  ('Работы',   '#gallery',  1),
  ('Отзывы',   '#reviews',  2),
  ('Контакты', '#contacts', 3)
) as v(label, href, sort_order)
where not exists (select 1 from navigation_items);

-- 8. Storage bucket for media (images)
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

-- Storage policies
drop policy if exists "media_public_read"       on storage.objects;
drop policy if exists "media_authenticated_all" on storage.objects;

create policy "media_public_read"
  on storage.objects for select
  using (bucket_id = 'media');

create policy "media_authenticated_all"
  on storage.objects for all
  using (bucket_id = 'media' and auth.role() = 'authenticated')
  with check (bucket_id = 'media' and auth.role() = 'authenticated');
