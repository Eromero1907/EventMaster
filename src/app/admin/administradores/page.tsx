"use client";

import { useEffect, useState } from "react";
import AdminNavbar from "@/components/AdminNavbar";
import { Shield, UserPlus, Users, Loader2, AlertCircle, Check, Mail, Lock, UserCheck } from "lucide-react";
import { formatDate } from "@/lib/utils";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
}

export default function AdminsManagementPage() {
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState("ADMIN");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadAdmins = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setAdmins(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdmins();
  }, []);

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName,
          email: formEmail,
          password: formPassword,
          role: formRole,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Error al crear administrador");
      }

      setSuccessMsg("Administrador creado exitosamente.");
      setFormName("");
      setFormEmail("");
      setFormPassword("");
      setShowAddModal(false);
      loadAdmins();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-cream text-navy">
      <AdminNavbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 flex-1 w-full space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-navy tracking-tight font-display">
              Gestión de Administradores
            </h1>
            <p className="text-xs text-steel mt-1">
              Control de acceso para múltiples usuarios administradores del sistema
            </p>
          </div>

          <button
            onClick={() => {
              setErrorMsg(null);
              setShowAddModal(true);
            }}
            className="bg-terra text-white hover:bg-sienna text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all shadow-lg shadow-terra/30 flex items-center gap-2"
          >
            <UserPlus className="w-4 h-4" />
            Nuevo Administrador
          </button>
        </div>

        {successMsg && (
          <div className="bg-sand border border-emerald-500/40 text-gold p-4 rounded-2xl flex items-center gap-2.5 text-xs">
            <Check className="w-4 h-4 text-gold" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Admins Table */}
        <div className="bg-white border border-sand rounded-3xl overflow-hidden shadow-xl">
          {loading ? (
            <div className="p-12 text-center text-steel">
              <Loader2 className="w-8 h-8 text-sienna animate-spin mx-auto mb-3" />
              Cargando administradores...
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-white/80 text-steel uppercase font-semibold border-b border-sand">
                  <tr>
                    <th className="px-6 py-4">Nombre</th>
                    <th className="px-6 py-4">Correo Electrónico</th>
                    <th className="px-6 py-4">Rol</th>
                    <th className="px-6 py-4">Fecha de Alta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-sand/60">
                  {admins.map((adm) => (
                    <tr key={adm.id} className="hover:bg-white/40 transition-colors">
                      <td className="px-6 py-4 font-bold text-navy flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-sienna text-white/20 text-sienna flex items-center justify-center font-bold text-xs">
                          {adm.name.charAt(0).toUpperCase()}
                        </div>
                        {adm.name}
                      </td>
                      <td className="px-6 py-4 text-slateblue">{adm.email}</td>
                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-sienna text-white/10 text-sienna border border-terra/30 uppercase">
                          {adm.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-steel">{formatDate(adm.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Modal Crear Administrador */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-cream/80 backdrop-blur-sm">
          <div className="bg-white border border-sand rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-navy flex items-center gap-2">
                <Shield className="w-5 h-5 text-sienna" /> Crear Nuevo Administrador
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-steel hover:text-navy"
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slateblue mb-1">
                  Nombre Completo <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Ej. Carlos Martínez"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-sand text-navy text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slateblue mb-1">
                  Correo Electrónico <span className="text-red-400">*</span>
                </label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="admin2@institucion.edu.co"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-sand text-navy text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slateblue mb-1">
                  Contraseña Temporal <span className="text-red-400">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-sand text-navy text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slateblue mb-1">
                  Rol de Usuario
                </label>
                <select
                  value={formRole}
                  onChange={(e) => setFormRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-sand text-navy text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="ADMIN">ADMINISTRADOR (Acceso Total)</option>
                  <option value="STAFF">STAFF (Solo Check-in en Puerta)</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="bg-white hover:bg-sand text-slateblue px-4 py-2.5 rounded-xl text-xs font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="bg-terra text-white hover:bg-sienna text-white disabled:opacity-50 text-navy font-bold px-5 py-2.5 rounded-xl text-xs shadow-lg shadow-terra/30 flex items-center gap-1.5"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Creando...
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-3.5 h-3.5" />
                      Crear Administrador
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
