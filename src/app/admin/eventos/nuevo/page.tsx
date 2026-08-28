"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
  GripVertical,
  ArrowUp,
  ArrowDown,
  RotateCcw
} from "lucide-react";
import Link from "next/link";
import { slugify } from "@/lib/utils";

interface FieldItem {
  id: string;
  label: string;
  fieldKey: string;
  fieldType: string;
  optionsInput: string;
  dependsOn: string | null;
  isRequired: boolean;
  isDefault: boolean;
}

const DEFAULT_FIELDS: FieldItem[] = [
  { id: "def_1", fieldKey: "nationalId", label: "Cédula de Ciudadanía / Documento", fieldType: "number", optionsInput: "", dependsOn: null, isRequired: true, isDefault: true },
  { id: "def_2", fieldKey: "fullName", label: "Nombre Completo", fieldType: "text", optionsInput: "", dependsOn: null, isRequired: true, isDefault: true },
  { id: "def_3", fieldKey: "email", label: "Correo Institucional", fieldType: "email", optionsInput: "", dependsOn: null, isRequired: true, isDefault: true },
  { id: "def_4", fieldKey: "epikId", label: "ID de Epik", fieldType: "number", optionsInput: "", dependsOn: null, isRequired: true, isDefault: true },
  { id: "def_5", fieldKey: "phone", label: "Teléfono Celular / WhatsApp", fieldType: "tel", optionsInput: "", dependsOn: null, isRequired: true, isDefault: true },
  { id: "def_6", fieldKey: "eps", label: "EPS", fieldType: "text", optionsInput: "", dependsOn: null, isRequired: true, isDefault: true },
  { id: "def_7", fieldKey: "bloodType", label: "Grupo Sanguíneo y RH", fieldType: "select", optionsInput: "O+, O-, A+, A-, B+, B-, AB+, AB-", dependsOn: null, isRequired: true, isDefault: true },
  { id: "def_8", fieldKey: "belongsToGroup", label: "¿Pertenece a algún grupo estudiantil?", fieldType: "boolean", optionsInput: "", dependsOn: null, isRequired: true, isDefault: true },
  { id: "def_9", fieldKey: "groupName", label: "En caso afirmativo, ¿a cuál grupo pertenece?", fieldType: "select", optionsInput: "Grupo A, Grupo B, Grupo C", dependsOn: "belongsToGroup", isRequired: true, isDefault: true },
];

export default function CreateEventPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Event form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [maxCapacity, setMaxCapacity] = useState(100);
  const [isPublished, setIsPublished] = useState(true);

  // Shifts state
  const [hasShifts, setHasShifts] = useState(false);
  const [shifts, setShifts] = useState([{ id: "s1", name: "Turno 1", startTime: "", endTime: "" }]);

  // All fields (default + custom) in a single editable list
  const [fields, setFields] = useState<FieldItem[]>(
    DEFAULT_FIELDS.map((f) => ({ ...f }))
  );

  // --- Field Management ---
  const addField = () => {
    const newField: FieldItem = {
      id: "new_" + Date.now().toString(),
      label: "",
      fieldKey: "",
      fieldType: "text",
      optionsInput: "",
      dependsOn: null,
      isRequired: false,
      isDefault: false,
    };
    setFields((prev) => [...prev, newField]);
  };

  const removeField = (id: string) => {
    setFields((prev) => prev.filter((f) => f.id !== id));
  };

  const updateField = (id: string, updates: Partial<FieldItem>) => {
    setFields((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates } : f))
    );
  };

  const moveField = (index: number, direction: "up" | "down") => {
    const newFields = [...fields];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newFields.length) return;
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    setFields(newFields);
  };

  const resetToDefaults = () => {
    if (confirm("¿Restablecer todas las preguntas a los valores predeterminados? Se perderán las preguntas personalizadas que hayas agregado.")) {
      setFields(DEFAULT_FIELDS.map((f) => ({ ...f })));
    }
  };

  // --- Shifts Management ---
  const addShift = () => {
    setShifts((prev) => [...prev, { id: "s" + Date.now(), name: `Turno ${prev.length + 1}`, startTime: "", endTime: "" }]);
  };
  const removeShift = (id: string) => {
    setShifts((prev) => prev.filter((s) => s.id !== id));
  };
  const updateShift = (id: string, field: string, value: string) => {
    setShifts((prev) => prev.map((s) => (s.id === id ? { ...s, [field]: value } : s)));
  };

  // --- Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      // Separar campos base de los personalizados para la API
      const allFieldsPayload = fields.map((f, idx) => {
        const options = f.optionsInput
          ? f.optionsInput.split(",").map((s) => s.trim()).filter(Boolean)
          : [];
        return {
          fieldKey: f.fieldKey || f.label.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 30),
          label: f.label,
          fieldType: f.fieldType,
          options: options.length > 0 ? options : undefined,
          dependsOn: f.dependsOn || null,
          isRequired: f.isRequired,
          isDefault: f.isDefault,
          orderIndex: idx + 1,
        };
      });

      // Separar: los campos con isDefault van como modificación de defaults, los demás como customFields
      const defaultFieldsPayload = allFieldsPayload.filter((f) => f.isDefault);
      const customFieldsPayload = allFieldsPayload.filter((f) => !f.isDefault);

      const payload = {
        title,
        description,
        location,
        startDate,
        endDate: endDate || null,
        maxCapacity,
        isPublished,
        hasShifts,
        shifts: hasShifts ? shifts : [],
        customFields: customFieldsPayload,
        defaultFieldsOverride: defaultFieldsPayload,
      };

      const res = await fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al crear el evento");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message);
      setLoading(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

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
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight font-display">Crear Nuevo Evento</h1>
            <p className="text-xs text-steel mt-1">Configura detalles, tope de aforo y preguntas del formulario</p>
          </div>
        </div>

        {errorMsg && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl flex items-start gap-2.5 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Card 1: Información Básica del Evento */}
          <div className="bg-white border border-sand rounded-3xl p-6 sm:p-8 space-y-6">
            <h2 className="text-base font-bold text-navy flex items-center gap-2 font-display">
              <CalendarDays className="w-5 h-5 text-sienna" /> Información General del Evento
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
                  placeholder="Ej. Congreso Anual de Innovación y Tecnología 2026"
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-sand text-navy text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slateblue mb-1.5">
                  Descripción o Instrucciones
                </label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explica de qué trata el evento, requisitos de vestimenta o agenda general..."
                  className="w-full px-4 py-2.5 rounded-xl bg-white border border-sand text-navy text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slateblue mb-1.5">
                    Lugar / Auditorio / Enlace
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="Ej. Auditorio Principal - Bloque B"
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-sand text-navy text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slateblue mb-1.5">
                    Tope Máximo de Asistentes (Aforo) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={maxCapacity}
                    onChange={(e) => setMaxCapacity(parseInt(e.target.value, 10) || 1)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-sand text-navy text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <span className="text-[10px] text-steel mt-1 block">El formulario se cerrará automáticamente al llegar a este número</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slateblue mb-1.5">
                    Fecha y Hora de Inicio <span className="text-red-400">*</span>
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
                    Fecha y Hora de Fin (Opcional)
                  </label>
                  <input
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white border border-sand text-navy text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="pt-2 border-b border-sand/50 pb-6">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-4 h-4 text-terra rounded bg-white border-sand focus:ring-sky-500"
                  />
                  <span className="text-xs font-semibold text-navy">
                    Publicar inmediatamente en el catálogo de eventos
                  </span>
                </label>
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
                  <div className="bg-sand/30 p-4 rounded-2xl border border-sand space-y-3">
                    {shifts.map((shift, idx) => (
                      <div key={shift.id} className="flex flex-col sm:flex-row gap-3 items-end">
                        <div className="w-full sm:w-1/3">
                          <label className="block text-[10px] font-bold text-slateblue mb-1 uppercase tracking-wider">Nombre del Turno</label>
                          <input type="text" value={shift.name} onChange={(e) => updateShift(shift.id, "name", e.target.value)} required placeholder="Ej. Mañana" className="w-full px-3 py-2 rounded-xl border border-sand text-xs" />
                        </div>
                        <div className="w-full sm:w-1/4">
                          <label className="block text-[10px] font-bold text-slateblue mb-1 uppercase tracking-wider">Inicio (Opcional)</label>
                          <input type="time" value={shift.startTime} onChange={(e) => updateShift(shift.id, "startTime", e.target.value)} className="w-full px-3 py-2 rounded-xl border border-sand text-xs" />
                        </div>
                        <div className="w-full sm:w-1/4">
                          <label className="block text-[10px] font-bold text-slateblue mb-1 uppercase tracking-wider">Fin (Opcional)</label>
                          <input type="time" value={shift.endTime} onChange={(e) => updateShift(shift.id, "endTime", e.target.value)} className="w-full px-3 py-2 rounded-xl border border-sand text-xs" />
                        </div>
                        <button type="button" onClick={() => removeShift(shift.id)} disabled={shifts.length === 1} className="p-2.5 text-steel hover:text-red-500 hover:bg-white rounded-xl transition-colors disabled:opacity-30 border border-transparent disabled:hover:border-transparent hover:border-sand" title="Eliminar turno">
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
            </div>
          </div>

          {/* Card 2: Constructor de Preguntas del Formulario (TODAS EDITABLES) */}
          <div className="bg-white border border-sand rounded-3xl p-6 sm:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-bold text-navy flex items-center gap-2 font-display">
                  <Sparkles className="w-5 h-5 text-amber-400" /> Preguntas del Formulario de Registro
                </h2>
                <p className="text-xs text-steel mt-0.5">
                  Edita las etiquetas, el tipo, el orden o elimina cualquier pregunta. También puedes agregar preguntas nuevas específicas para este evento.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={resetToDefaults}
                  className="bg-white hover:bg-sand text-steel hover:text-navy border border-sand px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                  title="Restablecer preguntas predeterminadas"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Restablecer
                </button>
                <button
                  type="button"
                  onClick={addField}
                  className="bg-white hover:bg-sand text-sienna border border-terra/30 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Pregunta
                </button>
              </div>
            </div>

            {fields.length === 0 ? (
              <div className="border border-dashed border-sand rounded-2xl p-8 text-center text-sm text-steel">
                <p className="font-medium">No hay preguntas configuradas.</p>
                <p className="text-xs mt-1">Agrega al menos una pregunta o restablece a los valores predeterminados.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {fields.map((field, idx) => (
                  <div
                    key={field.id}
                    className={`border rounded-2xl p-4 space-y-3 transition-all ${
                      field.isDefault
                        ? "bg-white/40 border-sand/80"
                        : "bg-sky-950/20 border-terra/20"
                    }`}
                  >
                    {/* Header row */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-sienna">#{idx + 1}</span>
                        {field.isDefault ? (
                          <span className="text-[10px] bg-sand text-navy px-2 py-0.5 rounded font-bold border border-sand">
                            Base
                          </span>
                        ) : (
                          <span className="text-[10px] bg-terra text-white px-2 py-0.5 rounded font-medium border border-terra/20">
                            Personalizada
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => moveField(idx, "up")}
                          disabled={idx === 0}
                          className="text-steel hover:text-navy disabled:opacity-25 p-1 rounded transition-colors"
                          title="Subir"
                        >
                          <ArrowUp className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveField(idx, "down")}
                          disabled={idx === fields.length - 1}
                          className="text-steel hover:text-navy disabled:opacity-25 p-1 rounded transition-colors"
                          title="Bajar"
                        >
                          <ArrowDown className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => removeField(field.id)}
                          className="text-steel hover:text-red-400 p-1 rounded transition-colors ml-1"
                          title="Eliminar esta pregunta"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Editable fields */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      <div className="sm:col-span-6">
                        <label className="block text-[11px] font-semibold text-slateblue mb-1">
                          Texto de la Pregunta / Etiqueta
                        </label>
                        <input
                          type="text"
                          required
                          value={field.label}
                          onChange={(e) => updateField(field.id, { label: e.target.value })}
                          placeholder="Ej. Talla de Camiseta"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-sand text-navy text-xs focus:outline-none focus:ring-2 focus:ring-terra"
                        />
                      </div>

                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-semibold text-slateblue mb-1">
                          Tipo de Respuesta
                        </label>
                        <select
                          value={field.fieldType}
                          onChange={(e) => updateField(field.id, { fieldType: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-sand text-navy text-xs focus:outline-none focus:ring-2 focus:ring-terra"
                        >
                          <option value="text">Texto Corto</option>
                          <option value="number">Número</option>
                          <option value="email">Correo</option>
                          <option value="tel">Teléfono</option>
                          <option value="select">Opciones (Desplegable)</option>
                          <option value="boolean">Casilla Sí / No</option>
                        </select>
                      </div>

                      <div className="sm:col-span-3 flex items-end pb-0.5">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={field.isRequired}
                            onChange={(e) => updateField(field.id, { isRequired: e.target.checked })}
                            className="w-3.5 h-3.5 text-terra rounded bg-white border-sand focus:ring-terra"
                          />
                          <span className="text-xs text-slateblue">Obligatoria</span>
                        </label>
                      </div>
                    </div>

                    {field.fieldType === "select" && (
                      <div>
                        <label className="block text-[11px] font-semibold text-slateblue mb-1">
                          Opciones separadas por coma
                        </label>
                        <input
                          type="text"
                          required
                          value={field.optionsInput}
                          onChange={(e) => updateField(field.id, { optionsInput: e.target.value })}
                          placeholder="Ej. S, M, L, XL, XXL"
                          className="w-full px-3 py-2 rounded-xl bg-white border border-sand text-navy text-xs focus:outline-none focus:ring-2 focus:ring-terra"
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
                        onChange={(e) => updateField(field.id, { dependsOn: e.target.value || null })}
                        className="w-full sm:w-1/2 px-3 py-2 rounded-xl bg-white border border-sand text-slateblue text-xs focus:outline-none focus:ring-2 focus:ring-terra"
                      >
                        <option value="">Mostrar siempre (No depende de nada)</option>
                        {fields.slice(0, idx).filter(f => f.fieldType === "boolean").map(bf => (
                          <option key={bf.id} value={bf.fieldKey || slugify(bf.label)}>
                            {bf.label || "Pregunta sin título"}
                          </option>
                        ))}
                      </select>
                      <span className="text-[10px] text-steel ml-2">
                        (Solo aplica para preguntas de tipo Casilla Sí / No)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end gap-3 pt-4">
            <Link
              href="/admin"
              className="bg-white hover:bg-sand text-slateblue px-5 py-3 rounded-xl font-semibold text-sm transition-all"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="bg-terra hover:bg-sienna text-white disabled:opacity-50 font-bold px-7 py-3 rounded-xl shadow-lg shadow-terra/30 transition-all flex items-center gap-2 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Guardando Evento...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Crear y Guardar Evento
                </>
              )}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
