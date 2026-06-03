import Link from "next/link";
import { MapPin, Calendar, Clock, Users, Star, DollarSign } from "lucide-react";
import type { TripWithDriver } from "@/types";
import { format } from "date-fns";

interface Props {
  trip: TripWithDriver;
}

export function TripCard({ trip }: Props) {
  const driver = trip.profiles;

  return (
    <Link href={`/trips/${trip.id}`}>
      <div className="card hover:shadow-md hover:border-green-200 transition-all duration-200 cursor-pointer group">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex items-center gap-1.5 text-green-700 font-semibold text-sm bg-green-50 px-3 py-1 rounded-full">
                <MapPin size={13} />
                {trip.origin}
              </div>
              <span className="text-gray-400">→</span>
              <div className="flex items-center gap-1.5 text-green-700 font-semibold text-sm bg-green-50 px-3 py-1 rounded-full">
                <MapPin size={13} />
                {trip.destination}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar size={14} />
                {format(new Date(trip.departure_date), "dd/MM/yyyy")}
              </span>
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {trip.departure_time.slice(0, 5)}
              </span>
              <span className="flex items-center gap-1">
                <Users size={14} />
                {trip.seats_available} asiento{trip.seats_available !== 1 ? "s" : ""}
              </span>
            </div>

            {trip.description && (
              <p className="mt-2 text-sm text-gray-500 line-clamp-2">
                {trip.description}
              </p>
            )}
          </div>

          <div className="flex flex-col items-end gap-2 shrink-0">
            <div className="text-right">
              {trip.price != null ? (
                <span className="flex items-center gap-0.5 text-green-700 font-bold text-xl font-sora">
                  <DollarSign size={16} />
                  {trip.price}
                  <span className="text-xs font-normal text-gray-500 ml-0.5">NZD</span>
                </span>
              ) : (
                <span className="text-gray-400 text-sm italic">a coordinar</span>
              )}
            </div>

            {driver && (
              <div className="flex items-center gap-2 mt-1">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold text-sm font-sora">
                  {driver.full_name?.charAt(0).toUpperCase()}
                </div>
                <div className="text-right">
                  <p className="text-xs font-medium text-gray-700">
                    {driver.full_name}
                  </p>
                  {driver.avg_rating > 0 && (
                    <p className="flex items-center justify-end gap-0.5 text-xs text-amber-500">
                      <Star size={11} fill="currentColor" />
                      {driver.avg_rating.toFixed(1)}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
