import { NextRequest, NextResponse } from "next/server";

import { authenticateUser, createSessionForUser, setAuthCookie } from "@/lib/auth";

function normalizeLoginError(error: unknown) {
  if (!(error instanceof Error)) {
    return "تعذر تسجيل الدخول.";
  }

  const message = error.message;

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

    setAuthCookie(response, session.token, session.expiresAt, request);
    return response;
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: normalizeLoginError(error),
      },
      { status: 400 },
    );
  }
}
