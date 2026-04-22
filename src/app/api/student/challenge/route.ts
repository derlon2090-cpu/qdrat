import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import { getStudentChallengeData } from "@/lib/gamification";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          message: "يجب تسجيل الدخول أولًا للوصول إلى تحدي الشهر.",
        },
        { status: 401 },
      );
    }

    const data = await getStudentChallengeData(user.id);
    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "تعذر تحميل بيانات التحدي الشهري.",
      },
      { status: 500 },
    );
  }
}
