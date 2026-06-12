import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendEmail, escapeHtml } from "@/lib/email";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const trip_id = body?.trip_id;
  if (typeof trip_id !== "string") return NextResponse.json({ error: "Invalid body" }, { status: 422 });

  const admin = await createAdminClient();
  const { data: trip } = await admin
    .from("trips")
    .select("driver_id, origin, destination, departure_date, status, seats_available")
    .eq("id", trip_id)
    .single();

  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });
  if (trip.status !== "active") return NextResponse.json({ error: "tripNotActive" }, { status: 422 });
  if (trip.driver_id === user.id) return NextResponse.json({ error: "ownTrip" }, { status: 422 });

  const { data: existing } = await admin
    .from("bookings")
    .select("id, status")
    .eq("trip_id", trip_id)
    .eq("passenger_id", user.id)
    .maybeSingle();

  if (existing?.status === "confirmed") return NextResponse.json({ ok: true });
  if (trip.seats_available < 1) return NextResponse.json({ error: "tripFull" }, { status: 422 });

  // La notificación in-app al conductor la crea el trigger after_booking_notify.
  const { error } = existing
    ? await admin.from("bookings").update({ status: "confirmed" }).eq("id", existing.id)
    : await admin.from("bookings").insert({ trip_id, passenger_id: user.id, status: "confirmed" });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  // Aviso por email al conductor (sin bloquear la reserva si falla).
  const [{ data: passenger }, { data: driverUser }] = await Promise.all([
    admin.from("profiles").select("full_name").eq("id", user.id).single(),
    admin.auth.admin.getUserById(trip.driver_id),
  ]);
  const driverEmail = driverUser?.user?.email;
  if (driverEmail) {
    const name = escapeHtml(passenger?.full_name ?? "A passenger");
    const route = `${escapeHtml(trip.origin)} → ${escapeHtml(trip.destination)}`;
    await sendEmail(
      driverEmail,
      "Someone joined your trip",
      `<p><strong>${name}</strong> joined your trip <strong>${route}</strong> (${trip.departure_date}).</p>
       <p>Log in to see the details and your passenger's contact info.</p>`
    );
  }

  return NextResponse.json({ ok: true });
}
