"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

interface Props {
  tripId: string;
  status: string;
}

export function AdminTripActions({ tripId, status }: Props) {
  const t = useTranslations("Admin");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function cancelTrip() {
    if (!confirm(t("cancelTripConfirm"))) return;
    setLoading(true);
    await fetch(`/api/admin/trips/${tripId}`, { method: "PATCH" });
    router.refresh();
    setLoading(false);
  }

  async function deleteTrip() {
    if (!confirm(t("deleteTripConfirm"))) return;
    setLoading(true);
    await fetch(`/api/admin/trips/${tripId}`, { method: "DELETE" });
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-2">
      {status === "active" && (
        <button
          onClick={cancelTrip}
          disabled={loading}
          className="text-xs px-2 py-1 rounded-lg font-medium bg-orange-100 text-orange-700 hover:bg-orange-200 transition-colors disabled:opacity-50"
        >
          {t("cancelTrip")}
        </button>
      )}
      <button
        onClick={deleteTrip}
        disabled={loading}
        className="text-xs px-2 py-1 rounded-lg font-medium bg-red-100 text-red-600 hover:bg-red-200 transition-colors disabled:opacity-50"
      >
        {t("delete")}
      </button>
    </div>
  );
}
