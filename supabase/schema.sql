-- ============================================================
-- Beautyline Studio — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → Run
-- ============================================================

-- Заявки на запись
create table if not exists bookings (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  phone       text not null,
  service_id  text,
  master_id   text,
  date        date,
  time        time,
  comment     text,
  status      text not null default 'new'
                check (status in ('new', 'confirmed', 'cancelled')),
  created_at  timestamptz not null default now()
);

-- Отзывы (из формы + ручное добавление)
create table if not exists reviews (
  id          text primary key default gen_random_uuid()::text,
  name        text not null,
  text        text not null,
  rating      integer not null check (rating between 1 and 5),
  service_id  text,
  master_id   text,
  contact     text,
  date        text,
  reply       text,
  is_active   boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Услуги (зеркало siteData.ts, управляется из админки)
create table if not exists services (
  id             text primary key,
  name           text not null,
  description    text,
  category       text not null,
  category_label text,
  price          integer not null,
  old_price      integer,
  price_prefix   text,
  discount       text,
  duration       text,
  image_url      text,
  is_active      boolean not null default true,
  sort_order     integer not null default 0
);

-- Настройки сайта (ключ-значение)
create table if not exists site_settings (
  key   text primary key,
  value text not null default ''
);

-- ============================================================
-- Row Level Security
-- ============================================================

alter table bookings     enable row level security;
alter table reviews      enable row level security;
alter table services     enable row level security;
alter table site_settings enable row level security;

-- Публичный сайт: только чтение активных услуг и отзывов
create policy "public_read_services"
  on services for select using (true);

create policy "public_read_active_reviews"
  on reviews for select using (is_active = true);

create policy "public_read_settings"
  on site_settings for select using (true);

-- Анонимная вставка заявок и отзывов (с сайта)
create policy "public_insert_bookings"
  on bookings for insert with check (true);

create policy "public_insert_reviews"
  on reviews for insert with check (true);

-- Только авторизованный пользователь может всё остальное
create policy "admin_all_bookings"
  on bookings for all using (auth.role() = 'authenticated');

create policy "admin_all_reviews"
  on reviews for all using (auth.role() = 'authenticated');

create policy "admin_all_services"
  on services for all using (auth.role() = 'authenticated');

create policy "admin_all_settings"
  on site_settings for all using (auth.role() = 'authenticated');

-- ============================================================
-- Начальные данные настроек
-- ============================================================

insert into site_settings (key, value) values
  ('studio_name',    'Beautyline Studio'),
  ('phone',          '+7 (925) 963-52-27'),
  ('phone_raw',      '79259635227'),
  ('address',        'г. Бронницы, Гаражный проезд, 1, Кабинет 2'),
  ('working_hours',  'Ежедневно 10:00 — 21:00'),
  ('email',          'beautyline.studio@mail.ru'),
  ('whatsapp',       'https://wa.me/79259635227'),
  ('telegram',       'https://t.me/beautylinestudio')
on conflict (key) do nothing;

-- ============================================================
-- CMS: контент секций и навигация
-- ============================================================

create table if not exists site_content (
  id         text primary key,
  content    jsonb not null default '{}',
  updated_at timestamptz not null default now()
);

create table if not exists navigation_items (
  id         serial primary key,
  label      text not null,
  href       text not null,
  sort_order integer not null default 0
);

alter table site_content     enable row level security;
alter table navigation_items enable row level security;

create policy "public_read_site_content"
  on site_content for select using (true);

create policy "public_read_nav"
  on navigation_items for select using (true);

create policy "admin_all_site_content"
  on site_content for all using (auth.role() = 'authenticated');

create policy "admin_all_nav"
  on navigation_items for all using (auth.role() = 'authenticated');

-- ============================================================
-- Начальные данные контента
-- ============================================================

insert into site_content (id, content) values

('settings', '{
  "studioName": "Beautyline Studio",
  "tagline": "Студия мастера маникюра, педикюра и наращивания ресниц",
  "phone": "+7 (925) 963-52-27",
  "phoneRaw": "79259635227",
  "whatsapp": "https://wa.me/79259635227",
  "telegram": "https://t.me/beautylinestudio",
  "email": "beautyline.studio@mail.ru",
  "address": "г. Бронницы, Гаражный проезд, 1, Кабинет 2",
  "workingHours": "Ежедневно 10:00 — 21:00",
  "rating": 5.0,
  "reviewsCount": 34
}'::jsonb),

('seo', '{
  "title": "Beautyline Studio — Маникюр, Педикюр, Наращивание ресниц | Бронницы",
  "description": "Студия красоты Beautyline Studio в Бронницах. Профессиональный маникюр, педикюр, наращивание ресниц. Рейтинг 5.0 ★ Запись онлайн.",
  "keywords": "маникюр бронницы, педикюр бронницы, наращивание ресниц бронницы, студия красоты, beautyline studio",
  "ogImage": ""
}'::jsonb),

('hero', '{
  "heading": "Искусство\nТочности",
  "subheading": "Создаём идеальный образ через авторское видение и безупречную технику. Ваше пространство уникальной эстетики.",
  "badge": "EST. 2023",
  "ctaText": "Записаться",
  "ctaSecondaryText": "Каталог услуг",
  "image": ""
}'::jsonb),

('serviceCategories', '{
  "items": [
    {"key": "all",      "label": "Все"},
    {"key": "lashes",   "label": "Ресницы"},
    {"key": "nails",    "label": "Руки"},
    {"key": "pedicure", "label": "Ноги"}
  ]
}'::jsonb),

('promotions', '{
  "items": [
    {
      "id": "p1",
      "title": "Маникюр с покрытием в один тон + педикюр с покрытием без стоп",
      "discount": "75%",
      "originalPrice": 2215,
      "promoPrice": 539,
      "endsAt": "2026-04-30",
      "promoServiceId": "s11"
    }
  ]
}'::jsonb),

('masters', '{
  "items": [
    {
      "id": "m1",
      "name": "Виктория",
      "role": "Топ-мастер",
      "image": "",
      "rating": 5.0,
      "reviewsCount": 27,
      "specialties": ["Маникюр", "Педикюр"],
      "serviceCategories": ["nails", "pedicure"]
    },
    {
      "id": "m2",
      "name": "Карина",
      "role": "Мастер по наращиванию ресниц",
      "image": "",
      "rating": 5.0,
      "reviewsCount": 6,
      "specialties": ["Наращивание ресниц"],
      "serviceCategories": ["lashes"]
    }
  ]
}'::jsonb),

('gallery', '{
  "items": [
    {"id":"g1","image":"","alt":"Маникюр — работа студии","category":"nails","isActive":true},
    {"id":"g2","image":"","alt":"Наращивание ресниц — работа студии","category":"lashes","isActive":true},
    {"id":"g3","image":"","alt":"Педикюр — работа студии","category":"pedicure","isActive":true},
    {"id":"g4","image":"","alt":"Инструменты для наращивания ресниц","category":"lashes","isActive":true},
    {"id":"g5","image":"","alt":"Дизайн ногтей — работа студии","category":"nails","isActive":true},
    {"id":"g6","image":"","alt":"Френч маникюр — работа студии","category":"nails","isActive":true},
    {"id":"g7","image":"","alt":"Яркий нейл-арт — работа студии","category":"nails","isActive":true},
    {"id":"g8","image":"","alt":"Объёмное наращивание ресниц","category":"lashes","isActive":true},
    {"id":"g9","image":"","alt":"Нюдовый маникюр — работа студии","category":"nails","isActive":true}
  ]
}'::jsonb),

('booking', '{
  "heading": "Записаться на приём",
  "subtitle": "Выберите услугу и удобное время — мы свяжемся с вами для подтверждения",
  "privacyText": "Нажимая кнопку, вы соглашаетесь с условиями обработки персональных данных",
  "successTitle": "Заявка отправлена!",
  "successMessage": "Мы свяжемся с вами в ближайшее время для подтверждения записи."
}'::jsonb),

('contacts', '{
  "heading": "Местоположение",
  "subtitle": "Мы ждём вас",
  "mapEmbedUrl": "https://yandex.ru/map-widget/v1/?ll=38.2612%2C55.4267&z=16&pt=38.2612%2C55.4267%2Cpm2rdm"
}'::jsonb)

on conflict (id) do nothing;

insert into navigation_items (label, href, sort_order) values
  ('Услуги',   '#services', 0),
  ('Работы',   '#gallery',  1),
  ('Отзывы',   '#reviews',  2),
  ('Контакты', '#contacts', 3)
on conflict do nothing;
