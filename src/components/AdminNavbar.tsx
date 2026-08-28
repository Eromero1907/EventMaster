"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { CalendarDays, Users, Shield, LogOut, PlusCircle, LayoutDashboard, Settings } from "lucide-react";

export default function AdminNavbar({ adminName, adminRole }: { adminName?: string; adminRole?: string }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const navLinks = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/eventos/nuevo", label: "Crear Evento", icon: PlusCircle, adminOnly: true },
    { href: "/admin/administradores", label: "Administradores", icon: Shield, adminOnly: true },
  ];

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white text-navy border-b border-sand shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-sienna text-white flex items-center justify-center font-bold">
                <CalendarDays className="w-5 h-5" />
              </div>
              <span className="font-bold text-lg tracking-tight text-navy">EventMaster <span className="text-xs bg-terra text-white font-semibold px-2 py-0.5 rounded border border-sienna/30">ADMIN</span></span>
            </Link>

            <nav className="flex items-center gap-1">
              {navLinks.map((link) => {
                if (link.adminOnly && adminRole === "STAFF") return null;
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    title={link.label}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-terra text-white shadow-sm"
                        : "text-slateblue hover:text-navy hover:bg-white"
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span className="hidden md:inline">{link.label}</span>
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-xs font-semibold text-navy">{adminName || "Administrador"}</span>
              <span className="text-[10px] text-sienna font-medium">{adminRole || "Admin"}</span>
            </div>

            <button
              onClick={handleLogout}
              className="text-steel hover:text-red-400 hover:bg-white p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-medium"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
