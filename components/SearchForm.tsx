"use client";

import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { CityAutocomplete } from "@/components/CityAutocomplete";

export function SearchForm() {
  const t = useTranslations("Search");
  const router = useRouter();
  const pathname = usePathname();
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
    router.push(`${pathname}?${qs.toString()}`);
  }

  function handleClear() {
    setOrigin("");
    setDestination("");
    setDate("");
    router.push("/");
  }

  const hasFilters = origin || destination || date;

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-100 p-3 max-w-2xl mx-auto grid grid-cols-1 sm:grid-cols-4 gap-2">
      <div className="flex flex-col">
        <label className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1 px-1">{t("origin")}</label>
        <CityAutocomplete
          value={origin}
          onChange={setOrigin}
          placeholder={t("originPlaceholder")}
          inputClassName="bg-gray-50"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1 px-1">{t("destination")}</label>
        <CityAutocomplete
          value={destination}
          onChange={setDestination}
          placeholder={t("destinationPlaceholder")}
          inputClassName="bg-gray-50"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1 px-1">{t("date")}</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input-field bg-gray-50"
        />
      </div>
      <div className="flex gap-2 sm:mt-auto">
        <button type="submit" className="btn-primary flex-1 text-sm">
          🔍 {t("search")}
        </button>
        {hasFilters && (
          <button type="button" onClick={handleClear} className="btn-secondary text-sm px-3">
            ✕
          </button>
        )}
      </div>
    </form>
  );
}
