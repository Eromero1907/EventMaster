const fs = require('fs');

const path = './src/app/admin/page.tsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add Eye and EyeOff to lucide-react imports
code = code.replace(
  'Trash2,',
  'Trash2,\n  Eye,\n  EyeOff,'
);

// 2. Add handleTogglePublish function
const toggleFunction = `
  const handleTogglePublish = async (id: string, currentStatus: boolean) => {
    try {
      const res = await fetch(\`/api/admin/events/\${id}\`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublished: !currentStatus }),
      });
      if (res.ok) {
        setEvents(events.map(e => e.id === id ? { ...e, isPublished: !currentStatus } : e));
      } else {
        alert("Error al cambiar la visibilidad del evento.");
      }
    } catch (error) {
      console.error(error);
      alert("Error de red.");
    }
  };
`;

code = code.replace(
  'const handleDeleteEvent = async (id: string, title: string) => {',
  toggleFunction + '\n  const handleDeleteEvent = async (id: string, title: string) => {'
);

// 3. Add the button to the UI
const buttonUI = `
                            <button
                              onClick={() => handleTogglePublish(event.id, event.isPublished)}
                              className={\`text-xs p-1.5 rounded-lg transition-colors border \${
                                event.isPublished 
                                  ? "text-navy hover:text-terra bg-white border-sand" 
                                  : "text-steel hover:text-navy bg-sand border-slate-300"
                              }\`}
                              title={event.isPublished ? "Ocultar evento" : "Publicar evento"}
                            >
                              {event.isPublished ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
`;

code = code.replace(
  '<ExternalLink className="w-3.5 h-3.5" />\n                        </Link>\n                        {admin?.role !== "STAFF" && (',
  '<ExternalLink className="w-3.5 h-3.5" />\n                        </Link>\n                        {admin?.role !== "STAFF" && (\n                          <>' + buttonUI
);

// We need to also change "Borrador" to "Oculto" since it's more accurate for a published event that was paused.
code = code.replace(
  '<span className="text-[11px] font-bold px-2 py-0.5 rounded bg-sand text-steel">\n                            Borrador\n                          </span>',
  '<span className="text-[11px] font-bold px-2 py-0.5 rounded bg-sand text-steel">\n                            Oculto / Pausado\n                          </span>'
);

fs.writeFileSync(path, code);
console.log("Added toggle publish functionality!");
