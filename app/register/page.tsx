"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }
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
        role: "user",
      });
    }

    router.push("/");
    router.refresh();
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
      <div className="bg-white border border-gray-100 rounded-2xl p-8 w-full max-w-sm">
        <Link href="/" className="flex items-center gap-2 justify-center font-display font-semibold text-xl text-brand-500 mb-6">
          🚗 RideShare<span className="text-brand-700">.nz</span>
        </Link>
        <h1 className="font-display font-semibold text-xl text-gray-900 text-center mb-1">Creá tu cuenta</h1>
        <p className="text-sm text-gray-400 text-center mb-6">Gratis y en menos de 2 minutos</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Nombre completo *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Smith"
              className="input-field"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Teléfono (WhatsApp)</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+64 21 123 4567"
              className="input-field"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Email *</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              className="input-field"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Contraseña *</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
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
          <button type="submit" disabled={loading} className="w-full py-2.5 bg-brand-500 hover:bg-brand-700 disabled:bg-brand-200 text-white text-sm font-medium rounded-lg transition-colors">
            {loading ? "Creando cuenta..." : "Crear cuenta"}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-4">
          ¿Ya tenés cuenta?{" "}
          <Link href="/login" className="text-brand-500 hover:underline">Iniciá sesión</Link>
        </p>
      </div>
    </div>
  );
}
