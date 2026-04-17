import fs from "fs/promises";
import path from "path";

type ReviewItem = {
  issueType: string;
  issueDetails: string;
  confidence?: number;
  questionOrder?: number;
};

export type IngestionReport = {
  source: {
    title: string;
    fileName: string;
  };
  generatedAt: string;
  summary: {
    totalPassages: number;
    totalQuestions: number;
    highConfidenceQuestions: number;
    lowConfidenceQuestions: number;
    needsReviewQuestions: number;
    reviewQueueCount: number;
  };
  reviewItems: ReviewItem[];
  passagesPreview: Array<{
    pieceNumber: number | null;
    pieceTitle: string;
    questions: number;
    confidence: number;
    needsReview: boolean;
  }>;
};

const reportPath = path.join(process.cwd(), "data", "reports", "latest-verbal-report.json");

export async function getLatestIngestionReport(): Promise<IngestionReport | null> {
  try {
    const content = await fs.readFile(reportPath, "utf8");
    return JSON.parse(content) as IngestionReport;
  } catch {
    return null;
  }
}
