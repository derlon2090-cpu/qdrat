import type { MistakeSection, TrackMistakePayload } from "@/lib/user-mistakes";

export type ClientMistakeTrackingPayload = {
  questionKey: string;
  section: MistakeSection;
  sourceBank: string;
  questionTypeLabel: string;
  questionText: string;
  questionHref?: string | null;
  metadata?: Record<string, unknown>;
  outcome: TrackMistakePayload["outcome"];
};

export async function trackMistakeFromClient(payload: ClientMistakeTrackingPayload) {
  const response = await fetch("/api/mistakes", {
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
    } as const;
  }

  if (!response.ok) {
    return {
      ok: false,
      unauthorized: false,
    } as const;
  }

  return {
    ok: true,
    unauthorized: false,
  } as const;
}
