-- Fix: revert profiles policy to public read
-- Phone privacy is enforced at the app layer (profile page requires auth)
-- Anonymous users need to see driver names/ratings on trip cards

DROP POLICY IF EXISTS "Authenticated users can read profiles" ON public.profiles;

CREATE POLICY "Anyone can read profiles"
  ON public.profiles FOR SELECT USING (true);
