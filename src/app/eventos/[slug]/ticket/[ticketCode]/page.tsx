"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Calendar, MapPin, CheckCircle, Printer, Download, ArrowLeft, Loader2, AlertCircle, Share2, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default function TicketPage() {
  const params = useParams();
  const ticketCode = params.ticketCode as string;
  const slug = params.slug as string;

  const [ticketData, setTicketData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  const handleCancelTicket = async () => {
    if (!confirm("¿Estás seguro que deseas cancelar tu asistencia? Al hacer esto, liberarás tu cupo y este código dejará de funcionar.")) return;
    
    setIsCancelling(true);
    try {
      const res = await fetch(`/api/tickets/${ticketCode}/cancel`, { method: "POST" });
      if (res.ok) {
        alert("Tu boleto ha sido cancelado exitosamente. Gracias por avisarnos.");
        window.location.reload();
      } else {
        alert("Hubo un error al cancelar el boleto.");
      }
    } catch (error) {
      console.error(error);
      alert("Error de conexión");
    } finally {
      setIsCancelling(false);
    }
  };

  useEffect(() => {
    async function loadTicket() {
      try {
        setLoading(true);
        const res = await fetch(`/api/tickets/${ticketCode}`);
        if (!res.ok) {
          throw new Error("No se encontró el boleto solicitado");
        }
        const data = await res.json();
        setTicketData(data);
      } catch (err: any) {
        setError(err.message || "Error al cargar boleto");
      } finally {
        setLoading(false);
      }
    }

    if (ticketCode) {
      loadTicket();
    }
  }, [ticketCode]);

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Mi boleto para ${ticketData?.event?.title}`,
        text: `Boleto de entrada oficial para ${ticketData?.event?.title} (Código: ${ticketCode})`,
        url: window.location.href,
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-cream">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <Loader2 className="w-10 h-10 text-terra animate-spin mb-4" />
          <p className="text-slate-600 font-medium">Cargando tu boleto digital...</p>
        </div>
      </div>
    );
  }

  if (error || !ticketData) {
    return (
      <div className="min-h-screen flex flex-col bg-cream">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-navy font-display">Boleto no encontrado</h2>
          <p className="text-slate-600 text-sm mt-2 mb-6">
            El código de entrada ingresado no coincide con ningún registro activo.
          </p>
          <Link href="/" className="bg-white text-navy px-5 py-2.5 rounded-xl text-sm font-medium">
            Ir a la página principal
          </Link>
        </div>
      </div>
    );
  }

  const { registration, event, qrCodeDataUrl } = ticketData;

  return (
    <div className="min-h-screen print:min-h-0 flex flex-col bg-sand print:bg-white">
      <div className="no-print">
        <Navbar />
      </div>

      <main className="max-w-2xl mx-auto px-4 py-8 sm:py-12 print:py-4 flex-1 w-full print:flex-none">
        <div className="no-print flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <Link
            href={`/eventos/${slug}`}
            className="flex items-center gap-2 text-sm font-medium text-steel hover:text-navy transition-colors w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver al evento
          </Link>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleShare}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white text-slate-700 border border-sand px-4 py-2 rounded-xl text-sm font-medium hover:bg-cream transition-colors"
            >
              <Share2 className="w-4 h-4" />
              {copied ? "¡Copiado!" : "Compartir"}
            </button>
            <button
              onClick={handlePrint}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-terra text-white px-5 py-2 rounded-xl text-sm font-semibold hover:bg-sky-700 transition-colors shadow-sm"
            >
              <Download className="w-4 h-4" />
              Guardar / Descargar
            </button>
          </div>
        </div>

        <div className="no-print mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-sm">¡Importante! Guarda tu boleto ahora</p>
            <p className="text-xs mt-1">Por tu seguridad y privacidad, <strong>no enviamos el boleto por correo</strong>. Toma una captura de pantalla, descárgalo o imprímelo ahora mismo. Si lo pierdes, usa la opción "Recuperar Boleto". <strong>IMPORTANTE:</strong> No compartas este QR con nadie, el código es de un solo uso.</p>
          </div>
        </div>

        {/* Digital Ticket Card */}
        <div className="bg-white border border-sand print:border-slate-300 rounded-3xl overflow-hidden shadow-xl print:shadow-none print:break-inside-avoid">
          {/* Ticket Header Banner */}
          <div className="bg-gradient-to-r from-sky-700 to-blue-900 print:bg-none print:bg-white print:border-b print:border-sand text-navy print:text-navy p-6 sm:p-8 relative">
            <div className="flex justify-between items-start gap-4">
              <div>
                <span className="inline-block bg-white/20 print:bg-sand backdrop-blur-md text-navy print:text-slate-700 text-[11px] font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
                  Boleto Oficial de Entrada
                </span>
                <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight font-display">{event.title}</h1>
              </div>
              <div className="text-right">
                <span className="block text-[10px] text-sky-200 print:text-steel uppercase font-semibold">Código Único</span>
                <span className="font-mono text-sm sm:text-base font-bold bg-white text-sky-900 px-3 py-1 rounded-lg inline-block mt-1 shadow-sm print:shadow-none print:border print:border-sand">
                  {registration.ticketCode}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 pt-4 border-t border-white/20 print:border-sand text-xs text-sky-100 print:text-slate-600">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-sienna print:text-steel shrink-0" />
                <span>{formatDate(event.startDate)}</span>
              </div>
              {event.location && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-sienna print:text-steel shrink-0" />
                  <span>{event.location}</span>
                </div>
              )}
              {registration.shift && (
                <div className="flex items-center gap-2 sm:col-span-2">
                  <Calendar className="w-4 h-4 text-sienna print:text-steel shrink-0" />
                  <span className="font-bold">Turno asignado: {registration.shift.name}</span>
                  {(registration.shift.startTime || registration.shift.endTime) && (
                    <span className="text-sky-200 print:text-steel">
                      ({registration.shift.startTime || '--:--'} - {registration.shift.endTime || '--:--'})
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Ticket Cutout Dots separator */}
          <div className="relative flex items-center justify-between px-2 bg-white print:hidden">
            <div className="w-6 h-6 bg-sand rounded-full -ml-4 border-r border-sand" />
            <div className="flex-1 border-t-2 border-dashed border-sand mx-3" />
            <div className="w-6 h-6 bg-sand rounded-full -mr-4 border-l border-sand" />
          </div>

          {/* Ticket Body with QR and Attendee Info */}
          <div className="p-6 sm:p-8 print:p-6 space-y-6 print:space-y-4">
            {/* QR Section with Anti-Screenshot UI */}
            <div className="bg-cream print:bg-white border border-sand/80 print:border-slate-300 rounded-2xl p-6 print:p-4 text-center select-none relative">
              
              {registration.isCancelled && (
                <div className="absolute inset-0 z-20 bg-white/80 backdrop-blur-[2px] flex items-center justify-center rounded-2xl flex-col">
                  <div className="bg-red-100 text-red-600 px-6 py-3 rounded-2xl border border-red-200 shadow-sm font-bold flex items-center gap-2 text-lg">
                    <AlertCircle className="w-6 h-6" />
                    BOLETO CANCELADO
                  </div>
                  <p className="text-slate-600 font-medium text-sm mt-2 px-6">
                    Este boleto fue anulado y ya no es válido para acceder al evento.
                  </p>
                </div>
              )}

              <span className="text-xs font-bold text-steel uppercase tracking-wider block mb-1">
                Código QR para Check-in en Puerta
              </span>
              <div className="flex items-center justify-center gap-1.5 mb-3 text-[10px] font-bold text-amber-600 bg-amber-50 inline-flex px-3 py-1 rounded-full border border-amber-200 print:border-none print:bg-transparent print:text-steel">
                <ShieldCheck className="w-3.5 h-3.5 print:hidden" /> 
                <span className="animate-pulse print:animate-none print:font-normal">Boleto en Vivo - Capturas no permitidas</span>
              </div>
              
              <div className="relative inline-block bg-white p-3 rounded-2xl shadow-sm print:shadow-none border border-sand overflow-hidden group">
                {/* Sweeping Scanner Line Animation */}
                <div className="absolute inset-0 z-10 pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-b before:from-transparent before:via-sky-400/20 before:to-transparent before:h-8 before:w-full before:animate-scan-line print:hidden" />
                
                <img
                  src={qrCodeDataUrl}
                  alt={`QR Code ${registration.ticketCode}`}
                  className="w-48 h-48 sm:w-56 sm:h-56 print:w-40 print:h-40 mx-auto block pointer-events-none select-none"
                  onContextMenu={(e) => e.preventDefault()}
                  draggable="false"
                />
              </div>
              <p className="text-xs text-steel mt-3 font-medium">
                Muestra este código en la entrada del evento para confirmar tu llegada. 
              </p>
            </div>

            {/* Attendee Details Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 print:gap-2 pt-2">
              <div className="bg-cream print:bg-white p-3 print:p-2 rounded-xl border border-sand print:border-sand">
                <span className="text-[10px] uppercase font-bold text-steel block">Asistente</span>
                <span className="text-xs sm:text-sm font-bold text-navy truncate block mt-0.5">
                  {registration.fullName}
                </span>
              </div>

              <div className="bg-cream print:bg-white p-3 print:p-2 rounded-xl border border-sand print:border-sand">
                <span className="text-[10px] uppercase font-bold text-steel block">Cédula / ID</span>
                <span className="text-xs sm:text-sm font-bold text-navy truncate block mt-0.5">
                  {registration.nationalId}
                </span>
              </div>

              <div className="bg-cream print:bg-white p-3 print:p-2 rounded-xl border border-sand print:border-sand">
                <span className="text-[10px] uppercase font-bold text-steel block">Correo</span>
                <span className="text-xs sm:text-sm font-semibold text-navy truncate block mt-0.5">
                  {registration.email}
                </span>
              </div>

              {registration.epikId && (
                <div className="bg-cream print:bg-white p-3 print:p-2 rounded-xl border border-sand print:border-sand">
                  <span className="text-[10px] uppercase font-bold text-steel block">ID Epik</span>
                  <span className="text-xs sm:text-sm font-bold text-navy truncate block mt-0.5">
                    {registration.epikId}
                  </span>
                </div>
              )}

              <div className="bg-cream print:bg-white p-3 print:p-2 rounded-xl border border-sand print:border-sand">
                <span className="text-[10px] uppercase font-bold text-steel block">EPS / Sangre</span>
                <span className="text-xs sm:text-sm font-bold text-navy truncate block mt-0.5">
                  {registration.eps || "N/A"} ({registration.bloodType || "N/A"})
                </span>
              </div>

              <div className="bg-cream print:bg-white p-3 print:p-2 rounded-xl border border-sand print:border-sand">
                <span className="text-[10px] uppercase font-bold text-steel block">Grupo</span>
                <span className="text-xs sm:text-sm font-bold text-navy truncate block mt-0.5">
                  {registration.belongsToGroup ? registration.groupName || "Sí" : "Particular"}
                </span>
              </div>
            </div>

            {/* Attendance verification status badge */}
            <div className="text-center pt-2 print:pt-0">
              {registration.checkedIn ? (
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-bold bg-sand print:bg-transparent print:text-navy text-emerald-800 border border-emerald-300 print:border-none">
                  <CheckCircle className="w-4 h-4 text-gold print:text-steel" />
                  Entrada Ya Validada (Check-in Realizado)
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-semibold bg-sand print:bg-transparent print:text-steel text-sky-700 border border-sand print:border-none">
                  <ShieldCheck className="w-4 h-4 text-terra print:text-steel" />
                  Boleto Válido para Acceso
                </span>
              )}
            </div>
          </div>
          {/* Cancellation Button */}
          {!registration.isCancelled && (
            <div className="mt-8 text-center print:hidden pb-12">
              <button
                onClick={handleCancelTicket}
                disabled={isCancelling}
                className="text-xs font-semibold text-steel hover:text-red-500 transition-colors flex items-center gap-1 mx-auto underline decoration-slate-300 hover:decoration-red-300 underline-offset-4 disabled:opacity-50"
              >
                {isCancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <AlertCircle className="w-3.5 h-3.5" />}
                Ya no puedo asistir (Cancelar Boleto y Liberar Cupo)
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
