create table if not exists apartment_gallery_videos (
  id uuid primary key default gen_random_uuid(),
  video_url text not null,
  poster_url text not null,
  alt_text text not null,
  title text not null,
  duration text not null,
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_by_admin_id bigint references admins(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint apartment_gallery_videos_duration_chk check (duration ~ '^\d{1,2}:\d{2}$')
);

create unique index if not exists apartment_gallery_videos_video_url_key on apartment_gallery_videos (video_url);

create index if not exists apartment_gallery_videos_public_idx
  on apartment_gallery_videos (is_published, sort_order, created_at);