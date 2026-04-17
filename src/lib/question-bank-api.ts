import { neon } from "@neondatabase/serverless";

import { banks as fallbackBanks, questionSearchItems as fallbackQuestions } from "@/data/miyaar";
import {
  getDocumentReadingPassageById,
  getDocumentReadingPassages,
  READING_DOCUMENT_SOURCE_FILE,
} from "@/data/verbal-reading-document";

export type BankItem = (typeof fallbackBanks)[number];

export type SearchItem = {
  id: number;
  text: string;
  section: string;
  type: string;
  difficulty: string;
  skill: string;
  state: string;
  href: string;
  kind?: "question" | "passage";
  title?: string;
  excerpt?: string;
  pieceNumber?: number | null;
  questionCount?: number;
  needsReview?: boolean;
};

export type PassageChoice = {
  id: number;
  key: string;
  text: string;
  isCorrect: boolean;
  sortOrder: number;
};

export type PassageQuestion = {
  id: number;
  order: number;
  text: string;
  explanation: string | null;
  correctChoiceKey: string | null;
  answerSource: string | null;
  answerConfidence: number;
  needsReview: boolean;
  choices: PassageChoice[];
};

export type PassageDetail = {
  id: number;
  pieceNumber: number | null;
  title: string;
  text: string;
  difficulty: string;
  sourceName: string | null;
  rawPageFrom: number | null;
  rawPageTo: number | null;
  parsingConfidence: number;
  needsReview: boolean;
  questions: PassageQuestion[];
};

export type ReadingPassageSummary = {
  id: number;
  title: string;
  sourceName: string | null;
  pieceNumber: number | null;
  questionCount: number;
  href: string;
};

type SearchFilters = {
  query?: string;
  section?: string;
  type?: string;
  difficulty?: string;
  skill?: string;
  state?: string;
  limit?: number;
};

const READING_DOCUMENT_LABEL = "المستند / القطع اللفظية";

function getDatabaseUrl() {
  return process.env.DATABASE_URL?.trim();
}

function normalizeArabic(value: string) {
  return value
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[ً-ْ]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function fuzzyMatch(text: string, query: string) {
  const normalizedText = normalizeArabic(text);
  const normalizedQuery = normalizeArabic(query);

  if (!normalizedQuery) return true;
  if (normalizedText.includes(normalizedQuery)) return true;

  let pointer = 0;
  for (const character of normalizedText) {
    if (character === normalizedQuery[pointer]) pointer += 1;
    if (pointer === normalizedQuery.length) return true;
  }

  return false;
}

function createSnippet(text: string, query: string, maxLength = 170) {
  const cleanText = text.replace(/\s+/g, " ").trim();
  if (!cleanText) return "";

  if (!query.trim()) {
    return cleanText.length > maxLength ? `${cleanText.slice(0, maxLength).trim()}...` : cleanText;
  }

  const normalizedText = normalizeArabic(cleanText);
  const normalizedQuery = normalizeArabic(query);
  const matchIndex = normalizedText.indexOf(normalizedQuery);

  if (matchIndex === -1) {
    return cleanText.length > maxLength ? `${cleanText.slice(0, maxLength).trim()}...` : cleanText;
  }

  const start = Math.max(matchIndex - 36, 0);
  const end = Math.min(matchIndex + normalizedQuery.length + 90, cleanText.length);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < cleanText.length ? "..." : "";

  return `${prefix}${cleanText.slice(start, end).trim()}${suffix}`;
}

function mapDifficulty(value?: string | null) {
  switch (value) {
    case "easy":
      return "سهل";
    case "hard":
    case "elite":
      return "متقدم";
    case "medium":
    default:
      return "متوسط";
  }
}

function resolvePassageTitle(pieceTitle?: string | null, title?: string | null, pieceNumber?: number | null, id?: number) {
  if (pieceTitle?.trim()) return pieceTitle.trim();
  if (title?.trim()) return title.trim();
  if (pieceNumber) return `قطعة ${pieceNumber}`;
  return `قطعة ${id ?? ""}`.trim();
}

function mapBankType(section?: string | null, kind?: string | null) {
  if (kind === "passage_bank") return "قطع";
  if (section === "quantitative") return "كمي";
  return "لفظي";
}

function mapQuestionSection(section?: string | null, kind?: string | null) {
  if (kind === "passage_bank") return "قطع";
  if (section === "quantitative") return "كمي";
  return "لفظي";
}

function mapQuestionType(type?: string | null, kind?: string | null) {
  if (kind === "passage_bank") return "قطع";

  switch (type) {
    case "analogy":
      return "تناظر";
    case "sentence_completion":
      return "إكمال";
    case "contextual_error":
      return "الخطأ السياقي";
    case "odd_word":
      return "المفردة الشاذة";
    case "reading_passage":
      return "قطع";
    case "quantitative_problem":
      return "أساسيات";
    default:
      return "تدريب";
  }
}

function mapBankTag(title: string) {
  if (title.includes("تناظر")) return "إدراك العلاقة";
  if (title.includes("إكمال")) return "السياق";
  if (title.includes("الخطأ")) return "تحليل المعنى";
  if (title.includes("قطعة") || title.includes("القطع")) return "الفكرة العامة";
  if (title.includes("كمي")) return "تدريب أساسي";
  return "تدريب مباشر";
}

async function buildFallbackPassageDetail(passageId: number): Promise<PassageDetail | null> {
  const passage = await getDocumentReadingPassageById(passageId);
  if (!passage) return null;

  return {
    id: passage.id,
    pieceNumber: passage.pieceNumber,
    title: passage.title,
    text: passage.passage,
    difficulty: mapDifficulty(passage.difficulty),
    sourceName: passage.source || READING_DOCUMENT_LABEL,
    rawPageFrom: passage.rawPageFrom,
    rawPageTo: passage.rawPageTo,
    parsingConfidence: passage.parsingConfidence,
    needsReview: passage.needsReview,
    questions: passage.questions.map((question, questionIndex) => ({
      id: Number(`${passage.id}${questionIndex + 1}`),
      order: question.order,
      text: question.text,
      explanation: question.explanation,
      correctChoiceKey: question.correctChoiceKey,
      answerSource: question.answerSource,
      answerConfidence: question.answerConfidence,
      needsReview: question.needsReview,
      choices: question.choices.map((choice, choiceIndex) => ({
        id: Number(`${passage.id}${questionIndex + 1}${choiceIndex + 1}`),
        key: choice.key,
        text: choice.text,
        isCorrect: choice.isCorrect,
        sortOrder: choice.sortOrder,
      })),
    })),
  };
}

async function getFallbackReadingPassageSummaries(): Promise<ReadingPassageSummary[]> {
  const passages = await getDocumentReadingPassages();

  return passages
    .filter((passage) => passage.questions.length > 0)
    .map((passage) => ({
      id: passage.id,
      title: passage.title,
      sourceName: passage.source || READING_DOCUMENT_LABEL,
      pieceNumber: passage.pieceNumber,
      questionCount: passage.questions.length,
      href: `/exam?section=verbal_reading&passageId=${passage.id}`,
    }));
}

async function getFallbackReadingQuestionItems(): Promise<SearchItem[]> {
  const passages = await getDocumentReadingPassages();

  return passages.flatMap((passage) =>
    passage.questions.map((question) => ({
      id: Number(`${passage.id}${question.order}`),
      text: question.text,
      title: question.text,
      excerpt: createSnippet(passage.passage, question.text),
      section: "قطع",
      type: "قطع",
      difficulty: mapDifficulty(passage.difficulty),
      skill: passage.title,
      state: question.needsReview ? "قيد المراجعة" : "جاهزة",
      href: `/exam?section=verbal_reading&passageId=${passage.id}&question=${Math.max(question.order - 1, 0)}`,
      kind: "question",
      pieceNumber: passage.pieceNumber,
      needsReview: question.needsReview,
    })),
  );
}

async function searchFallbackPassages(query: string, limit: number): Promise<SearchItem[]> {
  const trimmedQuery = query.trim();
  if (!trimmedQuery) return [];

  const passages = await getDocumentReadingPassages();

  return passages
    .filter((passage) =>
      fuzzyMatch(
        [
          passage.title,
          passage.passage,
          passage.questions.map((question) => question.text).join(" "),
        ].join(" "),
        trimmedQuery,
      ),
    )
    .slice(0, limit)
    .map((passage) => ({
      id: passage.id,
      text: passage.title,
      title: passage.title,
      excerpt: createSnippet(passage.passage, trimmedQuery),
      section: "قطع",
      type: "قطعة كاملة",
      difficulty: mapDifficulty(passage.difficulty),
      skill: passage.pieceNumber ? `قطعة ${passage.pieceNumber}` : "قطعة كاملة",
      state: passage.needsReview ? "قيد المراجعة" : "جاهزة",
      href: `/exam?section=verbal_reading&passageId=${passage.id}`,
      kind: "passage",
      pieceNumber: passage.pieceNumber,
      questionCount: passage.questions.length,
      needsReview: passage.needsReview,
    }));
}

function normalizeQuestionState(value?: string | null) {
  if (!value || value === "الكل") return "غير محلول";
  return value;
}

async function loadDatabaseBanks() {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) return [];

  try {
    const sql = neon(databaseUrl);
    const rows = (await sql.query(`
      select
        id,
        title,
        section::text as section,
        kind::text as kind,
        difficulty::text as difficulty,
        total_questions,
        coalesce(subtitle, '') as subtitle
      from app_question_banks
      where is_published = true
      order by search_priority asc, total_questions desc, id asc
      limit 120
    `)) as Array<{
      id: number;
      title: string;
      section: string;
      kind: string;
      difficulty: string | null;
      total_questions: number;
      subtitle: string;
    }>;

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      count: Number(row.total_questions ?? 0),
      level: mapDifficulty(row.difficulty),
      type: mapBankType(row.section, row.kind),
      tag: mapBankTag(row.title || row.subtitle),
    })) satisfies BankItem[];
  } catch {
    return [];
  }
}

async function loadDatabaseQuestions(): Promise<SearchItem[]> {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) return [];

  try {
    const sql = neon(databaseUrl);
    const rows = (await sql.query(`
      select
        q.id,
        q.question_text,
        q.section::text as section,
        q.question_type::text as question_type,
        q.difficulty::text as difficulty,
        coalesce(s.skill_name, '') as skill_name,
        coalesce(b.kind::text, 'question_bank') as bank_kind,
        q.passage_id
      from app_questions q
      left join app_skills s on s.id = q.skill_id
      left join app_question_banks b on b.id = q.bank_id
      left join app_passages p on p.id = q.passage_id
      where q.is_published = true
        and (
          q.question_type::text <> 'reading_passage'
          or p.source_name = '${READING_DOCUMENT_SOURCE_FILE}'
        )
      order by q.usage_count desc, q.created_at desc
      limit 5000
    `)) as Array<{
      id: number;
      question_text: string;
      section: string;
      question_type: string;
      difficulty: string | null;
      skill_name: string;
      bank_kind: string;
      passage_id: number | null;
    }>;

    return rows.map((row) => ({
      id: row.id,
      text: row.question_text,
      section: mapQuestionSection(row.section, row.bank_kind),
      type: mapQuestionType(row.question_type, row.bank_kind),
      difficulty: mapDifficulty(row.difficulty),
      skill: row.skill_name || (row.section === "quantitative" ? "التدريب الكمي" : "التدريب اللفظي"),
      state: "غير محلول",
      href: row.passage_id ? `/exam?section=verbal_reading&passageId=${row.passage_id}` : "/exam",
      kind: "question",
      title: row.question_text,
    })) satisfies SearchItem[];
  } catch {
    return [];
  }
}

async function searchDatabasePassages(query: string, limit: number): Promise<SearchItem[]> {
  const databaseUrl = getDatabaseUrl();
  const trimmedQuery = query.trim();

  if (!trimmedQuery) return [];
  if (!databaseUrl) return searchFallbackPassages(trimmedQuery, limit);

  try {
    const sql = neon(databaseUrl);
    const pattern = `%${trimmedQuery}%`;

    const rows = (await sql`
      select
        p.id,
        p.piece_number,
        case
          when nullif(p.piece_title, '') is not null then p.piece_title
          when nullif(p.title, '') is not null then p.title
          when p.piece_number is not null then concat('قطعة ', p.piece_number::text)
          else concat('قطعة ', p.id::text)
        end as piece_title,
        p.passage_text,
        p.difficulty::text as difficulty,
        p.needs_review,
        (
          select count(*)::int
          from app_questions q
          where q.passage_id = p.id and q.is_published = true
        ) as question_count
      from app_passages p
      inner join app_question_banks b on b.id = p.bank_id
      where b.is_published = true
        and p.source_name = ${READING_DOCUMENT_SOURCE_FILE}
        and (
          p.piece_title ilike ${pattern}
          or p.title ilike ${pattern}
          or p.passage_text ilike ${pattern}
          or cast(p.piece_number as text) = ${trimmedQuery}
        )
      order by
        case
          when p.piece_title ilike ${pattern} or p.title ilike ${pattern} then 0
          else 1
        end,
        p.piece_number asc nulls last,
        p.id asc
      limit ${limit}
    `) as Array<{
      id: number;
      piece_number: number | null;
      piece_title: string;
      passage_text: string;
      difficulty: string | null;
      needs_review: boolean;
      question_count: number;
    }>;

    const mappedRows = rows
      .filter((row) => fuzzyMatch(`${row.piece_title} ${row.passage_text}`, trimmedQuery))
      .map((row) => ({
        id: row.id,
        text: row.piece_title,
        title: row.piece_title,
        excerpt: createSnippet(row.passage_text, trimmedQuery),
        section: "قطع",
        type: "قطعة كاملة",
        difficulty: mapDifficulty(row.difficulty),
        skill: row.piece_number ? `قطعة ${row.piece_number}` : "قطعة كاملة",
        state: row.needs_review ? "قيد المراجعة" : "جاهزة",
        href: `/exam?section=verbal_reading&passageId=${row.id}`,
        kind: "passage",
        pieceNumber: row.piece_number,
        questionCount: Number(row.question_count ?? 0),
        needsReview: row.needs_review,
      })) satisfies SearchItem[];

    return mappedRows.length ? mappedRows : searchFallbackPassages(trimmedQuery, limit);
  } catch {
    return searchFallbackPassages(trimmedQuery, limit);
  }
}

async function getBanksSource() {
  const databaseBanks = await loadDatabaseBanks();
  return databaseBanks.length ? databaseBanks : fallbackBanks;
}

async function getQuestionsSource(): Promise<SearchItem[]> {
  const databaseQuestions = await loadDatabaseQuestions();
  if (databaseQuestions.length) return databaseQuestions;

  const documentQuestions = await getFallbackReadingQuestionItems();
  return [
    ...documentQuestions,
    ...(fallbackQuestions.map((item) => ({ ...item, kind: "question", title: item.text })) satisfies SearchItem[]),
  ];
}

export async function getBankItems(filters: SearchFilters = {}) {
  const items = await getBanksSource();
  const query = filters.query?.trim() ?? "";
  const type = filters.type?.trim() ?? "الكل";
  const normalizedType = type === "verbal" ? "لفظي" : type === "quantitative" ? "كمي" : type;

  return items.filter((item) => {
    const matchesType = normalizedType === "الكل" || item.type === normalizedType;

    if (!query) return matchesType;

    return matchesType && fuzzyMatch(`${item.title} ${item.level} ${item.type} ${item.tag}`, query);
  });
}

function shouldIncludePassages(filters: SearchFilters, hasQuery: boolean) {
  if (!hasQuery) return false;

  const section = filters.section?.trim() ?? "الكل";
  const type = filters.type?.trim() ?? "الكل";

  if (section === "كمي") return false;
  if (type !== "الكل" && !["قطع", "لفظي"].includes(type)) return false;

  return true;
}

export async function getQuestionItems(filters: SearchFilters = {}) {
  const items = await getQuestionsSource();
  const query = filters.query?.trim() ?? "";
  const section = filters.section?.trim() ?? "الكل";
  const difficulty = filters.difficulty?.trim() ?? "الكل";
  const skill = filters.skill?.trim() ?? "الكل";
  const state = filters.state?.trim() ?? "الكل";
  const type = filters.type?.trim() ?? "الكل";
  const limit = Math.min(Math.max(Number(filters.limit ?? 24), 1), 80);

  const filteredQuestions = items.filter((item) => {
    const haystack = [item.title ?? item.text, item.text, item.excerpt ?? ""].join(" ");
    const matchesQuery = !query || fuzzyMatch(haystack, query);
    const matchesSection = section === "الكل" || item.section === section;
    const matchesDifficulty = difficulty === "الكل" || item.difficulty === difficulty;
    const matchesSkill = skill === "الكل" || item.skill === skill;
    const matchesState = state === "الكل" || normalizeQuestionState(item.state) === normalizeQuestionState(state);
    const matchesType = type === "الكل" || item.type === type;

    return matchesQuery && matchesSection && matchesDifficulty && matchesSkill && matchesState && matchesType;
  });

  const passages = shouldIncludePassages(filters, Boolean(query))
    ? await searchDatabasePassages(query, Math.max(6, Math.ceil(limit / 2)))
    : [];

  const merged = [...passages, ...filteredQuestions];
  return merged.slice(0, limit);
}

export async function getReadingPassageSummaries(): Promise<ReadingPassageSummary[]> {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) {
    return await getFallbackReadingPassageSummaries();
  }

  try {
    const sql = neon(databaseUrl);
    const rows = (await sql`
      select
        p.id,
        p.piece_number,
        case
          when nullif(p.piece_title, '') is not null then p.piece_title
          when nullif(p.title, '') is not null then p.title
          when p.piece_number is not null then concat('قطعة ', p.piece_number::text)
          else concat('قطعة ', p.id::text)
        end as piece_title,
        p.source_name,
        count(q.id)::int as question_count
      from app_passages p
      inner join app_question_banks b on b.id = p.bank_id
      left join app_questions q on q.passage_id = p.id and q.is_published = true
      where b.is_published = true
        and p.source_name = ${READING_DOCUMENT_SOURCE_FILE}
      group by p.id, p.piece_number, p.piece_title, p.title, p.source_name
      order by p.piece_number asc nulls last, p.id asc
    `) as Array<{
      id: number;
      piece_number: number | null;
      piece_title: string;
      source_name: string | null;
      question_count: number;
    }>;

    const rowsWithQuestions = rows.filter((row) => Number(row.question_count ?? 0) > 0);

    if (!rowsWithQuestions.length) {
      return await getFallbackReadingPassageSummaries();
    }

    return rowsWithQuestions.map((row) => ({
      id: row.id,
      title: row.piece_title,
      sourceName: row.source_name,
      pieceNumber: row.piece_number,
      questionCount: Number(row.question_count ?? 0),
      href: `/exam?section=verbal_reading&passageId=${row.id}`,
    }));
  } catch {
    return await getFallbackReadingPassageSummaries();
  }
}

export async function getPassageDetail(passageId: number) {
  const databaseUrl = getDatabaseUrl();
  if (!databaseUrl) {
    return await buildFallbackPassageDetail(passageId);
  }

  try {
    const sql = neon(databaseUrl);

    const passageRows = (await sql`
      select
        id,
        piece_number,
        case
          when nullif(piece_title, '') is not null then piece_title
          when nullif(title, '') is not null then title
          when piece_number is not null then concat('قطعة ', piece_number::text)
          else concat('قطعة ', id::text)
        end as piece_title,
        passage_text,
        difficulty::text as difficulty,
        source_name,
        raw_page_from,
        raw_page_to,
        coalesce(parsing_confidence, 0) as parsing_confidence,
        needs_review
      from app_passages
      where id = ${passageId}
        and source_name = ${READING_DOCUMENT_SOURCE_FILE}
      limit 1
    `) as Array<{
      id: number;
      piece_number: number | null;
      piece_title: string;
      passage_text: string;
      difficulty: string | null;
      source_name: string | null;
      raw_page_from: number | null;
      raw_page_to: number | null;
      parsing_confidence: string | number | null;
      needs_review: boolean;
    }>;

    const passage = passageRows[0];
    if (!passage) return await buildFallbackPassageDetail(passageId);

    const questionRows = (await sql`
      select
        id,
        question_order,
        question_text,
        explanation,
        correct_choice_key,
        answer_source,
        coalesce(answer_confidence, 0) as answer_confidence,
        needs_review
      from app_questions
      where passage_id = ${passageId} and is_published = true
      order by question_order asc, id asc
    `) as Array<{
      id: number;
      question_order: number;
      question_text: string;
      explanation: string | null;
      correct_choice_key: string | null;
      answer_source: string | null;
      answer_confidence: string | number | null;
      needs_review: boolean;
    }>;

    const questions = await Promise.all(
      questionRows.map(async (question) => {
        const choiceRows = (await sql`
          select
            id,
            choice_key,
            choice_text,
            is_correct,
            sort_order
          from app_question_choices
          where question_id = ${question.id}
          order by sort_order asc, id asc
        `) as Array<{
          id: number;
          choice_key: string;
          choice_text: string;
          is_correct: boolean;
          sort_order: number;
        }>;

        return {
          id: question.id,
          order: question.question_order,
          text: question.question_text,
          explanation: question.explanation,
          correctChoiceKey: question.correct_choice_key,
          answerSource: question.answer_source,
          answerConfidence: Number(question.answer_confidence ?? 0),
          needsReview: question.needs_review,
          choices: choiceRows.map((choice) => ({
            id: choice.id,
            key: choice.choice_key,
            text: choice.choice_text,
            isCorrect: choice.is_correct,
            sortOrder: choice.sort_order,
          })),
        } satisfies PassageQuestion;
      }),
    );

    return {
      id: passage.id,
      pieceNumber: passage.piece_number,
      title: resolvePassageTitle(passage.piece_title, passage.piece_title, passage.piece_number, passage.id),
      text: passage.passage_text,
      difficulty: mapDifficulty(passage.difficulty),
      sourceName: passage.source_name,
      rawPageFrom: passage.raw_page_from,
      rawPageTo: passage.raw_page_to,
      parsingConfidence: Number(passage.parsing_confidence ?? 0),
      needsReview: passage.needs_review,
      questions,
    } satisfies PassageDetail;
  } catch {
    return await buildFallbackPassageDetail(passageId);
  }
}
