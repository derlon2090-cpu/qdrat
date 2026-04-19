import { NextRequest, NextResponse } from "next/server";

import { createSessionForUser, registerUser, setAuthCookie } from "@/lib/auth";
import type { UserGender } from "@/lib/auth-shared";

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as {
      fullName?: string;
      email?: string;
      phone?: string;
      password?: string;
      gender?: UserGender | "";
    };

    const user = await registerUser({
      fullName: payload.fullName ?? "",
      email: payload.email ?? "",
      phone: payload.phone ?? "",
      password: payload.password ?? "",
      gender: payload.gender ?? "",
    });

    const session = await createSessionForUser(user.id, request);
    const response = NextResponse.json({
      ok: true,
      user,
    });

    setAuthCookie(response, session.token, session.expiresAt, request);
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
