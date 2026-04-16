import { neon } from "@neondatabase/serverless";

import { banks as fallbackBanks, questionSearchItems as fallbackQuestions } from "@/data/miyaar";

export type BankItem = (typeof fallbackBanks)[number];
export type QuestionItem = (typeof fallbackQuestions)[number];

type SearchFilters = {
  query?: string;
  section?: string;
  type?: string;
  difficulty?: string;
  skill?: string;
  state?: string;
  limit?: number;
};

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

function mapDifficulty(value?: string | null) {
  switch (value) {
    case "easy":
      return "سهل";
    case "hard":
      return "متقدم";
    case "elite":
      return "متقدم";
    case "medium":
    default:
      return "متوسط";
  }
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

async function loadDatabaseQuestions() {
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
      where q.is_published = true
      order by q.usage_count desc, q.created_at desc
      limit 300
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
      href: row.passage_id ? "/passage" : "/exam",
    })) satisfies QuestionItem[];
  } catch {
    return [];
  }
}

async function getBanksSource() {
  const databaseBanks = await loadDatabaseBanks();
  return databaseBanks.length ? databaseBanks : fallbackBanks;
}

async function getQuestionsSource() {
  const databaseQuestions = await loadDatabaseQuestions();
  return databaseQuestions.length ? databaseQuestions : fallbackQuestions;
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

export async function getQuestionItems(filters: SearchFilters = {}) {
  const items = await getQuestionsSource();
  const query = filters.query?.trim() ?? "";
  const section = filters.section?.trim() ?? "الكل";
  const difficulty = filters.difficulty?.trim() ?? "الكل";
  const skill = filters.skill?.trim() ?? "الكل";
  const state = filters.state?.trim() ?? "الكل";
  const type = filters.type?.trim() ?? "الكل";
  const limit = Math.min(Math.max(Number(filters.limit ?? 24), 1), 80);

  return items
    .filter((item) => {
      const matchesQuery = !query || fuzzyMatch(item.text, query);
      const matchesSection = section === "الكل" || item.section === section;
      const matchesDifficulty = difficulty === "الكل" || item.difficulty === difficulty;
      const matchesSkill = skill === "الكل" || item.skill === skill;
      const matchesState = state === "الكل" || normalizeQuestionState(item.state) === normalizeQuestionState(state);
      const matchesType = type === "الكل" || item.type === type;

      return matchesQuery && matchesSection && matchesDifficulty && matchesSkill && matchesState && matchesType;
    })
    .slice(0, limit);
}
