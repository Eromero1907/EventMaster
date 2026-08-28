import Link from "next/link";
import Navbar from "@/components/Navbar";
import prisma from "@/lib/prisma";
import { formatDate } from "@/lib/utils";
import { Calendar, MapPin, Users, Ticket, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";

export const revalidate = 0; // Don't cache for real-time accurate capacity

async function getPublishedEvents() {
  try {
    const events = await prisma.event.findMany({
      where: { isPublished: true },
      include: {
        _count: {
          select: { registrations: true },
        },
      },
      orderBy: { startDate: "asc" },
    });
    return events;
  } catch (error) {
    console.error("Error cargando eventos:", error);
    return [];
  }
}

export default async function HomePage() {
  const events = await getPublishedEvents();

  return (
    <div className="min-h-screen flex flex-col bg-cream">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-cream via-sand to-cream text-navy py-20 px-4 sm:px-6 lg:px-8 shadow-2xl">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(var(--color-sienna)_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white border border-sand text-sienna px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 shadow-sm">
            <CheckCircle2 className="w-4 h-4" /> Plataforma Oficial de Registro & Control de Acceso
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight font-display text-navy">
            Eventos Institucionales & Registro Anticipado
          </h1>
          <p className="mt-5 text-lg sm:text-xl text-slateblue max-w-2xl mx-auto font-light leading-relaxed">
            Inscríbete de manera rápida, obtén tu boleto con código QR para ingreso exprés y asegura tu cupo en los próximos eventos.
          </p>
        </div>
      </section>

      {/* Events List Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-1 w-full">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-navy tracking-tight font-display">Próximos Eventos</h2>
            <p className="text-sm text-steel mt-1">Selecciona un evento para completar tu registro previo</p>
          </div>
        </div>

        {events.length === 0 ? (
          <div className="bg-white border border-sand rounded-2xl p-12 text-center max-w-xl mx-auto shadow-sm">
            <div className="w-16 h-16 bg-sand text-terra rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-navy">No hay eventos activos en este momento</h3>
            <p className="text-sm text-steel mt-2 mb-6">
              Los nuevos eventos programados aparecerán aquí cuando los administradores los publiquen.
            </p>
            <Link
              href="/admin"
              className="inline-flex items-center gap-2 bg-white text-navy px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-white transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              Ingresar como Administrador
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => {
              const registered = event._count.registrations;
              const capacity = event.maxCapacity;
              const remaining = Math.max(0, capacity - registered);
              const percentFull = Math.min(100, Math.round((registered / capacity) * 100));
              const isFull = remaining <= 0;

              return (
                <div
                  key={event.id}
                  className="bg-white border border-sand/80 rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col group"
                >
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-sand text-sky-700 border border-sand/60">
                        {formatDate(event.startDate)}
                      </span>
                      {isFull ? (
                        <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-red-50 text-red-700 border border-red-200">
                          Cupos Agotados
                        </span>
                      ) : (
                        <span className="text-xs font-medium px-2.5 py-1 rounded-md bg-sand text-gold border border-ochre">
                          {remaining} cupos libres
                        </span>
                      )}
                    </div>

                    <h3 className="text-xl font-bold text-navy group-hover:text-terra transition-colors mb-2 line-clamp-2">
                      {event.title}
                    </h3>

                    {event.description && (
                      <p className="text-sm text-slate-600 line-clamp-3 mb-4 flex-1">
                        {event.description}
                      </p>
                    )}

                    <div className="space-y-2 text-xs text-steel mb-6 pt-4 border-t border-sand">
                      {event.location && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-steel shrink-0" />
                          <span className="truncate">{event.location}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-steel shrink-0" />
                        <span>Capacidad: {registered} / {capacity} asistentes</span>
                      </div>

                      {/* Capacity progress bar */}
                      <div className="w-full bg-sand h-2 rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full transition-all ${
                            percentFull >= 90
                              ? "bg-red-500"
                              : percentFull >= 75
                              ? "bg-amber-500"
                              : "bg-sienna text-white"
                          }`}
                          style={{ width: `${percentFull}%` }}
                        />
                      </div>
                    </div>

                    {isFull ? (
                      <button
                        disabled
                        className="w-full bg-sand text-steel py-3 rounded-xl font-semibold text-sm cursor-not-allowed text-center"
                      >
                        Inscripciones Cerradas
                      </button>
                    ) : (
                      <Link
                        href={`/eventos/${event.slug}`}
                        className="w-full bg-terra text-white hover:bg-sienna text-white py-3 rounded-xl font-semibold text-sm text-center flex items-center justify-center gap-2 shadow-sm transition-all group-hover:shadow-md"
                      >
                        <Ticket className="w-4 h-4" />
                        Inscribirme Ahora
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-sand py-8 text-center text-xs text-steel">
        <p>© {new Date().getFullYear()} EventMaster - Sistema de Gestión de Eventos & Control de Acceso.</p>
      </footer>
    </div>
  );
}
