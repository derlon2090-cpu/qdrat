import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import { getSummaryDetail, updateSummaryLastOpenedPage } from "@/lib/summaries";

export const runtime = "nodejs";

function formatSummaryError(error: unknown, fallbackMessage: string) {
  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ summaryId: string }> },
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
    const { summaryId } = await params;
    const item = await getSummaryDetail(user.id, summaryId);
    return NextResponse.json({
      ok: true,
      item,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: formatSummaryError(error, "تعذر تحميل الملخص المطلوب."),
      },
      { status: 400 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ summaryId: string }> },
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
    const { summaryId } = await params;
    const payload = (await request.json()) as {
      lastOpenedPage?: number;
    };

    const lastOpenedPage = await updateSummaryLastOpenedPage(
      user.id,
      summaryId,
      Number(payload.lastOpenedPage) || 1,
    );

    return NextResponse.json({
      ok: true,
      lastOpenedPage,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: formatSummaryError(error, "تعذر تحديث آخر صفحة وصلت لها."),
      },
      { status: 400 },
    );
  }
}
