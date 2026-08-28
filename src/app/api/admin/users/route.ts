import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest, hashPassword } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await authenticateRequest(req);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const admins = await prisma.admin.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(admins);
}

export async function POST(req: NextRequest) {
  const session = await authenticateRequest(req);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const { name, email, password, role } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Todos los campos son obligatorios" }, { status: 400 });
    }

    const existing = await prisma.admin.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existing) {
      return NextResponse.json({ error: "El correo ya está registrado como administrador" }, { status: 400 });
    }

    const passwordHash = await hashPassword(password);

    const newAdmin = await prisma.admin.create({
      data: {
        name,
        email: email.toLowerCase().trim(),
        passwordHash,
        role: role || "ADMIN",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });

    return NextResponse.json(newAdmin, { status: 201 });
  } catch (error: any) {
    console.error("Error creating admin:", error);
    return NextResponse.json({ error: "Error al crear administrador" }, { status: 500 });
  }
}
