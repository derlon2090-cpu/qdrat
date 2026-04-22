import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import { createStudentChallengeDuel } from "@/lib/gamification";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          message: "يجب تسجيل الدخول أولًا لبدء نزال 1v1.",
        },
        { status: 401 },
      );
    }

    const payload = (await request.json()) as {
      opponentId?: string;
      track?: "all" | "verbal" | "quantitative";
      questionCount?: number;
    };

    const opponentId = String(payload.opponentId ?? "").trim();

    if (!opponentId) {
      return NextResponse.json(
        {
          ok: false,
          message: "معرّف المنافس مطلوب لإنشاء النزال.",
        },
        { status: 400 },
      );
    }

    const result = await createStudentChallengeDuel({
      challengerId: user.id,
      opponentId,
      track: payload.track,
      questionCount: payload.questionCount,
    });

    return NextResponse.json({ ok: true, data: result });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "تعذر إنشاء نزال 1v1 الآن.",
      },
      { status: 400 },
    );
  }
}
