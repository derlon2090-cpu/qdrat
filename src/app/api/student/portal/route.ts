import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import { createFallbackStudentPortalData, getStudentPortalData } from "@/lib/student-portal";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          message: "يجب تسجيل الدخول أولًا للوصول إلى لوحة الطالب.",
        },
        { status: 401 },
      );
    }

    try {
      const data = await getStudentPortalData(user.id);
      return NextResponse.json({ ok: true, data });
    } catch (error) {
      console.error("Student portal data failed; returning safe fallback.", error);

      return NextResponse.json({
        ok: true,
        data: createFallbackStudentPortalData({
          userId: user.id,
          fullName: user.fullName,
        }),
        warning:
          error instanceof Error ? error.message : "تعذر تحميل بيانات لوحة الطالب كاملة.",
      });
    }
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "تعذر تحميل بيانات لوحة الطالب.",
      },
      { status: 500 },
    );
  }
}
