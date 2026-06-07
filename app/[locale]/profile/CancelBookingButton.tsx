"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";

interface Props {
  bookingId: string;
  driverId: string;
  tripRoute: string;
  passengerName: string;
}

export function CancelBookingButton({ bookingId, driverId, tripRoute, passengerName }: Props) {
  const t = useTranslations("CancelBooking");
  const tNotif = useTranslations("CancelBookingNotif");
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  async function handleCancel() {
    setLoading(true);

    const { data: booking } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId)
      .select("trip_id")
      .single();

    if (booking) {
      await supabase.from("notifications").insert({
        user_id: driverId,
        type: "booking_cancelled",
        message: tNotif("message", { name: passengerName, route: tripRoute }),
        trip_id: booking.trip_id,
      });
    }

    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-gray-500">{t("confirm")}</span>
        <button
          onClick={handleCancel}
          disabled={loading}
          className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
        >
          {loading ? "..." : t("yes")}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs font-medium text-gray-400 hover:text-gray-600"
        >
          {t("no")}
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={(e) => { e.preventDefault(); setConfirming(true); }}
      className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50 shrink-0"
      title={t("title")}
    >
      <X size={13} />
      {t("cancel")}
    </button>
  );
}
