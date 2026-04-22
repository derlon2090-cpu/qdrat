import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import {
  recordTrainingSessionOutcome,
  type TrainingSessionOutcomeInput,
} from "@/lib/gamification";

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          message: "سجل دخولك أولًا حتى يتم حفظ XP الخاص بجلسات الأخطاء.",
        },
        { status: 401 },
      );
    }

    const payload = (await request.json()) as Partial<TrainingSessionOutcomeInput>;
    const sessionKey = String(payload.sessionKey ?? "").trim();

    if (!sessionKey) {
      return NextResponse.json(
        {
          ok: false,
          message: "sessionKey مطلوب لتسجيل نتيجة الجلسة.",
        },
        { status: 400 },
      );
    }

    const result = await recordTrainingSessionOutcome(user.id, {
      sessionKey,
      mode:
        payload.mode === "challenge" ||
        payload.mode === "speed" ||
        payload.mode === "bedtime" ||
        payload.mode === "worst10"
          ? payload.mode
          : "standard",
      track:
        payload.track === "verbal" || payload.track === "quantitative"
          ? payload.track
          : "all",
      questionCount: Math.max(0, Math.round(payload.questionCount ?? 0)),
      percent: Math.max(0, Math.min(100, Math.round(payload.percent ?? 0))),
      passed: Boolean(payload.passed),
      abandoned: Boolean(payload.abandoned),
      duelId:
        typeof payload.duelId === "number" && Number.isFinite(payload.duelId)
          ? Math.max(0, Math.round(payload.duelId))
          : null,
      durationMs:
        typeof payload.durationMs === "number" && Number.isFinite(payload.durationMs)
          ? Math.max(0, Math.round(payload.durationMs))
          : null,
    });

    return NextResponse.json({ ok: true, data: result });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error ? error.message : "تعذر حفظ نتيجة جلسة الأخطاء.",
      },
      { status: 400 },
    );
  }
}
