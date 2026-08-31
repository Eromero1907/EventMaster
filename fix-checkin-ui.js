const fs = require('fs');

const path = './src/app/admin/eventos/[id]/checkin/page.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add customAnswers and allergies to state
code = code.replace(
  'groupName: "",\n    shiftId: "",\n  });',
  'groupName: "",\n    shiftId: "",\n    hasAllergies: false,\n    allergiesDetails: "",\n  });\n  const [customAnswers, setCustomAnswers] = useState<Record<string, any>>({});'
);

// 2. Include customAnswers in handleManualRegister payload
code = code.replace(
  'body: JSON.stringify(manualForm),',
  'body: JSON.stringify({ ...manualForm, customAnswers }),'
);

// 3. Reset customAnswers on success
code = code.replace(
  'shiftId: "",\n      });',
  'shiftId: "",\n        hasAllergies: false,\n        allergiesDetails: "",\n      });\n      setCustomAnswers({});'
);

// 4. Inject Allergies and Custom Fields UI before the buttons
const allergiesUI = `
              <div className="bg-rose-50 p-3 rounded-xl space-y-2 border border-rose-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={manualForm.hasAllergies}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, hasAllergies: e.target.checked })
                    }
                    className="w-3.5 h-3.5 text-rose-500 rounded border-rose-300"
                  />
                  <span className="text-xs text-rose-700 font-semibold">¿Sufre de morbilidades o alergias?</span>
                </label>

                {manualForm.hasAllergies && (
                  <input
                    type="text"
                    required
                    value={manualForm.allergiesDetails}
                    onChange={(e) =>
                      setManualForm({ ...manualForm, allergiesDetails: e.target.value })
                    }
                    placeholder="¿Cuáles?"
                    className="w-full px-3 py-1.5 rounded-lg bg-white border border-rose-200 text-navy text-xs"
                  />
                )}
              </div>

              {event?.fields?.filter((f: any) => !f.isDefault).length > 0 && (
                <div className="space-y-3 pt-3 border-t border-sand">
                  <h4 className="text-xs font-bold text-steel">Preguntas Personalizadas</h4>
                  {event.fields.filter((f: any) => !f.isDefault).map((field: any) => (
                    <div key={field.id}>
                      <label className="block text-xs font-semibold text-slateblue mb-1">
                        {field.label} {field.isRequired && <span className="text-red-400">*</span>}
                      </label>
                      {field.fieldType === "select" ? (
                        <select
                          required={field.isRequired}
                          value={customAnswers[field.fieldKey] || ""}
                          onChange={(e) => setCustomAnswers({ ...customAnswers, [field.fieldKey]: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl bg-white border border-sand text-navy text-xs"
                        >
                          <option value="">-- Selecciona --</option>
                          {JSON.parse(field.optionsJson || "[]").map((opt: string) => (
                            <option key={opt} value={opt}>{opt}</option>
                          ))}
                        </select>
                      ) : (
                        <input
                          type={field.fieldType === "number" ? "number" : field.fieldType === "tel" ? "tel" : "text"}
                          required={field.isRequired}
                          value={customAnswers[field.fieldKey] || ""}
                          onChange={(e) => setCustomAnswers({ ...customAnswers, [field.fieldKey]: e.target.value })}
                          className="w-full px-3.5 py-2 rounded-xl bg-white border border-sand text-navy text-xs"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
`;

code = code.replace(
  '              <div className="flex justify-end gap-3 pt-2">',
  allergiesUI + '\n              <div className="flex justify-end gap-3 pt-2">'
);

fs.writeFileSync(path, code);
console.log("Checkin manual form updated!");
