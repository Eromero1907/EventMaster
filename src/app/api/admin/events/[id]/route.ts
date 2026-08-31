import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await authenticateRequest(req);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        fields: {
          orderBy: { orderIndex: "asc" },
        },
        shifts: {
          orderBy: { startTime: "asc" },
        },
        _count: {
          select: { registrations: { where: { isCancelled: false } } },
        },
        registrations: {
          select: {
            id: true,
            checkedIn: true,
          },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    const totalRegistrations = event._count.registrations;
    const checkedInCount = event.registrations.filter((r) => r.checkedIn).length;
    const absentCount = totalRegistrations - checkedInCount;

    return NextResponse.json({
      ...event,
      totalRegistrations,
      checkedInCount,
      absentCount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Error al obtener evento" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await authenticateRequest(req);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, description, location, startDate, endDate, maxCapacity, isPublished, fields, hasShifts, shifts } = body;

    // Actualizar datos del evento
    const updated = await prisma.event.update({
      where: { id: params.id },
      data: {
        title,
        description,
        location,
        startDate: startDate ? new Date(startDate) : undefined,
        endDate: endDate ? new Date(endDate) : null,
        maxCapacity: maxCapacity !== undefined ? parseInt(maxCapacity, 10) : undefined,
        isPublished: isPublished !== undefined ? isPublished : undefined,
        hasShifts: hasShifts !== undefined ? Boolean(hasShifts) : undefined,
      },
    });


    // Actualizar turnos
    if (hasShifts !== undefined) {
      await prisma.shift.deleteMany({
        where: { eventId: params.id },
      });
      if (hasShifts && Array.isArray(shifts) && shifts.length > 0) {
        await prisma.shift.createMany({
          data: shifts.map((s: any) => {
            let parsedStart = null;
            let parsedEnd = null;
            if (s.startTime) {
              const parts = s.startTime.split(":");
              parsedStart = new Date(`1970-01-01T${parts[0]}:${parts[1]}:00Z`);
            }
            if (s.endTime) {
              const parts = s.endTime.split(":");
              parsedEnd = new Date(`1970-01-01T${parts[0]}:${parts[1]}:00Z`);
            }
            return {
              eventId: params.id,
              name: s.name,
              startTime: parsedStart,
              endTime: parsedEnd,
            };
          }),
        });
      }
    }

    // Si se enviaron campos/preguntas para actualizar o añadir
    if (Array.isArray(fields)) {
      // Eliminar campos personalizados previos y recrear
      await prisma.eventField.deleteMany({
        where: { eventId: params.id },
      });

      await prisma.eventField.createMany({
        data: fields.map((f: any, idx: number) => ({
          eventId: params.id,
          fieldKey: f.fieldKey,
          label: f.label,
          fieldType: f.fieldType || "text",
          optionsJson: f.optionsJson ? (typeof f.optionsJson === "string" ? f.optionsJson : JSON.stringify(f.optionsJson)) : undefined,
          dependsOn: f.dependsOn || null,
          isRequired: Boolean(f.isRequired),
          orderIndex: idx + 1,
          isDefault: Boolean(f.isDefault),
        })),
      });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Error updating event:", error);
    return NextResponse.json({ error: "Error al actualizar evento: " + error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await authenticateRequest(req);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    await prisma.event.delete({
      where: { id: params.id },
    });
    return NextResponse.json({ message: "Evento eliminado correctamente" });
  } catch (error: any) {
    return NextResponse.json({ error: "Error al eliminar evento" }, { status: 500 });
  }
}
