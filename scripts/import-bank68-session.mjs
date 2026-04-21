import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const inputPath = path.join(projectRoot, "data", "raw", "bank-6-8-session-message.txt");
const outputPath = path.join(projectRoot, "src", "data", "verbal-mixed-bank68.ts");
const unresolvedPath = path.join(projectRoot, "data", "parsed", "bank68-session-unresolved.json");

const SCORE_REGEX = /\b([01])\/1\b/;
const MARKER_REGEX = /\[\d{2}\/\d{2}\/\d{2}\s+\d{2}:\d{2}\s+[^\]]+\]\s+W:/g;
const REPLACEMENT_CHAR = /\uFFFD/g;

const EXPLICIT_ANSWER_LABEL = "الإجابة الصحيحة";
const ANALOGY_ID = "analogy";
const SENTENCE_COMPLETION_ID = "sentence_completion";
const CONTEXTUAL_ERROR_ID = "contextual_error";
const ODD_WORD_ID = "odd_word";
const SHORT_READING_ID = "short_reading";
const SOURCE_LABEL = "المراجعة النهائية على البنوك السادس والسابع والثامن";

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
    correctAnswer: "النجاح - يعملون",
  },
  {
    promptIncludes: "نحلة : عسل",
    correctAnswer: "لبن : زبد",
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
    correctAnswer: "قمح : ذرة",
  },
  {
    promptIncludes: "أكثر الناس سعادة هم الذين ينظرون إلى ما",
    correctAnswer: "يملكونه - يملكه الآخرون",
  },
  {
    promptIncludes: "عقل: تفكير",
    correctAnswer: "عين: إبصار",
  },
  {
    promptIncludes: "سكر :ملح",
    correctAnswer: "ذهب :فضة",
  },
  {
    promptIncludes: "قلم : حبر",
    correctAnswer: "صدف : لؤلؤ",
  },
  {
    promptIncludes: "تعب : مشقة",
    correctAnswer: "جدال : مراء",
  },
  {
    promptIncludes: "القطرة :الغيث",
    correctAnswer: "فكرة : المقال",
  },
  {
    promptIncludes: "عود : نار",
    correctAnswer: "ماء : زرع",
  },
  {
    promptIncludes: "شبع:تخمة",
    correctAnswer: "انفاق : تبذير",
  },
  {
    promptIncludes: "درس : تحضير",
    correctAnswer: "هدف :تحقيق",
  },
  {
    promptIncludes: "غوص : بحر",
    correctAnswer: "إيداع : بنك",
  },
  {
    promptIncludes: "اضطراب:زلزال",
    correctAnswer: "بركان:ثوران",
  },
  {
    promptIncludes: "طير :تحليق",
    correctAnswer: "سمك :سباحة",
  },
  {
    promptIncludes: "سورة: آية",
    correctAnswer: "وزارة :إدارة",
  },
  {
    promptIncludes: "مصرف :نقود",
    correctAnswer: "قلم : كاتب",
  },
  {
    promptIncludes: "مال :زكاة",
    correctAnswer: "إفطار : صوم",
  },
  {
    promptIncludes: "عنب : زبيب",
    correctAnswer: "بلح : تمر",
  },
  {
    promptIncludes: "نهج : طريق",
    correctAnswer: "ثوب : رداء",
  },
  {
    promptIncludes: "رضا : شعور",
    correctAnswer: "غضب : انفعال",
  },
  {
    promptIncludes: "حار : بارد",
    correctAnswer: "مرتفع : منخفض ( أحياء : أموات )",
  },
  {
    promptIncludes: "جسم : جسد",
    correctAnswer: "نبأ : خبر",
  },
  {
    promptIncludes: "تطويق : حصار",
    correctAnswer: "تعاقب : تداول",
  },
  {
    promptIncludes: "جرجير : ورقيات",
    correctAnswer: "طائرة : مواصلات",
  },
  {
    promptIncludes: "شبكة : موقع",
    correctAnswer: "كلية : جامعة",
  },
  {
    promptIncludes: "النهر : الناعورة",
    correctAnswer: "الرياح : الطاحونة",
  },
  {
    promptIncludes: "غذاء : جسم",
    correctAnswer: "تربة : نبات",
  },
  {
    promptIncludes: "طوب : جدار",
    correctAnswer: "رمال : صحراء",
  },
  {
    promptIncludes: "كلمة :حروف",
    correctAnswer: "فقرة : جمل",
  },
  {
    promptIncludes: "حجارة : قسوة",
    correctAnswer: "ذهن : ذكاء",
  },
  {
    promptIncludes: "السماء : الكواكب",
    optionsIncludes: "المكتبة : الكتب",
    correctAnswer: "المكتبة : الكتب",
  },
  {
    promptIncludes: "فجر : نور",
    correctAnswer: "غسق : ظلام",
  },
  {
    promptIncludes: "أسد : غزال",
    correctAnswer: "دجاج : حَبّ",
  },
  {
    promptIncludes: "رمضان : ذو الحجة",
    correctAnswer: "الإثنين : الخميس",
  },
  {
    promptIncludes: "معول : صخرة",
    correctAnswer: "فأس : شجرة",
  },
  {
    promptIncludes: "سكر :حلوى",
    correctAnswer: "حليب: جبن",
  },
  {
    promptIncludes: "قطع : سكين",
    correctAnswer: "سوط :جلد",
  },
  {
    promptIncludes: "ساعة : دقيقة",
    correctAnswer: "خاتم : ذهب",
  },
  {
    promptIncludes: "حلوى : سكر",
    correctAnswer: "كتاب : ورق",
  },
  {
    promptIncludes: "لحن : خطأ",
    correctAnswer: "إحساس : شعور",
  },
  {
    promptIncludes: "نقود : مصرف",
    correctAnswer: "عصفور : قفص",
  },
  {
    promptIncludes: "أبحاث : تطور",
    correctAnswer: "شيب : ضعف",
  },
  {
    promptIncludes: "السماء : الكواكب",
    optionsIncludes: "سيارة : وقود",
    correctAnswer: "المرأة : الذهب",
  },
  {
    promptIncludes: "وضوء : صلاة",
    correctAnswer: "تجربة : حكم (تجارب:حكم )",
  },
  {
    promptIncludes: "الكلب : الوفاء",
    correctAnswer: "الثعلب : المكر",
  },
  {
    promptIncludes: "أرض : كواكب",
    correctAnswer: "بقدونس : ورقيات",
  },
  {
    promptIncludes: "سهر : تعب",
    correctAnswer: "أكل : شبع",
  },
  {
    promptIncludes: "من طلب ..... قدره استحق",
    correctAnswer: "فوق- الحرمان",
  },
  {
    promptIncludes: "سيل : جارف",
    correctAnswer: "رجل : حازم",
  },
];

function readInputText() {
  return fs.readFileSync(inputPath, "utf8");
}

function cleanupSegment(input) {
  return input
    .replace(REPLACEMENT_CHAR, " ")
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .replace(/^[\s:.-]+/g, "")
    .replace(/[\s:.-]+$/g, "")
    .replace(/\b(\S+)(?:\s+\1\b)+/g, "$1")
    .trim();
}

function normalizePromptLookup(value) {
  return cleanupSegment(value).replace(/\([^)]*\)/g, " ").replace(/\s+/g, " ").trim();
}

function normalizeLine(line) {
  return cleanupSegment(line.replace(MARKER_REGEX, " "));
}

function stripNoiseFromLine(line) {
  return cleanupSegment(
    line
      .replace(/^التعليقات$/g, " ")
      .replace(/^من ذاكرة المختبر(?:ين)?\s*/g, " ")
      .replace(/^مختبر آخر\s*/g, " ")
      .replace(/^نص آخر\s*/g, " ")
      .replace(/^صيغة أخرى(?: من الانترنت)?\s*/g, " ")
      .replace(/^صياغة غير دقيقة\s*/g, " ")
      .replace(/^تم تعديل الاجابة[\s\S]*$/g, " ")
      .replace(/^\/\/+\s*/g, " ")
      .replace(/\(\([^)]+\)\)/g, " ")
      .replace(/\([^)]{120,}\)/g, " "),
  );
}

function isMetadataLine(line) {
  return (
    /^إجمالي النقاط\d+\/\d+$/.test(line) ||
    /^0 من إجمالي [01] نقطة$/.test(line) ||
    /^اسم الطالب:?\*?$/.test(line) ||
    /^كلمة المرور:?\*?$/.test(line) ||
    /^قسم بلا عنوان$/.test(line) ||
    /^\d+ من إجمالي \d+ نقطة$/.test(line) ||
    /^اقسم انني مشترك بدورة محوسب أغسطس الجديدة \((?:2025|2025-2026)\) للأستاذ : إيهاب عبد العظيم$/.test(line) ||
    /^المراجعة النهائية على البنك/.test(line) ||
    /^البنك السابع\(/.test(line) ||
    /^الاختبار .*?\(البنك الثامن\)$/.test(line) ||
    /^ليس هناك أي إجابات صحيحة$/.test(line)
  );
}

function isBlockSeparator(line) {
  if (!line) return true;
  const compact = line.replace(/\u00A0/g, "").trim();
  return compact === "" || compact === "آ";
}

function toBlocks(text) {
  const lines = text.replace(/\uFEFF/g, "").split(/\r?\n/);
  const blocks = [];
  let currentBlock = [];

  for (const rawLine of lines) {
    const normalizedLine = normalizeLine(rawLine);

    if (isBlockSeparator(normalizedLine)) {
      if (currentBlock.length > 0) {
        blocks.push(currentBlock);
        currentBlock = [];
      }
      continue;
    }

    if (isMetadataLine(normalizedLine)) {
      continue;
    }

    const cleanedLine = stripNoiseFromLine(normalizedLine);
    if (!cleanedLine || isMetadataLine(cleanedLine)) {
      continue;
    }

    currentBlock.push(cleanedLine);
  }

  if (currentBlock.length > 0) {
    blocks.push(currentBlock);
  }

  return blocks;
}

function countWords(input) {
  return cleanupSegment(input).split(/\s+/).filter(Boolean).length;
}

function hasBlanks(input) {
  const compact = input.replace(/\s+/g, "");
  return compact.includes("...") || compact.includes(".....") || compact.includes(".......") || compact.includes(".........");
}

function hasAnalogyShape(input) {
  return /\S+\s*:\s*\S+/.test(input) || /\S+\s*-\s*\S+/.test(input);
}

function hasReadingCue(input) {
  return [
    "النص",
    "القطعة",
    "يفهم من",
    "وفقا",
    "وفقاً",
    "أنسب عنوان",
    "العلاقة",
    "معنى",
    "الضمير",
    "الفكرة",
    "الفقرة",
    "عموم النص",
    "من خلال النص",
    "أي من الآتي",
    "ما الذي",
    "ماذا",
    "كيف",
    "لماذا",
    "يدل",
    "العنوان",
  ].some((keyword) => input.includes(keyword));
}

function hasContextualCue(input) {
  return [
    "الكلمة التي",
    "الكلمات",
    "الغلط",
    "الخطأ",
    "العبارة",
    "يمكن حذفها",
    "غير الصحيحة",
    "الصحيحة",
  ].some((keyword) => input.includes(keyword));
}

function classifyQuestion(prompt, optionsText, correctAnswer) {
  const normalizedPrompt = cleanupSegment(prompt);
  const normalizedOptions = cleanupSegment(optionsText);
  const normalizedAnswer = cleanupSegment(correctAnswer);

  if (normalizedPrompt.includes("ما الكلمة المختلفة") || normalizedPrompt.includes("المفردة الشاذة")) {
    return ODD_WORD_ID;
  }

  if (hasReadingCue(normalizedPrompt)) {
    return SHORT_READING_ID;
  }

  if (
    hasAnalogyShape(normalizedPrompt) ||
    (hasAnalogyShape(normalizedAnswer) && !hasReadingCue(normalizedPrompt) && countWords(normalizedPrompt) <= 10) ||
    (hasAnalogyShape(normalizedOptions) && countWords(normalizedPrompt) <= 8)
  ) {
    return ANALOGY_ID;
  }

  if (hasBlanks(normalizedPrompt)) {
    return SENTENCE_COMPLETION_ID;
  }

  if (hasContextualCue(normalizedPrompt)) {
    return CONTEXTUAL_ERROR_ID;
  }

  if (countWords(normalizedAnswer) <= 4 && countWords(normalizedPrompt) >= 5) {
    return CONTEXTUAL_ERROR_ID;
  }

  if (countWords(normalizedPrompt) <= 6) {
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

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function uniqueItems(items) {
  return [...new Set(items.map((item) => cleanupSegment(item)).filter(Boolean))];
}

function splitGenericOptions(optionsText, correctAnswer) {
  const normalized = cleanupSegment(optionsText);
  if (!normalized) return [];

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

  const chunks = normalized
    .split(/\s{2,}/)
    .map((item) => cleanupSegment(item))
    .filter(Boolean);

  if (chunks.length >= 2) {
    return uniqueItems(chunks);
  }

  return uniqueItems([normalized]);
}

function splitOptionsByCategory(categoryId, optionsText, correctAnswer) {
  if (categoryId === ANALOGY_ID) {
    return splitAnalogyOptions(optionsText);
  }

  return splitGenericOptions(optionsText, correctAnswer);
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

function findManualOverride(prompt, optionsText = "") {
  const normalizedPrompt = normalizePromptLookup(prompt);
  const normalizedOptions = normalizePromptLookup(optionsText);

  return MANUAL_OVERRIDES.find((item) => {
    if (!normalizedPrompt.includes(normalizePromptLookup(item.promptIncludes))) {
      return false;
    }

    if (item.optionsIncludes && !normalizedOptions.includes(normalizePromptLookup(item.optionsIncludes))) {
      return false;
    }

    return true;
  })?.correctAnswer;
}

function findExplicitAnswer(lines) {
  const labelIndex = lines.findIndex((line) => line.includes(EXPLICIT_ANSWER_LABEL));
  if (labelIndex === -1) return null;

  const remainder = cleanupSegment(lines.slice(labelIndex + 1).join(" "));
  return remainder || null;
}

function parseQuestionBlock(lines, pendingContext) {
  const scoreIndex = lines.findIndex((line) => SCORE_REGEX.test(line));
  if (scoreIndex === -1) {
    return { question: null, pendingContext: appendContext(pendingContext, cleanupSegment(lines.join(" "))) };
  }

  const scoreMatch = lines[scoreIndex].match(SCORE_REGEX);
  const promptPart = cleanupSegment(lines.slice(0, scoreIndex).join(" "));
  const optionsText = cleanupSegment(lines.slice(scoreIndex + 1).join("  "));

  if (!promptPart || !optionsText) {
    return { question: null, pendingContext: pendingContext };
  }

  const prompt = shouldAttachContext(pendingContext, promptPart)
    ? cleanupSegment(`${pendingContext} ${promptPart}`)
    : promptPart;
  const categoryId = classifyQuestion(prompt, optionsText, "");
  const options = splitOptionsByCategory(categoryId, optionsText, "");

  return {
    question: {
      prompt,
      categoryId,
      optionsText,
      options,
      correctAnswer: "",
      explicitScore: scoreMatch?.[1] ?? "0",
      source: SOURCE_LABEL,
    },
    pendingContext: "",
  };
}

function appendContext(current, addition) {
  const cleaned = cleanupSegment(addition);
  if (!cleaned) return current;
  if (!current) return cleaned;
  return cleanupSegment(`${current} ${cleaned}`);
}

function shouldAttachContext(pendingContext, promptPart) {
  if (!pendingContext || !promptPart) return false;
  if (!hasReadingCue(promptPart)) return false;
  return countWords(pendingContext) >= 8;
}

function finalizeQuestion(question, correctAnswer, index) {
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
    id: `bank68-session-${String(index + 1).padStart(4, "0")}`,
    categoryId,
    prompt: question.prompt,
    options: uniqueItems([...question.options, ...splitOptionsByCategory(categoryId, question.optionsText, correctAnswer), correctAnswer]),
    correctAnswer,
    explanation: makeExplanation(categoryId, question.prompt, correctAnswer),
    source: question.source,
  };
}

function finalizeImplicitQuestion(question, index) {
  const inferredOptions = splitOptionsByCategory(question.categoryId, question.optionsText, "");
  let correctAnswer = findManualOverride(question.prompt, question.optionsText) ?? null;

  if (!correctAnswer) {
    if (inferredOptions.length === 1) {
      correctAnswer = cleanupSegment(inferredOptions[0]);
    } else {
      return null;
    }
  }

  return finalizeQuestion(question, correctAnswer, index);
}

function parseQuestions(text) {
  const blocks = toBlocks(text);
  const questions = [];
  const unresolved = [];
  let pendingQuestion = null;
  let pendingContext = "";

  for (const blockLines of blocks) {
    const blockText = cleanupSegment(blockLines.join(" "));
    const explicitAnswer = findExplicitAnswer(blockLines);

    if (explicitAnswer && pendingQuestion) {
      const finalized = finalizeQuestion(pendingQuestion, explicitAnswer, questions.length);
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

    if (
      pendingQuestion &&
      !explicitAnswer &&
      !blockLines.some((line) => SCORE_REGEX.test(line)) &&
      !hasReadingCue(blockText) &&
      (hasAnalogyShape(blockText) || countWords(blockText) <= 6)
    ) {
      pendingQuestion.optionsText = cleanupSegment(`${pendingQuestion.optionsText}  ${blockText}`);
      pendingQuestion.options = uniqueItems([
        ...pendingQuestion.options,
        ...splitOptionsByCategory(pendingQuestion.categoryId, blockText, ""),
      ]);
      continue;
    }

    const parsed = parseQuestionBlock(blockLines, pendingContext);
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

    pendingContext = appendContext(pendingContext, cleanupSegment(blockLines.join(" ")));
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

function dedupeQuestions(questions) {
  const seen = new Set();
  const deduped = [];

  for (const question of questions) {
    const key = `${question.categoryId}::${normalizePromptLookup(question.prompt)}::${cleanupSegment(question.correctAnswer)}`;
    if (seen.has(key)) continue;
    seen.add(key);
    deduped.push({
      ...question,
      id: `bank68-session-${String(deduped.length + 1).padStart(4, "0")}`,
    });
  }

  return deduped;
}

function loadKnownAnswerMap() {
  const files = [
    path.join(projectRoot, "src", "data", "verbal-mixed-bank.ts"),
    path.join(projectRoot, "src", "data", "verbal-mixed-bank45.ts"),
  ].filter((filePath) => fs.existsSync(filePath));

  const knownAnswers = new Map();
  const pairRegex = /prompt:\s*("(?:\\.|[^"\\])*")[\s\S]*?correctAnswer:\s*("(?:\\.|[^"\\])*")/g;

  for (const filePath of files) {
    const sourceText = fs.readFileSync(filePath, "utf8");

    for (const match of sourceText.matchAll(pairRegex)) {
      try {
        const prompt = JSON.parse(match[1]);
        const correctAnswer = JSON.parse(match[2]);
        const key = normalizePromptLookup(prompt);
        if (!key || knownAnswers.has(key)) continue;
        knownAnswers.set(key, correctAnswer);
      } catch {
        // Ignore malformed string matches.
      }
    }
  }

  return knownAnswers;
}

function recoverUnresolvedQuestions(unresolved, knownAnswers, startIndex) {
  const recovered = [];
  const remaining = [];

  for (const item of unresolved) {
    const key = normalizePromptLookup(item.prompt);
    const correctAnswer = knownAnswers.get(key);

    if (!correctAnswer) {
      remaining.push(item);
      continue;
    }

    const categoryId = refineCategory(
      classifyQuestion(item.prompt, item.optionsText, correctAnswer),
      item.prompt,
      item.optionsText,
      correctAnswer,
    );

    recovered.push({
      id: `bank68-session-${String(startIndex + recovered.length + 1).padStart(4, "0")}`,
      categoryId,
      prompt: item.prompt,
      options: uniqueItems([...splitOptionsByCategory(categoryId, item.optionsText, correctAnswer), correctAnswer]),
      correctAnswer,
      explanation: makeExplanation(categoryId, item.prompt, correctAnswer),
      source: SOURCE_LABEL,
    });
  }

  return { recovered, remaining };
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
  return `import type { VerbalPracticeQuestion } from "./verbal-mixed-bank";\n\n// Generated from the user-provided bank 6/7/8 review message stored in data/raw/bank-6-8-session-message.txt.\nexport const bank68SessionQuestions: VerbalPracticeQuestion[] = [\n${renderedQuestions}\n];\n\nexport const bank68SessionQuestionStats = ${JSON.stringify(stats, null, 2)} as const;\n`;
}

function main() {
  const text = readInputText();
  const { questions, unresolved } = parseQuestions(text);
  const knownAnswers = loadKnownAnswerMap();
  for (const question of questions) {
    const key = normalizePromptLookup(question.prompt);
    if (!key || knownAnswers.has(key)) continue;
    knownAnswers.set(key, question.correctAnswer);
  }
  const { recovered, remaining } = recoverUnresolvedQuestions(unresolved, knownAnswers, questions.length);
  const dedupedQuestions = dedupeQuestions([...questions, ...recovered]);
  const stats = {
    total: dedupedQuestions.length,
    byCategory: groupByCategory(dedupedQuestions),
    unresolved: remaining.length,
  };

  fs.writeFileSync(outputPath, renderOutput(dedupedQuestions, stats), "utf8");
  fs.writeFileSync(unresolvedPath, JSON.stringify(remaining, null, 2), "utf8");

  console.log(JSON.stringify(stats, null, 2));
}

main();
