"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";
import { Users, CheckCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
  tripId: string;
  userId: string;
  driverId: string;
  passengerName: string;
  tripRoute: string;
  hasBooked: boolean;
  isFull: boolean;
  seatsAvailable: number;
}

export function BookingButton({
  tripId, userId, driverId, passengerName, tripRoute,
  hasBooked: initialBooked, isFull, seatsAvailable,
}: Props) {
  const t = useTranslations("Booking");
  const [loading, setLoading] = useState(false);
  const [booked, setBooked] = useState(initialBooked);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleBook() {
    setLoading(true);
    setError("");

    const { error: bookingError } = await supabase
      .from("bookings")
      .upsert(
        { trip_id: tripId, passenger_id: userId, status: "confirmed" },
        { onConflict: "trip_id,passenger_id" }
      );

    if (bookingError) {
      setError(bookingError.message || t("error"));
    } else {
      const { error: notifError } = await supabase.from("notifications").insert({
        user_id: driverId,
        message: t("notificationJoined", { name: passengerName, route: tripRoute }),
        trip_id: tripId,
      });
      if (notifError) console.error("Notification insert failed:", notifError.message);

      setBooked(true);
      router.refresh();
    }
    setLoading(false);
  }

  if (booked) {
    return (
      <div className="bg-brand-50 border border-brand-100 rounded-xl p-4 flex items-center gap-3">
        <CheckCircle size={20} className="text-brand-500 flex-shrink-0" />
        <div>
          <p className="text-brand-700 font-semibold text-sm">{t("alreadyJoined")}</p>
          <p className="text-xs text-brand-600 mt-0.5">{t("contactVisible")}</p>
        </div>
      </div>
    );
  }

  if (isFull) {
    return (
      <div className="bg-gray-50 border border-gray-100 rounded-xl p-4 text-center">
        <p className="text-gray-500 text-sm font-medium">{t("tripFull")}</p>
        <p className="text-xs text-gray-400 mt-0.5">{t("noSeats")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-1.5">
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button
        onClick={handleBook}
        disabled={loading}
        className="w-full py-3 bg-brand-500 hover:bg-brand-700 disabled:bg-brand-200 text-white font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
      >
        <Users size={16} />
        {loading
          ? t("processing")
          : `${t("joinTrip")} ${t("seatsLabel", { count: seatsAvailable })}`}
      </button>
    </div>
  );
}
