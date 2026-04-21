import bank4ReadingRaw from "../../data/parsed/bank-4-reading-lamp-2.normalized.json";

import type { LocalVerbalPassage } from "./verbal-passages-local";

type ParsedOption = {
  optionText: string;
  isCorrect: boolean;
  displayOrder: number;
};

type ParsedQuestion = {
  questionOrder: number;
  questionText: string;
  explanation: string | null;
  needsReview: boolean;
  options: ParsedOption[];
};

type ParsedPassage = {
  pieceNumber: number;
  pieceTitle: string;
  passageText: string;
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

function formatParagraphMarkers(value: string) {
  return value
    .replace(/\s*\((\d+)\)\s*/g, "\n\n($1) ")
    .replace(/([اأإآء-ي])\(/g, "$1 (");
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
  return formatParagraphMarkers(
    collapseSingleLetterRuns(
      normalizeSpaces(value)
        .replace(/[â€œâ€‌]/g, '"')
        .replace(/[â€کâ€™]/g, "'")
        .replace(/\s+([طŒط›:طں!.,])/g, "$1")
        .replace(/([(:])\s+/g, "$1")
        .replace(/\s+([)])/g, "$1"),
    ),
  );
}

function isArabicWordToken(token: string) {
  return /^[\u0621-\u064A]+$/.test(token);
}

function hasSevereSpacingDamage(value: string) {
  const tokens = normalizeSpaces(value).split(" ").filter(Boolean);
  const arabicTokens = tokens.filter(isArabicWordToken);

  if (arabicTokens.length < 12) {
    return false;
  }

  const totalLength = arabicTokens.reduce((sum, token) => sum + token.length, 0);
  const averageLength = totalLength / arabicTokens.length;
  const longTokens = arabicTokens.filter((token) => token.length >= 12).length;
  const veryLongTokens = arabicTokens.filter((token) => token.length >= 16).length;
  const singleLetterTokens = arabicTokens.filter((token) => token.length === 1).length;
  const singleLetterRatio = singleLetterTokens / arabicTokens.length;

  let maxSingleLetterRun = 0;
  let currentSingleLetterRun = 0;

  for (const token of arabicTokens) {
    if (token.length === 1) {
      currentSingleLetterRun += 1;
      maxSingleLetterRun = Math.max(maxSingleLetterRun, currentSingleLetterRun);
      continue;
    }

    currentSingleLetterRun = 0;
  }

  return (
    averageLength > 8.2 ||
    longTokens / arabicTokens.length > 0.18 ||
    veryLongTokens >= 3 ||
    singleLetterRatio > 0.24 ||
    maxSingleLetterRun >= 12
  );
}

function sanitizeQuestionText(title: string, value: string) {
  const cleaned = sanitizeText(value)
    .replace(/^["']+/, "")
    .replace(/^في قطعة\s+/i, "")
    .replace(new RegExp(`^${title}\\s*:?\\s*`), "")
    .trim();

  return cleaned;
}

function isUsableQuestion(question: ParsedQuestion) {
  if (question.needsReview) return false;
  if (!Array.isArray(question.options) || question.options.length !== 4) return false;
  if (question.options.filter((option) => option.isCorrect).length !== 1) return false;
  if (hasSevereSpacingDamage(question.questionText)) return false;

  const questionText = sanitizeText(question.questionText);
  if (questionText.length < 8 || hasSevereSpacingDamage(questionText)) return false;

  return question.options.every((option) => {
    if (hasSevereSpacingDamage(option.optionText)) return false;
    const optionText = sanitizeText(option.optionText);
    return optionText.length >= 2 && !hasSevereSpacingDamage(optionText);
  });
}

function buildOptionExplanations(
  options: string[],
  correctAnswer: string,
  explanation: string,
) {
  return Object.fromEntries(
    options.map((option) => [
      option,
      option === correctAnswer
        ? explanation
        : "هذا الخيار غير صحيح وفق معنى القطعة وسياق السؤال.",
    ]),
  );
}

function makeSlug(pieceNumber: number) {
  return `bank4-reading-piece-${String(pieceNumber).padStart(3, "0")}`;
}

export const bank4ImportedPassages: LocalVerbalPassage[] = bank4ReadingData.passages.flatMap(
  (passage) => {
    if (passage.needsReview || passage.parsingConfidence < 0.8) {
      return [];
    }

    if (hasSevereSpacingDamage(passage.passageText)) {
      return [];
    }

    const title = sanitizeText(passage.pieceTitle);
    const text = sanitizeText(passage.passageText);

    if (
      !title ||
      title.length < 2 ||
      !text ||
      text.length < 60 ||
      hasSevereSpacingDamage(text)
    ) {
      return [];
    }

    const questions = passage.questions.filter(isUsableQuestion).map((question) => {
      const orderedOptions = [...question.options]
        .sort((left, right) => left.displayOrder - right.displayOrder)
        .map((option) => sanitizeText(option.optionText));
      const sortedSourceOptions = [...question.options].sort(
        (left, right) => left.displayOrder - right.displayOrder,
      );
      const correctAnswer =
        orderedOptions[sortedSourceOptions.findIndex((option) => option.isCorrect)] ??
        orderedOptions[0];
      const explanation =
        sanitizeText(question.explanation ?? "") ||
        `الإجابة الصحيحة هي "${correctAnswer}" لأنها الأنسب وفق نص قطعة "${title}".`;

      return {
        id: `bank4-passage-${String(passage.pieceNumber).padStart(3, "0")}-q-${String(question.questionOrder).padStart(2, "0")}`,
        text: sanitizeQuestionText(title, question.questionText),
        options: orderedOptions,
        correctAnswer,
        explanations: buildOptionExplanations(orderedOptions, correctAnswer, explanation),
      };
    });

    if (!questions.length) {
      return [];
    }

    return [
      {
        id: `bank4-passage-${String(passage.pieceNumber).padStart(3, "0")}`,
        slug: makeSlug(passage.pieceNumber),
        source: "البنك الرابع - استيعاب المقروء",
        title,
        keywords: [title, "البنك الرابع", "استيعاب المقروء"],
        pieceNumber: passage.pieceNumber,
        passage: text,
        questions,
      } satisfies LocalVerbalPassage,
    ];
  },
);
