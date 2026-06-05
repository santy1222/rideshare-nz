-- =============================================
-- Ride Share NZ – Supabase Schema
-- Run this in the Supabase SQL Editor
-- =============================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- =============================================
-- HELPERS
-- =============================================

-- Bypasses RLS to check admin role, avoiding infinite recursion in policies
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- =============================================
-- PROFILES
-- =============================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  phone text,
  avatar_url text,
  role text not null default 'user' check (role in ('user', 'admin')),
  avg_rating numeric(3, 2) not null default 0,
  total_reviews integer not null default 0,
  suspended boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Anyone can read profiles"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- Admins can do anything on profiles
create policy "Admins can manage profiles"
  on public.profiles for all
  using (public.is_admin());

-- =============================================
-- TRIPS
-- =============================================
create table if not exists public.trips (
  id uuid primary key default uuid_generate_v4(),
  driver_id uuid references public.profiles(id) on delete cascade not null,
  origin text not null,
  destination text not null,
  departure_date date not null,
  departure_time time not null,
  seats_available integer not null check (seats_available >= 1 and seats_available <= 8),
  price numeric(8, 2),
  description text,
  status text not null default 'active' check (status in ('active', 'cancelled', 'completed')),
  created_at timestamptz not null default now()
);

alter table public.trips enable row level security;

create policy "Anyone can read active trips"
  on public.trips for select using (status = 'active' or driver_id = auth.uid());

create policy "Authenticated users can insert trips"
  on public.trips for insert with check (auth.uid() = driver_id);

create policy "Drivers can update own trips"
  on public.trips for update using (auth.uid() = driver_id);

create policy "Admins can manage trips"
  on public.trips for all
  using (public.is_admin());

-- =============================================
-- REVIEWS
-- =============================================
create table if not exists public.reviews (
  id uuid primary key default uuid_generate_v4(),
  trip_id uuid references public.trips(id) on delete cascade not null,
  reviewer_id uuid references public.profiles(id) on delete cascade not null,
  reviewed_id uuid references public.profiles(id) on delete cascade not null,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamptz not null default now(),
  unique (trip_id, reviewer_id)
);

alter table public.reviews enable row level security;

create policy "Anyone can read reviews"
  on public.reviews for select using (true);

create policy "Authenticated users can insert reviews"
  on public.reviews for insert with check (auth.uid() = reviewer_id);

-- =============================================
-- TRIGGER: Update avg_rating on profiles after review insert
-- =============================================
create or replace function update_driver_rating()
returns trigger as $$
begin
  update public.profiles
  set
    avg_rating = (
      select round(avg(rating)::numeric, 2)
      from public.reviews
      where reviewed_id = new.reviewed_id
    ),
    total_reviews = (
      select count(*)
      from public.reviews
      where reviewed_id = new.reviewed_id
    )
  where id = new.reviewed_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger after_review_insert
  after insert on public.reviews
  for each row execute function update_driver_rating();

-- =============================================
-- TRIGGER: Auto-create profile on user signup
-- =============================================
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', 'Usuario')
  )
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- =============================================
-- INDEXES
-- =============================================
create index if not exists idx_trips_departure_date on public.trips(departure_date);
create index if not exists idx_trips_origin on public.trips(origin);
create index if not exists idx_trips_destination on public.trips(destination);
create index if not exists idx_trips_driver_id on public.trips(driver_id);
create index if not exists idx_reviews_reviewed_id on public.reviews(reviewed_id);

-- =============================================
-- SAMPLE DATA (optional - remove in production)
-- =============================================
-- To create an admin user:
-- 1. Register normally via the app
-- 2. Run: UPDATE public.profiles SET role = 'admin' WHERE id = 'your-user-uuid';
