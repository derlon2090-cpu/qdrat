import { getSqlClient } from "@/lib/db";

export type MistakeSection = "verbal" | "quantitative";
export type MistakeOutcome = "correct" | "incorrect";

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
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
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
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
};

function getSql() {
  return getSqlClient();
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
    metadata: row.metadata ?? {},
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export async function listUserMistakes(userId: string) {
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
        metadata,
        created_at::text,
        updated_at::text
      from app_user_mistakes
      where user_id = $1::uuid
      order by updated_at desc, created_at desc
    `,
    [userId],
  )) as UserMistakeRow[];

  return rows.map(mapUserMistake);
}

export async function removeUserMistake(userId: string, mistakeId: number) {
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

export async function trackUserMistake(userId: string, payload: TrackMistakePayload) {
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
          metadata
        )
        values ($1::uuid, $2, $3, $4::app_bank_section, $5, $6, $7, $8, $9::jsonb)
        on conflict (user_id, question_key)
        do update set
          question_id = coalesce(excluded.question_id, app_user_mistakes.question_id),
          section = excluded.section,
          source_bank = excluded.source_bank,
          question_type_label = excluded.question_type_label,
          question_text = excluded.question_text,
          question_href = excluded.question_href,
          metadata = excluded.metadata,
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
          metadata,
          created_at::text,
          updated_at::text
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

  const existingRows = (await sql.query(
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
        metadata,
        created_at::text,
        updated_at::text
      from app_user_mistakes
      where user_id = $1::uuid
        and question_key = $2
      limit 1
    `,
    [userId, questionKey],
  )) as UserMistakeRow[];

  const existing = existingRows[0];
  if (!existing) {
    return {
      status: "ignored" as const,
      item: null,
    };
  }

  const nextCorrectCount = existing.correct_count + 1;
  if (nextCorrectCount >= existing.removal_threshold) {
    await sql.query(
      `
        delete from app_user_mistakes
        where id = $1
          and user_id = $2::uuid
      `,
      [existing.id, userId],
    );

    return {
      status: "removed" as const,
      item: null,
      removedId: existing.id,
    };
  }

  const updatedRows = (await sql.query(
    `
      update app_user_mistakes
      set
        correct_count = $3,
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
        metadata,
        created_at::text,
        updated_at::text
    `,
    [existing.id, userId, nextCorrectCount],
  )) as UserMistakeRow[];

  return {
    status: "updated" as const,
    item: updatedRows[0] ? mapUserMistake(updatedRows[0]) : null,
  };
}
