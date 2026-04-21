import type { TrackQuestionProgressPayload } from "@/lib/user-question-progress";

export type ClientQuestionProgressPayload = {
  questionKey: string;
  questionId?: number | null;
  section: TrackQuestionProgressPayload["section"];
  sourceBank: string;
  categoryId?: string | null;
  categoryTitle?: string | null;
  questionTypeLabel: string;
  questionText: string;
  questionHref?: string | null;
  selectedAnswer?: string | null;
  correctAnswer?: string | null;
  metadata?: Record<string, unknown>;
  outcome: TrackQuestionProgressPayload["outcome"];
  xpValue?: number;
};

export type ClientQuestionProgressResult = {
  status: "created" | "updated";
  alreadySolved: boolean;
  awardedXp: number;
  totalXp: number;
  solvedQuestionsCount: number;
  reachedProfessionalLevel: boolean;
};

export async function trackQuestionProgressFromClient(payload: ClientQuestionProgressPayload) {
  const response = await fetch("/api/student/question-progress", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (response.status === 401) {
    return {
      ok: false,
      unauthorized: true,
      result: null,
    } as const;
  }

  if (!response.ok) {
    return {
      ok: false,
      unauthorized: false,
      result: null,
    } as const;
  }

  const body = (await response.json()) as {
    ok?: boolean;
    result?: ClientQuestionProgressResult;
  };

  return {
    ok: Boolean(body.ok && body.result),
    unauthorized: false,
    result: body.result ?? null,
  } as const;
}
