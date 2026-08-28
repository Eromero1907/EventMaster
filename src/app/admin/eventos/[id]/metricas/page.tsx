"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import AdminNavbar from "@/components/AdminNavbar";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";
import { BarChart3, Users, Clock, CheckCircle2, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function MetricsDashboard() {
  const params = useParams();
  const eventId = params.id as string;
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);

  useEffect(() => {
    async function loadMetrics() {
      try {
        const [metricsRes, eventRes] = await Promise.all([
          fetch(`/api/admin/events/${eventId}/metrics`),
          fetch(`/api/admin/events/${eventId}`)
        ]);
        if (metricsRes.ok && eventRes.ok) {
          const metricsData = await metricsRes.json();
          const eventData = await eventRes.json();
          setMetrics(metricsData.data);
          setEvent(eventData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadMetrics();
  }, [eventId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex flex-col">
        <AdminNavbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-sienna animate-spin" />
        </div>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="min-h-screen bg-cream flex flex-col">
        <AdminNavbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <BarChart3 className="w-12 h-12 text-steel mb-4 opacity-50" />
          <h2 className="text-xl font-bold text-navy">Error al cargar métricas</h2>
          <p className="text-sm text-steel mt-2 max-w-sm">No se pudo cargar la información de este evento o no hay datos disponibles.</p>
          <Link href="/admin" className="mt-6 px-4 py-2 bg-white border border-sand rounded-lg text-sm font-semibold text-navy hover:bg-sand transition-colors">
            Volver al Panel
          </Link>
        </div>
      </div>
    );
  }

  const attendanceData = [
    { name: "Asistieron", value: metrics.checkedInCount, color: "#A43320" }, // Terra
    { name: "Ausentes", value: metrics.absentCount, color: "#1A2545" } // SlateBlue
  ];

  const sourceData = [
    { name: "En Línea", value: metrics.onlineCount, color: "#8CBCD0" }, // Powder
    { name: "En Puerta", value: metrics.manualCount, color: "#E3A41A" } // Gold
  ];

  const groupStatusData = [
    { name: "En un grupo", value: metrics.belongsToGroupCount || 0, color: "#984A39" }, // Sienna
    { name: "Sin grupo", value: metrics.noGroupCount || 0, color: "#E8D6C2" } // Sand
  ];

  const groupColors = ["#A43320", "#8CBCD0", "#E3A41A", "#1A2545", "#0C1634", "#40658A"];
  const groupPieData = (metrics.groupNamesChart || []).map((item: any, idx: number) => ({
    name: item.name,
    value: item.count,
    color: groupColors[idx % groupColors.length]
  }));

  const CustomTooltipStyle = { backgroundColor: "#0C1634", borderColor: "#1A2545", color: "#fff", borderRadius: "8px" };

  return (
    <div className="min-h-screen bg-cream text-navy">
      <AdminNavbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-2 text-sm text-steel hover:text-navy transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" /> Volver al panel general
          </Link>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight flex items-center gap-3 font-display">
                <BarChart3 className="w-8 h-8 text-sienna" />
                Métricas del Evento
              </h1>
              <p className="text-sienna font-medium text-sm mt-1">{event?.title}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border border-sand rounded-2xl p-6 shadow-xl flex items-center gap-4">
            <div className="bg-terra text-white p-4 rounded-xl">
              <Users className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-steel">Total Inscritos</p>
              <h2 className="text-3xl font-black text-navy font-display">{metrics.totalRegistrations}</h2>
            </div>
          </div>
          <div className="bg-white border border-sand rounded-2xl p-6 shadow-xl flex items-center gap-4">
            <div className="bg-gold text-white p-4 rounded-xl">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-steel">Total Check-ins</p>
              <h2 className="text-3xl font-black text-navy font-display">{metrics.checkedInCount}</h2>
            </div>
          </div>
          <div className="bg-white border border-sand rounded-2xl p-6 shadow-xl flex items-center gap-4">
            <div className="bg-slateblue text-white p-4 rounded-xl">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-bold text-steel">Tasa de Asistencia</p>
              <h2 className="text-3xl font-black text-navy font-display">
                {metrics.totalRegistrations > 0 ? Math.round((metrics.checkedInCount / metrics.totalRegistrations) * 100) : 0}%
              </h2>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white border border-sand rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-navy mb-6">Asistencia General</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={attendanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {attendanceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={CustomTooltipStyle} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-sand rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-navy mb-6">Origen de Inscripción</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={sourceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8D6C2" />
                  <XAxis dataKey="name" stroke="#40658A" />
                  <YAxis stroke="#40658A" />
                  <Tooltip contentStyle={CustomTooltipStyle} />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* New pie charts for group stats */}
          <div className="bg-white border border-sand rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-navy mb-6">Pertenencia a Grupos Estudiantiles</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={groupStatusData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    labelLine={false}
                  >
                    {groupStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={CustomTooltipStyle} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white border border-sand rounded-2xl p-6 shadow-xl">
            <h3 className="text-lg font-bold text-navy mb-6">Distribución por Grupo Estudiantil</h3>
            <div className="h-64">
              {groupPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={groupPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {groupPieData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={CustomTooltipStyle} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-steel text-sm">
                  No hay suficientes datos de grupos todavía.
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-sand rounded-2xl p-6 shadow-xl lg:col-span-2">
            <h3 className="text-lg font-bold text-navy mb-6">Evolución de Registros Diarios</h3>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics.registrationsByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E8D6C2" />
                  <XAxis dataKey="date" stroke="#40658A" />
                  <YAxis stroke="#40658A" />
                  <Tooltip contentStyle={CustomTooltipStyle} />
                  <Line type="monotone" dataKey="count" stroke="#A43320" strokeWidth={3} dot={{ fill: '#A43320', r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
