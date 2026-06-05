"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types";
import { Menu, X, Shield } from "lucide-react";

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) fetchProfile(user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) fetchProfile(session.user.id);
        else setProfile(null);
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  async function fetchProfile(id: string) {
    const { data } = await supabase.from("profiles").select("*").eq("id", id).single();
    setProfile(data);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display font-semibold text-xl text-brand-500">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 17H3a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v3"/>
            <circle cx="13" cy="17" r="2"/><circle cx="19" cy="17" r="2"/>
            <path d="M9 11l4-4 4 4M13 7v10M19 15v-3a2 2 0 0 0-2-2h-1"/>
          </svg>
          RideShare<span className="text-brand-700">.nz</span>
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs text-brand-700 bg-brand-50 border border-brand-100 rounded-full px-3 py-1">
            🇳🇿 Nueva Zelanda
          </span>

          {user ? (
            <>
              <Link href="/trips/new" className="text-sm px-4 py-1.5 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors">
                + Publicar viaje
              </Link>
              <Link href="/profile" className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                {profile?.full_name?.split(" ")[0] ?? "Mi perfil"}
              </Link>
              {profile?.role === "admin" && (
                <Link href="/admin" className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 px-2 transition-colors">
                  <Shield size={14} />
                  Admin
                </Link>
              )}
              <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-gray-600 transition-colors px-2">
                Salir
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                Iniciar sesión
              </Link>
              <Link href="/register" className="text-sm px-4 py-1.5 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors">
                Registrarse
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2 text-gray-500" onClick={() => setMenuOpen(!menuOpen)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-3">
          {user ? (
            <>
              <Link href="/trips/new" onClick={() => setMenuOpen(false)} className="font-medium text-brand-500">
                + Publicar viaje
              </Link>
              <Link href="/profile" onClick={() => setMenuOpen(false)} className="font-medium text-gray-700">
                Mi perfil
              </Link>
              {profile?.role === "admin" && (
                <Link href="/admin" onClick={() => setMenuOpen(false)} className="font-medium text-purple-600">
                  Admin
                </Link>
              )}
              <button onClick={handleLogout} className="text-left font-medium text-red-500">
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="font-medium text-gray-700">
                Iniciar sesión
              </Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} className="font-medium text-brand-500">
                Registrarse
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
