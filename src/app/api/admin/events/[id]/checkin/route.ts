import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await authenticateRequest(req);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { query, ticketCode, registrationId, action = "confirm" } = await req.json();

    let registration = null;

    if (registrationId) {
      registration = await prisma.registration.findUnique({
        where: { id: registrationId },
      });
    } else if (ticketCode) {
      registration = await prisma.registration.findFirst({
        where: {
          eventId: params.id,
          ticketCode: ticketCode.trim().toUpperCase(),
        },
      });
    } else if (query) {
      const cleanQuery = query.trim();
      registration = await prisma.registration.findFirst({
        where: {
          eventId: params.id,
          OR: [
            { ticketCode: { equals: cleanQuery } },
            { nationalId: { equals: cleanQuery } },
            { epikId: { equals: cleanQuery } },
            { email: { equals: cleanQuery.toLowerCase() } },
          ],
        },
      });
    }

    if (!registration) {
      return NextResponse.json({
        success: false,
        error: "Registro no encontrado en este evento con los datos proporcionados",
      }, { status: 404 });
    }

    if (registration.isCancelled) {
      return NextResponse.json({
        success: false,
        error: "Boleto CANCELADO por el usuario. No se permite el ingreso.",
      }, { status: 400 });
    }

    // Si la acción es solo verificar datos antes de confirmar
    if (action === "verify") {
      return NextResponse.json({
        success: true,
        action: "verify",
        alreadyCheckedIn: registration.checkedIn,
        registration: registration,
      });
    }

    // Acción: checkout (Registrar salida para permitir reingreso)
    if (action === "checkout") {
      const updated = await prisma.registration.update({
        where: { id: registration.id },
        data: {
          checkedIn: false,
          // Mantenemos el checkedInAt original o lo ponemos null, dependiendo del registro histórico. Mejor dejarlo.
        },
      });
      return NextResponse.json({
        success: true,
        action: "checkout",
        registration: updated,
        message: `Salida registrada. ${registration.fullName} puede volver a ingresar.`,
      });
    }

    // Verificar si ya había ingresado
    const alreadyCheckedIn = registration.checkedIn;
    const previousCheckInTime = registration.checkedInAt;

    // Realizar check-in (Acción: confirm)
    const updated = await prisma.registration.update({
      where: { id: registration.id },
      data: {
        checkedIn: true,
        checkedInAt: registration.checkedInAt || new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      alreadyCheckedIn,
      previousCheckInTime,
      registration: updated,
      message: alreadyCheckedIn
        ? `⚠️ ATENCIÓN: Esta persona ya había ingresado el ${new Intl.DateTimeFormat("es-CO", { dateStyle: "short", timeStyle: "medium" }).format(new Date(previousCheckInTime!))}`
        : `Entrada confirmada exitosamente para ${registration.fullName}`,
    });
  } catch (error: any) {
    console.error("Error in checkin:", error);
    return NextResponse.json({ error: "Error al procesar el check-in" }, { status: 500 });
  }
}
