"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Pin,
  RotateCcw,
  ScrollText,
  Sparkles,
} from "lucide-react";

import {
  PracticeSessionShell,
  PracticeSessionTopBar,
} from "@/components/practice-session-shell";
import type { VerbalPracticeQuestion, VerbalQuestionCategoryId } from "@/data/verbal-mixed-bank";
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

type SavedAnswerMap = Record<string, string>;
type QuestionProgressState = "current" | "correct" | "incorrect" | "unanswered";
type ProgressFeedback = ClientQuestionProgressResult | null;

type PracticeCategorySummary = {
  id: VerbalQuestionCategoryId;
  title: string;
  description: string;
  count: number;
  firstQuestionId: string | null;
};

type ActiveCategory = {
  id: VerbalQuestionCategoryId;
  title: string;
  description: string;
};

type VerbalPracticeBankProps = {
  categories: PracticeCategorySummary[];
  currentCategory: ActiveCategory;
  questions: VerbalPracticeQuestion[];
  activeQuestionId: string | null;
};

const SAVED_ANSWERS_KEY = "miyaar-verbal-practice-answers";

function getChoiceLetter(index: number) {
  return ["أ", "ب", "ج", "د"][index] ?? String(index + 1);
}

function formatElapsedLabel(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = Math.floor(totalSeconds % 60)
    .toString()
    .padStart(2, "0");
  return `${minutes}:${seconds}`;
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

function clearCategorySavedAnswers(categoryId: string) {
  const savedAnswers = readSavedAnswers();
  const nextEntries = Object.entries(savedAnswers).filter(
    ([key]) => !key.startsWith(`${categoryId}-`),
  );
  const nextAnswers = Object.fromEntries(nextEntries) as SavedAnswerMap;
  persistSavedAnswers(nextAnswers);
  return nextAnswers;
}

function replaceCategorySavedAnswers(
  savedAnswers: SavedAnswerMap,
  categoryId: string,
  nextCategoryAnswers: SavedAnswerMap,
) {
  const preservedEntries = Object.entries(savedAnswers).filter(
    ([key]) => !key.startsWith(`${categoryId}-`),
  );

  return {
    ...Object.fromEntries(preservedEntries),
    ...nextCategoryAnswers,
  } as SavedAnswerMap;
}

function extractQuestionIdFromProgressKey(questionKey: string | null, categoryId: string) {
  if (!questionKey) return null;
  const prefix = `${categoryId}-`;
  return questionKey.startsWith(prefix) ? questionKey.slice(prefix.length) : null;
}

function buildPracticeHref(
  pathname: string,
  currentParams: URLSearchParams,
  categoryId: string,
  questionId: string,
) {
  const nextParams = new URLSearchParams(currentParams.toString());
  nextParams.set("category", categoryId);
  nextParams.set("question", questionId);
  return `${pathname}?${nextParams.toString()}`;
}

export function VerbalPracticeBank({
  categories,
  currentCategory,
  questions,
  activeQuestionId,
}: VerbalPracticeBankProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { status: authStatus } = useAuthSession();

  const [savedAnswers, setSavedAnswers] = useState<SavedAnswerMap>({});
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [progressFeedback, setProgressFeedback] = useState<ProgressFeedback>(null);
  const [isAccountProgressLoading, setIsAccountProgressLoading] = useState(false);
  const [savedCompletionChoice, setSavedCompletionChoice] = useState(false);
  const [questionFlags, setQuestionFlags] = useState(readClientQuestionFlags);
  const [showAllQuestionPills, setShowAllQuestionPills] = useState(false);
  const [questionElapsedSeconds, setQuestionElapsedSeconds] = useState(45);

  useEffect(() => {
    setSavedAnswers(readSavedAnswers());
    setQuestionFlags(readClientQuestionFlags());
  }, []);

  const currentQuestionIndex = questions.findIndex((question) => question.id === activeQuestionId);
  const currentQuestion = questions[currentQuestionIndex] ?? null;
  const answeredCount = useMemo(
    () =>
      questions.filter((question) => Boolean(savedAnswers[`${currentCategory.id}-${question.id}`]))
        .length,
    [currentCategory.id, questions, savedAnswers],
  );
  const isCategoryCompleted = questions.length > 0 && answeredCount === questions.length;

  const currentKey = currentQuestion ? `${currentCategory.id}-${currentQuestion.id}` : "";
  const questionHref = currentQuestion
    ? `/verbal/practice?category=${encodeURIComponent(currentCategory.id)}&question=${encodeURIComponent(
        currentQuestion.id,
      )}`
    : "/verbal/practice";
  const currentFlags = questionFlags[currentKey] ?? {};

  useEffect(() => {
    if (!currentQuestion) return;
    const oldAnswer = savedAnswers[currentKey] || "";
    setSelectedAnswer(oldAnswer);
    setSubmitted(Boolean(oldAnswer));
    setShowAuthPrompt(false);
    setProgressFeedback(null);
  }, [currentKey, currentQuestion, savedAnswers]);

  useEffect(() => {
    if (!currentQuestion) return;

    setQuestionElapsedSeconds(45);
    const startedAt = Date.now();
    const intervalId = window.setInterval(() => {
      setQuestionElapsedSeconds(45 + Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);

    return () => window.clearInterval(intervalId);
  }, [currentKey, currentQuestion]);

  useEffect(() => {
    if (!currentQuestion) return;
    if (!searchParams.get("question") || !searchParams.get("category")) {
      router.replace(
        buildPracticeHref(
          pathname,
          new URLSearchParams(searchParams.toString()),
          currentCategory.id,
          currentQuestion.id,
        ),
        {
          scroll: false,
        },
      );
    }
  }, [currentCategory.id, currentQuestion, pathname, router, searchParams]);

  useEffect(() => {
    if (!currentQuestion || searchParams.get("reset") !== "1") return;

    void (async () => {
      if (authStatus === "authenticated") {
        await resetSectionProgressFromClient({
          section: "verbal",
          categoryId: currentCategory.id,
        });
      }

      const nextAnswers = clearCategorySavedAnswers(currentCategory.id);
      setSavedAnswers(nextAnswers);
      setSelectedAnswer("");
      setSubmitted(false);
      setShowAuthPrompt(false);
      setProgressFeedback(null);
      setSavedCompletionChoice(false);

      const nextParams = new URLSearchParams(searchParams.toString());
      nextParams.delete("reset");
      nextParams.set("category", currentCategory.id);
      nextParams.set("question", questions[0]?.id ?? currentQuestion.id);

      router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
    })();
  }, [authStatus, currentCategory.id, currentQuestion, pathname, questions, router, searchParams]);

  const result = useMemo(() => {
    if (!submitted || !selectedAnswer || !currentQuestion) return null;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    return {
      isCorrect,
      correctAnswer: currentQuestion.correctAnswer,
      explanation: currentQuestion.explanation,
    };
  }, [currentQuestion, selectedAnswer, submitted]);

  function getQuestionProgressState(
    question: (typeof questions)[number],
    index: number,
  ): QuestionProgressState {
    const savedAnswer = savedAnswers[`${currentCategory.id}-${question.id}`];

    if (savedAnswer) {
      return savedAnswer === question.correctAnswer ? "correct" : "incorrect";
    }

    return index === currentQuestionIndex ? "current" : "unanswered";
  }

  function openQuestion(categoryId: string, questionId: string) {
    router.replace(
      buildPracticeHref(
        pathname,
        new URLSearchParams(searchParams.toString()),
        categoryId,
        questionId,
      ),
      {
        scroll: false,
      },
    );
  }

  function openCategory(categoryId: string) {
    if (categoryId === "reading_comprehension") {
      router.push("/verbal/reading");
      return;
    }

    const nextCategory = categories.find((category) => category.id === categoryId);
    if (!nextCategory?.firstQuestionId) return;
    openQuestion(categoryId, nextCategory.firstQuestionId);
  }

  useEffect(() => {
    setSavedCompletionChoice(false);
  }, [currentCategory.id]);

  useEffect(() => {
    if (authStatus !== "authenticated") {
      setIsAccountProgressLoading(false);
      return;
    }

    let isCancelled = false;
    const requestedQuestionId = searchParams.get("question")?.trim() ?? "";
    const canAutoResume = !requestedQuestionId || requestedQuestionId === questions[0]?.id;

    setIsAccountProgressLoading(true);

    void loadSectionProgressFromClient({
      section: "verbal",
      categoryId: currentCategory.id,
    })
      .then((response) => {
        if (isCancelled) return;

        if (!response.ok || !response.snapshot) {
          setIsAccountProgressLoading(false);
          return;
        }

        const categoryAnswers = Object.fromEntries(
          response.snapshot.items
            .filter((item) => typeof item.selectedAnswer === "string" && item.selectedAnswer)
            .map((item) => [item.questionKey, item.selectedAnswer as string]),
        ) as SavedAnswerMap;

        setSavedAnswers((previous) => {
          const next = replaceCategorySavedAnswers(previous, currentCategory.id, categoryAnswers);
          persistSavedAnswers(next);
          return next;
        });

        const resumeQuestionId = extractQuestionIdFromProgressKey(
          response.snapshot.lastQuestionKey,
          currentCategory.id,
        );

        if (
          canAutoResume &&
          resumeQuestionId &&
          resumeQuestionId !== requestedQuestionId &&
          questions.some((question) => question.id === resumeQuestionId)
        ) {
          openQuestion(currentCategory.id, resumeQuestionId);
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
  }, [authStatus, currentCategory.id, questions, searchParams]);

  async function handleResetCategory() {
    if (authStatus === "authenticated") {
      await resetSectionProgressFromClient({
        section: "verbal",
        categoryId: currentCategory.id,
      });
    }

    const nextAnswers = clearCategorySavedAnswers(currentCategory.id);
    setSavedAnswers(nextAnswers);
    setSelectedAnswer("");
    setSubmitted(false);
    setShowAuthPrompt(false);
    setProgressFeedback(null);
    setSavedCompletionChoice(false);

    const firstQuestion = questions[0];
    if (firstQuestion) {
      openQuestion(currentCategory.id, firstQuestion.id);
    }
  }

  async function confirmAnswer() {
    if (!selectedAnswer || !currentQuestion) return;

    setSubmitted(true);
    setSavedAnswers((previous) => {
      const next = {
        ...previous,
        [currentKey]: selectedAnswer,
      };
      persistSavedAnswers(next);
      return next;
    });

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const progressResult = await trackQuestionProgressFromClient({
      questionKey: currentKey,
      section: "verbal",
      sourceBank: `بنك اللفظي / ${currentCategory.title}`,
      categoryId: currentCategory.id,
      categoryTitle: currentCategory.title,
      questionTypeLabel: currentCategory.title,
      questionText: currentQuestion.prompt,
      questionHref,
      selectedAnswer,
      correctAnswer: currentQuestion.correctAnswer,
      metadata: {
        source: currentQuestion.source,
        categoryId: currentCategory.id,
        categoryTitle: currentCategory.title,
      },
      outcome: isCorrect ? "correct" : "incorrect",
      xpValue: 10,
    });

    let mistakeTracking:
      | Awaited<ReturnType<typeof trackMistakeFromClient>>
      | null = null;

    if (!isCorrect) {
      mistakeTracking = await trackMistakeFromClient({
        questionKey: currentKey,
        section: "verbal",
        sourceBank: `بنك اللفظي / ${currentCategory.title}`,
        questionTypeLabel: currentCategory.title,
        questionText: currentQuestion.prompt,
        questionHref,
        metadata: {
          source: currentQuestion.source,
          categoryId: currentCategory.id,
          categoryTitle: currentCategory.title,
          questionId: currentQuestion.id,
          options: currentQuestion.options,
          correctAnswer: currentQuestion.correctAnswer,
          explanation: currentQuestion.explanation,
        },
        outcome: "incorrect",
      });
    }

    setProgressFeedback(progressResult.result ?? null);

    const shouldShowAuthPrompt =
      progressResult.unauthorized || Boolean(mistakeTracking?.unauthorized);

    if (shouldShowAuthPrompt) {
      setShowAuthPrompt(true);
      return;
    }

    if (isCorrect || authStatus === "authenticated") {
      setShowAuthPrompt(false);
    }
  }

  function resetCurrentQuestionAttempt() {
    if (!currentQuestion) return;

    const nextAnswers = { ...savedAnswers };
    delete nextAnswers[currentKey];
    persistSavedAnswers(nextAnswers);
    setSavedAnswers(nextAnswers);
    setSelectedAnswer("");
    setSubmitted(false);
    setShowAuthPrompt(false);
    setProgressFeedback(null);
    setSavedCompletionChoice(false);
  }

  function toggleQuestionFlag(flag: "saved" | "pinned") {
    if (!currentKey) return;

    setQuestionFlags((previous) => {
      const next = toggleClientQuestionFlag(previous, currentKey, flag);
      persistClientQuestionFlags(next);
      return next;
    });
  }

  if (!currentQuestion) {
    return (
      <div className="rounded-[1.8rem] border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
        لا توجد أسئلة ظاهرة الآن داخل هذا القسم.
      </div>
    );
  }

  const previousQuestion = questions[currentQuestionIndex - 1] ?? null;
  const nextQuestion = questions[currentQuestionIndex + 1] ?? null;
  const currentQuestionLabel = `${currentQuestionIndex + 1} من ${questions.length}`;
  const currentPositionProgress = questions.length
    ? ((currentQuestionIndex + 1) / questions.length) * 100
    : 0;
  const completionProgress = questions.length ? (answeredCount / questions.length) * 100 : 0;
  const explanationId = `${currentKey}-explanation`;
  const averageSecondsLabel = `${Math.max(
    35,
    Math.round(questionElapsedSeconds / Math.max(1, currentQuestionIndex + 1)),
  )} ثانية`;
  const progressNotice =
    authStatus === "authenticated"
      ? isAccountProgressLoading
        ? "جار استعادة تقدم هذا القسم من حسابك..."
        : "تقدم هذا القسم محفوظ داخل حسابك، وعند العودة ستكمل من آخر سؤال وصلت إليه."
      : "التقدم محفوظ داخل هذه الجلسة فقط. سجّل دخولك إذا أردت مزامنة القسم بين أجهزتك.";
  const navigatorQuestions = showAllQuestionPills ? questions : questions.slice(0, 15);
  const navigatorItems = navigatorQuestions.map((question) => {
    const actualIndex = questions.findIndex((item) => item.id === question.id);
    return {
      id: `navigator-${question.id}`,
      label: String(actualIndex + 1),
      active: actualIndex === currentQuestionIndex,
      status: getQuestionProgressState(question, actualIndex),
      onClick: () => openQuestion(currentCategory.id, question.id),
    };
  });

  const feedbackContent =
    submitted && result ? (
      <div
        id={explanationId}
        className={`rounded-[1.35rem] border px-5 py-4 text-sm leading-8 ${
          result.isCorrect
            ? "border-emerald-200 bg-emerald-50 text-emerald-900"
            : "border-rose-200 bg-rose-50 text-rose-900"
        }`}
      >
        <div className="text-base font-black">
          {result.isCorrect ? "هذا هو الصحيح" : "هذه المحاولة تحتاج مراجعة"}
        </div>
        {!result.isCorrect ? (
          <div className="mt-2">
            <span className="font-bold">الإجابة الصحيحة:</span> {result.correctAnswer}
          </div>
        ) : null}
        <div className="mt-2">
          <span className="font-bold">الشرح:</span> {result.explanation}
        </div>

        {progressFeedback ? (
          <div className="mt-3 rounded-[1rem] border border-white/70 bg-white/70 px-4 py-3 text-xs leading-7 text-slate-700">
            <div className="flex flex-wrap items-center gap-2 font-bold text-slate-900">
              <Sparkles className="h-4 w-4" />
              {progressFeedback.awardedXp > 0
                ? `أضفنا ${progressFeedback.awardedXp} XP إلى ملفك.`
                : progressFeedback.alreadySolved
                  ? "هذا السؤال محسوب سابقًا داخل تقدمك."
                  : "تم حفظ المحاولة داخل ملف الطالب."}
            </div>
            <div className="mt-1">
              مجموعك الحالي: {progressFeedback.totalXp.toLocaleString("en-US")} XP - الأسئلة
              المحلولة: {progressFeedback.solvedQuestionsCount.toLocaleString("en-US")}
            </div>
          </div>
        ) : null}
      </div>
    ) : null;

  const noticesContent = (
    <>
      <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-7 text-slate-600">
        {progressNotice}
      </div>

      {showAuthPrompt ? (
        <div className="rounded-[1.2rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm leading-8 text-amber-800">
          {result?.isCorrect
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
  );

  const completionContent = isCategoryCompleted ? (
    <div className="rounded-[1.35rem] border border-[#E8D8B3] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,247,244,0.96))] px-5 py-5">
      <div className="text-lg font-black text-slate-950">أنهيت جميع أسئلة هذا القسم</div>
      <p className="mt-2 text-sm leading-8 text-slate-600">
        {authStatus === "authenticated"
          ? "تقدمك محفوظ داخل حسابك الآن، ويمكنك الاحتفاظ به أو إعادة أسئلة القسم من البداية."
          : "أنهيت القسم كاملًا. سجّل دخولك حتى يبقى هذا الإنجاز محفوظًا عند رجوعك لاحقًا."}
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
          onClick={() => void handleResetCategory()}
          className="inline-flex h-11 items-center justify-center rounded-[1rem] border border-[#1f4b94] bg-[#1f4b94] px-4 text-sm font-bold text-white transition hover:bg-[#163b77]"
        >
          إعادة أسئلة القسم
        </button>
      </div>
      {savedCompletionChoice ? (
        <div className="mt-3 rounded-[1rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">
          ممتاز، سيبقى هذا القسم محفوظًا لك كما هو ويمكنك الرجوع إليه من نفس النقطة لاحقًا.
        </div>
      ) : null}
    </div>
  ) : null;

  return (
    <div dir="rtl" className="space-y-5">
      <PracticeSessionTopBar
        reportHref={`/contact?question=${encodeURIComponent(currentKey)}&next=${encodeURIComponent(
          questionHref,
        )}`}
        saved={Boolean(currentFlags.saved)}
        pinned={Boolean(currentFlags.pinned)}
        onToggleSaved={() => toggleQuestionFlag("saved")}
        onTogglePinned={() => toggleQuestionFlag("pinned")}
        showPinButton={false}
        rightMeta={
          <>
            <span>{currentCategory.title}</span>
            <span className="text-slate-300">/</span>
            <span>{currentQuestion.source}</span>
            <span className="text-slate-300">/</span>
            <span>{currentQuestionLabel}</span>
          </>
        }
      />

      <PracticeSessionShell
        sectionLabel={`اللفظي / ${currentCategory.title}`}
        progressLabel={currentQuestionLabel}
        progressValue={currentPositionProgress}
        timerLabel={formatElapsedLabel(questionElapsedSeconds)}
        prompt={currentQuestion.prompt}
        metaBadge={
          <div className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-500">
            المصدر: {currentQuestion.source}
          </div>
        }
        options={currentQuestion.options.map((option, index) => {
          const isSelected = selectedAnswer === option;
          const isCorrect = submitted && option === currentQuestion.correctAnswer;
          const isWrongSelected =
            submitted && isSelected && option !== currentQuestion.correctAnswer;

          const classes = isCorrect
            ? "border-emerald-300 bg-emerald-50 text-emerald-900"
            : isWrongSelected
              ? "border-rose-300 bg-rose-50 text-rose-900"
              : isSelected
                ? "border-[#2563eb] bg-[#eef4ff] text-[#1f4b94] shadow-[0_10px_22px_rgba(37,99,235,0.08)]"
                : "border-slate-200 bg-white text-slate-800 hover:border-[#cfd8ea] hover:bg-slate-50";

          return (
            <button
              key={`${currentQuestion.id}-${index + 1}`}
              type="button"
              onClick={() => {
                setSelectedAnswer(option);
                setSubmitted(false);
                setShowAuthPrompt(false);
                setSavedCompletionChoice(false);
              }}
              className={`rounded-[1.25rem] border px-5 py-4 text-right transition ${classes}`}
            >
              <div className="flex items-start justify-between gap-4">
                <span className="flex-1 text-lg leading-8">{option}</span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-black text-slate-700">
                  {getChoiceLetter(index)}
                </span>
              </div>
            </button>
          );
        })}
        feedback={feedbackContent}
        notices={noticesContent}
        completion={completionContent}
        footerActions={[
          {
            key: "next",
            label: "السؤال التالي",
            icon: ArrowLeft,
            onClick: () =>
              nextQuestion && openQuestion(currentCategory.id, nextQuestion.id),
            disabled: !nextQuestion,
            variant: "primary",
          },
          {
            key: "previous",
            label: "السؤال السابق",
            icon: ArrowRight,
            onClick: () =>
              previousQuestion && openQuestion(currentCategory.id, previousQuestion.id),
            disabled: !previousQuestion,
          },
          {
            key: "retry",
            label: "إعادة السؤال",
            icon: RotateCcw,
            onClick: resetCurrentQuestionAttempt,
          },
          {
            key: "explanation",
            label: "حل الشرح",
            icon: ScrollText,
            onClick: () =>
              document
                .getElementById(explanationId)
                ?.scrollIntoView({ behavior: "smooth", block: "center" }),
            disabled: !submitted,
          },
          {
            key: "pin",
            label: currentFlags.pinned ? "إلغاء تثبيت السؤال" : "تثبيت السؤال",
            icon: Pin,
            onClick: () => toggleQuestionFlag("pinned"),
          },
          {
            key: "confirm",
            label: "تأكيد الإجابة",
            icon: Sparkles,
            onClick: () => void confirmAnswer(),
            disabled: !selectedAnswer,
            variant: "primary",
          },
        ]}
        tip={`اقرأ الجملة كاملة أولًا، ثم حدّد الكلمة المفتاحية التي تكشف نوع العلاقة داخل ${currentCategory.title}.`}
        navigatorItems={navigatorItems}
        navigatorToggleLabel={
          questions.length > 15
            ? showAllQuestionPills
              ? "عرض عدد أقل"
              : "عرض المزيد"
            : null
        }
        onToggleNavigator={
          questions.length > 15 ? () => setShowAllQuestionPills((current) => !current) : null
        }
        summaryProgressValue={completionProgress}
        summaryMetrics={[
          { label: "تم حلها", value: answeredCount.toString(), dotClassName: "bg-emerald-500" },
          {
            label: "لم تُحل بعد",
            value: Math.max(questions.length - answeredCount, 0).toString(),
            dotClassName: "bg-amber-400",
          },
          { label: "الإجمالي", value: questions.length.toString(), dotClassName: "bg-slate-400" },
        ]}
        infoItems={[
          { label: "نوع القسم", value: currentCategory.title },
          { label: "عدد الأسئلة", value: `${questions.length} سؤال` },
          { label: "متوسط الوقت", value: averageSecondsLabel },
          { label: "آخر مصدر", value: currentQuestion.source },
        ]}
        sidebarFooter={
          <div className="space-y-4">
            <div className="rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-[0_16px_32px_rgba(15,23,42,0.04)]">
              <div className="text-lg font-black text-slate-950">أقسام اللفظي</div>
              <div className="mt-4 flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={`category-switch-${category.id}`}
                    type="button"
                    onClick={() => openCategory(category.id)}
                    className={`rounded-[0.95rem] px-4 py-3 text-sm font-bold transition ${
                      category.id === currentCategory.id
                        ? "bg-[#1f4b94] text-white shadow-[0_12px_24px_rgba(31,75,148,0.18)]"
                        : "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                    }`}
                  >
                    {category.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-[#d7e5ff] bg-[#f7fbff] p-4 shadow-[0_16px_32px_rgba(15,23,42,0.04)]">
              <div className="text-base font-black text-slate-950">نقطة سريعة</div>
              <p className="mt-2 text-sm leading-7 text-slate-600">
                المطلوب هنا هو فهم العلاقة أولًا، ثم اختيار البديل المطابق؛ لا تبدأ بالمقارنة
                بين الخيارات قبل تحديد نوع السؤال.
              </p>
            </div>
          </div>
        }
      />
    </div>
  );
}
