-- Fix trigger to handle re-booking (cancelled → confirmed)
-- Previously only handled INSERT and confirmed→cancelled
CREATE OR REPLACE FUNCTION handle_booking_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.trips SET seats_available = seats_available - 1 WHERE id = NEW.trip_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.status = 'cancelled' AND OLD.status = 'confirmed' THEN
      UPDATE public.trips SET seats_available = seats_available + 1 WHERE id = NEW.trip_id;
    ELSIF NEW.status = 'confirmed' AND OLD.status = 'cancelled' THEN
      UPDATE public.trips SET seats_available = seats_available - 1 WHERE id = NEW.trip_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
