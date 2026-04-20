import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import { getStudentPortalData } from "@/lib/student-portal";

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

    const data = await getStudentPortalData(user.id);
    return NextResponse.json({ ok: true, data });
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
