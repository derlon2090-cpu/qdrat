import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import { setStudentTaskCompletion } from "@/lib/student-portal";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> },
) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          message: "يجب تسجيل الدخول أولًا لتحديث المهام.",
        },
        { status: 401 },
      );
    }

    const { taskId } = await params;
    const payload = (await request.json()) as { completed?: boolean };

    const data = await setStudentTaskCompletion(user.id, Number(taskId), Boolean(payload.completed));

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "تعذر تحديث حالة المهمة.",
      },
      { status: 400 },
    );
  }
}
