import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import { trackUserQuestionProgress, type QuestionProgressSection } from "@/lib/user-question-progress";

export async function POST(request: NextRequest) {
  const user = await getAuthenticatedUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        message: "سجل دخولك حتى يتم حفظ الأسئلة المحلولة وXP داخل ملف الطالب.",
      },
      { status: 401 },
    );
  }

  try {
    const payload = (await request.json()) as {
      questionKey?: string;
      questionId?: number | null;
      section?: QuestionProgressSection;
      sourceBank?: string;
      categoryId?: string | null;
      categoryTitle?: string | null;
      questionTypeLabel?: string;
      questionText?: string;
      questionHref?: string | null;
      selectedAnswer?: string | null;
      correctAnswer?: string | null;
      metadata?: Record<string, unknown>;
      outcome?: "correct" | "incorrect";
      xpValue?: number;
    };

    const result = await trackUserQuestionProgress(user.id, {
      questionKey: payload.questionKey ?? "",
      questionId: payload.questionId ?? null,
      section: payload.section === "quantitative" ? "quantitative" : "verbal",
      sourceBank: payload.sourceBank ?? "بنك الأسئلة",
      categoryId: payload.categoryId ?? null,
      categoryTitle: payload.categoryTitle ?? null,
      questionTypeLabel: payload.questionTypeLabel ?? "سؤال",
      questionText: payload.questionText ?? "",
      questionHref: payload.questionHref ?? null,
      selectedAnswer: payload.selectedAnswer ?? null,
      correctAnswer: payload.correctAnswer ?? null,
      metadata: payload.metadata ?? {},
      outcome: payload.outcome === "incorrect" ? "incorrect" : "correct",
      xpValue: payload.xpValue ?? 10,
    });

    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "تعذر حفظ تقدم السؤال.",
      },
      { status: 400 },
    );
  }
}
