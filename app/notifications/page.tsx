import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Bell, Users } from "lucide-react";
import Link from "next/link";

export default async function NotificationsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  // Mark all as read
  await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false);

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <Bell size={22} className="text-brand-500" />
        <h1 className="font-display font-semibold text-xl text-gray-900">Notificaciones</h1>
      </div>

      {notifications && notifications.length > 0 ? (
        <div className="space-y-2">
          {notifications.map((n) => (
            <Link
              key={n.id}
              href={n.trip_id ? `/trips/${n.trip_id}` : "/notifications"}
              className="flex items-start gap-3 bg-white border border-gray-100 rounded-xl p-4 hover:border-brand-100 transition-colors"
            >
              <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center shrink-0 mt-0.5">
                <Users size={16} className="text-brand-500" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800">{n.message}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {format(new Date(n.created_at), "dd/MM/yyyy · HH:mm")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 text-gray-400">
          <Bell size={36} className="mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-500">Sin notificaciones</p>
          <p className="text-sm mt-1">Te avisaremos cuando alguien se una a tus viajes</p>
        </div>
      )}
    </div>
  );
}
