import { NextRequest, NextResponse } from "next/server";

import { getSessionContextFromRequest, setAuthCookie } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionContextFromRequest(request);
    const response = NextResponse.json(
      {
        authenticated: Boolean(session?.user),
        user: session?.user ?? null,
        expiresAt: session?.expiresAt.toISOString() ?? null,
      },
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    );

    // Refresh the cookie expiry whenever the session is actively used.
    if (session) {
      setAuthCookie(response, session.token, session.expiresAt);
    }

    return response;
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
