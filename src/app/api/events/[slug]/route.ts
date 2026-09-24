import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const event = await prisma.event.findUnique({
      where: { slug: params.slug },
      include: {
        fields: {
          orderBy: { orderIndex: "asc" },
        },
        shifts: true,
        registrations: {
          where: { isCancelled: false },
          select: { shiftId: true },
        },
      },
    });

    if (!event || !event.isPublished) {
      return NextResponse.json({ error: "Evento no encontrado o no disponible" }, { status: 404 });
    }

    const totalRegistrations = event.registrations.length;
    // Map of shiftId -> count of registrations
    const registrationsByShift = event.registrations.reduce((acc: any, reg: any) => {
      const sId = reg.shiftId || 'none';
      acc[sId] = (acc[sId] || 0) + 1;
      return acc;
    }, {});

    const shiftCount = event.shifts?.length || 0;
    const effectiveCapacity = event.hasShifts && shiftCount > 0 ? event.maxCapacity * shiftCount : event.maxCapacity;
    const remainingSpots = Math.max(0, effectiveCapacity - totalRegistrations);
    const isSoldOut = event.hasShifts 
      ? false // if has shifts, we calculate sold out per shift on frontend
      : remainingSpots <= 0;

    return NextResponse.json({
      id: event.id,
      title: event.title,
      slug: event.slug,
      description: event.description,
      location: event.location,
      startDate: event.startDate,
      endDate: event.endDate,
      maxCapacity: event.maxCapacity,
      hasShifts: event.hasShifts,
      shifts: event.shifts,
      registrationsByShift,
      totalRegistrations,
      remainingSpots,
      isSoldOut,
      fields: event.fields,
    });
  } catch (error: any) {
    console.error("Error fetching public event:", error);
    return NextResponse.json({ error: "Error al cargar información del evento" }, { status: 500 });
  }
}
