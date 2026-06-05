"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff } from "lucide-react";
import Image from "next/image";
import { Suspense } from "react";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const redirect = params.get("redirect") ?? "/";
  const supabase = createClient();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError("Email o contraseña incorrectos");
      setLoading(false);
    } else {
      router.push(redirect);
      router.refresh();
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-white border border-gray-100 rounded-2xl p-8 w-full max-w-sm">
        <Link href="/" className="flex justify-center mb-6">
          <Image src="/logo.svg" alt="RideShare NZ" height={40} width={160} className="object-contain" />
        </Link>
        <h1 className="font-display font-semibold text-xl text-gray-900 text-center mb-1">Bienvenido de vuelta</h1>
        <p className="text-sm text-gray-400 text-center mb-6">Iniciá sesión para continuar</p>

        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">
              {error}
            </div>
          )}
          <div>
            <label className="text-xs font-medium text-gray-500 block mb-1">Email</label>
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
            <label className="text-xs font-medium text-gray-500 block mb-1">Contraseña</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
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
            {loading ? "Iniciando sesión..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-4">
          ¿No tenés cuenta?{" "}
          <Link href="/register" className="text-brand-500 hover:underline">Registrate acá</Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
