import { NextRequest, NextResponse } from "next/server";

import { createSessionForUser, registerUser, setAuthCookie } from "@/lib/auth";
import type { UserGender } from "@/lib/auth-shared";

function normalizeRegisterError(error: unknown) {
  if (!(error instanceof Error)) {
    return "تعذر إنشاء الحساب.";
  }

  const message = error.message;

  if (message.includes("يوجد حساب")) {
    return "يوجد حساب تم إنشاؤه من قبل بهذا البريد أو رقم الجوال، يرجى تسجيل الدخول.";
  }

  if (
    message.includes("DATABASE_URL") ||
    message.includes("POSTGRES_URL") ||
    message.includes("تعذر العثور على رابط قاعدة البيانات")
  ) {
    return "تعذر الاتصال بقاعدة البيانات حاليًا. تأكد من ضبط DATABASE_URL أو POSTGRES_URL في بيئة التشغيل.";
  }

  return message;
}

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
        message: normalizeRegisterError(error),
      },
      { status: 400 },
    );
  }
}
