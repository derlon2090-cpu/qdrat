import { NextRequest, NextResponse } from "next/server";

import { getBankItems } from "@/lib/question-bank-api";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const items = await getBankItems({
    query: searchParams.get("q") ?? "",
    type: searchParams.get("type") ?? "لفظي",
  });

  return NextResponse.json({
    ok: true,
    items,
  });
}
