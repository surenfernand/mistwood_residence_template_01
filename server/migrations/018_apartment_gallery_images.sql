create extension if not exists pgcrypto;

create table if not exists apartment_gallery_images (
  id uuid primary key default gen_random_uuid(),
  image_url text not null,
  alt_text text not null,
  category text not null check (
    category in (
      'Bedrooms',
      'Living Room',
      'Kitchen',
      'Bathroom',
      'Balcony & Views',
      'Details'
    )
  ),
  sort_order integer not null default 0,
  is_published boolean not null default true,
  created_by_admin_id bigint references admins(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists apartment_gallery_images_image_url_key on apartment_gallery_images (image_url);

create index if not exists apartment_gallery_images_public_idx
  on apartment_gallery_images (is_published, sort_order, created_at);