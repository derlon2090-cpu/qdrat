import path from "path";
import {
  ensurePipelineDirs,
  getLatestReportPath,
  getNormalizedOutputPath,
  getReportOutputPath,
  listPdfFiles,
  readJson,
  toSlug,
  writeJson,
} from "./shared.mjs";

function buildReport(normalized) {
  const questions = normalized.passages.flatMap((passage) => passage.questions);
  const reviewItems = [...normalized.reviewItems];

  for (const passage of normalized.passages) {
    if (passage.questions.length === 0) {
      reviewItems.push({
        issueType: "empty_passage",
        issueDetails: `Passage ${passage.pieceNumber ?? "?"} has no questions.`,
        confidence: 0,
      });
    }

    for (const question of passage.questions) {
      const correctCount = question.options.filter((option) => option.isCorrect).length;
      if (question.options.length !== 4) {
        reviewItems.push({
          issueType: "malformed_options",
          issueDetails: `Passage ${passage.pieceNumber ?? "?"} / Question ${question.questionOrder} has ${question.options.length} options.`,
          confidence: question.answerConfidence,
          pieceNumber: passage.pieceNumber,
          questionOrder: question.questionOrder,
        });
      }

      if (correctCount !== 1) {
        reviewItems.push({
          issueType: "correct_answer_mismatch",
          issueDetails: `Passage ${passage.pieceNumber ?? "?"} / Question ${question.questionOrder} has ${correctCount} correct options.`,
          confidence: question.answerConfidence,
          pieceNumber: passage.pieceNumber,
          questionOrder: question.questionOrder,
        });
      }

      if ((question.answerConfidence || 0) < 0.6) {
        reviewItems.push({
          issueType: "low_confidence",
          issueDetails: `Passage ${passage.pieceNumber ?? "?"} / Question ${question.questionOrder} confidence is ${question.answerConfidence}.`,
          confidence: question.answerConfidence,
          pieceNumber: passage.pieceNumber,
          questionOrder: question.questionOrder,
        });
      }
    }
  }

  return {
    source: normalized.source,
    generatedAt: new Date().toISOString(),
    summary: {
      totalPassages: normalized.passages.length,
      totalQuestions: questions.length,
      highConfidenceQuestions: questions.filter((question) => (question.answerConfidence || 0) >= 0.8).length,
      lowConfidenceQuestions: questions.filter((question) => (question.answerConfidence || 0) < 0.6).length,
      needsReviewQuestions: questions.filter((question) => question.needsReview).length,
      reviewQueueCount: reviewItems.length,
    },
    reviewItems,
    passagesPreview: normalized.passages.slice(0, 8).map((passage) => ({
      pieceNumber: passage.pieceNumber,
      pieceTitle: passage.pieceTitle,
      questions: passage.questions.length,
      confidence: passage.parsingConfidence,
      needsReview: passage.needsReview,
    })),
  };
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
    const normalizedPath = getNormalizedOutputPath(slug);
    const normalized = await readJson(normalizedPath);
    const report = buildReport(normalized);

    const outputPath = getReportOutputPath(slug);
    await writeJson(outputPath, report);
    await writeJson(getLatestReportPath(), report);

    console.log(
      JSON.stringify(
        {
          ok: true,
          stage: "validate",
          slug,
          outputPath,
          summary: report.summary,
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
