create table if not exists admin_notification_events (
  id bigserial primary key,
  type text not null,
  permission_code text not null,
  title text not null,
  body text not null,
  icon text not null default 'bell',
  entity_type text,
  entity_id bigint,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists admin_notification_events_created_at_idx
  on admin_notification_events (created_at desc);

create index if not exists admin_notification_events_dedupe_idx
  on admin_notification_events (type, entity_type, entity_id, created_at desc);

create table if not exists admin_notification_reads (
  admin_id bigint not null references admins(id) on delete cascade,
  event_id bigint not null references admin_notification_events(id) on delete cascade,
  read_at timestamptz not null default now(),
  primary key (admin_id, event_id)
);

create table if not exists admin_notification_dismissals (
  admin_id bigint not null references admins(id) on delete cascade,
  synthetic_key text not null,
  dismissed_at timestamptz not null default now(),
  primary key (admin_id, synthetic_key)
);
