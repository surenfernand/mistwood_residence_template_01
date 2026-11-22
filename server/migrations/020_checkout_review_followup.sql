alter table bookings
  add column if not exists review_token_hash char(64),
  add column if not exists checkout_email_sent_at timestamptz;

create unique index if not exists bookings_review_token_hash_idx
  on bookings(review_token_hash) where review_token_hash is not null;
