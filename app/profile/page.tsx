import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Star, MapPin, Calendar, Phone, User } from "lucide-react";
import type { Review, Trip } from "@/types";
import { ProfileEditForm } from "./ProfileEditForm";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?redirect=/profile");

  const [{ data: profile }, { data: trips }, { data: reviews }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase
        .from("trips")
        .select("*")
        .eq("driver_id", user.id)
        .order("departure_date", { ascending: false })
        .limit(10),
      supabase
        .from("reviews")
        .select("*, reviewer:profiles!reviewer_id(*)")
        .eq("reviewed_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10),
    ]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="font-sora font-bold text-3xl text-gray-900 mb-8">Mi perfil</h1>

      {/* Profile card */}
      <div className="card mb-6">
        <div className="flex items-start gap-5 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center text-green-700 font-bold text-2xl font-sora shrink-0">
            {profile?.full_name?.charAt(0).toUpperCase() ?? <User size={28} />}
          </div>
          <div className="flex-1">
            <h2 className="font-sora font-bold text-xl text-gray-900">
              {profile?.full_name}
            </h2>
            <p className="text-gray-500 text-sm">{user.email}</p>
            {profile?.phone && (
              <p className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                <Phone size={13} />
                {profile.phone}
              </p>
            )}
            {profile?.avg_rating > 0 && (
              <div className="flex items-center gap-1 mt-2">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star
                    key={s}
                    size={14}
                    className={
                      s <= Math.round(profile.avg_rating)
                        ? "text-amber-400 fill-amber-400"
                        : "text-gray-200 fill-gray-200"
                    }
                  />
                ))}
                <span className="text-sm font-medium text-gray-600 ml-1">
                  {profile.avg_rating.toFixed(1)}
                </span>
                <span className="text-xs text-gray-400">
                  ({profile.total_reviews} reseña{profile.total_reviews !== 1 ? "s" : ""})
                </span>
              </div>
            )}
          </div>
        </div>
        <ProfileEditForm profile={profile} />
      </div>

      {/* My trips */}
      <div className="card mb-6">
        <h3 className="font-sora font-semibold text-gray-800 mb-4">Mis viajes publicados</h3>
        {trips && trips.length > 0 ? (
          <div className="space-y-3">
            {(trips as Trip[]).map((trip) => (
              <a
                key={trip.id}
                href={`/trips/${trip.id}`}
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
              >
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
                    <MapPin size={13} className="text-green-600" />
                    {trip.origin} → {trip.destination}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} />
                    {format(new Date(trip.departure_date), "dd/MM/yy")}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      trip.status === "active"
                        ? "bg-green-100 text-green-700"
                        : trip.status === "cancelled"
                        ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {trip.status === "active"
                      ? "Activo"
                      : trip.status === "cancelled"
                      ? "Cancelado"
                      : "Completado"}
                  </span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">No publicaste viajes todavía.</p>
        )}
      </div>

      {/* Reviews received */}
      <div className="card">
        <h3 className="font-sora font-semibold text-gray-800 mb-4">Reseñas recibidas</h3>
        {reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            {(reviews as (Review & { reviewer: { full_name: string } })[]).map((r) => (
              <div key={r.id} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs">
                    {r.reviewer?.full_name?.charAt(0)}
                  </div>
                  <span className="font-medium text-sm text-gray-700">
                    {r.reviewer?.full_name}
                  </span>
                  <div className="flex items-center gap-0.5 ml-auto">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={12}
                        className={
                          s <= r.rating
                            ? "text-amber-400 fill-amber-400"
                            : "text-gray-200 fill-gray-200"
                        }
                      />
                    ))}
                  </div>
                </div>
                {r.comment && (
                  <p className="text-sm text-gray-600 ml-9">{r.comment}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">Sin reseñas todavía.</p>
        )}
      </div>
    </div>
  );
}
