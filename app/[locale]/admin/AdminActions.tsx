"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

interface Props {
  userId: string;
  suspended: boolean;
}

export function AdminActions({ userId, suspended }: Props) {
  const t = useTranslations("Admin");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function toggleSuspend() {
    setLoading(true);
    await supabase.from("profiles").update({ suspended: !suspended }).eq("id", userId);
    router.refresh();
    setLoading(false);
  }

  async function deleteUser() {
    if (!confirm(t("deleteConfirm"))) return;
    setLoading(true);
    await supabase.from("profiles").delete().eq("id", userId);
    router.refresh();
    setLoading(false);
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={toggleSuspend}
        disabled={loading}
        className={`text-xs px-2 py-1 rounded-lg font-medium transition-colors ${
          suspended ? "bg-green-100 text-green-700 hover:bg-green-200" : "bg-orange-100 text-orange-700 hover:bg-orange-200"
        }`}
      >
        {suspended ? t("activate") : t("suspend")}
      </button>
      <button
        onClick={deleteUser}
        disabled={loading}
        className="text-xs px-2 py-1 rounded-lg font-medium bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
      >
        {t("delete")}
      </button>
    </div>
  );
}
