alter table site_settings
  add column if not exists logo_url text not null default '/assets/mistwood/branding/logo.png',
  add column if not exists tagline text not null default 'Where Tea Hills Meet Modern Comfort',
  add column if not exists property_description text not null default
    'Set in the cool highlands of Nuwara Eliya, Mistwood Residence offers a peaceful stay surrounded by tea estates, forest trails, and lake walks.';

update site_settings
set
  tagline = coalesce(nullif(tagline, ''), 'Where Tea Hills Meet Modern Comfort'),
  property_description = coalesce(
    nullif(property_description, ''),
  'Set in the cool highlands of Nuwara Eliya, Mistwood Residence offers a peaceful stay surrounded by tea estates, forest trails, and lake walks.'
  )
where id = 1;
