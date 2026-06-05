"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/types";
import { useRouter } from "next/navigation";

interface Props {
  profile: Profile | null;
}

export function ProfileEditForm({ profile }: Props) {
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSaved(false);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error: updateError } = await supabase
      .from("profiles")
      .upsert({ id: user.id, full_name: fullName, phone: phone || null, role: "user" });

    if (updateError) {
      setError(`Error: ${updateError.message}`);
    } else {
      setSaved(true);
      router.refresh();
    }
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 border-t border-gray-100 pt-5">
      <h4 className="font-semibold text-gray-700 text-sm">Editar información</h4>
      {error && (
        <div className="bg-red-50 text-red-600 text-xs px-3 py-2 rounded-lg">{error}</div>
      )}
      {saved && (
        <div className="bg-brand-50 text-brand-700 text-xs px-3 py-2 rounded-lg">
          ¡Cambios guardados!
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Nombre completo</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="input-field text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1">Teléfono (WhatsApp)</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+64 21 123 4567"
            className="input-field text-sm"
          />
        </div>
      </div>
      <button type="submit" disabled={loading} className="btn-primary text-sm">
        {loading ? "Guardando..." : "Guardar cambios"}
      </button>
    </form>
  );
}
