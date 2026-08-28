"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import { Search, Loader2, AlertCircle, Calendar, Ticket } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default function RecuperarPage() {
  const [formData, setFormData] = useState({ nationalId: "", email: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSearched(false);

    try {
      const res = await fetch("/api/tickets/recover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      const data = await res.json();

      if (res.ok) {
        setRegistrations(data.registrations);
        setSearched(true);
      } else {
        setError(data.error || "No se encontraron boletos.");
      }
    } catch (err) {
      setError("Error de conexión. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex flex-col items-center p-6 md:p-12">
        <div className="max-w-xl w-full">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-extrabold text-navy tracking-tight mb-2 font-display">Recuperar Boleto</h1>
            <p className="text-slate-600">
              ¿Olvidaste guardar tu código QR? Ingresa tus datos para acceder a tus boletos de entrada.
            </p>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-sand shadow-sm mb-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Número de Cédula o ID</label>
                <input
                  type="text"
                  required
                  value={formData.nationalId}
                  onChange={(e) => setFormData({...formData, nationalId: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-sand focus:outline-none focus:ring-2 focus:ring-sky-500 bg-cream"
                  placeholder="Ej: 1000123456"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Correo Electrónico (El que usaste al registrarte)</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-sand focus:outline-none focus:ring-2 focus:ring-sky-500 bg-cream"
                  placeholder="tu-correo@eafit.edu.co"
                />
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-50 text-red-800 border border-red-200 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || !formData.nationalId || !formData.email}
                className="w-full bg-white hover:bg-white text-navy font-bold py-3.5 px-6 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                Buscar Mis Boletos
              </button>
            </form>
          </div>

          {searched && registrations.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-navy mb-4 px-2 font-display">Tus Boletos Encontrados ({registrations.length})</h2>
              
              {registrations.map((reg) => (
                <div key={reg.id} className="bg-white p-5 rounded-2xl border border-sand shadow-sm hover:border-sky-300 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wide">
                        {reg.ticketCode}
                      </span>
                    </div>
                    <h3 className="font-bold text-navy text-lg leading-tight">{reg.event.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-xs text-steel font-medium">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {formatDate(reg.event.startDate)}</span>
                    </div>
                  </div>
                  
                  <Link 
                    href={`/eventos/${reg.event.slug}/ticket/${reg.ticketCode}`}
                    className="shrink-0 w-full sm:w-auto bg-sand text-sky-700 hover:bg-sky-100 font-bold py-2.5 px-5 rounded-xl border border-sand flex items-center justify-center gap-2 transition-colors text-sm"
                  >
                    <Ticket className="w-4 h-4" />
                    Ver Boleto QR
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
