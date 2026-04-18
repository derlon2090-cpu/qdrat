import { NextRequest, NextResponse } from "next/server";

import { createSessionForUser, authenticateUser, setAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as {
      identifier?: string;
      password?: string;
    };

    const user = await authenticateUser({
      identifier: payload.identifier ?? "",
      password: payload.password ?? "",
    });

    const session = await createSessionForUser(user.id, request);
    const response = NextResponse.json({
      ok: true,
      user,
    });

    setAuthCookie(response, session.token, session.expiresAt);
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "تعذر تسجيل الدخول.",
      },
      { status: 400 },
    );
  }
}
