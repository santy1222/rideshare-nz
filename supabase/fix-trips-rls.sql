-- Allow passengers to read trips they have a booking for (any status)
-- Previously only active trips or own trips were visible, causing
-- null trip data on the profile page for cancelled/completed trips

DROP POLICY IF EXISTS "Anyone can read active trips" ON public.trips;

CREATE POLICY "Users can read relevant trips"
  ON public.trips FOR SELECT
  USING (
    status = 'active'
    OR driver_id = auth.uid()
    OR id IN (
      SELECT trip_id FROM public.bookings WHERE passenger_id = auth.uid()
    )
  );
