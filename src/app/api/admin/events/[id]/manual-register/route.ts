import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { generateTicketCode } from "@/lib/utils";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await authenticateRequest(req);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const {
      fullName,
      email,
      nationalId,
      epikId,
      phone,
      eps,
      bloodType,
      belongsToGroup,
      groupName,
      customAnswers,
      shiftId,
    } = body;

    if (!fullName || !email || !nationalId) {
      return NextResponse.json({ error: "Nombre, Correo y Cédula son obligatorios" }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: { shifts: true },
    });

    if (!event) {
      return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });
    }

    if (event.hasShifts && !shiftId) {
      return NextResponse.json({ error: "Debes seleccionar un turno." }, { status: 400 });
    }

    const ticketCode = generateTicketCode();

    const registration = await prisma.registration.create({
      data: {
        eventId: params.id,
        shiftId: shiftId || null,
        ticketCode,
        fullName: fullName.trim(),
        email: email.trim().toLowerCase(),
        nationalId: nationalId.trim(),
        epikId: epikId ? epikId.trim() : null,
        phone: phone ? phone.trim() : null,
        eps: eps ? eps.trim() : null,
        bloodType: bloodType || null,
        belongsToGroup: Boolean(belongsToGroup),
        groupName: groupName ? groupName.trim() : null,
        checkedIn: true, // Manual door registration is immediately checked-in
        checkedInAt: new Date(),
        isManualEntry: true,
        customAnswersJson: customAnswers ? JSON.stringify(customAnswers) : "{}",
      },
    });

    return NextResponse.json({
      success: true,
      message: "Registro manual completado y acceso confirmado",
      registration,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error in manual registration:", error);
    return NextResponse.json({ error: "Error al registrar asistente manualmente: " + error.message }, { status: 500 });
  }
}
