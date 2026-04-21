import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import { finalizeSummaryUploadSession, saveSummaryUploadChunk } from "@/lib/summaries";

export const runtime = "nodejs";

function formatUploadError(error: unknown, fallbackMessage: string) {
  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const user = await getAuthenticatedUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        message: "يجب إنشاء حساب وتسجيل الدخول لاستخدام قسم الملخصات وحفظ ملفاتك وملاحظاتك.",
      },
      { status: 401 },
    );
  }

  try {
    const { sessionId } = await params;
    const formData = await request.formData();
    const chunk = formData.get("chunk");
    const chunkIndex = Number(formData.get("chunkIndex") ?? 0);

    if (!(chunk instanceof File)) {
      return NextResponse.json(
        {
          ok: false,
          message: "تعذر قراءة جزء الملف المرسل.",
        },
        { status: 400 },
      );
    }

    const progress = await saveSummaryUploadChunk({
      userId: user.id,
      sessionId,
      chunkIndex,
      chunkBuffer: Buffer.from(await chunk.arrayBuffer()),
    });

    return NextResponse.json({
      ok: true,
      progress,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: formatUploadError(error, "تعذر رفع جزء من الملف."),
      },
      { status: 400 },
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const user = await getAuthenticatedUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        message: "يجب إنشاء حساب وتسجيل الدخول لاستخدام قسم الملخصات وحفظ ملفاتك وملاحظاتك.",
      },
      { status: 401 },
    );
  }

  try {
    const { sessionId } = await params;
    const item = await finalizeSummaryUploadSession(user.id, sessionId);

    return NextResponse.json({
      ok: true,
      item,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: formatUploadError(error, "تعذر إكمال رفع الملف."),
      },
      { status: 400 },
    );
  }
}
