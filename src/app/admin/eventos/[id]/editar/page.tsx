"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import AdminNavbar from "@/components/AdminNavbar";
import {
  CalendarDays,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Sparkles,
  CheckCircle2
} from "lucide-react";
import Link from "next/link";
import { slugify } from "@/lib/utils";

interface FieldItem {
  id?: string;
  fieldKey: string;
  label: string;
  fieldType: string;
  optionsJson?: string | null;
  optionsInput?: string;
  dependsOn?: string | null;
  isRequired: boolean;
  orderIndex?: number;
  isDefault: boolean;
}

export default function EditEventPage() {
  const params = useParams();
  const eventId = params.id as string;
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [maxCapacity, setMaxCapacity] = useState(100);
  const [isPublished, setIsPublished] = useState(true);
  const [hasShifts, setHasShifts] = useState(false);
  const [shifts, setShifts] = useState<any[]>([]);

  // Fields State
  const [fields, setFields] = useState<FieldItem[]>([]);

  useEffect(() => {
    async function loadEvent() {
      try {
        setLoading(true);
        const res = await fetch(`/api/admin/events/${eventId}`);
        if (!res.ok) throw new Error("No se pudo cargar el evento");
        const data = await res.json();

        setTitle(data.title);
        setDescription(data.description || "");
        setLocation(data.location || "");
        const startD = data.startDate ? new Date(data.startDate) : null;
        setStartDate(startD ? new Date(startD.getTime() - startD.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");
        const endD = data.endDate ? new Date(data.endDate) : null;
        setEndDate(endD ? new Date(endD.getTime() - endD.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");
        setMaxCapacity(data.maxCapacity);
        setIsPublished(data.isPublished);
        setHasShifts(data.hasShifts || false);
        setShifts(
          data.shifts?.map((s: any) => ({
            id: s.id,
            name: s.name,
            startTime: s.startTime ? new Date(new Date(s.startTime).getTime() - new Date(s.startTime).getTimezoneOffset() * 60000).toISOString().slice(11, 16) : "",
            endTime: s.endTime ? new Date(new Date(s.endTime).getTime() - new Date(s.endTime).getTimezoneOffset() * 60000).toISOString().slice(11, 16) : "",
          })) || []
        );

        // Formatear campos
        const formattedFields = (data.fields || []).map((f: any) => ({
          ...f,
          optionsInput: f.optionsJson ? JSON.parse(f.optionsJson).join(", ") : "",
        }));
        setFields(formattedFields);
      } catch (err: any) {
        setErrorMsg(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  const addShift = () => {
    setShifts([...shifts, { id: "temp_" + Date.now(), name: "", startTime: "", endTime: "" }]);
  };
  const removeShift = (id: string) => {
    setShifts(shifts.filter((s) => s.id !== id));
  };
  const updateShift = (id: string, field: string, value: string) => {
    setShifts(shifts.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  const addCustomField = () => {
    const newField: FieldItem = {
      id: "temp_" + Date.now().toString(),
      fieldKey: "pregunta_" + Date.now().toString().slice(-4),
      label: "",
      fieldType: "text",
      optionsInput: "",
      optionsJson: null,
      isRequired: false,
      isDefault: false,
    };
    setFields((prev) => [...prev, newField]);
  };

  const removeField = (index: number) => {
    setFields((prev) => prev.filter((_, i) => i !== index));
  };

  const updateField = (index: number, updates: Partial<FieldItem>) => {
    setFields((prev) =>
      prev.map((f, i) => {
        if (i === index) {
          const updated = { ...f, ...updates };
          if (updates.optionsInput !== undefined) {
            const arr = updates.optionsInput
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean);
            updated.optionsJson = JSON.stringify(arr);
          }
          return updated;
        }
        return f;
      })
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSaving(true);

    try {
      const payload = {
        title,
        description,
        location,
        startDate: startDate ? new Date(startDate).toISOString() : "",
        endDate: endDate ? new Date(endDate).toISOString() : null,
        maxCapacity,
        isPublished,
        hasShifts,
        shifts: hasShifts ? shifts : [],
        fields: fields.map((f) => ({
          fieldKey: f.fieldKey || f.label.toLowerCase().replace(/[^a-z0-9]/g, "_"),
          label: f.label,
          fieldType: f.fieldType,
          optionsJson: f.optionsJson,
          dependsOn: f.dependsOn || null,
          isRequired: f.isRequired,
          isDefault: f.isDefault,
        })),
      };

      const res = await fetch(`/api/admin/events/${eventId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al actualizar evento");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message);
      setSaving(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-cream text-navy">
        <div className="flex-1 flex flex-col items-center justify-center">
          <Loader2 className="w-10 h-10 text-sienna animate-spin mb-4" />
          <p className="text-steel">Cargando datos del evento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-cream text-navy">
      <AdminNavbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10 flex-1 w-full space-y-6">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 text-xs font-semibold text-steel hover:text-navy transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Volver al Dashboard
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight font-display">Editar Evento</h1>
            <p className="text-xs text-steel mt-1">Modifica configuración, aforo y preguntas del formulario</p>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl flex items-start gap-2.5 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Card 1: Información General */}
          <div className="bg-white border border-sand rounded-3xl p-6 sm:p-8 space-y-6">
            <h2 className="text-base font-bold text-navy flex items-center gap-2 font-display">
              <CalendarDays className="w-5 h-5 text-sienna" /> Datos Principales
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slateblue mb-1.5">
                  Nombre del Evento <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-sand text-navy text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slateblue mb-1.5">
                  Descripción
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-sand text-navy text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slateblue mb-1.5">
                    Lugar / Auditorio
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-sand text-navy text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slateblue mb-1.5">
                    Tope Máximo de Cupos (Aforo) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-sand text-navy text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slateblue mb-1.5">
                    Fecha y Hora Inicio <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="datetime-local"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-sand text-navy text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slateblue mb-1.5">
                    Fecha y Hora Fin (Opcional)
                  </label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-sand text-navy text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4 text-terra rounded bg-white border-sand focus:ring-sky-500"
                  />
                  <span className="text-xs font-semibold text-navy">
                    Evento Activo / Visible para registros públicos
                  </span>
                </label>
              </div>
            </div>
          </div>


              {/* Turnos (Shifts) Configuration */}
              <div className="pt-2 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-navy flex items-center gap-2">
                      Gestión de Turnos (Opcional)
                    </h3>
                    <p className="text-xs text-steel mt-1 max-w-lg">
                      Si tu evento requiere que la gente asista en horarios o grupos diferentes, activa los turnos. El aforo máximo aplicará para <b>cada turno</b> individualmente.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" checked={hasShifts} onChange={(e) => setHasShifts(e.target.checked)} />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-terra"></div>
                  </label>
                </div>

                {hasShifts && (
                  <div className="bg-sand/30 p-4 rounded-2xl border border-sand space-y-3 overflow-hidden">
                    {shifts.map((shift, idx) => (
                      <div key={shift.id} className="flex flex-col sm:flex-row gap-3 items-end overflow-hidden">
                        <div className="w-full sm:w-1/3 min-w-0">
                          <label className="block text-[10px] font-bold text-slateblue mb-1 uppercase tracking-wider">Nombre del Turno</label>
                          <input type="text" value={shift.name} onChange={(e) => updateShift(shift.id, "name", e.target.value)} required placeholder="Ej. Mañana" className="w-[calc(100vw-6rem)] sm:w-full px-3 py-2 rounded-xl border border-sand text-xs" />
                        </div>
                        <div className="w-full sm:w-1/4 min-w-0">
                          <label className="block text-[10px] font-bold text-slateblue mb-1 uppercase tracking-wider">Inicio (Opcional)</label>
                          <input type="time" value={shift.startTime} onChange={(e) => updateShift(shift.id, "startTime", e.target.value)} className="w-[calc(100vw-6rem)] sm:w-full px-3 py-2 rounded-xl border border-sand text-xs" />
                        </div>
                        <div className="w-full sm:w-1/4 min-w-0">
                          <label className="block text-[10px] font-bold text-slateblue mb-1 uppercase tracking-wider">Fin (Opcional)</label>
                          <input type="time" value={shift.endTime} onChange={(e) => updateShift(shift.id, "endTime", e.target.value)} className="w-[calc(100vw-6rem)] sm:w-full px-3 py-2 rounded-xl border border-sand text-xs" />
                        </div>
                        <button type="button" onClick={() => removeShift(shift.id)} className="p-2.5 text-steel hover:text-red-500 hover:bg-white rounded-xl transition-colors border border-transparent hover:border-sand shrink-0" title="Eliminar turno">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button type="button" onClick={addShift} className="text-xs font-bold text-sienna hover:text-terra flex items-center gap-1 mt-2 p-2 rounded-lg hover:bg-white/50 transition-colors">
                      <Plus className="w-4 h-4" /> Agregar otro turno
                    </button>
                  </div>
                )}
              </div>


          {/* Card 2: Editor de Preguntas y Campos del Formulario */}
          <div className="bg-white border border-sand rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-navy flex items-center gap-2 font-display">
                  <Sparkles className="w-5 h-5 text-amber-400" /> Preguntas del Formulario de Registro
                </h2>
                <p className="text-xs text-steel mt-0.5">
                  Puedes editar las etiquetas de las preguntas o agregar nuevas preguntas según lo necesites.
                </p>
              </div>

              <button
                type="button"
                onClick={addCustomField}
                className="bg-white hover:bg-sand text-sienna border border-terra/30 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
              >
                <Plus className="w-4 h-4" />
                Agregar Pregunta
              </button>
            </div>

            <div className="space-y-4">
              {fields.map((field, idx) => (
                <div
                  key={idx}
                  className="bg-white/50 border border-sand rounded-2xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-sienna">Pregunta #{idx + 1}</span>
                      {field.isDefault && (
                        <span className="text-[10px] bg-sand text-navy px-2 py-0.5 rounded font-medium">
                          Campo Base
                        </span>
                      )}
                    </div>

                    {!field.isDefault && (
                      <button
                        type="button"
                        onClick={() => removeField(idx)}
                        className="text-steel hover:text-red-400 p-1 rounded transition-colors"
                        title="Eliminar esta pregunta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold text-slateblue mb-1">
                        Etiqueta / Pregunta
                      </label>
                      <input
                        type="text"
                        required
                        value={field.label}
                        onChange={(e) => updateField(idx, { label: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-sand text-navy text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slateblue mb-1">
                        Tipo de Pregunta
                      </label>
                      <select
                        disabled={field.isDefault}
                        value={field.fieldType}
                        onChange={(e) => updateField(idx, { fieldType: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-sand text-navy text-xs focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-60"
                      >
                        <option value="text">Texto Corto</option>
                        <option value="number">Número</option>
                        <option value="email">Correo Electrónico</option>
                        <option value="tel">Teléfono</option>
                        <option value="select">Opciones de Selección</option>
                        <option value="boolean">Casilla Sí/No</option>
                      </select>
                    </div>
                  </div>

                  {field.fieldType === "select" && (
                    <div>
                      <label className="block text-[11px] font-semibold text-slateblue mb-1">
                        Opciones disponibles (separadas por coma)
                      </label>
                      <input
                        type="text"
                        value={field.optionsInput || ""}
                        onChange={(e) => updateField(idx, { optionsInput: e.target.value })}
                        className="w-full px-3 py-2 rounded-xl bg-white border border-sand text-navy text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                  )}

                  {/* Depends On field */}
                  <div className="pt-2 border-t border-sand/50">
                    <label className="block text-[11px] font-semibold text-steel mb-1">
                      Mostrar solo si la respuesta anterior es "Sí" en:
                    </label>
                    <select
                      value={field.dependsOn || ""}
                      onChange={(e) => updateField(idx, { dependsOn: e.target.value || null })}
                      className="w-full sm:w-1/2 px-3 py-2 rounded-xl bg-white border border-sand text-slateblue text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                    >
                      <option value="">Mostrar siempre (No depende de nada)</option>
                      {fields.slice(0, idx).filter(f => f.fieldType === "boolean").map(bf => (
                        <option key={bf.id || bf.fieldKey} value={bf.fieldKey || slugify(bf.label)}>
                          {bf.label || "Pregunta sin título"}
                        </option>
                      ))}
                    </select>
                    <span className="text-[10px] text-steel ml-2">
                      (Solo aplica para preguntas de tipo Casilla Sí / No)
                    </span>
                  </div>

                  <div>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={field.isRequired}
                        onChange={(e) => updateField(idx, { isRequired: e.target.checked })}
                        className="w-3.5 h-3.5 text-terra rounded bg-white border-sand"
                      />
                      <span className="text-xs text-slateblue">Obligatoria</span>
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end gap-3 pt-4">
            <Link
              href="/admin"
              className="bg-white hover:bg-sand text-slateblue px-5 py-3 rounded-xl font-semibold text-sm transition-all"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="bg-terra hover:bg-sienna text-white disabled:opacity-50 font-bold px-7 py-3 rounded-xl shadow-lg shadow-terra/30 transition-all flex items-center gap-2 text-sm"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando Cambios...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Guardar Modificaciones
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
