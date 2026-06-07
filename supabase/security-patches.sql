-- =============================================
-- Security Patches – Run in Supabase SQL Editor
-- =============================================

-- -----------------------------------------------
-- 1. PROFILES: Require authentication to read
--    Protects phone numbers from unauthenticated access (NZ Privacy Act 2020)
-- -----------------------------------------------
DROP POLICY IF EXISTS "Anyone can read profiles" ON public.profiles;

CREATE POLICY "Authenticated users can read profiles"
  ON public.profiles FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- -----------------------------------------------
-- 2. BOOKINGS: Prevent driver from booking their own trip
-- -----------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can create bookings" ON public.bookings;

CREATE POLICY "Authenticated users can create bookings"
  ON public.bookings FOR INSERT
  WITH CHECK (
    auth.uid() = passenger_id
    AND trip_id NOT IN (
      SELECT id FROM public.trips WHERE driver_id = auth.uid()
    )
  );

-- -----------------------------------------------
-- 3. REVIEWS: Only allow trip participants to leave reviews
--    (driver or confirmed/cancelled passenger)
-- -----------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can insert reviews" ON public.reviews;

CREATE POLICY "Trip participants can insert reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (
    auth.uid() = reviewer_id
    AND (
      trip_id IN (SELECT id FROM public.trips WHERE driver_id = auth.uid())
      OR trip_id IN (SELECT bk.trip_id FROM public.bookings bk WHERE bk.passenger_id = auth.uid())
    )
  );

-- -----------------------------------------------
-- 4. NOTIFICATIONS: Add table + RLS (missing from original schema)
-- -----------------------------------------------
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  trip_id uuid REFERENCES public.trips(id) ON DELETE SET NULL,
  message text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id
  ON public.notifications(user_id);

CREATE INDEX IF NOT EXISTS idx_notifications_unread
  ON public.notifications(user_id, read) WHERE read = false;
