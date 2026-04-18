import { NextRequest, NextResponse } from "next/server";

import { createSessionForUser, registerUser, setAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as {
      fullName?: string;
      email?: string;
      phone?: string;
      password?: string;
    };

    const user = await registerUser({
      fullName: payload.fullName ?? "",
      email: payload.email ?? "",
      phone: payload.phone ?? "",
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
        message: error instanceof Error ? error.message : "تعذر إنشاء الحساب.",
      },
      { status: 400 },
    );
  }
}
