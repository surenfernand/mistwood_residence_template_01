create table if not exists site_settings (
  id integer primary key check (id = 1),
  property_name text not null default 'Mistwood Residence',
  contact_email text not null default 'fernandosuren6@gmail.com',
  contact_phone text not null default '+94 76 590 0800',
  whatsapp_url text not null default 'https://wa.me/94765900800',
  public_address text not null default 'Nuwara Eliya, Sri Lanka',
  footer_tagline text not null default 'One apartment in Nuwara Eliya, reserved as a whole for your group.',
  deposit_percent numeric(5,2) not null default 30 check (deposit_percent > 0 and deposit_percent <= 100),
  min_nights integer not null default 1 check (min_nights >= 1),
  max_nights integer check (max_nights is null or max_nights >= 1),
  max_guests integer not null default 7 check (max_guests >= 1),
  advance_booking_days integer check (advance_booking_days is null or advance_booking_days >= 1),
  check_in_time text not null default '14:00',
  check_out_time text not null default '11:00',
  admin_alert_email text not null default 'fernandosuren6@gmail.com',
  send_customer_booking_email boolean not null default true,
  send_admin_booking_email boolean not null default true,
  mail_from_name text not null default 'Mistwood Residence',
  facebook_url text default 'https://www.facebook.com/share/19u5hKB7DJ/',
  instagram_url text,
  youtube_url text,
  telegram_url text,
  updated_at timestamptz not null default now(),
  updated_by_admin_id bigint references admins(id) on delete set null
);

insert into site_settings (id) values (1) on conflict (id) do nothing;
