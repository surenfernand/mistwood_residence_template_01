alter table booking_requests
  add column if not exists status text not null default 'new',
  add column if not exists source text not null default 'website',
  add column if not exists status_changed_at timestamptz not null default now();

alter table booking_requests drop constraint if exists booking_requests_status_check;
alter table booking_requests add constraint booking_requests_status_check
  check (status in ('new', 'contacted', 'pending_payment', 'confirmed', 'checked_in', 'checked_out', 'cancelled', 'declined'));

create index if not exists booking_requests_status_created_at_idx on booking_requests (status, created_at desc);
create index if not exists booking_requests_arrive_depart_idx on booking_requests (arrive, depart);

create table if not exists booking_request_status_history (
  id bigserial primary key,
  booking_request_id integer not null references booking_requests(id) on delete cascade,
  from_status text,
  to_status text not null,
  changed_by_admin_id bigint references admins(id) on delete set null,
  changed_at timestamptz not null default now()
);

create index if not exists booking_request_status_history_request_idx on booking_request_status_history (booking_request_id, changed_at desc);
