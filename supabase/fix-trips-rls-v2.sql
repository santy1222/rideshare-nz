-- Revert trips RLS to original (safe) version
DROP POLICY IF EXISTS "Users can read relevant trips" ON public.trips;
DROP POLICY IF EXISTS "Anyone can read active trips" ON public.trips;

CREATE POLICY "Anyone can read active trips"
  ON public.trips FOR SELECT
  USING (status = 'active' OR driver_id = auth.uid());
