import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import {
  MapPin, Calendar, Clock, Users, DollarSign, Phone,
  Star, Lock, ArrowLeft
} from "lucide-react";
import Link from "next/link";
import type { Review } from "@/types";
import { ReviewForm } from "./ReviewForm";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TripDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: trip } = await supabase
    .from("trips")
    .select("*, profiles(*)")
    .eq("id", id)
    .single();

  if (!trip) notFound();

  const { data: { user } } = await supabase.auth.getUser();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("*, reviewer:profiles!reviewer_id(*)")
    .eq("reviewed_id", trip.driver_id)
    .order("created_at", { ascending: false })
    .limit(5);

  const driver = trip.profiles;
  const isOwner = user?.id === trip.driver_id;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="flex items-center gap-2 text-gray-500 hover:text-green-700 mb-6 font-medium transition-colors"
      >
        <ArrowLeft size={18} />
        Volver a viajes
      </Link>

      <div className="card mb-6">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-xl">
                <MapPin size={16} className="text-green-600" />
                <span className="font-sora font-semibold text-green-800 text-lg">
                  {trip.origin}
                </span>
              </div>
              <span className="text-2xl text-gray-400">→</span>
              <div className="flex items-center gap-2 bg-green-50 px-4 py-2 rounded-xl">
                <MapPin size={16} className="text-green-600" />
                <span className="font-sora font-semibold text-green-800 text-lg">
                  {trip.destination}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <Calendar size={15} className="text-gray-400" />
                {format(new Date(trip.departure_date), "EEEE, dd 'de' MMMM yyyy")}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={15} className="text-gray-400" />
                {trip.departure_time.slice(0, 5)}
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={15} className="text-gray-400" />
                {trip.seats_available} asiento{trip.seats_available !== 1 ? "s" : ""} disponible{trip.seats_available !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="text-right shrink-0">
            {trip.price != null ? (
              <div className="text-green-700 font-bold font-sora text-3xl flex items-start gap-0.5">
                <DollarSign size={20} className="mt-1" />
                {trip.price}
              </div>
            ) : (
              <div className="text-gray-400 italic text-lg">a coordinar</div>
            )}
            <p className="text-xs text-gray-400">por persona</p>
          </div>
        </div>

        {trip.description && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-gray-600 text-sm leading-relaxed">{trip.description}</p>
          </div>
        )}

        {/* Driver info */}
        <div className="border-t border-gray-100 pt-5">
          <h3 className="font-sora font-semibold text-gray-800 mb-4">Conductor</h3>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xl font-sora">
                {driver?.full_name?.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{driver?.full_name}</p>
                {driver?.avg_rating > 0 && (
                  <div className="flex items-center gap-1 mt-0.5">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={13}
                        className={
                          s <= Math.round(driver.avg_rating)
                            ? "text-amber-400 fill-amber-400"
                            : "text-gray-200 fill-gray-200"
                        }
                      />
                    ))}
                    <span className="text-xs text-gray-500 ml-1">
                      ({driver.total_reviews})
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Phone - only for logged in users */}
            <div>
              {user ? (
                driver?.phone ? (
                  <a
                    href={`tel:${driver.phone}`}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors"
                  >
                    <Phone size={15} />
                    {driver.phone}
                  </a>
                ) : (
                  <span className="text-gray-400 text-sm italic">Sin teléfono registrado</span>
                )
              ) : (
                <Link
                  href="/login"
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors"
                >
                  <Lock size={14} />
                  Iniciá sesión para ver el teléfono
                </Link>
              )}
            </div>
          </div>
        </div>

        {isOwner && (
          <div className="border-t border-gray-100 pt-4 mt-4">
            <CancelTripButton tripId={trip.id} />
          </div>
        )}
      </div>

      {/* Reviews section */}
      <div className="card">
        <h3 className="font-sora font-semibold text-gray-800 mb-5">
          Reseñas del conductor
        </h3>

        {reviews && reviews.length > 0 ? (
          <div className="space-y-4 mb-6">
            {(reviews as (Review & { reviewer: { full_name: string } })[]).map((review) => (
              <div key={review.id} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-xs">
                    {review.reviewer?.full_name?.charAt(0)}
                  </div>
                  <span className="font-medium text-sm text-gray-700">
                    {review.reviewer?.full_name}
                  </span>
                  <div className="flex items-center gap-0.5 ml-auto">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        size={12}
                        className={
                          s <= review.rating
                            ? "text-amber-400 fill-amber-400"
                            : "text-gray-200 fill-gray-200"
                        }
                      />
                    ))}
                  </div>
                </div>
                {review.comment && (
                  <p className="text-sm text-gray-600 ml-9">{review.comment}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-400 text-sm mb-6">Sin reseñas todavía</p>
        )}

        {user && !isOwner && (
          <ReviewForm tripId={trip.id} reviewedId={trip.driver_id} userId={user.id} />
        )}

        {!user && (
          <Link href="/login" className="text-green-600 text-sm hover:underline">
            Iniciá sesión para dejar una reseña
          </Link>
        )}
      </div>
    </div>
  );
}

function CancelTripButton({ tripId }: { tripId: string }) {
  return (
    <form action={`/api/trips/${tripId}/cancel`} method="POST">
      <button
        type="submit"
        className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
      >
        Cancelar viaje
      </button>
    </form>
  );
}
