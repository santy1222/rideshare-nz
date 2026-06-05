"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types";
import { Menu, X, Shield, MessageCircle, Bell } from "lucide-react";

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    let userId: string | null = null;

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) { userId = user.id; fetchProfile(user.id); fetchUnread(user.id); fetchNotifs(user.id); }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (session?.user) {
          userId = session.user.id;
          fetchProfile(session.user.id);
          fetchUnread(session.user.id);
          fetchNotifs(session.user.id);
        } else {
          userId = null;
          setProfile(null);
          setUnreadCount(0);
          setNotifCount(0);
        }
      }
    );

    const interval = setInterval(() => {
      if (userId) { fetchUnread(userId); fetchNotifs(userId); }
    }, 10000);

    return () => { subscription.unsubscribe(); clearInterval(interval); };
  }, []);

  async function fetchProfile(id: string) {
    const { data } = await supabase.from("profiles").select("*").eq("id", id).single();
    setProfile(data);
  }

  async function fetchUnread(id: string) {
    const { count } = await supabase
      .from("messages")
      .select("id", { count: "exact", head: true })
      .eq("receiver_id", id)
      .eq("read", false);
    setUnreadCount(count ?? 0);
  }

  async function fetchNotifs(id: string) {
    const { count } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", id)
      .eq("read", false);
    setNotifCount(count ?? 0);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/">
          <Image src="/logo.svg" alt="RideShare NZ" height={36} width={160} className="object-contain" priority />
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
              <Link href="/messages" className="relative text-sm px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5">
                <MessageCircle size={14} />
                Mensajes
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-brand-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium leading-none">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <Link href="/notifications" className="relative text-sm px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5">
                <Bell size={14} />
                {notifCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium leading-none">
                    {notifCount}
                  </span>
                )}
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
        <button
          className="md:hidden p-2 text-gray-500 min-w-[44px] min-h-[44px] flex items-center justify-center"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 py-2 flex flex-col">
          {user ? (
            <>
              <Link
                href="/trips/new"
                onClick={() => setMenuOpen(false)}
                className="font-medium text-brand-500 py-3 border-b border-gray-50 flex items-center min-h-[52px]"
              >
                + Publicar viaje
              </Link>
              <Link
                href="/messages"
                onClick={() => setMenuOpen(false)}
                className="font-medium text-gray-700 py-3 border-b border-gray-50 flex items-center gap-2 min-h-[52px]"
              >
                <MessageCircle size={15} />
                Mensajes
                {unreadCount > 0 && (
                  <span className="bg-brand-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <Link
                href="/notifications"
                onClick={() => setMenuOpen(false)}
                className="font-medium text-gray-700 py-3 border-b border-gray-50 flex items-center gap-2 min-h-[52px]"
              >
                <Bell size={15} />
                Notificaciones
                {notifCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                    {notifCount}
                  </span>
                )}
              </Link>
              <Link
                href="/profile"
                onClick={() => setMenuOpen(false)}
                className="font-medium text-gray-700 py-3 border-b border-gray-50 flex items-center min-h-[52px]"
              >
                Mi perfil
              </Link>
              {profile?.role === "admin" && (
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="font-medium text-purple-600 py-3 border-b border-gray-50 flex items-center min-h-[52px]"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="text-left font-medium text-red-500 py-3 flex items-center min-h-[52px]"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="font-medium text-gray-700 py-3 border-b border-gray-50 flex items-center min-h-[52px]"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="font-medium text-brand-500 py-3 flex items-center min-h-[52px]"
              >
                Registrarse
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
