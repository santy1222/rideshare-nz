import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import {
  MapPin, Calendar, Clock, Users, DollarSign, Phone,
  Star, Lock, ArrowLeft
} from "lucide-react";
import Link from "next/link";
import type { Review, Booking, Profile } from "@/types";
import { Avatar } from "@/components/Avatar";
import { ReviewForm } from "./ReviewForm";
import { BookingButton } from "./BookingButton";
import { ContactForm } from "./ContactForm";

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

  const [{ data: reviews }, { data: booking }, { data: existingMessage }, { data: passengers }, { data: userProfile }] =
    await Promise.all([
      supabase
        .from("reviews")
        .select("*, reviewer:profiles!reviewer_id(*)")
        .eq("reviewed_id", trip.driver_id)
        .order("created_at", { ascending: false })
        .limit(5),
      user
        ? supabase
            .from("bookings")
            .select("id")
            .eq("trip_id", id)
            .eq("passenger_id", user.id)
            .eq("status", "confirmed")
            .maybeSingle()
        : Promise.resolve({ data: null }),
      user
        ? supabase
            .from("messages")
            .select("id")
            .eq("trip_id", id)
            .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
            .limit(1)
            .maybeSingle()
        : Promise.resolve({ data: null }),
      supabase
        .from("bookings")
        .select("*, passenger:profiles!passenger_id(full_name, phone, avatar_url)")
        .eq("trip_id", id)
        .eq("status", "confirmed"),
      user
        ? supabase.from("profiles").select("full_name").eq("id", user.id).single()
        : Promise.resolve({ data: null }),
    ]);

  const driver = trip.profiles;
  const isOwner = user?.id === trip.driver_id;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <Link
        href="/"
        className="flex items-center gap-2 text-gray-500 hover:text-brand-700 mb-6 font-medium transition-colors"
      >
        <ArrowLeft size={18} />
        Volver a viajes
      </Link>

      <div className="card mb-6">
        {/* Route + price */}
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <div className="flex items-center gap-2 bg-brand-50 px-3 py-2 rounded-xl min-w-0">
                <MapPin size={15} className="text-brand-500 shrink-0" />
                <span className="font-display font-semibold text-brand-900 text-base sm:text-lg truncate">
                  {trip.origin}
                </span>
              </div>
              <span className="text-xl text-gray-400">→</span>
              <div className="flex items-center gap-2 bg-brand-50 px-3 py-2 rounded-xl min-w-0">
                <MapPin size={15} className="text-brand-500 shrink-0" />
                <span className="font-display font-semibold text-brand-900 text-base sm:text-lg truncate">
                  {trip.destination}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} className="text-gray-400" />
                {format(new Date(trip.departure_date), "EEEE, dd 'de' MMMM yyyy")}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock size={14} className="text-gray-400" />
                {trip.departure_time.slice(0, 5)}
              </span>
              <span className="flex items-center gap-1.5">
                <Users size={14} className="text-gray-400" />
                {trip.seats_available} asiento{trip.seats_available !== 1 ? "s" : ""} disponible{trip.seats_available !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          <div className="sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end gap-2 sm:gap-0">
            {trip.price != null ? (
              <div className="text-brand-500 font-bold font-display text-3xl flex items-start gap-0.5">
                <DollarSign size={20} className="mt-1" />
                {trip.price}
              </div>
            ) : (
              <div className="text-gray-400 italic text-lg">a coordinar</div>
            )}
            <p className="text-xs text-gray-400">por persona</p>
          </div>
        </div>

        {/* Description */}
        {trip.description && (
          <div className="bg-gray-50 rounded-xl p-4 mb-6">
            <p className="text-gray-600 text-sm leading-relaxed">{trip.description}</p>
          </div>
        )}

        {/* Driver info */}
        <div className="border-t border-gray-100 pt-5">
          <h3 className="font-display font-semibold text-gray-800 mb-4">Conductor</h3>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-3">
              <Avatar name={driver?.full_name ?? "?"} avatarUrl={driver?.avatar_url} size="lg" />
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

            {user ? (
              driver?.phone ? (
                <a
                  href={`tel:${driver.phone}`}
                  className="flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors min-h-[44px]"
                >
                  <Phone size={15} />
                  {driver.phone}
                </a>
              ) : (
                <span className="text-gray-400 text-sm italic">Sin teléfono registrado</span>
              )
            ) : (
              <Link
                href={`/login?redirect=/trips/${trip.id}`}
                className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2.5 rounded-xl font-medium text-sm transition-colors min-h-[44px]"
              >
                <Lock size={14} />
                Iniciá sesión para ver el teléfono
              </Link>
            )}
          </div>
        </div>

        {/* Booking + contact (for passengers) */}
        {!isOwner && (
          <div className="border-t border-gray-100 pt-5 mt-5 space-y-3">
            {user ? (
              <>
                <BookingButton
                  tripId={trip.id}
                  userId={user.id}
                  driverId={trip.driver_id}
                  passengerName={userProfile?.full_name ?? "Un pasajero"}
                  tripRoute={`${trip.origin} → ${trip.destination}`}
                  hasBooked={!!booking}
                  isFull={trip.seats_available === 0}
                  seatsAvailable={trip.seats_available}
                />
                <ContactForm
                  tripId={trip.id}
                  userId={user.id}
                  receiverId={trip.driver_id}
                  receiverName={driver?.full_name ?? "Conductor"}
                  hasConversation={!!existingMessage}
                />
              </>
            ) : (
              <Link
                href={`/login?redirect=/trips/${trip.id}`}
                className="w-full py-3 bg-brand-500 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
              >
                Iniciá sesión para unirte al viaje
              </Link>
            )}
          </div>
        )}

        {/* Passengers list */}
        {passengers && passengers.length > 0 && (
          <div className="border-t border-gray-100 pt-5 mt-5">
            <h3 className="font-display font-semibold text-gray-800 mb-3">
              Pasajeros confirmados ({passengers.length})
            </h3>
            {user ? (
              <div className="space-y-2">
                {(passengers as (Booking & { passenger: Pick<Profile, "full_name" | "phone" | "avatar_url"> })[]).map((b) => (
                  <div key={b.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <Avatar name={b.passenger?.full_name ?? "?"} avatarUrl={b.passenger?.avatar_url} size="xs" />
                      <span className="text-sm font-medium text-gray-700">{b.passenger?.full_name}</span>
                    </div>
                    {isOwner && b.passenger?.phone && (
                      <a href={`tel:${b.passenger.phone}`} className="text-xs text-brand-500 hover:underline flex items-center gap-1">
                        <Phone size={12} />
                        {b.passenger.phone}
                      </a>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl text-sm text-gray-500">
                <Users size={15} className="text-brand-500" />
                {passengers.length} persona{passengers.length !== 1 ? "s" : ""} ya se unió{passengers.length !== 1 ? "ron" : ""} a este viaje
              </div>
            )}
          </div>
        )}

        {/* Cancel trip (for driver) */}
        {isOwner && (
          <div className="border-t border-gray-100 pt-4 mt-4">
            <CancelTripButton tripId={trip.id} />
          </div>
        )}
      </div>

      {/* Reviews section */}
      <div className="card">
        <h3 className="font-display font-semibold text-gray-800 mb-5">
          Reseñas del conductor
        </h3>

        {reviews && reviews.length > 0 ? (
          <div className="space-y-4 mb-6">
            {(reviews as (Review & { reviewer: { full_name: string } })[]).map((review) => (
              <div key={review.id} className="border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-700 font-bold text-xs">
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
          <Link href={`/login?redirect=/trips/${trip.id}`} className="text-brand-500 text-sm hover:underline">
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
