import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const inputPath = path.join(projectRoot, "data", "raw", "bank-4-5-session-message.txt");
const outputPath = path.join(projectRoot, "src", "data", "verbal-mixed-bank45.ts");
const unresolvedPath = path.join(projectRoot, "data", "parsed", "bank45-session-unresolved.json");

const SCORE_REGEX = /\b([01])\/1\b/g;
const MARKER_REGEX = /\[\d{2}\/\d{2}\/\d{2}\s+\d{2}:\d{2}\s+[^\]]+\]\s+W:/g;
const REPLACEMENT_CHAR = /\uFFFD/g;

const EXPLICIT_ANSWER_LABEL = "الإجابة الصحيحة";
const ANALOGY_ID = "analogy";
const SENTENCE_COMPLETION_ID = "sentence_completion";
const CONTEXTUAL_ERROR_ID = "contextual_error";
const ODD_WORD_ID = "odd_word";
const SHORT_READING_ID = "short_reading";
const MANUAL_OVERRIDES = [
  {
    promptIncludes: "هواء : إنسان",
    correctAnswer: "رضيع : حليب",
  },
  {
    promptIncludes: "خطبة : ذكر",
    correctAnswer: "مقال : وعظ",
  },
  {
    promptIncludes: "غالباً ما يكون ......... حليف الذين .............بجرأة",
    correctAnswer: "النجاح -يعملون",
  },
  {
    promptIncludes: "نحلة : عسل",
    correctAnswer: "لبن :زبد",
  },
  {
    promptIncludes: "سهم : رمي",
    correctAnswer: "عصا : ضرب",
  },
  {
    promptIncludes: "نطفة : علقة",
    correctAnswer: "غيوم : مطر",
  },
  {
    promptIncludes: "عربي: انجليزي",
    correctAnswer: "قمح :ذرة",
  },
  {
    promptIncludes: "أكثر الناس سعادة هم الذين ينظرون إلى ما",
    correctAnswer: "يملكونه - يملكه الآخرون",
  },
  {
    promptIncludes: "عقل: تفكير",
    correctAnswer: "عين: إبصار",
  },
];

function readInputText() {
  return fs.readFileSync(inputPath, "utf8");
}

function normalizeText(input) {
  return input
    .replace(/\r/g, " ")
    .replace(/\n/g, " ")
    .replace(MARKER_REGEX, " ")
    .replace(REPLACEMENT_CHAR, " § ")
    .replace(/\s+/g, " ")
    .replace(/§\s+§/g, " § ")
    .trim();
}

function cleanupSegment(input) {
  return input
    .replace(/§/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^[\s:.-]+/g, "")
    .replace(/[\s:.-]+$/g, "")
    .replace(/\b(\S+)(?:\s+\1\b)+/g, "$1")
    .trim();
}

function stripBoilerplate(input) {
  return cleanupSegment(
    input
      .replace(/نبغا في ملف الطالب[\s\S]*?10 الاف xp[^§]*/g, " ")
      .replace(/المراجعة النهائية على البنك\s+(الرابع|الخامس)\(الاختبار\s+[^)]+\)\s*/g, " ")
      .replace(/إجمالي النقاط\d+\/\d+\s*/g, " ")
      .replace(/0 من إجمالي 0 نقطة\s*/g, " ")
      .replace(/0 من إجمالي 1 نقطة\s*/g, " ")
      .replace(/اسم الطالب:\*?\s*\S+\s*/g, " ")
      .replace(/كلمة المرور:\*?\s*\S+\s*/g, " ")
      .replace(/···\/1\s*/g, " ")
      .replace(/اقسم انني مشترك بدورة محوسب أغسطس الجديدة \(2025\) للأستاذ : إيهاب عبد العظيم\s*/g, " ")
      .replace(/انني مشترك بدورة محوسب أغسطس الجديدة \(2025\) للأستاذ : إيهاب عبد العظيم\s*/g, " ")
      .replace(/للأستاذ : إيهاب عبد العظيم\s*/g, " ")
      .replace(/ليس هناك أي إجابات صحيحة\s*/g, " ")
      .replace(/قسم بلا عنوان\s*/g, " ")
      .replace(/\d+\s+من إجمالي\s+\d+\s+نقطة\s*/g, " ")
      .replace(/من ذاكرة المختبرين\s*/g, " ")
      .replace(/صيغة أخرى من الانترنت\s*/g, " ")
      .replace(/صيغة أخرى\s*/g, " ")
      .replace(/نص آخر\s*/g, " ")
      .replace(/\/\/+/g, " ")
      .replace(/\(\([^)]+\)\)/g, " ")
      .replace(/\([^)]{80,}\)/g, " ")
  );
}

function looksLikeExamHeader(input) {
  return /المراجعة النهائية على البنك|إجمالي النقاط|اسم الطالب|كلمة المرور|قسم بلا عنوان/.test(input);
}

function splitByDelimiter(text) {
  return text
    .split("§")
    .map((segment) => stripBoilerplate(segment))
    .filter(Boolean)
    .filter((segment) => !looksLikeExamHeader(segment));
}

function hasReadingCue(input) {
  return [
    "النص",
    "القطعة",
    "يفهم من",
    "وفقا",
    "أنسب عنوان",
    "العلاقة",
    "معنى",
    "الضمير",
    "ما الذي",
    "ماذا",
    "كيف",
    "لماذا",
    "يدل",
    "العنوان",
    "الفقرة",
    "من خلال",
  ].some((keyword) => input.includes(keyword));
}

function hasContextualCue(input) {
  return [
    "الكلمة التي",
    "الغلط",
    "الخطأ",
    "في القضاء",
    "لا يزهدنك",
    "الكلمة التي يمكن حذفها",
    "أي الكلمات",
    "أي الآتي",
  ].some((keyword) => input.includes(keyword));
}

function hasBlanks(input) {
  const compact = input.replace(/\s+/g, "");
  return (
    compact.includes("...") ||
    compact.includes(".....") ||
    compact.includes(".......") ||
    compact.includes(".........") ||
    compact.includes("……") ||
    compact.includes("………")
  );
}

function hasAnalogyShape(input) {
  return /\S+\s*:\s*\S+/.test(input) || /\S+\s*-\s*\S+/.test(input);
}

function countWords(input) {
  return cleanupSegment(input).split(/\s+/).filter(Boolean).length;
}

function shouldAttachContext(pendingContext, promptPart) {
  if (!pendingContext || !promptPart) return false;
  if (!hasReadingCue(promptPart)) return false;
  return countWords(pendingContext) >= 8;
}

function classifyQuestion(prompt, optionsText, correctAnswer) {
  const normalized = prompt.replace(/\s+/g, " ").trim();
  const normalizedOptions = cleanupSegment(optionsText);
  const normalizedAnswer = cleanupSegment(correctAnswer);

  if (
    normalized.includes("ما الكلمة المختلفة") ||
    normalized.includes("المفردة الشاذة")
  ) {
    return ODD_WORD_ID;
  }

  if (hasReadingCue(normalized)) {
    return SHORT_READING_ID;
  }

  if (
    hasAnalogyShape(normalized) ||
    (hasAnalogyShape(normalizedAnswer) && !hasReadingCue(normalized) && countWords(normalized) <= 10) ||
    (hasAnalogyShape(normalizedOptions) && countWords(normalized) <= 8)
  ) {
    return ANALOGY_ID;
  }

  if (hasBlanks(normalized)) {
    return SENTENCE_COMPLETION_ID;
  }

  if (hasContextualCue(normalized)) {
    return CONTEXTUAL_ERROR_ID;
  }

  if (countWords(normalizedAnswer) <= 4 && countWords(normalized) >= 5) {
    return CONTEXTUAL_ERROR_ID;
  }

  if (countWords(normalized) <= 6) {
    return ODD_WORD_ID;
  }

  return SENTENCE_COMPLETION_ID;
}

function refineCategory(categoryId, prompt, optionsText, correctAnswer) {
  const normalizedPrompt = cleanupSegment(prompt);
  const normalizedAnswer = cleanupSegment(correctAnswer);

  if (!hasReadingCue(normalizedPrompt) && hasAnalogyShape(normalizedAnswer) && countWords(normalizedPrompt) <= 10) {
    return ANALOGY_ID;
  }

  if (
    categoryId === SENTENCE_COMPLETION_ID &&
    !hasBlanks(normalizedPrompt) &&
    !hasReadingCue(normalizedPrompt) &&
    !hasAnalogyShape(normalizedAnswer) &&
    countWords(normalizedAnswer) <= 4 &&
    countWords(normalizedPrompt) >= 5
  ) {
    return CONTEXTUAL_ERROR_ID;
  }

  return categoryId;
}

function splitAnalogyOptions(optionsText) {
  const normalized = optionsText
    .replace(/\s*:\s*/g, " : ")
    .replace(/\s*-\s*/g, " - ")
    .replace(/\s+/g, " ")
    .trim();

  const matches = normalized.match(/[^:]+?\s:\s[^:]+?(?=(?:\s+[^:]+?\s:\s)|$)/g);
  if (matches && matches.length >= 2) {
    return matches.map((item) => cleanupSegment(item));
  }

  const dashMatches = normalized.match(/[^-]+?\s-\s[^-]+?(?=(?:\s+[^-]+?\s-\s)|$)/g);
  if (dashMatches && dashMatches.length >= 2) {
    return dashMatches.map((item) => cleanupSegment(item));
  }

  return normalized
    .split(/\s{2,}/)
    .map((item) => cleanupSegment(item))
    .filter(Boolean);
}

function splitGenericOptions(optionsText, correctAnswer) {
  const normalized = cleanupSegment(optionsText);
  if (!normalized) return [];

  if (normalized.includes(" - ") && normalized.split(" - ").length >= 2 && !normalized.includes(" : ")) {
    const chunks = normalized
      .split(/\s{2,}/)
      .map((item) => cleanupSegment(item))
      .filter(Boolean);
    if (chunks.length >= 2) {
      return chunks;
    }
  }

  if (correctAnswer && normalized.includes(correctAnswer)) {
    const escaped = escapeRegExp(correctAnswer);
    const replaced = normalized.replace(new RegExp(escaped, "g"), ` || ${correctAnswer} || `);
    const chunks = replaced
      .split("||")
      .map((item) => cleanupSegment(item))
      .filter(Boolean);
    if (chunks.length >= 2) {
      return uniqueItems(chunks);
    }
  }

  const byDoubleSpaces = normalized
    .split(/\s{2,}/)
    .map((item) => cleanupSegment(item))
    .filter(Boolean);
  if (byDoubleSpaces.length >= 2) {
    return uniqueItems(byDoubleSpaces);
  }

  return uniqueItems([normalized]);
}

function splitOptionsByCategory(categoryId, optionsText, correctAnswer) {
  if (categoryId === ANALOGY_ID) {
    return splitAnalogyOptions(optionsText);
  }
  return splitGenericOptions(optionsText, correctAnswer);
}

function uniqueItems(items) {
  return [...new Set(items.map((item) => cleanupSegment(item)).filter(Boolean))];
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function deriveSource(prompt) {
  if (prompt.includes("البنك الخامس")) {
    return "المراجعة النهائية على البنك الخامس";
  }
  return "المراجعة النهائية على البنك الرابع والخامس";
}

function findManualOverride(prompt) {
  return (
    MANUAL_OVERRIDES.find((item) => cleanupSegment(prompt).includes(item.promptIncludes))?.correctAnswer ??
    null
  );
}

function makeExplanation(categoryId, prompt, correctAnswer) {
  switch (categoryId) {
    case ANALOGY_ID:
      return `الإجابة الصحيحة هي "${correctAnswer}" لأنها تحافظ على نفس العلاقة اللفظية الموجودة في طرفي السؤال.`;
    case SENTENCE_COMPLETION_ID:
      return `الإجابة الصحيحة هي "${correctAnswer}" لأنها الأنسب لإكمال المعنى والمحافظة على ترابط الجملة.`;
    case CONTEXTUAL_ERROR_ID:
      return `الإجابة الصحيحة هي "${correctAnswer}" لأنها الكلمة أو العبارة غير المنسجمة مع المعنى الصحيح في السياق.`;
    case ODD_WORD_ID:
      return `الإجابة الصحيحة هي "${correctAnswer}" لأنها تختلف دلاليًا عن بقية عناصر المجموعة.`;
    default:
      return `الإجابة الصحيحة هي "${correctAnswer}" لأنها توافق معنى النص أو السؤال المباشر الوارد في القطعة.`;
  }
}

function findExplicitAnswer(segment) {
  const labelIndex = segment.indexOf(EXPLICIT_ANSWER_LABEL);
  if (labelIndex === -1) return null;
  const remainder = cleanupSegment(segment.slice(labelIndex + EXPLICIT_ANSWER_LABEL.length));
  if (!remainder) return null;
  return remainder;
}

function parseQuestionSegment(segment, pendingContext) {
  const scoreMatches = [...segment.matchAll(SCORE_REGEX)];
  if (scoreMatches.length === 0) {
    return { question: null, pendingContext: appendContext(pendingContext, segment) };
  }

  const scoreMatch = scoreMatches[scoreMatches.length - 1];
  const scoreIndex = scoreMatch.index ?? 0;

  const promptPart = stripBoilerplate(segment.slice(0, scoreIndex));
  const afterScore = cleanupSegment(segment.slice(scoreIndex + scoreMatch[0].length));

  let prompt = shouldAttachContext(pendingContext, promptPart)
    ? cleanupSegment(`${pendingContext} ${promptPart}`)
    : promptPart;
  let categoryId = classifyQuestion(prompt, afterScore, "");
  let options = splitOptionsByCategory(categoryId, afterScore, "");

  if (!prompt || !afterScore) {
    return { question: null, pendingContext: "" };
  }

  const question = {
    prompt,
    categoryId,
    optionsText: afterScore,
    options,
    correctAnswer: "",
    explicitScore: scoreMatch[1],
    source: deriveSource(prompt),
  };

  return { question, pendingContext: "" };
}

function appendContext(current, addition) {
  const cleaned = stripBoilerplate(addition);
  if (!cleaned) return current;
  if (!current) return cleaned;
  return cleanupSegment(`${current} ${cleaned}`);
}

function finalizeQuestion(question, answerSegment, index) {
  const explicitAnswer = findExplicitAnswer(answerSegment);
  if (!explicitAnswer) {
    return null;
  }

  const correctAnswer = cleanupSegment(explicitAnswer);
  if (!correctAnswer) {
    return null;
  }

  const categoryId = refineCategory(
    classifyQuestion(question.prompt, question.optionsText, correctAnswer),
    question.prompt,
    question.optionsText,
    correctAnswer,
  );
  const options = uniqueItems([
    ...question.options,
    ...splitOptionsByCategory(categoryId, question.optionsText, correctAnswer),
    correctAnswer,
  ]);

  return {
    id: `bank45-session-${String(index + 1).padStart(4, "0")}`,
    categoryId,
    prompt: question.prompt,
    options,
    correctAnswer,
    explanation: makeExplanation(categoryId, question.prompt, correctAnswer),
    source: question.source,
  };
}

function finalizeImplicitQuestion(question, index) {
  const inferredOptions = splitOptionsByCategory(question.categoryId, question.optionsText, "");
  let correctAnswer = findManualOverride(question.prompt);

  if (!correctAnswer) {
    if (inferredOptions.length === 1) {
      correctAnswer = cleanupSegment(inferredOptions[0]);
    } else if (question.explicitScore === "1") {
      return null;
    } else {
      return null;
    }
  }

  if (!correctAnswer) {
    return null;
  }

  const categoryId = refineCategory(
    classifyQuestion(question.prompt, question.optionsText, correctAnswer),
    question.prompt,
    question.optionsText,
    correctAnswer,
  );

  return {
    id: `bank45-session-${String(index + 1).padStart(4, "0")}`,
    categoryId,
    prompt: question.prompt,
    options: uniqueItems([...inferredOptions, correctAnswer]),
    correctAnswer,
    explanation: makeExplanation(categoryId, question.prompt, correctAnswer),
    source: question.source,
  };
}

function parseQuestions(text) {
  const segments = splitByDelimiter(normalizeText(text));
  const questions = [];
  const unresolved = [];
  let pendingQuestion = null;
  let pendingContext = "";

  for (const segment of segments) {
    if (!segment) continue;

    if (segment.includes(EXPLICIT_ANSWER_LABEL) && pendingQuestion) {
      const finalized = finalizeQuestion(pendingQuestion, segment, questions.length);
      if (finalized) {
        questions.push(finalized);
      } else {
        unresolved.push({
          prompt: pendingQuestion.prompt,
          optionsText: pendingQuestion.optionsText,
          score: pendingQuestion.explicitScore,
          reason: "explicit-answer-parse-failed",
        });
      }
      pendingQuestion = null;
      continue;
    }

    const parsed = parseQuestionSegment(segment, pendingContext);
    pendingContext = parsed.pendingContext;

    if (parsed.question) {
      if (pendingQuestion) {
        const implicit = finalizeImplicitQuestion(pendingQuestion, questions.length);
        if (implicit) {
          questions.push(implicit);
        } else {
          unresolved.push({
            prompt: pendingQuestion.prompt,
            optionsText: pendingQuestion.optionsText,
            score: pendingQuestion.explicitScore,
            reason: "implicit-answer-missing",
          });
        }
      }
      pendingQuestion = parsed.question;
      continue;
    }

    pendingContext = appendContext(pendingContext, segment);
  }

  if (pendingQuestion) {
    const implicit = finalizeImplicitQuestion(pendingQuestion, questions.length);
    if (implicit) {
      questions.push(implicit);
    } else {
      unresolved.push({
        prompt: pendingQuestion.prompt,
        optionsText: pendingQuestion.optionsText,
        score: pendingQuestion.explicitScore,
        reason: "implicit-answer-missing",
      });
    }
  }

  return { questions, unresolved };
}

function groupByCategory(questions) {
  return questions.reduce(
    (accumulator, question) => {
      accumulator[question.categoryId] = (accumulator[question.categoryId] ?? 0) + 1;
      return accumulator;
    },
    {
      [ANALOGY_ID]: 0,
      [SENTENCE_COMPLETION_ID]: 0,
      [CONTEXTUAL_ERROR_ID]: 0,
      [ODD_WORD_ID]: 0,
      [SHORT_READING_ID]: 0,
    },
  );
}

function renderQuestion(question) {
  const options = question.options.map((option) => `      ${JSON.stringify(option)},`).join("\n");
  return `  {\n    id: ${JSON.stringify(question.id)},\n    categoryId: ${JSON.stringify(question.categoryId)},\n    prompt: ${JSON.stringify(question.prompt)},\n    options: [\n${options}\n    ],\n    correctAnswer: ${JSON.stringify(question.correctAnswer)},\n    explanation: ${JSON.stringify(question.explanation)},\n    source: ${JSON.stringify(question.source)},\n  }`;
}

function renderOutput(questions, stats) {
  const renderedQuestions = questions.map(renderQuestion).join(",\n");
  return `import type { VerbalPracticeQuestion } from "./verbal-mixed-bank";\n\n// Generated from the user-provided bank 4/5 review message stored in data/raw/bank-4-5-session-message.txt.\nexport const bank45SessionQuestions: VerbalPracticeQuestion[] = [\n${renderedQuestions}\n];\n\nexport const bank45SessionQuestionStats = ${JSON.stringify(stats, null, 2)} as const;\n`;
}

function main() {
  const text = readInputText();
  const { questions, unresolved } = parseQuestions(text);
  const stats = {
    total: questions.length,
    byCategory: groupByCategory(questions),
    unresolved: unresolved.length,
  };

  fs.writeFileSync(outputPath, renderOutput(questions, stats), "utf8");
  fs.writeFileSync(unresolvedPath, JSON.stringify(unresolved, null, 2), "utf8");

  console.log(JSON.stringify(stats, null, 2));
}

main();
