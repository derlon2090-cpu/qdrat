import path from "path";
import {
  countWords,
  ensurePipelineDirs,
  getNormalizedOutputPath,
  getOptionKeyMap,
  getRawOutputPath,
  listPdfFiles,
  readJson,
  toSlug,
  writeJson,
} from "./shared.mjs";

const optionKeyMap = getOptionKeyMap();
const maxPassages = Number(process.env.MAX_PASSAGES || 10000);

function isIndexHeader(text) {
  return text === "الفهرس" || text.includes("الفهرس");
}

function isPassageTitleLine(text) {
  return text.startsWith("قطعة ") && text.length < 120 && !text.includes("؟");
}

function isLikelyIndexPage(page) {
  const lines = page.lines
    .map((line) => line.normalized)
    .filter((text) => text && !/^\d+$/.test(text));

  const titleLikeCount = lines.filter((text) => parseTocEntry(text)).length;
  const longLineCount = lines.filter((text) => text.length > 120).length;

  return titleLikeCount >= 8 && longLineCount <= 1;
}

function parseTocEntry(text) {
  const match = text.match(/^\((\d+)\)\s+قطعة\s+(.+?)\s+(\d+)$/);
  if (!match) {
    return null;
  }

  return {
    pieceNumber: Number(match[1]),
    pieceTitle: match[2].trim(),
    bookPage: Number(match[3]),
  };
}

function parsePassageTitle(text) {
  const match = text.match(/^قطعة\s+(.+?)\s+\((\d+)\)$/);
  if (match) {
    return {
      pieceTitle: match[1].trim(),
      pieceNumber: Number(match[2]),
    };
  }

  return {
    pieceTitle: text.replace(/^قطعة\s+/, "").trim(),
    pieceNumber: null,
  };
}

function isPassageTitleForEntry(text, entry) {
  const passageWord = "\u0642\u0637\u0639\u0629";
  return (
    text === `${passageWord} ${entry.pieceTitle} (${entry.pieceNumber})` ||
    text === `(${entry.pieceNumber}) ${passageWord} ${entry.pieceTitle}` ||
    text.startsWith(`(${entry.pieceNumber}) ${passageWord} `)
  );
}

function parseQuestionStart(text) {
  const match = text.match(/^(\d+)\s*[.)-]\s*(.+)$/);
  if (!match) {
    return null;
  }

  return {
    order: Number(match[1]),
    text: match[2].trim(),
  };
}

function splitOptionLine(text, colorHint) {
  const tokens = text.split(/\s+/).filter(Boolean);
  const expectedOrder = ["A", "B", "C", "D"];
  const segments = [];
  let cursor = 0;

  for (let orderIndex = 0; orderIndex < expectedOrder.length; orderIndex += 1) {
    const expectedKey = expectedOrder[orderIndex];
    let markerIndex = -1;

    for (let index = cursor; index < tokens.length; index += 1) {
      if (optionKeyMap.get(tokens[index]) === expectedKey) {
        markerIndex = index;
        break;
      }
    }

    if (markerIndex === -1) {
      continue;
    }

    let nextMarkerIndex = tokens.length;
    for (let lookahead = markerIndex + 1; lookahead < tokens.length; lookahead += 1) {
      const mapped = optionKeyMap.get(tokens[lookahead]);
      if (mapped && expectedOrder.indexOf(mapped) > orderIndex) {
        nextMarkerIndex = lookahead;
        break;
      }
    }

    const textParts = tokens.slice(markerIndex + 1, nextMarkerIndex);
    segments.push({
      key: expectedKey,
      textParts,
      colorHint: colorHint ?? null,
    });
    cursor = nextMarkerIndex;
  }

  return segments
    .map((segment, index) => ({
      key: segment.key,
      text: segment.textParts.join(" ").trim(),
      colorHint: segment.colorHint,
      displayOrder: index + 1,
    }))
    .filter((segment) => segment.text);
}

function parseExplicitAnswer(text) {
  const match = text.match(/(?:الإجابة الصحيحة|الإجابة|الجواب الصحيح|الجواب|الحل)\s*[:：-]?\s*([اأبجدABCD])/i);
  if (!match) {
    return null;
  }

  return optionKeyMap.get(match[1].toUpperCase()) ?? optionKeyMap.get(match[1]) ?? null;
}

function inferAnswerByColor(options) {
  const colored = options.filter((option) => option.colorHint);
  if (colored.length < 2) {
    return null;
  }

  const counts = new Map();
  for (const option of colored) {
    counts.set(option.colorHint, (counts.get(option.colorHint) || 0) + 1);
  }

  const uniqueColor = [...counts.entries()].find(([, count]) => count === 1)?.[0];
  if (!uniqueColor) {
    return null;
  }

  return options.find((option) => option.colorHint === uniqueColor)?.key ?? null;
}

function finalizeQuestion(question, reviewItems) {
  if (!question) {
    return null;
  }

  const questionText = [question.text, ...question.extraPromptLines].filter(Boolean).join(" ").trim();
  const explanation = question.explanationLines.join(" ").trim() || null;
  const dedupedOptions = [];
  const optionMap = new Map();

  for (const option of question.options) {
    const existing = optionMap.get(option.key);
    if (existing) {
      existing.text = `${existing.text} ${option.text}`.trim();
      existing.colorHint = existing.colorHint ?? option.colorHint ?? null;
      continue;
    }

    const normalizedOption = {
      key: option.key,
      text: option.text.trim(),
      colorHint: option.colorHint ?? null,
    };

    optionMap.set(option.key, normalizedOption);
    dedupedOptions.push(normalizedOption);
  }

  const options = dedupedOptions.map((option, index) => ({
    optionKey: option.key,
    optionText: option.text,
    isCorrect: false,
    displayOrder: index + 1,
    colorHint: option.colorHint,
  }));

  let answerSource = null;
  let answerConfidence = 0;
  let correctAnswer = question.explicitAnswer;

  if (correctAnswer) {
    answerSource = "text";
    answerConfidence = 0.96;
  } else {
    correctAnswer = inferAnswerByColor(question.options);
    if (correctAnswer) {
      answerSource = "color";
      answerConfidence = 0.55;
    }
  }

  for (const option of options) {
    option.isCorrect = option.optionKey === correctAnswer;
  }

  const issues = [];
  if (options.length !== 4) {
    issues.push("malformed_options");
  }
  if (!correctAnswer) {
    issues.push("missing_answer");
  }
  if (answerSource === "color") {
    issues.push("color_only_answer");
  }
  if (!questionText) {
    issues.push("missing_question_text");
  }

  const normalizedQuestion = {
    questionOrder: question.order || 1,
    questionText,
    questionType: "reading_passage",
    explanation,
    answerSource: answerSource ?? "unknown",
    answerConfidence,
    needsReview: issues.length > 0,
    options,
  };

  for (const issue of issues) {
    reviewItems.push({
      issueType: issue,
      issueDetails: `Question ${normalizedQuestion.questionOrder} in passage ${question.passageLabel}`,
      confidence: answerConfidence,
      questionOrder: normalizedQuestion.questionOrder,
      pieceNumber: question.pieceNumber,
    });
  }

  return normalizedQuestion;
}

function finalizePassage(passage, reviewItems) {
  if (!passage) {
    return null;
  }

  if (passage.currentQuestion) {
    const finalizedQuestion = finalizeQuestion(passage.currentQuestion, reviewItems);
    if (finalizedQuestion) {
      passage.questions.push(finalizedQuestion);
    }
  }

  const passageText = passage.textLines.join(" ").trim();
  const questionConfidences = passage.questions.map((question) => question.answerConfidence || 0);
  const parsingConfidence = questionConfidences.length
    ? Number((questionConfidences.reduce((sum, value) => sum + value, 0) / questionConfidences.length).toFixed(2))
    : 0;

  if (!passageText) {
    reviewItems.push({
      issueType: "missing_passage_text",
      issueDetails: `Passage ${passage.pieceNumber ?? "?"} has no body text.`,
      confidence: 0,
    });
  }

  return {
    pieceNumber: passage.pieceNumber,
    pieceTitle: passage.pieceTitle,
    passageText,
    category: "verbal_reading",
    difficulty: "medium",
    rawPageFrom: passage.pageFrom,
    rawPageTo: passage.pageTo,
    parsingConfidence,
    needsReview: !passageText || passage.questions.some((question) => question.needsReview),
    estimatedReadSeconds: Math.max(20, Math.round((countWords(passageText) / 180) * 60)),
    questions: passage.questions,
  };
}

function createPassageState(titleInfo, pageNumber) {
  return {
    pieceNumber: titleInfo.pieceNumber,
    pieceTitle: titleInfo.pieceTitle,
    pageFrom: pageNumber,
    pageTo: pageNumber,
    textLines: [],
    questions: [],
    currentQuestion: null,
  };
}

function createQuestionState(order, text, passageLabel) {
  return {
    order,
    text,
    passageLabel,
    pieceNumber: passageLabel,
    extraPromptLines: [],
    explanationLines: [],
    options: [],
    explicitAnswer: null,
  };
}

function extractTocEntries(raw) {
  const entries = [];

  for (const page of raw.pages) {
    const firstMeaningfulLine = page.lines.find((line) => line.normalized && !/^\d+$/.test(line.normalized))?.normalized;
    if (!firstMeaningfulLine || !isIndexHeader(firstMeaningfulLine) || !isLikelyIndexPage(page)) {
      continue;
    }

    for (const line of page.lines.slice(1)) {
      const entry = parseTocEntry(line.normalized);
      if (entry) {
        entries.push(entry);
      }
    }
  }

  return entries.sort((a, b) => a.pieceNumber - b.pieceNumber);
}

function getContentOffset(raw, tocEntries) {
  if (!tocEntries.length) {
    return 0;
  }

  for (const entry of tocEntries.slice(0, 5)) {
    const needle = `(${entry.pieceNumber}) قطعة ${entry.pieceTitle}`;
    const match = raw.pages.find((page) => page.lines.some((line) => line.normalized === needle));
    if (match) {
      return match.pageNumber - entry.bookPage;
    }
  }

  return 0;
}

function normalizePassageWindow(entry, nextEntry, pages, reviewItems) {
  const passage = createPassageState(
    { pieceNumber: entry.pieceNumber, pieceTitle: entry.pieceTitle },
    pages[0]?.pageNumber ?? 0,
  );
  let reachedNextPassage = false;

  for (const page of pages) {
    passage.pageTo = page.pageNumber;

    for (const line of page.lines) {
      const text = line.normalized;
      if (!text || isIndexHeader(text) || /^\d+$/.test(text)) {
        continue;
      }

      if (isPassageTitleForEntry(text, entry)) {
        continue;
      }

      if (nextEntry && isPassageTitleForEntry(text, nextEntry)) {
        reachedNextPassage = true;
        break;
      }

      const questionStart = parseQuestionStart(text);
      if (questionStart) {
        if (passage.currentQuestion) {
          const finalizedQuestion = finalizeQuestion(passage.currentQuestion, reviewItems);
          if (finalizedQuestion) {
            passage.questions.push(finalizedQuestion);
          }
        }

        passage.currentQuestion = createQuestionState(questionStart.order, questionStart.text, entry.pieceNumber);
        continue;
      }

      if (!passage.currentQuestion) {
        passage.textLines.push(text);
        continue;
      }

      const explicitAnswer = parseExplicitAnswer(text);
      if (explicitAnswer) {
        passage.currentQuestion.explicitAnswer = explicitAnswer;
        continue;
      }

      const optionCandidates = splitOptionLine(text, line.dominantColor);
      if (optionCandidates.length) {
        passage.currentQuestion.options.push(...optionCandidates);
        continue;
      }

      if (passage.currentQuestion.options.length && passage.currentQuestion.options.length < 4) {
        const lastOption = passage.currentQuestion.options.at(-1);
        if (lastOption) {
          lastOption.text = `${lastOption.text} ${text}`.trim();
          continue;
        }
      }

      if (passage.currentQuestion.options.length) {
        passage.currentQuestion.explanationLines.push(text);
      } else {
        passage.currentQuestion.extraPromptLines.push(text);
      }
    }

    if (reachedNextPassage) {
      break;
    }
  }

  return finalizePassage(passage, reviewItems);
}

function normalizeRawSource(raw) {
  const reviewItems = [];
  const tocEntries = extractTocEntries(raw).slice(0, maxPassages);
  const offset = getContentOffset(raw, tocEntries);
  const passages = [];

  for (let index = 0; index < tocEntries.length; index += 1) {
    const current = tocEntries[index];
    const next = tocEntries[index + 1];
    const startPage = current.bookPage + offset;
    const computedEndPage = next ? next.bookPage + offset : startPage + 2;
    const endPage = Math.max(startPage, computedEndPage);
    const pages = raw.pages.filter((page) => page.pageNumber >= startPage && page.pageNumber <= endPage);

    if (!pages.length) {
      reviewItems.push({
        issueType: "missing_page_window",
        issueDetails: `Passage ${current.pieceNumber} has no matching PDF pages.`,
        confidence: 0,
      });
      continue;
    }

    const normalizedPassage = normalizePassageWindow(current, next, pages, reviewItems);
    if (normalizedPassage) {
      passages.push(normalizedPassage);
    }
  }

  return { passages, reviewItems };
}

async function main() {
  await ensurePipelineDirs();
  const files = await listPdfFiles();

  if (!files.length) {
    console.log("No PDF files found in data/raw.");
    return;
  }

  for (const file of files) {
    const slug = toSlug(file);
    const rawPath = getRawOutputPath(slug);
    const raw = await readJson(rawPath);
    const { passages, reviewItems } = normalizeRawSource(raw);

    const normalized = {
      source: raw.source,
      generatedAt: new Date().toISOString(),
      config: {
        maxPassages,
        totalPages: raw.totalPages,
      },
      passages,
      reviewItems,
    };

    const outputPath = getNormalizedOutputPath(slug);
    await writeJson(outputPath, normalized);

    console.log(
      JSON.stringify(
        {
          ok: true,
          stage: "parse",
          slug,
          passages: passages.length,
          questions: passages.reduce((sum, passage) => sum + passage.questions.length, 0),
          reviewItems: reviewItems.length,
          outputPath,
        },
        null,
        2,
      ),
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
