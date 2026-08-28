import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import QRCode from "qrcode";

export async function GET(req: NextRequest, { params }: { params: { ticketCode: string } }) {
  try {
    const registration = await prisma.registration.findUnique({
      where: { ticketCode: params.ticketCode.toUpperCase() },
      include: {
        event: true,
        shift: true,
      },
    });

    if (!registration) {
      return NextResponse.json({ error: "Boleto no encontrado" }, { status: 404 });
    }

    const qrCodeDataUrl = await QRCode.toDataURL(registration.ticketCode, {
      width: 350,
      margin: 2,
      color: {
        dark: "#0369a1",
        light: "#ffffff",
      },
    });

    return NextResponse.json({
      registration,
      event: registration.event,
      qrCodeDataUrl,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Error al consultar boleto" }, { status: 500 });
  }
}
