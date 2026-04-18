import { NextRequest, NextResponse } from "next/server";

import { buildSessionPayload } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const payload = await buildSessionPayload(request);
    return NextResponse.json(payload, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        authenticated: false,
        user: null,
        message: error instanceof Error ? error.message : "تعذر قراءة الجلسة الحالية.",
      },
      { status: 500 },
    );
  }
}
