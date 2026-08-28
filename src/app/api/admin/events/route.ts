import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";
import { slugify } from "@/lib/utils";

export async function GET(req: NextRequest) {
  const session = await authenticateRequest(req);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const events = await prisma.event.findMany({
      include: {
        _count: {
          select: {
            registrations: { where: { isCancelled: false } },
          },
        },
        registrations: {
          select: {
            checkedIn: true,
          },
        },
      },
      orderBy: { startDate: "desc" },
    });

    const formattedEvents = events.map((event) => {
      const totalRegistrations = event._count.registrations;
      const checkedInCount = event.registrations.filter((r) => r.checkedIn).length;
      const absentCount = totalRegistrations - checkedInCount;

      return {
        id: event.id,
        title: event.title,
        slug: event.slug,
        description: event.description,
        location: event.location,
        startDate: event.startDate,
        endDate: event.endDate,
        maxCapacity: event.maxCapacity,
        isPublished: event.isPublished,
        createdAt: event.createdAt,
        totalRegistrations,
        checkedInCount,
        absentCount,
      };
    });

    return NextResponse.json(formattedEvents);
  } catch (error: any) {
    console.error("Error fetching events:", error);
    return NextResponse.json({ error: "Error al obtener eventos" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await authenticateRequest(req);
  if (!session) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { title, description, location, startDate, endDate, maxCapacity, isPublished, customFields, defaultFieldsOverride, hasShifts, shifts } = body;

    if (!title || !startDate) {
      return NextResponse.json({ error: "Título y fecha de inicio son requeridos" }, { status: 400 });
    }

    let slug = slugify(title);
    const existing = await prisma.event.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString().slice(-4)}`;
    }

    // Si el frontend envió defaultFieldsOverride, usar esos como campos base editados.
    // Si no, usar los campos institucionales predeterminados originales.
    let allFields: Array<{
      fieldKey: string;
      label: string;
      fieldType: string;
      optionsJson?: string;
      dependsOn?: string | null;
      isRequired: boolean;
      orderIndex: number;
      isDefault: boolean;
    }> = [];

    if (Array.isArray(defaultFieldsOverride) && defaultFieldsOverride.length > 0) {
      // Campos base modificados por el admin
      defaultFieldsOverride.forEach((f: any, idx: number) => {
        allFields.push({
          fieldKey: f.fieldKey || slugify(f.label || `field_${idx}`),
          label: f.label,
          fieldType: f.fieldType || "text",
          optionsJson: f.options ? JSON.stringify(f.options) : undefined,
          dependsOn: f.dependsOn || null,
          isRequired: Boolean(f.isRequired),
          orderIndex: f.orderIndex || idx + 1,
          isDefault: true,
        });
      });
    } else {
      // Campos institucionales predeterminados (fallback)
      const defaultFields = [
        { fieldKey: "nationalId", label: "Cédula de Ciudadanía / Documento", fieldType: "number", isRequired: true, orderIndex: 1, isDefault: true, dependsOn: null },
        { fieldKey: "fullName", label: "Nombre Completo", fieldType: "text", isRequired: true, orderIndex: 2, isDefault: true, dependsOn: null },
        { fieldKey: "email", label: "Correo Institucional", fieldType: "email", isRequired: true, orderIndex: 3, isDefault: true, dependsOn: null },
        { fieldKey: "epikId", label: "ID de Epik", fieldType: "number", isRequired: true, orderIndex: 4, isDefault: true, dependsOn: null },
        { fieldKey: "phone", label: "Teléfono Celular / WhatsApp", fieldType: "tel", isRequired: true, orderIndex: 5, isDefault: true, dependsOn: null },
        { fieldKey: "eps", label: "EPS", fieldType: "text", isRequired: true, orderIndex: 6, isDefault: true, dependsOn: null },
        { fieldKey: "bloodType", label: "Grupo Sanguíneo y RH", fieldType: "select", optionsJson: JSON.stringify(["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"]), isRequired: true, orderIndex: 7, isDefault: true, dependsOn: null },
        { fieldKey: "belongsToGroup", label: "¿Pertenece a algún grupo estudiantil?", fieldType: "boolean", isRequired: true, orderIndex: 8, isDefault: true, dependsOn: null },
        { fieldKey: "groupName", label: "En caso afirmativo, ¿a cuál grupo pertenece?", fieldType: "select", optionsJson: JSON.stringify(["Grupo A", "Grupo B", "Grupo C"]), isRequired: true, orderIndex: 9, isDefault: true, dependsOn: "belongsToGroup" },
      ];
      allFields = [...defaultFields];
    }

    // Agregar campos personalizados adicionales
    if (Array.isArray(customFields)) {
      customFields.forEach((cf: any) => {
        allFields.push({
          fieldKey: cf.fieldKey || slugify(cf.label || `custom_${allFields.length}`),
          label: cf.label,
          fieldType: cf.fieldType || "text",
          optionsJson: cf.options ? JSON.stringify(cf.options) : undefined,
          dependsOn: cf.dependsOn || null,
          isRequired: Boolean(cf.isRequired),
          orderIndex: cf.orderIndex || allFields.length + 1,
          isDefault: false,
        });
      });
    }

    const event = await prisma.event.create({
      data: {
        title,
        slug,
        description,
        location,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        maxCapacity: parseInt(maxCapacity, 10) || 100,
        isPublished: isPublished ?? true,
        hasShifts: Boolean(hasShifts),
        shifts: {
          create: Boolean(hasShifts) && Array.isArray(shifts) ? shifts.map((s: any) => ({
            name: s.name,
            startTime: s.startTime ? new Date(s.startTime) : null,
            endTime: s.endTime ? new Date(s.endTime) : null,
          })) : [],
        },
        fields: {
          create: allFields,
        },
      },
      include: {
        fields: true,
      },
    });

    return NextResponse.json(event, { status: 201 });
  } catch (error: any) {
    console.error("Error creating event:", error);
    return NextResponse.json({ error: "Error al crear el evento: " + error.message }, { status: 500 });
  }
}
