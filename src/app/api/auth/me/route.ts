import { NextRequest, NextResponse } from "next/server";
import { authenticateRequest } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await authenticateRequest(req);
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    admin: session,
  });
}
