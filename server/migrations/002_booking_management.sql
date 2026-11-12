alter table booking_requests
  add column if not exists updated_at timestamptz not null default now();

create table if not exists bookings (
  id bigserial primary key,
  booking_request_id integer unique references booking_requests(id) on delete set null,
  guest_name text not null,
  guest_email text not null,
  guest_phone text,
  source text not null default 'website',
  check_in date not null,
  check_out date not null,
  guests integer not null check (guests > 0),
  status text not null default 'confirmed' check (status in ('confirmed', 'checked_in', 'checked_out', 'cancelled')),
  nightly_rate numeric(12,2),
  extra_charges numeric(12,2) not null default 0,
  discount numeric(12,2) not null default 0,
  total_amount numeric(12,2),
  deposit_amount numeric(12,2) not null default 0,
  payment_status text not null default 'unpaid' check (payment_status in ('unpaid', 'partial', 'paid', 'refunded')),
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (check_out > check_in)
);

create extension if not exists btree_gist;
alter table bookings drop constraint if exists bookings_no_overlapping_active_stays;
alter table bookings add constraint bookings_no_overlapping_active_stays
  exclude using gist (daterange(check_in, check_out, '[)') with &&)
  where (status in ('confirmed', 'checked_in'));

create table if not exists booking_payments (
  id bigserial primary key,
  booking_id bigint not null references bookings(id) on delete cascade,
  amount numeric(12,2) not null check (amount >= 0),
  method text,
  reference text,
  status text not null default 'pending' check (status in ('pending', 'verified', 'failed', 'refunded')),
  paid_at timestamptz,
  recorded_by_admin_id bigint references admins(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists booking_notes (
  id bigserial primary key,
  booking_request_id integer references booking_requests(id) on delete cascade,
  booking_id bigint references bookings(id) on delete cascade,
  note text not null,
  created_by_admin_id bigint references admins(id) on delete set null,
  created_at timestamptz not null default now(),
  check (booking_request_id is not null or booking_id is not null)
);

create table if not exists booking_audit_log (
  id bigserial primary key,
  booking_request_id integer references booking_requests(id) on delete cascade,
  booking_id bigint references bookings(id) on delete cascade,
  action text not null,
  details jsonb not null default '{}'::jsonb,
  created_by_admin_id bigint references admins(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists bookings_stay_dates_idx on bookings (check_in, check_out);
create index if not exists booking_payments_booking_idx on booking_payments (booking_id, created_at desc);
