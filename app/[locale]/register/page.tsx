"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, Mail } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { validateName, validatePhone, validatePassword } from "@/lib/validation";

export default function RegisterPage() {
  const t = useTranslations("Register");
  const tv = useTranslations("Validation");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const nameErr = validateName(fullName);
    if (nameErr) { setError(tv(nameErr as Parameters<typeof tv>[0])); return; }
    const phoneErr = validatePhone(phone);
    if (phoneErr) { setError(tv(phoneErr as Parameters<typeof tv>[0])); return; }
    const passErr = validatePassword(password);
    if (passErr) { setError(tv(passErr as Parameters<typeof tv>[0])); return; }
    setLoading(true);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      await supabase.from("profiles").upsert({
        id: data.user.id,
        full_name: fullName,
        phone: phone || null,
      });
    }

    setRegistered(true);
  }

  if (registered) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
        <div className="bg-cream-50 border border-gray-100 rounded-2xl p-8 w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-brand-50 flex items-center justify-center mx-auto mb-5">
            <Mail size={28} className="text-brand-500" />
          </div>
          <h1 className="font-display font-semibold text-xl text-gray-900 mb-2">{t("checkEmail")}</h1>
          <p className="text-sm text-gray-500 mb-1">{t("confirmationSent")}</p>
          <p className="text-sm font-medium text-brand-700 mb-6">{email}</p>
          <p className="text-xs text-gray-400 mb-6">{t("clickLink")}</p>
          <Link
            href="/login"
            className="block w-full py-2.5 bg-brand-500 hover:bg-brand-700 text-white text-sm font-medium rounded-lg transition-colors text-center"
          >
            {t("goToSignIn")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="bg-cream-50 border border-gray-100 rounded-2xl p-8 w-full max-w-sm">
        <Link href="/" className="flex justify-center mb-6">
          <Image src="/logo.png" alt="RideShare NZ" height={48} width={195} className="object-contain" />
        </Link>
        <h1 className="font-display font-semibold text-xl text-gray-900 text-center mb-1">{t("title")}</h1>
        <p className="text-sm text-gray-400 text-center mb-6">{t("subtitle")}</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">{t("fullName")}</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder={t("fullNamePlaceholder")}
              maxLength={100}
              className="input-field"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">{t("phone")}</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder={t("phonePlaceholder")}
              maxLength={20}
              className="input-field"
            />
          </div>
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
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">{t("password")}</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={t("passwordPlaceholder")}
                className="input-field pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-brand-500 hover:bg-brand-700 disabled:bg-brand-200 text-white text-sm font-medium rounded-lg transition-colors"
          >
            {loading ? t("creating") : t("create")}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-4">
          {t("haveAccount")}{" "}
          <Link href="/login" className="text-brand-500 hover:underline">{t("signInLink")}</Link>
        </p>
      </div>
    </div>
  );
}
