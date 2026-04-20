import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import type { StudentPlanType } from "@/lib/student-portal";
import { saveStudentOnboarding } from "@/lib/student-portal";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          message: "يجب تسجيل الدخول أولًا لإعداد الخطة الذكية.",
        },
        { status: 401 },
      );
    }

    const payload = (await request.json()) as {
      examDate?: string | null;
      daysLeft?: number | null;
      quantRemainingSections?: number | null;
      verbalRemainingSections?: number | null;
      dailyStudyHours?: number | null;
      planType?: StudentPlanType;
    };

    const data = await saveStudentOnboarding(user.id, {
      examDate: payload.examDate ?? null,
      daysLeft: payload.daysLeft ?? null,
      quantRemainingSections: payload.quantRemainingSections ?? null,
      verbalRemainingSections: payload.verbalRemainingSections ?? null,
      dailyStudyHours: payload.dailyStudyHours ?? null,
      planType: payload.planType === "light" || payload.planType === "intensive" ? payload.planType : "medium",
    });

    return NextResponse.json({ ok: true, data });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "تعذر حفظ الإعداد الأولي.",
      },
      { status: 400 },
    );
  }
}
