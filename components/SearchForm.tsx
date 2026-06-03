"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { MapPin, Calendar, Search } from "lucide-react";

export function SearchForm() {
  const router = useRouter();
  const params = useSearchParams();

  const [origin, setOrigin] = useState(params.get("origin") ?? "");
  const [destination, setDestination] = useState(params.get("destination") ?? "");
  const [date, setDate] = useState(params.get("date") ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const qs = new URLSearchParams();
    if (origin) qs.set("origin", origin);
    if (destination) qs.set("destination", destination);
    if (date) qs.set("date", date);
    router.push(`/?${qs.toString()}`);
  }

  function handleClear() {
    setOrigin("");
    setDestination("");
    setDate("");
    router.push("/");
  }

  const hasFilters = origin || destination || date;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md border border-gray-100 p-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="relative">
          <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Origen"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <div className="relative">
          <MapPin size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500" />
          <input
            type="text"
            placeholder="Destino"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <div className="relative">
          <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="input-field pl-9"
          />
        </div>
        <div className="flex gap-2">
          <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2 text-sm">
            <Search size={16} />
            Buscar
          </button>
          {hasFilters && (
            <button
              type="button"
              onClick={handleClear}
              className="btn-secondary text-sm px-3"
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
