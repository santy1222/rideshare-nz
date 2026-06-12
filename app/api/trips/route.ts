import { createClient, createAdminClient } from "@/lib/supabase/server";
import { checkTripLimit } from "@/lib/rate-limit";
import { validateDescription } from "@/lib/validation";
import { NextResponse } from "next/server";

const NZ_CITIES = new Set([
  "Auckland", "Wellington", "Christchurch", "Hamilton", "Tauranga",
  "Napier-Hastings", "Dunedin", "Palmerston North", "Nelson", "Rotorua",
  "New Plymouth", "Whangarei", "Invercargill", "Whanganui", "Gisborne",
  "Queenstown", "Timaru", "Blenheim", "Masterton", "Levin",
]);

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  const { origin, destination, departure_date, departure_time, seats_available, price, description } =
    body as Record<string, unknown>;

  if (!NZ_CITIES.has(origin as string) || !NZ_CITIES.has(destination as string)) {
    return NextResponse.json({ error: "Invalid city" }, { status: 422 });
  }
  if (origin === destination) {
    return NextResponse.json({ error: "sameLocation" }, { status: 422 });
  }

  const seats = Number(seats_available);
  if (!Number.isInteger(seats) || seats < 1 || seats > 8) {
    return NextResponse.json({ error: "Invalid seats" }, { status: 422 });
  }

  const priceNum = price !== undefined && price !== "" ? Number(price) : null;
  if (priceNum !== null && (isNaN(priceNum) || priceNum < 0 || priceNum > 9999)) {
    return NextResponse.json({ error: "Invalid price" }, { status: 422 });
  }

  const descKey = validateDescription((description as string) ?? "");
  if (descKey) return NextResponse.json({ error: descKey }, { status: 422 });

  const { allowed } = await checkTripLimit(user.id);
  if (!allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  // RLS ya no permite inserts directos en trips: solo esta ruta puede crear
  // viajes (con la service key) después de validar y aplicar el rate limit.
  const adminSupabase = await createAdminClient();
  const { data, error } = await adminSupabase
    .from("trips")
    .insert({
      driver_id: user.id,
      origin,
      destination,
      departure_date,
      departure_time,
      seats_available: seats,
      price: priceNum,
      description: (description as string)?.trim() || null,
      status: "active",
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ id: data.id });
}
