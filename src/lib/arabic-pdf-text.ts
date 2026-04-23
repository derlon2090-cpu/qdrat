import arabicPersianReshaper from "arabic-persian-reshaper";

const HIDDEN_BIDI_MARKS = /[\u061c\u200b-\u200f\u202a-\u202e\u2066-\u2069\ufeff]/g;
const ARABIC_LETTER = /[\u0621-\u064a\u0671-\u06d3\u06fa-\u06ff]/;
const ARABIC_LETTER_GLOBAL = /[\u0621-\u064a\u0671-\u06d3\u06fa-\u06ff]/g;
const LATIN_LETTER_GLOBAL = /[A-Za-z]/g;
const SPACED_ARABIC_WORD =
  /(^|[\s([{،؛:؟"'`\-])((?:[\u0621-\u064a]\s+){2,}[\u0621-\u064a])(?=$|[\s)\]},.،؛:؟!"'`\-])/g;
const arabicShaper = arabicPersianReshaper.ArabicShaper;
const MIRRORED_PUNCTUATION = new Map<string, string>([
  ["(", ")"],
  [")", "("],
  ["[", "]"],
  ["]", "["],
  ["{", "}"],
  ["}", "{"],
  ["<", ">"],
  [">", "<"],
  ["«", "»"],
  ["»", "«"],
]);

function getEnvFlag(name: string) {
  if (typeof process === "undefined" || !process.env) {
    return "";
  }

  return process.env[name] ?? "";
}

function hasArabicText(value: string) {
  return ARABIC_LETTER.test(value);
}

function countMatches(value: string, pattern: RegExp) {
  return value.match(pattern)?.length ?? 0;
}

function reverseByCodePoint(value: string) {
  return Array.from(value).reverse().join("");
}

function mirrorReversedPunctuation(value: string) {
  return Array.from(value)
    .map((character) => MIRRORED_PUNCTUATION.get(character) ?? character)
    .join("");
}

function joinSpacedArabicLetters(value: string) {
  return value.replace(SPACED_ARABIC_WORD, (_match, prefix: string, word: string) => {
    return `${prefix}${word.replace(/\s+/g, "")}`;
  });
}

function scoreArabicDirection(value: string) {
  const words = value.split(/\s+/).filter((word) => hasArabicText(word));
  let score = 0;

  for (const word of words) {
    if (/^(?:و?ال|لل|بال|كال|فال|وال)/.test(word)) {
      score += 3;
    }

    if (/^و[\u0621-\u064a]{2,}/.test(word)) {
      score += 1;
    }

    if (/[ةهىيانا]$/.test(word)) {
      score += 1;
    }

    if (/[ةىًٌٍَُِّْ]$/.test(word)) {
      score += 1;
    }

    if (/^[ةىًٌٍَُِّْ]/.test(word)) {
      score -= 3;
    }

    if (/[اأإآ]ل$/.test(word)) {
      score -= 2;
    }

    if (/ال|لا|الأ|الإ|الآ/.test(word)) {
      score += 1;
    }
  }

  return score;
}

function scoreArabicReadability(value: string) {
  let score = scoreArabicDirection(value);

  if (/(?:[\u0621-\u064a]\s+){2,}[\u0621-\u064a]/.test(value)) {
    score -= 8;
  }

  if (/[\u0621-\u064a]{2,}\s+[\u0621-\u064a]{2,}/.test(value)) {
    score += 2;
  }

  if (/^[)\]}>»]/.test(value) || /[(\[{<«]$/.test(value)) {
    score -= 3;
  }

  if (/^[\u0621-\u064a]/.test(value)) {
    score += 1;
  }

  if (/[اأإآ][\u0621-\u064a]{1,}/.test(value)) {
    score += 1;
  }

  return score;
}

function shouldTryReverseArabicLine(value: string) {
  const arabicCount = countMatches(value, ARABIC_LETTER_GLOBAL);
  const latinCount = countMatches(value, LATIN_LETTER_GLOBAL);

  return arabicCount >= 4 && arabicCount >= latinCount * 2;
}

function createArabicLineCandidates(line: string) {
  const joinedLine = joinSpacedArabicLetters(line);
  const reversedLine = joinSpacedArabicLetters(mirrorReversedPunctuation(reverseByCodePoint(joinedLine)));
  return [joinedLine, reversedLine];
}

function normalizeArabicPdfLine(line: string) {
  const joinedLine = joinSpacedArabicLetters(line);

  if (!shouldTryReverseArabicLine(joinedLine)) {
    return joinedLine;
  }

  const candidates = createArabicLineCandidates(joinedLine);
  let bestCandidate = joinedLine;
  let bestScore = scoreArabicReadability(joinedLine);

  for (const candidate of candidates) {
    const nextScore = scoreArabicReadability(candidate);
    if (nextScore > bestScore) {
      bestCandidate = candidate;
      bestScore = nextScore;
    }
  }

  return bestCandidate;
}

export function normalizeExtractedArabicPdfText(value: string) {
  if (!value) {
    return "";
  }

  return value
    .normalize("NFKC")
    .replace(HIDDEN_BIDI_MARKS, "")
    .replace(/\u0640/g, "")
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((line) => normalizeArabicPdfLine(line).replace(/[ \t]{2,}/g, " ").trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export function shouldDebugArabicPdfText() {
  return getEnvFlag("PDF_TEXT_DEBUG") === "1" || getEnvFlag("NEXT_PUBLIC_PDF_TEXT_DEBUG") === "1";
}

export function debugArabicPdfTextSample(label: string, rawText: string) {
  if (!shouldDebugArabicPdfText()) {
    return;
  }

  const normalizedText = normalizeExtractedArabicPdfText(rawText);
  const shapedText = (() => {
    try {
      return arabicShaper.convertArabic(normalizedText);
    } catch {
      return normalizedText;
    }
  })();
  const limit = 1200;

  console.info(`[pdf-text:${label}] raw`, rawText.slice(0, limit));
  console.info(`[pdf-text:${label}] normalized`, normalizedText.slice(0, limit));
  console.info(`[pdf-text:${label}] shaped`, shapedText.slice(0, limit));
}
