"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, ShieldCheck, Lock, Mail, Loader2, AlertCircle } from "lucide-react";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Credenciales incorrectas");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-cream px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Icon & Heading */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2.5 mb-4 group">
            <div className="w-12 h-12 rounded-2xl bg-sienna text-white flex items-center justify-center text-navy shadow-lg shadow-sky-500/30 group-hover:scale-105 transition-transform">
              <CalendarDays className="w-6 h-6" />
            </div>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight font-display">Panel Administrativo</h1>
          <p className="text-sm text-steel mt-2">
            Ingreso exclusivo para organizadores y administradores
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white border border-sand rounded-3xl p-8 shadow-2xl">
          {errorMsg && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3.5 rounded-xl mb-6 flex items-start gap-2.5 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slateblue mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-steel absolute left-3.5 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@institucion.edu.co"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-sand text-navy placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slateblue mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-steel absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-sand text-navy placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-terra text-white hover:bg-sienna text-white disabled:opacity-50 text-navy font-bold py-3 px-4 rounded-xl shadow-lg shadow-terra/30 transition-all flex items-center justify-center gap-2 text-sm mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verificando credenciales...
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  Iniciar Sesión
                </>
              )}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-sand text-center">
            <Link
              href="/"
              className="text-xs text-steel hover:text-navy transition-colors"
            >
              ← Volver a la página pública de eventos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
