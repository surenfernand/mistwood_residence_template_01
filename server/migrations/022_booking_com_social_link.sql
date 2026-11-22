alter table site_settings
  add column if not exists booking_com_url text;

update site_settings
set booking_com_url = 'https://www.booking.com/Share-sp00N6o'
where id = 1 and (booking_com_url is null or booking_com_url = '');
