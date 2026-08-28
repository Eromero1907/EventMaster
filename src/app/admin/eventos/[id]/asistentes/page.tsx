"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminNavbar from "@/components/AdminNavbar";
import {
  Users,
  Search,
  FileSpreadsheet,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Loader2,
  Trash2,
  Check,
  Clock,
  Filter,
  UserCheck
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface RegistrationItem {
  id: string;
  ticketCode: string;
  fullName: string;
  email: string;
  nationalId: string;
  epikId?: string;
  phone?: string;
  eps?: string;
  bloodType?: string;
  belongsToGroup: boolean;
  groupName?: string;
  checkedIn: boolean;
  checkedInAt?: string;
  isManualEntry: boolean;
  createdAt: string;
  customAnswersJson?: string;
}

export default function EventAttendeesPage() {
  const params = useParams();
  const eventId = params.id as string;

  const [event, setEvent] = useState<any>(null);
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "attended" | "absent">("all");

  const loadData = async () => {
    try {
      setLoading(true);
      const [eventRes, regRes] = await Promise.all([
        fetch(`/api/admin/events/${eventId}`),
        fetch(`/api/admin/events/${eventId}/registrations?status=${statusFilter}&search=${encodeURIComponent(search)}`),
      ]);

      if (eventRes.ok) {
        const evData = await eventRes.json();
        setEvent(evData);
      }

      if (regRes.ok) {
        const regData = await regRes.json();
        setRegistrations(regData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      loadData();
    }
  }, [eventId, statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar el registro de ${name}?`)) return;
    try {
      const res = await fetch(`/api/admin/events/${eventId}/registrations?registrationId=${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setRegistrations((prev) => prev.filter((r) => r.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const attendedCount = registrations.filter((r) => r.checkedIn).length;
  const absentCount = registrations.filter((r) => !r.checkedIn).length;

  return (
    <div className="min-h-screen flex flex-col bg-cream text-navy">
      <AdminNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin"
              className="bg-white border border-sand p-2 rounded-xl text-steel hover:text-navy transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-navy tracking-tight font-display">
                Lista de Registrados & Asistencia
              </h1>
              <p className="text-xs text-sienna font-medium">{event?.title}</p>
            </div>
          </div>

          {/* Export to CSV Button */}
          <a
            href={`/api/admin/events/${eventId}/export`}
            download
            className="bg-emerald-600 hover:bg-sand0 text-navy font-bold px-5 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-2 self-start sm:self-auto"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Descargar Reporte Completo (.CSV)
          </a>
        </div>

        {/* Quick Stats Pill */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-sand rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sienna text-white/10 text-sienna flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-steel block">Total Registrados</span>
              <span className="text-lg font-black text-navy">{event?.totalRegistrations || registrations.length}</span>
            </div>
          </div>

          <div className="bg-white border border-sand rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sand0/10 text-gold flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-steel block">Asistieron (Confirmados)</span>
              <span className="text-lg font-black text-gold">{event?.checkedInCount || attendedCount}</span>
            </div>
          </div>

          <div className="bg-white border border-sand rounded-2xl p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-steel block">Inasistentes</span>
              <span className="text-lg font-black text-rose-400">{event?.absentCount || absentCount}</span>
            </div>
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="bg-white border border-sand rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-sm">
          <form onSubmit={handleSearchSubmit} className="flex-1 relative max-w-md">
            <Search className="w-4 h-4 text-steel absolute left-3.5 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por Nombre, Cédula, Correo o Boleto..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-white border border-sand text-navy text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </form>

          {/* Filter Tabs */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-sand">
            <button
              onClick={() => setStatusFilter("all")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === "all" ? "bg-terra text-white" : "text-steel hover:text-navy"
              }`}
            >
              Todos ({registrations.length})
            </button>
            <button
              onClick={() => setStatusFilter("attended")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === "attended" ? "bg-emerald-600 text-navy" : "text-steel hover:text-navy"
              }`}
            >
              Asistieron
            </button>
            <button
              onClick={() => setStatusFilter("absent")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                statusFilter === "absent" ? "bg-rose-600 text-navy" : "text-steel hover:text-navy"
              }`}
            >
              Inasistentes
            </button>
          </div>
        </div>

        {/* Table of Attendees */}
        <div className="bg-white border border-sand rounded-3xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-steel">
              <Loader2 className="w-8 h-8 text-sienna animate-spin mx-auto mb-3" />
              Cargando lista de asistentes...
            </div>
          ) : registrations.length === 0 ? (
            <div className="p-12 text-center text-steel text-sm">
              No se encontraron registros con los filtros seleccionados.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/80 text-steel uppercase font-semibold border-b border-sand">
                  <tr>
                    <th className="px-5 py-3.5">Estado Asistencia</th>
                    <th className="px-5 py-3.5">Boleto</th>
                    <th className="px-5 py-3.5">Nombre Completo</th>
                    <th className="px-5 py-3.5">Cédula</th>
                    <th className="px-5 py-3.5">Correo</th>
                    <th className="px-5 py-3.5">Celular</th>
                    <th className="px-5 py-3.5">EPS / RH</th>
                    <th className="px-5 py-3.5">Grupo</th>
                    <th className="px-5 py-3.5">Fecha Registro</th>
                    <th className="px-5 py-3.5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand/60">
                  {registrations.map((reg) => (
                    <tr key={reg.id} className="hover:bg-white/40 transition-colors">
                      {/* Estado */}
                      <td className="px-5 py-4 whitespace-nowrap">
                        {reg.checkedIn ? (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-sand0/10 text-gold border border-emerald-500/20">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            ASISTIÓ
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-white text-steel border border-sand">
                            <Clock className="w-3.5 h-3.5" />
                            NO ASISTIÓ
                          </div>
                        )}
                        {reg.isManualEntry && (
                          <span className="block text-[9px] text-sienna mt-1 font-medium">
                            (En puerta)
                          </span>
                        )}
                      </td>

                      {/* Boleto */}
                      <td className="px-5 py-4 whitespace-nowrap font-mono font-bold text-sienna">
                        {reg.ticketCode}
                      </td>

                      {/* Nombre */}
                      <td className="px-5 py-4 whitespace-nowrap font-semibold text-navy">
                        {reg.fullName}
                      </td>

                      {/* Cédula */}
                      <td className="px-5 py-4 whitespace-nowrap text-slateblue font-mono">
                        {reg.nationalId}
                      </td>

                      {/* Correo */}
                      <td className="px-5 py-4 whitespace-nowrap text-slateblue">
                        {reg.email}
                      </td>

                      {/* Celular */}
                      <td className="px-5 py-4 whitespace-nowrap text-slateblue">
                        {reg.phone || "—"}
                      </td>

                      {/* EPS / RH */}
                      <td className="px-5 py-4 whitespace-nowrap text-slateblue">
                        {reg.eps || "—"} ({reg.bloodType || "—"})
                      </td>

                      {/* Grupo */}
                      <td className="px-5 py-4 whitespace-nowrap text-slateblue">
                        {reg.belongsToGroup ? reg.groupName || "Sí" : "Particular"}
                      </td>

                      {/* Fecha */}
                      <td className="px-5 py-4 whitespace-nowrap text-steel">
                        {formatDate(reg.createdAt)}
                      </td>

                      {/* Acciones */}
                      <td className="px-5 py-4 whitespace-nowrap text-right">
                        <button
                          onClick={() => handleDelete(reg.id, reg.fullName)}
                          className="text-steel hover:text-red-400 p-1.5 rounded-lg transition-colors"
                          title="Eliminar registro"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
