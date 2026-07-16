-- ============================================================================
-- GETVIA — Supabase database schema
--
-- HOW TO USE:
-- 1. Create a free project at https://supabase.com
-- 2. In your project, go to the SQL Editor (left sidebar)
-- 3. Paste this entire file in and click "Run"
-- 4. That's it — tables, security rules, and sample data are all created.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- BUSINESSES
-- ----------------------------------------------------------------------------

create table if not exists businesses (
  id           uuid primary key default gen_random_uuid(),
  owner_id     uuid references auth.users(id) on delete cascade,
  name         text not null,
  category     text not null,
  city         text not null,
  description  text,
  image_url    text,
  badge        text check (badge in ('verified', 'featured', 'premium') or badge is null),
  is_open      boolean not null default true,
  rating       numeric(2,1) not null default 0,
  review_count integer not null default 0,
  created_at   timestamptz not null default now()
);

alter table businesses enable row level security;

-- Anyone (including logged-out visitors) can read business listings.
create policy "Businesses are publicly readable"
  on businesses for select
  using (true);

-- Only a logged-in user can create a listing, and only as themselves.
create policy "Authenticated users can create their own listing"
  on businesses for insert
  to authenticated
  with check (auth.uid() = owner_id);

-- Owners can update only their own listing.
create policy "Owners can update their own listing"
  on businesses for update
  to authenticated
  using (auth.uid() = owner_id);

-- Owners can delete only their own listing.
create policy "Owners can delete their own listing"
  on businesses for delete
  to authenticated
  using (auth.uid() = owner_id);

-- ----------------------------------------------------------------------------
-- REVIEWS
-- ----------------------------------------------------------------------------

create table if not exists reviews (
  id           uuid primary key default gen_random_uuid(),
  business_id  uuid not null references businesses(id) on delete cascade,
  user_id      uuid references auth.users(id) on delete set null,
  author_name  text not null,
  rating       integer not null check (rating between 1 and 5),
  comment      text not null,
  created_at   timestamptz not null default now()
);

alter table reviews enable row level security;

create policy "Reviews are publicly readable"
  on reviews for select
  using (true);

create policy "Authenticated users can write a review"
  on reviews for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Users can delete their own review"
  on reviews for delete
  to authenticated
  using (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- Keep a business's rating / review_count in sync whenever a review changes
-- ----------------------------------------------------------------------------

create or replace function refresh_business_rating()
returns trigger as $$
begin
  update businesses
  set
    rating = coalesce((select round(avg(rating)::numeric, 1) from reviews where business_id = coalesce(new.business_id, old.business_id)), 0),
    review_count = (select count(*) from reviews where business_id = coalesce(new.business_id, old.business_id))
  where id = coalesce(new.business_id, old.business_id);
  return null;
end;
$$ language plpgsql security definer;

drop trigger if exists on_review_change on reviews;
create trigger on_review_change
  after insert or update or delete on reviews
  for each row execute function refresh_business_rating();

-- ----------------------------------------------------------------------------
-- Sample data — delete these rows once you have real listings
-- ----------------------------------------------------------------------------

insert into businesses (name, category, city, description, image_url, badge, is_open)
values
  ('North Light Café', 'Café · Food & Dining', 'Kochi', 'A quiet, plant-filled café good for working from.', 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=600&auto=format&fit=crop&q=80', 'verified', true),
  ('Studio Marrow', 'Hair & Beauty', 'Bengaluru', 'A boutique salon focused on natural texture cuts and color.', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=600&auto=format&fit=crop&q=80', 'featured', true),
  ('Torque & Tools', 'Auto Repair', 'Chennai', 'Honest, transparent car servicing with upfront pricing.', 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=600&auto=format&fit=crop&q=80', 'premium', false)
on conflict do nothing;
