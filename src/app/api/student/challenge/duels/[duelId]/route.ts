import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import { getStudentChallengeDuelForUser } from "@/lib/gamification";

type RouteContext = {
  params: Promise<{
    duelId: string;
  }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          message: "يجب تسجيل الدخول أولًا للوصول إلى بيانات النزال.",
        },
        { status: 401 },
      );
    }

    const { duelId } = await context.params;
    const numericDuelId = Number(duelId);

    if (!Number.isFinite(numericDuelId) || numericDuelId <= 0) {
      return NextResponse.json(
        {
          ok: false,
          message: "معرّف النزال غير صالح.",
        },
        { status: 400 },
      );
    }

    const data = await getStudentChallengeDuelForUser(user.id, numericDuelId);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "تعذر تحميل بيانات النزال.",
      },
      { status: 400 },
    );
  }
}
