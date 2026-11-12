create table if not exists integration_activity (
  id bigserial primary key,
  status text not null default 'info' check (status in ('success', 'warning', 'error', 'info')),
  service text not null,
  message text not null,
  created_at timestamptz not null default now()
);

create index if not exists integration_activity_created_at_idx
  on integration_activity (created_at desc);

insert into integration_activity (status, service, message)
select 'info', 'System', 'Integration activity log is active. Events appear here when settings or payments change.'
where not exists (select 1 from integration_activity limit 1);
