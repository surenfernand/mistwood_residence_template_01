alter table special_offers
  add column if not exists description text not null default '',
  add column if not exists min_nights integer not null default 2 check (min_nights > 0),
  add column if not exists image_key text not null default 'highland-escape',
  add column if not exists image_alt text not null default '',
  add column if not exists featured boolean not null default false,
  add column if not exists badge text,
  add column if not exists sort_order integer not null default 0;

update special_offers set
  name = 'Highland Escape Deal',
  description = 'Book your stay this month and enjoy a special rate for a peaceful highland retreat.',
  discount_percent = 15,
  start_date = date '2026-11-01',
  end_date = date '2026-11-30',
  min_nights = 2,
  image_key = 'highland-escape',
  image_alt = 'Green tea plantations across the hills of Nuwara Eliya',
  featured = true,
  badge = 'Most popular',
  sort_order = 1,
  active = true
where name in ('Highlands Escape Deal', 'Highland Escape Deal');

update special_offers set
  name = 'Long Stay Savings',
  description = 'Planning a longer escape? Enjoy great savings on extended stays.',
  discount_percent = 20,
  start_date = date '2026-01-01',
  end_date = date '2030-12-31',
  min_nights = 7,
  image_key = 'long-stay',
  image_alt = 'A woman relaxing with a book and coffee beside a window',
  featured = false,
  badge = null,
  sort_order = 2,
  active = true
where name in ('Long Stay Retreat', 'Long Stay Savings');

insert into special_offers (
  name, discount_percent, start_date, end_date, active,
  description, min_nights, image_key, image_alt, featured, badge, sort_order
)
select
  'Family Getaway', 10, date '2026-11-01', date '2026-12-20', true,
  'A perfect highland holiday for families, with special savings and extra comfort.',
  2, 'family-getaway', 'A family spending time together on a picnic blanket outdoors',
  false, null, 3
where not exists (select 1 from special_offers where name = 'Family Getaway');

insert into special_offers (
  name, discount_percent, start_date, end_date, active,
  description, min_nights, image_key, image_alt, featured, badge, sort_order
)
select
  'Romantic Retreat', 15, date '2026-01-01', date '2030-12-31', true,
  'A cosy escape for couples with special benefits and a relaxing atmosphere.',
  2, 'romantic-retreat', 'A smiling couple cuddling outdoors under a cosy blanket',
  false, null, 4
where not exists (select 1 from special_offers where name = 'Romantic Retreat');

insert into special_offers (
  name, discount_percent, start_date, end_date, active,
  description, min_nights, image_key, image_alt, featured, badge, sort_order
)
select
  'Festive Holiday Deal', 12, date '2026-12-20', date '2027-01-05', true,
  'Celebrate the season in Nuwara Eliya with exclusive holiday rates.',
  3, 'festive-holiday', 'Festive Christmas decorations with gold ornaments and pinecones',
  false, null, 5
where not exists (select 1 from special_offers where name = 'Festive Holiday Deal');
