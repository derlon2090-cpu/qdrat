import { createHash } from "node:crypto";

import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import { renderPdfPagePreviewToPng } from "@/lib/pdf-page-preview";
import { getSummaryFilePayload } from "@/lib/summaries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function normalizeRequestedWidth(value: string | null) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return 1800;
  }

  return Math.min(Math.max(Math.round(parsed), 900), 2400);
}

function createPreviewEtag(summaryId: string, pageNumber: number, width: number, fileSize: number) {
  const digest = createHash("sha1")
    .update(`${summaryId}:${pageNumber}:${width}:${fileSize}`)
    .digest("hex");

  return `"${digest}"`;
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
        message: "يجب تسجيل الدخول أولًا لعرض صفحات الملخصات.",
      },
      { status: 401 },
    );
  }

  try {
    const { summaryId, pageNumber } = await params;
    const requestedWidth = normalizeRequestedWidth(request.nextUrl.searchParams.get("width"));
    const payload = await getSummaryFilePayload(user.id, summaryId);
    const rendered = await renderPdfPagePreviewToPng({
      fileBuffer: payload.fileBuffer,
      pageNumber: Number(pageNumber) || 1,
      requestedWidth,
    });
    const etag = createPreviewEtag(
      summaryId,
      rendered.normalizedPageNumber,
      requestedWidth,
      payload.fileBuffer.length,
    );

    if (request.headers.get("if-none-match") === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: {
          ETag: etag,
          "Cache-Control": "private, max-age=86400, stale-while-revalidate=604800",
        },
      });
    }

    return new NextResponse(rendered.buffer, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Content-Length": String(rendered.buffer.length),
        "Cache-Control": "private, max-age=86400, stale-while-revalidate=604800",
        ETag: etag,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "تعذر تجهيز معاينة الصفحة حاليًا.",
      },
      { status: 400 },
    );
  }
}
