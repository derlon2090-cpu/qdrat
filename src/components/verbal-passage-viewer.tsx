"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  Flag,
  Pin,
  RotateCcw,
  ScrollText,
  Sparkles,
} from "lucide-react";

import { useAuthSession } from "@/hooks/use-auth-session";
import {
  persistClientQuestionFlags,
  readClientQuestionFlags,
  toggleClientQuestionFlag,
} from "@/lib/client-question-flags";
import {
  loadSectionProgressFromClient,
  resetSectionProgressFromClient,
} from "@/lib/client-section-progress";
import {
  trackQuestionProgressFromClient,
  type ClientQuestionProgressResult,
} from "@/lib/client-question-progress";
import { trackMistakeFromClient } from "@/lib/client-mistakes";
import type { VerbalPassageRecord } from "@/lib/verbal-passages";

type ViewerMode = "student" | "admin";
type SavedAnswerMap = Record<string, "A" | "B" | "C" | "D" | undefined>;
type SavedSubmissionMap = Record<string, boolean | undefined>;
type PassageQuestionProgressState = "current" | "correct" | "incorrect" | "unanswered";
type ProgressFeedback = ClientQuestionProgressResult | null;

const SAVED_ANSWERS_KEY = "miyaar-verbal-reading-answers";
const SAVED_SUBMISSIONS_KEY = "miyaar-verbal-reading-submissions";

function formatElapsedLabel(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function normalizeDisplaySpacing(value: string) {
  return value
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/\s+/g, " ")
    .replace(/ \(/g, " (")
    .trim();
}

function looksLikeDamagedDisplayParagraph(value: string) {
  const compact = value.replace(/\s+/g, " ").trim();
  if (compact.length < 16) {
    return true;
  }

  const repeatedRuns = compact.match(/([\u0621-\u064A])\1{4,}/gu) ?? [];
  if (repeatedRuns.length >= 2 || repeatedRuns.some((run) => run.length >= 6)) {
    return true;
  }

  const tokens = compact.split(" ").filter(Boolean);
  const arabicTokens = tokens.filter((token) => /^[\u0621-\u064A]+$/u.test(token));

  if (arabicTokens.length >= 8) {
    const longTokens = arabicTokens.filter((token) => token.length >= 14).length;
    if (longTokens / arabicTokens.length > 0.2) {
      return true;
    }
  }

  return false;
}

function formatPassageForDisplay(value: string) {
  const paragraphs = value
    .split(/\n{2,}/)
    .map((paragraph) => normalizeDisplaySpacing(paragraph))
    .filter(Boolean);

  const cleaned = paragraphs.filter((paragraph, index) => {
    if (index === paragraphs.length - 1 && looksLikeDamagedDisplayParagraph(paragraph)) {
      return false;
    }

    return !looksLikeDamagedDisplayParagraph(paragraph) || paragraph.length >= 40;
  });

  return (cleaned.length ? cleaned : paragraphs).join("\n\n");
}

function getChoiceLabel(index: number) {
  return ["أ", "ب", "ج", "د"][index] ?? String(index + 1);
}

function getQuestionOptions(question: VerbalPassageRecord["questions"][number]) {
  return [
    { key: "A" as const, label: getChoiceLabel(0), text: question.optionA },
    { key: "B" as const, label: getChoiceLabel(1), text: question.optionB },
    { key: "C" as const, label: getChoiceLabel(2), text: question.optionC },
    { key: "D" as const, label: getChoiceLabel(3), text: question.optionD },
  ];
}

function getCorrectAnswerText(question: VerbalPassageRecord["questions"][number]) {
  switch (question.correctOption) {
    case "A":
      return question.optionA;
    case "B":
      return question.optionB;
    case "C":
      return question.optionC;
    case "D":
    default:
      return question.optionD;
  }
}

function readSavedAnswers() {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.sessionStorage.getItem(SAVED_ANSWERS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as SavedAnswerMap) : {};
  } catch {
    return {};
  }
}

function persistSavedAnswers(value: SavedAnswerMap) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(SAVED_ANSWERS_KEY, JSON.stringify(value));
}

function readSavedSubmissions() {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.sessionStorage.getItem(SAVED_SUBMISSIONS_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" ? (parsed as SavedSubmissionMap) : {};
  } catch {
    return {};
  }
}

function persistSavedSubmissions(value: SavedSubmissionMap) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(SAVED_SUBMISSIONS_KEY, JSON.stringify(value));
}

function clearPassageAnswers(passageSlug: string) {
  const savedAnswers = readSavedAnswers();
  const nextEntries = Object.entries(savedAnswers).filter(
    ([key]) => !key.startsWith(`${passageSlug}:`),
  );
  const nextAnswers = Object.fromEntries(nextEntries) as SavedAnswerMap;
  persistSavedAnswers(nextAnswers);
  return nextAnswers;
}

function clearPassageSubmissions(passageSlug: string) {
  const savedSubmissions = readSavedSubmissions();
  const nextEntries = Object.entries(savedSubmissions).filter(
    ([key]) => !key.startsWith(`${passageSlug}:`),
  );
  const nextSubmissions = Object.fromEntries(nextEntries) as SavedSubmissionMap;
  persistSavedSubmissions(nextSubmissions);
  return nextSubmissions;
}

function replacePassageAnswers(
  savedAnswers: SavedAnswerMap,
  passageSlug: string,
  nextPassageAnswers: SavedAnswerMap,
) {
  const preservedEntries = Object.entries(savedAnswers).filter(
    ([key]) => !key.startsWith(`${passageSlug}:`),
  );

  return {
    ...Object.fromEntries(preservedEntries),
    ...nextPassageAnswers,
  } as SavedAnswerMap;
}

function replacePassageSubmissions(
  savedSubmissions: SavedSubmissionMap,
  passageSlug: string,
  nextPassageSubmissions: SavedSubmissionMap,
) {
  const preservedEntries = Object.entries(savedSubmissions).filter(
    ([key]) => !key.startsWith(`${passageSlug}:`),
  );

  return {
    ...Object.fromEntries(preservedEntries),
    ...nextPassageSubmissions,
  } as SavedSubmissionMap;
}

function extractPassageQuestionId(questionKey: string | null, passageSlug: string) {
  if (!questionKey) return null;
  const prefix = `${passageSlug}:`;
  return questionKey.startsWith(prefix) ? questionKey.slice(prefix.length) : null;
}

function resolveStoredPassageAnswerKey(
  passage: VerbalPassageRecord,
  questionKey: string,
  selectedAnswer: string | null,
) {
  if (!selectedAnswer) return null;
  if (selectedAnswer === "A" || selectedAnswer === "B" || selectedAnswer === "C" || selectedAnswer === "D") {
    return selectedAnswer;
  }

  const questionId = extractPassageQuestionId(questionKey, passage.slug);
  const question = passage.questions.find((item) => item.id === questionId);
  if (!question) return null;

  return getQuestionOptions(question).find((option) => option.text === selectedAnswer)?.key ?? null;
}

function getCorrectExplanation(question: VerbalPassageRecord["questions"][number]) {
  return (
    question.explanation?.trim() ||
    "هذا هو الاختيار الصحيح وفق البيانات المعتمدة لهذه القطعة."
  );
}

function getSelectedExplanation(
  question: VerbalPassageRecord["questions"][number],
  selectedKey: "A" | "B" | "C" | "D",
) {
  if (selectedKey === question.correctOption) {
    return getCorrectExplanation(question);
  }

  return "هذا الاختيار غير صحيح وفق البيانات المعتمدة لهذه القطعة.";
}

function findQuestionIndexById(
  passage: VerbalPassageRecord,
  requestedQuestionId: string | null | undefined,
) {
  const normalizedRequestedId = requestedQuestionId?.trim().toLowerCase();
  if (!normalizedRequestedId) return -1;

  return passage.questions.findIndex((question) => {
    const normalizedQuestionId = question.id.trim().toLowerCase();
    return (
      normalizedQuestionId === normalizedRequestedId ||
      normalizedQuestionId.startsWith(`${normalizedRequestedId}-`) ||
      normalizedRequestedId.startsWith(`${normalizedQuestionId}-`)
    );
  });
}

function resolveNextPassageQuestionIndex(
  passage: VerbalPassageRecord,
  answeredQuestionIds: Set<string>,
  lastSolvedQuestionId: string | null,
) {
  const lastSolvedIndex = findQuestionIndexById(passage, lastSolvedQuestionId);

  const nextUnansweredAfterLastSolved =
    lastSolvedIndex >= 0
      ? passage.questions
          .slice(lastSolvedIndex + 1)
          .find((question) => !answeredQuestionIds.has(question.id))
      : null;

  const firstUnansweredQuestion = passage.questions.find(
    (question) => !answeredQuestionIds.has(question.id),
  );
  const targetQuestionId =
    nextUnansweredAfterLastSolved?.id ?? firstUnansweredQuestion?.id ?? lastSolvedQuestionId;

  return findQuestionIndexById(passage, targetQuestionId);
}

export function VerbalPassageViewer({
  passage,
  mode = "student",
  initialQuestionId,
  isNavigating = false,
  nextPassageTitle,
  onOpenNextPassage,
  onBackToResults,
}: {
  passage: VerbalPassageRecord;
  mode?: ViewerMode;
  initialQuestionId?: string | null;
  isNavigating?: boolean;
  nextPassageTitle?: string | null;
  onOpenNextPassage?: (() => void) | null;
  onBackToResults?: (() => void) | null;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { status: authStatus } = useAuthSession();

  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<SavedAnswerMap>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<SavedSubmissionMap>({});
  const [authPromptQuestionId, setAuthPromptQuestionId] = useState<string | null>(null);
  const [progressFeedback, setProgressFeedback] = useState<ProgressFeedback>(null);
  const [isAccountProgressLoading, setIsAccountProgressLoading] = useState(false);
  const [savedCompletionChoice, setSavedCompletionChoice] = useState(false);
  const [questionFlags, setQuestionFlags] = useState(readClientQuestionFlags);
  const [showAllQuestionPills, setShowAllQuestionPills] = useState(false);
  const [questionElapsedSeconds, setQuestionElapsedSeconds] = useState(45);
  const [isFocusMode, setIsFocusMode] = useState(false);
  const [isLargeText, setIsLargeText] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);

  useEffect(() => {
    setSelectedAnswers(readSavedAnswers());
    setSubmittedAnswers(readSavedSubmissions());
    setQuestionFlags(readClientQuestionFlags());
  }, []);

  useEffect(() => {
    const matchedQuestionIndex = findQuestionIndexById(passage, initialQuestionId);
    setQuestionIndex(matchedQuestionIndex >= 0 ? matchedQuestionIndex : 0);
    setAuthPromptQuestionId(null);
    setProgressFeedback(null);
    setSavedCompletionChoice(false);
    setShowExplanation(false);
  }, [initialQuestionId, passage]);

  const currentQuestion =
    passage.questions[
      Math.min(Math.max(questionIndex, 0), Math.max(passage.questions.length - 1, 0))
    ];

  const currentOptions = useMemo(() => getQuestionOptions(currentQuestion), [currentQuestion]);

  const formattedPassageText = useMemo(
    () => formatPassageForDisplay(passage.passageText),
    [passage.passageText],
  );

  const currentQuestionKey = `${passage.slug}:${currentQuestion.id}`;
  const selectedKey = selectedAnswers[currentQuestionKey];
  const submitted = Boolean(submittedAnswers[currentQuestionKey]);
  const isCorrect = submitted && selectedKey === currentQuestion.correctOption;
  const questionHref = `/verbal/reading?passage=${encodeURIComponent(
    passage.slug,
  )}&question=${encodeURIComponent(currentQuestion.id)}`;
  const currentFlags = questionFlags[currentQuestionKey] ?? {};

  useEffect(() => {
    setQuestionElapsedSeconds(45);
    const startedAt = Date.now();
    const intervalId = window.setInterval(() => {
      setQuestionElapsedSeconds(45 + Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [currentQuestion.id, currentQuestionKey]);

  const submittedCount = useMemo(
    () =>
      passage.questions.filter((question) => submittedAnswers[`${passage.slug}:${question.id}`])
        .length,
    [passage.questions, passage.slug, submittedAnswers],
  );

  const isPassageCompleted =
    mode === "student" &&
    passage.questions.length > 0 &&
    submittedCount === passage.questions.length;

  useEffect(() => {
    if (mode !== "student" || authStatus !== "authenticated") {
      setIsAccountProgressLoading(false);
      return;
    }

    let isCancelled = false;
    const requestedQuestionId = initialQuestionId?.trim() ?? "";
    const canAutoResume = !requestedQuestionId || requestedQuestionId === passage.questions[0]?.id;

    setIsAccountProgressLoading(true);

    void loadSectionProgressFromClient({
      section: "verbal",
      categoryId: `reading:${passage.slug}`,
    })
      .then((response) => {
        if (isCancelled) return;

        if (!response.ok || !response.snapshot) {
          setIsAccountProgressLoading(false);
          return;
        }

        const passageAnswers = Object.fromEntries(
          response.snapshot.items
            .map((item) => {
              const answerKey = resolveStoredPassageAnswerKey(
                passage,
                item.questionKey,
                item.selectedAnswer,
              );

              return answerKey ? [item.questionKey, answerKey] : null;
            })
            .filter(Boolean) as Array<[string, "A" | "B" | "C" | "D"]>,
        ) as SavedAnswerMap;

        const passageSubmissions = Object.fromEntries(
          response.snapshot.items
            .filter((item) => Boolean(item.selectedAnswer))
            .map((item) => [item.questionKey, true]),
        ) as SavedSubmissionMap;

        setSelectedAnswers((previous) => {
          const next = replacePassageAnswers(previous, passage.slug, passageAnswers);
          persistSavedAnswers(next);
          return next;
        });

        setSubmittedAnswers((previous) => {
          const next = replacePassageSubmissions(previous, passage.slug, passageSubmissions);
          persistSavedSubmissions(next);
          return next;
        });

        const resumeQuestionId = extractPassageQuestionId(
          response.snapshot.lastQuestionKey,
          passage.slug,
        );
        const answeredQuestionIds = new Set(
          Object.keys(passageSubmissions)
            .map((questionKey) => extractPassageQuestionId(questionKey, passage.slug))
            .filter((questionId): questionId is string => Boolean(questionId)),
        );
        const resumeQuestionIndex = resolveNextPassageQuestionIndex(
          passage,
          answeredQuestionIds,
          resumeQuestionId,
        );

        if (
          canAutoResume &&
          resumeQuestionIndex >= 0 &&
          passage.questions[resumeQuestionIndex]?.id !== requestedQuestionId
        ) {
          setQuestionIndex(resumeQuestionIndex);
        }

        setIsAccountProgressLoading(false);
      })
      .catch(() => {
        if (!isCancelled) {
          setIsAccountProgressLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, [authStatus, initialQuestionId, mode, passage]);

  async function resetPassageSession() {
    if (authStatus === "authenticated") {
      await resetSectionProgressFromClient({
        section: "verbal",
        categoryId: `reading:${passage.slug}`,
      });
    }

    const nextAnswers = clearPassageAnswers(passage.slug);
    const nextSubmissions = clearPassageSubmissions(passage.slug);
    setSelectedAnswers(nextAnswers);
    setSubmittedAnswers(nextSubmissions);
    setQuestionIndex(0);
    setAuthPromptQuestionId(null);
    setProgressFeedback(null);
    setSavedCompletionChoice(false);
  }

  useEffect(() => {
    if (mode !== "student" || searchParams.get("reset") !== "1") {
      return;
    }

    const targetPassage = searchParams.get("passage")?.trim();
    if (targetPassage && targetPassage !== passage.slug) {
      return;
    }

    void (async () => {
      await resetPassageSession();

      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.delete("reset");
      nextParams.set("passage", passage.slug);
      router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
    })();
  }, [mode, passage.slug, pathname, router, searchParams]);

  useEffect(() => {
    const currentPassageParam = searchParams.get("passage")?.trim() ?? "";
    const currentQuestionParam = searchParams.get("question")?.trim() ?? "";

    if (currentPassageParam === passage.slug && currentQuestionParam === currentQuestion.id) {
      return;
    }

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("passage", passage.slug);
    nextParams.set("question", currentQuestion.id);
    router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
  }, [currentQuestion.id, passage.slug, pathname, router, searchParams]);

  function getQuestionProgressState(
    question: VerbalPassageRecord["questions"][number],
    index: number,
  ): PassageQuestionProgressState {
    const questionKey = `${passage.slug}:${question.id}`;
    const isSubmitted = Boolean(submittedAnswers[questionKey]);
    const answer = selectedAnswers[questionKey];

    if (isSubmitted && answer) {
      return answer === question.correctOption ? "correct" : "incorrect";
    }

    return index === questionIndex ? "current" : "unanswered";
  }

  async function confirmCurrentAnswer() {
    if (!selectedKey) return;

    if (authStatus !== "authenticated") {
      setProgressFeedback(null);
      setShowExplanation(false);
      setAuthPromptQuestionId(currentQuestion.id);
      window.requestAnimationFrame(() => {
        document
          .getElementById(`${currentQuestionKey}-auth-required`)
          ?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
      return;
    }

    setShowExplanation(false);
    setSubmittedAnswers((previous) => {
      const next = {
        ...previous,
        [currentQuestionKey]: true,
      };
      persistSavedSubmissions(next);
      return next;
    });

    const isAnswerCorrect = selectedKey === currentQuestion.correctOption;
    const selectedAnswerText = currentOptions.find((option) => option.key === selectedKey)?.text;

    const progressResult = await trackQuestionProgressFromClient({
      questionKey: currentQuestionKey,
      section: "verbal",
      sourceBank: "بنك الاستيعاب المقروء",
      categoryId: `reading:${passage.slug}`,
      categoryTitle: passage.title,
      questionTypeLabel: "الاستيعاب المقروء",
      questionText: currentQuestion.questionText,
      questionHref,
      selectedAnswer: selectedAnswerText ?? selectedKey,
      correctAnswer: getCorrectAnswerText(currentQuestion),
      metadata: {
        passageTitle: passage.title,
        questionOrder: currentQuestion.questionOrder,
      },
      outcome: isAnswerCorrect ? "correct" : "incorrect",
      xpValue: 10,
    });

    let mistakeTracking: Awaited<ReturnType<typeof trackMistakeFromClient>> | null = null;

    if (!isAnswerCorrect) {
      mistakeTracking = await trackMistakeFromClient({
        questionKey: currentQuestionKey,
        section: "verbal",
        sourceBank: "بنك الاستيعاب المقروء",
        questionTypeLabel: "الاستيعاب المقروء",
        questionText: currentQuestion.questionText,
        questionHref,
        metadata: {
          passageTitle: passage.title,
          passageSlug: passage.slug,
          questionOrder: currentQuestion.questionOrder,
          questionId: currentQuestion.id,
          options: currentOptions.map((option) => option.text),
          correctAnswer: getCorrectAnswerText(currentQuestion),
          explanation:
            currentQuestion.explanation ?? "راجع تفسير السؤال داخل القطعة.",
        },
        outcome: "incorrect",
      });
    }

    setProgressFeedback(progressResult.result ?? null);

    if (progressResult.unauthorized || Boolean(mistakeTracking?.unauthorized)) {
      setAuthPromptQuestionId(currentQuestion.id);
      return;
    }

    if (isAnswerCorrect || authStatus === "authenticated") {
      setAuthPromptQuestionId((current) => (current === currentQuestion.id ? null : current));
    }
  }

  function resetCurrentQuestionAttempt() {
    const nextAnswers = { ...selectedAnswers };
    delete nextAnswers[currentQuestionKey];
    persistSavedAnswers(nextAnswers);
    setSelectedAnswers(nextAnswers);

    const nextSubmissions = { ...submittedAnswers };
    delete nextSubmissions[currentQuestionKey];
    persistSavedSubmissions(nextSubmissions);
    setSubmittedAnswers(nextSubmissions);

    setProgressFeedback(null);
    setAuthPromptQuestionId((current) => (current === currentQuestion.id ? null : current));
    setSavedCompletionChoice(false);
    setShowExplanation(false);
  }

  function toggleQuestionFlag(flag: "saved" | "pinned") {
    setQuestionFlags((previous) => {
      const next = toggleClientQuestionFlag(previous, currentQuestionKey, flag);
      persistClientQuestionFlags(next);
      return next;
    });
  }

  function handleSelectOption(optionKey: "A" | "B" | "C" | "D") {
    const nextAnswers = {
      ...selectedAnswers,
      [currentQuestionKey]: optionKey,
    };

    setSelectedAnswers(nextAnswers);
    persistSavedAnswers(nextAnswers);

    setSubmittedAnswers((previous) => {
      const next = {
        ...previous,
        [currentQuestionKey]: false,
      };
      persistSavedSubmissions(next);
      return next;
    });

    setProgressFeedback(null);
    setAuthPromptQuestionId((current) => (current === currentQuestion.id ? null : current));
    setSavedCompletionChoice(false);
    setShowExplanation(false);
  }

  function goToQuestion(index: number) {
    if (index < 0 || index >= passage.questions.length) return;
    setQuestionIndex(index);
    setAuthPromptQuestionId(null);
    setShowExplanation(false);
  }

  function goToPreviousQuestion() {
    if (questionIndex > 0) {
      goToQuestion(questionIndex - 1);
    }
  }

  function goToNextQuestion() {
    if (questionIndex < passage.questions.length - 1) {
      goToQuestion(questionIndex + 1);
      return;
    }

    if (onOpenNextPassage) {
      onOpenNextPassage();
    }
  }

  const currentQuestionLabel = `سؤال ${questionIndex + 1} من ${passage.questions.length}`;
  const currentPositionProgress = passage.questions.length
    ? ((questionIndex + 1) / passage.questions.length) * 100
    : 0;
  const completionProgress = passage.questions.length
    ? (submittedCount / passage.questions.length) * 100
    : 0;
  const explanationId = `${currentQuestionKey}-explanation`;
  const averageSecondsLabel = `${Math.max(
    40,
    Math.round(questionElapsedSeconds / Math.max(1, questionIndex + 1)),
  )} ثانية`;
  const progressNotice =
    authStatus === "authenticated"
      ? isAccountProgressLoading
        ? "جارٍ استعادة تقدم هذه القطعة من حسابك..."
        : "تقدم هذه القطعة محفوظ داخل حسابك، وعند العودة ستكمل من آخر سؤال وصلت إليه."
      : "الحفظ الدائم لتقدم القطعة يحتاج تسجيل الدخول، أما الآن فالتقدم محفوظ داخل هذه الجلسة فقط.";

  const navigatorQuestions = showAllQuestionPills
    ? passage.questions
    : passage.questions.slice(0, 15);

  const navigatorItems = navigatorQuestions.map((question) => {
    const actualIndex = passage.questions.findIndex((item) => item.id === question.id);
    return {
      id: `passage-question-${question.id}`,
      label: String(actualIndex + 1),
      active: actualIndex === questionIndex,
      status: getQuestionProgressState(question, actualIndex),
      onClick: () => goToQuestion(actualIndex),
    };
  });

  const feedbackContent =
    mode === "student" && submitted && selectedKey ? (
      <div
        id={explanationId}
        className={`rounded-[1.2rem] border px-4 py-4 text-sm leading-8 ${
          isCorrect
            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
            : "border-rose-200 bg-rose-50 text-rose-900"
        }`}
      >
        <div className="text-base font-black">
          {isCorrect ? "لماذا هذا هو الصحيح؟" : "هذه المحاولة تحتاج مراجعة"}
        </div>
        {!isCorrect ? (
          <div className="mt-2">
            <span className="font-bold">الإجابة الصحيحة:</span>{" "}
            {getCorrectAnswerText(currentQuestion)}
          </div>
        ) : null}
        {showExplanation ? (
          <>
            <div className="mt-2">
              <span className="font-bold">شرح اختيارك:</span>{" "}
              {getSelectedExplanation(currentQuestion, selectedKey)}
            </div>
            {!isCorrect ? (
              <div className="mt-2">
                <span className="font-bold">تفسير الإجابة الصحيحة:</span>{" "}
                {getCorrectExplanation(currentQuestion)}
              </div>
            ) : null}
          </>
        ) : null}

        {progressFeedback ? (
          <div className="mt-3 rounded-[1rem] border border-white/70 bg-white/70 px-4 py-3 text-xs leading-7 text-slate-700">
            <div className="flex flex-wrap items-center gap-2 font-bold text-slate-900">
              <Sparkles className="h-4 w-4" />
              {progressFeedback.awardedXp > 0
                ? `أضفنا ${progressFeedback.awardedXp} XP إلى ملفك.`
                : progressFeedback.alreadySolved
                  ? "هذه القطعة محسوبة سابقًا داخل تقدمك."
                  : "تم حفظ المحاولة داخل ملف الطالب."}
            </div>
            <div className="mt-1">
              مجموعك الحالي: {progressFeedback.totalXp.toLocaleString("en-US")} XP - الأسئلة
              المحلولة: {progressFeedback.solvedQuestionsCount.toLocaleString("en-US")}
            </div>
          </div>
        ) : null}
      </div>
    ) : mode === "admin" && currentQuestion.explanation ? (
      <div
        id={explanationId}
        className="rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-8 text-slate-700"
      >
        <span className="font-bold text-slate-950">الشرح:</span> {currentQuestion.explanation}
      </div>
    ) : null;

  const noticesContent =
    mode === "student" ? (
      <>
        {questionIndex === 0 ? (
          <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-600">
            {progressNotice}
          </div>
        ) : null}

        {authPromptQuestionId === currentQuestion.id ? (
          <div
            id={`${currentQuestionKey}-auth-required`}
            className="rounded-[1.35rem] border border-[#d7e5ff] bg-[linear-gradient(180deg,#ffffff,#f7fbff)] px-5 py-4 text-sm leading-8 text-slate-700 shadow-[0_18px_38px_rgba(37,99,235,0.08)]"
          >
            <div className="text-base font-black text-slate-950">
              سجّل دخولك لكشف الإجابة والشرح
            </div>
            <p className="mt-1">
              تقدر تكمل حل أسئلة القطعة وتتنقل بين السابق والتالي، لكن تأكيد
              الإجابة ومعرفة الحل الصحيح والشرح متاحة بعد تسجيل الدخول فقط.
            </p>
            <div className="mt-3 flex flex-wrap gap-3">
              <Link
                href={`/login?next=${encodeURIComponent(questionHref)}`}
                className="inline-flex h-11 items-center justify-center rounded-[1rem] bg-[#1f4b94] px-5 text-sm font-bold text-white transition hover:bg-[#163b77]"
              >
                تسجيل الدخول
              </Link>
              <Link
                href={`/register?next=${encodeURIComponent(questionHref)}`}
                className="inline-flex h-11 items-center justify-center rounded-[1rem] border border-slate-200 bg-white px-5 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                إنشاء حساب
              </Link>
            </div>
          </div>
        ) : null}

        {false && authPromptQuestionId === currentQuestion.id ? (
          <div className="rounded-[1.2rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-8 text-amber-800">
            {isCorrect
              ? "سجّل دخولك حتى يتم حفظ هذا السؤال كسؤال محلول وإضافة XP إلى حسابك."
              : "سجّل دخولك حتى يتم حفظ هذا السؤال داخل قائمة الأخطاء الخاصة بك."}
            <div className="mt-2 flex flex-wrap gap-3">
              <Link
                href={`/login?next=${encodeURIComponent(questionHref)}`}
                className="font-semibold text-[#123B7A]"
              >
                تسجيل الدخول
              </Link>
              <Link
                href={`/register?next=${encodeURIComponent(questionHref)}`}
                className="font-semibold text-[#123B7A]"
              >
                إنشاء حساب
              </Link>
            </div>
          </div>
        ) : null}
      </>
    ) : null;

  const completionContent =
    mode === "student" && isPassageCompleted ? (
      <div className="rounded-[1.35rem] border border-[#E8D8B3] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,247,244,0.96))] px-5 py-5">
        <div className="text-lg font-black text-slate-950">أنهيت أسئلة هذه القطعة</div>
        <p className="mt-2 text-sm leading-8 text-slate-600">
          يمكنك الآن الانتقال مباشرة إلى القطعة التالية، أو الاحتفاظ بتقدمك، أو إعادة أسئلة
          هذه القطعة من البداية.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setSavedCompletionChoice(true)}
            className="inline-flex h-11 items-center justify-center rounded-[1rem] border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            الاحتفاظ بالتقدم المحفوظ
          </button>
          <button
            type="button"
            onClick={() => void resetPassageSession()}
            className="inline-flex h-11 items-center justify-center rounded-[1rem] border border-[#1f4b94] bg-[#1f4b94] px-4 text-sm font-bold text-white transition hover:bg-[#163b77]"
          >
            إعادة أسئلة القطعة
          </button>
          {onOpenNextPassage ? (
            <button
              type="button"
              onClick={onOpenNextPassage}
              className="inline-flex h-11 items-center justify-center rounded-[1rem] border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
            >
              {nextPassageTitle ? `انتقل إلى ${nextPassageTitle}` : "القطعة التالية"}
            </button>
          ) : null}
        </div>
        {savedCompletionChoice ? (
          <div className="mt-3 rounded-[1rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
            رائع، ستبقى هذه القطعة محفوظة داخل حسابك ويمكنك الرجوع إليها من نفس النقطة لاحقًا.
          </div>
        ) : null}
      </div>
    ) : null;

  return (
    <div dir="rtl" aria-busy={isNavigating} className="space-y-5">
      {isNavigating ? (
        <div className="rounded-full border border-[#E8D8B3] bg-[#fffaf1] px-4 py-3 text-sm font-semibold text-[#8A6116] shadow-sm">
          جارٍ فتح القطعة التالية...
        </div>
      ) : null}

      <div className="grid gap-5 xl:[direction:ltr] xl:grid-cols-[16rem_minmax(0,1fr)_22rem]">
        <aside dir="rtl" className="order-3 space-y-4 xl:order-1">
          <div className="rounded-[1.7rem] border border-slate-200 bg-white p-4 shadow-[0_18px_38px_rgba(15,23,42,0.05)]">
            <div className="text-base font-black text-slate-950">التقدم في الاستيعاب</div>
            <div className="mt-4 flex items-center justify-center">
              <div
                className="grid h-28 w-28 place-items-center rounded-full"
                style={{
                  background:
                    "conic-gradient(#2563eb " +
                    `${Math.max(0, Math.min(100, Math.round(completionProgress))) * 3.6}deg, rgba(226,232,240,0.92) 0deg)`,
                }}
              >
                <div className="grid h-[5.3rem] w-[5.3rem] place-items-center rounded-full bg-white text-center">
                  <div className="text-2xl font-black text-slate-950">
                    {Math.max(0, Math.min(100, Math.round(completionProgress)))}%
                  </div>
                  <div className="text-[11px] font-semibold text-slate-500">تم حله</div>
                </div>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              <div className="rounded-[1rem] bg-slate-50 px-3 py-3">
                <div className="text-xl font-black text-emerald-600">{submittedCount}</div>
                <div className="mt-1 text-xs font-semibold text-slate-500">تم حلها</div>
              </div>
              <div className="rounded-[1rem] bg-slate-50 px-3 py-3">
                <div className="text-xl font-black text-amber-500">
                  {Math.max(passage.questions.length - submittedCount, 0)}
                </div>
                <div className="mt-1 text-xs font-semibold text-slate-500">لم تُحل</div>
              </div>
              <div className="rounded-[1rem] bg-slate-50 px-3 py-3">
                <div className="text-xl font-black text-slate-900">{passage.questions.length}</div>
                <div className="mt-1 text-xs font-semibold text-slate-500">الإجمالي</div>
              </div>
            </div>
          </div>

          <div className="rounded-[1.7rem] border border-slate-200 bg-white p-4 shadow-[0_18px_38px_rgba(15,23,42,0.05)]">
            <div className="text-base font-black text-slate-950">الأسئلة</div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {navigatorItems.map((item) => {
                const buttonClasses =
                  item.status === "correct"
                    ? item.active
                      ? "border-emerald-600 bg-emerald-600 text-white"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700"
                    : item.status === "incorrect"
                      ? item.active
                        ? "border-rose-600 bg-rose-600 text-white"
                        : "border-rose-200 bg-rose-50 text-rose-700"
                      : item.status === "current"
                        ? "border-[#2563eb] bg-[#2563eb] text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50";

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={item.onClick}
                    className={`flex h-11 items-center justify-center rounded-[0.95rem] border text-sm font-bold transition ${buttonClasses}`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {passage.questions.length > 15 ? (
              <button
                type="button"
                onClick={() => setShowAllQuestionPills((current) => !current)}
                className="mt-4 w-full rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                {showAllQuestionPills ? "عرض عدد أقل" : "عرض المزيد"}
              </button>
            ) : null}
          </div>

          <div className="rounded-[1.7rem] border border-slate-200 bg-white p-4 shadow-[0_18px_38px_rgba(15,23,42,0.05)]">
            <div className="text-base font-black text-slate-950">معلومات القطعة</div>
            <div className="mt-4 space-y-3">
              {[
                { label: "النوع", value: "استيعاب مقروء" },
                { label: "القسم", value: passage.title },
                { label: "المتوسط", value: averageSecondsLabel },
                {
                  label: "الحالة",
                  value: passage.status === "published" ? "منشورة" : "مسودة",
                },
                { label: "الإصدار", value: String(passage.version) },
                { label: "عدد الأسئلة", value: String(passage.questions.length) },
              ].map((item) => (
                <div
                  key={item.label}
                  className="rounded-[1rem] border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <div className="text-xs font-semibold text-slate-500">{item.label}</div>
                  <div className="mt-1 text-sm font-bold text-slate-900">{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </aside>

        <section dir="rtl" className="order-2 space-y-4 xl:order-2">
          <div className="rounded-[1.9rem] border border-slate-200 bg-white p-5 shadow-[0_18px_38px_rgba(15,23,42,0.05)] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold text-slate-500">بنك الأسئلة / الاستيعاب المقروء</div>
                <h2 className="mt-2 text-3xl font-black text-slate-950">{passage.title}</h2>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setIsLargeText((current) => !current)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    isLargeText
                      ? "border-[#2563eb] bg-[#eef4ff] text-[#1f4b94]"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {isLargeText ? "وضع أخف للخط" : "تكبير الخط"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsFocusMode((current) => !current)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                    isFocusMode
                      ? "border-[#1f4b94] bg-[#1f4b94] text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {isFocusMode ? "إلغاء التركيز" : "وضع التركيز"}
                </button>
              </div>
            </div>

            <div
              className={`mt-5 rounded-[1.5rem] border px-5 py-5 leading-9 text-slate-800 ${
                isFocusMode
                  ? "border-[#d7e5ff] bg-[#f8fbff]"
                  : "border-slate-200 bg-slate-50"
              } ${isLargeText ? "text-[1.1rem]" : "text-base"}`}
            >
              {formattedPassageText.split("\n\n").map((paragraph, index) => (
                <p key={`${passage.slug}-paragraph-${index + 1}`} className={index > 0 ? "mt-5" : ""}>
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          <div className="rounded-[1.4rem] border border-[#d7e5ff] bg-[#f4f8ff] px-5 py-4 text-sm leading-8 text-slate-600 shadow-[0_12px_24px_rgba(37,99,235,0.05)]">
            <div className="font-bold text-[#1f4b94]">نصيحة لك</div>
            <div className="mt-1">
              اقرأ القطعة كاملة مرة واحدة بهدوء، ثم انتقل إلى السؤال. حاول ربط الفكرة العامة أولًا قبل البحث عن الجملة التفصيلية.
            </div>
          </div>

          {(onOpenNextPassage || onBackToResults) ? (
            <div className="rounded-[1.7rem] border border-slate-200 bg-white p-4 shadow-[0_18px_38px_rgba(15,23,42,0.05)]">
              <div className="text-base font-black text-slate-950">التنقل بين القطع</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {onOpenNextPassage ? (
                  <button
                    type="button"
                    onClick={onOpenNextPassage}
                    className="inline-flex h-11 items-center justify-center rounded-[1rem] border border-[#1f4b94] bg-[#1f4b94] px-4 text-sm font-bold text-white transition hover:bg-[#163b77]"
                  >
                    {nextPassageTitle ? `افتح ${nextPassageTitle}` : "القطعة التالية"}
                  </button>
                ) : null}
                {onBackToResults ? (
                  <button
                    type="button"
                    onClick={onBackToResults}
                    className="inline-flex h-11 items-center justify-center rounded-[1rem] border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    ارجع إلى نتائج البحث
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}
        </section>

        <section dir="rtl" className="order-1 space-y-4 xl:order-3">
          <div className="rounded-[1.9rem] border border-slate-200 bg-white p-5 shadow-[0_18px_38px_rgba(15,23,42,0.05)] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-500">
                بنك الأسئلة / الاستيعاب المقروء / {passage.title}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    submitted
                      ? isCorrect
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-amber-50 text-amber-700"
                      : "bg-blue-50 text-blue-700"
                  }`}
                >
                  {submitted ? (isCorrect ? "منجزة" : "تحتاج مراجعة") : "نشطة"}
                </span>
                <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-500">
                  {currentQuestionLabel}
                </span>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600">
                <span className="inline-flex h-2 w-2 rounded-full bg-[#1d4ed8]" />
                الوقت {formatElapsedLabel(questionElapsedSeconds)}
              </div>

              <div className="flex flex-wrap gap-2">
                <Link
                  href={`/contact?question=${encodeURIComponent(currentQuestionKey)}&next=${encodeURIComponent(
                    questionHref,
                  )}`}
                  className="inline-flex h-11 items-center gap-2 rounded-[1rem] border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <Flag className="h-4 w-4" />
                  إبلاغ عن خطأ
                </Link>
                <button
                  type="button"
                  onClick={() => toggleQuestionFlag("saved")}
                  className={`inline-flex h-11 items-center gap-2 rounded-[1rem] border px-4 text-sm font-semibold transition ${
                    currentFlags.saved
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <Bookmark className="h-4 w-4" />
                  {currentFlags.saved ? "السؤال محفوظ" : "حفظ السؤال"}
                </button>
              </div>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-200">
              <div
                className="h-full rounded-full bg-[linear-gradient(90deg,#2563eb,#60a5fa)] transition-all"
                style={{ width: `${Math.max(0, Math.min(100, currentPositionProgress))}%` }}
              />
            </div>

            <div className="mt-6 text-center text-[1.8rem] font-black leading-[1.9] text-slate-950">
              {currentQuestion.questionText}
            </div>

            <div className="mt-6 space-y-3">
              {currentOptions.map((option) => {
                const chosen = selectedKey === option.key;
                const showCorrect =
                  mode === "admin" || (submitted && option.key === currentQuestion.correctOption);
                const showWrongSelected =
                  mode === "student" &&
                  submitted &&
                  chosen &&
                  option.key !== currentQuestion.correctOption;

                const classes = showCorrect
                  ? "border-emerald-300 bg-emerald-50 text-emerald-900"
                  : showWrongSelected
                    ? "border-rose-300 bg-rose-50 text-rose-900"
                    : chosen
                      ? "border-[#2563eb] bg-[#eef4ff] text-[#1f4b94] shadow-[0_10px_22px_rgba(37,99,235,0.08)]"
                      : "border-slate-200 bg-white text-slate-800 hover:border-[#cfd8ea] hover:bg-slate-50";

                return (
                  <button
                    key={`${currentQuestion.id}-${option.key}`}
                    type="button"
                    disabled={mode === "admin" || isNavigating}
                    onClick={() => handleSelectOption(option.key)}
                    className={`w-full rounded-[1.15rem] border px-5 py-4 text-right transition ${classes} ${
                      mode === "admin" || isNavigating ? "cursor-default" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-black text-slate-700">
                        {option.label}
                      </span>
                      <span className="flex-1 text-right text-lg leading-8">{option.text}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {feedbackContent ? <div className="mt-5">{feedbackContent}</div> : null}
            {noticesContent ? <div className="mt-5 space-y-4">{noticesContent}</div> : null}
            {completionContent ? <div className="mt-5">{completionContent}</div> : null}

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={goToNextQuestion}
                disabled={
                  isNavigating || (!onOpenNextPassage && questionIndex === passage.questions.length - 1)
                }
                className="order-2 inline-flex h-12 items-center justify-center gap-2 rounded-[1rem] border border-[#1f4b94] bg-[#1f4b94] px-4 text-sm font-bold text-white shadow-[0_12px_24px_rgba(31,75,148,0.22)] transition hover:bg-[#163b77] disabled:cursor-not-allowed disabled:opacity-55"
              >
                <ArrowLeft className="h-4 w-4" />
                {questionIndex === passage.questions.length - 1 && onOpenNextPassage
                  ? "السؤال التالي / قطعة أخرى"
                  : "السؤال التالي"}
              </button>

              <button
                type="button"
                onClick={goToPreviousQuestion}
                disabled={isNavigating || questionIndex === 0}
                className="order-1 inline-flex h-12 items-center justify-center gap-2 rounded-[1rem] border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-55"
              >
                <ArrowRight className="h-4 w-4" />
                السؤال السابق
              </button>

              <button
                type="button"
                onClick={resetCurrentQuestionAttempt}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[1rem] border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <RotateCcw className="h-4 w-4" />
                إعادة السؤال
              </button>

              <button
                type="button"
                onClick={() => {
                  if (authStatus !== "authenticated") {
                    setProgressFeedback(null);
                    setShowExplanation(false);
                    setAuthPromptQuestionId(currentQuestion.id);
                    window.requestAnimationFrame(() => {
                      document
                        .getElementById(`${currentQuestionKey}-auth-required`)
                        ?.scrollIntoView({ behavior: "smooth", block: "center" });
                    });
                    return;
                  }

                  const nextValue = !showExplanation;
                  setShowExplanation(nextValue);

                  if (nextValue) {
                    window.requestAnimationFrame(() => {
                      document
                        .getElementById(explanationId)
                        ?.scrollIntoView({ behavior: "smooth", block: "center" });
                    });
                  }
                }}
                disabled={
                  mode === "student"
                    ? authStatus === "authenticated"
                      ? !submitted
                      : !selectedKey
                    : !currentQuestion.explanation
                }
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[1rem] border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-55"
              >
                <ScrollText className="h-4 w-4" />
                {showExplanation ? "إخفاء الشرح" : "حل الشرح"}
              </button>

              <button
                type="button"
                onClick={() => toggleQuestionFlag("pinned")}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-[1rem] border border-slate-200 bg-white px-4 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <Pin className="h-4 w-4" />
                {currentFlags.pinned ? "إلغاء تثبيت السؤال" : "تثبيت السؤال"}
              </button>

              {mode === "student" ? (
                <button
                  type="button"
                  onClick={() => void confirmCurrentAnswer()}
                  disabled={isNavigating || !selectedKey}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-[1rem] border border-[#1f4b94] bg-[#1f4b94] px-4 text-sm font-bold text-white shadow-[0_12px_24px_rgba(31,75,148,0.22)] transition hover:bg-[#163b77] disabled:cursor-not-allowed disabled:opacity-55"
                >
                  <Sparkles className="h-4 w-4" />
                  تأكيد الإجابة
                </button>
              ) : null}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
