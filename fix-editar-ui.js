const fs = require('fs');
const path = './src/app/admin/eventos/[id]/editar/page.tsx';
let code = fs.readFileSync(path, 'utf8');

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
`;

code = code.replace(
  '          {/* Card 2: Editor de Preguntas y Campos del Formulario */}',
  shiftsUI + '\n\n          {/* Card 2: Editor de Preguntas y Campos del Formulario */}'
);

fs.writeFileSync(path, code);
