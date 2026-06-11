"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Send, MessageCircle, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { validateMessage } from "@/lib/validation";

interface Props {
  tripId: string;
  userId: string;
  receiverId: string;
  receiverName: string;
  hasConversation: boolean;
}

export function ContactForm({ tripId, userId, receiverId, receiverName, hasConversation }: Props) {
  const t = useTranslations("Contact");
  const tv = useTranslations("Validation");
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const msgErr = validateMessage(message);
    if (msgErr) { setError(tv(msgErr as Parameters<typeof tv>[0])); return; }
    setLoading(true);
    setError("");

    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ trip_id: tripId, receiver_id: receiverId, content: message }),
    });

    if (res.status === 429) {
      setError(tv("rateLimited"));
      setLoading(false);
    } else if (!res.ok) {
      setError(t("error"));
      setLoading(false);
    } else {
      router.push(`/messages/${tripId}/${receiverId}`);
    }
  }

  const firstName = receiverName.split(" ")[0];

  if (hasConversation) {
    return (
      <button
        onClick={() => router.push(`/messages/${tripId}/${receiverId}`)}
        className="w-full py-2.5 border border-brand-200 text-brand-700 hover:bg-brand-50 font-medium rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
      >
        <MessageCircle size={15} />
        {t("viewConversation", { name: firstName })}
      </button>
    );
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="w-full py-2.5 border border-gray-200 text-gray-600 hover:bg-cream-100 font-medium rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
      >
        <MessageCircle size={15} />
        {t("title")}
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-gray-100 rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">{t("messageLabel", { name: firstName })}</p>
        <button type="button" onClick={() => setOpen(false)} className="text-gray-400 hover:text-gray-600">
          <X size={16} />
        </button>
      </div>
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={t("messagePlaceholder", { name: firstName })}
        rows={3}
        maxLength={1000}
        className="input-field resize-none"
        autoFocus
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
      <button
        type="submit"
        disabled={loading}
        className="w-full py-2.5 bg-brand-500 hover:bg-brand-700 disabled:bg-brand-200 text-white text-sm font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <Send size={14} />
        {loading ? t("submitting") : t("send")}
      </button>
    </form>
  );
}
