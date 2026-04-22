import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import {
  buildMistakeAnalytics,
  resolveMistakeTrainingQuestions,
} from "@/lib/mistake-training";
import {
  listUserMistakes,
  trackUserMistake,
  type MistakeSection,
} from "@/lib/user-mistakes";

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        message: "يجب إنشاء حساب وتسجيل الدخول للوصول إلى قائمة الأخطاء.",
      },
      { status: 401 },
    );
  }

  try {
    const items = await listUserMistakes(user.id);
    const { questions, unresolvedCount } = await resolveMistakeTrainingQuestions(items);
    const stats = buildMistakeAnalytics(items, questions, unresolvedCount);

    return NextResponse.json({
      ok: true,
      items,
      trainingQuestions: questions,
      stats,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "تعذر جلب قائمة الأخطاء.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        message: "سجل دخولك حتى يتم حفظ أسئلتك الخاطئة في قائمة الأخطاء.",
      },
      { status: 401 },
    );
  }

  try {
    const payload = (await request.json()) as {
      questionKey?: string;
      questionId?: number | null;
      section?: MistakeSection;
      sourceBank?: string;
      questionTypeLabel?: string;
      questionText?: string;
      questionHref?: string | null;
      metadata?: Record<string, unknown>;
      outcome?: "correct" | "incorrect";
    };

    const result = await trackUserMistake(user.id, {
      questionKey: payload.questionKey ?? "",
      questionId: payload.questionId ?? null,
      section: payload.section === "quantitative" ? "quantitative" : "verbal",
      sourceBank: payload.sourceBank ?? "بنك الأسئلة",
      questionTypeLabel: payload.questionTypeLabel ?? "سؤال",
      questionText: payload.questionText ?? "",
      questionHref: payload.questionHref ?? null,
      metadata: payload.metadata ?? {},
      outcome: payload.outcome === "correct" ? "correct" : "incorrect",
    });

    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "تعذر تحديث قائمة الأخطاء.",
      },
      { status: 400 },
    );
  }
}
