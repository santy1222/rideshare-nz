"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

interface Props {
  userId: string;
  suspended: boolean;
}

export function AdminActions({ userId, suspended }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function toggleSuspend() {
    setLoading(true);
    await supabase
      .from("profiles")
      .update({ suspended: !suspended })
      .eq("id", userId);
    router.refresh();
    setLoading(false);
  }

  async function deleteUser() {
    if (
      !confirm(
        "¿Estás seguro de que querés eliminar este usuario? Esta acción no se puede deshacer."
      )
    )
      return;
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
          suspended
            ? "bg-green-100 text-green-700 hover:bg-green-200"
            : "bg-orange-100 text-orange-700 hover:bg-orange-200"
        }`}
      >
        {suspended ? "Activar" : "Suspender"}
      </button>
      <button
        onClick={deleteUser}
        disabled={loading}
        className="text-xs px-2 py-1 rounded-lg font-medium bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
      >
        Eliminar
      </button>
    </div>
  );
}
