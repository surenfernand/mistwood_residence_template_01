alter table booking_requests
  add column if not exists quoted_total numeric(12,2),
  add column if not exists quoted_deposit numeric(12,2),
  add column if not exists pricing_snapshot jsonb,
  add column if not exists payment_order_id text;

create unique index if not exists booking_requests_payment_order_id_idx
  on booking_requests(payment_order_id) where payment_order_id is not null;

alter table bookings
  add column if not exists check_in_token_hash char(64),
  add column if not exists checked_in_at timestamptz,
  add column if not exists qr_issued_at timestamptz,
  add column if not exists guest_user_id bigint;

create unique index if not exists bookings_check_in_token_hash_idx
  on bookings(check_in_token_hash) where check_in_token_hash is not null;

alter table booking_requests
  add column if not exists needs_attention boolean not null default false;
