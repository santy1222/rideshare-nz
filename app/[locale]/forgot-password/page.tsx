"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";

export default function ForgotPasswordPage() {
  const t = useTranslations("ForgotPassword");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const redirectTo = `${window.location.origin}/auth/callback?next=/${locale}/reset-password`;
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
    setLoading(false);
    if (error) {
      setError(t("error"));
    } else {
      setSent(true);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-cream-50 border border-gray-100 rounded-2xl p-8 w-full max-w-sm">
        <Link href="/" className="flex justify-center mb-6">
          <Image src="/logo.png" alt="RideShare NZ" height={48} width={195} className="object-contain" />
        </Link>
        <h1 className="font-display font-semibold text-xl text-gray-900 text-center mb-1">{t("title")}</h1>
        <p className="text-sm text-gray-400 text-center mb-6">{t("subtitle")}</p>

        {sent ? (
          <div className="text-center">
            <div className="text-5xl mb-4">📧</div>
            <p className="text-sm font-medium text-gray-700 mb-2">{t("sentTitle")}</p>
            <p className="text-xs text-gray-400 mb-6">{t("sentDescription")}</p>
            <Link href="/login" className="text-brand-500 text-sm hover:underline">{t("backToLogin")}</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            {error && (
              <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">{error}</div>
            )}
            <div>
              <label className="text-xs font-medium text-gray-500 block mb-1">{t("email")}</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("emailPlaceholder")}
                className="input-field"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-brand-500 hover:bg-brand-700 disabled:bg-brand-200 text-white text-sm font-medium rounded-lg transition-colors"
            >
              {loading ? t("sending") : t("send")}
            </button>
            <p className="text-center">
              <Link href="/login" className="text-xs text-gray-400 hover:text-brand-500 transition-colors">
                {t("backToLogin")}
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
