create table if not exists booking_refunds (
  id bigserial primary key,
  booking_request_id bigint not null references booking_requests(id) on delete cascade,
  booking_id bigint not null references bookings(id) on delete cascade,
  booking_payment_id bigint not null references booking_payments(id) on delete restrict,
  amount numeric(12,2) not null check (amount > 0),
  currency text not null default 'LKR',
  payhere_payment_id text not null,
  payhere_refund_id text,
  status text not null check (status in ('pending', 'accepted', 'failed')),
  provider_message text,
  provider_response jsonb,
  idempotency_key text not null,
  initiated_by_admin_id bigint references admins(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists booking_refunds_idempotency_key_idx on booking_refunds (idempotency_key);
create unique index if not exists booking_refunds_payment_accepted_idx
  on booking_refunds (booking_payment_id) where status = 'accepted';
create index if not exists booking_refunds_request_idx on booking_refunds (booking_request_id, created_at desc);