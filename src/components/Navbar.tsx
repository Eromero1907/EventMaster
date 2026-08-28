"use client";

import Link from "next/link";
import { CalendarDays, ShieldCheck, Ticket, Search } from "lucide-react";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/80 border-b border-sand">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sienna to-terra flex items-center justify-center text-white shadow-md shadow-terra/20 group-hover:scale-105 transition-transform">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-lg text-navy tracking-tight">EventMaster</span>
              <span className="text-xs text-terra block font-medium -mt-1">Gestión & Check-in</span>
            </div>
          </Link>

          <div className="flex items-center gap-2 sm:gap-4">
            <Link
              href="/recuperar"
              title="Recuperar Boleto"
              className="flex items-center gap-1.5 text-sm font-semibold text-steel hover:text-navy transition-colors px-2 py-2"
            >
              <Search className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Recuperar</span>
            </Link>
            <Link
              href="/"
              title="Eventos Disponibles"
              className="text-sm font-medium text-slate-600 hover:text-navy px-2 sm:px-3 py-2 rounded-lg hover:bg-sand transition-colors flex items-center gap-1.5"
            >
              <Ticket className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Eventos Disponibles</span>
            </Link>
            <Link
              href="/admin"
              title="Panel Administrador"
              className="text-sm font-medium bg-white hover:bg-white text-navy px-3 sm:px-4 py-2 rounded-lg transition-all shadow-sm flex items-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span className="hidden sm:inline">Panel Admin</span>
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
