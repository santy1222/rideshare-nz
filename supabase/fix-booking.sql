-- Fix 1: Allow seats_available to reach 0 (fully booked trip)
-- The original constraint >= 1 caused the booking trigger to fail
-- when the last seat was taken (0 violates >= 1)
ALTER TABLE public.trips DROP CONSTRAINT IF EXISTS trips_seats_available_check;
ALTER TABLE public.trips ADD CONSTRAINT trips_seats_available_check
  CHECK (seats_available >= 0 AND seats_available <= 8);

-- Fix 2: Add INSERT policy for notifications
-- Without this, the booking confirmation notification was silently blocked
CREATE POLICY "Authenticated users can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
