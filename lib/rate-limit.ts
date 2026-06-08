import { createClient } from "@/lib/supabase/server";

type RateLimitResult = { allowed: boolean; remaining: number };

export async function checkMessageLimit(userId: string): Promise<RateLimitResult> {
  const supabase = await createClient();
  const since = new Date(Date.now() - 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("messages")
    .select("*", { count: "exact", head: true })
    .eq("sender_id", userId)
    .gte("created_at", since);
  const limit = 20;
  const used = count ?? 0;
  return { allowed: used < limit, remaining: limit - used };
}

export async function checkTripLimit(userId: string): Promise<RateLimitResult> {
  const supabase = await createClient();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count } = await supabase
    .from("trips")
    .select("*", { count: "exact", head: true })
    .eq("driver_id", userId)
    .gte("created_at", since);
  const limit = 3;
  const used = count ?? 0;
  return { allowed: used < limit, remaining: limit - used };
}
