import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import { createSummaryUploadSession } from "@/lib/summaries";

export const runtime = "nodejs";

function formatUploadError(error: unknown, fallbackMessage: string) {
  if (error instanceof Error) {
    return error.message;
  }

  return fallbackMessage;
}

export async function POST(request: NextRequest) {
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
    const payload = (await request.json()) as {
      fileName?: string;
      fileMimeType?: string;
      fileSizeBytes?: number;
    };

    const session = await createSummaryUploadSession({
      userId: user.id,
      fileName: payload.fileName ?? "",
      fileMimeType: payload.fileMimeType ?? "application/pdf",
      fileSizeBytes: Number(payload.fileSizeBytes) || 0,
    });

    return NextResponse.json({
      ok: true,
      session,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: formatUploadError(error, "تعذر بدء رفع الملف حاليًا."),
      },
      { status: 400 },
    );
  }
}
