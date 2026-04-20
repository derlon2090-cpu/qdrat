import { readFile } from "node:fs/promises";
import path from "node:path";

import * as fontkit from "fontkit";
import { NextRequest, NextResponse } from "next/server";
import { PDFDocument, rgb, type PDFFont, type PDFPage } from "pdf-lib";

import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import {
  getSummaryDetail,
  getSummaryFilePayload,
  type SummaryDrawingStroke,
  type SummaryHideRegion,
  type SummaryPageState,
  type SummarySolutionBox,
} from "@/lib/summaries";

function safeFileName(fileName: string) {
  return encodeURIComponent(
    `${fileName.replace(/\.pdf$/i, "").replace(/["\r\n]/g, " ").trim()}-annotated.pdf`,
  );
}

function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "").trim();
  if (normalized.length !== 6) {
    return rgb(0.06, 0.09, 0.16);
  }

  const red = parseInt(normalized.slice(0, 2), 16) / 255;
  const green = parseInt(normalized.slice(2, 4), 16) / 255;
  const blue = parseInt(normalized.slice(4, 6), 16) / 255;

  return rgb(red, green, blue);
}

function toPdfBox(
  page: PDFPage,
  box: Pick<SummaryHideRegion | SummarySolutionBox, "x" | "y" | "width" | "height">,
) {
  const pageWidth = page.getWidth();
  const pageHeight = page.getHeight();
  const width = box.width * pageWidth;
  const height = box.height * pageHeight;
  const x = box.x * pageWidth;
  const y = pageHeight - box.y * pageHeight - height;

  return { x, y, width, height };
}

function wrapText(text: string, font: PDFFont, fontSize: number, maxWidth: number) {
  const words = text.replace(/\s+/g, " ").trim().split(" ");
  const lines: string[] = [];
  let currentLine = "";

  words.forEach((word) => {
    const nextLine = currentLine ? `${currentLine} ${word}` : word;
    const nextWidth = font.widthOfTextAtSize(nextLine, fontSize);

    if (nextWidth <= maxWidth || !currentLine) {
      currentLine = nextLine;
      return;
    }

    lines.push(currentLine);
    currentLine = word;
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

function drawWrappedText(options: {
  page: PDFPage;
  font: PDFFont;
  text: string;
  x: number;
  y: number;
  width: number;
  maxLines: number;
  fontSize: number;
  lineHeight: number;
  color: ReturnType<typeof rgb>;
}) {
  const lines = wrapText(options.text, options.font, options.fontSize, options.width).slice(
    0,
    options.maxLines,
  );

  lines.forEach((line, index) => {
    const lineWidth = options.font.widthOfTextAtSize(line, options.fontSize);
    options.page.drawText(line, {
      x: options.x + Math.max(0, options.width - lineWidth),
      y: options.y - index * options.lineHeight,
      size: options.fontSize,
      font: options.font,
      color: options.color,
    });
  });
}

function drawBadge(page: PDFPage, font: PDFFont, state: SummaryPageState) {
  const pageWidth = page.getWidth();
  const pageHeight = page.getHeight();
  let fill = rgb(0.07, 0.23, 0.48);
  let label = "";

  if (state.pageColor === "red") {
    fill = rgb(0.88, 0.15, 0.23);
    label = "صعبة";
  } else if (state.pageColor === "yellow") {
    fill = rgb(0.89, 0.64, 0.05);
    label = "مراجعة";
  } else if (state.pageColor === "green") {
    fill = rgb(0.09, 0.64, 0.33);
    label = "ممتازة";
  } else if (state.reviewed) {
    fill = rgb(0.09, 0.64, 0.33);
    label = "تمت";
  }

  if (!label) return;

  const width = 84;
  const height = 24;
  const x = pageWidth - width - 20;
  const y = pageHeight - 32;

  page.drawRectangle({
    x,
    y,
    width,
    height,
    color: fill,
  });

  const size = 11;
  const textWidth = font.widthOfTextAtSize(label, size);
  page.drawText(label, {
    x: x + (width - textWidth) / 2,
    y: y + 7,
    size,
    font,
    color: rgb(1, 1, 1),
  });
}

function drawHideRegions(page: PDFPage, regions: SummaryHideRegion[]) {
  regions.forEach((region) => {
    const frame = toPdfBox(page, region);
    page.drawRectangle({
      x: frame.x,
      y: frame.y,
      width: frame.width,
      height: frame.height,
      color: rgb(1, 1, 1),
      borderColor: rgb(0.82, 0.85, 0.9),
      borderWidth: 0.75,
      opacity: 0.98,
    });
  });
}

function drawSolutionBoxes(page: PDFPage, font: PDFFont, boxes: SummarySolutionBox[]) {
  boxes.forEach((box) => {
    const frame = toPdfBox(page, box);
    page.drawRectangle({
      x: frame.x,
      y: frame.y,
      width: frame.width,
      height: frame.height,
      color: rgb(1, 0.97, 0.89),
      borderColor: rgb(0.79, 0.6, 0.26),
      borderWidth: 1,
      opacity: 0.95,
    });

    if (!box.content.trim()) return;

    drawWrappedText({
      page,
      font,
      text: box.content,
      x: frame.x + 10,
      y: frame.y + frame.height - 18,
      width: frame.width - 20,
      maxLines: Math.max(3, Math.floor((frame.height - 18) / 15)),
      fontSize: 11,
      lineHeight: 14,
      color: rgb(0.06, 0.09, 0.16),
    });
  });
}

function drawStrokes(page: PDFPage, strokes: SummaryDrawingStroke[]) {
  const pageWidth = page.getWidth();
  const pageHeight = page.getHeight();

  strokes.forEach((stroke) => {
    if (stroke.points.length < 2) return;

    const strokeColor = hexToRgb(stroke.color);

    for (let index = 1; index < stroke.points.length; index += 1) {
      const previous = stroke.points[index - 1];
      const current = stroke.points[index];

      page.drawLine({
        start: {
          x: previous.x * pageWidth,
          y: pageHeight - previous.y * pageHeight,
        },
        end: {
          x: current.x * pageWidth,
          y: pageHeight - current.y * pageHeight,
        },
        thickness: stroke.strokeWidth,
        color: strokeColor,
        opacity: stroke.tool === "highlighter" ? Math.min(0.26, stroke.opacity) : stroke.opacity,
      });
    }
  });
}

function drawPageNote(page: PDFPage, font: PDFFont, state: SummaryPageState) {
  if (!state.noteText.trim()) return;

  const pageWidth = page.getWidth();
  const pageHeight = page.getHeight();
  const width = Math.min(180, pageWidth * 0.32);
  const height = Math.min(150, pageHeight * 0.24);
  const x = 18;
  const y = 18;

  page.drawRectangle({
    x,
    y,
    width,
    height,
    color: rgb(1, 0.98, 0.82),
    borderColor: rgb(0.95, 0.79, 0.33),
    borderWidth: 1,
    opacity: 0.95,
  });

  const title = `ملاحظة صفحة ${state.pageNumber}`;
  page.drawText(title, {
    x: x + 10,
    y: y + height - 18,
    size: 11,
    font,
    color: rgb(0.57, 0.4, 0.09),
  });

  drawWrappedText({
    page,
    font,
    text: state.noteText,
    x: x + 10,
    y: y + height - 34,
    width: width - 20,
    maxLines: Math.max(4, Math.floor((height - 36) / 13)),
    fontSize: 10,
    lineHeight: 12,
    color: rgb(0.06, 0.09, 0.16),
  });
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
    const [payload, detail] = await Promise.all([
      getSummaryFilePayload(user.id, summaryId),
      getSummaryDetail(user.id, summaryId),
    ]);

    const pdf = await PDFDocument.load(payload.fileBuffer);
    pdf.registerFontkit(fontkit as never);

    const fontBytes = await readFile(
      path.join(process.cwd(), "src", "assets", "fonts", "Candarab.ttf"),
    );
    const arabicFont = await pdf.embedFont(fontBytes, { subset: false });

    pdf.getPages().forEach((page, index) => {
      const state = detail.pageStates.find((item) => item.pageNumber === index + 1);
      if (!state) return;

      drawBadge(page, arabicFont, state);
      drawHideRegions(page, state.hideRegions);
      drawSolutionBoxes(page, arabicFont, state.solutionBoxes);
      drawStrokes(page, state.drawings);
      drawPageNote(page, arabicFont, state);
    });

    const exportedPdf = await pdf.save();

    return new NextResponse(Buffer.from(exportedPdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename*=UTF-8''${safeFileName(payload.fileName)}`,
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
            : "تعذر تصدير نسخة PDF بالتعليقات حالياً.",
      },
      { status: 400 },
    );
  }
}
