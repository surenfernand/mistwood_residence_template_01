create table if not exists availability_blocks (
  id bigserial primary key,
  start_date date not null,
  end_date date not null,
  reason text,
  created_by_admin_id bigint references admins(id) on delete set null,
  created_at timestamptz not null default now(),
  check (end_date > start_date)
);

create index if not exists availability_blocks_dates_idx on availability_blocks (start_date, end_date);

insert into availability_blocks (start_date, end_date, reason)
select date '2026-11-18', date '2026-11-20', 'Demo maintenance block'
where not exists (select 1 from availability_blocks where reason = 'Demo maintenance block');
