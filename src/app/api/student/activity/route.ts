import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import { recordStudentActivity } from "@/lib/student-portal";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);

    if (!user) {
      return NextResponse.json({ ok: true });
    }

    const payload = (await request.json()) as {
      label?: string;
      path?: string;
      bankLabel?: string | null;
      bankHref?: string | null;
      summaryId?: string | null;
      summaryName?: string | null;
      summaryPage?: number | null;
    };

    if (!payload.label || !payload.path) {
      return NextResponse.json(
        {
          ok: false,
          message: "بيانات النشاط غير مكتملة.",
        },
        { status: 400 },
      );
    }

    await recordStudentActivity(user.id, {
      label: payload.label,
      path: payload.path,
      bankLabel: payload.bankLabel ?? null,
      bankHref: payload.bankHref ?? null,
      summaryId: payload.summaryId ?? null,
      summaryName: payload.summaryName ?? null,
      summaryPage: payload.summaryPage ?? null,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "تعذر حفظ آخر نشاط.",
      },
      { status: 400 },
    );
  }
}
