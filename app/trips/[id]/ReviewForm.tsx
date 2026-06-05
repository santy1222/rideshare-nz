"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Star } from "lucide-react";
import { useRouter } from "next/navigation";

interface Props {
  tripId: string;
  reviewedId: string;
  userId: string;
}

export function ReviewForm({ tripId, reviewedId, userId }: Props) {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Seleccioná una puntuación");
      return;
    }
    setLoading(true);
    setError("");

    const { error: insertError } = await supabase.from("reviews").insert({
      trip_id: tripId,
      reviewer_id: userId,
      reviewed_id: reviewedId,
      rating,
      comment: comment || null,
    });

    if (insertError) {
      setError(
        insertError.code === "23505"
          ? "Ya dejaste una reseña para este viaje"
          : "Error al enviar la reseña"
      );
      setLoading(false);
      return;
    }

    setDone(true);
    router.refresh();
  }

  if (done) {
    return (
      <div className="bg-brand-50 text-brand-700 px-4 py-3 rounded-xl text-sm font-medium">
        ¡Gracias por tu reseña!
      </div>
    );
  }

  return (
    <div className="border-t border-gray-100 pt-5">
      <h4 className="font-semibold text-gray-700 text-sm mb-3">Dejar una reseña</h4>
      <form onSubmit={handleSubmit} className="space-y-3">
        {error && (
          <div className="bg-red-50 text-red-600 text-xs px-3 py-2 rounded-lg">
            {error}
          </div>
        )}
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((s) => (
            <button
              key={s}
              type="button"
              onMouseEnter={() => setHover(s)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(s)}
            >
              <Star
                size={24}
                className={
                  s <= (hover || rating)
                    ? "text-amber-400 fill-amber-400"
                    : "text-gray-300 fill-gray-300"
                }
              />
            </button>
          ))}
        </div>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Comentario opcional..."
          rows={2}
          className="input-field resize-none text-sm"
        />
        <button type="submit" disabled={loading} className="btn-primary text-sm">
          {loading ? "Enviando..." : "Enviar reseña"}
        </button>
      </form>
    </div>
  );
}
