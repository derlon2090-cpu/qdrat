import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import { getSummaryPageState, upsertSummaryPageState } from "@/lib/summaries";

export const runtime = "nodejs";

function formatPageStateError(error: unknown, fallbackMessage: string) {
  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ summaryId: string; pageNumber: string }> },
) {
  const user = await getAuthenticatedUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "يجب إنشاء حساب وتسجيل الدخول لاستخدام قسم الملخصات وحفظ ملفاتك وملاحظاتك.",
      },
      { status: 401 },
    );
  }

  try {
    const { summaryId, pageNumber } = await params;
    const item = await getSummaryPageState(
      user.id,
      summaryId,
      Number(pageNumber) || 1,
    );

    return NextResponse.json({
      ok: true,
      item,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: formatPageStateError(error, "تعذر تحميل بيانات هذه الصفحة."),
      },
      { status: 400 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ summaryId: string; pageNumber: string }> },
) {
  const user = await getAuthenticatedUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        message:
          "يجب إنشاء حساب وتسجيل الدخول لاستخدام قسم الملخصات وحفظ ملفاتك وملاحظاتك.",
      },
      { status: 401 },
    );
  }

  try {
    const { summaryId, pageNumber } = await params;
    const payload = (await request.json()) as Record<string, unknown>;
    const item = await upsertSummaryPageState(
      user.id,
      summaryId,
      Number(pageNumber) || 1,
      {
        noteText:
          typeof payload.noteText === "string" ? payload.noteText : undefined,
        reviewed:
          typeof payload.reviewed === "boolean" ? payload.reviewed : undefined,
        pageColor:
          payload.pageColor === "red" ||
          payload.pageColor === "yellow" ||
          payload.pageColor === "green" ||
          payload.pageColor === null
            ? (payload.pageColor as "red" | "yellow" | "green" | null)
            : undefined,
        hideRegions: Array.isArray(payload.hideRegions)
          ? payload.hideRegions
          : undefined,
        solutionBoxes: Array.isArray(payload.solutionBoxes)
          ? payload.solutionBoxes
          : undefined,
        drawings: Array.isArray(payload.drawings)
          ? payload.drawings
          : undefined,
      },
    );

    return NextResponse.json({
      ok: true,
      item,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: formatPageStateError(error, "تعذر حفظ تعديلات الصفحة."),
      },
      { status: 400 },
    );
  }
}
