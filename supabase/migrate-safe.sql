-- SAFE MIGRATION -- adds missing columns/tables WITHOUT dropping
-- existing data. Run in Supabase SQL Editor (Dashboard -> SQL).
-- Idempotent: safe to run multiple times.

-- 1. BOOKINGS -- create if missing
CREATE TABLE IF NOT EXISTS bookings (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text        NOT NULL,
  phone      text        NOT NULL,
  service_id text,
  master_id  text,
  date       date,
  time       time,
  comment    text,
  status     text        NOT NULL DEFAULT 'new' CHECK (status IN ('new','confirmed','cancelled','blocked')),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE bookings ADD COLUMN IF NOT EXISTS service_id text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS master_id text;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS date date;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS time time;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS comment text;

-- Update status CHECK constraint to include 'blocked' (for existing tables)
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS bookings_status_check;
ALTER TABLE bookings ADD CONSTRAINT bookings_status_check
  CHECK (status IN ('new','confirmed','cancelled','blocked'));


-- 2. REVIEWS -- add missing columns to existing table
CREATE TABLE IF NOT EXISTS reviews (
  id         uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  name       text    NOT NULL,
  text       text    NOT NULL,
  rating     integer NOT NULL CHECK (rating BETWEEN 1 AND 5),
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE reviews ADD COLUMN IF NOT EXISTS service_id text;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS master_id text;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS contact text;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS date date;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS reply text;
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT false;


-- 3. SERVICES -- ensure all required columns exist
CREATE TABLE IF NOT EXISTS services (
  id         text    PRIMARY KEY,
  name       text    NOT NULL,
  price      integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Fix: if id column is uuid type, convert to text (services use string IDs like "s1", "s2")
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'services'
      AND column_name = 'id' AND data_type = 'uuid'
  ) THEN
    ALTER TABLE services ALTER COLUMN id TYPE text;
  END IF;
END $$;

-- Rename 'title' -> 'name' if old column exists and 'name' doesn't
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'services' AND column_name = 'title'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'services' AND column_name = 'name'
  ) THEN
    ALTER TABLE services RENAME COLUMN title TO name;
  END IF;
END $$;

ALTER TABLE services ADD COLUMN IF NOT EXISTS description text;
ALTER TABLE services ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'lashes';
ALTER TABLE services ADD COLUMN IF NOT EXISTS category_label text;
ALTER TABLE services ADD COLUMN IF NOT EXISTS old_price integer;
ALTER TABLE services ADD COLUMN IF NOT EXISTS price_prefix text;
ALTER TABLE services ADD COLUMN IF NOT EXISTS discount text;
ALTER TABLE services ADD COLUMN IF NOT EXISTS duration text;
ALTER TABLE services ADD COLUMN IF NOT EXISTS image_url text;
ALTER TABLE services ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true;
ALTER TABLE services ADD COLUMN IF NOT EXISTS sort_order integer NOT NULL DEFAULT 0;


-- 4. NAVIGATION ITEMS
CREATE TABLE IF NOT EXISTS navigation_items (
  id         serial  PRIMARY KEY,
  label      text    NOT NULL,
  href       text    NOT NULL,
  sort_order integer NOT NULL DEFAULT 0
);

INSERT INTO navigation_items (label, href, sort_order)
SELECT * FROM (VALUES
  ('Услуги',   '#services', 0),
  ('Работы',   '#gallery',  1),
  ('Отзывы',   '#reviews',  2),
  ('Контакты', '#contacts', 3)
) AS v(label, href, sort_order)
WHERE NOT EXISTS (SELECT 1 FROM navigation_items);


-- 5. SITE CONTENT
CREATE TABLE IF NOT EXISTS site_content (
  id         text        PRIMARY KEY,
  content    jsonb       NOT NULL DEFAULT '{}',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE site_content ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT now();


-- 6. RLS -- enable on all tables
ALTER TABLE bookings         ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews          ENABLE ROW LEVEL SECURITY;
ALTER TABLE services         ENABLE ROW LEVEL SECURITY;
ALTER TABLE navigation_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_content     ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_insert_bookings" ON bookings;
DROP POLICY IF EXISTS "admin_all_bookings" ON bookings;
DROP POLICY IF EXISTS "public_read_active_reviews" ON reviews;
DROP POLICY IF EXISTS "public_insert_reviews" ON reviews;
DROP POLICY IF EXISTS "admin_all_reviews" ON reviews;
DROP POLICY IF EXISTS "public_read_services" ON services;
DROP POLICY IF EXISTS "admin_all_services" ON services;
DROP POLICY IF EXISTS "admin_insert_services" ON services;
DROP POLICY IF EXISTS "admin_update_services" ON services;
DROP POLICY IF EXISTS "admin_delete_services" ON services;
DROP POLICY IF EXISTS "public_read_nav" ON navigation_items;
DROP POLICY IF EXISTS "admin_all_nav" ON navigation_items;
DROP POLICY IF EXISTS "public_read_site_content" ON site_content;
DROP POLICY IF EXISTS "admin_all_site_content" ON site_content;

CREATE POLICY "public_insert_bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_all_bookings" ON bookings FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "public_read_active_reviews" ON reviews FOR SELECT USING (is_active = true);
CREATE POLICY "public_insert_reviews" ON reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_all_reviews" ON reviews FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "public_read_services" ON services FOR SELECT USING (true);
CREATE POLICY "admin_insert_services" ON services FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "admin_update_services" ON services FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "admin_delete_services" ON services FOR DELETE USING (auth.role() = 'authenticated');
CREATE POLICY "admin_all_services" ON services FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "public_read_nav" ON navigation_items FOR SELECT USING (true);
CREATE POLICY "admin_all_nav" ON navigation_items FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "public_read_site_content" ON site_content FOR SELECT USING (true);
CREATE POLICY "admin_all_site_content" ON site_content FOR ALL USING (auth.role() = 'authenticated');


-- 7. STORAGE bucket "media"
INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "media_public_read" ON storage.objects;
DROP POLICY IF EXISTS "media_authenticated_all" ON storage.objects;

CREATE POLICY "media_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'media');

CREATE POLICY "media_authenticated_all"
  ON storage.objects FOR ALL
  USING (bucket_id = 'media' AND auth.role() = 'authenticated')
  WITH CHECK (bucket_id = 'media' AND auth.role() = 'authenticated');


-- 8. MULTIPLE SERVICE IMAGES
ALTER TABLE services ADD COLUMN IF NOT EXISTS images text[] DEFAULT '{}';


-- 9. MASTER SCHEDULES
CREATE TABLE IF NOT EXISTS master_schedules (
  master_id    text        PRIMARY KEY,
  working_days integer[]   NOT NULL DEFAULT '{1,2,3,4,5,6}',
  slots        text[]      NOT NULL DEFAULT '{"10:00","10:30","11:00","11:30","12:00","12:30","13:00","13:30","14:00","14:30","15:00","15:30","16:00","16:30","17:00","17:30","18:00","18:30","19:00","19:30","20:00"}',
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE master_schedules ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_schedules" ON master_schedules;
DROP POLICY IF EXISTS "admin_all_schedules" ON master_schedules;

CREATE POLICY "public_read_schedules" ON master_schedules FOR SELECT USING (true);
CREATE POLICY "admin_all_schedules" ON master_schedules FOR ALL USING (auth.role() = 'authenticated');

-- Seed default schedules for existing masters
INSERT INTO master_schedules (master_id, working_days, slots)
VALUES
  ('m1', '{1,2,3,4,5,6}', '{"10:00","11:00","12:00","13:00","14:00","15:00","16:00","17:00","18:00","19:00","20:00"}'),
  ('m2', '{1,2,3,4,5,6}', '{"10:00","11:30","13:00","14:30","16:00","17:30"}')
ON CONFLICT (master_id) DO NOTHING;
