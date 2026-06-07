"use client";

import { Link } from "@/i18n/navigation";
import type { TripWithDriver } from "@/types";
import { Avatar } from "@/components/Avatar";
import { useTranslations, useLocale } from "next-intl";

interface Props {
  trip: TripWithDriver;
}

export function TripCard({ trip }: Props) {
  const t = useTranslations("TripCard");
  const locale = useLocale();
  const driver = trip.profiles;
  const isFull = trip.seats_available === 0;
  const isLow = trip.seats_available === 1;

  const dateStr = new Date(trip.departure_date).toLocaleDateString(
    locale === "en" ? "en-NZ" : "es",
    { weekday: "short", day: "numeric", month: "short" }
  );

  return (
    <Link href={`/trips/${trip.id}`}>
      <div className={`bg-white border rounded-xl p-4 hover:border-brand-200 hover:-translate-y-0.5 transition-all cursor-pointer ${isFull ? "opacity-60 border-gray-100" : "border-gray-100"}`}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="font-display font-semibold text-lg text-gray-900 truncate">{trip.origin}</span>
            <div className="flex flex-col items-center flex-1 max-w-[60px]">
              <div className="w-full h-px bg-gray-200 relative">
                <span className="absolute -right-1 -top-[5px] text-gray-300 text-base">›</span>
              </div>
            </div>
            <span className="font-display font-semibold text-lg text-gray-900 truncate">{trip.destination}</span>
          </div>
          <div className="text-right ml-4 flex-shrink-0">
            {trip.price != null ? (
              <>
                <div className="font-display font-semibold text-xl text-brand-500">${trip.price}</div>
                <div className="text-xs text-gray-400">{t("perPerson")}</div>
              </>
            ) : (
              <div className="text-sm text-gray-400 italic">{t("toArrange")}</div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar name={driver.full_name ?? "?"} avatarUrl={driver.avatar_url} size="sm" />
            <div>
              <div className="text-sm font-medium text-gray-800">{driver.full_name}</div>
              {driver.avg_rating > 0 && (
                <span className="flex items-center gap-0.5 text-xs text-gray-400">
                  <span className="text-amber-400">★</span>
                  {driver.avg_rating.toFixed(1)}
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span>📅 {dateStr}</span>
            <span>🕐 {trip.departure_time.slice(0, 5)}</span>
            {isFull ? (
              <span className="bg-red-50 text-red-600 border border-red-100 rounded-full px-2 py-0.5 font-medium">{t("full")}</span>
            ) : isLow ? (
              <span className="bg-amber-50 text-amber-700 border border-amber-100 rounded-full px-2 py-0.5 font-medium">{t("oneSeat")}</span>
            ) : (
              <span className="bg-brand-50 text-brand-700 border border-brand-100 rounded-full px-2 py-0.5 font-medium">{t("seats", { count: trip.seats_available })}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
