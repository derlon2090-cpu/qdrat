import { NextRequest, NextResponse } from "next/server";

import {
  deleteVerbalPassage,
  getVerbalPassageById,
  updateVerbalPassage,
} from "@/lib/verbal-passages";
import type { VerbalPassageImportInput } from "@/lib/verbal-passages-core";

function mapRequestBodyToPassageInput(payload: Record<string, unknown>): VerbalPassageImportInput {
  return {
    title: String(payload.title ?? "").trim(),
    keywords: Array.isArray(payload.keywords)
      ? payload.keywords.map((item) => String(item ?? "").trim()).filter(Boolean)
      : [],
    passageText: String(payload.passageText ?? payload.passage_text ?? "").trim(),
    status: payload.status === "published" ? "published" : "draft",
    externalSourceId: payload.externalSourceId ? String(payload.externalSourceId) : null,
    version: payload.version ? Number(payload.version) : null,
    questions: Array.isArray(payload.questions)
      ? payload.questions.map((question) => {
          const row = question as Record<string, unknown>;
          return {
            questionText: String(row.questionText ?? row.question_text ?? "").trim(),
            optionA: String(row.optionA ?? row.option_a ?? "").trim(),
            optionB: String(row.optionB ?? row.option_b ?? "").trim(),
            optionC: String(row.optionC ?? row.option_c ?? "").trim(),
            optionD: String(row.optionD ?? row.option_d ?? "").trim(),
            correctOption: String(row.correctOption ?? row.correct_option ?? "").trim().toUpperCase() as
              | "A"
              | "B"
              | "C"
              | "D",
            explanation: row.explanation ? String(row.explanation) : null,
          };
        })
      : [],
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ passageId: string }> },
) {
  try {
    const { passageId } = await params;
    const item = await getVerbalPassageById(passageId);

    if (!item) {
      return NextResponse.json(
        {
          ok: false,
          message: "القطعة المطلوبة غير موجودة.",
        },
        { status: 404 },
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
        message: error instanceof Error ? error.message : "تعذر جلب القطعة.",
      },
      { status: 500 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ passageId: string }> },
) {
  try {
    const { passageId } = await params;
    const payload = (await request.json()) as Record<string, unknown>;
    const item = await updateVerbalPassage(passageId, mapRequestBodyToPassageInput(payload));

    return NextResponse.json({
      ok: true,
      item,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "تعذر تحديث القطعة.",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ passageId: string }> },
) {
  try {
    const { passageId } = await params;
    await deleteVerbalPassage(passageId);

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "تعذر حذف القطعة.",
      },
      { status: 400 },
    );
  }
}
