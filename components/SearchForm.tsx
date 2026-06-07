"use client";

import { useRouter, usePathname } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";

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
        <input
          type="text"
          value={origin}
          onChange={(e) => setOrigin(e.target.value)}
          placeholder={t("originPlaceholder")}
          className="input-field"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1 px-1">{t("destination")}</label>
        <input
          type="text"
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          placeholder={t("destinationPlaceholder")}
          className="input-field"
        />
      </div>
      <div className="flex flex-col">
        <label className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1 px-1">{t("date")}</label>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="input-field"
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
