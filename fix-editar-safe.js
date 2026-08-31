const fs = require('fs');
const path = './src/app/admin/eventos/[id]/editar/page.tsx';
let code = fs.readFileSync(path, 'utf8');

code = code.replace(
  'const [isPublished, setIsPublished] = useState(true);',
  'const [isPublished, setIsPublished] = useState(true);\n  const [hasShifts, setHasShifts] = useState(false);\n  const [shifts, setShifts] = useState<any[]>([]);'
);

code = code.replace(
  'setStartDate(data.startDate ? new Date(data.startDate).toISOString().slice(0, 16) : "");',
  'const startD = data.startDate ? new Date(data.startDate) : null;\n        setStartDate(startD ? new Date(startD.getTime() - startD.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");'
);

code = code.replace(
  'setEndDate(data.endDate ? new Date(data.endDate).toISOString().slice(0, 16) : "");',
  'const endD = data.endDate ? new Date(data.endDate) : null;\n        setEndDate(endD ? new Date(endD.getTime() - endD.getTimezoneOffset() * 60000).toISOString().slice(0, 16) : "");'
);

code = code.replace(
  'setIsPublished(data.isPublished);',
  'setIsPublished(data.isPublished);\n        setHasShifts(data.hasShifts || false);\n        setShifts(\n          data.shifts?.map((s: any) => ({\n            id: s.id,\n            name: s.name,\n            startTime: s.startTime ? new Date(new Date(s.startTime).getTime() - new Date(s.startTime).getTimezoneOffset() * 60000).toISOString().slice(11, 16) : "",\n            endTime: s.endTime ? new Date(new Date(s.endTime).getTime() - new Date(s.endTime).getTimezoneOffset() * 60000).toISOString().slice(11, 16) : "",\n          })) || []\n        );'
);

code = code.replace(
  'const addCustomField = () => {',
  'const addShift = () => {\n    setShifts([...shifts, { id: "temp_" + Date.now(), name: "", startTime: "", endTime: "" }]);\n  };\n  const removeShift = (id: string) => {\n    setShifts(shifts.filter((s) => s.id !== id));\n  };\n  const updateShift = (id: string, field: string, value: string) => {\n    setShifts(shifts.map((s) => (s.id === id ? { ...s, [field]: value } : s)));\n  };\n\n  const addCustomField = () => {'
);

code = code.replace(
  '        location,\n        startDate,\n        endDate: endDate || null,',
  '        location,\n        startDate: startDate ? new Date(startDate).toISOString() : "",\n        endDate: endDate ? new Date(endDate).toISOString() : null,'
);

code = code.replace(
  '        isPublished,\n        fields:',
  '        isPublished,\n        hasShifts,\n        shifts: hasShifts ? shifts : [],\n        fields:'
);

const shiftsUI = `
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
                          <input type="text" value={shift.name} onChange={(e) => updateShift(shift.id, "name", e.target.value)} required placeholder="Ej. Mañana" className="w-full max-w-full px-3 py-2 rounded-xl border border-sand text-xs" />
                        </div>
                        <div className="w-full sm:w-1/4 min-w-0">
                          <label className="block text-[10px] font-bold text-slateblue mb-1 uppercase tracking-wider">Inicio (Opcional)</label>
                          <input type="time" value={shift.startTime} onChange={(e) => updateShift(shift.id, "startTime", e.target.value)} className="w-full max-w-full px-3 py-2 rounded-xl border border-sand text-xs" />
                        </div>
                        <div className="w-full sm:w-1/4 min-w-0">
                          <label className="block text-[10px] font-bold text-slateblue mb-1 uppercase tracking-wider">Fin (Opcional)</label>
                          <input type="time" value={shift.endTime} onChange={(e) => updateShift(shift.id, "endTime", e.target.value)} className="w-full max-w-full px-3 py-2 rounded-xl border border-sand text-xs" />
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
`;

code = code.replace(
  '          {/* Card 2: Constructor de Preguntas',
  shiftsUI + '\n\n          {/* Card 2: Constructor de Preguntas'
);

fs.writeFileSync(path, code);
