"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminNavbar from "@/components/AdminNavbar";
import QRScanner from "@/components/QRScanner";
import {
  CalendarDays,
  QrCode,
  Search,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  UserPlus,
  ArrowLeft,
  Users,
  Loader2,
  Clock,
  Check,
  UserCheck,
  X
} from "lucide-react";
import Link from "next/link";

export default function LiveCheckinPage() {
  const params = useParams();
  const eventId = params.id as string;
  const router = useRouter();

  const [event, setEvent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  // Status of the last scanned/processed entry
  const [scanResult, setScanResult] = useState<{
    status: "success" | "warning" | "error" | "verify";
    message: string;
    registration?: any;
    time?: string;
  } | null>(null);

  // Manual walk-in modal state
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualForm, setManualForm] = useState({
    fullName: "",
    nationalId: "",
    email: "",
    epikId: "",
    phone: "",
    eps: "",
    bloodType: "O+",
    belongsToGroup: false,
    groupName: "",
    shiftId: "",
  });
  const [manualSubmitting, setManualSubmitting] = useState(false);
  const [manualError, setManualError] = useState<string | null>(null);

  // Cargar datos del evento
  const loadEvent = async () => {
    try {
      const res = await fetch(`/api/admin/events/${eventId}`);
      if (!res.ok) {
        throw new Error("No se pudo cargar el evento");
      }
      const data = await res.json();
      setEvent(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  // Procesar Check-in o Verificación
  const processCheckIn = async (queryParam: { query?: string; ticketCode?: string; registrationId?: string; action?: "verify" | "confirm" | "checkout" }) => {
    setSearching(true);
    setScanResult(null);

    try {
      const res = await fetch(`/api/admin/events/${eventId}/checkin`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(queryParam),
      });

      const data = await res.json();

      if (!res.ok) {
        setScanResult({
          status: "error",
          message: data.error || "No se encontró el registro en este evento",
        });
        return;
      }

      if (data.action === "verify") {
        if (data.alreadyCheckedIn) {
          setScanResult({
            status: "warning",
            message: "⚠️ ATENCIÓN: Esta persona ya se encuentra adentro.",
            registration: data.registration,
            time: data.previousCheckInTime
          });
        } else {
          setScanResult({
            status: "verify",
            message: "Verifica la identidad antes de confirmar el acceso.",
            registration: data.registration,
          });
        }
        return;
      }

      if (data.action === "checkout") {
        setScanResult({
          status: "success",
          message: data.message,
          registration: data.registration,
        });
        loadEvent();
        return;
      }

      if (data.alreadyCheckedIn) {
        setScanResult({
          status: "warning",
          message: data.message,
          registration: data.registration,
          time: data.previousCheckInTime,
        });
      } else {
        setScanResult({
          status: "success",
          message: data.message,
          registration: data.registration,
        });
        // Actualizar contador
        loadEvent();
      }
    } catch (err: any) {
      setScanResult({
        status: "error",
        message: err.message || "Error al procesar",
      });
    } finally {
      setSearching(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    processCheckIn({ query: searchQuery.trim(), action: "verify" });
  };

  const handleQRScanned = (decodedText: string) => {
    let cleanCode = decodedText;
    if (cleanCode.includes("/ticket/")) {
      cleanCode = cleanCode.split("/ticket/")[1]?.split("?")[0] || cleanCode;
    }
    processCheckIn({ ticketCode: cleanCode.trim(), action: "verify" });
  };

  const confirmAccess = (registrationId: string) => {
    processCheckIn({ registrationId, action: "confirm" });
  };

  const registerExit = (registrationId: string) => {
    processCheckIn({ registrationId, action: "checkout" });
  };

  const handleManualRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setManualSubmitting(true);
    setManualError(null);

    try {
      const res = await fetch(`/api/admin/events/${eventId}/manual-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(manualForm),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al registrar en puerta");
      }

      setShowManualModal(false);
      setManualForm({
        fullName: "",
        nationalId: "",
        email: "",
        epikId: "",
        phone: "",
        eps: "",
        bloodType: "O+",
        belongsToGroup: false,
        groupName: "",
        shiftId: "",
      });

      setScanResult({
        status: "success",
        message: `✅ Asistente registrado y admitido en puerta: ${data.registration.fullName}`,
        registration: data.registration,
      });

      loadEvent();
    } catch (err: any) {
      setManualError(err.message);
    } finally {
      setManualSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-cream text-navy">
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-sienna animate-spin mb-4" />
          <p className="text-steel">Cargando módulo de check-in...</p>
        </div>
      </div>
    );
  }

  const attendancePercent =
    event?.totalRegistrations > 0
      ? Math.round((event.checkedInCount / event.totalRegistrations) * 100)
      : 0;

  return (
    <div className="min-h-screen flex flex-col bg-cream text-navy">
      <AdminNavbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 flex-1 w-full space-y-6">
        {/* Header Navigation */}
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
                Control de Acceso / Check-in en Puerta
              </h1>
              <p className="text-xs text-sienna font-medium">{event?.title}</p>
            </div>
          </div>

          {/* Live Counter Badge & Manual Register Button */}
          <div className="flex items-center gap-3">
            <div className="bg-white border border-sand px-4 py-2 rounded-2xl flex items-center gap-3 shadow-md">
              <UserCheck className="w-5 h-5 text-gold" />
              <div>
                <span className="text-[10px] uppercase font-bold text-steel block">Ingresados</span>
                <span className="text-sm font-black text-navy">
                  {event?.checkedInCount} / {event?.totalRegistrations} ({attendancePercent}%)
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowManualModal(true)}
              className="bg-emerald-600 hover:bg-sand0 text-navy px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/20 flex items-center gap-2"
            >
              <UserPlus className="w-4 h-4" />
              Registro en Puerta (Manual)
            </button>
          </div>
        </div>

        {/* Scan Result Alert Banner */}
        {scanResult && (
          <div
            className={`p-5 rounded-3xl border shadow-xl flex items-start gap-4 transition-all animate-fadeIn ${
              scanResult.status === "success"
                ? "bg-emerald-50 border-emerald-500 text-emerald-800"
                : scanResult.status === "warning"
                ? "bg-amber-50 border-amber-500 text-amber-900"
                : scanResult.status === "verify"
                ? "bg-sky-50 border-sky-500 text-sky-900"
                : "bg-red-50 border-red-500 text-red-900"
            }`}
          >
            {scanResult.status === "success" && (
              <CheckCircle2 className="w-8 h-8 text-gold shrink-0 mt-0.5" />
            )}
            {scanResult.status === "warning" && (
              <AlertTriangle className="w-8 h-8 text-amber-400 shrink-0 mt-0.5" />
            )}
            {scanResult.status === "verify" && (
              <UserCheck className="w-8 h-8 text-sienna shrink-0 mt-0.5" />
            )}
            {scanResult.status === "error" && (
              <XCircle className="w-8 h-8 text-red-400 shrink-0 mt-0.5" />
            )}

            <div className="flex-1">
              <h3 className="font-extrabold text-base tracking-tight">{scanResult.message}</h3>

              {scanResult.registration && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-navy/10 text-xs">
                  <div>
                    <span className="text-steel block text-[10px]">Nombre:</span>
                    <strong className="text-navy">{scanResult.registration.fullName}</strong>
                  </div>
                  <div>
                    <span className="text-steel block text-[10px]">Cédula:</span>
                    <strong className="text-navy">{scanResult.registration.nationalId}</strong>
                  </div>
                  <div>
                    <span className="text-steel block text-[10px]">Código Boleto:</span>
                    <strong className="font-mono text-sienna">{scanResult.registration.ticketCode}</strong>
                  </div>
                  <div>
                    <span className="text-steel block text-[10px]">Grupo Estudiantil:</span>
                    <strong className="text-navy">
                      {scanResult.registration.belongsToGroup
                        ? scanResult.registration.groupName || "Sí"
                        : "Particular"}
                    </strong>
                  </div>
                </div>
              )}

              {scanResult.status === "warning" && scanResult.registration && (
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => registerExit(scanResult.registration.id)}
                    disabled={searching}
                    className="flex-1 bg-amber-600 hover:bg-amber-500 text-navy font-bold py-2 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowLeft className="w-5 h-5" />}
                    Registrar Salida (Permitir Reingreso)
                  </button>
                </div>
              )}

              {scanResult.status === "verify" && scanResult.registration && (
                <div className="mt-4 flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => confirmAccess(scanResult.registration.id)}
                    disabled={searching}
                    className="flex-1 bg-sienna text-white hover:bg-sky-400 text-navy font-bold py-2 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
                    Confirmar Ingreso
                  </button>
                  <button
                    onClick={() => setScanResult(null)}
                    disabled={searching}
                    className="bg-white hover:bg-sand text-navy font-medium py-2 px-4 rounded-xl border border-sand transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <X className="w-4 h-4" /> Cancelar
                  </button>
                </div>
              )}
            </div>

            <button
              onClick={() => setScanResult(null)}
              className="text-steel hover:text-navy p-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Main Grid: QR Scanner + Manual Search */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Columna Izquierda: Escáner QR de Cámara (7 cols) */}
          <div className="lg:col-span-7">
            <QRScanner onScanSuccess={handleQRScanned} />
          </div>

          {/* Columna Derecha: Búsqueda Rápida Manual (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-sand rounded-3xl p-6 shadow-xl">
              <h3 className="font-bold text-base text-navy flex items-center gap-2 mb-2">
                <Search className="w-5 h-5 text-sienna" /> Búsqueda Rápida de Asistente
              </h3>
              <p className="text-xs text-steel mb-4">
                Si el asistente no tiene el QR a mano, escribe su <strong>Cédula</strong>, <strong>ID Epik</strong>, <strong>Correo</strong> o <strong>Código de Boleto</strong>:
              </p>

              <form onSubmit={handleSearchSubmit} className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-steel absolute left-3.5 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Ej. 1020304050 o TICK-A9X2B4"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-sand text-navy text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 placeholder-slate-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={searching || !searchQuery.trim()}
                  className="w-full bg-terra text-white hover:bg-sienna text-white disabled:opacity-50 text-navy font-bold py-2.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-sky-600/20"
                >
                  {searching ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Buscando y verificando...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Validar Ingreso
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Quick Tips */}
            <div className="bg-white/50 border border-sand/80 rounded-2xl p-4 text-xs text-steel space-y-2">
              <span className="font-semibold text-slateblue block">💡 Consejos para la puerta:</span>
              <p>• El escáner QR detecta el boleto directamente desde la pantalla de cualquier celular.</p>
              <p>• Si una persona no se preinscribió, usa el botón verde <strong>"Registro en Puerta"</strong> arriba.</p>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL DE REGISTRO MANUAL EN PUERTA */}
      {showManualModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cream/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white border border-sand rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-5 my-8">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-gold" /> Registro Manual en Puerta
                </h3>
                <p className="text-xs text-steel mt-0.5">
                  Para personas no inscritas con anticipación. Quedará marcado como asistente inmediatamente.
                </p>
              </div>
              <button
                onClick={() => setShowManualModal(false)}
                className="text-steel hover:text-navy p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {manualError && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs">
                {manualError}
              </div>
            )}

            <form onSubmit={handleManualRegister} className="space-y-4">
              {event?.hasShifts && (
                <div>
                  <label className="block text-xs font-semibold text-slateblue mb-1">
                    Seleccionar Turno <span className="text-red-400">*</span>
                  </label>
                  <select
                    required
                    value={manualForm.shiftId}
                    onChange={(e) => setManualForm({ ...manualForm, shiftId: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-sand text-navy text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="">-- Elige un turno --</option>
                    {event.shifts?.map((shift: any) => (
                      <option key={shift.id} value={shift.id}>
                        {shift.name} {shift.startTime ? `(${shift.startTime})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slateblue mb-1">
                  Nombre Completo <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={manualForm.fullName}
                  onChange={(e) => setManualForm({ ...manualForm, fullName: e.target.value })}
                  placeholder="Nombre y Apellidos"
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-sand text-navy text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slateblue mb-1">
                    Cédula / ID <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={manualForm.nationalId}
                    onChange={(e) => setManualForm({ ...manualForm, nationalId: e.target.value })}
                    placeholder="Documento"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-sand text-navy text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slateblue mb-1">
                    ID Epik (Opcional)
                  </label>
                  <input
                    type="text"
                    value={manualForm.epikId}
                    onChange={(e) => setManualForm({ ...manualForm, epikId: e.target.value })}
                    placeholder="Epik ID"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-sand text-navy text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slateblue mb-1">
                    Correo <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={manualForm.email}
                    onChange={(e) => setManualForm({ ...manualForm, email: e.target.value })}
                    placeholder="correo@ejemplo.com"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-sand text-navy text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slateblue mb-1">
                    Celular
                  </label>
                  <input
                    type="tel"
                    value={manualForm.phone}
                    onChange={(e) => setManualForm({ ...manualForm, phone: e.target.value })}
                    placeholder="Celular"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-sand text-navy text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slateblue mb-1">
                    EPS
                  </label>
                  <input
                    type="text"
                    value={manualForm.eps}
                    onChange={(e) => setManualForm({ ...manualForm, eps: e.target.value })}
                    placeholder="EPS"
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-sand text-navy text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slateblue mb-1">
                    Grupo Sanguíneo
                  </label>
                  <select
                    value={manualForm.bloodType}
                    onChange={(e) => setManualForm({ ...manualForm, bloodType: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-white border border-sand text-navy text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              <div className="bg-sand p-3 rounded-xl space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={manualForm.belongsToGroup}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, belongsToGroup: e.target.checked })
                    }
                    className="w-3.5 h-3.5 text-terra rounded bg-slate-700 border-slate-600"
                  />
                  <span className="text-xs text-slateblue">¿Pertenece a algún grupo o colectivo?</span>
                </label>

                {manualForm.belongsToGroup && (
                  <input
                    type="text"
                    value={manualForm.groupName}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, groupName: e.target.value })
                    }
                    placeholder="Nombre del grupo"
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-sand text-navy text-xs"
                  />
                )}
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="bg-white hover:bg-sand text-slateblue px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={manualSubmitting}
                  className="bg-emerald-600 hover:bg-sand0 disabled:opacity-50 text-navy font-bold px-5 py-2 rounded-xl text-xs shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
                >
                  {manualSubmitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Registrando...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Registrar y Permitir Entrada
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
