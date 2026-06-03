import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { TripCard } from "@/components/TripCard";
import { SearchForm } from "@/components/SearchForm";
import type { TripWithDriver } from "@/types";
import Link from "next/link";
import { Plus } from "lucide-react";

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

  if (params.origin) {
    query = query.ilike("origin", `%${params.origin}%`);
  }
  if (params.destination) {
    query = query.ilike("destination", `%${params.destination}%`);
  }
  if (params.date) {
    query = query.eq("departure_date", params.date);
  }

  const { data: trips } = await query;

  const { data: { user } } = await supabase.auth.getUser();

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="text-center mb-10">
        <h1 className="font-sora font-extrabold text-4xl md:text-5xl text-gray-900 mb-4 leading-tight">
          Viajá por{" "}
          <span className="text-green-600">Nueva Zelanda</span>
          <br />
          de forma inteligente
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto mb-6">
          Encontrá o publicá viajes compartidos en toda Nueva Zelanda. Ahorrá plata, conocé gente y cuidá el planeta.
        </p>
        {!user && (
          <Link href="/register" className="btn-primary inline-flex items-center gap-2">
            <Plus size={18} />
            Publicar mi viaje gratis
          </Link>
        )}
      </div>

      {/* Search */}
      <Suspense>
        <SearchForm />
      </Suspense>

      {/* Results */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-sora font-semibold text-xl text-gray-800">
            {params.origin || params.destination || params.date
              ? `${trips?.length ?? 0} viaje${(trips?.length ?? 0) !== 1 ? "s" : ""} encontrado${(trips?.length ?? 0) !== 1 ? "s" : ""}`
              : "Viajes disponibles"}
          </h2>
          {user && (
            <Link href="/trips/new" className="btn-primary text-sm flex items-center gap-1.5">
              <Plus size={15} />
              Publicar viaje
            </Link>
          )}
        </div>

        {trips && trips.length > 0 ? (
          <div className="grid gap-4">
            {(trips as TripWithDriver[]).map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-400">
            <div className="text-5xl mb-4">🚗</div>
            <p className="text-lg font-medium">No hay viajes disponibles</p>
            <p className="text-sm mt-1">
              {params.origin || params.destination || params.date
                ? "Probá con otros filtros"
                : "Sé el primero en publicar un viaje"}
            </p>
            {user && (
              <Link href="/trips/new" className="btn-primary inline-flex items-center gap-2 mt-6">
                <Plus size={16} />
                Publicar viaje
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
