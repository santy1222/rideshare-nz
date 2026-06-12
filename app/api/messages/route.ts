import { createClient, createAdminClient } from "@/lib/supabase/server";
import { checkMessageLimit } from "@/lib/rate-limit";
import { validateMessage } from "@/lib/validation";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const { trip_id, receiver_id, content } = body as Record<string, unknown>;

  if (typeof content !== "string" || typeof trip_id !== "string" || typeof receiver_id !== "string") {
    return NextResponse.json({ error: "Invalid fields" }, { status: 422 });
  }

  const validationKey = validateMessage(content);
  if (validationKey) return NextResponse.json({ error: validationKey }, { status: 422 });

  // Solo participantes del viaje: el conductor puede escribirle a sus pasajeros
  // confirmados, y cualquier usuario puede escribirle al conductor del viaje.
  const adminSupabase = await createAdminClient();
  const { data: trip } = await adminSupabase.from("trips").select("driver_id").eq("id", trip_id).single();
  if (!trip) return NextResponse.json({ error: "Trip not found" }, { status: 404 });

  if (receiver_id === user.id) {
    return NextResponse.json({ error: "Invalid receiver" }, { status: 422 });
  }
  if (user.id === trip.driver_id) {
    const { data: bookingExists } = await adminSupabase
      .from("bookings").select("id").eq("trip_id", trip_id).eq("passenger_id", receiver_id).maybeSingle();
    if (!bookingExists) return NextResponse.json({ error: "Invalid receiver" }, { status: 422 });
  } else if (receiver_id !== trip.driver_id) {
    return NextResponse.json({ error: "Invalid receiver" }, { status: 422 });
  }

  const { allowed, remaining } = await checkMessageLimit(user.id);
  if (!allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const { error } = await adminSupabase.from("messages").insert({
    trip_id,
    sender_id: user.id,
    receiver_id,
    content: content.trim(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, remaining });
}
