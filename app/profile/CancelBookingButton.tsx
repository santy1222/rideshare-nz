"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";

interface Props {
  bookingId: string;
}

export function CancelBookingButton({ bookingId }: Props) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();
  const router = useRouter();

  async function handleCancel() {
    setLoading(true);
    await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", bookingId);
    router.refresh();
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500">¿Cancelar?</span>
        <button
          onClick={handleCancel}
          disabled={loading}
          className="text-xs font-medium text-red-600 hover:text-red-700 disabled:opacity-50"
        >
          {loading ? "..." : "Sí"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs font-medium text-gray-400 hover:text-gray-600"
        >
          No
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={(e) => { e.preventDefault(); setConfirming(true); }}
      className="flex items-center gap-1 text-xs text-gray-400 hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
      title="Cancelar reserva"
    >
      <X size={13} />
      Cancelar
    </button>
  );
}
