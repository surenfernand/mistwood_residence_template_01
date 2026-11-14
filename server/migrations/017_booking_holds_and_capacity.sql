alter table booking_requests
  add column if not exists hold_expires_at timestamptz;

create index if not exists booking_requests_active_hold_idx
  on booking_requests (hold_expires_at)
  where status = 'pending_payment';

update site_settings
  set max_guests = 8,
      updated_at = now()
  where id = 1 and max_guests = 7;
