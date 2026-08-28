"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminNavbar from "@/components/AdminNavbar";
import {
  CalendarDays,
  Users,
  CheckCircle2,
  UserX,
  PlusCircle,
  QrCode,
  FileSpreadsheet,
  Settings,
  ExternalLink,
  Loader2,
  Copy,
  Check,
  TrendingUp,
  Clock,
  MapPin,
  Trash2,
  BarChart3
} from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface EventItem {
  id: string;
  title: string;
  slug: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  maxCapacity: number;
  isPublished: boolean;
  totalRegistrations: number;
  checkedInCount: number;
  absentCount: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [events, setEvents] = useState<EventItem[]>([]);
  const [admin, setAdmin] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        // Verificar sesión de admin
        const authRes = await fetch("/api/auth/me");
        if (!authRes.ok) {
          router.push("/admin/login");
          return;
        }
        const authData = await authRes.json();
        setAdmin(authData.admin);

        // Cargar eventos
        const eventsRes = await fetch("/api/admin/events");
        if (eventsRes.ok) {
          const eventsData = await eventsRes.json();
          setEvents(eventsData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [router]);

  const copyPublicLink = (slug: string, id: string) => {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const url = `${origin}/eventos/${slug}`;
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeleteEvent = async (id: string, title: string) => {
    if (!confirm(`¿Estás seguro de eliminar el evento "${title}"? Se borrarán todos los registros asociados.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/events/${id}`, { method: "DELETE" });
      if (res.ok) {
        setEvents((prev) => prev.filter((e) => e.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-cream text-navy">
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-sienna animate-spin mb-4" />
          <p className="text-steel font-medium">Cargando panel administrativo...</p>
        </div>
      </div>
    );
  }

  // Totales globales para métricas
  const totalEventsCount = events.length;
  const totalGlobalRegistrations = events.reduce((acc, curr) => acc + curr.totalRegistrations, 0);
  const totalGlobalCheckedIn = events.reduce((acc, curr) => acc + curr.checkedInCount, 0);
  const globalAttendanceRate =
    totalGlobalRegistrations > 0
      ? Math.round((totalGlobalCheckedIn / totalGlobalRegistrations) * 100)
      : 0;

  return (
    <div className="min-h-screen flex flex-col bg-cream text-navy">
      <AdminNavbar adminName={admin?.name} adminRole={admin?.role} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-8">
        {/* Top Header & Quick Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-navy font-display">
              Gestión de Eventos & Control de Aforo
            </h1>
            <p className="text-sm text-steel mt-1">
              Supervisa inscripciones, asistencia en vivo y reportes en tiempo real
            </p>
          </div>

          <div className="flex items-center gap-3">
            {admin?.role !== "STAFF" && (
              <Link
                href="/admin/eventos/nuevo"
                className="bg-terra text-white hover:bg-sienna text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg shadow-terra/30 flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Crear Nuevo Evento
              </Link>
            )}
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white border border-sand rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-steel mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Eventos Totales</span>
              <CalendarDays className="w-5 h-5 text-sienna" />
            </div>
            <div className="text-3xl font-black text-navy">{totalEventsCount}</div>
            <span className="text-xs text-steel mt-1 block">Creados en el sistema</span>
          </div>

          <div className="bg-white border border-sand rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-steel mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Registrados</span>
              <Users className="w-5 h-5 text-slateblue" />
            </div>
            <div className="text-3xl font-black text-slateblue">{totalGlobalRegistrations}</div>
            <span className="text-xs text-steel mt-1 block">Asistentes preinscritos</span>
          </div>

          <div className="bg-white border border-sand rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-steel mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Asistieron (Check-in)</span>
              <CheckCircle2 className="w-5 h-5 text-gold" />
            </div>
            <div className="text-3xl font-black text-gold">{totalGlobalCheckedIn}</div>
            <span className="text-xs text-steel mt-1 block">Entradas validadas en puerta</span>
          </div>

          <div className="bg-white border border-sand rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between text-steel mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">Tasa de Asistencia</span>
              <TrendingUp className="w-5 h-5 text-ochre" />
            </div>
            <div className="text-3xl font-black text-ochre">{globalAttendanceRate}%</div>
            <span className="text-xs text-steel mt-1 block">Ratio global de llegada</span>
          </div>
        </div>

        {/* Events Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-navy tracking-tight font-display">Eventos Registrados</h2>

          {events.length === 0 ? (
            <div className="bg-white border border-sand rounded-3xl p-12 text-center max-w-lg mx-auto">
              <CalendarDays className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-navy">Aún no has creado ningún evento</h3>
              <p className="text-xs text-steel mt-1 mb-6">
                Comienza configurando tu primer evento con cupos, formulario personalizado y lector QR.
              </p>
              <Link
                href="/admin/eventos/nuevo"
                className="bg-terra text-white hover:bg-sienna text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg inline-flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" />
                Crear Primer Evento
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-5">
              {events.map((event) => {
                const percentFull = Math.min(100, Math.round((event.totalRegistrations / event.maxCapacity) * 100));
                const attendancePercent =
                  event.totalRegistrations > 0
                    ? Math.round((event.checkedInCount / event.totalRegistrations) * 100)
                    : 0;

                return (
                  <div
                    key={event.id}
                    className="bg-white/90 border border-sand rounded-2xl p-6 shadow-md hover:border-sand transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
                  >
                    {/* Event Info */}
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold px-2.5 py-0.5 rounded bg-sand text-navy border border-sand">
                          {formatDate(event.startDate)}
                        </span>
                        {event.isPublished ? (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white text-terra border border-terra/30">
                            Público
                          </span>
                        ) : (
                          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-sand text-steel">
                            Borrador
                          </span>
                        )}
                      </div>

                      <h3 className="text-xl font-bold text-navy">{event.title}</h3>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-steel">
                        {event.location && (
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-steel" />
                            <span>{event.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-steel" />
                          <span>Cupo: {event.totalRegistrations} / {event.maxCapacity} ({percentFull}% lleno)</span>
                        </div>
                      </div>

                      {/* Mini visual bars for capacity and attendance */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 max-w-xl">
                        <div>
                          <div className="flex justify-between text-[11px] text-steel mb-1">
                            <span>Aforo Ocupado</span>
                            <span className="font-semibold text-navy">{percentFull}%</span>
                          </div>
                          <div className="w-full bg-sand h-2 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${
                                percentFull >= 100 ? "bg-terra" : percentFull >= 80 ? "bg-sienna" : "bg-navy"
                              }`}
                              style={{ width: `${percentFull}%` }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className="flex justify-between text-[11px] text-steel mb-1">
                            <span>Asistencia en Puerta</span>
                            <span className="font-semibold text-terra">{event.checkedInCount} asistieron ({attendancePercent}%)</span>
                          </div>
                          <div className="w-full bg-sand h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-terra"
                              style={{ width: `${attendancePercent}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions buttons */}
                    <div className="flex flex-wrap items-center gap-2 lg:flex-col lg:items-end shrink-0">
                      <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
                        <Link
                          href={`/admin/eventos/${event.id}/checkin`}
                          className="bg-terra text-white hover:bg-sienna px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 flex-1 sm:flex-initial justify-center"
                        >
                          <QrCode className="w-4 h-4" />
                          Check-in en Vivo
                        </Link>

                        {admin?.role !== "STAFF" && (
                          <>
                            <Link
                              href={`/admin/eventos/${event.id}/asistentes`}
                              className="bg-white hover:bg-sand border border-sand text-navy px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 flex-1 sm:flex-initial justify-center"
                            >
                              <Users className="w-4 h-4 text-navy" />
                              Asistentes ({event.totalRegistrations})
                            </Link>

                            <Link
                              href={`/admin/eventos/${event.id}/metricas`}
                              className="bg-white hover:bg-sand border border-sand text-navy px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 flex-1 sm:flex-initial justify-center"
                            >
                              <BarChart3 className="w-4 h-4 text-navy" />
                              Métricas
                            </Link>

                            <a
                              href={`/api/admin/events/${event.id}/export`}
                              download
                              className="bg-white hover:bg-sand border border-sand text-navy px-3.5 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
                              title="Descargar reporte en .CSV"
                            >
                              <FileSpreadsheet className="w-4 h-4 text-navy" />
                              Descargar .CSV
                            </a>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-2 w-full justify-end">
                        <button
                          onClick={() => copyPublicLink(event.slug, event.id)}
                          className="text-xs text-navy hover:text-terra bg-white border border-sand px-2.5 py-1.5 rounded-lg transition-colors flex items-center gap-1"
                          title="Copiar enlace de inscripción público"
                        >
                          {copiedId === event.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-terra" />
                              <span className="text-terra">¡Enlace Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar Link Público</span>
                            </>
                          )}
                        </button>

                        <Link
                          href={`/eventos/${event.slug}`}
                          target="_blank"
                          className="text-xs text-navy hover:text-terra bg-white border border-sand p-1.5 rounded-lg transition-colors"
                          title="Ver página pública del evento"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                        {admin?.role !== "STAFF" && (
                          <>
                            <Link
                              href={`/admin/eventos/${event.id}/editar`}
                              className="text-xs text-navy hover:text-terra bg-white border border-sand p-1.5 rounded-lg transition-colors"
                              title="Editar evento y preguntas"
                            >
                              <Settings className="w-3.5 h-3.5" />
                            </Link>

                            <button
                              onClick={() => handleDeleteEvent(event.id, event.title)}
                              className="text-xs text-navy hover:text-terra bg-white border border-sand p-1.5 rounded-lg transition-colors"
                              title="Eliminar evento"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
