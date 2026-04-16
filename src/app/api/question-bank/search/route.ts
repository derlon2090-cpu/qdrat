import { NextRequest, NextResponse } from "next/server";

import { getQuestionItems } from "@/lib/question-bank-api";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const items = await getQuestionItems({
    query: searchParams.get("q") ?? "",
    section: searchParams.get("section") ?? "الكل",
    type: searchParams.get("type") ?? "الكل",
    difficulty: searchParams.get("difficulty") ?? "الكل",
    skill: searchParams.get("skill") ?? "الكل",
    state: searchParams.get("state") ?? "الكل",
    limit: Number(searchParams.get("limit") ?? "24"),
  });

  return NextResponse.json({
    ok: true,
    items,
  });
}
