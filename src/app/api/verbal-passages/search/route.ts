import { NextRequest, NextResponse } from "next/server";

import { searchPassages } from "@/lib/verbal-passages";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q") ?? "";
    const items = await searchPassages(query, {
      limit: Number(searchParams.get("limit") ?? "24"),
      includeDraft: searchParams.get("includeDraft") === "1",
    });

    return NextResponse.json({
      ok: true,
      items,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "تعذر تنفيذ البحث في القطع اللفظية.",
      },
      { status: 500 },
    );
  }
}
