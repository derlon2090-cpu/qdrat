import samplePassagesData from "../../data/verbal-passages.sample.json";

export type LocalVerbalPassageQuestion = {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanations: Record<string, string>;
};

export type LocalVerbalPassage = {
  id: string;
  slug: string;
  source: string;
  title: string;
  keywords: string[];
  pieceNumber: number;
  passage: string;
  questions: LocalVerbalPassageQuestion[];
};

type SampleQuestionRow = {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: "A" | "B" | "C" | "D";
  explanation?: string | null;
};

type SamplePassageRow = {
  title: string;
  slug: string;
  keywords?: string[];
  passage_text: string;
  questions?: SampleQuestionRow[];
};

function getCorrectAnswerText(question: SampleQuestionRow) {
  switch (question.correct_option) {
    case "A":
      return question.option_a;
    case "B":
      return question.option_b;
    case "C":
      return question.option_c;
    case "D":
    default:
      return question.option_d;
  }
}

function buildQuestionExplanations(question: SampleQuestionRow) {
  const fallbackCorrectExplanation =
    question.explanation?.trim() || "هذا هو الخيار الصحيح وفق البيانات المعتمدة لهذه القطعة.";

  const options = [
    question.option_a,
    question.option_b,
    question.option_c,
    question.option_d,
  ];

  return Object.fromEntries(
    options.map((option) => [
      option,
      option === getCorrectAnswerText(question)
        ? fallbackCorrectExplanation
        : "هذا الخيار غير صحيح وفق البيانات المعتمدة لهذه القطعة.",
    ]),
  );
}

function mapSamplePassage(row: SamplePassageRow, index: number): LocalVerbalPassage {
  return {
    id: row.slug,
    slug: row.slug,
    source: "المستند / القطع اللفظية",
    title: row.title,
    keywords: row.keywords ?? [],
    pieceNumber: index + 1,
    passage: row.passage_text,
    questions: (row.questions ?? []).map((question, questionIndex) => ({
      id: `${row.slug}-q-${questionIndex + 1}`,
      text: question.question_text,
      options: [
        question.option_a,
        question.option_b,
        question.option_c,
        question.option_d,
      ],
      correctAnswer: getCorrectAnswerText(question),
      explanations: buildQuestionExplanations(question),
    })),
  };
}

export const localVerbalPassages = (samplePassagesData as SamplePassageRow[]).map(
  mapSamplePassage,
);

export function findLocalVerbalPassageByIdOrSlug(value: string | number) {
  const normalizedValue = String(value).trim().toLowerCase();
  if (!normalizedValue) return null;

  return (
    localVerbalPassages.find(
      (passage) =>
        passage.id.toLowerCase() === normalizedValue ||
        passage.slug.toLowerCase() === normalizedValue,
    ) ?? null
  );
}
