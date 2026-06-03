"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types";
import { Menu, X, Plus, LogOut, User as UserIcon, Shield } from "lucide-react";

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
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", id)
      .single();
    setProfile(data);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <svg width="44" height="22" viewBox="0 0 60 28" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 16L17 6H40L46 16H12Z" fill="#16a34a"/>
            <path d="M18 15L21 7H29V15H18Z" fill="#86efac"/>
            <path d="M30 15V7H39L45 15H30Z" fill="#86efac"/>
            <path d="M2 16H57V21Q57 23 55 23H5Q3 23 3 21V16Z" fill="#16a34a"/>
            <rect x="55" y="17" width="3" height="2.5" rx="1.25" fill="#fef9c3"/>
            <circle cx="15" cy="23" r="5" fill="#14532d"/>
            <circle cx="15" cy="23" r="2.2" fill="#4ade80"/>
            <circle cx="44" cy="23" r="5" fill="#14532d"/>
            <circle cx="44" cy="23" r="2.2" fill="#4ade80"/>
          </svg>
          <span className="font-sora font-bold text-green-700 text-xl group-hover:text-green-800 transition-colors">
            Ride Share NZ
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/"
            className="text-gray-600 hover:text-green-700 font-medium transition-colors"
          >
            Viajes
          </Link>
          {user ? (
            <>
              <Link
                href="/trips/new"
                className="flex items-center gap-1.5 btn-primary text-sm"
              >
                <Plus size={16} />
                Publicar viaje
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-1.5 text-gray-600 hover:text-green-700 font-medium transition-colors"
              >
                <UserIcon size={16} />
                {profile?.full_name?.split(" ")[0] ?? "Mi perfil"}
              </Link>
              {profile?.role === "admin" && (
                <Link
                  href="/admin"
                  className="flex items-center gap-1.5 text-purple-600 hover:text-purple-700 font-medium transition-colors"
                >
                  <Shield size={16} />
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center gap-1.5 text-gray-500 hover:text-red-600 font-medium transition-colors"
              >
                <LogOut size={16} />
                Salir
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="text-gray-600 hover:text-green-700 font-medium transition-colors"
              >
                Iniciar sesión
              </Link>
              <Link href="/register" className="btn-primary text-sm">
                Registrarse
              </Link>
            </>
          )}
        </div>

        <button
          className="md:hidden p-2"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 flex flex-col gap-3">
          <Link href="/" onClick={() => setMenuOpen(false)} className="font-medium text-gray-700">
            Viajes
          </Link>
          {user ? (
            <>
              <Link href="/trips/new" onClick={() => setMenuOpen(false)} className="font-medium text-green-700">
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
              <button onClick={handleLogout} className="text-left font-medium text-red-600">
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="font-medium text-gray-700">
                Iniciar sesión
              </Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} className="font-medium text-green-700">
                Registrarse
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
