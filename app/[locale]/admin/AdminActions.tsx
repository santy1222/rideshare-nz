"use client";

import { useState } from "react";
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

  async function toggleSuspend() {
    setLoading(true);
    await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ suspended: !suspended }),
    });
    router.refresh();
    setLoading(false);
  }

  async function deleteUser() {
    if (!confirm(t("deleteConfirm"))) return;
    setLoading(true);
    await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
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
