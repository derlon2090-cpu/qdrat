import { readFile } from "node:fs/promises";
import path from "node:path";

export const READING_DOCUMENT_SOURCE_SLUG = "bank-4-reading-lamp-2";
export const READING_DOCUMENT_SOURCE_FILE = "bank-4-reading-lamp-2.pdf";

export type DocumentReadingChoice = {
  key: string;
  text: string;
  isCorrect: boolean;
  sortOrder: number;
};

export type DocumentReadingQuestion = {
  id: string;
  order: number;
  text: string;
  explanation: string | null;
  correctAnswer: string | null;
  correctChoiceKey: string | null;
  answerSource: string | null;
  answerConfidence: number;
  needsReview: boolean;
  choices: DocumentReadingChoice[];
};

export type DocumentReadingPassage = {
  id: number;
  source: string;
  title: string;
  pieceNumber: number | null;
  passage: string;
  difficulty: string | null;
  rawPageFrom: number | null;
  rawPageTo: number | null;
  parsingConfidence: number;
  needsReview: boolean;
  questions: DocumentReadingQuestion[];
};

type NormalizedReadingPayload = {
  source?: {
    title?: string;
    fileName?: string;
  };
  passages?: Array<{
    pieceNumber?: number | null;
    pieceTitle?: string | null;
    title?: string | null;
    passageText: string;
    difficulty?: string | null;
    rawPageFrom?: number | null;
    rawPageTo?: number | null;
    parsingConfidence?: number | null;
    needsReview?: boolean;
    questions?: Array<{
      questionOrder?: number | null;
      questionText: string;
      explanation?: string | null;
      answerSource?: string | null;
      answerConfidence?: number | null;
      needsReview?: boolean;
      options?: Array<{
        optionKey?: string | null;
        optionText: string;
        isCorrect?: boolean;
        displayOrder?: number | null;
      }>;
    }>;
  }>;
};

let cachedReadingPassages: Promise<DocumentReadingPassage[]> | null = null;

function getNormalizedReadingPath() {
  return path.join(
    process.cwd(),
    "data",
    "parsed",
    `${READING_DOCUMENT_SOURCE_SLUG}.normalized.json`,
  );
}

function resolvePassageTitle(
  pieceTitle: string | null | undefined,
  title: string | null | undefined,
  pieceNumber: number | null | undefined,
  fallbackIndex: number,
) {
  const trimmedPieceTitle = pieceTitle?.trim();
  if (trimmedPieceTitle) return trimmedPieceTitle;

  const trimmedTitle = title?.trim();
  if (trimmedTitle) return trimmedTitle;

  if (pieceNumber) return `قطعة ${pieceNumber}`;
  return `قطعة ${fallbackIndex}`;
}

async function loadDocumentReadingPassages() {
  const filePath = getNormalizedReadingPath();

  try {
    const raw = await readFile(filePath, "utf8");
    const payload = JSON.parse(raw) as NormalizedReadingPayload;
    const sourceName =
      payload.source?.fileName?.trim() || payload.source?.title?.trim() || READING_DOCUMENT_SOURCE_FILE;

    return (payload.passages ?? []).map((passage, passageIndex) => {
      const id = passageIndex + 1;
      const title = resolvePassageTitle(
        passage.pieceTitle,
        passage.title,
        passage.pieceNumber ?? null,
        id,
      );

      const questions = (passage.questions ?? []).map((question, questionIndex) => {
        const orderedChoices = [...(question.options ?? [])]
          .sort((left, right) => (left.displayOrder ?? 0) - (right.displayOrder ?? 0))
          .map((choice, choiceIndex) => ({
            key: choice.optionKey?.trim() || ["A", "B", "C", "D"][choiceIndex] || String(choiceIndex + 1),
            text: choice.optionText,
            isCorrect: Boolean(choice.isCorrect),
            sortOrder: choice.displayOrder ?? choiceIndex + 1,
          }));

        const correctChoice = orderedChoices.find((choice) => choice.isCorrect) ?? null;

        return {
          id: `${id}-q-${question.questionOrder ?? questionIndex + 1}`,
          order: question.questionOrder ?? questionIndex + 1,
          text: question.questionText,
          explanation: question.explanation ?? null,
          correctAnswer: correctChoice?.text ?? null,
          correctChoiceKey: correctChoice?.key ?? null,
          answerSource: question.answerSource ?? null,
          answerConfidence: Number(question.answerConfidence ?? 0),
          needsReview: Boolean(question.needsReview),
          choices: orderedChoices,
        } satisfies DocumentReadingQuestion;
      });

      return {
        id,
        source: sourceName,
        title,
        pieceNumber: passage.pieceNumber ?? null,
        passage: passage.passageText,
        difficulty: passage.difficulty ?? null,
        rawPageFrom: passage.rawPageFrom ?? null,
        rawPageTo: passage.rawPageTo ?? null,
        parsingConfidence: Number(passage.parsingConfidence ?? 0),
        needsReview: Boolean(passage.needsReview),
        questions,
      } satisfies DocumentReadingPassage;
    });
  } catch {
    return [];
  }
}

export async function getDocumentReadingPassages() {
  if (!cachedReadingPassages) {
    cachedReadingPassages = loadDocumentReadingPassages();
  }

  return cachedReadingPassages;
}

export async function getDocumentReadingPassageById(passageId: number) {
  const passages = await getDocumentReadingPassages();
  return passages.find((passage) => passage.id === passageId) ?? null;
}
