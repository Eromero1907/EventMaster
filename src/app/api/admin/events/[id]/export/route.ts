import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await authenticateRequest(req);
  if (!session) {
    return new NextResponse("No autorizado", { status: 401 });
  }
  if (session.role === "STAFF") {
    return new NextResponse("Acceso denegado. Tu rol de STAFF no permite descargar reportes.", { status: 403 });
  }

  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
      include: {
        fields: {
          orderBy: { orderIndex: "asc" },
        },
        registrations: {
          orderBy: [{ checkedIn: "desc" }, { createdAt: "asc" }],
        },
      },
    });

    if (!event) {
      return new NextResponse("Evento no encontrado", { status: 404 });
    }

    // Preparar campos dinámicos que no son los por defecto
    const customFields = event.fields.filter((f) => !f.isDefault);

    // Encabezados del CSV
    const headers = [
      "Estado Asistencia",
      "Fecha y Hora Check-in",
      "Código Boleto",
      "Cédula / Documento",
      "Nombre Completo",
      "Correo Institucional",
      "ID Epik",
      "Celular",
      "EPS",
      "Grupo Sanguíneo",
      "Pertenece a Grupo",
      "Nombre del Grupo",
      "Sufre Morbilidades/Alergias",
      "Detalle Alergias",
      "Tipo de Registro",
      "Fecha de Registro",
      ...customFields.map((f) => `"${f.label.replace(/"/g, '""')}"`),
    ];

    // Helper para escapar valores CSV
    const escapeCsv = (val: any) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    // Filas
    const rows = event.registrations.map((reg) => {
      let customAnswers: Record<string, any> = {};
      try {
        customAnswers = JSON.parse(reg.customAnswersJson || "{}");
      } catch (e) {
        customAnswers = {};
      }

      const customAnswersList = customFields.map((cf) => {
        const ans = customAnswers[cf.fieldKey] ?? customAnswers[cf.id] ?? "";
        return escapeCsv(ans);
      });

      return [
        reg.checkedIn ? '"ASISTIÓ"' : '"INASISTENTE"',
        reg.checkedInAt
          ? escapeCsv(
              new Intl.DateTimeFormat("es-CO", {
                dateStyle: "short",
                timeStyle: "medium",
              }).format(new Date(reg.checkedInAt))
            )
          : '""',
        escapeCsv(reg.ticketCode),
        escapeCsv(reg.nationalId),
        escapeCsv(reg.fullName),
        escapeCsv(reg.email),
        escapeCsv(reg.epikId || "N/A"),
        escapeCsv(reg.phone || "N/A"),
        escapeCsv(reg.eps || "N/A"),
        escapeCsv(reg.bloodType || "N/A"),
        reg.belongsToGroup ? '"SÍ"' : '"NO"',
        escapeCsv(reg.groupName || "N/A"),
        customAnswers.hasAllergies ? '"SÍ"' : '"NO"',
        escapeCsv(customAnswers.allergiesDetails || "N/A"),
        reg.isManualEntry ? '"Manual en puerta"' : '"Anticipado en línea"',
        escapeCsv(
          new Intl.DateTimeFormat("es-CO", {
            dateStyle: "short",
            timeStyle: "medium",
          }).format(new Date(reg.createdAt))
        ),
        ...customAnswersList,
      ].join(";");
    });

    // Añadir BOM (\uFEFF) para que Excel abra UTF-8 con acentos y tildes correctamente, usando punto y coma
    const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\r\n");

    const safeTitle = event.title.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 30);
    const filename = `Reporte_${safeTitle}_${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    console.error("Error exporting CSV:", error);
    return new NextResponse("Error al generar CSV", { status: 500 });
  }
}
