import {
  getVerbalQuestionCategory,
  getVerbalQuestionsByCategory,
} from "@/data/verbal-mixed-bank";
import {
  findLocalVerbalPassageByIdOrSlug,
  localVerbalPassages,
} from "@/data/verbal-passages-local";
import { getSqlClient } from "@/lib/db";
import type {
  MistakeMasteryState,
  MistakeSection,
  UserMistakeRecord,
} from "@/lib/user-mistakes";

export type UserMistakeTrainingQuestion = {
  id: string;
  mistakeId: number;
  questionKey: string;
  section: MistakeSection;
  masteryState: MistakeMasteryState;
  masteryPercent: number;
  priorityScore: number;
  incorrectCount: number;
  correctCount: number;
  removalThreshold: number;
  trainingAttemptsCount: number;
  trainingCorrectCount: number;
  sourceBank: string;
  questionTypeLabel: string;
  questionText: string;
  questionHref: string | null;
  categoryId: string | null;
  categoryTitle: string | null;
  passageTitle: string | null;
  options: string[];
  correctAnswer: string;
  explanation: string;
};

export type MistakeAnalytics = {
  totalCount: number;
  activeCount: number;
  incorrectCount: number;
  trainingCount: number;
  masteredCount: number;
  masteryPercent: number;
  weakestTypeLabel: string | null;
  weakestSection: MistakeSection | null;
  weakestCount: number;
  trainableCount: number;
  trainableVerbalCount: number;
  trainableQuantitativeCount: number;
  unresolvedCount: number;
};

type DbQuestionChoiceRow = {
  question_id: number;
  question_text: string;
  explanation: string | null;
  question_type: string;
  section: MistakeSection;
  correct_choice_key: string | null;
  choice_key: string | null;
  choice_text: string | null;
  sort_order: number | null;
};

type DbQuestionSnapshot = {
  questionId: number;
  questionText: string;
  explanation: string;
  options: string[];
  correctAnswer: string;
  section: MistakeSection;
  questionType: string;
};

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

function getMetadataString(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function getMetadataNumber(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function getMetadataStringArray(metadata: Record<string, unknown>, key: string) {
  const value = metadata[key];
  if (!Array.isArray(value)) return null;

  const items = value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);

  return items.length ? items : null;
}

function parseHref(href: string | null) {
  if (!href) return null;

  try {
    return new URL(href, "https://qdrat.local");
  } catch {
    return null;
  }
}

async function loadDbQuestionSnapshots(questionIds: number[]) {
  if (!questionIds.length) {
    return new Map<number, DbQuestionSnapshot>();
  }

  const sql = getSqlClient();
  const rows = (await sql.query(
    `
      select
        q.id as question_id,
        q.question_text,
        q.explanation,
        q.question_type::text as question_type,
        q.section::text as section,
        q.correct_choice_key,
        c.choice_key,
        c.choice_text,
        c.sort_order
      from app_questions q
      left join app_question_choices c on c.question_id = q.id
      where q.id = any($1::bigint[])
      order by q.id asc, c.sort_order asc, c.id asc
    `,
    [questionIds],
  )) as DbQuestionChoiceRow[];

  const grouped = new Map<number, DbQuestionChoiceRow[]>();

  for (const row of rows) {
    const bucket = grouped.get(row.question_id) ?? [];
    bucket.push(row);
    grouped.set(row.question_id, bucket);
  }

  const snapshots = new Map<number, DbQuestionSnapshot>();

  for (const [questionId, bucket] of grouped) {
    const first = bucket[0];
    const options = bucket
      .filter((row) => row.choice_text)
      .map((row) => row.choice_text?.trim() ?? "")
      .filter(Boolean);

    const correctAnswer =
      bucket.find(
        (row) =>
          row.choice_key &&
          row.correct_choice_key &&
          row.choice_key === row.correct_choice_key &&
          row.choice_text,
      )?.choice_text?.trim() ?? "";

    if (!first?.question_text?.trim() || !options.length || !correctAnswer) {
      continue;
    }

    snapshots.set(questionId, {
      questionId,
      questionText: first.question_text.trim(),
      explanation: first.explanation?.trim() || "راجع تفسير السؤال داخل البنك الأصلي.",
      options,
      correctAnswer,
      section: first.section,
      questionType: first.question_type,
    });
  }

  return snapshots;
}

function createTrainingQuestion(
  record: UserMistakeRecord,
  input: {
    options: string[];
    correctAnswer: string;
    explanation: string;
    categoryId?: string | null;
    categoryTitle?: string | null;
    passageTitle?: string | null;
  },
): UserMistakeTrainingQuestion | null {
  const options = input.options.map((option) => option.trim()).filter(Boolean);
  const correctAnswer = input.correctAnswer.trim();

  if (!options.length || !correctAnswer || !options.includes(correctAnswer)) {
    return null;
  }

  return {
    id: `mistake-training-${record.id}`,
    mistakeId: record.id,
    questionKey: record.questionKey,
    section: record.section,
    masteryState: record.masteryState,
    masteryPercent: record.masteryPercent,
    priorityScore: record.priorityScore,
    incorrectCount: record.incorrectCount,
    correctCount: record.correctCount,
    removalThreshold: record.removalThreshold,
    trainingAttemptsCount: record.trainingAttemptsCount,
    trainingCorrectCount: record.trainingCorrectCount,
    sourceBank: record.sourceBank,
    questionTypeLabel: record.questionTypeLabel,
    questionText: record.questionText,
    questionHref: record.questionHref,
    categoryId: input.categoryId ?? null,
    categoryTitle: input.categoryTitle ?? null,
    passageTitle: input.passageTitle ?? null,
    options,
    correctAnswer,
    explanation: input.explanation.trim() || "راجع تفسير السؤال داخل البنك الأصلي.",
  };
}

function resolveFromMetadata(record: UserMistakeRecord) {
  const metadata = record.metadata ?? {};
  const options = getMetadataStringArray(metadata, "options");
  const correctAnswer = getMetadataString(metadata, "correctAnswer");

  if (!options || !correctAnswer) {
    return null;
  }

  return createTrainingQuestion(record, {
    options,
    correctAnswer,
    explanation:
      getMetadataString(metadata, "explanation") ??
      "راجع تفسير السؤال داخل البنك الأصلي.",
    categoryId: getMetadataString(metadata, "categoryId"),
    categoryTitle: getMetadataString(metadata, "categoryTitle"),
    passageTitle: getMetadataString(metadata, "passageTitle"),
  });
}

function resolveVerbalPracticeQuestion(record: UserMistakeRecord) {
  const metadata = record.metadata ?? {};
  const href = parseHref(record.questionHref);
  const categoryId =
    getMetadataString(metadata, "categoryId") ??
    href?.searchParams.get("category")?.trim() ??
    null;
  const questionId =
    getMetadataString(metadata, "questionId") ??
    href?.searchParams.get("question")?.trim() ??
    null;

  if (!categoryId || categoryId.startsWith("reading:")) {
    return null;
  }

  const questions = getVerbalQuestionsByCategory(categoryId);
  const matchedQuestion =
    questions.find((question) => question.id === questionId) ??
    questions.find(
      (question) =>
        normalizeArabic(question.prompt) === normalizeArabic(record.questionText),
    );

  if (!matchedQuestion) {
    return null;
  }

  const category = getVerbalQuestionCategory(categoryId);

  return createTrainingQuestion(record, {
    options: matchedQuestion.options,
    correctAnswer: matchedQuestion.correctAnswer,
    explanation: matchedQuestion.explanation,
    categoryId,
    categoryTitle: category.title,
  });
}

function resolveReadingQuestion(record: UserMistakeRecord) {
  const metadata = record.metadata ?? {};
  const href = parseHref(record.questionHref);
  const categoryId = getMetadataString(metadata, "categoryId");
  const passageSlug =
    getMetadataString(metadata, "passageSlug") ??
    href?.searchParams.get("passage")?.trim() ??
    (categoryId?.startsWith("reading:") ? categoryId.slice("reading:".length) : null);
  const questionId =
    getMetadataString(metadata, "questionId") ??
    href?.searchParams.get("question")?.trim() ??
    null;
  const questionOrder = getMetadataNumber(metadata, "questionOrder");
  const passageTitle =
    getMetadataString(metadata, "passageTitle") ?? null;

  const passage =
    (passageSlug ? findLocalVerbalPassageByIdOrSlug(passageSlug) : null) ??
    (passageTitle
      ? localVerbalPassages.find(
          (item) =>
            normalizeArabic(item.title) === normalizeArabic(passageTitle),
        ) ?? null
      : null);

  if (!passage) {
    return null;
  }

  const matchedQuestion =
    passage.questions.find((question) => question.id === questionId) ??
    (questionOrder != null
      ? passage.questions.find((question, index) => index + 1 === questionOrder)
      : null) ??
    passage.questions.find(
      (question) =>
        normalizeArabic(question.text) === normalizeArabic(record.questionText),
    );

  if (!matchedQuestion) {
    return null;
  }

  return createTrainingQuestion(record, {
    options: matchedQuestion.options,
    correctAnswer: matchedQuestion.correctAnswer,
    explanation:
      matchedQuestion.explanations[matchedQuestion.correctAnswer] ??
      "راجع تفسير السؤال داخل القطعة.",
    categoryId: `reading:${passage.slug}`,
    categoryTitle: "الاستيعاب المقروء",
    passageTitle: passage.title,
  });
}

function resolveFromDatabase(
  record: UserMistakeRecord,
  dbSnapshots: Map<number, DbQuestionSnapshot>,
) {
  if (!record.questionId) {
    return null;
  }

  const snapshot = dbSnapshots.get(record.questionId);
  if (!snapshot) {
    return null;
  }

  return createTrainingQuestion(record, {
    options: snapshot.options,
    correctAnswer: snapshot.correctAnswer,
    explanation: snapshot.explanation,
    categoryTitle: record.questionTypeLabel,
  });
}

export async function resolveMistakeTrainingQuestions(records: UserMistakeRecord[]) {
  const dbSnapshots = await loadDbQuestionSnapshots(
    Array.from(
      new Set(
        records
          .map((record) => record.questionId)
          .filter((value): value is number => typeof value === "number" && Number.isFinite(value)),
      ),
    ),
  );

  const questions: UserMistakeTrainingQuestion[] = [];
  let unresolvedCount = 0;

  for (const record of records) {
    const resolved =
      resolveFromMetadata(record) ??
      resolveFromDatabase(record, dbSnapshots) ??
      resolveReadingQuestion(record) ??
      resolveVerbalPracticeQuestion(record);

    if (resolved) {
      questions.push(resolved);
    } else {
      unresolvedCount += 1;
    }
  }

  return {
    questions,
    unresolvedCount,
  };
}

export function buildMistakeAnalytics(
  records: UserMistakeRecord[],
  trainingQuestions: UserMistakeTrainingQuestion[],
  unresolvedCount: number,
): MistakeAnalytics {
  const incorrectCount = records.filter(
    (record) => record.masteryState === "incorrect",
  ).length;
  const trainingCount = records.filter(
    (record) => record.masteryState === "training",
  ).length;
  const masteredCount = records.filter(
    (record) => record.masteryState === "mastered",
  ).length;

  const weakestTypeMap = new Map<string, number>();
  const weakestSectionMap = new Map<MistakeSection, number>();

  for (const record of records) {
    const typeCount = weakestTypeMap.get(record.questionTypeLabel) ?? 0;
    weakestTypeMap.set(record.questionTypeLabel, typeCount + 1);

    const sectionCount = weakestSectionMap.get(record.section) ?? 0;
    weakestSectionMap.set(record.section, sectionCount + 1);
  }

  const weakestTypeEntry = Array.from(weakestTypeMap.entries()).sort(
    (left, right) => right[1] - left[1],
  )[0];
  const weakestSectionEntry = Array.from(weakestSectionMap.entries()).sort(
    (left, right) => right[1] - left[1],
  )[0];

  const masteryPercent = records.length
    ? Math.round(
        records.reduce((sum, record) => sum + record.masteryPercent, 0) /
          records.length,
      )
    : 0;

  return {
    totalCount: records.length,
    activeCount: records.filter((record) => record.masteryState !== "mastered").length,
    incorrectCount,
    trainingCount,
    masteredCount,
    masteryPercent,
    weakestTypeLabel: weakestTypeEntry?.[0] ?? null,
    weakestSection: weakestSectionEntry?.[0] ?? null,
    weakestCount: weakestTypeEntry?.[1] ?? 0,
    trainableCount: trainingQuestions.length,
    trainableVerbalCount: trainingQuestions.filter(
      (question) => question.section === "verbal",
    ).length,
    trainableQuantitativeCount: trainingQuestions.filter(
      (question) => question.section === "quantitative",
    ).length,
    unresolvedCount,
  };
}
