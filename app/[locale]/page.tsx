import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { TripCard } from "@/components/TripCard";
import { SearchForm } from "@/components/SearchForm";
import type { TripWithDriver } from "@/types";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

interface PageProps {
  searchParams: Promise<{ origin?: string; destination?: string; date?: string }>;
}

export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const t = await getTranslations("Home");

  let query = supabase
    .from("trips")
    .select("*, profiles(id, full_name, avatar_url, avg_rating, total_reviews)")
    .eq("status", "active")
    .order("departure_date", { ascending: true });

  if (params.origin) query = query.ilike("origin", `%${params.origin}%`);
  if (params.destination) query = query.ilike("destination", `%${params.destination}%`);
  if (params.date) query = query.eq("departure_date", params.date);

  const { data: trips } = await query;
  const { data: { user } } = await supabase.auth.getUser();

  const isSearching = params.origin || params.destination || params.date;

  return (
    <div className="min-h-screen bg-cream-100">
      <div className="relative overflow-hidden px-4 py-12 sm:py-20 text-center">
        <div
          aria-hidden="true"
          className="absolute inset-0 scale-105 bg-cover bg-center blur-[1.5px]"
          style={{ backgroundImage: "url('/hero-bg.jpg')" }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-cream-50/65 via-cream-50/45 to-brand-100/70"
        />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-1.5 text-xs text-brand-700 bg-cream-50/90 border border-brand-100 rounded-full px-3 py-1 mb-4 backdrop-blur-sm">
            🌿 {t("ecoTagline")}
          </div>
          <h1 className="font-display font-semibold text-2xl sm:text-3xl text-brand-900 mb-5 sm:mb-6 leading-tight px-2 [text-shadow:0_1px_8px_rgba(255,255,255,0.6)]">
            {t("subtitle")}
          </h1>
          <Suspense>
            <SearchForm />
          </Suspense>
        </div>
      </div>

      <div className="bg-cream-50 border-b border-gray-100 py-2.5 px-4">
        <div className="max-w-5xl mx-auto flex items-center justify-center gap-6 text-sm text-gray-400">
          <span>🚗 <strong className="text-gray-700">{t("tripsCount", { count: trips?.length ?? 0 })}</strong></span>
          <span>🇳🇿 <strong className="text-gray-700">{t("newZealand")}</strong></span>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-semibold text-base text-gray-900">
            {isSearching ? t("searchResults") : t("availableTrips")}
          </h2>
          {user && (
            <Link href="/trips/new" className="btn-primary text-sm">
              {t("publishTrip")}
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
            <div className="font-medium text-gray-500 mb-1">{t("noTrips")}</div>
            <div className="text-sm">
              {isSearching ? t("tryFilters") : t("whyNotYours")}
            </div>
          </div>
        )}

      </div>

      <div className="relative overflow-hidden px-4 py-16 sm:py-24">
        <div
          aria-hidden="true"
          className="absolute inset-0 scale-105 bg-cover bg-center blur-[1.5px]"
          style={{ backgroundImage: "url('/footer-bg.jpg')" }}
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-b from-cream-100/70 via-cream-50/45 to-brand-100/70"
        />
        <div className="relative z-10 max-w-2xl mx-auto bg-cream-50/90 border border-cream-100 rounded-xl p-5 flex items-center justify-between gap-4 backdrop-blur-sm shadow-sm">
          <div>
            <h3 className="font-display font-semibold text-sm text-gray-900 mb-1">{t("travelingSoon")}</h3>
            <p className="text-xs text-gray-500">{t("publishCta")}</p>
          </div>
          <Link
            href={user ? "/trips/new" : "/register"}
            className="flex-shrink-0 btn-primary text-sm"
          >
            {t("publishTrip")}
          </Link>
        </div>
      </div>
    </div>
  );
}
