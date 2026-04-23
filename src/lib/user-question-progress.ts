import { ensureColumnIsUuid, getSqlClient } from "@/lib/db";
import { applyActiveXpMultiplier } from "@/lib/gamification-rules";
import { syncGamificationAfterQuestionSolve } from "@/lib/gamification";

export type QuestionProgressSection = "verbal" | "quantitative";
export type QuestionProgressOutcome = "correct" | "incorrect";

export type TrackQuestionProgressPayload = {
  questionKey: string;
  questionId?: number | null;
  section: QuestionProgressSection;
  sourceBank: string;
  categoryId?: string | null;
  categoryTitle?: string | null;
  questionTypeLabel: string;
  questionText: string;
  questionHref?: string | null;
  selectedAnswer?: string | null;
  correctAnswer?: string | null;
  metadata?: Record<string, unknown>;
  outcome: QuestionProgressOutcome;
  xpValue?: number;
};

export type UserQuestionProgressRecord = {
  id: number;
  questionKey: string;
  questionId: number | null;
  section: QuestionProgressSection;
  sourceBank: string;
  categoryId: string | null;
  categoryTitle: string | null;
  questionTypeLabel: string;
  questionText: string;
  questionHref: string | null;
  selectedAnswer: string | null;
  correctAnswer: string | null;
  attemptsCount: number;
  correctAttemptsCount: number;
  isSolved: boolean;
  xpEarned: number;
  metadata: Record<string, unknown>;
  firstSolvedAt: string | null;
  lastAttemptAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type UserQuestionProgressTotals = {
  totalXp: number;
  solvedQuestionsCount: number;
};

export type UserSolvedSectionSummary = {
  section: QuestionProgressSection;
  categoryId: string | null;
  categoryTitle: string;
  questionTypeLabel: string;
  solvedCount: number;
  xpEarned: number;
  retryHref: string | null;
};

export type UserSolvedQuestionSummary = {
  id: number;
  questionKey: string;
  section: QuestionProgressSection;
  categoryId: string | null;
  categoryTitle: string | null;
  questionTypeLabel: string;
  questionText: string;
  questionHref: string | null;
  sourceBank: string;
  xpEarned: number;
  solvedAt: string | null;
};

type UserQuestionProgressRow = {
  id: number;
  question_key: string;
  question_id: number | null;
  section: QuestionProgressSection;
  source_bank: string;
  category_id: string | null;
  category_title: string | null;
  question_type_label: string;
  question_text: string;
  question_href: string | null;
  selected_answer: string | null;
  correct_answer: string | null;
  attempts_count: number;
  correct_attempts_count: number;
  is_solved: boolean;
  xp_earned: number;
  metadata: Record<string, unknown> | null;
  first_solved_at: string | null;
  last_attempt_at: string | null;
  created_at: string;
  updated_at: string;
};

function getSql() {
  return getSqlClient();
}

function clampPositiveInteger(value: number | null | undefined, fallback: number) {
  if (value == null || Number.isNaN(value)) {
    return fallback;
  }

  return Math.max(0, Math.round(value));
}

function resolveQuestionXpValue(payload: TrackQuestionProgressPayload) {
  if (payload.xpValue != null && !Number.isNaN(payload.xpValue)) {
    return clampPositiveInteger(payload.xpValue, 10);
  }

  const metadataDifficulty =
    typeof payload.metadata?.difficulty === "string"
      ? payload.metadata.difficulty.toLowerCase()
      : "";
  const isHard =
    metadataDifficulty.includes("hard") ||
    metadataDifficulty.includes("elite") ||
    metadataDifficulty.includes("صعب") ||
    metadataDifficulty.includes("متقدم");

  return isHard ? 20 : 10;
}

function mapQuestionProgressRow(row: UserQuestionProgressRow): UserQuestionProgressRecord {
  return {
    id: row.id,
    questionKey: row.question_key,
    questionId: row.question_id,
    section: row.section,
    sourceBank: row.source_bank,
    categoryId: row.category_id,
    categoryTitle: row.category_title,
    questionTypeLabel: row.question_type_label,
    questionText: row.question_text,
    questionHref: row.question_href,
    selectedAnswer: row.selected_answer,
    correctAnswer: row.correct_answer,
    attemptsCount: row.attempts_count,
    correctAttemptsCount: row.correct_attempts_count,
    isSolved: row.is_solved,
    xpEarned: row.xp_earned,
    metadata: row.metadata ?? {},
    firstSolvedAt: row.first_solved_at,
    lastAttemptAt: row.last_attempt_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function buildRetryHref(section: QuestionProgressSection, categoryId: string | null) {
  if (section === "verbal" && categoryId) {
    if (categoryId.startsWith("reading:")) {
      const passageId = categoryId.slice("reading:".length).trim();
      return passageId ? `/verbal/reading?passage=${encodeURIComponent(passageId)}&reset=1` : "/verbal/reading";
    }

    return `/verbal/practice?category=${encodeURIComponent(categoryId)}&reset=1`;
  }

  return section === "quantitative" ? "/question-bank?track=quant" : "/question-bank?track=verbal";
}

export async function ensureUserQuestionProgressSchema() {
  const sql = getSql();

  await sql.query(`
    create table if not exists app_student_profiles (
      user_id uuid primary key references app_users(id) on delete cascade,
      onboarding_completed boolean not null default false,
      last_activity_at timestamptz,
      last_activity_label varchar(160),
      last_opened_bank_href text,
      last_opened_bank_label varchar(160),
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);

  await sql.query(`
    alter table app_student_profiles
      add column if not exists onboarding_completed boolean not null default false,
      add column if not exists last_activity_at timestamptz,
      add column if not exists last_activity_label varchar(160),
      add column if not exists last_opened_bank_href text,
      add column if not exists last_opened_bank_label varchar(160)
  `);

  await sql.query(`
    create table if not exists app_user_question_progress (
      id bigserial primary key,
      user_id uuid not null references app_users(id) on delete cascade,
      question_key varchar(255) not null,
      question_id bigint,
      section app_bank_section not null,
      source_bank varchar(180) not null,
      category_id varchar(80),
      category_title varchar(180),
      question_type_label varchar(180) not null,
      question_text text not null,
      question_href text,
      selected_answer text,
      correct_answer text,
      attempts_count integer not null default 0,
      correct_attempts_count integer not null default 0,
      is_solved boolean not null default false,
      xp_earned integer not null default 0,
      metadata jsonb not null default '{}'::jsonb,
      first_solved_at timestamptz,
      last_attempt_at timestamptz,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      unique (user_id, question_key)
    )
  `);

  await sql.query(`
    alter table app_user_question_progress
      add column if not exists question_id bigint,
      add column if not exists category_id varchar(80),
      add column if not exists category_title varchar(180),
      add column if not exists selected_answer text,
      add column if not exists correct_answer text,
      add column if not exists attempts_count integer not null default 0,
      add column if not exists correct_attempts_count integer not null default 0,
      add column if not exists is_solved boolean not null default false,
      add column if not exists xp_earned integer not null default 0,
      add column if not exists metadata jsonb not null default '{}'::jsonb,
      add column if not exists first_solved_at timestamptz,
      add column if not exists last_attempt_at timestamptz,
      add column if not exists updated_at timestamptz not null default now()
  `);

  await sql.query(`
    create index if not exists idx_app_user_question_progress_user_solved
      on app_user_question_progress (user_id, is_solved, updated_at desc)
  `);

  await sql.query(`
    create index if not exists idx_app_user_question_progress_user_category
      on app_user_question_progress (user_id, section, category_id)
  `);

  await ensureColumnIsUuid("app_student_profiles", "user_id", { nullable: false });
  await ensureColumnIsUuid("app_user_question_progress", "user_id", { nullable: false });
}

export async function getUserQuestionProgressTotals(userId: string): Promise<UserQuestionProgressTotals> {
  await ensureUserQuestionProgressSchema();
  const sql = getSql();
  const rows = (await sql.query(
    `
      select
        coalesce(sum(xp_earned), 0)::int as total_xp,
        count(*) filter (where is_solved = true)::int as solved_questions_count
      from app_user_question_progress
      where user_id::text = $1
    `,
    [userId],
  )) as Array<{
    total_xp: number;
    solved_questions_count: number;
  }>;

  return {
    totalXp: rows[0]?.total_xp ?? 0,
    solvedQuestionsCount: rows[0]?.solved_questions_count ?? 0,
  };
}

export async function listSolvedSections(userId: string, limit = 8): Promise<UserSolvedSectionSummary[]> {
  await ensureUserQuestionProgressSchema();
  const sql = getSql();
  const rows = (await sql.query(
    `
      select
        section,
        category_id,
        coalesce(category_title, question_type_label, source_bank, 'قسم عام') as category_title,
        max(question_type_label) as question_type_label,
        count(*)::int as solved_count,
        coalesce(sum(xp_earned), 0)::int as xp_earned
      from app_user_question_progress
      where user_id::text = $1
        and is_solved = true
      group by
        section,
        category_id,
        coalesce(category_title, question_type_label, source_bank, 'قسم عام')
      order by solved_count desc, xp_earned desc, category_title asc
      limit $2
    `,
    [userId, Math.max(1, limit)],
  )) as Array<{
    section: QuestionProgressSection;
    category_id: string | null;
    category_title: string;
    question_type_label: string;
    solved_count: number;
    xp_earned: number;
  }>;

  return rows.map((row) => ({
    section: row.section,
    categoryId: row.category_id,
    categoryTitle: row.category_title,
    questionTypeLabel: row.question_type_label,
    solvedCount: row.solved_count,
    xpEarned: row.xp_earned,
    retryHref: buildRetryHref(row.section, row.category_id),
  }));
}

export async function listRecentSolvedQuestions(userId: string, limit = 10): Promise<UserSolvedQuestionSummary[]> {
  await ensureUserQuestionProgressSchema();
  const sql = getSql();
  const rows = (await sql.query(
    `
      select
        id,
        question_key,
        section,
        category_id,
        category_title,
        question_type_label,
        question_text,
        question_href,
        source_bank,
        xp_earned,
        coalesce(first_solved_at, last_attempt_at, updated_at)::text as solved_at
      from app_user_question_progress
      where user_id::text = $1
        and is_solved = true
      order by coalesce(first_solved_at, last_attempt_at, updated_at) desc, updated_at desc
      limit $2
    `,
    [userId, Math.max(1, limit)],
  )) as Array<{
    id: number;
    question_key: string;
    section: QuestionProgressSection;
    category_id: string | null;
    category_title: string | null;
    question_type_label: string;
    question_text: string;
    question_href: string | null;
    source_bank: string;
    xp_earned: number;
    solved_at: string | null;
  }>;

  return rows.map((row) => ({
    id: row.id,
    questionKey: row.question_key,
    section: row.section,
    categoryId: row.category_id,
    categoryTitle: row.category_title,
    questionTypeLabel: row.question_type_label,
    questionText: row.question_text,
    questionHref: row.question_href,
    sourceBank: row.source_bank,
    xpEarned: row.xp_earned,
    solvedAt: row.solved_at,
  }));
}

export async function trackUserQuestionProgress(userId: string, payload: TrackQuestionProgressPayload) {
  await ensureUserQuestionProgressSchema();
  const sql = getSql();
  const questionKey = payload.questionKey.trim();

  if (!questionKey) {
    throw new Error("questionKey مطلوب لتسجيل التقدم.");
  }

  const existingRows = (await sql.query(
    `
      select
        id,
        question_key,
        question_id,
        section,
        source_bank,
        category_id,
        category_title,
        question_type_label,
        question_text,
        question_href,
        selected_answer,
        correct_answer,
        attempts_count,
        correct_attempts_count,
        is_solved,
        xp_earned,
        metadata,
        first_solved_at::text,
        last_attempt_at::text,
        created_at::text,
        updated_at::text
      from app_user_question_progress
      where user_id::text = $1
        and question_key = $2
      limit 1
    `,
    [userId, questionKey],
  )) as UserQuestionProgressRow[];

  const existing = existingRows[0] ?? null;
  const isCorrect = payload.outcome === "correct";
  const xpValue = applyActiveXpMultiplier(resolveQuestionXpValue(payload));
  const awardedXp = isCorrect && !existing?.is_solved ? xpValue : 0;
  const nextAttemptsCount = clampPositiveInteger(existing?.attempts_count, 0) + 1;
  const nextCorrectAttemptsCount =
    clampPositiveInteger(existing?.correct_attempts_count, 0) + (isCorrect ? 1 : 0);
  const nextIsSolved = Boolean(existing?.is_solved) || isCorrect;
  const serializedMetadata = JSON.stringify(payload.metadata ?? existing?.metadata ?? {});

  let currentRow: UserQuestionProgressRow | null = null;

  if (existing) {
    const updatedRows = (await sql.query(
      `
        update app_user_question_progress
        set
          question_id = coalesce($2, question_id),
          section = $3::app_bank_section,
          source_bank = $4,
          category_id = coalesce($5, category_id),
          category_title = coalesce($6, category_title),
          question_type_label = $7,
          question_text = $8,
          question_href = coalesce($9, question_href),
          selected_answer = $10,
          correct_answer = $11,
          attempts_count = $12,
          correct_attempts_count = $13,
          is_solved = $14,
          xp_earned = xp_earned + $15,
          metadata = $16::jsonb,
          first_solved_at = case
            when first_solved_at is null and $14 = true then now()
            else first_solved_at
          end,
          last_attempt_at = now(),
          updated_at = now()
        where id = $1
        returning
          id,
          question_key,
          question_id,
          section,
          source_bank,
          category_id,
          category_title,
          question_type_label,
          question_text,
          question_href,
          selected_answer,
          correct_answer,
          attempts_count,
          correct_attempts_count,
          is_solved,
          xp_earned,
          metadata,
          first_solved_at::text,
          last_attempt_at::text,
          created_at::text,
          updated_at::text
      `,
      [
        existing.id,
        payload.questionId ?? null,
        payload.section,
        payload.sourceBank,
        payload.categoryId ?? null,
        payload.categoryTitle ?? null,
        payload.questionTypeLabel,
        payload.questionText,
        payload.questionHref ?? null,
        payload.selectedAnswer ?? null,
        payload.correctAnswer ?? null,
        nextAttemptsCount,
        nextCorrectAttemptsCount,
        nextIsSolved,
        awardedXp,
        serializedMetadata,
      ],
    )) as UserQuestionProgressRow[];

    currentRow = updatedRows[0] ?? null;
  } else {
    const insertedRows = (await sql.query(
      `
        insert into app_user_question_progress (
          user_id,
          question_key,
          question_id,
          section,
          source_bank,
          category_id,
          category_title,
          question_type_label,
          question_text,
          question_href,
          selected_answer,
          correct_answer,
          attempts_count,
          correct_attempts_count,
          is_solved,
          xp_earned,
          metadata,
          first_solved_at,
          last_attempt_at
        )
        values (
          $1,
          $2,
          $3,
          $4::app_bank_section,
          $5,
          $6,
          $7,
          $8,
          $9,
          $10,
          $11,
          $12,
          $13,
          $14,
          $15,
          $16,
          $17::jsonb,
          case when $15 = true then now() else null end,
          now()
        )
        returning
          id,
          question_key,
          question_id,
          section,
          source_bank,
          category_id,
          category_title,
          question_type_label,
          question_text,
          question_href,
          selected_answer,
          correct_answer,
          attempts_count,
          correct_attempts_count,
          is_solved,
          xp_earned,
          metadata,
          first_solved_at::text,
          last_attempt_at::text,
          created_at::text,
          updated_at::text
      `,
      [
        userId,
        questionKey,
        payload.questionId ?? null,
        payload.section,
        payload.sourceBank,
        payload.categoryId ?? null,
        payload.categoryTitle ?? null,
        payload.questionTypeLabel,
        payload.questionText,
        payload.questionHref ?? null,
        payload.selectedAnswer ?? null,
        payload.correctAnswer ?? null,
        nextAttemptsCount,
        nextCorrectAttemptsCount,
        nextIsSolved,
        awardedXp,
        serializedMetadata,
      ],
    )) as UserQuestionProgressRow[];

    currentRow = insertedRows[0] ?? null;
  }

  await sql.query(
    `
      insert into app_student_profiles (
        user_id,
        onboarding_completed,
        last_activity_at,
        last_activity_label,
        last_opened_bank_href,
        last_opened_bank_label
      )
      values (
        $1,
        false,
        now(),
        $2,
        $3,
        $4
      )
      on conflict (user_id)
      do update set
        last_activity_at = now(),
        last_activity_label = excluded.last_activity_label,
        last_opened_bank_href = coalesce(excluded.last_opened_bank_href, app_student_profiles.last_opened_bank_href),
        last_opened_bank_label = coalesce(excluded.last_opened_bank_label, app_student_profiles.last_opened_bank_label)
    `,
    [
      userId,
      isCorrect ? `حل سؤال صحيح من ${payload.questionTypeLabel}` : `راجع سؤالًا من ${payload.questionTypeLabel}`,
      payload.questionHref ?? null,
      payload.sourceBank,
    ],
  );

  const totals = await getUserQuestionProgressTotals(userId);

  if (awardedXp > 0) {
    try {
      await syncGamificationAfterQuestionSolve(userId);
    } catch (error) {
      console.error("Failed to sync gamification after question solve:", error);
    }
  }

  return {
    status: existing ? "updated" as const : "created" as const,
    alreadySolved: Boolean(existing?.is_solved),
    awardedXp,
    totalXp: totals.totalXp,
    solvedQuestionsCount: totals.solvedQuestionsCount,
    reachedProfessionalLevel: totals.totalXp >= 10000,
    item: currentRow ? mapQuestionProgressRow(currentRow) : null,
  };
}
