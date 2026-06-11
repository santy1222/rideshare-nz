"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import type { Profile } from "@/types";
import { Menu, X, Shield, MessageCircle, Bell } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link, useRouter, usePathname } from "@/i18n/navigation";

export function Navbar() {
  const t = useTranslations("Nav");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifCount, setNotifCount] = useState(0);
  const supabase = createClient();

  useEffect(() => {
    let userId: string | null = null;

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      if (user) { userId = user.id; fetchProfile(user.id); fetchUnread(user.id); fetchNotifs(user.id); }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
    });

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
    const { count } = await supabase.from("messages").select("id", { count: "exact", head: true }).eq("receiver_id", id).eq("read", false);
    setUnreadCount(count ?? 0);
  }

  async function fetchNotifs(id: string) {
    const { count } = await supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", id).eq("read", false);
    setNotifCount(count ?? 0);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  function switchLocale() {
    const next = locale === "en" ? "es" : "en";
    router.replace(pathname, { locale: next });
  }

  const LangToggle = () => (
    <button
      onClick={switchLocale}
      className="text-xs px-2.5 py-1 border border-gray-200 rounded-full text-gray-500 hover:text-gray-700 hover:border-gray-300 transition-colors font-medium"
      title={locale === "en" ? "Cambiar a español" : "Switch to English"}
    >
      {locale === "en"
        ? <><span className="fi fi-es rounded-sm mr-1" />ES</>
        : <><span className="fi fi-gb rounded-sm mr-1" />EN</>
      }
    </button>
  );

  return (
    <nav className="bg-cream-50 border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/">
          <Image src="/logo.svg" alt="RideShare NZ" height={36} width={160} className="object-contain" priority />
        </Link>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-xs text-brand-700 bg-brand-50 border border-brand-100 rounded-full px-3 py-1">
            🇳🇿 {t("newZealand")}
          </span>

          <LangToggle />

          {user ? (
            <>
              <Link href="/trips/new" className="text-sm px-4 py-1.5 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors">
                {t("publishTrip")}
              </Link>
              <Link href="/messages" className="relative text-sm px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-cream-100 transition-colors flex items-center gap-1.5">
                <MessageCircle size={14} />
                {t("messages")}
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-brand-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium leading-none">
                    {unreadCount}
                  </span>
                )}
              </Link>
              <Link href="/notifications" className="relative text-sm px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-cream-100 transition-colors flex items-center gap-1.5">
                <Bell size={14} />
                {t("notifications")}
                {notifCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium leading-none">
                    {notifCount}
                  </span>
                )}
              </Link>
              <Link href="/profile" className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-cream-100 transition-colors">
                {profile?.full_name?.split(" ")[0] ?? t("myProfile")}
              </Link>
              {profile?.role === "admin" && (
                <Link href="/admin" className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700 px-2 transition-colors">
                  <Shield size={14} />
                  {t("admin")}
                </Link>
              )}
              <button onClick={handleLogout} className="text-sm text-gray-400 hover:text-gray-600 transition-colors px-2">
                {t("signOut")}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-cream-100 transition-colors">
                {t("signIn")}
              </Link>
              <Link href="/register" className="text-sm px-4 py-1.5 bg-brand-500 text-white rounded-lg font-medium hover:bg-brand-700 transition-colors">
                {t("register")}
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
        <div className="md:hidden bg-cream-50 border-t border-gray-100 px-4 py-2 flex flex-col">
          <div className="py-3 border-b border-gray-50">
            <LangToggle />
          </div>
          {user ? (
            <>
              <Link href="/trips/new" onClick={() => setMenuOpen(false)} className="font-medium text-brand-500 py-3 border-b border-gray-50 flex items-center min-h-[52px]">
                {t("publishTrip")}
              </Link>
              <Link href="/messages" onClick={() => setMenuOpen(false)} className="font-medium text-gray-700 py-3 border-b border-gray-50 flex items-center gap-2 min-h-[52px]">
                <MessageCircle size={15} />
                {t("messages")}
                {unreadCount > 0 && (
                  <span className="bg-brand-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">{unreadCount}</span>
                )}
              </Link>
              <Link href="/notifications" onClick={() => setMenuOpen(false)} className="font-medium text-gray-700 py-3 border-b border-gray-50 flex items-center gap-2 min-h-[52px]">
                <Bell size={15} />
                {t("notifications")}
                {notifCount > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">{notifCount}</span>
                )}
              </Link>
              <Link href="/profile" onClick={() => setMenuOpen(false)} className="font-medium text-gray-700 py-3 border-b border-gray-50 flex items-center min-h-[52px]">
                {t("myProfile")}
              </Link>
              {profile?.role === "admin" && (
                <Link href="/admin" onClick={() => setMenuOpen(false)} className="font-medium text-purple-600 py-3 border-b border-gray-50 flex items-center min-h-[52px]">
                  {t("admin")}
                </Link>
              )}
              <button onClick={handleLogout} className="text-left font-medium text-red-500 py-3 flex items-center min-h-[52px]">
                {t("signOut")}
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="font-medium text-gray-700 py-3 border-b border-gray-50 flex items-center min-h-[52px]">
                {t("signIn")}
              </Link>
              <Link href="/register" onClick={() => setMenuOpen(false)} className="font-medium text-brand-500 py-3 flex items-center min-h-[52px]">
                {t("register")}
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
