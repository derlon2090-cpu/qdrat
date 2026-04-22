import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import {
  recordUserMistakeTrainingAttempt,
  removeUserMistake,
  updateUserMistakeState,
  type MistakeMasteryState,
  type MistakeOutcome,
} from "@/lib/user-mistakes";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ mistakeId: string }> },
) {
  const user = await getAuthenticatedUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        message: "يجب تسجيل الدخول أولًا.",
      },
      { status: 401 },
    );
  }

  try {
    const { mistakeId } = await context.params;
    await removeUserMistake(user.id, Number(mistakeId));

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "تعذر حذف السؤال من قائمة الأخطاء.",
      },
      { status: 400 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ mistakeId: string }> },
) {
  const user = await getAuthenticatedUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        message: "يجب تسجيل الدخول أولًا.",
      },
      { status: 401 },
    );
  }

  try {
    const { mistakeId } = await context.params;
    const payload = (await request.json()) as {
      action?: "set_state" | "record_training";
      masteryState?: MistakeMasteryState;
      outcome?: MistakeOutcome;
    };

    let item = null;

    if (payload.action === "record_training") {
      item = await recordUserMistakeTrainingAttempt(
        user.id,
        Number(mistakeId),
        payload.outcome === "correct" ? "correct" : "incorrect",
      );
    } else {
      item = await updateUserMistakeState(
        user.id,
        Number(mistakeId),
        payload.masteryState === "mastered" ||
          payload.masteryState === "training" ||
          payload.masteryState === "incorrect"
          ? payload.masteryState
          : "training",
      );
    }

    return NextResponse.json({
      ok: true,
      item,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "تعذر تحديث حالة السؤال داخل الأخطاء.",
      },
      { status: 400 },
    );
  }
}
