import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { nationalId, email } = body;

    if (!nationalId || !email) {
      return NextResponse.json({ error: "Debes ingresar tu cédula y correo." }, { status: 400 });
    }

    // Buscar registros que coincidan con la cédula y el correo
    // Puede que tenga varios boletos si asistió a varios eventos
    const registrations = await prisma.registration.findMany({
      where: {
        nationalId: nationalId.trim(),
        email: email.trim().toLowerCase(),
      },
      include: {
        event: {
          select: {
            title: true,
            slug: true,
            startDate: true,
            location: true,
          }
        }
      },
      orderBy: {
        event: {
          startDate: 'desc'
        }
      }
    });

    if (registrations.length === 0) {
      return NextResponse.json({ error: "No encontramos ningún registro con esta cédula y correo." }, { status: 404 });
    }

    // Retornamos la lista de registros
    return NextResponse.json({ success: true, registrations }, { status: 200 });

  } catch (error) {
    console.error("Error in recover route:", error);
    return NextResponse.json({ error: "Error interno del servidor." }, { status: 500 });
  }
}
