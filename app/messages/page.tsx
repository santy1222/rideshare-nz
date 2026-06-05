import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { MessageCircle } from "lucide-react";
import type { Message } from "@/types";

type ConvGroup = {
  tripId: string;
  otherId: string;
  otherName: string;
  tripRoute: string;
  lastMessage: string;
  lastDate: string;
  unreadCount: number;
};

export default async function MessagesPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/messages");

  const { data: messages } = await supabase
    .from("messages")
    .select("*, trip:trips(origin,destination), sender:profiles!sender_id(full_name), receiver:profiles!receiver_id(full_name)")
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false });

  const convMap = new Map<string, ConvGroup>();
  for (const msg of (messages as Message[]) ?? []) {
    const isSender = msg.sender_id === user.id;
    const otherId = isSender ? msg.receiver_id : msg.sender_id;
    const key = `${msg.trip_id}::${otherId}`;
    if (!convMap.has(key)) {
      convMap.set(key, {
        tripId: msg.trip_id,
        otherId,
        otherName: (isSender ? msg.receiver?.full_name : msg.sender?.full_name) ?? "Usuario",
        tripRoute: msg.trip ? `${msg.trip.origin} → ${msg.trip.destination}` : "",
        lastMessage: msg.content,
        lastDate: msg.created_at,
        unreadCount: 0,
      });
    }
    if (!msg.read && msg.receiver_id === user.id) {
      convMap.get(key)!.unreadCount++;
    }
  }

  const conversations = Array.from(convMap.values());

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="font-display font-semibold text-2xl text-gray-900 mb-6">Mensajes</h1>

      {conversations.length === 0 ? (
        <div className="card text-center py-14">
          <MessageCircle size={32} className="text-gray-300 mx-auto mb-3" />
          <p className="font-medium text-gray-500 text-sm">No tenés mensajes todavía</p>
          <p className="text-xs text-gray-400 mt-1">
            Contactá a un conductor desde la página de un viaje
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((conv) => (
            <Link key={`${conv.tripId}::${conv.otherId}`} href={`/messages/${conv.tripId}/${conv.otherId}`}>
              <div className="card hover:border-brand-200 hover:-translate-y-0.5 transition-all cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-semibold flex-shrink-0">
                    {conv.otherName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-800 text-sm">{conv.otherName}</span>
                        {conv.unreadCount > 0 && (
                          <span className="bg-brand-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-400 flex-shrink-0">
                        {new Date(conv.lastDate).toLocaleDateString("es-NZ", { day: "numeric", month: "short" })}
                      </span>
                    </div>
                    <p className="text-xs text-brand-600 mb-0.5">{conv.tripRoute}</p>
                    <p className="text-sm text-gray-500 truncate">{conv.lastMessage}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
