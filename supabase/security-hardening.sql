-- =============================================
-- Security Hardening – Ejecutar en Supabase SQL Editor
-- Acompaña a los cambios de código del mismo commit:
-- ejecutar este SQL y deployar el código JUNTOS.
-- =============================================

-- -----------------------------------------------
-- 1. PROFILES: anti escalada de privilegios + privacidad del teléfono
--    Antes: cualquier usuario podía actualizar su propia fila con role='admin'
--    (la política de UPDATE no restringe columnas) y cualquier visitante
--    anónimo podía leer todos los teléfonos vía PostgREST.
--    Fix: privilegios por columna. anon no ve phone/role/suspended;
--    authenticated solo puede escribir full_name/phone/avatar_url.
-- -----------------------------------------------
REVOKE SELECT, INSERT, UPDATE, DELETE ON public.profiles FROM anon, authenticated;

GRANT SELECT (id, full_name, avatar_url, avg_rating, total_reviews, created_at)
  ON public.profiles TO anon;

GRANT SELECT (id, full_name, phone, avatar_url, role, avg_rating, total_reviews, suspended, created_at)
  ON public.profiles TO authenticated;

GRANT INSERT (id, full_name, phone, avatar_url) ON public.profiles TO authenticated;
GRANT UPDATE (full_name, phone, avatar_url) ON public.profiles TO authenticated;

-- Las acciones de admin sobre profiles (suspender / borrar) ahora van por
-- /api/admin/users/[id] con la service role key, ya no desde el navegador.

-- -----------------------------------------------
-- 2. TRIPS: crear viajes SOLO vía /api/trips (validación + rate limit)
--    Antes: la política de INSERT permitía insertar directo contra PostgREST,
--    salteando la validación de ciudades, descripción y el límite de 3/día.
--    El UPDATE tampoco tenía WITH CHECK (se podía cambiar driver_id).
-- -----------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can insert trips" ON public.trips;

DROP POLICY IF EXISTS "Drivers can update own trips" ON public.trips;
CREATE POLICY "Drivers can update own trips"
  ON public.trips FOR UPDATE
  USING (auth.uid() = driver_id)
  WITH CHECK (auth.uid() = driver_id);

REVOKE INSERT, UPDATE, DELETE ON public.trips FROM anon, authenticated;
-- El único update del cliente es cancelar (status); el resto va por API/admin.
GRANT UPDATE (status) ON public.trips TO authenticated;

-- -----------------------------------------------
-- 3. MESSAGES: enviar SOLO vía /api/messages (validación + rate limit + participante)
--    Antes: se podía insertar directo (bypass del límite de 20/hora) y la
--    política de UPDATE del receptor permitía editar el contenido del mensaje.
-- -----------------------------------------------
DROP POLICY IF EXISTS "Authenticated users can send messages" ON public.messages;

REVOKE INSERT, UPDATE, DELETE ON public.messages FROM anon, authenticated;
-- El receptor solo puede marcar como leído, no editar el texto.
GRANT UPDATE (read) ON public.messages TO authenticated;

-- -----------------------------------------------
-- 4. NOTIFICATIONS: generadas por trigger en el servidor, nunca por el cliente
--    Antes: cualquier usuario logueado podía insertar notificaciones con texto
--    arbitrario a CUALQUIER usuario (vector de phishing/spam).
-- -----------------------------------------------
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS type text;

DROP POLICY IF EXISTS "Authenticated users can insert notifications" ON public.notifications;
REVOKE INSERT, UPDATE, DELETE ON public.notifications FROM anon, authenticated;
-- Solo se puede marcar como leída (la página de notificaciones hace eso).
GRANT UPDATE (read) ON public.notifications TO authenticated;

CREATE OR REPLACE FUNCTION public.notify_booking_change()
RETURNS trigger
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql AS $$
DECLARE
  v_passenger text;
  v_trip record;
BEGIN
  SELECT full_name INTO v_passenger FROM public.profiles WHERE id = NEW.passenger_id;
  SELECT driver_id, origin, destination INTO v_trip FROM public.trips WHERE id = NEW.trip_id;

  IF (TG_OP = 'INSERT' AND NEW.status = 'confirmed')
     OR (TG_OP = 'UPDATE' AND NEW.status = 'confirmed' AND OLD.status = 'cancelled') THEN
    INSERT INTO public.notifications (user_id, trip_id, type, message)
    VALUES (v_trip.driver_id, NEW.trip_id, 'booking_joined',
            v_passenger || ' joined your trip ' || v_trip.origin || ' → ' || v_trip.destination);
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'cancelled' AND OLD.status = 'confirmed' THEN
    INSERT INTO public.notifications (user_id, trip_id, type, message)
    VALUES (v_trip.driver_id, NEW.trip_id, 'booking_cancelled',
            v_passenger || ' cancelled their booking on ' || v_trip.origin || ' → ' || v_trip.destination);
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS after_booking_notify ON public.bookings;
CREATE TRIGGER after_booking_notify
  AFTER INSERT OR UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.notify_booking_change();

-- -----------------------------------------------
-- 5. BOOKINGS: impedir cambiar trip_id/passenger_id en un update
--    Antes: al cancelar/rebookear se podía apuntar el booking a otro viaje
--    e inflar los asientos de cualquier trip vía el trigger de seats.
-- -----------------------------------------------
CREATE OR REPLACE FUNCTION public.prevent_booking_rekey()
RETURNS trigger
SET search_path = public
LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.trip_id <> OLD.trip_id OR NEW.passenger_id <> OLD.passenger_id THEN
    RAISE EXCEPTION 'booking trip_id/passenger_id cannot be changed';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS before_booking_update ON public.bookings;
CREATE TRIGGER before_booking_update
  BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.prevent_booking_rekey();

-- -----------------------------------------------
-- 6. Defensa en profundidad: límites de longitud a nivel DB
--    (espejan lib/validation.ts; NOT VALID para no chequear filas existentes)
-- -----------------------------------------------
ALTER TABLE public.trips DROP CONSTRAINT IF EXISTS trips_description_len;
ALTER TABLE public.trips ADD CONSTRAINT trips_description_len
  CHECK (description IS NULL OR char_length(description) <= 500) NOT VALID;

ALTER TABLE public.messages DROP CONSTRAINT IF EXISTS messages_content_len;
ALTER TABLE public.messages ADD CONSTRAINT messages_content_len
  CHECK (char_length(content) <= 1000) NOT VALID;

ALTER TABLE public.reviews DROP CONSTRAINT IF EXISTS reviews_comment_len;
ALTER TABLE public.reviews ADD CONSTRAINT reviews_comment_len
  CHECK (comment IS NULL OR char_length(comment) <= 300) NOT VALID;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_name_len;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_name_len
  CHECK (char_length(full_name) <= 100) NOT VALID;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_phone_len;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_phone_len
  CHECK (phone IS NULL OR char_length(phone) <= 25) NOT VALID;

-- -----------------------------------------------
-- 7. STORAGE (bucket avatars): cada usuario solo puede subir/pisar SU archivo
--    IMPORTANTE: primero revisar qué políticas existen hoy y borrar las
--    permisivas (las políticas se combinan con OR):
--      SELECT policyname, cmd FROM pg_policies
--      WHERE schemaname = 'storage' AND tablename = 'objects';
-- -----------------------------------------------
DROP POLICY IF EXISTS "avatars_upload_own" ON storage.objects;
CREATE POLICY "avatars_upload_own" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'avatars' AND name LIKE auth.uid()::text || '.%');

DROP POLICY IF EXISTS "avatars_update_own" ON storage.objects;
CREATE POLICY "avatars_update_own" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'avatars' AND name LIKE auth.uid()::text || '.%');

-- -----------------------------------------------
-- 8. Hardening de funciones SECURITY DEFINER existentes (fijar search_path)
-- -----------------------------------------------
ALTER FUNCTION public.is_admin() SET search_path = public;
ALTER FUNCTION public.update_driver_rating() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.handle_booking_change() SET search_path = public;
