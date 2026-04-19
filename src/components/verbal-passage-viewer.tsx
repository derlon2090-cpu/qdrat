"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/hooks/use-auth-session";
import { trackMistakeFromClient } from "@/lib/client-mistakes";
import type { VerbalPassageRecord } from "@/lib/verbal-passages";

type ViewerMode = "student" | "admin";
type SavedAnswerMap = Record<string, "A" | "B" | "C" | "D" | undefined>;

const SAVED_ANSWERS_KEY = "miyaar-verbal-reading-answers";

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

export function VerbalPassageViewer({
  passage,
  mode = "student",
  nextPassageTitle,
  onOpenNextPassage,
  onBackToResults,
}: {
  passage: VerbalPassageRecord;
  mode?: ViewerMode;
  nextPassageTitle?: string | null;
  onOpenNextPassage?: (() => void) | null;
  onBackToResults?: (() => void) | null;
}) {
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<SavedAnswerMap>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, boolean>>({});
  const [authPromptQuestionId, setAuthPromptQuestionId] = useState<string | null>(null);
  const { status: authStatus } = useAuthSession();

  useEffect(() => {
    setSelectedAnswers(readSavedAnswers());
  }, []);

  useEffect(() => {
    setQuestionIndex(0);
    setSubmittedAnswers({});
    setAuthPromptQuestionId(null);
  }, [passage.id]);

  const currentQuestion =
    passage.questions[Math.min(Math.max(questionIndex, 0), Math.max(passage.questions.length - 1, 0))];

  const currentQuestionKey = `${passage.slug}:${currentQuestion.id}`;
  const selectedKey = selectedAnswers[currentQuestionKey];
  const submitted = Boolean(submittedAnswers[currentQuestion.id]);
  const isCorrect = submitted && selectedKey === currentQuestion.correctOption;

  const submittedCount = useMemo(
    () => passage.questions.filter((question) => submittedAnswers[question.id]).length,
    [passage.questions, submittedAnswers],
  );

  const isPassageCompleted =
    mode === "student" &&
    passage.questions.length > 0 &&
    submittedCount === passage.questions.length;

  async function confirmCurrentAnswer() {
    if (!selectedKey) return;

    setSubmittedAnswers((previous) => ({
      ...previous,
      [currentQuestion.id]: true,
    }));

    const trackingResult = await trackMistakeFromClient({
      questionKey: currentQuestionKey,
      section: "verbal",
      sourceBank: "بنك القطع اللفظي",
      questionTypeLabel: "لفظي",
      questionText: currentQuestion.questionText,
      questionHref: `/verbal/reading?passage=${encodeURIComponent(passage.slug)}`,
      metadata: {
        passageTitle: passage.title,
        questionOrder: currentQuestion.questionOrder,
      },
      outcome: selectedKey === currentQuestion.correctOption ? "correct" : "incorrect",
    });

    if (trackingResult.unauthorized && selectedKey !== currentQuestion.correctOption) {
      setAuthPromptQuestionId(currentQuestion.id);
      return;
    }

    if (selectedKey === currentQuestion.correctOption || authStatus === "authenticated") {
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
    setSubmittedAnswers((previous) => ({
      ...previous,
      [currentQuestion.id]: false,
    }));
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
    <div dir="rtl" className="space-y-6">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
          <div>بنك الأسئلة / القطع اللفظية</div>
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

      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <aside className="rounded-[1.9rem] border border-slate-200 bg-white p-4 shadow-sm">
          <div className="px-3 pb-4">
            <div className="text-sm font-semibold text-slate-500">أسئلة القطعة</div>
            <div className="display-font mt-2 text-2xl font-bold text-slate-950">
              {passage.title}
            </div>
            <div className="mt-2 text-sm leading-7 text-slate-500">
              اختر سؤالًا من نفس القطعة مباشرة، وسيبقى السؤال الحالي مميزًا
              والسؤال الذي أُجيب عنه ظاهرًا بلون مختلف.
            </div>
          </div>

          <div className="max-h-[720px] space-y-2 overflow-y-auto px-1 pb-1">
            {passage.questions.map((question, index) => {
              const key = `${passage.slug}:${question.id}`;
              const active = index === questionIndex;
              const answered = Boolean(selectedAnswers[key]);

              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => goToQuestion(index)}
                  className={`w-full rounded-[1.25rem] border px-4 py-4 text-right transition ${
                    active
                      ? "border-[#123B7A] bg-[#eef4ff] text-[#123B7A]"
                      : answered
                        ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                        : "border-slate-200 bg-slate-50/70 text-slate-700 hover:bg-white"
                  }`}
                >
                  <div className="text-xs font-semibold opacity-80">سؤال {index + 1}</div>
                  <div className="mt-2 line-clamp-2 text-sm leading-7">
                    {question.questionText}
                  </div>
                </button>
              );
            })}
          </div>
        </aside>

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
                  disabled={mode === "admin"}
                  onClick={() => handleSelectOption(option.key)}
                  className={`rounded-[1.4rem] border px-5 py-5 text-right transition ${classes} ${
                    mode === "admin" ? "cursor-default" : ""
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
              <Button size="lg" onClick={() => void confirmCurrentAnswer()} disabled={!selectedKey}>
                تأكيد الإجابة
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={goToPreviousQuestion}
                disabled={questionIndex === 0}
              >
                السؤال السابق
              </Button>

              <Button
                variant="outline"
                size="lg"
                onClick={goToNextQuestion}
                disabled={!onOpenNextPassage && questionIndex === passage.questions.length - 1}
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
            </div>
          ) : null}

          {mode === "student" && authPromptQuestionId === currentQuestion.id ? (
            <div className="mt-6 rounded-[1.4rem] border border-amber-200 bg-amber-50 px-5 py-5 text-sm leading-8 text-amber-800">
              سجّل دخولك حتى يتم حفظ هذا السؤال داخل قائمة الأخطاء الخاصة بحسابك.
              <div className="mt-3 flex flex-wrap gap-3">
                <Link
                  href="/login?next=/question-bank?track=mistakes"
                  className="font-semibold text-[#123B7A]"
                >
                  تسجيل الدخول
                </Link>
                <Link
                  href="/register?next=/question-bank?track=mistakes"
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

          <div className="mt-8 grid gap-4 lg:grid-cols-2">
            <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/70 p-5">
              <div className="mb-3 text-lg font-bold text-slate-900">
                الانتقال إلى سؤال آخر داخل نفس القطعة
              </div>
              <div className="flex flex-wrap gap-2">
                {passage.questions.map((question, index) => (
                  <button
                    key={`jump-${question.id}`}
                    type="button"
                    onClick={() => goToQuestion(index)}
                    className={`rounded-xl px-4 py-3 text-sm font-bold ${
                      index === questionIndex
                        ? "bg-slate-900 text-white"
                        : "bg-white text-slate-700 ring-1 ring-slate-200"
                    }`}
                  >
                    سؤال {index + 1}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/70 p-5">
              <div className="mb-3 text-lg font-bold text-slate-900">
                الانتقال إلى قطعة أخرى
              </div>
              <div className="flex flex-wrap gap-3">
                {onOpenNextPassage ? (
                  <Button size="default" onClick={onOpenNextPassage}>
                    {nextPassageTitle
                      ? `افتح ${nextPassageTitle}`
                      : "افتح القطعة التالية"}
                  </Button>
                ) : null}

                {onBackToResults ? (
                  <Button variant="outline" size="default" onClick={onBackToResults}>
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
                  <Button size="default" onClick={onOpenNextPassage}>
                    {nextPassageTitle
                      ? `انتقل إلى ${nextPassageTitle}`
                      : "الانتقال إلى القطعة التالية"}
                  </Button>
                ) : null}

                {onBackToResults ? (
                  <Button variant="outline" size="default" onClick={onBackToResults}>
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
