import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Shield, Users, Car } from "lucide-react";
import type { Profile, Trip } from "@/types";
import { AdminActions } from "./AdminActions";
import { AdminTripActions } from "./AdminTripActions";
import { getTranslations } from "next-intl/server";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase.from("profiles").select("role").eq("id", user!.id).single();
  if (me?.role !== "admin") redirect("/");

  const t = await getTranslations("Admin");

  const adminSupabase = await createAdminClient();

  const [{ data: profiles }, { data: trips }, { data: bookingCounts }] = await Promise.all([
    adminSupabase.from("profiles").select("*").order("created_at", { ascending: false }),
    adminSupabase.from("trips").select("*, profiles(*)").order("created_at", { ascending: false }).limit(50),
    adminSupabase.from("bookings").select("trip_id").eq("status", "confirmed"),
  ]);

  const passengersByTrip = (bookingCounts ?? []).reduce<Record<string, number>>((acc, b) => {
    acc[b.trip_id] = (acc[b.trip_id] ?? 0) + 1;
    return acc;
  }, {});

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-purple-100 p-3 rounded-xl">
          <Shield size={24} className="text-purple-600" />
        </div>
        <div>
          <h1 className="font-display font-semibold text-2xl text-gray-900">{t("title")}</h1>
          <p className="text-gray-500 text-sm">{t("subtitle")}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: t("totalUsers"), value: profiles?.length ?? 0, icon: Users },
          { label: t("activeUsers"), value: profiles?.filter((p) => !p.suspended).length ?? 0, icon: Users },
          { label: t("suspendedUsers"), value: profiles?.filter((p) => p.suspended).length ?? 0, icon: Users },
          { label: t("publishedTrips"), value: trips?.length ?? 0, icon: Car },
        ].map((stat) => (
          <div key={stat.label} className="card text-center">
            <p className="text-3xl font-display font-semibold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="card mb-8">
        <h2 className="font-display font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
          <Users size={18} />
          {t("users")}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {[t("name"), t("phone"), t("rating"), t("role"), t("status"), t("registered"), t("actions")].map((h) => (
                  <th key={h} className="text-left py-2 px-3 font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(profiles as Profile[])?.map((profile) => (
                <tr key={profile.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs">
                        {profile.full_name?.charAt(0)}
                      </div>
                      <span className="font-medium text-gray-800">{profile.full_name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-gray-500">{profile.phone ?? "—"}</td>
                  <td className="py-3 px-3 text-gray-600">
                    {profile.avg_rating > 0 ? `${profile.avg_rating.toFixed(1)} ⭐` : "—"}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${profile.role === "admin" ? "bg-purple-100 text-purple-700" : "bg-gray-100 text-gray-600"}`}>
                      {profile.role}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${profile.suspended ? "bg-red-100 text-red-600" : "bg-green-100 text-green-700"}`}>
                      {profile.suspended ? t("suspended") : t("active")}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-gray-500 text-xs">{format(new Date(profile.created_at), "dd/MM/yy")}</td>
                  <td className="py-3 px-3">
                    {profile.role !== "admin" && (
                      <AdminActions userId={profile.id} suspended={profile.suspended} />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <h2 className="font-display font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
          <Car size={18} />
          {t("recentTrips")}
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                {[t("route"), t("driver"), t("date"), t("price"), t("status"), t("passengers"), t("actions")].map((h) => (
                  <th key={h} className="text-left py-2 px-3 font-medium text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(trips as (Trip & { profiles: Profile })[])?.map((trip) => (
                <tr key={trip.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-3 font-medium text-gray-800">{trip.origin} → {trip.destination}</td>
                  <td className="py-3 px-3 text-gray-600">{trip.profiles?.full_name ?? "—"}</td>
                  <td className="py-3 px-3 text-gray-500">{format(new Date(trip.departure_date), "dd/MM/yy")} {trip.departure_time.slice(0, 5)}</td>
                  <td className="py-3 px-3 text-gray-600">{trip.price != null ? `$${trip.price}` : t("toArrange")}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      trip.status === "active" ? "bg-green-100 text-green-700"
                        : trip.status === "cancelled" ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {trip.status === "active" ? t("active") : trip.status === "cancelled" ? t("cancelled") : t("completed")}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-gray-500 text-center">
                    {passengersByTrip[trip.id] ?? 0}
                  </td>
                  <td className="py-3 px-3">
                    <AdminTripActions tripId={trip.id} status={trip.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
