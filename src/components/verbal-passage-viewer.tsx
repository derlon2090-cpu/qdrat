"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RotateCcw, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/hooks/use-auth-session";
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

function getCorrectExplanation(question: VerbalPassageRecord["questions"][number]) {
  return (
    question.explanation?.trim() ||
    "هذا هو الخيار الصحيح وفق البيانات المعتمدة لهذه القطعة."
  );
}

function getSelectedExplanation(
  question: VerbalPassageRecord["questions"][number],
  selectedKey: "A" | "B" | "C" | "D",
) {
  if (selectedKey === question.correctOption) {
    return getCorrectExplanation(question);
  }

  return "هذا الخيار غير صحيح وفق البيانات المعتمدة لهذه القطعة.";
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
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<SavedAnswerMap>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<SavedSubmissionMap>({});
  const [authPromptQuestionId, setAuthPromptQuestionId] = useState<string | null>(null);
  const [progressFeedback, setProgressFeedback] = useState<ProgressFeedback>(null);
  const { status: authStatus } = useAuthSession();

  useEffect(() => {
    setSelectedAnswers(readSavedAnswers());
    setSubmittedAnswers(readSavedSubmissions());
  }, []);

  useEffect(() => {
    const matchedQuestionIndex = findQuestionIndexById(passage, initialQuestionId);
    setQuestionIndex(matchedQuestionIndex >= 0 ? matchedQuestionIndex : 0);
    setAuthPromptQuestionId(null);
    setProgressFeedback(null);
  }, [initialQuestionId, passage]);

  const currentQuestion =
    passage.questions[Math.min(Math.max(questionIndex, 0), Math.max(passage.questions.length - 1, 0))];

  const currentQuestionKey = `${passage.slug}:${currentQuestion.id}`;
  const selectedKey = selectedAnswers[currentQuestionKey];
  const submitted = Boolean(submittedAnswers[currentQuestionKey]);
  const isCorrect = submitted && selectedKey === currentQuestion.correctOption;
  const questionHref = `/verbal/reading?passage=${encodeURIComponent(passage.slug)}&question=${encodeURIComponent(currentQuestion.id)}`;

  const submittedCount = useMemo(
    () =>
      passage.questions.filter((question) => submittedAnswers[`${passage.slug}:${question.id}`]).length,
    [passage.questions, passage.slug, submittedAnswers],
  );

  const isPassageCompleted =
    mode === "student" &&
    passage.questions.length > 0 &&
    submittedCount === passage.questions.length;

  function resetPassageSession() {
    const nextAnswers = clearPassageAnswers(passage.slug);
    const nextSubmissions = clearPassageSubmissions(passage.slug);
    setSelectedAnswers(nextAnswers);
    setSubmittedAnswers(nextSubmissions);
    setQuestionIndex(0);
    setAuthPromptQuestionId(null);
    setProgressFeedback(null);
  }

  useEffect(() => {
    if (mode !== "student" || searchParams.get("reset") !== "1") {
      return;
    }

    const targetPassage = searchParams.get("passage")?.trim();
    if (targetPassage && targetPassage !== passage.slug) {
      return;
    }

    resetPassageSession();

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("reset");
    nextParams.set("passage", passage.slug);
    router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
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

  function getQuestionProgressClasses(status: PassageQuestionProgressState, active: boolean) {
    if (status === "correct") {
      return active
        ? "border-emerald-600 bg-emerald-600 text-white ring-4 ring-emerald-100"
        : "border-emerald-200 bg-emerald-50 text-emerald-800";
    }

    if (status === "incorrect") {
      return active
        ? "border-rose-600 bg-rose-600 text-white ring-4 ring-rose-100"
        : "border-rose-200 bg-rose-50 text-rose-800";
    }

    if (status === "current") {
      return "border-slate-900 bg-slate-900 text-white";
    }

    return active
      ? "border-[#123B7A] bg-[#eef4ff] text-[#123B7A]"
      : "border-slate-200 bg-white text-slate-700";
  }

  async function confirmCurrentAnswer() {
    if (!selectedKey) return;

    setSubmittedAnswers((previous) => {
      const next = {
        ...previous,
        [currentQuestionKey]: true,
      };
      persistSavedSubmissions(next);
      return next;
    });

    const isAnswerCorrect = selectedKey === currentQuestion.correctOption;
    const selectedAnswerText = getQuestionOptions(currentQuestion).find(
      (option) => option.key === selectedKey,
    )?.text;

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
      xpValue: 5,
    });

    let mistakeTracking:
      | Awaited<ReturnType<typeof trackMistakeFromClient>>
      | null = null;

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
          questionOrder: currentQuestion.questionOrder,
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
  }

  function goToQuestion(index: number) {
    if (index < 0 || index >= passage.questions.length) return;
    setQuestionIndex(index);
    setAuthPromptQuestionId(null);
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

  return (
    <div
      dir="rtl"
      aria-busy={isNavigating}
      className="space-y-6"
    >
      {isNavigating ? (
        <div className="rounded-full border border-[#E8D8B3] bg-[#fffaf1] px-4 py-3 text-sm font-semibold text-[#8A6116] shadow-sm">
          جاري فتح القطعة التالية...
        </div>
      ) : null}

      <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
          <div>بنك الأسئلة / الاستيعاب المقروء</div>
          <div className="rounded-full bg-slate-50 px-4 py-2 ring-1 ring-slate-200">
            {mode === "admin" ? "وضع الإدارة" : "وضع الطالب"}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="display-font text-3xl font-bold text-slate-950">
              {passage.title}
            </h1>
            <div className="mt-2 text-xs font-semibold text-[#123B7A]">
              /{passage.slug}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-[#123B7A]/8 px-3 py-1 font-semibold text-[#123B7A]">
              {passage.questions.length} أسئلة
            </span>
            <span
              className={`rounded-full px-3 py-1 font-semibold ${
                passage.status === "published"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {passage.status === "published" ? "منشورة" : "مسودة"}
            </span>
          </div>
        </div>

        <div className="mt-5 whitespace-pre-wrap text-lg leading-9 text-slate-800">
          {passage.passageText}
        </div>
      </div>

      <div>
        <section className="rounded-[1.9rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="text-sm font-semibold text-[#123B7A]">
                {mode === "admin" ? "مراجعة الإدارة" : "عرض الطالب"} / سؤال{" "}
                {questionIndex + 1} من {passage.questions.length}
              </div>
              <h2 className="display-font mt-3 text-3xl font-bold text-slate-950">
                {currentQuestion.questionText}
              </h2>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500 ring-1 ring-slate-200">
              الإصدار {passage.version}
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {getQuestionOptions(currentQuestion).map((option) => {
              const chosen = selectedKey === option.key;
              const showCorrect = mode === "admin" || (submitted && option.key === currentQuestion.correctOption);
              const showWrongSelected =
                mode === "student" &&
                submitted &&
                chosen &&
                option.key !== currentQuestion.correctOption;

              let classes =
                "border-slate-200 bg-white text-slate-800 hover:border-[#C99A43] hover:bg-[#fffaf1]";

              if (showCorrect) {
                classes = "border-emerald-300 bg-emerald-50 text-emerald-900";
              } else if (showWrongSelected) {
                classes = "border-rose-300 bg-rose-50 text-rose-900";
              } else if (chosen) {
                classes = "border-[#123B7A] bg-[#eef4ff] text-[#123B7A]";
              }

              return (
                <button
                  key={`${currentQuestion.id}-${option.key}`}
                  type="button"
                  disabled={mode === "admin" || isNavigating}
                  onClick={() => handleSelectOption(option.key)}
                  className={`rounded-[1.4rem] border px-5 py-5 text-right transition ${classes} ${
                    mode === "admin" || isNavigating ? "cursor-default" : ""
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex-1 text-lg leading-8">{option.text}</span>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                      {option.label}
                    </span>
                  </div>

                  {mode === "admin" && option.key === currentQuestion.correctOption ? (
                    <div className="mt-3 text-sm font-semibold text-emerald-700">
                      الإجابة الصحيحة
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>

          {mode === "student" ? (
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                onClick={() => void confirmCurrentAnswer()}
                disabled={isNavigating || !selectedKey}
              >
                تأكيد الإجابة
              </Button>

              <Button variant="outline" size="lg" onClick={resetPassageSession} className="gap-2">
                <RotateCcw className="h-4 w-4" />
                إعادة أسئلة هذه القطعة
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={goToPreviousQuestion}
                disabled={isNavigating || questionIndex === 0}
              >
                السؤال السابق
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={goToNextQuestion}
                disabled={
                  isNavigating ||
                  (!onOpenNextPassage && questionIndex === passage.questions.length - 1)
                }
              >
                {questionIndex === passage.questions.length - 1
                  ? "السؤال التالي / قطعة أخرى"
                  : "السؤال التالي"}
              </Button>
            </div>
          ) : null}

          {mode === "student" && submitted && selectedKey ? (
            <div
              className={`mt-6 rounded-[1.4rem] border px-5 py-5 text-base leading-8 ${
                isCorrect
                  ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                  : "border-rose-200 bg-rose-50 text-rose-900"
              }`}
            >
              <div className="text-xl font-bold">
                {isCorrect ? "إجابة صحيحة" : "إجابة خاطئة"}
              </div>
              <div className="mt-3">
                <span className="font-bold">شرح اختيارك:</span>{" "}
                {getSelectedExplanation(currentQuestion, selectedKey)}
              </div>
              {!isCorrect ? (
                <>
                  <div className="mt-3">
                    <span className="font-bold">الإجابة الصحيحة:</span>{" "}
                    {getCorrectAnswerText(currentQuestion)}
                  </div>
                  <div className="mt-3">
                    <span className="font-bold">شرح الإجابة الصحيحة:</span>{" "}
                    {getCorrectExplanation(currentQuestion)}
                  </div>
                </>
              ) : null}

              {progressFeedback ? (
                <div className="mt-4 rounded-[1.1rem] border border-white/60 bg-white/60 px-4 py-3 text-sm leading-7">
                  <div className="flex flex-wrap items-center gap-2 font-bold">
                    <Sparkles className="h-4 w-4" />
                    {progressFeedback.awardedXp > 0
                      ? `تمت إضافة ${progressFeedback.awardedXp} XP إلى ملفك.`
                      : progressFeedback.alreadySolved
                        ? "هذه القطعة محسوبة سابقًا داخل إنجازاتك."
                        : "تم حفظ المحاولة داخل ملف الطالب."}
                  </div>
                  <div className="mt-2">
                    مجموعك الحالي: {progressFeedback.totalXp.toLocaleString("en-US")} XP
                    {` `} - الأسئلة المحلولة:{" "}
                    {progressFeedback.solvedQuestionsCount.toLocaleString("en-US")}
                  </div>
                  {progressFeedback.reachedProfessionalLevel ? (
                    <div className="mt-2 font-bold">
                      وصلت للفل المحترف وأنت جاهز تقريبًا للاختبار.
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}

          {mode === "student" && authPromptQuestionId === currentQuestion.id ? (
            <div className="mt-6 rounded-[1.4rem] border border-amber-200 bg-amber-50 px-5 py-5 text-sm leading-8 text-amber-800">
              {isCorrect
                ? "سجّل دخولك حتى يتم حفظ هذا السؤال كسؤال محلول وإضافة XP إلى ملف الطالب."
                : "سجّل دخولك حتى يتم حفظ هذا السؤال داخل ملف الطالب وقائمة الأخطاء الخاصة بحسابك."}
              <div className="mt-3 flex flex-wrap gap-3">
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

          {mode === "admin" && currentQuestion.explanation ? (
            <div className="mt-6 rounded-[1.4rem] border border-slate-200 bg-slate-50 px-5 py-5 text-sm leading-8 text-slate-700">
              <span className="font-semibold text-slate-900">الشرح:</span>{" "}
              {currentQuestion.explanation}
            </div>
          ) : null}

          <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
            <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/70 p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div className="text-lg font-bold text-slate-900">
                  أسئلة القطعة
                </div>
                <div className="text-xs font-semibold text-slate-500">
                  الأخضر صحيح، الأحمر خطأ
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {passage.questions.map((question, index) => {
                  const status = getQuestionProgressState(question, index);
                  const active = index === questionIndex;

                  return (
                    <button
                      key={`jump-${question.id}`}
                      type="button"
                      disabled={isNavigating}
                      onClick={() => goToQuestion(index)}
                      className={`min-w-[108px] rounded-[999px] border px-5 py-4 text-base font-bold transition ${getQuestionProgressClasses(
                        status,
                        active,
                      )} ${isNavigating ? "cursor-wait opacity-70" : ""}`}
                    >
                      سؤال {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/70 p-5">
              <div className="mb-3 text-lg font-bold text-slate-900">
                الانتقال إلى قطعة أخرى
              </div>
              <div className="flex flex-wrap gap-3">
                {onOpenNextPassage ? (
                  <Button size="default" onClick={onOpenNextPassage} disabled={isNavigating}>
                    {nextPassageTitle
                      ? `افتح ${nextPassageTitle}`
                      : "افتح القطعة التالية"}
                  </Button>
                ) : null}

                {onBackToResults ? (
                  <Button
                    variant="outline"
                    size="default"
                    onClick={onBackToResults}
                    disabled={isNavigating}
                  >
                    ارجع إلى نتائج البحث
                  </Button>
                ) : null}
              </div>
            </div>
          </div>

          {isPassageCompleted ? (
            <div className="mt-8 rounded-[1.4rem] border border-[#E8D8B3] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,247,244,0.96))] p-5">
              <div className="display-font text-2xl font-bold text-slate-950">
                أنهيت أسئلة هذه القطعة
              </div>
              <p className="mt-3 text-sm leading-8 text-slate-600">
                يمكنك الآن الانتقال مباشرة إلى القطعة التالية، أو الرجوع إلى
                البحث لاختيار قطعة أخرى بالعنوان أو بالكلمة المفتاحية.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                {onOpenNextPassage ? (
                  <Button size="default" onClick={onOpenNextPassage} disabled={isNavigating}>
                    {nextPassageTitle
                      ? `انتقل إلى ${nextPassageTitle}`
                      : "الانتقال إلى القطعة التالية"}
                  </Button>
                ) : null}

                {onBackToResults ? (
                  <Button
                    variant="outline"
                    size="default"
                    onClick={onBackToResults}
                    disabled={isNavigating}
                  >
                    اختر قطعة أخرى
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}
