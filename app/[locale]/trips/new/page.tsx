"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { MapPin, Calendar, Clock, Users, DollarSign, FileText } from "lucide-react";
import { useTranslations } from "next-intl";
import { validateDescription } from "@/lib/validation";
import { NZ_CITIES } from "@/lib/cities";

export default function NewTripPage() {
  const t = useTranslations("NewTrip");
  const tv = useTranslations("Validation");
  const router = useRouter();

  const [form, setForm] = useState({
    origin: "",
    destination: "",
    departure_date: "",
    departure_time: "",
    seats_available: "1",
    price: "",
    description: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.origin === form.destination) {
      setError(t("sameLocationError"));
      return;
    }
    const descErr = validateDescription(form.description);
    if (descErr) { setError(tv(descErr as Parameters<typeof tv>[0])); return; }

    setLoading(true);

    const res = await fetch("/api/trips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const json = await res.json();

    if (res.status === 429) {
      setError(tv("rateLimited"));
      setLoading(false);
      return;
    }
    if (!res.ok) {
      setError(`${t("errorPrefix")}${json.error ?? res.statusText}`);
      setLoading(false);
      return;
    }

    router.push(`/trips/${json.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-display font-semibold text-3xl text-gray-900">{t("title")}</h1>
        <p className="text-gray-500 mt-1">{t("subtitle")}</p>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <MapPin size={14} className="text-gray-400" />
                {t("origin")} <span className="text-red-400">*</span>
              </label>
              <select required value={form.origin} onChange={(e) => update("origin", e.target.value)} className="input-field">
                <option value="">{t("originPlaceholder")}</option>
                {NZ_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <MapPin size={14} className="text-brand-500" />
                {t("destination")} <span className="text-red-400">*</span>
              </label>
              <select required value={form.destination} onChange={(e) => update("destination", e.target.value)} className="input-field">
                <option value="">{t("destinationPlaceholder")}</option>
                {NZ_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Calendar size={14} className="text-gray-400" />
                {t("departureDate")} <span className="text-red-400">*</span>
              </label>
              <input
                type="date"
                required
                min={new Date().toISOString().split("T")[0]}
                value={form.departure_date}
                onChange={(e) => update("departure_date", e.target.value)}
                className="input-field"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Clock size={14} className="text-gray-400" />
                {t("departureTime")} <span className="text-red-400">*</span>
              </label>
              <input
                type="time"
                required
                value={form.departure_time}
                onChange={(e) => update("departure_time", e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Users size={14} className="text-gray-400" />
                {t("seats")} <span className="text-red-400">*</span>
              </label>
              <select required value={form.seats_available} onChange={(e) => update("seats_available", e.target.value)} className="input-field">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <DollarSign size={14} className="text-gray-400" />
                {t("price")}
              </label>
              <input
                type="number"
                min="0"
                step="0.50"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                placeholder={t("pricePlaceholder")}
                className="input-field"
              />
              {!form.price && (
                <p className="text-xs text-gray-400 mt-1">{t("priceHint")}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <FileText size={14} className="text-gray-400" />
              {t("description")}
            </label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder={t("descriptionPlaceholder")}
              rows={3}
              maxLength={500}
              className="input-field resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => router.back()} className="btn-secondary flex-1">
              {t("cancel")}
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? t("posting") : t("post")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
