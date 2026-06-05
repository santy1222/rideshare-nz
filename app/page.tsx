import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { TripCard } from "@/components/TripCard";
import { SearchForm } from "@/components/SearchForm";
import type { TripWithDriver } from "@/types";
import Link from "next/link";

interface PageProps {
  searchParams: Promise<{ origin?: string; destination?: string; date?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();

  let query = supabase
    .from("trips")
    .select("*, profiles(*)")
    .eq("status", "active")
    .order("departure_date", { ascending: true });

  if (params.origin) query = query.ilike("origin", `%${params.origin}%`);
  if (params.destination) query = query.ilike("destination", `%${params.destination}%`);
  if (params.date) query = query.eq("departure_date", params.date);

  const { data: trips } = await query;
  const { data: { user } } = await supabase.auth.getUser();

  const isSearching = params.origin || params.destination || params.date;

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Hero */}
      <div className="bg-gradient-to-br from-brand-50 to-brand-100 px-4 py-10 text-center">
        <div className="inline-flex items-center gap-1.5 text-xs text-brand-700 bg-white border border-brand-100 rounded-full px-3 py-1 mb-4">
          🌿 Viajá juntos, compartí gastos
        </div>
        <h1 className="font-display font-semibold text-3xl text-brand-900 mb-2 leading-tight">
          Tu próximo viaje,<br />a mitad de precio
        </h1>
        <p className="text-brand-700 text-sm mb-6">Viajes compartidos por toda Nueva Zelanda</p>

        <Suspense>
          <SearchForm />
        </Suspense>
      </div>

      {/* Stats bar */}
      <div className="bg-white border-b border-gray-100 py-2.5 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-6 text-sm text-gray-400">
          <span>🚗 <strong className="text-gray-700">{trips?.length ?? 0}</strong> viajes disponibles</span>
          <span>🇳🇿 <strong className="text-gray-700">Nueva Zelanda</strong></span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-base text-gray-900">
            {isSearching ? "Resultados de búsqueda" : "Viajes disponibles"}
          </h2>
          {user && (
            <Link href="/trips/new" className="btn-primary text-sm">
              + Publicar viaje
            </Link>
          )}
        </div>

        {trips && trips.length > 0 ? (
          <div className="space-y-3">
            {(trips as TripWithDriver[]).map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <div className="text-center py-14 text-gray-400">
            <div className="text-4xl mb-3">🚗</div>
            <div className="font-medium text-gray-500 mb-1">No hay viajes disponibles</div>
            <div className="text-sm">
              {isSearching ? "Probá con otros filtros" : "¿Por qué no publicás el tuyo?"}
            </div>
          </div>
        )}

        {/* Publish CTA */}
        <div className="mt-6 bg-white border border-gray-100 rounded-xl p-5 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-semibold text-sm text-gray-900 mb-1">¿Viajás pronto?</h3>
            <p className="text-xs text-gray-400">Publicá tu viaje y compartí gastos con otros</p>
          </div>
          <Link
            href={user ? "/trips/new" : "/register"}
            className="flex-shrink-0 btn-primary text-sm"
          >
            + Publicar viaje
          </Link>
        </div>
      </div>
    </div>
  );
}
