create table if not exists guest_users (
  id bigserial primary key,
  email text not null unique,
  name text not null,
  phone text,
  password_hash text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists guest_sessions (
  id bigserial primary key,
  guest_user_id bigint not null references guest_users(id) on delete cascade,
  token_hash char(64) not null unique,
  expires_at timestamptz not null,
  created_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  user_agent text,
  ip_address inet
);

create table if not exists guest_setup_tokens (
  id bigserial primary key,
  guest_user_id bigint references guest_users(id) on delete cascade,
  email text not null,
  token_hash char(64) not null unique,
  expires_at timestamptz not null,
  used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists guest_sessions_guest_idx on guest_sessions(guest_user_id, expires_at desc);

alter table bookings drop constraint if exists bookings_guest_user_id_fkey;
alter table bookings
  add constraint bookings_guest_user_id_fkey foreign key (guest_user_id) references guest_users(id) on delete set null;
