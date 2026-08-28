import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { generateTicketCode } from "@/lib/utils";
import QRCode from "qrcode";

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
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
      return NextResponse.json({ error: "Nombre completo, cédula y correo electrónico son obligatorios" }, { status: 400 });
    }

    // 1. Obtener evento y verificar aforo
    const event = await prisma.event.findUnique({
      where: { slug: params.slug },
      include: {
        shifts: true,
        registrations: { where: { isCancelled: false }, select: { shiftId: true } },
      },
    });

    if (!event || !event.isPublished) {
      return NextResponse.json({ error: "El evento no está disponible para registros" }, { status: 400 });
    }

    // Verify shift capacity
    if (event.hasShifts) {
      if (!shiftId) {
        return NextResponse.json({ error: "Debes seleccionar un turno." }, { status: 400 });
      }
      const shiftExists = event.shifts.some(s => s.id === shiftId);
      if (!shiftExists) {
        return NextResponse.json({ error: "El turno seleccionado no es válido." }, { status: 400 });
      }
      const shiftRegCount = event.registrations.filter(r => r.shiftId === shiftId).length;
      if (shiftRegCount >= event.maxCapacity) {
        return NextResponse.json({ error: "Lo sentimos, el cupo para este turno se ha agotado." }, { status: 400 });
      }
    } else {
      if (event.registrations.length >= event.maxCapacity) {
        return NextResponse.json({ error: "Lo sentimos, el cupo para este evento se ha agotado por completo." }, { status: 400 });
      }
    }

    // 2. Verificar duplicado en este evento por Cédula o Correo (ignorando cancelados)
    const existingRegistration = await prisma.registration.findFirst({
      where: {
        eventId: event.id,
        isCancelled: false,
        OR: [
          { nationalId: nationalId.trim() },
          { email: email.trim().toLowerCase() },
        ],
      },
    });

    if (existingRegistration) {
      return NextResponse.json({
        error: `Ya tienes un registro activo para este evento. Si deseas cambiar tu turno, cancela primero tu boleta actual.`,
        ticketCode: existingRegistration.ticketCode,
      }, { status: 400 });
    }

    // 3. Generar Código de Boleto Único
    const ticketCode = generateTicketCode();

    // 4. Crear Registro en Base de Datos
    const registration = await prisma.registration.create({
      data: {
        eventId: event.id,
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
        isManualEntry: false,
        customAnswersJson: customAnswers ? JSON.stringify(customAnswers) : "{}",
      },
    });

    // 5. Generar Código QR
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const ticketUrl = `${appUrl}/eventos/${event.slug}/ticket/${ticketCode}`;
    const qrCodeDataUrl = await QRCode.toDataURL(ticketCode, {
      width: 300,
      margin: 2,
      color: {
        dark: "#0369a1",
        light: "#ffffff",
      },
    });

    // 6. El correo de confirmación ha sido desactivado


    return NextResponse.json({
      success: true,
      message: "¡Registro exitoso! Tu entrada ha sido generada.",
      ticketCode,
      ticketUrl,
      registration,
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error in public registration:", error);
    return NextResponse.json({ error: "Error al procesar el registro: " + error.message }, { status: 500 });
  }
}
