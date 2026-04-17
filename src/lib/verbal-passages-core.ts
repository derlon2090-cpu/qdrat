export type VerbalPassageStatus = "draft" | "published";
export type VerbalQuestionOptionKey = "A" | "B" | "C" | "D";

export type VerbalPassageQuestionInput = {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: VerbalQuestionOptionKey;
  explanation?: string | null;
};

export type VerbalPassageImportInput = {
  title: string;
  keywords: string[];
  passageText: string;
  questions: VerbalPassageQuestionInput[];
  status: VerbalPassageStatus;
  externalSourceId?: string | null;
  version?: number | null;
};

export type ValidatedVerbalPassage = VerbalPassageImportInput & {
  normalizedTitle: string;
  normalizedPassageText: string;
  normalizedKeywords: string[];
  keywordSearch: string;
  exactSignature: string;
  payloadSignature: string;
};

export type ImportFailedRow = {
  row: number | string;
  title?: string;
  reason: string;
};

export type ParsedImportResult = {
  records: VerbalPassageImportInput[];
  failedRows: ImportFailedRow[];
};

export type ExistingPassageFingerprint = {
  id: string;
  title: string;
  keywords: string[];
  passageText: string;
  status: VerbalPassageStatus;
  version: number;
  externalSourceId?: string | null;
  questions: VerbalPassageQuestionInput[];
};

export type ImportAction = {
  action: "insert" | "update" | "skip";
  reason: string;
  targetId?: string;
  version: number;
  record: ValidatedVerbalPassage;
};

export type SearchableVerbalPassage = {
  id: string;
  title: string;
  keywords: string[];
  passageText: string;
  status: VerbalPassageStatus;
  questions: Array<{ questionText: string }>;
};

export type VerbalPassageSearchResult = SearchableVerbalPassage & {
  score: number;
};

const HARAKAT_PATTERN = /[\u064b-\u065f\u0670]/g;
const NON_ARABIC_SEARCH_PATTERN = /[^\p{L}\p{N}\s]/gu;

function toTrimmedString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export function normalizeArabicText(value: string) {
  return value
    .toLowerCase()
    .replace(HARAKAT_PATTERN, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ؤ/g, "و")
    .replace(/ئ/g, "ي")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(NON_ARABIC_SEARCH_PATTERN, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function splitKeywords(value: string) {
  return value
    .split(/[\n,،;؛|/\\]+/g)
    .map((item) => item.trim())
    .filter(Boolean);
}

export function generatePassageKeywords(title: string, keywords: string[] = []) {
  const baseKeywords = [title, title.replace(/^قطعة\s+/u, "").trim(), ...keywords];
  const expanded = baseKeywords.flatMap((keyword) => splitKeywords(keyword));
  const unique = new Map<string, string>();

  for (const keyword of expanded) {
    const normalized = normalizeArabicText(keyword);
    if (!normalized) continue;
    if (!unique.has(normalized)) {
      unique.set(normalized, keyword.trim());
    }
  }

  return Array.from(unique.values());
}

export function normalizeOptionKey(value: unknown): VerbalQuestionOptionKey | null {
  const raw = toTrimmedString(value).toUpperCase();

  if (raw === "A" || raw === "أ") return "A";
  if (raw === "B" || raw === "ب") return "B";
  if (raw === "C" || raw === "ج") return "C";
  if (raw === "D" || raw === "د") return "D";

  return null;
}

function normalizeQuestion(rawQuestion: unknown, rowLabel: number | string) {
  const question = rawQuestion as Record<string, unknown>;
  const questionText = toTrimmedString(question.question_text ?? question.questionText ?? question.text);
  const optionA = toTrimmedString(question.option_a ?? question.optionA);
  const optionB = toTrimmedString(question.option_b ?? question.optionB);
  const optionC = toTrimmedString(question.option_c ?? question.optionC);
  const optionD = toTrimmedString(question.option_d ?? question.optionD);
  const correctOption = normalizeOptionKey(question.correct_option ?? question.correctOption);
  const explanation = toTrimmedString(question.explanation);

  if (!questionText) {
    throw new Error(`السؤال في السطر ${rowLabel} لا يحتوي على question_text.`);
  }

  if (![optionA, optionB, optionC, optionD].every(Boolean)) {
    throw new Error(`السؤال "${questionText}" يجب أن يحتوي على الخيارات A وB وC وD كاملة.`);
  }

  if (!correctOption) {
    throw new Error(`السؤال "${questionText}" يحتوي على correct_option غير صالح.`);
  }

  return {
    questionText,
    optionA,
    optionB,
    optionC,
    optionD,
    correctOption,
    explanation: explanation || null,
  } satisfies VerbalPassageQuestionInput;
}

export function validatePassageRecord(rawRecord: unknown, rowLabel: number | string) {
  const record = rawRecord as Record<string, unknown>;
  const title = toTrimmedString(record.title);
  const passageText = toTrimmedString(record.passage_text ?? record.passageText);
  const status = toTrimmedString(record.status).toLowerCase() === "published" ? "published" : "draft";
  const externalSourceId = toTrimmedString(record.external_source_id ?? record.externalSourceId) || null;
  const versionValue = Number(record.version);
  const version = Number.isFinite(versionValue) && versionValue > 0 ? Math.trunc(versionValue) : null;

  const incomingKeywords = Array.isArray(record.keywords)
    ? record.keywords.map((item) => toTrimmedString(item)).filter(Boolean)
    : splitKeywords(toTrimmedString(record.keywords));

  const questionsRaw = Array.isArray(record.questions) ? record.questions : [];

  if (!title) {
    throw new Error(`السطر ${rowLabel} لا يحتوي على title.`);
  }

  if (!passageText) {
    throw new Error(`القطعة "${title}" لا تحتوي على passage_text.`);
  }

  if (!questionsRaw.length) {
    throw new Error(`القطعة "${title}" لا تحتوي على أسئلة.`);
  }

  const questions = questionsRaw.map((question, index) => normalizeQuestion(question, `${rowLabel}.${index + 1}`));
  const generatedKeywords = generatePassageKeywords(title, incomingKeywords);

  if (!generatedKeywords.length) {
    throw new Error(`القطعة "${title}" لا تحتوي على كلمات مفتاحية صالحة.`);
  }

  const normalizedTitle = normalizeArabicText(title);
  const normalizedPassageText = normalizeArabicText(passageText);
  const normalizedKeywords = generatedKeywords.map((keyword) => normalizeArabicText(keyword));
  const keywordSearch = Array.from(new Set(normalizedKeywords)).join(" ");
  const exactSignature = `${normalizedTitle}::${normalizedPassageText}`;
  const payloadSignature = JSON.stringify({
    title: normalizedTitle,
    passageText: normalizedPassageText,
    keywords: Array.from(new Set(normalizedKeywords)).sort(),
    status,
    externalSourceId: externalSourceId ?? null,
    questions: questions.map((question) => ({
      questionText: normalizeArabicText(question.questionText),
      optionA: normalizeArabicText(question.optionA),
      optionB: normalizeArabicText(question.optionB),
      optionC: normalizeArabicText(question.optionC),
      optionD: normalizeArabicText(question.optionD),
      correctOption: question.correctOption,
      explanation: normalizeArabicText(question.explanation ?? ""),
    })),
  });

  return {
    title,
    keywords: generatedKeywords,
    passageText,
    questions,
    status,
    externalSourceId,
    version,
    normalizedTitle,
    normalizedPassageText,
    normalizedKeywords,
    keywordSearch,
    exactSignature,
    payloadSignature,
  } satisfies ValidatedVerbalPassage;
}

function parseCsvRows(content: string) {
  const rows: string[][] = [];
  let currentCell = "";
  let currentRow: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const next = content[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        currentCell += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (!inQuotes && char === ",") {
      currentRow.push(currentCell);
      currentCell = "";
      continue;
    }

    if (!inQuotes && (char === "\n" || char === "\r")) {
      if (char === "\r" && next === "\n") {
        index += 1;
      }

      currentRow.push(currentCell);
      currentCell = "";

      if (currentRow.some((cell) => cell.trim().length > 0)) {
        rows.push(currentRow);
      }

      currentRow = [];
      continue;
    }

    currentCell += char;
  }

  currentRow.push(currentCell);
  if (currentRow.some((cell) => cell.trim().length > 0)) {
    rows.push(currentRow);
  }

  return rows;
}

function normalizeCsvHeader(header: string) {
  return header.trim().toLowerCase();
}

function parseCsvImport(content: string) {
  const rows = parseCsvRows(content);

  if (!rows.length) {
    return { records: [], failedRows: [{ row: "csv", reason: "الملف CSV فارغ." }] } satisfies ParsedImportResult;
  }

  const headers = rows[0].map(normalizeCsvHeader);
  const grouped = new Map<string, Record<string, unknown>>();
  const failedRows: ImportFailedRow[] = [];

  rows.slice(1).forEach((row, rowIndex) => {
    const currentRowNumber = rowIndex + 2;
    const data: Record<string, string> = {};

    headers.forEach((header, index) => {
      data[header] = row[index]?.trim() ?? "";
    });

    const title = data.title;
    const passageText = data.passage_text ?? data.passagetext ?? data.passage;
    const questionText = data.question_text ?? data.questiontext;

    if (!title || !passageText || !questionText) {
      failedRows.push({
        row: currentRowNumber,
        title: title || undefined,
        reason: "صف CSV ناقص: title أو passage_text أو question_text غير موجود.",
      });
      return;
    }

    const groupKey = [
      normalizeArabicText(title),
      normalizeArabicText(passageText),
      data.external_source_id ?? "",
      data.version ?? "",
    ].join("::");

    if (!grouped.has(groupKey)) {
      grouped.set(groupKey, {
        title,
        keywords: splitKeywords(data.keywords ?? ""),
        passage_text: passageText,
        external_source_id: data.external_source_id || null,
        version: data.version ? Number(data.version) : null,
        status: data.status || "draft",
        questions: [],
      });
    }

    const group = grouped.get(groupKey) as Record<string, unknown>;
    (group.questions as unknown[]).push({
      question_text: questionText,
      option_a: data.option_a,
      option_b: data.option_b,
      option_c: data.option_c,
      option_d: data.option_d,
      correct_option: data.correct_option,
      explanation: data.explanation || null,
    });
  });

  const records: VerbalPassageImportInput[] = [];

  for (const [index, rawRecord] of Array.from(grouped.values()).entries()) {
    try {
      const validated = validatePassageRecord(rawRecord, `csv-${index + 1}`);
      records.push({
        title: validated.title,
        keywords: validated.keywords,
        passageText: validated.passageText,
        questions: validated.questions,
        status: validated.status,
        externalSourceId: validated.externalSourceId,
        version: validated.version,
      });
    } catch (error) {
      failedRows.push({
        row: `csv-${index + 1}`,
        title: toTrimmedString((rawRecord as Record<string, unknown>).title) || undefined,
        reason: error instanceof Error ? error.message : "تعذر التحقق من سجل CSV.",
      });
    }
  }

  return { records, failedRows } satisfies ParsedImportResult;
}

function parseJsonImport(content: string) {
  let parsed: unknown;

  try {
    parsed = JSON.parse(content);
  } catch (error) {
    return {
      records: [],
      failedRows: [{ row: "json", reason: error instanceof Error ? error.message : "تعذر قراءة JSON." }],
    } satisfies ParsedImportResult;
  }

  const rawRecords = Array.isArray(parsed)
    ? parsed
    : Array.isArray((parsed as { passages?: unknown[] })?.passages)
      ? ((parsed as { passages: unknown[] }).passages ?? [])
      : [];

  if (!rawRecords.length) {
    return {
      records: [],
      failedRows: [{ row: "json", reason: "ملف JSON لا يحتوي على مصفوفة passages صالحة." }],
    } satisfies ParsedImportResult;
  }

  const records: VerbalPassageImportInput[] = [];
  const failedRows: ImportFailedRow[] = [];

  rawRecords.forEach((record, index) => {
    try {
      const validated = validatePassageRecord(record, index + 1);
      records.push({
        title: validated.title,
        keywords: validated.keywords,
        passageText: validated.passageText,
        questions: validated.questions,
        status: validated.status,
        externalSourceId: validated.externalSourceId,
        version: validated.version,
      });
    } catch (error) {
      failedRows.push({
        row: index + 1,
        title: toTrimmedString((record as Record<string, unknown>)?.title) || undefined,
        reason: error instanceof Error ? error.message : "تعذر التحقق من سجل JSON.",
      });
    }
  });

  return { records, failedRows } satisfies ParsedImportResult;
}

export function parsePassageImportFile(fileName: string, content: string) {
  const trimmed = content.trim();
  const lowerFileName = fileName.toLowerCase();

  if (lowerFileName.endsWith(".json") || trimmed.startsWith("[") || trimmed.startsWith("{")) {
    return parseJsonImport(content);
  }

  return parseCsvImport(content);
}

export function planImportActions(
  existingPassages: ExistingPassageFingerprint[],
  incomingRecords: VerbalPassageImportInput[],
) {
  const existingValidated = existingPassages.map((record, index) => ({
    id: record.id,
    ...validatePassageRecord(
      {
        title: record.title,
        keywords: record.keywords,
        passage_text: record.passageText,
        questions: record.questions.map((question) => ({
          question_text: question.questionText,
          option_a: question.optionA,
          option_b: question.optionB,
          option_c: question.optionC,
          option_d: question.optionD,
          correct_option: question.correctOption,
          explanation: question.explanation,
        })),
        status: record.status,
        external_source_id: record.externalSourceId ?? null,
        version: record.version,
      },
      `existing-${index + 1}`,
    ),
  }));

  const exactMap = new Map(existingValidated.map((record) => [record.exactSignature, record]));
  const versionMap = new Map<string, number>();

  existingValidated.forEach((record) => {
    const currentVersion = versionMap.get(record.normalizedTitle) ?? 0;
    versionMap.set(record.normalizedTitle, Math.max(currentVersion, record.version ?? 1));
  });

  return incomingRecords.map((record, index) => {
    const validated = validatePassageRecord(
      {
        title: record.title,
        keywords: record.keywords,
        passage_text: record.passageText,
        questions: record.questions.map((question) => ({
          question_text: question.questionText,
          option_a: question.optionA,
          option_b: question.optionB,
          option_c: question.optionC,
          option_d: question.optionD,
          correct_option: question.correctOption,
          explanation: question.explanation,
        })),
        status: record.status,
        external_source_id: record.externalSourceId ?? null,
        version: record.version,
      },
      `plan-${index + 1}`,
    );

    const exactMatch = exactMap.get(validated.exactSignature);

    if (exactMatch) {
      if (exactMatch.payloadSignature === validated.payloadSignature) {
        return {
          action: "skip",
          reason: "القطعة موجودة مسبقًا بنفس العنوان والنص والبيانات.",
          targetId: exactMatch.id,
          version: exactMatch.version ?? validated.version ?? 1,
          record: { ...validated, version: exactMatch.version ?? validated.version ?? 1 },
        } satisfies ImportAction;
      }

      return {
        action: "update",
        reason: "تم العثور على نفس العنوان والنص، وسيتم تحديث البيانات المرتبطة به.",
        targetId: exactMatch.id,
        version: exactMatch.version ?? validated.version ?? 1,
        record: { ...validated, version: exactMatch.version ?? validated.version ?? 1 },
      } satisfies ImportAction;
    }

    const nextVersion = validated.version ?? (versionMap.get(validated.normalizedTitle) ?? 0) + 1;
    versionMap.set(validated.normalizedTitle, nextVersion);

    return {
      action: "insert",
      reason:
        nextVersion > 1
          ? "تم إنشاء نسخة جديدة لأن العنوان نفسه موجود مسبقًا لكن النص مختلف."
          : "سيتم إنشاء قطعة جديدة.",
      version: nextVersion,
      record: { ...validated, version: nextVersion },
    } satisfies ImportAction;
  });
}

function getSearchScore(passage: SearchableVerbalPassage, query: string) {
  const normalizedQuery = normalizeArabicText(query);
  if (!normalizedQuery || normalizedQuery.length < 3) return 0;

  const normalizedTitle = normalizeArabicText(passage.title);
  const normalizedKeywords = passage.keywords.map((keyword) => normalizeArabicText(keyword));

  if (normalizedTitle === normalizedQuery) return 100;
  if (normalizedKeywords.includes(normalizedQuery)) return 95;
  if (normalizedTitle.startsWith(normalizedQuery)) return 88;
  if (normalizedKeywords.some((keyword) => keyword.startsWith(normalizedQuery))) return 82;
  if (normalizedTitle.includes(normalizedQuery)) return 76;
  if (normalizedKeywords.some((keyword) => keyword.includes(normalizedQuery))) return 70;
  return 0;
}

export function searchPassagesLocal(passages: SearchableVerbalPassage[], query: string, minChars = 3) {
  const normalizedQuery = normalizeArabicText(query).replace(/\s+/g, "");

  if (!normalizedQuery || normalizedQuery.length < minChars) {
    return [] as VerbalPassageSearchResult[];
  }

  return passages
    .map((passage) => ({
      ...passage,
      score: getSearchScore(passage, query),
    }))
    .filter((passage) => passage.score > 0)
    .sort((left, right) => right.score - left.score || left.title.localeCompare(right.title, "ar"));
}
