import bank4ReadingRaw from "../../data/parsed/bank-4-reading-lamp-2.normalized.json";

import type { VerbalPracticeQuestion } from "./verbal-mixed-bank";

type ParsedOption = {
  optionKey: string;
  optionText: string;
  isCorrect: boolean;
  displayOrder: number;
};

type ParsedQuestion = {
  questionOrder: number;
  questionText: string;
  explanation: string | null;
  answerConfidence: number;
  needsReview: boolean;
  options: ParsedOption[];
};

type ParsedPassage = {
  pieceNumber: number;
  pieceTitle: string;
  parsingConfidence: number;
  needsReview: boolean;
  questions: ParsedQuestion[];
};

type ParsedDataset = {
  passages: ParsedPassage[];
};

const bank4ReadingData = bank4ReadingRaw as ParsedDataset;

function normalizeSpaces(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function collapseSingleLetterRuns(value: string) {
  const tokens = normalizeSpaces(value).split(" ");
  const merged: string[] = [];
  let buffer = "";

  for (const token of tokens) {
    if (/^[\u0621-\u064A]$/.test(token)) {
      buffer += token;
      continue;
    }

    if (buffer) {
      merged.push(buffer);
      buffer = "";
    }

    merged.push(token);
  }

  if (buffer) {
    merged.push(buffer);
  }

  return merged.join(" ");
}

function sanitizeText(value: string) {
  return collapseSingleLetterRuns(
    normalizeSpaces(value)
      .replace(/[“”]/g, '"')
      .replace(/[‘’]/g, "'")
      .replace(/\s+([،؛:؟!.,])/g, "$1")
      .replace(/([(:])\s+/g, "$1")
      .replace(/\s+([)])/g, "$1"),
  );
}

function isUsableQuestion(question: ParsedQuestion) {
  if (question.needsReview) return false;
  if (!Array.isArray(question.options) || question.options.length !== 4) return false;
  if (question.options.filter((option) => option.isCorrect).length !== 1) return false;

  const questionText = sanitizeText(question.questionText);
  if (questionText.length < 8) return false;

  return question.options.every((option) => sanitizeText(option.optionText).length >= 2);
}

function createExplanation(title: string, question: ParsedQuestion, correctAnswer: string) {
  const providedExplanation = sanitizeText(question.explanation ?? "");
  if (providedExplanation) {
    return providedExplanation;
  }

  return `الإجابة الصحيحة هي "${correctAnswer}" لأنها الأنسب وفق نص قطعة "${title}".`;
}

export const bank4ShortReadingQuestions: VerbalPracticeQuestion[] = bank4ReadingData.passages.flatMap(
  (passage) => {
    if (passage.needsReview || passage.parsingConfidence < 0.8) {
      return [];
    }

    const title = sanitizeText(passage.pieceTitle);
    if (!title || title.length < 2) {
      return [];
    }

    return passage.questions.filter(isUsableQuestion).map((question) => {
      const orderedOptions = [...question.options]
        .sort((left, right) => left.displayOrder - right.displayOrder)
        .map((option) => sanitizeText(option.optionText));
      const correctAnswer =
        orderedOptions[
          [...question.options].sort((left, right) => left.displayOrder - right.displayOrder).findIndex(
            (option) => option.isCorrect,
          )
        ] ?? orderedOptions[0];
      const prompt = sanitizeText(`في قطعة ${title}: ${question.questionText}`);

      return {
        id: `bank4-reading-${String(passage.pieceNumber).padStart(3, "0")}-${String(question.questionOrder).padStart(2, "0")}`,
        categoryId: "short_reading",
        prompt,
        options: orderedOptions,
        correctAnswer,
        explanation: createExplanation(title, question, correctAnswer),
        source: `البنك الرابع - استيعاب المقروء - قطعة ${title}`,
        keywords: [title, "البنك الرابع", "استيعاب المقروء", "فهم قصير"],
      } satisfies VerbalPracticeQuestion;
    });
  },
);
