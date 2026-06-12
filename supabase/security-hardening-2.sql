-- =============================================
-- Security Hardening 2 – Ejecutar en Supabase SQL Editor
-- DESPUÉS de deployar el código que crea reservas vía /api/bookings.
-- (Complementa a security-hardening.sql)
-- =============================================

-- BOOKINGS: las reservas ahora se crean solo vía /api/bookings (service role),
-- que valida y manda el aviso por email al conductor. Sin esta política el
-- cliente ya no puede insertar directo contra PostgREST.
DROP POLICY IF EXISTS "Authenticated users can create bookings" ON public.bookings;
REVOKE INSERT ON public.bookings FROM anon, authenticated;
