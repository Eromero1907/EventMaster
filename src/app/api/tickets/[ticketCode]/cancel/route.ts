import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest, { params }: { params: { ticketCode: string } }) {
  try {
    const registration = await prisma.registration.findUnique({
      where: { ticketCode: params.ticketCode.toUpperCase() },
      include: { event: true },
    });

    if (!registration) {
      return NextResponse.json({ error: "Boleto no encontrado" }, { status: 404 });
    }

    if (registration.isCancelled) {
      return NextResponse.json({ error: "El boleto ya fue cancelado" }, { status: 400 });
    }

    await prisma.registration.update({
      where: { id: registration.id },
      data: { isCancelled: true }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error cancelling ticket:", error);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
