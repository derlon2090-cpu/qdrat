import { NextRequest, NextResponse } from "next/server";

import { clearAuthCookie, deleteSessionByToken } from "@/lib/auth";
import { AUTH_COOKIE_NAME } from "@/lib/auth-shared";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value;
    await deleteSessionByToken(token);

    const response = NextResponse.json({
      ok: true,
    });
    clearAuthCookie(response);
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "تعذر تسجيل الخروج.",
      },
      { status: 500 },
    );
  }
}
