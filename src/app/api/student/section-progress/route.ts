import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import {
  getUserSectionProgress,
  resetUserSectionProgress,
  type QuestionProgressSection,
} from "@/lib/user-question-progress";

function readSection(request: NextRequest): QuestionProgressSection {
  return request.nextUrl.searchParams.get("section") === "quantitative"
    ? "quantitative"
    : "verbal";
}

function readCategoryId(request: NextRequest) {
  return request.nextUrl.searchParams.get("categoryId")?.trim() || "";
}

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        message: "سجل دخولك حتى نستعيد تقدم القسم من حسابك.",
      },
      { status: 401 },
    );
  }

  const categoryId = readCategoryId(request);
  if (!categoryId) {
    return NextResponse.json(
      {
        ok: false,
        message: "categoryId مطلوب لاسترجاع تقدم القسم.",
      },
      { status: 400 },
    );
  }

  try {
    const snapshot = await getUserSectionProgress(
      user.id,
      readSection(request),
      categoryId,
    );

    return NextResponse.json({
      ok: true,
      snapshot,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "تعذر استرجاع تقدم القسم.",
      },
      { status: 400 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const user = await getAuthenticatedUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        message: "سجل دخولك حتى نعيد ضبط القسم داخل حسابك.",
      },
      { status: 401 },
    );
  }

  const categoryId = readCategoryId(request);
  if (!categoryId) {
    return NextResponse.json(
      {
        ok: false,
        message: "categoryId مطلوب لإعادة ضبط القسم.",
      },
      { status: 400 },
    );
  }

  try {
    const result = await resetUserSectionProgress(
      user.id,
      readSection(request),
      categoryId,
    );

    return NextResponse.json({
      ok: true,
      result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "تعذر إعادة ضبط القسم.",
      },
      { status: 400 },
    );
  }
}
