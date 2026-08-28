import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { authenticateRequest } from "@/lib/auth";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await authenticateRequest(req);
  if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  try {
    const event = await prisma.event.findUnique({
      where: { id: params.id },
    });

    if (!event) return NextResponse.json({ error: "Evento no encontrado" }, { status: 404 });

    // Aggregate metrics
    const totalRegistrations = await prisma.registration.count({ where: { eventId: params.id, isCancelled: false } });
    const checkedInCount = await prisma.registration.count({ where: { eventId: params.id, checkedIn: true } });
    const absentCount = totalRegistrations - checkedInCount;

    const manualCount = await prisma.registration.count({ where: { eventId: params.id, isManualEntry: true } });
    const onlineCount = totalRegistrations - manualCount;

    // Time series (Registrations by day) and Group Data
    const registrations = await prisma.registration.findMany({
      where: { eventId: params.id, isCancelled: false },
      select: { createdAt: true, belongsToGroup: true, groupName: true },
      orderBy: { createdAt: 'asc' }
    });

    const datesMap: Record<string, number> = {};
    let belongsToGroupCount = 0;
    let noGroupCount = 0;
    const groupNameMap: Record<string, number> = {};

    registrations.forEach(r => {
      // Get YYYY-MM-DD
      const dateStr = r.createdAt.toISOString().split('T')[0];
      datesMap[dateStr] = (datesMap[dateStr] || 0) + 1;

      // Group counting
      if (r.belongsToGroup) {
        belongsToGroupCount++;
        if (r.groupName) {
          groupNameMap[r.groupName] = (groupNameMap[r.groupName] || 0) + 1;
        }
      } else {
        noGroupCount++;
      }
    });

    const registrationsByDay = Object.keys(datesMap).map(date => ({
      date,
      count: datesMap[date]
    }));

    const groupNamesChart = Object.keys(groupNameMap)
      .map(name => ({ name, count: groupNameMap[name] }))
      .sort((a, b) => b.count - a.count);

    return NextResponse.json({
      success: true,
      data: {
        totalRegistrations,
        checkedInCount,
        absentCount,
        manualCount,
        onlineCount,
        registrationsByDay,
        belongsToGroupCount,
        noGroupCount,
        groupNamesChart
      }
    });
  } catch (error) {
    console.error("Error fetching metrics:", error);
    return NextResponse.json({ error: "Error fetching metrics" }, { status: 500 });
  }
}
