import { createHash } from "node:crypto";

import { getSqlClient } from "@/lib/db";
import {
  generatePassageSlug,
  normalizeArabicText,
  parsePassageImportFile,
  planImportActions,
  searchPassagesLocal,
  type ExistingPassageFingerprint,
  type ImportFailedRow,
  type ValidatedVerbalPassage,
  type VerbalPassageImportInput,
  type VerbalPassageQuestionInput,
  type VerbalPassageStatus,
} from "@/lib/verbal-passages-core";

export type VerbalPassageQuestionRecord = {
  id: string;
  questionOrder: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: "A" | "B" | "C" | "D";
  explanation: string | null;
};

export type VerbalPassageRecord = {
  id: string;
  slug: string;
  title: string;
  keywords: string[];
  passageText: string;
  status: VerbalPassageStatus;
  version: number;
  externalSourceId: string | null;
  createdAt: string;
  updatedAt: string;
  questions: VerbalPassageQuestionRecord[];
};

export type VerbalPassageSummary = {
  id: string;
  slug: string;
  title: string;
  keywords: string[];
  status: VerbalPassageStatus;
  version: number;
  externalSourceId: string | null;
  questionCount: number;
  excerpt: string;
  createdAt: string;
  updatedAt: string;
};

export type PassageImportSummary = {
  importedCount: number;
  updatedCount: number;
  skippedCount: number;
  failedRows: ImportFailedRow[];
  previewItems: Array<{
    title: string;
    action: "insert" | "update" | "skip";
    questionCount: number;
    version: number;
    reason: string;
  }>;
};

type PassageDbRow = {
  id: string;
  slug: string;
  title: string;
  keywords: string[] | null;
  passage_text: string;
  status: VerbalPassageStatus;
  version: number;
  external_source_id: string | null;
  created_at: string;
  updated_at: string;
  normalized_title: string;
  normalized_passage_text: string;
};

type QuestionDbRow = {
  id: string;
  passage_id: string;
  question_order: number;
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: "A" | "B" | "C" | "D";
  explanation: string | null;
};

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function createExcerpt(text: string, maxLength = 220) {
  const cleanText = text.replace(/\s+/g, " ").trim();
  if (cleanText.length <= maxLength) return cleanText;
  return `${cleanText.slice(0, maxLength).trim()}...`;
}

function getSql() {
  return getSqlClient();
}

function mapQuestions(rows: QuestionDbRow[]) {
  return rows
    .sort((left, right) => left.question_order - right.question_order)
    .map((row) => ({
      id: row.id,
      questionOrder: row.question_order,
      questionText: row.question_text,
      optionA: row.option_a,
      optionB: row.option_b,
      optionC: row.option_c,
      optionD: row.option_d,
      correctOption: row.correct_option,
      explanation: row.explanation,
    }));
}

function mapPassageRecord(row: PassageDbRow, questionRows: QuestionDbRow[]): VerbalPassageRecord {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    keywords: row.keywords ?? [],
    passageText: row.passage_text,
    status: row.status,
    version: row.version,
    externalSourceId: row.external_source_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    questions: mapQuestions(questionRows),
  };
}

async function fetchQuestionsForPassages(passageIds: string[]) {
  if (!passageIds.length) return [] as QuestionDbRow[];
  const sql = getSql();
  return (await sql.query(
    `
      select
        id::text,
        passage_id::text,
        question_order,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
        explanation
      from app_verbal_passage_questions
      where passage_id = any($1::uuid[])
      order by passage_id, question_order asc
    `,
    [passageIds],
  )) as QuestionDbRow[];
}

async function resolveUniquePassageSlug(
  candidateSlug: string,
  options: { excludeId?: string | null; version?: number | null } = {},
) {
  const sql = getSql();
  const baseSlug = candidateSlug.trim() || "passage";
  const versionSuffix = options.version && options.version > 1 ? `-v${options.version}` : "";
  let nextSlug = `${baseSlug}${versionSuffix}`;
  let duplicateCounter = 2;

  while (true) {
    const rows = (await sql.query(
      `
        select id::text
        from app_verbal_passages
        where slug = $1
          and ($2::uuid is null or id <> $2::uuid)
        limit 1
      `,
      [nextSlug, options.excludeId ?? null],
    )) as Array<{ id: string }>;

    if (!rows[0]) {
      return nextSlug;
    }

    nextSlug = `${baseSlug}${versionSuffix ? `${versionSuffix}-${duplicateCounter}` : `-${duplicateCounter}`}`;
    duplicateCounter += 1;
  }
}

export async function listVerbalPassages(filters: {
  status?: VerbalPassageStatus | "all";
  search?: string;
  limit?: number;
} = {}) {
  const sql = getSql();
  const limit = Math.min(Math.max(Number(filters.limit ?? 50), 1), 200);
  const query = filters.search?.trim() ?? "";
  const normalizedQuery = normalizeArabicText(query);

  const rows = (await sql.query(
    `
      select
        id::text,
        slug,
        title,
        keywords,
        passage_text,
        status,
        version,
        external_source_id,
        created_at::text,
        updated_at::text,
        normalized_title,
        normalized_passage_text
      from app_verbal_passages
      where ($1::text = 'all' or status = $1::app_publish_status)
        and (
          $2::text = ''
          or normalized_title like $3
          or keyword_search like $3
        )
      order by updated_at desc
      limit $4
    `,
    [filters.status ?? "all", normalizedQuery, `%${normalizedQuery}%`, limit],
  )) as PassageDbRow[];

  const questionRows = await fetchQuestionsForPassages(rows.map((row) => row.id));

  return rows.map((row) =>
    mapPassageRecord(
      row,
      questionRows.filter((question) => question.passage_id === row.id),
    ),
  );
}

export async function getVerbalPassageById(id: string) {
  const sql = getSql();
  const rows = (await sql.query(
    `
      select
        id::text,
        slug,
        title,
        keywords,
        passage_text,
        status,
        version,
        external_source_id,
        created_at::text,
        updated_at::text,
        normalized_title,
        normalized_passage_text
      from app_verbal_passages
      where id = $1::uuid
      limit 1
    `,
    [id],
  )) as PassageDbRow[];

  const row = rows[0];
  if (!row) return null;

  const questionRows = await fetchQuestionsForPassages([id]);
  return mapPassageRecord(row, questionRows);
}

export async function getVerbalPassageBySlug(slug: string, options: { includeDraft?: boolean } = {}) {
  const normalizedSlug = slug.trim().toLowerCase();
  if (!normalizedSlug) return null;

  const sql = getSql();
  const rows = (await sql.query(
    `
      select
        id::text,
        slug,
        title,
        keywords,
        passage_text,
        status,
        version,
        external_source_id,
        created_at::text,
        updated_at::text,
        normalized_title,
        normalized_passage_text
      from app_verbal_passages
      where slug = $1
        and ($2::boolean = true or status = 'published')
      limit 1
    `,
    [normalizedSlug, options.includeDraft ?? false],
  )) as PassageDbRow[];

  const row = rows[0];
  if (!row) return null;

  const questionRows = await fetchQuestionsForPassages([row.id]);
  return mapPassageRecord(row, questionRows);
}

export async function searchPassages(query: string, options: { limit?: number; includeDraft?: boolean } = {}) {
  const normalizedQuery = normalizeArabicText(query).replace(/\s+/g, "");
  const minChars = 3;

  if (normalizedQuery.length < minChars) {
    return [] as VerbalPassageSummary[];
  }

  const sql = getSql();
  const limit = Math.min(Math.max(Number(options.limit ?? 24), 1), 100);
  const rows = (await sql.query(
    `
      select
        id::text,
        slug,
        title,
        keywords,
        passage_text,
        status,
        version,
        external_source_id,
        created_at::text,
        updated_at::text,
        normalized_title,
        normalized_passage_text
      from app_verbal_passages
      where ($1::boolean = true or status = 'published')
        and (
          normalized_title like $2
          or keyword_search like $2
        )
      limit $3
    `,
    [options.includeDraft ?? false, `%${normalizedQuery}%`, Math.max(limit * 3, limit)],
  )) as PassageDbRow[];

  const ranked = searchPassagesLocal(
    rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      title: row.title,
      keywords: row.keywords ?? [],
      passageText: row.passage_text,
      status: row.status,
      questions: [],
    })),
    query,
  ).slice(0, limit);

  const rankedIdOrder = new Map(ranked.map((item, index) => [item.id, index]));

  return rows
    .filter((row) => rankedIdOrder.has(row.id))
    .sort((left, right) => (rankedIdOrder.get(left.id) ?? 0) - (rankedIdOrder.get(right.id) ?? 0))
    .map((row) => ({
      id: row.id,
      title: row.title,
      keywords: row.keywords ?? [],
      status: row.status,
      version: row.version,
      externalSourceId: row.external_source_id,
      questionCount: 0,
      excerpt: createExcerpt(row.passage_text),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
}

async function fetchExistingFingerprints(normalizedTitles: string[]) {
  if (!normalizedTitles.length) return [] as ExistingPassageFingerprint[];

  const sql = getSql();
  const passageRows = (await sql.query(
    `
      select
        id::text,
        slug,
        title,
        keywords,
        passage_text,
        status,
        version,
        external_source_id,
        created_at::text,
        updated_at::text,
        normalized_title,
        normalized_passage_text
      from app_verbal_passages
      where normalized_title = any($1::text[])
    `,
    [normalizedTitles],
  )) as PassageDbRow[];

  const questionRows = await fetchQuestionsForPassages(passageRows.map((row) => row.id));

  return passageRows.map((row) => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    keywords: row.keywords ?? [],
    passageText: row.passage_text,
    status: row.status,
    version: row.version,
    externalSourceId: row.external_source_id,
    questions: mapQuestions(questionRows.filter((question) => question.passage_id === row.id)).map((question) => ({
      questionText: question.questionText,
      optionA: question.optionA,
      optionB: question.optionB,
      optionC: question.optionC,
      optionD: question.optionD,
      correctOption: question.correctOption,
      explanation: question.explanation,
    })),
  }));
}

async function replacePassageQuestions(passageId: string, questions: VerbalPassageQuestionInput[]) {
  const sql = getSql();
  await sql.query(`delete from app_verbal_passage_questions where passage_id = $1::uuid`, [passageId]);

  for (const [index, question] of questions.entries()) {
    await sql.query(
      `
        insert into app_verbal_passage_questions (
          passage_id,
          question_order,
          question_text,
          option_a,
          option_b,
          option_c,
          option_d,
          correct_option,
          explanation
        )
        values ($1::uuid, $2, $3, $4, $5, $6, $7, $8, $9)
      `,
      [
        passageId,
        index + 1,
        question.questionText,
        question.optionA,
        question.optionB,
        question.optionC,
        question.optionD,
        question.correctOption,
        question.explanation ?? null,
      ],
    );
  }
}

async function savePassageRecord(record: ValidatedVerbalPassage, existingId?: string) {
  const sql = getSql();
  const titleHash = sha256(record.normalizedTitle);
  const passageHash = sha256(record.normalizedPassageText);
  const uniqueSlug = await resolveUniquePassageSlug(
    generatePassageSlug({
      slug: record.slug,
      title: record.title,
      externalSourceId: record.externalSourceId,
      version: record.version,
    }),
    { excludeId: existingId ?? null, version: record.version },
  );

  if (existingId) {
    const rows = (await sql.query(
      `
        update app_verbal_passages
        set
          slug = $2,
          title = $3,
          normalized_title = $4,
          keywords = $5::text[],
          keyword_search = $6,
          passage_text = $7,
          normalized_passage_text = $8,
          title_hash = $9,
          passage_hash = $10,
          status = $11::app_publish_status,
          external_source_id = $12,
          version = $13
        where id = $1::uuid
        returning id::text
      `,
      [
        existingId,
        uniqueSlug,
        record.title,
        record.normalizedTitle,
        record.keywords,
        record.keywordSearch,
        record.passageText,
        record.normalizedPassageText,
        titleHash,
        passageHash,
        record.status,
        record.externalSourceId ?? null,
        record.version ?? 1,
      ],
    )) as Array<{ id: string }>;

    const savedId = rows[0]?.id;
    if (!savedId) {
      throw new Error(`تعذر تحديث القطعة: ${record.title}`);
    }

    await replacePassageQuestions(savedId, record.questions);
    return savedId;
  }

  const rows = (await sql.query(
    `
      insert into app_verbal_passages (
        slug,
        title,
        normalized_title,
        keywords,
        keyword_search,
        passage_text,
        normalized_passage_text,
        title_hash,
        passage_hash,
        status,
        external_source_id,
        version
      )
      values ($1, $2, $3, $4::text[], $5, $6, $7, $8, $9, $10::app_publish_status, $11, $12)
      on conflict (title_hash, passage_hash)
      do update set
        slug = excluded.slug,
        keywords = excluded.keywords,
        keyword_search = excluded.keyword_search,
        status = excluded.status,
        external_source_id = excluded.external_source_id,
        version = excluded.version
      returning id::text
    `,
    [
      uniqueSlug,
      record.title,
      record.normalizedTitle,
      record.keywords,
      record.keywordSearch,
      record.passageText,
      record.normalizedPassageText,
      titleHash,
      passageHash,
      record.status,
      record.externalSourceId ?? null,
      record.version ?? 1,
    ],
  )) as Array<{ id: string }>;

  const savedId = rows[0]?.id;
  if (!savedId) {
    throw new Error(`تعذر حفظ القطعة: ${record.title}`);
  }

  await replacePassageQuestions(savedId, record.questions);
  return savedId;
}

export async function createVerbalPassage(input: VerbalPassageImportInput) {
  const action = planImportActions([], [input])[0];
  const id = await savePassageRecord(action.record);
  return getVerbalPassageById(id);
}

export async function updateVerbalPassage(id: string, input: VerbalPassageImportInput) {
  const existing = await getVerbalPassageById(id);
  if (!existing) {
    throw new Error("القطعة المطلوبة غير موجودة.");
  }

  const action = planImportActions(
    [
      {
        id: existing.id,
        slug: existing.slug,
        title: existing.title,
        keywords: existing.keywords,
        passageText: existing.passageText,
        status: existing.status,
        version: existing.version,
        externalSourceId: existing.externalSourceId,
        questions: existing.questions.map((question) => ({
          questionText: question.questionText,
          optionA: question.optionA,
          optionB: question.optionB,
          optionC: question.optionC,
          optionD: question.optionD,
          correctOption: question.correctOption,
          explanation: question.explanation,
        })),
      },
    ],
    [input],
  )[0];

  const savedId = await savePassageRecord(action.record, id);
  return getVerbalPassageById(savedId);
}

export async function deleteVerbalPassage(id: string) {
  const sql = getSql();
  await sql.query(`delete from app_verbal_passages where id = $1::uuid`, [id]);
  return { ok: true };
}

export async function importPassages(fileName: string, content: string, options: { preview?: boolean } = {}) {
  const parsed = parsePassageImportFile(fileName, content);

  if (!parsed.records.length) {
    return {
      importedCount: 0,
      updatedCount: 0,
      skippedCount: 0,
      failedRows: parsed.failedRows,
      previewItems: [],
    } satisfies PassageImportSummary;
  }

  const normalizedTitles = Array.from(
    new Set(parsed.records.map((record) => normalizeArabicText(record.title)).filter(Boolean)),
  );
  const existing = await fetchExistingFingerprints(normalizedTitles);
  const actions = planImportActions(existing, parsed.records);

  const summary: PassageImportSummary = {
    importedCount: 0,
    updatedCount: 0,
    skippedCount: 0,
    failedRows: parsed.failedRows,
    previewItems: actions.map((action) => ({
      title: action.record.title,
      action: action.action,
      questionCount: action.record.questions.length,
      version: action.version,
      reason: action.reason,
    })),
  };

  if (options.preview) {
    summary.importedCount = actions.filter((action) => action.action === "insert").length;
    summary.updatedCount = actions.filter((action) => action.action === "update").length;
    summary.skippedCount = actions.filter((action) => action.action === "skip").length;
    return summary;
  }

  for (const action of actions) {
    try {
      if (action.action === "skip") {
        summary.skippedCount += 1;
        continue;
      }

      const savedId = await savePassageRecord(action.record, action.targetId);
      if (!savedId) {
        throw new Error(`تعذر حفظ القطعة: ${action.record.title}`);
      }

      if (action.action === "insert") {
        summary.importedCount += 1;
      } else {
        summary.updatedCount += 1;
      }
    } catch (error) {
      summary.failedRows.push({
        row: action.record.title,
        title: action.record.title,
        reason: error instanceof Error ? error.message : "فشل غير متوقع أثناء الاستيراد.",
      });
    }
  }

  return summary;
}
