"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";
import { useRouter } from "@/i18n/navigation";
import { Camera } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { validateName, validatePhone } from "@/lib/validation";

interface Props {
  profile: Profile | null;
}

export function ProfileEditForm({ profile }: Props) {
  const t = useTranslations("ProfileEdit");
  const tv = useTranslations("Validation");
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url ?? null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    setUploading(true);
    setError("");

    const ext = file.name.split(".").pop();
    const path = `${user.id}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) {
      setError(`${t("uploadError")}${uploadError.message}`);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
    const urlWithCache = `${publicUrl}?t=${Date.now()}`;

    await supabase.from("profiles").update({ avatar_url: urlWithCache }).eq("id", user.id);

    setAvatarUrl(urlWithCache);
    setUploading(false);
    router.refresh();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaved(false);
    const nameErr = validateName(fullName);
    if (nameErr) { setError(tv(nameErr as Parameters<typeof tv>[0])); return; }
    const phoneErr = validatePhone(phone);
    if (phoneErr) { setError(tv(phoneErr as Parameters<typeof tv>[0])); return; }
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: updateError } = await supabase
      .from("profiles")
      .upsert({ id: user.id, full_name: fullName, phone: phone || null });

    if (updateError) {
      setError(`Error: ${updateError.message}`);
    } else {
      setSaved(true);
      router.refresh();
    }
    setLoading(false);
  }

  const initials = (fullName || "?")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border-t border-gray-100 pt-5">
      <h4 className="font-semibold text-gray-700 text-sm">{t("title")}</h4>

      {error && (
        <div className="bg-red-50 text-red-600 text-xs px-3 py-2 rounded-lg">{error}</div>
      )}
      {saved && (
        <div className="bg-brand-50 text-brand-700 text-xs px-3 py-2 rounded-lg">{t("changesSaved")}</div>
      )}

      <div className="flex items-center gap-4">
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl overflow-hidden bg-brand-100 flex items-center justify-center">
            {avatarUrl ? (
              <Image src={avatarUrl} alt={fullName} width={64} height={64} className="w-full h-full object-cover" />
            ) : (
              <span className="text-brand-700 font-bold text-2xl font-display">{initials}</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute -bottom-1 -right-1 w-6 h-6 bg-brand-500 hover:bg-brand-700 text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
          >
            <Camera size={12} />
          </button>
        </div>
        <div>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
          >
            {uploading ? t("uploading") : t("changePhoto")}
          </button>
          <p className="text-xs text-gray-400 mt-0.5">{t("photoHint")}</p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleAvatarChange}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">{t("fullName")}</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            maxLength={100}
            className="input-field text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">{t("phone")}</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder={t("phonePlaceholder")}
            maxLength={20}
            className="input-field text-sm"
          />
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn-primary text-sm">
        {loading ? t("saving") : t("save")}
      </button>
    </form>
  );
}
