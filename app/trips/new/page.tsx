"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { MapPin, Calendar, Clock, Users, DollarSign, FileText } from "lucide-react";

const NZ_CITIES = [
  "Auckland", "Wellington", "Christchurch", "Hamilton", "Tauranga",
  "Napier-Hastings", "Dunedin", "Palmerston North", "Nelson", "Rotorua",
  "New Plymouth", "Whangarei", "Invercargill", "Whanganui", "Gisborne",
  "Queenstown", "Timaru", "Blenheim", "Masterton", "Levin",
];

export default function NewTripPage() {
  const router = useRouter();
  const supabase = createClient();

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
      setError("El origen y destino deben ser diferentes");
      return;
    }

    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/login");
      return;
    }

    const { data, error: insertError } = await supabase
      .from("trips")
      .insert({
        driver_id: user.id,
        origin: form.origin,
        destination: form.destination,
        departure_date: form.departure_date,
        departure_time: form.departure_time,
        seats_available: parseInt(form.seats_available),
        price: form.price ? parseFloat(form.price) : null,
        description: form.description || null,
        status: "active",
      })
      .select()
      .single();

    if (insertError) {
      setError("Error al publicar el viaje. Intentá de nuevo.");
      setLoading(false);
      return;
    }

    router.push(`/trips/${data.id}`);
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="font-sora font-bold text-3xl text-gray-900">Publicar viaje</h1>
        <p className="text-gray-500 mt-1">Completá los datos de tu viaje</p>
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
                Origen <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={form.origin}
                onChange={(e) => update("origin", e.target.value)}
                className="input-field"
              >
                <option value="">Seleccioná ciudad</option>
                {NZ_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <MapPin size={14} className="text-green-500" />
                Destino <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={form.destination}
                onChange={(e) => update("destination", e.target.value)}
                className="input-field"
              >
                <option value="">Seleccioná ciudad</option>
                {NZ_CITIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Calendar size={14} className="text-gray-400" />
                Fecha de salida <span className="text-red-400">*</span>
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
                Hora de salida <span className="text-red-400">*</span>
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
                Asientos disponibles <span className="text-red-400">*</span>
              </label>
              <select
                required
                value={form.seats_available}
                onChange={(e) => update("seats_available", e.target.value)}
                className="input-field"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <DollarSign size={14} className="text-gray-400" />
                Precio por persona (NZD)
              </label>
              <input
                type="number"
                min="0"
                step="0.50"
                value={form.price}
                onChange={(e) => update("price", e.target.value)}
                placeholder="Dejá vacío si es a coordinar"
                className="input-field"
              />
              {!form.price && (
                <p className="text-xs text-gray-400 mt-1">
                  Sin precio → aparecerá como &quot;a coordinar&quot;
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
              <FileText size={14} className="text-gray-400" />
              Descripción adicional
            </label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Ej: Salida puntual, auto cómodo, podemos hacer paradas..."
              rows={3}
              className="input-field resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.back()}
              className="btn-secondary flex-1"
            >
              Cancelar
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? "Publicando..." : "Publicar viaje"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
