import PDFParser from "pdf2json";

import { debugArabicPdfTextSample, normalizeExtractedArabicPdfText } from "@/lib/arabic-pdf-text";
import { ensureColumnIsUuid, getSqlClient } from "@/lib/db";

const MAX_SUMMARY_FILE_SIZE_BYTES = 25 * 1024 * 1024;
export const SUMMARY_UPLOAD_CHUNK_SIZE_BYTES = 2 * 1024 * 1024;
const DEFAULT_PAGE_WIDTH = 210;
const DEFAULT_PAGE_HEIGHT = 297;

const ACCEPTED_SUMMARY_FILE_MIME_TYPES = new Set([
  "application/pdf",
  "application/x-pdf",
  "application/acrobat",
  "applications/vnd.pdf",
  "text/pdf",
]);

type SummaryRow = {
  id: string;
  user_id: string;
  file_name: string;
  file_mime_type: string;
  file_size_bytes: number;
  page_count: number;
  page_dimensions: unknown;
  last_opened_page: number;
  last_used_at: string;
  created_at: string;
  updated_at: string;
};

type SummaryListRow = SummaryRow & {
  note_count: number;
  reviewed_pages: number;
};

type SummaryPageStateRow = {
  id: string;
  summary_id: string;
  user_id: string;
  page_number: number;
  note_text: string;
  reviewed: boolean;
  page_color: SummaryPageState["pageColor"];
  hide_regions: unknown;
  solution_boxes: unknown;
  drawings: unknown;
  created_at: string;
  updated_at: string;
};

type SummaryUploadSessionRow = {
  id: string;
  user_id: string;
  file_name: string;
  file_mime_type: string;
  file_size_bytes: number;
  total_chunks: number;
  status: string;
};

type SummaryUploadChunkRow = {
  chunk_index: number;
  chunk_data_base64: string;
};

export type SummaryPageDimension = {
  width: number;
  height: number;
};

export type SummaryHideRegion = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  preset?: "bottom-right" | "custom";
};

export type SummarySolutionBox = {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
};

export type SummaryDrawingPoint = {
  x: number;
  y: number;
};

export type SummaryDrawingStroke = {
  id: string;
  tool: "pen" | "highlighter";
  color: string;
  strokeWidth: number;
  opacity: number;
  points: SummaryDrawingPoint[];
};

export type SummaryPageState = {
  pageNumber: number;
  noteText: string;
  reviewed: boolean;
  pageColor: "red" | "yellow" | "green" | null;
  hideRegions: SummaryHideRegion[];
  solutionBoxes: SummarySolutionBox[];
  drawings: SummaryDrawingStroke[];
  createdAt: string | null;
  updatedAt: string | null;
};

export type SummaryListItem = {
  id: string;
  fileName: string;
  fileMimeType: string;
  fileSizeBytes: number;
  pageCount: number;
  pageDimensions: SummaryPageDimension[];
  lastOpenedPage: number;
  lastUsedAt: string;
  createdAt: string;
  updatedAt: string;
  noteCount: number;
  reviewedPages: number;
  completionRatio: number;
};

export type SummaryDetail = SummaryListItem & {
  pageStates: SummaryPageState[];
};

export type SummaryPageStateInput = {
  noteText?: string;
  reviewed?: boolean;
  pageColor?: SummaryPageState["pageColor"];
  hideRegions?: SummaryHideRegion[];
  solutionBoxes?: SummarySolutionBox[];
  drawings?: SummaryDrawingStroke[];
};

let ensureSummaryTablesPromise: Promise<void> | null = null;

function getSql() {
  return getSqlClient();
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function clampUnit(value: number) {
  return clamp(Number.isFinite(value) ? value : 0, 0, 1);
}

function normalizeInteger(value: number, fallback: number, min = 1) {
  const normalized = Number.isFinite(value) ? Math.round(value) : fallback;
  return Math.max(min, normalized);
}

function normalizeSummaryFileName(fileName: string) {
  const trimmed = fileName.trim().slice(0, 255) || "ملخص جديد.pdf";
  return trimmed.toLowerCase().endsWith(".pdf") ? trimmed : `${trimmed}.pdf`;
}

function isAcceptedPdfFile(fileName: string, fileMimeType: string | null | undefined) {
  const normalizedMimeType = (fileMimeType ?? "").trim().toLowerCase();
  return ACCEPTED_SUMMARY_FILE_MIME_TYPES.has(normalizedMimeType) || fileName.trim().toLowerCase().endsWith(".pdf");
}

function parseJsonArray<T>(value: unknown, fallback: T[]): T[] {
  if (Array.isArray(value)) {
    return value as T[];
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? (parsed as T[]) : fallback;
    } catch {
      return fallback;
    }
  }

  return fallback;
}

function sanitizePageDimensions(value: unknown): SummaryPageDimension[] {
  const raw = parseJsonArray<Record<string, unknown>>(value, []);

  if (!raw.length) {
    return [{ width: DEFAULT_PAGE_WIDTH, height: DEFAULT_PAGE_HEIGHT }];
  }

  return raw.map((item) => ({
    width: normalizeInteger(Number(item.width), DEFAULT_PAGE_WIDTH),
    height: normalizeInteger(Number(item.height), DEFAULT_PAGE_HEIGHT),
  }));
}

function sanitizeHideRegions(value: unknown): SummaryHideRegion[] {
  const raw = parseJsonArray<Record<string, unknown>>(value, []);

  return raw.map((item, index) => ({
    id:
      typeof item.id === "string" && item.id.trim()
        ? item.id
        : `hide-${index + 1}`,
    x: clampUnit(Number(item.x)),
    y: clampUnit(Number(item.y)),
    width: clampUnit(Number(item.width) || 0.22),
    height: clampUnit(Number(item.height) || 0.08),
    preset:
      item.preset === "bottom-right" ? "bottom-right" : "custom",
  }));
}

function sanitizeSolutionBoxes(value: unknown): SummarySolutionBox[] {
  const raw = parseJsonArray<Record<string, unknown>>(value, []);

  return raw.map((item, index) => ({
    id:
      typeof item.id === "string" && item.id.trim()
        ? item.id
        : `solution-${index + 1}`,
    x: clampUnit(Number(item.x)),
    y: clampUnit(Number(item.y)),
    width: clampUnit(Number(item.width) || 0.28),
    height: clampUnit(Number(item.height) || 0.18),
    content: typeof item.content === "string" ? normalizeExtractedArabicPdfText(item.content).slice(0, 8000) : "",
  }));
}

function sanitizeArabicPdfTextInput(value: unknown) {
  return typeof value === "string" ? normalizeExtractedArabicPdfText(value).slice(0, 8000) : "";
}

function sanitizeDrawings(value: unknown): SummaryDrawingStroke[] {
  const raw = parseJsonArray<Record<string, unknown>>(value, []);

  return raw
    .map((item, index) => {
      const points = parseJsonArray<Record<string, unknown>>(item.points, [])
        .map((point) => ({
          x: clampUnit(Number(point.x)),
          y: clampUnit(Number(point.y)),
        }))
        .filter((point, pointIndex, allPoints) => {
          if (!Number.isFinite(point.x) || !Number.isFinite(point.y)) {
            return false;
          }

          if (pointIndex === 0) {
            return true;
          }

          const previous = allPoints[pointIndex - 1];
          return previous?.x !== point.x || previous?.y !== point.y;
        });

      return {
        id:
          typeof item.id === "string" && item.id.trim()
            ? item.id
            : `stroke-${index + 1}`,
        tool: item.tool === "highlighter" ? "highlighter" : "pen",
        color:
          typeof item.color === "string" && item.color.trim()
            ? item.color
            : "#0f172a",
        strokeWidth: clamp(Number(item.strokeWidth) || 2, 1, 16),
        opacity: clamp(Number(item.opacity) || (item.tool === "highlighter" ? 0.25 : 1), 0.08, 1),
        points,
      } satisfies SummaryDrawingStroke;
    })
    .filter((stroke) => stroke.points.length > 1);
}

function sanitizePageState(
  pageNumber: number,
  input?: SummaryPageStateInput | SummaryPageStateRow | null,
): SummaryPageState {
  const fromInput =
    input && "noteText" in input ? (input as SummaryPageStateInput) : null;
  const fromRow =
    input && "note_text" in input ? (input as SummaryPageStateRow) : null;

  return {
    pageNumber,
    noteText: typeof fromInput?.noteText === "string"
      ? sanitizeArabicPdfTextInput(fromInput.noteText)
      : typeof fromRow?.note_text === "string"
        ? sanitizeArabicPdfTextInput(fromRow.note_text)
        : "",
    reviewed:
      typeof fromInput?.reviewed === "boolean"
        ? fromInput.reviewed
        : Boolean(fromRow?.reviewed),
    pageColor:
      fromInput?.pageColor === "red" || fromInput?.pageColor === "yellow" || fromInput?.pageColor === "green"
        ? fromInput.pageColor
        : fromRow?.page_color === "red" ||
            fromRow?.page_color === "yellow" ||
            fromRow?.page_color === "green"
          ? (fromRow.page_color as SummaryPageState["pageColor"])
          : null,
    hideRegions: sanitizeHideRegions(
      fromInput ? fromInput.hideRegions : fromRow?.hide_regions,
    ),
    solutionBoxes: sanitizeSolutionBoxes(
      fromInput ? fromInput.solutionBoxes : fromRow?.solution_boxes,
    ),
    drawings: sanitizeDrawings(
      fromInput ? fromInput.drawings : fromRow?.drawings,
    ),
    createdAt:
      typeof fromRow?.created_at === "string"
        ? fromRow.created_at
        : null,
    updatedAt:
      typeof fromRow?.updated_at === "string"
        ? fromRow.updated_at
        : null,
  };
}

function decodePdf2JsonText(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function extractPdf2JsonPageText(page: Record<string, unknown>) {
  const textItems = Array.isArray(page.Texts)
    ? (page.Texts as Array<Record<string, unknown>>)
    : [];

  return textItems
    .map((textItem) => {
      const runs = Array.isArray(textItem.R)
        ? (textItem.R as Array<Record<string, unknown>>)
        : [];

      return runs.map((run) => decodePdf2JsonText(run.T)).join("");
    })
    .filter(Boolean)
    .join(" ");
}

function mapSummaryRow(row: SummaryListRow): SummaryListItem {
  const reviewedPages = Math.max(0, Number(row.reviewed_pages) || 0);
  const pageCount = Math.max(1, Number(row.page_count) || 1);

  return {
    id: row.id,
    fileName: row.file_name,
    fileMimeType: row.file_mime_type,
    fileSizeBytes: Number(row.file_size_bytes) || 0,
    pageCount,
    pageDimensions: sanitizePageDimensions(row.page_dimensions),
    lastOpenedPage: clamp(Number(row.last_opened_page) || 1, 1, pageCount),
    lastUsedAt: row.last_used_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    noteCount: Math.max(0, Number(row.note_count) || 0),
    reviewedPages,
    completionRatio: reviewedPages > 0 ? Math.round((reviewedPages / pageCount) * 100) : 0,
  };
}

async function parsePdfMetadata(buffer: Buffer): Promise<{
  pageCount: number;
  pageDimensions: SummaryPageDimension[];
}> {
  const fallbackPageCount = roughPageCountFromBuffer(buffer);

  try {
    const parser = new PDFParser(undefined, 0);
    const pdfData = await new Promise<unknown>((resolve, reject) => {
      parser.on("pdfParser_dataReady", resolve);
      parser.on("pdfParser_dataError", ({ parserError }) => reject(parserError));
      parser.parseBuffer(buffer);
    });

    const pages = Array.isArray((pdfData as { Pages?: unknown[] }).Pages)
      ? ((pdfData as { Pages: Array<Record<string, unknown>> }).Pages ?? [])
      : [];

    debugArabicPdfTextSample(
      "summary-metadata",
      pages.slice(0, 2).map(extractPdf2JsonPageText).join("\n"),
    );

    const pageDimensions = pages.length
      ? pages.map((page) => ({
          width: normalizeInteger(Number(page.Width), DEFAULT_PAGE_WIDTH),
          height: normalizeInteger(Number(page.Height), DEFAULT_PAGE_HEIGHT),
        }))
      : [{ width: DEFAULT_PAGE_WIDTH, height: DEFAULT_PAGE_HEIGHT }];

    const pageCount = Math.max(1, pages.length || fallbackPageCount || 1);

    if (pageDimensions.length < pageCount) {
      while (pageDimensions.length < pageCount) {
        pageDimensions.push({
          width: DEFAULT_PAGE_WIDTH,
          height: DEFAULT_PAGE_HEIGHT,
        });
      }
    }

    return {
      pageCount,
      pageDimensions,
    };
  } catch {
    const pageCount = Math.max(1, fallbackPageCount || 1);
    return {
      pageCount,
      pageDimensions: Array.from({ length: pageCount }, () => ({
        width: DEFAULT_PAGE_WIDTH,
        height: DEFAULT_PAGE_HEIGHT,
      })),
    };
  }
}

function roughPageCountFromBuffer(buffer: Buffer) {
  const content = buffer.toString("latin1");
  const matches = content.match(/\/Type\s*\/Page\b/g);
  return matches?.length ?? 0;
}

export async function ensureSummaryTables() {
  if (ensureSummaryTablesPromise) {
    return ensureSummaryTablesPromise;
  }

  ensureSummaryTablesPromise = (async () => {
    const sql = getSql();

    await sql.query(`
      create table if not exists app_user_summaries (
        id uuid primary key default gen_random_uuid(),
        user_id uuid not null references app_users(id) on delete cascade,
        file_name varchar(255) not null,
        file_mime_type varchar(120) not null default 'application/pdf',
        file_size_bytes integer not null default 0,
        file_data_base64 text not null,
        page_count integer not null default 1,
        page_dimensions jsonb not null default '[]'::jsonb,
        last_opened_page integer not null default 1,
        last_used_at timestamptz not null default now(),
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );
    `);

    await sql.query(`
      create table if not exists app_user_summary_page_states (
        id uuid primary key default gen_random_uuid(),
        summary_id uuid not null references app_user_summaries(id) on delete cascade,
        user_id uuid not null references app_users(id) on delete cascade,
        page_number integer not null,
        note_text text not null default '',
        reviewed boolean not null default false,
        page_color varchar(20),
        hide_regions jsonb not null default '[]'::jsonb,
        solution_boxes jsonb not null default '[]'::jsonb,
        drawings jsonb not null default '[]'::jsonb,
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now(),
        unique (summary_id, page_number)
      );
    `);

    await sql.query(`
      create table if not exists app_user_summary_upload_sessions (
        id uuid primary key default gen_random_uuid(),
        user_id uuid not null references app_users(id) on delete cascade,
        file_name varchar(255) not null,
        file_mime_type varchar(120) not null default 'application/pdf',
        file_size_bytes integer not null default 0,
        total_chunks integer not null,
        status varchar(20) not null default 'uploading',
        created_at timestamptz not null default now(),
        updated_at timestamptz not null default now()
      );
    `);

    await sql.query(`
      create table if not exists app_user_summary_upload_chunks (
        session_id uuid not null references app_user_summary_upload_sessions(id) on delete cascade,
        chunk_index integer not null,
        chunk_data_base64 text not null,
        created_at timestamptz not null default now(),
        primary key (session_id, chunk_index)
      );
    `);

    await sql.query(`
      create index if not exists idx_app_user_summaries_user_last_used
        on app_user_summaries (user_id, last_used_at desc);
    `);

    await sql.query(`
      create index if not exists idx_app_user_summary_page_states_summary_page
        on app_user_summary_page_states (summary_id, page_number);
    `);

    await sql.query(`
      create index if not exists idx_app_user_summary_page_states_user_page
        on app_user_summary_page_states (user_id, updated_at desc);
    `);

    await sql.query(`
      create index if not exists idx_app_user_summary_upload_sessions_user_created
        on app_user_summary_upload_sessions (user_id, created_at desc);
    `);

    await ensureColumnIsUuid("app_user_summaries", "id", { nullable: false });
    await ensureColumnIsUuid("app_user_summaries", "user_id", { nullable: false });
    await ensureColumnIsUuid("app_user_summary_page_states", "id", { nullable: false });
    await ensureColumnIsUuid("app_user_summary_page_states", "summary_id", { nullable: false });
    await ensureColumnIsUuid("app_user_summary_page_states", "user_id", { nullable: false });
    await ensureColumnIsUuid("app_user_summary_upload_sessions", "id", { nullable: false });
    await ensureColumnIsUuid("app_user_summary_upload_sessions", "user_id", { nullable: false });
    await ensureColumnIsUuid("app_user_summary_upload_chunks", "session_id", { nullable: false });

    await sql.query(`
      alter table app_user_summaries
      alter column id set default gen_random_uuid()
    `);

    await sql.query(`
      alter table app_user_summary_page_states
      alter column id set default gen_random_uuid()
    `);

    await sql.query(`
      alter table app_user_summary_upload_sessions
      alter column id set default gen_random_uuid()
    `);
  })();

  return ensureSummaryTablesPromise;
}

async function assertSummaryOwnership(userId: string, summaryId: string) {
  await ensureSummaryTables();
  const sql = getSql();
  const rows = (await sql.query(
    `
      select
        id::text,
        user_id::text,
        file_name,
        file_mime_type,
        file_size_bytes,
        page_count,
        page_dimensions,
        last_opened_page,
        last_used_at::text,
        created_at::text,
        updated_at::text
      from app_user_summaries
      where id::text = $1
        and user_id::text = $2
      limit 1
    `,
    [summaryId, userId],
  )) as SummaryRow[];

  const row = rows[0];
  if (!row) {
    throw new Error("تعذر العثور على هذا الملخص داخل حسابك.");
  }

  return row;
}

export async function listUserSummaries(userId: string) {
  await ensureSummaryTables();
  const sql = getSql();
  const rows = (await sql.query(
    `
      select
        summaries.id::text,
        summaries.user_id::text,
        summaries.file_name,
        summaries.file_mime_type,
        summaries.file_size_bytes,
        summaries.page_count,
        summaries.page_dimensions,
        summaries.last_opened_page,
        summaries.last_used_at::text,
        summaries.created_at::text,
        summaries.updated_at::text,
        coalesce(page_stats.note_count, 0) as note_count,
        coalesce(page_stats.reviewed_pages, 0) as reviewed_pages
      from app_user_summaries summaries
      left join lateral (
        select
          count(*) filter (where length(trim(note_text)) > 0)::integer as note_count,
          count(*) filter (where reviewed = true)::integer as reviewed_pages
        from app_user_summary_page_states states
        where states.summary_id = summaries.id
      ) page_stats on true
      where summaries.user_id::text = $1
      order by summaries.last_used_at desc, summaries.updated_at desc
    `,
    [userId],
  )) as SummaryListRow[];

  return rows.map(mapSummaryRow);
}

async function createSummaryRecordFromBuffer(input: {
  userId: string;
  fileName: string;
  fileMimeType: string;
  fileBuffer: Buffer;
}) {
  await ensureSummaryTables();

  if (!isAcceptedPdfFile(input.fileName, input.fileMimeType)) {
    throw new Error("يجب رفع ملف PDF فقط داخل قسم الملخصات.");
  }

  const buffer = input.fileBuffer;
  if (buffer.length > MAX_SUMMARY_FILE_SIZE_BYTES) {
    throw new Error("حجم الملف كبير جدًا. الحد الحالي 25 ميجابايت لكل ملخص.");
  }

  const normalizedFileName = normalizeSummaryFileName(input.fileName);
  const metadata = await parsePdfMetadata(buffer);
  const fileDataBase64 = buffer.toString("base64");
  const sql = getSql();

  const rows = (await sql.query(
    `
      insert into app_user_summaries (
        user_id,
        file_name,
        file_mime_type,
        file_size_bytes,
        file_data_base64,
        page_count,
        page_dimensions,
        last_opened_page,
        last_used_at
      )
      values (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7::jsonb,
        1,
        now()
      )
      returning
        id::text,
        user_id::text,
        file_name,
        file_mime_type,
        file_size_bytes,
        page_count,
        page_dimensions,
        last_opened_page,
        last_used_at::text,
        created_at::text,
        updated_at::text
    `,
    [
      input.userId,
      normalizedFileName,
      input.fileMimeType || "application/pdf",
      buffer.length,
      fileDataBase64,
      metadata.pageCount,
      JSON.stringify(metadata.pageDimensions),
    ],
  )) as SummaryRow[];

  const inserted = rows[0];
  if (!inserted) {
    throw new Error("تعذر حفظ الملف داخل مكتبة الملخصات حاليًا.");
  }

  return {
    ...mapSummaryRow({
      ...inserted,
      note_count: 0,
      reviewed_pages: 0,
    }),
    pageStates: [] as SummaryPageState[],
  } satisfies SummaryDetail;
}

export async function createUserSummary(userId: string, file: File) {
  const normalizedFileName = normalizeSummaryFileName(file.name);
  const fileMimeType = file.type?.trim() || "application/pdf";

  return createSummaryRecordFromBuffer({
    userId,
    fileName: normalizedFileName,
    fileMimeType,
    fileBuffer: Buffer.from(await file.arrayBuffer()),
  });
}

export async function createSummaryUploadSession(input: {
  userId: string;
  fileName: string;
  fileMimeType: string;
  fileSizeBytes: number;
}) {
  await ensureSummaryTables();

  const normalizedFileName = normalizeSummaryFileName(input.fileName);
  const normalizedMimeType = input.fileMimeType?.trim() || "application/pdf";
  const normalizedFileSize = Math.max(1, Math.round(input.fileSizeBytes));
  const normalizedTotalChunks = Math.max(1, Math.ceil(normalizedFileSize / SUMMARY_UPLOAD_CHUNK_SIZE_BYTES));

  if (!isAcceptedPdfFile(normalizedFileName, normalizedMimeType)) {
    throw new Error("يجب رفع ملف PDF فقط داخل قسم الملخصات.");
  }

  if (normalizedFileSize > MAX_SUMMARY_FILE_SIZE_BYTES) {
    throw new Error("حجم الملف كبير جدًا. الحد الحالي 25 ميجابايت لكل ملخص.");
  }

  const sql = getSql();
  const rows = (await sql.query(
    `
      insert into app_user_summary_upload_sessions (
        user_id,
        file_name,
        file_mime_type,
        file_size_bytes,
        total_chunks,
        status
      )
      values ($1, $2, $3, $4, $5, 'uploading')
      returning
        id::text,
        user_id::text,
        file_name,
        file_mime_type,
        file_size_bytes,
        total_chunks,
        status
    `,
    [
      input.userId,
      normalizedFileName,
      normalizedMimeType,
      normalizedFileSize,
      normalizedTotalChunks,
    ],
  )) as SummaryUploadSessionRow[];

  const row = rows[0];
  if (!row) {
    throw new Error("تعذر بدء جلسة رفع الملف حاليًا.");
  }

  return {
    sessionId: row.id,
    chunkSizeBytes: SUMMARY_UPLOAD_CHUNK_SIZE_BYTES,
    totalChunks: row.total_chunks,
  };
}

async function getSummaryUploadSession(userId: string, sessionId: string) {
  await ensureSummaryTables();
  const sql = getSql();
  const rows = (await sql.query(
    `
      select
        id::text,
        user_id::text,
        file_name,
        file_mime_type,
        file_size_bytes,
        total_chunks,
        status
      from app_user_summary_upload_sessions
      where id::text = $1
        and user_id::text = $2
      limit 1
    `,
    [sessionId, userId],
  )) as SummaryUploadSessionRow[];

  const row = rows[0];
  if (!row) {
    throw new Error("تعذر العثور على جلسة رفع هذا الملخص.");
  }

  return row;
}

export async function saveSummaryUploadChunk(input: {
  userId: string;
  sessionId: string;
  chunkIndex: number;
  chunkBuffer: Buffer;
}) {
  const session = await getSummaryUploadSession(input.userId, input.sessionId);
  const normalizedChunkIndex = Math.max(0, Math.round(input.chunkIndex));

  if (session.status !== "uploading") {
    throw new Error("جلسة الرفع لم تعد متاحة لاستقبال أجزاء جديدة.");
  }

  if (normalizedChunkIndex >= session.total_chunks) {
    throw new Error("رقم جزء الملف غير صالح.");
  }

  if (!input.chunkBuffer.length) {
    throw new Error("تم إرسال جزء فارغ من الملف.");
  }

  if (input.chunkBuffer.length > SUMMARY_UPLOAD_CHUNK_SIZE_BYTES + 16 * 1024) {
    throw new Error("حجم جزء الملف أكبر من الحد المسموح.");
  }

  const sql = getSql();
  await sql.query(
    `
      insert into app_user_summary_upload_chunks (
        session_id,
        chunk_index,
        chunk_data_base64
      )
      values ($1, $2, $3)
      on conflict (session_id, chunk_index)
      do update set
        chunk_data_base64 = excluded.chunk_data_base64,
        created_at = now()
    `,
    [
      input.sessionId,
      normalizedChunkIndex,
      input.chunkBuffer.toString("base64"),
    ],
  );

  await sql.query(
    `
      update app_user_summary_upload_sessions
      set updated_at = now()
      where id::text = $1
        and user_id::text = $2
    `,
    [input.sessionId, input.userId],
  );

  const progressRows = (await sql.query(
    `
      select count(*)::integer as uploaded_chunks
      from app_user_summary_upload_chunks
      where session_id::text = $1
    `,
    [input.sessionId],
  )) as Array<{ uploaded_chunks: number }>;

  return {
    uploadedChunks: Number(progressRows[0]?.uploaded_chunks ?? 0),
    totalChunks: session.total_chunks,
  };
}

export async function finalizeSummaryUploadSession(userId: string, sessionId: string) {
  const session = await getSummaryUploadSession(userId, sessionId);
  const sql = getSql();
  const chunkRows = (await sql.query(
    `
      select
        chunk_index,
        chunk_data_base64
      from app_user_summary_upload_chunks
      where session_id::text = $1
      order by chunk_index asc
    `,
    [sessionId],
  )) as SummaryUploadChunkRow[];

  if (chunkRows.length !== session.total_chunks) {
    throw new Error("رفع الملف لم يكتمل بعد. حاول مجددًا بعد انتهاء إرسال جميع الأجزاء.");
  }

  const fileBuffer = Buffer.concat(
    chunkRows.map((row, index) => {
      if (row.chunk_index !== index) {
        throw new Error("أجزاء الملف غير مرتبة بشكل صحيح. أعد رفع الملف مرة أخرى.");
      }

      return Buffer.from(row.chunk_data_base64, "base64");
    }),
  );

  if (fileBuffer.length !== session.file_size_bytes) {
    throw new Error("تم رفع ملف غير مكتمل. أعد محاولة الرفع من جديد.");
  }

  await sql.query(
    `
      update app_user_summary_upload_sessions
      set status = 'processing', updated_at = now()
      where id::text = $1
        and user_id::text = $2
    `,
    [sessionId, userId],
  );

  const createdSummary = await createSummaryRecordFromBuffer({
    userId,
    fileName: session.file_name,
    fileMimeType: session.file_mime_type,
    fileBuffer,
  });

  await sql.query(
    `
      delete from app_user_summary_upload_sessions
      where id::text = $1
        and user_id::text = $2
    `,
    [sessionId, userId],
  );

  return createdSummary;
}

export async function getSummaryDetail(userId: string, summaryId: string) {
  const summaryRow = await assertSummaryOwnership(userId, summaryId);
  const sql = getSql();

  const pageStateRows = (await sql.query(
    `
      select
        id::text,
        summary_id::text,
        user_id::text,
        page_number,
        note_text,
        reviewed,
        page_color,
        hide_regions,
        solution_boxes,
        drawings,
        created_at::text,
        updated_at::text
      from app_user_summary_page_states
      where summary_id::text = $1
        and user_id::text = $2
      order by page_number asc
    `,
    [summaryId, userId],
  )) as SummaryPageStateRow[];

  await sql.query(
    `
      update app_user_summaries
      set last_used_at = now(), updated_at = now()
      where id::text = $1
        and user_id::text = $2
    `,
    [summaryId, userId],
  );

  const noteCount = pageStateRows.filter((row) => row.note_text.trim().length > 0).length;
  const reviewedPages = pageStateRows.filter((row) => row.reviewed).length;

  return {
    ...mapSummaryRow({
      ...summaryRow,
      note_count: noteCount,
      reviewed_pages: reviewedPages,
    }),
    pageStates: pageStateRows.map((row) => sanitizePageState(row.page_number, row)),
  } satisfies SummaryDetail;
}

export async function deleteUserSummary(userId: string, summaryId: string) {
  const summaryRow = await assertSummaryOwnership(userId, summaryId);
  const sql = getSql();

  await sql.query(
    `
      delete from app_user_summaries
      where id::text = $1
        and user_id::text = $2
    `,
    [summaryId, userId],
  );

  return {
    id: summaryRow.id,
    fileName: summaryRow.file_name,
  };
}

export async function updateSummaryLastOpenedPage(
  userId: string,
  summaryId: string,
  lastOpenedPage: number,
) {
  const summaryRow = await assertSummaryOwnership(userId, summaryId);
  const nextPage = clamp(normalizeInteger(lastOpenedPage, 1), 1, Math.max(1, summaryRow.page_count));
  const sql = getSql();

  await sql.query(
    `
      update app_user_summaries
      set
        last_opened_page = $3,
        last_used_at = now(),
        updated_at = now()
      where id::text = $1
        and user_id::text = $2
    `,
    [summaryId, userId, nextPage],
  );

  return nextPage;
}

export async function getSummaryFilePayload(userId: string, summaryId: string) {
  await ensureSummaryTables();
  const sql = getSql();
  const rows = (await sql.query(
    `
      select
        file_name,
        file_mime_type,
        file_data_base64
      from app_user_summaries
      where id::text = $1
        and user_id::text = $2
      limit 1
    `,
    [summaryId, userId],
  )) as Array<{
    file_name: string;
    file_mime_type: string;
    file_data_base64: string;
  }>;

  const row = rows[0];
  if (!row) {
    throw new Error("تعذر العثور على الملف المطلوب داخل مكتبتك.");
  }

  await sql.query(
    `
      update app_user_summaries
      set last_used_at = now(), updated_at = now()
      where id::text = $1
        and user_id::text = $2
    `,
    [summaryId, userId],
  );

  return {
    fileName: row.file_name,
    fileMimeType: row.file_mime_type || "application/pdf",
    fileBuffer: Buffer.from(row.file_data_base64, "base64"),
  };
}

export async function getSummaryPageState(
  userId: string,
  summaryId: string,
  pageNumber: number,
) {
  const summaryRow = await assertSummaryOwnership(userId, summaryId);
  const normalizedPageNumber = clamp(normalizeInteger(pageNumber, 1), 1, Math.max(1, summaryRow.page_count));
  const sql = getSql();
  const rows = (await sql.query(
    `
      select
        id::text,
        summary_id::text,
        user_id::text,
        page_number,
        note_text,
        reviewed,
        page_color,
        hide_regions,
        solution_boxes,
        drawings,
        created_at::text,
        updated_at::text
      from app_user_summary_page_states
      where summary_id::text = $1
        and user_id::text = $2
        and page_number = $3
      limit 1
    `,
    [summaryId, userId, normalizedPageNumber],
  )) as SummaryPageStateRow[];

  return sanitizePageState(normalizedPageNumber, rows[0] ?? null);
}

export async function upsertSummaryPageState(
  userId: string,
  summaryId: string,
  pageNumber: number,
  input: SummaryPageStateInput,
) {
  const summaryRow = await assertSummaryOwnership(userId, summaryId);
  const normalizedPageNumber = clamp(normalizeInteger(pageNumber, 1), 1, Math.max(1, summaryRow.page_count));
  const sanitized = sanitizePageState(normalizedPageNumber, input);
  const sql = getSql();

  const rows = (await sql.query(
    `
      insert into app_user_summary_page_states (
        summary_id,
        user_id,
        page_number,
        note_text,
        reviewed,
        page_color,
        hide_regions,
        solution_boxes,
        drawings
      )
      values (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7::jsonb,
        $8::jsonb,
        $9::jsonb
      )
      on conflict (summary_id, page_number)
      do update set
        note_text = excluded.note_text,
        reviewed = excluded.reviewed,
        page_color = excluded.page_color,
        hide_regions = excluded.hide_regions,
        solution_boxes = excluded.solution_boxes,
        drawings = excluded.drawings,
        updated_at = now()
      returning
        id::text,
        summary_id::text,
        user_id::text,
        page_number,
        note_text,
        reviewed,
        page_color,
        hide_regions,
        solution_boxes,
        drawings,
        created_at::text,
        updated_at::text
    `,
    [
      summaryId,
      userId,
      normalizedPageNumber,
      sanitized.noteText,
      sanitized.reviewed,
      sanitized.pageColor,
      JSON.stringify(sanitized.hideRegions),
      JSON.stringify(sanitized.solutionBoxes),
      JSON.stringify(sanitized.drawings),
    ],
  )) as SummaryPageStateRow[];

  await sql.query(
    `
      update app_user_summaries
      set
        last_opened_page = $3,
        last_used_at = now(),
        updated_at = now()
      where id::text = $1
        and user_id::text = $2
    `,
    [summaryId, userId, normalizedPageNumber],
  );

  return sanitizePageState(normalizedPageNumber, rows[0] ?? null);
}
