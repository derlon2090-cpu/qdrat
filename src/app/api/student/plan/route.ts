import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import { postponeTodayTasks, rebuildStudentPlan } from "@/lib/student-portal";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          message: "يجب تسجيل الدخول أولًا للوصول إلى الخطة.",
        },
        { status: 401 },
      );
    }

    const payload = (await request.json()) as {
      action?: "reset" | "postpone_today";
    };

    const data =
      payload.action === "postpone_today" ? await postponeTodayTasks(user.id) : await rebuildStudentPlan(user.id);

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "تعذر تحديث الخطة.",
      },
      { status: 400 },
    );
  }
}
