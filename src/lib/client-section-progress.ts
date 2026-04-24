import type {
  QuestionProgressSection,
  UserSectionProgressSnapshot,
} from "@/lib/user-question-progress";

export type ClientSectionProgressPayload = {
  section: QuestionProgressSection;
  categoryId: string;
};

export async function loadSectionProgressFromClient(
  payload: ClientSectionProgressPayload,
) {
  const params = new URLSearchParams({
    section: payload.section,
    categoryId: payload.categoryId,
  });

  const response = await fetch(`/api/student/section-progress?${params.toString()}`, {
    cache: "no-store",
  });

  if (response.status === 401) {
    return {
      ok: false,
      unauthorized: true,
      snapshot: null,
    } as const;
  }

  if (!response.ok) {
    return {
      ok: false,
      unauthorized: false,
      snapshot: null,
    } as const;
  }

  const body = (await response.json()) as {
    ok?: boolean;
    snapshot?: UserSectionProgressSnapshot;
  };

  return {
    ok: Boolean(body.ok && body.snapshot),
    unauthorized: false,
    snapshot: body.snapshot ?? null,
  } as const;
}

export async function resetSectionProgressFromClient(
  payload: ClientSectionProgressPayload,
) {
  const params = new URLSearchParams({
    section: payload.section,
    categoryId: payload.categoryId,
  });

  const response = await fetch(`/api/student/section-progress?${params.toString()}`, {
    method: "DELETE",
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
