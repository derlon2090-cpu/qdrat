export type ClientQuestionFlags = {
  saved?: boolean;
  pinned?: boolean;
};

type ClientQuestionFlagsMap = Record<string, ClientQuestionFlags | undefined>;

const STORAGE_KEY = "miyaar-client-question-flags";

export function readClientQuestionFlags(): ClientQuestionFlagsMap {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as ClientQuestionFlagsMap) : {};
  } catch {
    return {};
  }
}

export function persistClientQuestionFlags(value: ClientQuestionFlagsMap) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
}

export function toggleClientQuestionFlag(
  current: ClientQuestionFlagsMap,
  questionKey: string,
  flag: keyof ClientQuestionFlags,
) {
  const previous = current[questionKey] ?? {};
  const nextValue = !previous[flag];
  const nextEntry: ClientQuestionFlags = {
    ...previous,
    [flag]: nextValue,
  };

  if (!nextEntry.saved && !nextEntry.pinned) {
    const next = { ...current };
    delete next[questionKey];
    return next;
  }

  return {
    ...current,
    [questionKey]: nextEntry,
  };
}
