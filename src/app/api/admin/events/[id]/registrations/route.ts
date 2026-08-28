import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await authenticateRequest(req);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status"); // "all", "attended", "absent"
  const search = searchParams.get("search");

  try {
    const where: any = {
      eventId: params.id,
    };

    if (status === "attended") {
      where.checkedIn = true;
    } else if (status === "absent") {
      where.checkedIn = false;
    }

    if (search) {
      const q = search.trim();
      where.OR = [
        { fullName: { contains: q } },
        { email: { contains: q } },
        { nationalId: { contains: q } },
        { epikId: { contains: q } },
        { ticketCode: { contains: q } },
      ];
    }

    const registrations = await prisma.registration.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(registrations);
  } catch (error: any) {
    console.error("Error fetching registrations:", error);
    return NextResponse.json({ error: "Error al obtener registros" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await authenticateRequest(req);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const registrationId = searchParams.get("registrationId");

  if (!registrationId) {
    return NextResponse.json({ error: "registrationId es requerido" }, { status: 400 });
  }

  try {
    await prisma.registration.delete({
      where: { id: registrationId },
    });
    return NextResponse.json({ message: "Registro eliminado" });
  } catch (error: any) {
    return NextResponse.json({ error: "Error al eliminar registro" }, { status: 500 });
  }
}
