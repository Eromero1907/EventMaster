"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import { Calendar, MapPin, Users, Ticket, CheckCircle2, AlertCircle, Loader2, ArrowLeft, HeartPulse, UserCheck, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface EventField {
  id: string;
  fieldKey: string;
  label: string;
  fieldType: string;
  optionsJson?: string | null;
  dependsOn?: string | null;
  isRequired: boolean;
  orderIndex: number;
  isDefault: boolean;
}

interface EventData {
  id: string;
  title: string;
  slug: string;
  description?: string;
  location?: string;
  startDate: string;
  endDate?: string;
  maxCapacity: number;
  totalRegistrations: number;
  remainingSpots: number;
  isSoldOut: boolean;
  fields: EventField[];
  hasShifts?: boolean;
  shifts?: Array<{ id: string; name: string; startTime?: string; endTime?: string }>;
  registrationsByShift?: Record<string, number>;
}

const formatShiftTime = (iso: string | null | undefined) => {
  if (!iso) return "--:--";
  try {
    const d = new Date(iso);
    let hours = d.getUTCHours();
    const minutes = d.getUTCMinutes().toString().padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12;
    hours = hours ? hours : 12;
    const hoursStr = hours.toString().padStart(2, "0");
    return `${hoursStr}:${minutes} ${ampm}`;
  } catch (e) {
    return "--:--";
  }
};

export default function EventRegistrationPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState<Record<string, any>>({
    fullName: "",
    email: "",
    nationalId: "",
    epikId: "",
    phone: "",
    eps: "",
    bloodType: "O+",
    belongsToGroup: false,
    groupName: "",
  });

  const [customAnswers, setCustomAnswers] = useState<Record<string, any>>({});
  const [selectedShift, setSelectedShift] = useState<string | null>(null);

  useEffect(() => {
    async function loadEvent() {
      try {
        setLoading(true);
        const res = await fetch(`/api/events/${slug}`);
        if (!res.ok) {
          throw new Error("No se pudo encontrar el evento");
        }
        const data = await res.json();
        setEvent(data);
      } catch (err: any) {
        setErrorMsg(err.message || "Error al cargar evento");
      } finally {
        setLoading(false);
      }
    }
    if (slug) {
      loadEvent();
    }
  }, [slug]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleCustomChange = (fieldKey: string, value: any) => {
    setCustomAnswers((prev) => ({ ...prev, [fieldKey]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSubmitting(true);

    if (event?.hasShifts && !selectedShift) {
      setErrorMsg("Debes seleccionar un turno para continuar.");
      setSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    try {
      const payload = {
        ...formData,
        customAnswers,
        shiftId: selectedShift,
      };

      const res = await fetch(`/api/events/${slug}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Ocurrió un error al procesar el registro");
      }

      // Redirigir a la página del boleto digital generado
      router.push(`/eventos/${slug}/ticket/${data.ticketCode}`);
    } catch (err: any) {
      setErrorMsg(err.message);
      setSubmitting(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-cream">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          <Loader2 className="w-10 h-10 text-terra animate-spin mb-4" />
          <p className="text-slate-600 font-medium">Cargando formulario de registro...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col bg-cream">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
          <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
          <h2 className="text-2xl font-bold text-navy font-display">Evento no encontrado</h2>
          <p className="text-slate-600 text-sm mt-2 mb-6">
            El enlace al que intentas acceder no existe o fue retirado por la administración.
          </p>
          <Link href="/" className="bg-white text-navy px-5 py-2.5 rounded-xl text-sm font-medium">
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

  const customFields = event.fields?.filter((f) => !f.isDefault) || [];

  const renderField = (fieldKey: string | EventField) => {
    const field = typeof fieldKey === "string" ? event.fields.find((f) => f.fieldKey === fieldKey) : fieldKey;
    if (!field) return null;

    if (field.dependsOn) {
      const parentValue = formData[field.dependsOn] || customAnswers[field.dependsOn];
      if (!parentValue) return null;
    }

    const isBaseField = field.isDefault;
    const value = isBaseField ? formData[field.fieldKey] : customAnswers[field.fieldKey];

    let options: string[] = [];
    if (field.optionsJson) {
      try {
        options = JSON.parse(field.optionsJson);
      } catch (e) {
        options = [];
      }
    }

    const renderInput = () => {
      if (field.fieldType === "select") {
        return (
          <select
            required={field.isRequired}
            value={value || ""}
            onChange={(e) => isBaseField ? handleChange(e as any) : handleCustomChange(field.fieldKey, e.target.value)}
            name={field.fieldKey}
            className="w-full px-4 py-2.5 rounded-xl border border-sand text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
          >
            <option value="">-- Selecciona una opción --</option>
            {options.map((opt, i) => (
              <option key={i} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        );
      }
      if (field.fieldType === "boolean") {
        return (
          <select
            required={field.isRequired}
            name={field.fieldKey}
            value={value ? "true" : "false"}
            onChange={(e) => {
               const val = e.target.value === "true";
               if (isBaseField) {
                 setFormData(prev => ({ ...prev, [field.fieldKey]: val }));
               } else {
                 handleCustomChange(field.fieldKey, val);
               }
            }}
            className="w-full px-4 py-2.5 rounded-xl border border-sand text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
          >
            <option value="false">No</option>
            <option value="true">Sí</option>
          </select>
        );
      }
      return (
        <input
          type={field.fieldType === "email" ? "email" : field.fieldType === "tel" ? "tel" : field.fieldType === "number" ? "number" : "text"}
          required={field.isRequired}
          name={field.fieldKey}
          value={value || ""}
          onChange={(e) => isBaseField ? handleChange(e) : handleCustomChange(field.fieldKey, e.target.value)}
          placeholder={
             field.fieldKey === "fullName" ? "Ej. Juan Andrés Pérez Gómez" :
             field.fieldKey === "nationalId" ? "Ej. 1020304050" :
             field.fieldKey === "email" ? "ejemplo@institucion.edu.co" :
             field.fieldKey === "phone" ? "Ej. 3001234567" :
             field.fieldKey === "eps" ? "Ej. Sura, Sanitas..." :
             field.fieldKey === "groupName" ? "Ej. Semillero de Robótica" :
             ""
          }
          className="w-full px-4 py-2.5 rounded-xl border border-sand text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
        />
      );
    };

    return (
      <div key={field.id} className={field.fieldType === "boolean" || field.fieldKey === "fullName" ? "sm:col-span-2" : "sm:col-span-1"}>
        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
          {field.label} {field.isRequired && <span className="text-red-500">*</span>}
          
        </label>
        {renderInput()}
        {field.fieldKey === "email" && <span className="text-[10px] text-steel mt-1 block">Aquí llegará tu boleto con código QR</span>}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-steel hover:text-navy mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a eventos
        </Link>

        {/* Event Header Banner */}
        <div className="bg-white border border-sand rounded-3xl p-6 sm:p-8 shadow-sm mb-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-sand text-sky-700 border border-sand">
              {formatDate(event.startDate)}
            </span>
            {event.isSoldOut ? (
              <span className="text-xs font-bold px-3 py-1 rounded-full bg-red-100 text-red-700">
                Cupos Agotados
              </span>
            ) : (
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-sand text-gold border border-ochre">
                {event.remainingSpots} cupos disponibles de {event.maxCapacity}
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight font-display">
            {event.title}
          </h1>

          {event.description && (
            <p className="text-slate-600 text-sm mt-3 leading-relaxed">
              {event.description}
            </p>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6 pt-6 border-t border-sand text-xs text-slate-600">
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-terra shrink-0" />
                <span className="font-medium">{event.location}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-terra shrink-0" />
              <span>
                Inscritos actualmente: <strong>{event.totalRegistrations} personas</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-2xl mb-8 flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm">No se pudo completar la inscripción</h4>
              <p className="text-xs mt-1">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Sold Out Notice */}
        {event.isSoldOut ? (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-8 text-center">
            <ShieldAlert className="w-12 h-12 text-amber-600 mx-auto mb-3" />
            <h3 className="text-xl font-bold text-amber-900">Inscripciones Cerradas</h3>
            <p className="text-sm text-amber-700 mt-2 max-w-md mx-auto">
              Se ha alcanzado el límite máximo de asistentes permitidos para este evento. No se aceptan más registros.
            </p>
          </div>
        ) : (
          /* Registration Form */
          <div className="bg-white border border-sand rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="border-b border-sand pb-4 mb-6">
              <h2 className="text-xl font-bold text-navy font-display">Formulario de Inscripción</h2>
              <p className="text-xs text-steel mt-1">
                Completa tus datos con precisión. Recibirás tu boleto y código QR de acceso automáticamente en tu correo.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Sección 0: Selección de Turno (si aplica) */}
              {event.hasShifts && event.shifts && event.shifts.length > 0 && (
                <div className="space-y-4 pb-6 border-b border-sand">
                  <h3 className="text-xs font-bold text-steel uppercase tracking-wider flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-sienna" /> Elige tu turno de asistencia
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {event.shifts.map(shift => {
                      const registeredCount = event.registrationsByShift?.[shift.id] || 0;
                      const shiftRemaining = Math.max(0, event.maxCapacity - registeredCount);
                      const isShiftFull = shiftRemaining <= 0;

                      return (
                        <label 
                          key={shift.id} 
                          className={`relative border rounded-xl p-4 cursor-pointer transition-all ${
                            isShiftFull 
                              ? 'opacity-50 bg-slate-50 border-slate-200 cursor-not-allowed' 
                              : selectedShift === shift.id 
                                ? 'border-terra bg-terra/5 ring-1 ring-terra' 
                                : 'border-sand bg-white hover:border-slate-300'
                          }`}
                        >
                          <input 
                            type="radio" 
                            name="shiftSelection" 
                            value={shift.id} 
                            disabled={isShiftFull}
                            checked={selectedShift === shift.id}
                            onChange={() => setSelectedShift(shift.id)}
                            className="sr-only"
                          />
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="block text-sm font-bold text-navy">{shift.name}</span>
                              {(shift.startTime || shift.endTime) && (
                                <span className="block text-xs text-slate-500 mt-1">
                                  {formatShiftTime(shift.startTime)} - {formatShiftTime(shift.endTime)}
                                </span>
                              )}
                            </div>
                            <div className="text-right">
                              {isShiftFull ? (
                                <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded border border-red-100">Agotado</span>
                              ) : (
                                <span className="text-[10px] font-semibold text-terra bg-terra/10 px-2 py-0.5 rounded border border-terra/20">
                                  {shiftRemaining} cupos
                                </span>
                              )}
                            </div>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Sección 1: Datos Personales e Identificación */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-steel uppercase tracking-wider flex items-center gap-1.5">
                  <UserCheck className="w-4 h-4 text-sienna" /> Identificación del Asistente
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {event.fields
                    .filter(f => ["fullName", "nationalId", "epikId", "email", "phone"].includes(f.fieldKey))
                    .sort((a, b) => a.orderIndex - b.orderIndex)
                    .map(field => renderField(field))}
                </div>
              </div>

              {/* Sección 2: Datos Médicos & Grupo */}
              <div className="space-y-4 pt-4 border-t border-sand">
                <h3 className="text-xs font-bold text-steel uppercase tracking-wider flex items-center gap-1.5">
                  <HeartPulse className="w-4 h-4 text-rose-500" /> Información Médica & Pertenencia
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {event.fields
                    .filter(f => ["eps", "bloodType", "belongsToGroup", "groupName"].includes(f.fieldKey))
                    .sort((a, b) => a.orderIndex - b.orderIndex)
                    .map(field => renderField(field))}
                </div>
              </div>

              {/* Sección 3: Preguntas Personalizadas Adicionales (Dinámicas) */}
              {customFields.length > 0 && (
                <div className="space-y-4 pt-4 border-t border-sand">
                  <h3 className="text-xs font-bold text-steel uppercase tracking-wider">
                    Preguntas Específicas del Evento
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {customFields
                      .sort((a, b) => a.orderIndex - b.orderIndex)
                      .map(field => renderField(field))}
                  </div>
                </div>
              )}

              {/* Botón de Envío */}
              <div className="pt-6 border-t border-sand">
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-terra text-white hover:bg-sienna text-white disabled:opacity-50 text-navy font-bold py-3.5 px-6 rounded-2xl shadow-lg shadow-sky-600/20 transition-all flex items-center justify-center gap-2 text-base"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Procesando inscripción y generando boleto...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      Confirmar mi Registro y Obtener Boleto
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
