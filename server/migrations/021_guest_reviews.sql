alter table bookings
  add column if not exists review_submitted_at timestamptz;

alter table social_entries
  add column if not exists title text,
  add column if not exists guest_email text,
  add column if not exists guest_phone text,
  add column if not exists booking_id bigint references bookings(id) on delete set null;

create index if not exists social_entries_draft_created_idx
  on social_entries (created_at desc)
  where status = 'draft';