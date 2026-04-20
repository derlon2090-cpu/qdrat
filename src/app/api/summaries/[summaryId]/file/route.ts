import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import { getSummaryFilePayload } from "@/lib/summaries";

function createSafeFileName(fileName: string) {
  return encodeURIComponent(fileName.replace(/["\r\n]/g, " ").trim());
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
    const payload = await getSummaryFilePayload(user.id, summaryId);

    return new NextResponse(payload.fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": payload.fileMimeType,
        "Content-Disposition": `inline; filename*=UTF-8''${createSafeFileName(payload.fileName)}`,
        "Cache-Control": "private, no-store, max-age=0",
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message:
          error instanceof Error
            ? error.message
            : "تعذر تحميل ملف الملخص حاليًا.",
      },
      { status: 400 },
    );
  }
}
