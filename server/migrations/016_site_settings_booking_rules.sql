alter table site_settings
  add column if not exists same_day_booking boolean not null default true,
  add column if not exists lead_time_hours integer not null default 2 check (lead_time_hours >= 0 and lead_time_hours <= 168),
  add column if not exists require_deposit boolean not null default true,
  add column if not exists cancellation_policy text not null default
    'Free cancellation up to 3 days before check-in. Cancellations made within 3 days of check-in are charged 100% of the first night.';
