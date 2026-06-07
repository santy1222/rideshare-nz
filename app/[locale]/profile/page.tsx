import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { format } from "date-fns";
import { Star, MapPin, Calendar, Phone } from "lucide-react";
import type { Review, Trip, Booking } from "@/types";
import { ProfileEditForm } from "./ProfileEditForm";
import { CancelBookingButton } from "./CancelBookingButton";
import { Link } from "@/i18n/navigation";
import { Avatar } from "@/components/Avatar";
import { getTranslations } from "next-intl/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/profile");

  const t = await getTranslations("Profile");

  const [{ data: profile }, { data: trips }, { data: bookings }, { data: reviews }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase
        .from("trips")
        .select("*")
        .eq("driver_id", user.id)
        .order("departure_date", { ascending: false })
        .limit(10),
      supabase
        .from("bookings")
        .select("*, trip:trips(id, origin, destination, departure_date, departure_time, status, driver_id)")
        .eq("passenger_id", user.id)
        .eq("status", "confirmed")
        .order("created_at", { ascending: false })
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
      <h1 className="font-display font-semibold text-3xl text-gray-900 mb-8">{t("title")}</h1>

      <div className="card mb-6">
        <div className="flex items-start gap-5 mb-6">
          <Avatar name={profile?.full_name ?? "?"} avatarUrl={profile?.avatar_url} size="xl" className="rounded-2xl" />
          <div className="flex-1">
            <h2 className="font-display font-semibold text-xl text-gray-900">{profile?.full_name}</h2>
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
                    className={s <= Math.round(profile.avg_rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}
                  />
                ))}
                <span className="text-sm font-medium text-gray-600 ml-1">{profile.avg_rating.toFixed(1)}</span>
                <span className="text-xs text-gray-400">
                  ({t("reviews", { count: profile.total_reviews })})
                </span>
              </div>
            )}
          </div>
        </div>
        <ProfileEditForm profile={profile} />
      </div>

      <div className="card mb-6">
        <h3 className="font-display font-semibold text-gray-800 mb-4">{t("myTrips")}</h3>
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
                    <MapPin size={13} className="text-brand-500" />
                    {trip.origin} → {trip.destination}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Calendar size={13} />
                    {format(new Date(trip.departure_date), "dd/MM/yy")}
                  </span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    trip.status === "active" ? "bg-green-100 text-green-700"
                      : trip.status === "cancelled" ? "bg-red-100 text-red-600"
                      : "bg-gray-100 text-gray-600"
                  }`}>
                    {trip.status === "active" ? t("statusActive")
                      : trip.status === "cancelled" ? t("statusCancelled")
                      : t("statusCompleted")}
                  </span>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">{t("noMyTrips")}</p>
        )}
      </div>

      <div className="card mb-6">
        <h3 className="font-display font-semibold text-gray-800 mb-4">{t("joinedTrips")}</h3>
        {bookings && bookings.length > 0 ? (
          <div className="space-y-3">
            {(bookings as (Booking & { trip: Pick<Trip, "id" | "origin" | "destination" | "departure_date" | "departure_time" | "status" | "driver_id"> | null })[]).filter((b) => b.trip !== null).map((b) => (
              <div key={b.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-100 gap-2">
                <Link
                  href={`/trips/${b.trip.id}`}
                  className="flex-1 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 hover:text-brand-700 transition-colors"
                >
                  <div className="flex items-center gap-1 text-sm font-medium text-gray-700">
                    <MapPin size={13} className="text-brand-500 shrink-0" />
                    {b.trip.origin} → {b.trip.destination}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      {format(new Date(b.trip.departure_date), "dd/MM/yy")}
                    </span>
                    <span className="text-xs text-gray-400">{b.trip.departure_time.slice(0, 5)}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      b.trip.status === "active" ? "bg-brand-50 text-brand-700"
                        : b.trip.status === "cancelled" ? "bg-red-100 text-red-600"
                        : "bg-gray-100 text-gray-600"
                    }`}>
                      {b.trip.status === "active" ? t("statusConfirmed")
                        : b.trip.status === "cancelled" ? t("statusCancelled")
                        : t("statusCompleted")}
                    </span>
                  </div>
                </Link>
                {b.trip.status === "active" && (
                  <CancelBookingButton
                    bookingId={b.id}
                    driverId={b.trip.driver_id}
                    tripRoute={`${b.trip.origin} → ${b.trip.destination}`}
                    passengerName={profile?.full_name ?? ""}
                  />
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">{t("noJoinedTrips")}</p>
        )}
      </div>

      <div className="card">
        <h3 className="font-display font-semibold text-gray-800 mb-4">{t("receivedReviews")}</h3>
        {reviews && reviews.length > 0 ? (
          <div className="space-y-4">
            {(reviews as (Review & { reviewer: { full_name: string } })[]).map((r) => (
              <div key={r.id} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-2 mb-1.5">
                  <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs">
                    {r.reviewer?.full_name?.charAt(0)}
                  </div>
                  <span className="font-medium text-sm text-gray-700">{r.reviewer?.full_name}</span>
                  <div className="flex items-center gap-0.5 ml-auto">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star key={s} size={12} className={s <= r.rating ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"} />
                    ))}
                  </div>
                </div>
                {r.comment && <p className="text-sm text-gray-600 ml-9">{r.comment}</p>}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm">{t("noReviews")}</p>
        )}
      </div>
    </div>
  );
}
