import { createClient, createAdminClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Shield, Users, Car } from "lucide-react";
import type { Profile, Trip } from "@/types";
import { AdminActions } from "./AdminActions";

export default async function AdminPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: me } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (me?.role !== "admin") redirect("/");

  const adminSupabase = await createAdminClient();

  const [{ data: profiles }, { data: trips }] = await Promise.all([
    adminSupabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false }),
    adminSupabase
      .from("trips")
      .select("*, profiles(*)")
      .order("created_at", { ascending: false })
      .limit(50),
  ]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="bg-purple-100 p-3 rounded-xl">
          <Shield size={24} className="text-purple-600" />
        </div>
        <div>
          <h1 className="font-display font-semibold text-2xl text-gray-900">Panel de administración</h1>
          <p className="text-gray-500 text-sm">Gestión de usuarios y viajes</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Usuarios totales", value: profiles?.length ?? 0, icon: Users, color: "blue" },
          { label: "Usuarios activos", value: profiles?.filter((p) => !p.suspended).length ?? 0, icon: Users, color: "green" },
          { label: "Usuarios suspendidos", value: profiles?.filter((p) => p.suspended).length ?? 0, icon: Users, color: "red" },
          { label: "Viajes publicados", value: trips?.length ?? 0, icon: Car, color: "purple" },
        ].map((stat) => (
          <div key={stat.label} className="card text-center">
            <p className="text-3xl font-display font-semibold text-gray-900">{stat.value}</p>
            <p className="text-xs text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Users table */}
      <div className="card mb-8">
        <h2 className="font-display font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
          <Users size={18} />
          Usuarios
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 font-medium text-gray-500">Nombre</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Teléfono</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Rating</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Rol</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Estado</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Registrado</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Acciones</th>
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
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      profile.role === "admin"
                        ? "bg-purple-100 text-purple-700"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {profile.role}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      profile.suspended
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-700"
                    }`}>
                      {profile.suspended ? "Suspendido" : "Activo"}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-gray-500 text-xs">
                    {format(new Date(profile.created_at), "dd/MM/yy")}
                  </td>
                  <td className="py-3 px-3">
                    {profile.role !== "admin" && (
                      <AdminActions
                        userId={profile.id}
                        suspended={profile.suspended}
                      />
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trips table */}
      <div className="card">
        <h2 className="font-display font-semibold text-lg text-gray-800 mb-4 flex items-center gap-2">
          <Car size={18} />
          Viajes recientes
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left py-2 px-3 font-medium text-gray-500">Ruta</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Conductor</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Fecha</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Precio</th>
                <th className="text-left py-2 px-3 font-medium text-gray-500">Estado</th>
              </tr>
            </thead>
            <tbody>
              {(trips as (Trip & { profiles: Profile })[])?.map((trip) => (
                <tr key={trip.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-3 font-medium text-gray-800">
                    {trip.origin} → {trip.destination}
                  </td>
                  <td className="py-3 px-3 text-gray-600">
                    {trip.profiles?.full_name ?? "—"}
                  </td>
                  <td className="py-3 px-3 text-gray-500">
                    {format(new Date(trip.departure_date), "dd/MM/yy")} {trip.departure_time.slice(0, 5)}
                  </td>
                  <td className="py-3 px-3 text-gray-600">
                    {trip.price != null ? `$${trip.price}` : "a coordinar"}
                  </td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      trip.status === "active"
                        ? "bg-green-100 text-green-700"
                        : trip.status === "cancelled"
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {trip.status === "active" ? "Activo" : trip.status === "cancelled" ? "Cancelado" : "Completado"}
                    </span>
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
