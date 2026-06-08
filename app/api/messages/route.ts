import { createClient } from "@/lib/supabase/server";
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

  const { allowed, remaining } = await checkMessageLimit(user.id);
  if (!allowed) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const { error } = await supabase.from("messages").insert({
    trip_id,
    sender_id: user.id,
    receiver_id,
    content: content.trim(),
  });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true, remaining });
}
