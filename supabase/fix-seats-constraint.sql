-- Drop ALL check constraints on seats_available (regardless of name)
DO $$
DECLARE
  cname text;
BEGIN
  FOR cname IN
    SELECT cc.constraint_name
    FROM information_schema.check_constraints cc
    JOIN information_schema.constraint_column_usage ccu
      ON cc.constraint_name = ccu.constraint_name
    WHERE ccu.table_name = 'trips'
      AND ccu.column_name = 'seats_available'
  LOOP
    EXECUTE 'ALTER TABLE public.trips DROP CONSTRAINT ' || quote_ident(cname);
  END LOOP;
END;
$$;

-- Add the correct constraint: allow 0 (fully booked) up to 8
ALTER TABLE public.trips
  ADD CONSTRAINT trips_seats_available_check
  CHECK (seats_available >= 0 AND seats_available <= 8);
