"use client";

import { useEffect, useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "@/i18n/navigation";
import { ArrowLeft, Send } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";

interface Message {
  id: string;
  content: string;
  sender_id: string;
  read: boolean;
  created_at: string;
}

interface PageProps {
  params: Promise<{ tripId: string; userId: string }>;
}

export default function ConversationPage({ params }: PageProps) {
  const t = useTranslations("Thread");
  const locale = useLocale();
  const [tripId, setTripId] = useState("");
  const [otherId, setOtherId] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [currentUserId, setCurrentUserId] = useState("");
  const [otherName, setOtherName] = useState("");
  const [tripRoute, setTripRoute] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    params.then(({ tripId, userId }) => {
      setTripId(tripId);
      setOtherId(userId);
    });
  }, []);

  useEffect(() => {
    if (!tripId || !otherId) return;
    loadData();
    const interval = setInterval(() => loadMessages(currentUserId), 5000);
    return () => clearInterval(interval);
  }, [tripId, otherId]);

  async function loadData() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    setCurrentUserId(user.id);

    const [{ data: profile }, { data: trip }, { data: msgs }] = await Promise.all([
      supabase.from("profiles").select("full_name").eq("id", otherId).single(),
      supabase.from("trips").select("origin,destination").eq("id", tripId).single(),
      supabase
        .from("messages")
        .select("*")
        .eq("trip_id", tripId)
        .or(`and(sender_id.eq.${user.id},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${user.id})`)
        .order("created_at", { ascending: true }),
    ]);

    setOtherName(profile?.full_name ?? t("user"));
    setTripRoute(trip ? `${trip.origin} → ${trip.destination}` : "");
    setMessages(msgs ?? []);
    setLoading(false);

    await supabase
      .from("messages")
      .update({ read: true })
      .eq("trip_id", tripId)
      .eq("sender_id", otherId)
      .eq("receiver_id", user.id)
      .eq("read", false);
  }

  async function loadMessages(uid: string) {
    if (!uid) return;
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("trip_id", tripId)
      .or(`and(sender_id.eq.${uid},receiver_id.eq.${otherId}),and(sender_id.eq.${otherId},receiver_id.eq.${uid})`)
      .order("created_at", { ascending: true });
    setMessages(data ?? []);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !currentUserId) return;
    setSending(true);

    await supabase.from("messages").insert({
      trip_id: tripId,
      sender_id: currentUserId,
      receiver_id: otherId,
      content: newMessage.trim(),
    });

    setNewMessage("");
    await loadMessages(currentUserId);
    setSending(false);
  }

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const timeLocale = locale === "en" ? "en-NZ" : "es-NZ";

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-gray-100 rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-4 flex flex-col" style={{ height: "calc(100dvh - 56px)" }}>
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-4">
        <button onClick={() => router.push("/messages")} className="text-gray-400 hover:text-gray-600 transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold text-sm">
          {otherName.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-semibold text-gray-800 text-sm">{otherName}</p>
          <p className="text-xs text-brand-600">{tripRoute}</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 mb-4">
        {messages.length === 0 && (
          <p className="text-center text-gray-400 text-sm py-8">{t("empty")}</p>
        )}
        {messages.map((msg) => {
          const isMe = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm ${isMe ? "bg-brand-500 text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"}`}>
                <p>{msg.content}</p>
                <p className={`text-xs mt-1 ${isMe ? "text-brand-100 opacity-80" : "text-gray-400"}`}>
                  {new Date(msg.created_at).toLocaleTimeString(timeLocale, { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={t("placeholder")}
          className="input-field flex-1"
        />
        <button
          type="submit"
          disabled={sending || !newMessage.trim()}
          className="w-10 h-10 rounded-xl bg-brand-500 hover:bg-brand-700 disabled:bg-brand-200 text-white flex items-center justify-center transition-colors flex-shrink-0"
        >
          <Send size={16} />
        </button>
      </form>
    </div>
  );
}
