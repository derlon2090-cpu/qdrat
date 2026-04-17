import { NextRequest, NextResponse } from "next/server";

import {
  createVerbalPassage,
  listVerbalPassages,
  type VerbalPassageRecord,
} from "@/lib/verbal-passages";
import type { VerbalPassageImportInput } from "@/lib/verbal-passages-core";

function mapRequestBodyToPassageInput(payload: Record<string, unknown>): VerbalPassageImportInput {
  return {
    slug: payload.slug ? String(payload.slug).trim() : null,
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

function getQuestionCount(passage: VerbalPassageRecord) {
  return passage.questions.length;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const passages = await listVerbalPassages({
      status: (searchParams.get("status") as "draft" | "published" | "all" | null) ?? "all",
      search: searchParams.get("q") ?? "",
      limit: Number(searchParams.get("limit") ?? "60"),
    });

    return NextResponse.json({
      ok: true,
      items: passages.map((passage) => ({
        ...passage,
        questionCount: getQuestionCount(passage),
      })),
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "تعذر جلب بنك القطع اللفظية.",
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as Record<string, unknown>;
    const saved = await createVerbalPassage(mapRequestBodyToPassageInput(payload));

    return NextResponse.json({
      ok: true,
      item: saved,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "تعذر إنشاء القطعة.",
      },
      { status: 400 },
    );
  }
}
