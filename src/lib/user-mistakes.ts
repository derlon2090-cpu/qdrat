import { getSqlClient } from "@/lib/db";

export type MistakeSection = "verbal" | "quantitative";
export type MistakeOutcome = "correct" | "incorrect";
export type MistakeMasteryState = "incorrect" | "training" | "mastered";

export type TrackMistakePayload = {
  questionKey: string;
  questionId?: number | null;
  section: MistakeSection;
  sourceBank: string;
  questionTypeLabel: string;
  questionText: string;
  questionHref?: string | null;
  metadata?: Record<string, unknown>;
  outcome: MistakeOutcome;
};

export type UserMistakeRecord = {
  id: number;
  questionKey: string;
  questionId: number | null;
  section: MistakeSection;
  sourceBank: string;
  questionTypeLabel: string;
  questionText: string;
  questionHref: string | null;
  correctCount: number;
  removalThreshold: number;
  masteryState: MistakeMasteryState;
  incorrectCount: number;
  trainingAttemptsCount: number;
  trainingCorrectCount: number;
  masteryPercent: number;
  priorityScore: number;
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  lastIncorrectAt: string | null;
  lastCorrectAt: string | null;
  lastTrainedAt: string | null;
  masteredAt: string | null;
};

type UserMistakeRow = {
  id: number;
  question_key: string;
  question_id: number | null;
  section: MistakeSection;
  source_bank: string;
  question_type_label: string;
  question_text: string;
  question_href: string | null;
  correct_count: number;
  removal_threshold: number;
  mastery_state: string | null;
  incorrect_count: number | null;
  training_attempts_count: number | null;
  training_correct_count: number | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  last_incorrect_at: string | null;
  last_correct_at: string | null;
  last_trained_at: string | null;
  mastered_at: string | null;
};

function getSql() {
  return getSqlClient();
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function normalizeState(value: string | null | undefined): MistakeMasteryState {
  if (value === "mastered" || value === "training" || value === "incorrect") {
    return value;
  }

  return "incorrect";
}

function calculateMasteryPercent(row: UserMistakeRow) {
  const state = normalizeState(row.mastery_state);
  if (state === "mastered") return 100;

  const removalThreshold = Math.max(1, row.removal_threshold);
  const correctProgress = clamp((row.correct_count / removalThreshold) * 100, 0, 100);
  const trainingRatio =
    (row.training_attempts_count ?? 0) > 0
      ? clamp(
          ((row.training_correct_count ?? 0) / Math.max(1, row.training_attempts_count ?? 0)) * 100,
          0,
          100,
        )
      : 0;

  const blended = Math.round(correctProgress * 0.65 + trainingRatio * 0.35);
  return state === "incorrect" ? clamp(blended, 0, 89) : clamp(blended, 0, 96);
}

function calculatePriorityScore(row: UserMistakeRow) {
  const state = normalizeState(row.mastery_state);
  const incorrectCount = Math.max(1, row.incorrect_count ?? 1);
  const recencyBoost = row.last_incorrect_at
    ? Math.max(
        0,
        3 -
          Math.floor(
            (Date.now() - new Date(row.last_incorrect_at).getTime()) /
              (1000 * 60 * 60 * 24 * 3),
          ),
      )
    : 0;

  const stateWeight =
    state === "incorrect" ? 6 : state === "training" ? 3 : 1;

  return stateWeight + incorrectCount * 2 + recencyBoost;
}

function mapUserMistake(row: UserMistakeRow): UserMistakeRecord {
  return {
    id: row.id,
    questionKey: row.question_key,
    questionId: row.question_id,
    section: row.section,
    sourceBank: row.source_bank,
    questionTypeLabel: row.question_type_label,
    questionText: row.question_text,
    questionHref: row.question_href,
    correctCount: row.correct_count,
    removalThreshold: row.removal_threshold,
    masteryState: normalizeState(row.mastery_state),
    incorrectCount: Math.max(1, row.incorrect_count ?? 1),
    trainingAttemptsCount: Math.max(0, row.training_attempts_count ?? 0),
    trainingCorrectCount: Math.max(0, row.training_correct_count ?? 0),
    masteryPercent: calculateMasteryPercent(row),
    priorityScore: calculatePriorityScore(row),
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    lastIncorrectAt: row.last_incorrect_at,
    lastCorrectAt: row.last_correct_at,
    lastTrainedAt: row.last_trained_at,
    masteredAt: row.mastered_at,
  };
}

async function fetchMistakeById(userId: string, mistakeId: number) {
  const sql = getSql();
  const rows = (await sql.query(
    `
      select
        id,
        question_key,
        question_id,
        section,
        source_bank,
        question_type_label,
        question_text,
        question_href,
        correct_count,
        removal_threshold,
        mastery_state,
        incorrect_count,
        training_attempts_count,
        training_correct_count,
        metadata,
        created_at::text,
        updated_at::text,
        last_incorrect_at::text,
        last_correct_at::text,
        last_trained_at::text,
        mastered_at::text
      from app_user_mistakes
      where id = $1
        and user_id = $2::uuid
      limit 1
    `,
    [mistakeId, userId],
  )) as UserMistakeRow[];

  return rows[0] ?? null;
}

async function fetchMistakeByKey(userId: string, questionKey: string) {
  const sql = getSql();
  const rows = (await sql.query(
    `
      select
        id,
        question_key,
        question_id,
        section,
        source_bank,
        question_type_label,
        question_text,
        question_href,
        correct_count,
        removal_threshold,
        mastery_state,
        incorrect_count,
        training_attempts_count,
        training_correct_count,
        metadata,
        created_at::text,
        updated_at::text,
        last_incorrect_at::text,
        last_correct_at::text,
        last_trained_at::text,
        mastered_at::text
      from app_user_mistakes
      where user_id = $1::uuid
        and question_key = $2
      limit 1
    `,
    [userId, questionKey],
  )) as UserMistakeRow[];

  return rows[0] ?? null;
}

export async function ensureUserMistakesSchema() {
  const sql = getSql();

  await sql.query(`
    create table if not exists app_user_mistakes (
      id bigserial primary key,
      user_id uuid not null references app_users(id) on delete cascade,
      question_key varchar(255) not null,
      question_id bigint references app_questions(id) on delete set null,
      section app_bank_section not null,
      source_bank varchar(255) not null,
      question_type_label varchar(120) not null,
      question_text text not null,
      question_href text,
      correct_count integer not null default 0,
      removal_threshold integer not null default 5,
      mastery_state varchar(20) not null default 'incorrect',
      incorrect_count integer not null default 1,
      training_attempts_count integer not null default 0,
      training_correct_count integer not null default 0,
      metadata jsonb not null default '{}'::jsonb,
      last_incorrect_at timestamptz,
      last_correct_at timestamptz,
      last_trained_at timestamptz,
      mastered_at timestamptz,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      unique (user_id, question_key)
    )
  `);

  await sql.query(`
    alter table app_user_mistakes
      add column if not exists mastery_state varchar(20) not null default 'incorrect',
      add column if not exists incorrect_count integer not null default 1,
      add column if not exists training_attempts_count integer not null default 0,
      add column if not exists training_correct_count integer not null default 0,
      add column if not exists last_incorrect_at timestamptz,
      add column if not exists last_correct_at timestamptz,
      add column if not exists last_trained_at timestamptz,
      add column if not exists mastered_at timestamptz
  `);

  await sql.query(`
    update app_user_mistakes
    set
      mastery_state = case
        when correct_count >= removal_threshold then 'mastered'
        when correct_count > 0 then 'training'
        else 'incorrect'
      end,
      incorrect_count = greatest(coalesce(incorrect_count, 1), 1),
      training_attempts_count = greatest(coalesce(training_attempts_count, 0), 0),
      training_correct_count = greatest(coalesce(training_correct_count, 0), 0),
      last_incorrect_at = coalesce(last_incorrect_at, updated_at),
      mastered_at = case
        when correct_count >= removal_threshold then coalesce(mastered_at, updated_at)
        else mastered_at
      end
    where mastery_state not in ('incorrect', 'training', 'mastered')
       or incorrect_count is null
       or training_attempts_count is null
       or training_correct_count is null
       or last_incorrect_at is null
  `);

  await sql.query(`
    create index if not exists idx_app_user_mistakes_user_state
      on app_user_mistakes (user_id, mastery_state, updated_at desc)
  `);
}

export async function listUserMistakes(userId: string) {
  await ensureUserMistakesSchema();
  const sql = getSql();
  const rows = (await sql.query(
    `
      select
        id,
        question_key,
        question_id,
        section,
        source_bank,
        question_type_label,
        question_text,
        question_href,
        correct_count,
        removal_threshold,
        mastery_state,
        incorrect_count,
        training_attempts_count,
        training_correct_count,
        metadata,
        created_at::text,
        updated_at::text,
        last_incorrect_at::text,
        last_correct_at::text,
        last_trained_at::text,
        mastered_at::text
      from app_user_mistakes
      where user_id = $1::uuid
      order by
        case mastery_state
          when 'incorrect' then 0
          when 'training' then 1
          else 2
        end asc,
        updated_at desc,
        created_at desc
    `,
    [userId],
  )) as UserMistakeRow[];

  return rows.map(mapUserMistake);
}

export async function removeUserMistake(userId: string, mistakeId: number) {
  await ensureUserMistakesSchema();
  const sql = getSql();
  await sql.query(
    `
      delete from app_user_mistakes
      where id = $1
        and user_id = $2::uuid
    `,
    [mistakeId, userId],
  );

  return { ok: true };
}

export async function updateUserMistakeState(
  userId: string,
  mistakeId: number,
  masteryState: MistakeMasteryState,
) {
  await ensureUserMistakesSchema();
  const sql = getSql();
  const existing = await fetchMistakeById(userId, mistakeId);

  if (!existing) {
    throw new Error("تعذر العثور على السؤال داخل قائمة الأخطاء.");
  }

  const rows = (await sql.query(
    `
      update app_user_mistakes
      set
        mastery_state = $3,
        correct_count = case
          when $3 = 'mastered' then greatest(correct_count, removal_threshold)
          when $3 = 'incorrect' then 0
          else greatest(correct_count, 1)
        end,
        mastered_at = case
          when $3 = 'mastered' then coalesce(mastered_at, now())
          else null
        end,
        updated_at = now()
      where id = $1
        and user_id = $2::uuid
      returning
        id,
        question_key,
        question_id,
        section,
        source_bank,
        question_type_label,
        question_text,
        question_href,
        correct_count,
        removal_threshold,
        mastery_state,
        incorrect_count,
        training_attempts_count,
        training_correct_count,
        metadata,
        created_at::text,
        updated_at::text,
        last_incorrect_at::text,
        last_correct_at::text,
        last_trained_at::text,
        mastered_at::text
    `,
    [mistakeId, userId, masteryState],
  )) as UserMistakeRow[];

  return rows[0] ? mapUserMistake(rows[0]) : null;
}

export async function recordUserMistakeTrainingAttempt(
  userId: string,
  mistakeId: number,
  outcome: MistakeOutcome,
) {
  await ensureUserMistakesSchema();
  const sql = getSql();
  const existing = await fetchMistakeById(userId, mistakeId);

  if (!existing) {
    throw new Error("تعذر العثور على السؤال داخل قائمة الأخطاء.");
  }

  const isCorrect = outcome === "correct";
  const nextCorrectCount = isCorrect
    ? existing.correct_count + 1
    : 0;
  const nextState: MistakeMasteryState = isCorrect
    ? nextCorrectCount >= existing.removal_threshold
      ? "mastered"
      : "training"
    : "incorrect";

  const rows = (await sql.query(
    `
      update app_user_mistakes
      set
        correct_count = $3,
        mastery_state = $4,
        incorrect_count = case
          when $5::boolean then incorrect_count
          else greatest(incorrect_count, 1) + 1
        end,
        training_attempts_count = greatest(training_attempts_count, 0) + 1,
        training_correct_count = greatest(training_correct_count, 0) + case when $5::boolean then 1 else 0 end,
        last_incorrect_at = case when $5::boolean then last_incorrect_at else now() end,
        last_correct_at = case when $5::boolean then now() else last_correct_at end,
        last_trained_at = now(),
        mastered_at = case
          when $4 = 'mastered' then coalesce(mastered_at, now())
          else null
        end,
        updated_at = now()
      where id = $1
        and user_id = $2::uuid
      returning
        id,
        question_key,
        question_id,
        section,
        source_bank,
        question_type_label,
        question_text,
        question_href,
        correct_count,
        removal_threshold,
        mastery_state,
        incorrect_count,
        training_attempts_count,
        training_correct_count,
        metadata,
        created_at::text,
        updated_at::text,
        last_incorrect_at::text,
        last_correct_at::text,
        last_trained_at::text,
        mastered_at::text
    `,
    [mistakeId, userId, nextCorrectCount, nextState, isCorrect],
  )) as UserMistakeRow[];

  return rows[0] ? mapUserMistake(rows[0]) : null;
}

export async function trackUserMistake(userId: string, payload: TrackMistakePayload) {
  await ensureUserMistakesSchema();
  const sql = getSql();
  const questionKey = payload.questionKey.trim();

  if (!questionKey) {
    throw new Error("questionKey مطلوب لتسجيل الخطأ.");
  }

  if (payload.outcome === "incorrect") {
    const rows = (await sql.query(
      `
        insert into app_user_mistakes (
          user_id,
          question_key,
          question_id,
          section,
          source_bank,
          question_type_label,
          question_text,
          question_href,
          mastery_state,
          incorrect_count,
          metadata,
          last_incorrect_at
        )
        values (
          $1::uuid,
          $2,
          $3,
          $4::app_bank_section,
          $5,
          $6,
          $7,
          $8,
          'incorrect',
          1,
          $9::jsonb,
          now()
        )
        on conflict (user_id, question_key)
        do update set
          question_id = coalesce(excluded.question_id, app_user_mistakes.question_id),
          section = excluded.section,
          source_bank = excluded.source_bank,
          question_type_label = excluded.question_type_label,
          question_text = excluded.question_text,
          question_href = excluded.question_href,
          metadata = excluded.metadata,
          mastery_state = 'incorrect',
          incorrect_count = greatest(app_user_mistakes.incorrect_count, 1) + 1,
          correct_count = 0,
          mastered_at = null,
          last_incorrect_at = now(),
          updated_at = now()
        returning
          id,
          question_key,
          question_id,
          section,
          source_bank,
          question_type_label,
          question_text,
          question_href,
          correct_count,
          removal_threshold,
          mastery_state,
          incorrect_count,
          training_attempts_count,
          training_correct_count,
          metadata,
          created_at::text,
          updated_at::text,
          last_incorrect_at::text,
          last_correct_at::text,
          last_trained_at::text,
          mastered_at::text
      `,
      [
        userId,
        questionKey,
        payload.questionId ?? null,
        payload.section,
        payload.sourceBank,
        payload.questionTypeLabel,
        payload.questionText,
        payload.questionHref ?? null,
        JSON.stringify(payload.metadata ?? {}),
      ],
    )) as UserMistakeRow[];

    return {
      status: "saved" as const,
      item: rows[0] ? mapUserMistake(rows[0]) : null,
    };
  }

  const existing = await fetchMistakeByKey(userId, questionKey);

  if (!existing) {
    return {
      status: "ignored" as const,
      item: null,
    };
  }

  const nextCorrectCount = existing.correct_count + 1;
  const nextState: MistakeMasteryState =
    nextCorrectCount >= existing.removal_threshold ? "mastered" : "training";

  const updatedRows = (await sql.query(
    `
      update app_user_mistakes
      set
        correct_count = $3,
        mastery_state = $4,
        last_correct_at = now(),
        mastered_at = case
          when $4 = 'mastered' then coalesce(mastered_at, now())
          else null
        end,
        updated_at = now()
      where id = $1
        and user_id = $2::uuid
      returning
        id,
        question_key,
        question_id,
        section,
        source_bank,
        question_type_label,
        question_text,
        question_href,
        correct_count,
        removal_threshold,
        mastery_state,
        incorrect_count,
        training_attempts_count,
        training_correct_count,
        metadata,
        created_at::text,
        updated_at::text,
        last_incorrect_at::text,
        last_correct_at::text,
        last_trained_at::text,
        mastered_at::text
    `,
    [existing.id, userId, nextCorrectCount, nextState],
  )) as UserMistakeRow[];

  return {
    status: nextState === "mastered" ? ("mastered" as const) : ("updated" as const),
    item: updatedRows[0] ? mapUserMistake(updatedRows[0]) : null,
  };
}
