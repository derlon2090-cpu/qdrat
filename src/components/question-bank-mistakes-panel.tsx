"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  Loader2,
  RefreshCcw,
  Sparkles,
  Target,
  TimerReset,
  Trash2,
  Trophy,
  Zap,
} from "lucide-react";

import type { AuthSessionUser } from "@/lib/auth-shared";
import type {
  MistakeAnalytics,
  UserMistakeTrainingQuestion,
} from "@/lib/mistake-training";
import type {
  MistakeMasteryState,
  UserMistakeRecord,
} from "@/lib/user-mistakes";

type SessionStatus = "loading" | "authenticated" | "unauthenticated";
type MistakeTrackFilter = "all" | "verbal" | "quantitative";
type TrainingMode = "standard" | "challenge" | "speed" | "bedtime" | "worst10";
type QuestionCountPreset = 10 | 20 | "all";

type MistakesPayload = {
  ok?: boolean;
  items?: UserMistakeRecord[];
  trainingQuestions?: UserMistakeTrainingQuestion[];
  stats?: MistakeAnalytics;
  message?: string;
};

type SessionXpPayload = {
  ok?: boolean;
  data?: {
    totalAwarded?: number;
    awarded?: Array<{
      title: string;
      points: number;
    }>;
    duel?: {
      id: number;
      status: "active" | "completed" | "expired";
      opponentName: string;
      myPercent: number | null;
      opponentPercent: number | null;
      resultLabel: string;
    } | null;
  };
  message?: string;
};

type DuelPayload = {
  ok?: boolean;
  data?: {
    duel: {
      id: number;
      canStart: boolean;
      track: MistakeTrackFilter;
      questionCount: number;
      opponentName: string;
      resultLabel: string;
      status: "active" | "completed" | "expired";
    };
    questions: UserMistakeTrainingQuestion[];
  };
  message?: string;
};

type TrainingSession = {
  sessionKey: number;
  mode: TrainingMode;
  trackFilter: MistakeTrackFilter;
  countPreset: QuestionCountPreset;
  questions: UserMistakeTrainingQuestion[];
  currentIndex: number;
  answers: Record<number, string>;
  submissions: Record<number, { selectedAnswer: string; isCorrect: boolean }>;
  startedAt: number;
  deadlineAt: number | null;
  completedAt: number | null;
  timedOut: boolean;
  duelId?: number | null;
  duelLabel?: string | null;
  isDuel?: boolean;
};

type LoadedDuel = {
  duel: {
    id: number;
    canStart: boolean;
    track: MistakeTrackFilter;
    questionCount: number;
    opponentName: string;
    resultLabel: string;
    status: "active" | "completed" | "expired";
  };
  questions: UserMistakeTrainingQuestion[];
};

const SESSION_SUCCESS_PERCENT = 90;

function deriveStats(
  items: UserMistakeRecord[],
  trainingQuestions: UserMistakeTrainingQuestion[],
  fallback?: MistakeAnalytics | null,
) {
  const weakestTypeMap = new Map<string, number>();
  const weakestSectionMap = new Map<"verbal" | "quantitative", number>();

  for (const item of items) {
    weakestTypeMap.set(
      item.questionTypeLabel,
      (weakestTypeMap.get(item.questionTypeLabel) ?? 0) + 1,
    );
    weakestSectionMap.set(
      item.section,
      (weakestSectionMap.get(item.section) ?? 0) + 1,
    );
  }

  const weakestTypeEntry = Array.from(weakestTypeMap.entries()).sort(
    (left, right) => right[1] - left[1],
  )[0];
  const weakestSectionEntry = Array.from(weakestSectionMap.entries()).sort(
    (left, right) => right[1] - left[1],
  )[0];

  return {
    totalCount: items.length,
    activeCount: items.filter((item) => item.masteryState !== "mastered").length,
    incorrectCount: items.filter((item) => item.masteryState === "incorrect").length,
    trainingCount: items.filter((item) => item.masteryState === "training").length,
    masteredCount: items.filter((item) => item.masteryState === "mastered").length,
    masteryPercent: items.length
      ? Math.round(
          items.reduce((sum, item) => sum + item.masteryPercent, 0) / items.length,
        )
      : 0,
    weakestTypeLabel: weakestTypeEntry?.[0] ?? fallback?.weakestTypeLabel ?? null,
    weakestSection:
      weakestSectionEntry?.[0] ?? fallback?.weakestSection ?? null,
    weakestCount: weakestTypeEntry?.[1] ?? fallback?.weakestCount ?? 0,
    trainableCount: trainingQuestions.length,
    trainableVerbalCount: trainingQuestions.filter(
      (question) => question.section === "verbal",
    ).length,
    trainableQuantitativeCount: trainingQuestions.filter(
      (question) => question.section === "quantitative",
    ).length,
    unresolvedCount: fallback?.unresolvedCount ?? 0,
  } satisfies MistakeAnalytics;
}

function getMasteryBadge(value: number) {
  if (value >= 90) {
    return {
      label: "متقن",
      className: "bg-emerald-50 text-emerald-700",
      progressClassName: "bg-[linear-gradient(90deg,#059669,#34d399)]",
    };
  }

  if (value >= 80) {
    return {
      label: "جيد",
      className: "bg-sky-50 text-sky-700",
      progressClassName: "bg-[linear-gradient(90deg,#2563eb,#60a5fa)]",
    };
  }

  if (value >= 60) {
    return {
      label: "قيد البناء",
      className: "bg-amber-50 text-amber-700",
      progressClassName: "bg-[linear-gradient(90deg,#d97706,#fbbf24)]",
    };
  }

  return {
    label: "ضعيف",
    className: "bg-rose-50 text-rose-700",
    progressClassName: "bg-[linear-gradient(90deg,#e11d48,#fb7185)]",
  };
}

function getStateMeta(state: MistakeMasteryState) {
  if (state === "mastered") {
    return {
      label: "✅ أتقنته",
      className: "bg-emerald-50 text-emerald-700",
    };
  }

  if (state === "training") {
    return {
      label: "🔁 قيد التدريب",
      className: "bg-sky-50 text-sky-700",
    };
  }

  return {
    label: "❌ أخطأت فيه",
    className: "bg-rose-50 text-rose-700",
  };
}

function getTrackLabel(filter: MistakeTrackFilter) {
  if (filter === "verbal") return "اللفظي";
  if (filter === "quantitative") return "الكمي";
  return "الكل";
}

function getModeLabel(mode: TrainingMode) {
  if (mode === "challenge") return "وضع التحدي";
  if (mode === "speed") return "وضع السرعة";
  if (mode === "bedtime") return "مراجعة قبل النوم";
  if (mode === "worst10") return "أسوأ 10 أسئلة";
  return "تدريب عادي";
}

function getQuestionCountForMode(
  mode: TrainingMode,
  countPreset: QuestionCountPreset,
  totalAvailable: number,
) {
  if (mode === "bedtime") return Math.min(5, totalAvailable);
  if (mode === "worst10") return Math.min(10, totalAvailable);
  if (countPreset === "all") return totalAvailable;
  return Math.min(countPreset, totalAvailable);
}

function pickSessionQuestions(
  questions: UserMistakeTrainingQuestion[],
  trackFilter: MistakeTrackFilter,
  countPreset: QuestionCountPreset,
  mode: TrainingMode,
) {
  const basePool = questions.filter((question) => {
    if (trackFilter === "all") return question.masteryState !== "mastered";
    return (
      question.section === trackFilter && question.masteryState !== "mastered"
    );
  });

  const fallbackPool = questions.filter((question) =>
    trackFilter === "all" ? true : question.section === trackFilter,
  );
  const pool = basePool.length ? basePool : fallbackPool;

  const targetCount = getQuestionCountForMode(mode, countPreset, pool.length);
  if (!targetCount) return [];

  const ordered = [...pool];

  if (mode === "worst10") {
    ordered.sort((left, right) => {
      if (right.priorityScore !== left.priorityScore) {
        return right.priorityScore - left.priorityScore;
      }

      return right.incorrectCount - left.incorrectCount;
    });
  } else {
    ordered.sort((left, right) => {
      const leftScore = left.priorityScore + Math.random() * 2.5;
      const rightScore = right.priorityScore + Math.random() * 2.5;
      return rightScore - leftScore;
    });
  }

  return ordered.slice(0, targetCount);
}

function getChallengeSeconds(questionCount: number) {
  return Math.max(60, questionCount * 45);
}

function formatSecondsRemaining(deadlineAt: number | null) {
  if (!deadlineAt) return null;
  const remaining = Math.max(
    0,
    Math.ceil((deadlineAt - Date.now()) / 1000),
  );
  const minutes = Math.floor(remaining / 60);
  const seconds = remaining % 60;
  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function sortItemsForDisplay(items: UserMistakeRecord[]) {
  return [...items].sort((left, right) => {
    const stateOrder = { incorrect: 0, training: 1, mastered: 2 } as const;
    if (stateOrder[left.masteryState] !== stateOrder[right.masteryState]) {
      return stateOrder[left.masteryState] - stateOrder[right.masteryState];
    }

    if (right.priorityScore !== left.priorityScore) {
      return right.priorityScore - left.priorityScore;
    }

    return (
      new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime()
    );
  });
}

export function QuestionBankMistakesPanel({
  sessionStatus,
  user,
}: {
  sessionStatus: SessionStatus;
  user: AuthSessionUser | null;
}) {
  const searchParams = useSearchParams();
  const [items, setItems] = useState<UserMistakeRecord[]>([]);
  const [trainingQuestions, setTrainingQuestions] = useState<
    UserMistakeTrainingQuestion[]
  >([]);
  const [stats, setStats] = useState<MistakeAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [trackFilter, setTrackFilter] =
    useState<MistakeTrackFilter>("all");
  const [countPreset, setCountPreset] =
    useState<QuestionCountPreset>(10);
  const [mode, setMode] = useState<TrainingMode>("standard");
  const [session, setSession] = useState<TrainingSession | null>(null);
  const [pendingMistakeId, setPendingMistakeId] = useState<number | null>(null);
  const [recordedSessions, setRecordedSessions] = useState<Record<number, true>>(
    {},
  );
  const [loadedDuel, setLoadedDuel] = useState<LoadedDuel | null>(null);
  const [isLoadingDuel, setIsLoadingDuel] = useState(false);
  const duelIdParam = Number(searchParams.get("duelId") ?? "");
  const shouldAutoStartDuel = searchParams.get("duelStart") === "1";

  async function loadMistakes() {
    if (sessionStatus !== "authenticated" || !user) return;

    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/mistakes", { cache: "no-store" });
      const payload = (await response.json()) as MistakesPayload;

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "تعذر تحميل قائمة الأخطاء.");
      }

      const nextItems = Array.isArray(payload.items) ? payload.items : [];
      const nextTrainingQuestions = Array.isArray(payload.trainingQuestions)
        ? payload.trainingQuestions
        : [];

      setItems(nextItems);
      setTrainingQuestions(nextTrainingQuestions);
      setStats(deriveStats(nextItems, nextTrainingQuestions, payload.stats ?? null));
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "تعذر تحميل قائمة الأخطاء.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadMistakes();
  }, [sessionStatus, user]);

  useEffect(() => {
    if (
      sessionStatus !== "authenticated" ||
      !user ||
      !Number.isFinite(duelIdParam) ||
      duelIdParam <= 0
    ) {
      setLoadedDuel(null);
      setIsLoadingDuel(false);
      return;
    }

    let cancelled = false;

    async function loadDuel() {
      setIsLoadingDuel(true);

      try {
        const response = await fetch(`/api/student/challenge/duels/${duelIdParam}`, {
          cache: "no-store",
        });
        const payload = (await response.json()) as DuelPayload;

        if (!response.ok || !payload.ok || !payload.data) {
          throw new Error(payload.message ?? "تعذر تحميل بيانات نزال 1v1.");
        }

        if (!cancelled) {
          setLoadedDuel(payload.data);
          setTrackFilter(payload.data.duel.track);
          setCountPreset(payload.data.duel.questionCount >= 20 ? 20 : 10);
          setMode("challenge");
        }
      } catch (error) {
        if (!cancelled) {
          setLoadedDuel(null);
          setMessage(
            error instanceof Error ? error.message : "تعذر تحميل بيانات نزال 1v1.",
          );
        }
      } finally {
        if (!cancelled) {
          setIsLoadingDuel(false);
        }
      }
    }

    void loadDuel();

    return () => {
      cancelled = true;
    };
  }, [duelIdParam, sessionStatus, user]);

  useEffect(() => {
    if (!session?.deadlineAt || session.completedAt) return;
    const deadlineAt = session.deadlineAt;

    const timer = window.setInterval(() => {
      if (Date.now() < deadlineAt) return;

      setSession((current) =>
        current && !current.completedAt
          ? {
              ...current,
              completedAt: Date.now(),
              timedOut: true,
            }
          : current,
      );
    }, 500);

    return () => window.clearInterval(timer);
  }, [session?.deadlineAt, session?.completedAt]);

  const grouped = useMemo(
    () => ({
      quantitative: sortItemsForDisplay(
        items.filter((item) => item.section === "quantitative"),
      ),
      verbal: sortItemsForDisplay(
        items.filter((item) => item.section === "verbal"),
      ),
    }),
    [items],
  );

  const currentStats = useMemo(
    () => deriveStats(items, trainingQuestions, stats),
    [items, stats, trainingQuestions],
  );

  const currentQuestion = useMemo(() => {
    if (!session) return null;
    return session.questions[session.currentIndex] ?? null;
  }, [session]);

  const currentSubmission = currentQuestion
    ? session?.submissions[currentQuestion.mistakeId] ?? null
    : null;
  const currentAnswer = currentQuestion
    ? session?.answers[currentQuestion.mistakeId] ?? ""
    : "";

  const sessionSummary = useMemo(() => {
    if (!session?.completedAt) return null;

    const total = session.questions.length;
    const correct = session.questions.filter(
      (question) => session.submissions[question.mistakeId]?.isCorrect,
    ).length;
    const percent = total ? Math.round((correct / total) * 100) : 0;

    return {
      total,
      correct,
      incorrect: Math.max(0, total - correct),
      percent,
      passed: percent >= SESSION_SUCCESS_PERCENT,
    };
  }, [session]);

  useEffect(() => {
    if (!loadedDuel || !shouldAutoStartDuel || session) return;
    if (!loadedDuel.duel.canStart || loadedDuel.duel.status !== "active") return;
    if (!loadedDuel.questions.length) return;

    startTraining("challenge", loadedDuel.questions, {
      duelId: loadedDuel.duel.id,
      duelLabel: `1v1 ضد ${loadedDuel.duel.opponentName}`,
      isDuel: true,
    });
  }, [loadedDuel, session, shouldAutoStartDuel]);

  useEffect(() => {
    if (!session?.completedAt || !sessionSummary) return;
    if (recordedSessions[session.sessionKey]) return;

    void recordSessionXp({
      sessionKey: session.sessionKey,
      mode: session.mode,
      track: session.trackFilter,
      questionCount: session.questions.length,
      percent: sessionSummary.percent,
      passed: sessionSummary.passed,
      duelId: session.duelId ?? null,
      durationMs: Math.max(0, (session.completedAt ?? Date.now()) - session.startedAt),
    }).catch((error) => {
      setMessage(
        error instanceof Error
          ? error.message
          : "تعذر حفظ XP الخاص بنتيجة الجلسة.",
      );
    });
  }, [recordedSessions, session, sessionSummary]);

  function updateLocalMistake(nextItem: UserMistakeRecord | null) {
    if (!nextItem) return;

    setItems((previous) =>
      previous.map((item) => (item.id === nextItem.id ? nextItem : item)),
    );

    setTrainingQuestions((previous) =>
      previous.map((question) =>
        question.mistakeId === nextItem.id
          ? {
              ...question,
              masteryState: nextItem.masteryState,
              masteryPercent: nextItem.masteryPercent,
              priorityScore: nextItem.priorityScore,
              incorrectCount: nextItem.incorrectCount,
              correctCount: nextItem.correctCount,
              removalThreshold: nextItem.removalThreshold,
              trainingAttemptsCount: nextItem.trainingAttemptsCount,
              trainingCorrectCount: nextItem.trainingCorrectCount,
            }
          : question,
      ),
    );
  }

  async function handleRemove(mistakeId: number) {
    const confirmed = window.confirm("هل تريد حذف هذا السؤال من قائمة الأخطاء؟");
    if (!confirmed) return;

    setPendingMistakeId(mistakeId);
    setMessage("");

    try {
      const response = await fetch(`/api/mistakes/${mistakeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        throw new Error(payload.message ?? "تعذر حذف السؤال من الأخطاء.");
      }

      setItems((previous) =>
        previous.filter((item) => item.id !== mistakeId),
      );
      setTrainingQuestions((previous) =>
        previous.filter((question) => question.mistakeId !== mistakeId),
      );
      setSession((current) =>
        current
          ? {
              ...current,
              questions: current.questions.filter(
                (question) => question.mistakeId !== mistakeId,
              ),
            }
          : current,
      );
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "تعذر حذف السؤال من الأخطاء.",
      );
    } finally {
      setPendingMistakeId(null);
    }
  }

  async function handleStateChange(
    mistakeId: number,
    masteryState: MistakeMasteryState,
  ) {
    setPendingMistakeId(mistakeId);
    setMessage("");

    try {
      const response = await fetch(`/api/mistakes/${mistakeId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "set_state",
          masteryState,
        }),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        item?: UserMistakeRecord | null;
        message?: string;
      };

      if (!response.ok || !payload.ok || !payload.item) {
        throw new Error(
          payload.message ?? "تعذر تحديث حالة السؤال داخل الأخطاء.",
        );
      }

      updateLocalMistake(payload.item);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "تعذر تحديث حالة السؤال داخل الأخطاء.",
      );
    } finally {
      setPendingMistakeId(null);
    }
  }

  async function recordTrainingAttempt(
    mistakeId: number,
    outcome: "correct" | "incorrect",
  ) {
    const response = await fetch(`/api/mistakes/${mistakeId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "record_training",
        outcome,
      }),
    });

    const payload = (await response.json()) as {
      ok?: boolean;
      item?: UserMistakeRecord | null;
      message?: string;
    };

    if (!response.ok || !payload.ok || !payload.item) {
      throw new Error(
        payload.message ?? "تعذر تسجيل نتيجة التدريب لهذا السؤال.",
      );
    }

    updateLocalMistake(payload.item);
    return payload.item;
  }

  async function recordSessionXp(input: {
    sessionKey: number;
    mode: TrainingMode;
    track: MistakeTrackFilter;
    questionCount: number;
    percent: number;
    passed: boolean;
    abandoned?: boolean;
    duelId?: number | null;
    durationMs?: number | null;
  }) {
    if (recordedSessions[input.sessionKey]) return;

    const response = await fetch("/api/student/gamification/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sessionKey: String(input.sessionKey),
        mode: input.mode,
        track: input.track,
        questionCount: input.questionCount,
        percent: input.percent,
        passed: input.passed,
        abandoned: input.abandoned ?? false,
        duelId: input.duelId ?? null,
        durationMs: input.durationMs ?? null,
      }),
    });

    const payload = (await response.json()) as SessionXpPayload;

    if (!response.ok || !payload.ok) {
      throw new Error(
        payload.message ?? "تعذر حفظ نقاط XP الخاصة بجلسة الأخطاء.",
      );
    }

    setRecordedSessions((previous) => ({
      ...previous,
      [input.sessionKey]: true,
    }));

    const totalAwarded = payload.data?.totalAwarded ?? 0;
    const awardedLabels =
      payload.data?.awarded
        ?.map((item) => `${item.points > 0 ? "+" : ""}${item.points} XP`)
        .join(" + ") ?? "";

    if (totalAwarded !== 0) {
      let nextMessage = `تم تحديث نقاطك: ${awardedLabels || `${totalAwarded > 0 ? "+" : ""}${totalAwarded} XP`}.`;
      if (payload.data?.duel) {
        nextMessage += ` ${payload.data.duel.resultLabel}`;
        if (payload.data.duel.opponentPercent != null) {
          nextMessage += ` (${payload.data.duel.myPercent ?? 0}% مقابل ${payload.data.duel.opponentPercent}%).`;
        } else {
          nextMessage += ".";
        }
      }
      setSuccessMessage(nextMessage);
      return;
    }

    if (input.abandoned) {
      setSuccessMessage("تم حفظ إنهاء الجلسة.");
      return;
    }

    if (payload.data?.duel) {
      setSuccessMessage(payload.data.duel.resultLabel);
    }
  }

  async function handleExitSession() {
    if (!session) return;

    const correct = session.questions.filter(
      (question) => session.submissions[question.mistakeId]?.isCorrect,
    ).length;
    const percent = session.questions.length
      ? Math.round((correct / session.questions.length) * 100)
      : 0;

    try {
      if (
        session.completedAt &&
        !recordedSessions[session.sessionKey]
      ) {
        await recordSessionXp({
          sessionKey: session.sessionKey,
          mode: session.mode,
          track: session.trackFilter,
          questionCount: session.questions.length,
          percent,
          passed: percent >= SESSION_SUCCESS_PERCENT,
          duelId: session.duelId ?? null,
          durationMs: Math.max(0, Date.now() - session.startedAt),
        });
      }
      if (!session.completedAt && session.mode === "challenge") {
        await recordSessionXp({
          sessionKey: session.sessionKey,
          mode: session.mode,
          track: session.trackFilter,
          questionCount: session.questions.length,
          percent,
          passed: false,
          abandoned: true,
          duelId: session.duelId ?? null,
          durationMs: Math.max(0, Date.now() - session.startedAt),
        });
      }
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "تعذر حفظ إنهاء جلسة التحدي.",
      );
    }

    setSession(null);
  }

  function startTraining(
    nextMode = mode,
    overrideQuestions?: UserMistakeTrainingQuestion[],
    duelMeta?: {
      duelId?: number | null;
      duelLabel?: string | null;
      isDuel?: boolean;
    },
  ) {
    const selectedQuestions =
      overrideQuestions ??
      pickSessionQuestions(
        trainingQuestions,
        trackFilter,
        countPreset,
        nextMode,
      );

    if (!selectedQuestions.length) {
      setMessage(
        "لا توجد أسئلة قابلة للتدريب داخل الفلتر الحالي. جرّب اللفظي أو الكل، أو افتح السؤال الأصلي أولًا.",
      );
      return;
    }

    setMessage("");
    setSuccessMessage("");
    setMode(nextMode);
    setSuccessMessage("");
    setSession({
      sessionKey: Date.now(),
      mode: nextMode,
      trackFilter,
      countPreset,
      questions: selectedQuestions,
      currentIndex: 0,
      answers: {},
      submissions: {},
      startedAt: Date.now(),
      deadlineAt:
        nextMode === "challenge"
          ? Date.now() + getChallengeSeconds(selectedQuestions.length) * 1000
          : null,
      completedAt: null,
      timedOut: false,
      duelId: duelMeta?.duelId ?? null,
      duelLabel: duelMeta?.duelLabel ?? null,
      isDuel: Boolean(duelMeta?.isDuel),
    });
  }

  function repeatCurrentConfig() {
    const sourceMode = session?.mode ?? mode;
    const sourceTrack = session?.trackFilter ?? trackFilter;
    const sourceCount = session?.countPreset ?? countPreset;

    const selectedQuestions = pickSessionQuestions(
      trainingQuestions,
      sourceTrack,
      sourceCount,
      sourceMode,
    );

    setSession({
      sessionKey: Date.now(),
      mode: sourceMode,
      trackFilter: sourceTrack,
      countPreset: sourceCount,
      questions: selectedQuestions,
      currentIndex: 0,
      answers: {},
      submissions: {},
      startedAt: Date.now(),
      deadlineAt:
        sourceMode === "challenge"
          ? Date.now() + getChallengeSeconds(selectedQuestions.length) * 1000
          : null,
      completedAt: null,
      timedOut: false,
      duelId: null,
      duelLabel: null,
      isDuel: false,
    });
  }

  function setCurrentAnswer(answer: string) {
    if (!session || !currentQuestion || currentSubmission) return;

    setSession({
      ...session,
      answers: {
        ...session.answers,
        [currentQuestion.mistakeId]: answer,
      },
    });
  }

  async function submitCurrentAnswer() {
    if (!session || !currentQuestion || currentSubmission) return;
    const selectedAnswer = session.answers[currentQuestion.mistakeId];
    if (!selectedAnswer) return;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    try {
      if (!session.isDuel) {
        await recordTrainingAttempt(
          currentQuestion.mistakeId,
          isCorrect ? "correct" : "incorrect",
        );
      }

      const nextSession: TrainingSession = {
        ...session,
        submissions: {
          ...session.submissions,
          [currentQuestion.mistakeId]: {
            selectedAnswer,
            isCorrect,
          },
        },
      };

      const isLastQuestion =
        session.currentIndex >= session.questions.length - 1;

      if (session.mode === "speed" && !isLastQuestion) {
        setSession({
          ...nextSession,
          currentIndex: session.currentIndex + 1,
        });
        return;
      }

      if (isLastQuestion) {
        setSession({
          ...nextSession,
          completedAt: Date.now(),
        });
        return;
      }

      setSession(nextSession);
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "تعذر حفظ نتيجة السؤال داخل تدريب الأخطاء.",
      );
    }
  }

  function goToNextQuestion() {
    if (!session) return;

    if (session.currentIndex >= session.questions.length - 1) {
      setSession({
        ...session,
        completedAt: Date.now(),
      });
      return;
    }

    setSession({
      ...session,
      currentIndex: session.currentIndex + 1,
    });
  }

  if (sessionStatus === "loading") {
    return (
      <div className="rounded-[1.9rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#123B7A]" />
        <p className="mt-3 text-sm text-slate-500">
          جارٍ تجهيز قائمة الأخطاء الخاصة بحسابك...
        </p>
      </div>
    );
  }

  if (sessionStatus !== "authenticated" || !user) {
    return (
      <div className="rounded-[1.9rem] border border-[#E8D8B3] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,247,244,0.96))] p-8 shadow-soft">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-amber-50 text-[#C99A43]">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="display-font text-2xl font-bold text-slate-950">
              يجب إنشاء حساب وتسجيل الدخول للوصول إلى قائمة الأخطاء
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-8 text-slate-600">
              لن يتم حفظ الأسئلة الخاطئة لغير المسجلين. بعد تسجيل الدخول ستظهر
              لك قائمة أخطائك، وتستطيع التدريب عليها، وتحويل السؤال بين
              “أخطأت فيه” و“قيد التدريب” و“أتقنته”.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/login?next=/question-bank?track=mistakes"
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/register?next=/question-bank?track=mistakes"
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
              >
                إنشاء حساب
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const masteryBadge = getMasteryBadge(currentStats.masteryPercent);

  return (
    <div className="space-y-6" id="mistakes-trainer">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="أخطائي الآن"
          value={`${currentStats.activeCount}`}
          caption={`من أصل ${currentStats.totalCount} سؤال محفوظ داخل ملفك.`}
          icon={AlertTriangle}
          tone="rose"
        />
        <MetricCard
          title="نسبة الإتقان"
          value={`${currentStats.masteryPercent}%`}
          caption={`${masteryBadge.label} — الوصول إلى 90%+ يعني أنك تجاوزت هذا الجزء بإتقان.`}
          icon={Trophy}
          tone="emerald"
        />
        <MetricCard
          title="أضعف نقطة"
          value={currentStats.weakestTypeLabel ?? "—"}
          caption={
            currentStats.weakestCount
              ? `أنت ضعيف حاليًا في ${currentStats.weakestTypeLabel} (${currentStats.weakestCount} أسئلة).`
              : "سيظهر هنا أكثر نوع يتكرر في أخطائك."
          }
          icon={Brain}
          tone="blue"
        />
        <MetricCard
          title="قابل للتدريب"
          value={`${currentStats.trainableCount}`}
          caption={
            currentStats.unresolvedCount
              ? `هناك ${currentStats.unresolvedCount} سؤال لم نستطع بناؤه داخل الاختبار بعد، لكنه ما زال محفوظًا في القائمة.`
              : "كل الأسئلة القابلة للبناء جاهزة لاختبار الأخطاء الآن."
          }
          icon={Sparkles}
          tone="amber"
        />
      </div>

      {message ? (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {message}
        </div>
      ) : null}

      {successMessage ? (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <section className="rounded-[1.9rem] border border-[#E8D8B3] bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(250,248,244,0.96))] p-6 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="display-font text-2xl font-bold text-slate-950">
              تدرب على أخطائك
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-8 text-slate-600">
              اختر المسار، وحدد عدد الأسئلة، ثم ابدأ جلسة ذكية مبنية على
              الأسئلة التي أخطأت فيها سابقًا. النجاح هنا يبدأ من 90% فأعلى.
            </p>
          </div>

          <button
            type="button"
            onClick={() => startTraining("worst10")}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#123B7A] hover:text-[#123B7A]"
          >
            <Zap className="h-4 w-4" />
            ركز على أسوأ 10 أسئلة عندي
          </button>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
          <div className="space-y-5 rounded-[1.6rem] border border-slate-200 bg-white p-5">
            <div>
              <div className="text-sm font-bold text-slate-900">
                اختر المسار
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {([
                  { id: "all", label: "الكل" },
                  { id: "verbal", label: "لفظي" },
                  { id: "quantitative", label: "كمي" },
                ] as const).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTrackFilter(item.id)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      trackFilter === item.id
                        ? "bg-[#123B7A] text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-bold text-slate-900">
                عدد الأسئلة
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {([10, 20, "all"] as const).map((item) => (
                  <button
                    key={String(item)}
                    type="button"
                    onClick={() => setCountPreset(item)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      countPreset === item
                        ? "bg-[#123B7A] text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {item === "all" ? "كل الأخطاء" : item}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="text-sm font-bold text-slate-900">
                نمط التدريب
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {([
                  {
                    id: "standard",
                    title: "تدريب عادي",
                    hint: "شرح وإعادة واضحة بعد كل سؤال",
                  },
                  {
                    id: "challenge",
                    title: "وضع التحدي",
                    hint: "وقت محدود ويجب أن تصل إلى 90%+",
                  },
                  {
                    id: "speed",
                    title: "وضع السرعة",
                    hint: "بدون إطالة في الشرح بين الأسئلة",
                  },
                  {
                    id: "bedtime",
                    title: "مراجعة قبل النوم",
                    hint: "5 أسئلة قصيرة من أخطائك فقط",
                  },
                ] as const).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setMode(item.id)}
                    className={`rounded-[1.3rem] border px-4 py-4 text-right transition ${
                      mode === item.id
                        ? "border-transparent bg-[linear-gradient(135deg,#102955,#123B7A_55%,#2f5fa7)] text-white shadow-[0_18px_36px_rgba(18,59,122,0.18)]"
                        : "border-slate-200 bg-slate-50 text-slate-700 hover:border-[#C99A43] hover:bg-white"
                    }`}
                  >
                    <div className="text-sm font-bold">{item.title}</div>
                    <div
                      className={`mt-2 text-xs leading-6 ${
                        mode === item.id ? "text-white/75" : "text-slate-500"
                      }`}
                    >
                      {item.hint}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-slate-200 bg-white p-5">
            <div className="text-sm font-bold text-slate-900">
              تحليل أخطائك
            </div>
            <div className="mt-4 space-y-4">
              <AnalysisRow
                title="الحالة الحالية"
                value={`${currentStats.incorrectCount} خطأ مباشر / ${currentStats.trainingCount} قيد التدريب / ${currentStats.masteredCount} متقن`}
              />
              <AnalysisRow
                title="المسار الأكثر حضورًا"
                value={
                  currentStats.weakestSection === "quantitative"
                    ? "الكمي"
                    : currentStats.weakestSection === "verbal"
                      ? "اللفظي"
                      : "—"
                }
              />
              <AnalysisRow
                title="نسبة الإتقان"
                value={`${currentStats.masteryPercent}% — ${masteryBadge.label}`}
              />
              <AnalysisRow
                title="جاهز للاختبار الآن"
                value={`${currentStats.trainableVerbalCount} لفظي / ${currentStats.trainableQuantitativeCount} كمي`}
              />
            </div>

          <div className="mt-5 overflow-hidden rounded-[1.2rem] bg-slate-100">
            <div
              className={`h-3 ${masteryBadge.progressClassName}`}
              style={{ width: `${Math.max(4, currentStats.masteryPercent)}%` }}
            />
          </div>

          {isLoadingDuel ? (
            <div className="mt-5 rounded-[1.4rem] border border-[#dbe6f6] bg-[#f3f8ff] p-4 text-sm text-[#123B7A]">
              جاري تجهيز بيانات نزال 1v1...
            </div>
          ) : loadedDuel ? (
            <div className="mt-5 rounded-[1.4rem] border border-[#dbe6f6] bg-[#f3f8ff] p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-bold text-slate-950">
                    نزال 1v1 ضد {loadedDuel.duel.opponentName}
                  </div>
                  <div className="mt-2 text-sm leading-7 text-slate-600">
                    {loadedDuel.duel.resultLabel} • {loadedDuel.duel.questionCount} أسئلة •{" "}
                    {getTrackLabel(loadedDuel.duel.track)}
                  </div>
                </div>
                <span className="rounded-full bg-white px-3 py-2 text-xs font-semibold text-[#123B7A]">
                  الفائز يحصل على XP إضافي
                </span>
              </div>
            </div>
          ) : null}

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => startTraining(mode)}
                className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
              >
                <Target className="h-4 w-4" />
                ابدأ تدريب الآن
              </button>
              <button
                type="button"
                onClick={() => startTraining("challenge")}
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
              >
                <TimerReset className="h-4 w-4" />
                اختبرني بتحدي
              </button>
              {loadedDuel?.duel.canStart ? (
                <button
                  type="button"
                  onClick={() =>
                    startTraining("challenge", loadedDuel.questions, {
                      duelId: loadedDuel.duel.id,
                      duelLabel: `1v1 ضد ${loadedDuel.duel.opponentName}`,
                      isDuel: true,
                    })
                  }
                  className="inline-flex items-center gap-2 rounded-2xl border border-[#123B7A] bg-[#123B7A] px-5 py-3 text-sm font-semibold text-white"
                >
                  <Trophy className="h-4 w-4" />
                  ابدأ نزال 1v1
                </button>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {session ? (
        <section className="rounded-[1.9rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="text-sm font-semibold text-[#123B7A]">
                {getModeLabel(session.mode)} / {getTrackLabel(session.trackFilter)} /{" "}
                سؤال {Math.min(session.currentIndex + 1, session.questions.length)} من{" "}
                {session.questions.length}
              </div>
              <div className="mt-2 display-font text-2xl font-bold text-slate-950">
                {session.completedAt
                  ? "نتيجة تدريب الأخطاء"
                  : "جلسة تدريب أخطاء فعّالة"}
              </div>
              {session.duelLabel ? (
                <div className="mt-2 text-sm font-semibold text-[#123B7A]">
                  {session.duelLabel}
                </div>
              ) : null}
              <p className="mt-2 max-w-3xl text-sm leading-8 text-slate-600">
                يجب أن تصل إلى {SESSION_SUCCESS_PERCENT}% أو أكثر حتى تعتبر هذا
                الجزء متقنًا.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {session.deadlineAt && !session.completedAt ? (
                <div className="rounded-full bg-amber-50 px-4 py-2 text-sm font-bold text-amber-700">
                  الوقت المتبقي: {formatSecondsRemaining(session.deadlineAt)}
                </div>
              ) : null}
              {!session.isDuel ? (
                <button
                  type="button"
                  onClick={repeatCurrentConfig}
                  className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
                >
                  <RefreshCcw className="h-4 w-4" />
                  إعادة الاختبار
                </button>
              ) : null}
            </div>
          </div>

          {session.completedAt && sessionSummary ? (
            <div className="mt-6 rounded-[1.6rem] border border-slate-200 bg-slate-50/70 p-6">
              <div
                className={`inline-flex rounded-full px-4 py-2 text-sm font-bold ${
                  sessionSummary.passed
                    ? "bg-emerald-50 text-emerald-700"
                    : "bg-rose-50 text-rose-700"
                }`}
              >
                {sessionSummary.passed
                  ? "ممتاز — تجاوزت حد الإتقان"
                  : "لا زال عندك ضعف في هذا الجزء"}
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-4">
                <MetricValueCard
                  title="النسبة"
                  value={`${sessionSummary.percent}%`}
                />
                <MetricValueCard
                  title="إجابات صحيحة"
                  value={`${sessionSummary.correct}`}
                />
                <MetricValueCard
                  title="إجابات خاطئة"
                  value={`${sessionSummary.incorrect}`}
                />
                <MetricValueCard
                  title="المقارنة"
                  value={`${currentStats.masteryPercent}% → ${sessionSummary.percent}%`}
                />
              </div>

              {session.timedOut ? (
                <div className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
                  انتهى وقت التحدي قبل إكمال الجلسة، واعتُبرت الأسئلة المتبقية
                  غير صحيحة في النتيجة النهائية.
                </div>
              ) : null}

              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={repeatCurrentConfig}
                  className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
                >
                  إعادة الاختبار
                </button>
                <button
                  type="button"
                  onClick={() => void handleExitSession()}
                  className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
                >
                  إنهاء الجلسة
                </button>
              </div>
            </div>
          ) : currentQuestion ? (
            <div className="mt-6">
              <div className="rounded-[1.6rem] border border-[#E8D8B3] bg-[#fffaf0] p-5">
                <div className="text-sm font-semibold text-[#123B7A]">
                  {currentQuestion.questionTypeLabel}
                  {currentQuestion.passageTitle
                    ? ` / ${currentQuestion.passageTitle}`
                    : currentQuestion.categoryTitle
                      ? ` / ${currentQuestion.categoryTitle}`
                      : ""}
                </div>
                <h3 className="mt-3 display-font text-2xl font-bold leading-10 text-slate-950">
                  {currentQuestion.questionText}
                </h3>
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                {currentQuestion.options.map((option, index) => {
                  const isSelected = currentAnswer === option;
                  const isCorrect =
                    currentSubmission?.isCorrect &&
                    option === currentQuestion.correctAnswer;
                  const isWrongSelected =
                    currentSubmission &&
                    currentSubmission.selectedAnswer === option &&
                    !currentSubmission.isCorrect;

                  return (
                    <button
                      key={`${currentQuestion.mistakeId}-${index + 1}`}
                      type="button"
                      disabled={Boolean(currentSubmission)}
                      onClick={() => setCurrentAnswer(option)}
                      className={`rounded-[1.4rem] border px-5 py-5 text-right transition ${
                        isCorrect
                          ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                          : isWrongSelected
                            ? "border-rose-300 bg-rose-50 text-rose-900"
                            : isSelected
                              ? "border-[#123B7A] bg-[#eef4ff] text-[#123B7A]"
                              : "border-slate-200 bg-white text-slate-800 hover:border-[#C99A43] hover:bg-[#fffaf1]"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <span className="flex-1 text-lg leading-8">{option}</span>
                        <span className="text-sm font-bold">
                          {["أ", "ب", "ج", "د"][index] ?? index + 1}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                {session.mode === "challenge" && !session.completedAt ? (
                  <button
                    type="button"
                    onClick={() => void handleExitSession()}
                    className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-3 text-sm font-semibold text-rose-700"
                  >
                    إنهاء مبكر
                  </button>
                ) : null}

                {!currentSubmission ? (
                  <button
                    type="button"
                    onClick={() => void submitCurrentAnswer()}
                    disabled={!currentAnswer}
                    className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"
                  >
                    تأكيد الإجابة
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={goToNextQuestion}
                    className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
                  >
                    {session.currentIndex >= session.questions.length - 1
                      ? "إنهاء الجلسة"
                      : "السؤال التالي"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => handleStateChange(currentQuestion.mistakeId, "mastered")}
                  disabled={pendingMistakeId === currentQuestion.mistakeId}
                  className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-700 disabled:opacity-60"
                >
                  ✔ تم إتقانه
                </button>
                <button
                  type="button"
                  onClick={() => handleStateChange(currentQuestion.mistakeId, "training")}
                  disabled={pendingMistakeId === currentQuestion.mistakeId}
                  className="rounded-2xl border border-sky-200 bg-sky-50 px-5 py-3 text-sm font-semibold text-sky-700 disabled:opacity-60"
                >
                  🔁 قيد التدريب
                </button>
                {currentQuestion.questionHref ? (
                  <Link
                    href={currentQuestion.questionHref}
                    className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
                  >
                    افتح السؤال الأصلي
                  </Link>
                ) : null}
              </div>

              {currentSubmission ? (
                <div
                  className={`mt-6 rounded-[1.4rem] border px-5 py-5 text-base leading-8 ${
                    currentSubmission.isCorrect
                      ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                      : "border-rose-200 bg-rose-50 text-rose-900"
                  }`}
                >
                  <div className="text-xl font-bold">
                    {currentSubmission.isCorrect
                      ? "إجابة صحيحة"
                      : "إجابة خاطئة"}
                  </div>
                  {!currentSubmission.isCorrect ? (
                    <div className="mt-3">
                      <span className="font-bold">الإجابة الصحيحة:</span>{" "}
                      {currentQuestion.correctAnswer}
                    </div>
                  ) : null}
                  {session.mode !== "speed" ? (
                    <div className="mt-3">
                      <span className="font-bold">الشرح:</span>{" "}
                      {currentQuestion.explanation}
                    </div>
                  ) : (
                    <div className="mt-3 text-sm font-semibold">
                      وضع السرعة يخفي الشرح التفصيلي حتى تركز على التكرار السريع.
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}

      <section className="rounded-[1.9rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="display-font text-2xl font-bold text-slate-950">
              قائمة الأخطاء الذكية
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-8 text-slate-600">
              كل سؤال هنا يحمل حالة واضحة: أخطأت فيه، قيد التدريب، أو أتقنته.
              ويمكنك نقله بين الحالات يدويًا أو عبر جلسات التدريب.
            </p>
          </div>
          <button
            type="button"
            onClick={() => void loadMistakes()}
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700"
          >
            <RefreshCcw className="h-4 w-4" />
            تحديث القائمة
          </button>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-2">
          <MistakeListSection
            title="أخطاء الكمي"
            items={grouped.quantitative}
            pendingMistakeId={pendingMistakeId}
            onRemove={handleRemove}
            onStateChange={handleStateChange}
            isLoading={isLoading}
            emptyMessage="لا توجد أسئلة كمي محفوظة في الأخطاء حاليًا."
          />
          <MistakeListSection
            title="أخطاء اللفظي"
            items={grouped.verbal}
            pendingMistakeId={pendingMistakeId}
            onRemove={handleRemove}
            onStateChange={handleStateChange}
            isLoading={isLoading}
            emptyMessage="لا توجد أسئلة لفظي محفوظة في الأخطاء حاليًا."
          />
        </div>
      </section>
    </div>
  );
}

function MetricCard({
  title,
  value,
  caption,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string;
  caption: string;
  icon: typeof AlertTriangle;
  tone: "rose" | "emerald" | "blue" | "amber";
}) {
  const toneMap = {
    rose: "bg-rose-50 text-rose-700",
    emerald: "bg-emerald-50 text-emerald-700",
    blue: "bg-[#eef4ff] text-[#123B7A]",
    amber: "bg-amber-50 text-amber-700",
  } as const;

  return (
    <article className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs font-semibold tracking-[0.14em] text-slate-400">
            {title}
          </div>
          <div className="mt-3 display-font text-3xl font-extrabold text-slate-950">
            {value}
          </div>
          <div className="mt-2 text-sm leading-7 text-slate-500">{caption}</div>
        </div>
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] ${toneMap[tone]}`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}

function MetricValueCard({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.4rem] border border-slate-200 bg-white px-4 py-4">
      <div className="text-xs font-semibold text-slate-500">{title}</div>
      <div className="mt-3 display-font text-2xl font-bold text-slate-950">
        {value}
      </div>
    </div>
  );
}

function AnalysisRow({
  title,
  value,
}: {
  title: string;
  value: string;
}) {
  return (
    <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50/70 px-4 py-3">
      <div className="text-xs font-semibold text-slate-500">{title}</div>
      <div className="mt-2 text-sm font-bold text-slate-900">{value}</div>
    </div>
  );
}

function MistakeListSection({
  title,
  items,
  pendingMistakeId,
  onRemove,
  onStateChange,
  isLoading,
  emptyMessage,
}: {
  title: string;
  items: UserMistakeRecord[];
  pendingMistakeId: number | null;
  onRemove: (mistakeId: number) => void;
  onStateChange: (
    mistakeId: number,
    masteryState: MistakeMasteryState,
  ) => void;
  isLoading: boolean;
  emptyMessage: string;
}) {
  return (
    <section className="rounded-[1.7rem] border border-slate-200 bg-slate-50/60 p-5">
      <div className="flex items-center justify-between gap-3">
        <h3 className="display-font text-xl font-bold text-slate-950">{title}</h3>
        <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
          {items.length} سؤال
        </span>
      </div>

      {isLoading ? (
        <div className="mt-5 rounded-[1.3rem] border border-dashed border-slate-300 bg-white p-5 text-center text-sm text-slate-500">
          جارٍ تحميل القائمة...
        </div>
      ) : items.length ? (
        <div className="mt-5 space-y-3">
          {items.map((item) => {
            const stateMeta = getStateMeta(item.masteryState);
            const masteryMeta = getMasteryBadge(item.masteryPercent);
            const passageTitle =
              typeof item.metadata?.passageTitle === "string"
                ? item.metadata.passageTitle
                : null;

            return (
              <article
                key={item.id}
                className="rounded-[1.4rem] border border-slate-200 bg-white p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm font-semibold text-[#123B7A]">
                    {item.questionTypeLabel}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${stateMeta.className}`}
                    >
                      {stateMeta.label}
                    </span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${masteryMeta.className}`}
                    >
                      {item.masteryPercent}% {masteryMeta.label}
                    </span>
                  </div>
                </div>

                <h4 className="mt-3 text-base font-bold leading-8 text-slate-950">
                  {item.questionText}
                </h4>

                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    {item.sourceBank}
                  </span>
                  {passageTitle ? (
                    <span className="rounded-full bg-slate-100 px-3 py-1">
                      {passageTitle}
                    </span>
                  ) : null}
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    أخطأت فيها {item.incorrectCount} مرة
                  </span>
                  <span className="rounded-full bg-slate-100 px-3 py-1">
                    صححتها {item.correctCount} من {item.removalThreshold}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  {item.questionHref ? (
                    <Link
                      href={item.questionHref}
                      className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
                    >
                      افتح السؤال
                    </Link>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => onStateChange(item.id, "mastered")}
                    disabled={pendingMistakeId === item.id}
                    className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 disabled:opacity-60"
                  >
                    تم إتقانه
                  </button>
                  <button
                    type="button"
                    onClick={() => onStateChange(item.id, "training")}
                    disabled={pendingMistakeId === item.id}
                    className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm font-semibold text-sky-700 disabled:opacity-60"
                  >
                    قيد التدريب
                  </button>
                  <button
                    type="button"
                    onClick={() => onStateChange(item.id, "incorrect")}
                    disabled={pendingMistakeId === item.id}
                    className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 disabled:opacity-60"
                  >
                    أعده إلى الأخطاء
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    disabled={pendingMistakeId === item.id}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 disabled:opacity-60"
                  >
                    {pendingMistakeId === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    حذف من الأخطاء
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-5 rounded-[1.3rem] border border-dashed border-slate-300 bg-white p-5 text-center text-sm text-slate-500">
          {emptyMessage}
        </div>
      )}
    </section>
  );
}
