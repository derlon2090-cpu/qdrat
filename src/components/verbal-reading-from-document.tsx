"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Sparkles } from "lucide-react";

import { useAuthSession } from "@/hooks/use-auth-session";
import {
  trackQuestionProgressFromClient,
  type ClientQuestionProgressResult,
} from "@/lib/client-question-progress";
import { trackMistakeFromClient } from "@/lib/client-mistakes";
import type { PassageDetail, ReadingPassageSummary } from "@/lib/question-bank-api";

type VerbalReadingFromDocumentProps = {
  currentPassage: PassageDetail | null;
  passages: ReadingPassageSummary[];
  initialQuestionIndex?: number;
};

type SavedAnswerMap = Record<string, string>;
type ProgressFeedback = ClientQuestionProgressResult | null;

const SAVED_ANSWERS_KEY = "miyaar-manual-reading-answers";

function getChoiceLetter(index: number) {
  return ["أ", "ب", "ج", "د"][index] ?? String(index + 1);
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

function clearPassageSavedAnswers(passageId: string) {
  const savedAnswers = readSavedAnswers();
  const nextEntries = Object.entries(savedAnswers).filter(
    ([key]) => !key.startsWith(`${passageId}-`),
  );
  const nextAnswers = Object.fromEntries(nextEntries) as SavedAnswerMap;
  persistSavedAnswers(nextAnswers);
  return nextAnswers;
}

export function VerbalReadingFromDocument({
  currentPassage,
  passages,
  initialQuestionIndex = 0,
}: VerbalReadingFromDocumentProps) {
  const router = useRouter();
  const [questionIndex, setQuestionIndex] = useState(initialQuestionIndex);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [savedAnswers, setSavedAnswers] = useState<SavedAnswerMap>({});
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
  const [progressFeedback, setProgressFeedback] = useState<ProgressFeedback>(null);
  const { status: authStatus } = useAuthSession();

  useEffect(() => {
    setSavedAnswers(readSavedAnswers());
  }, []);

  useEffect(() => {
    setQuestionIndex(initialQuestionIndex);
  }, [initialQuestionIndex, currentPassage?.id]);

  if (!currentPassage || passages.length === 0 || currentPassage.questions.length === 0) {
    return (
      <div dir="rtl" className="rounded-[28px] bg-white p-8 shadow-sm ring-1 ring-slate-200">
        <div className="text-sm font-medium text-slate-500">بنك الأسئلة / الاستيعاب المقروء</div>
        <h1 className="mt-4 text-3xl font-bold text-slate-900">لا توجد قطع حاليًا، سيتم إضافتها قريبًا</h1>
        <p className="mt-4 max-w-2xl text-lg leading-9 text-slate-600">
          تم تفريغ القطع القديمة بالكامل، والواجهة الآن جاهزة لاستقبال القطع اليدوية الجديدة بصيغة
          ثابتة ومنظمة.
        </p>
      </div>
    );
  }

  const currentPassageIndex = passages.findIndex((passage) => passage.id === currentPassage.id);
  const currentQuestion =
    currentPassage.questions[
      Math.min(Math.max(questionIndex, 0), Math.max(currentPassage.questions.length - 1, 0))
    ];

  const currentPassageSummary =
    passages.find((passage) => passage.id === currentPassage.id) ?? null;
  const currentPassageRouteId =
    currentPassageSummary?.href.split("passage=")[1]?.split("&")[0] ?? currentPassage.id;
  const questionKey = `${currentPassage.id}-${currentQuestion.id}`;
  const questionHref =
    currentPassageSummary?.href ?? `/verbal/reading?passage=${encodeURIComponent(currentPassageRouteId)}`;

  useEffect(() => {
    const oldAnswer = savedAnswers[questionKey] || "";
    setSelectedAnswer(oldAnswer);
    setSubmitted(Boolean(oldAnswer));
    setShowAuthPrompt(false);
    setProgressFeedback(null);
  }, [questionKey, savedAnswers]);

  const result = useMemo(() => {
    if (!submitted || !selectedAnswer) return null;

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;
    const selectedExplanation =
      currentQuestion.explanations[selectedAnswer] || "لا يوجد شرح لهذا الخيار حاليًا.";
    const correctExplanation =
      currentQuestion.explanations[currentQuestion.correctAnswer] || "لا يوجد شرح للإجابة الصحيحة حاليًا.";

    return {
      isCorrect,
      selectedExplanation,
      correctAnswer: currentQuestion.correctAnswer,
      correctExplanation,
    };
  }, [currentQuestion, selectedAnswer, submitted]);

  const confirmAnswer = async () => {
    if (!selectedAnswer) return;

    setSubmitted(true);
    setSavedAnswers((previous) => {
      const next = {
        ...previous,
        [questionKey]: selectedAnswer,
      };
      persistSavedAnswers(next);
      return next;
    });

    const isCorrect = selectedAnswer === currentQuestion.correctAnswer;

    const progressResult = await trackQuestionProgressFromClient({
      questionKey,
      section: "verbal",
      sourceBank: "بنك الاستيعاب المقروء",
      categoryId: `reading:${currentPassageRouteId}`,
      categoryTitle: currentPassage.title,
      questionTypeLabel: "الاستيعاب المقروء",
      questionText: currentQuestion.text,
      questionHref,
      selectedAnswer,
      correctAnswer: currentQuestion.correctAnswer,
      metadata: {
        passageTitle: currentPassage.title,
        questionOrder: currentQuestion.order,
      },
      outcome: isCorrect ? "correct" : "incorrect",
      xpValue: 5,
    });

    let mistakeTracking:
      | Awaited<ReturnType<typeof trackMistakeFromClient>>
      | null = null;

    if (!isCorrect) {
      mistakeTracking = await trackMistakeFromClient({
        questionKey,
        section: "verbal",
        sourceBank: "بنك الاستيعاب المقروء",
        questionTypeLabel: "الاستيعاب المقروء",
        questionText: currentQuestion.text,
        questionHref,
        metadata: {
          passageTitle: currentPassage.title,
          questionOrder: currentQuestion.order,
        },
        outcome: "incorrect",
      });
    }

    setProgressFeedback(progressResult.result ?? null);

    if (progressResult.unauthorized || Boolean(mistakeTracking?.unauthorized)) {
      setShowAuthPrompt(true);
      return;
    }

    if (isCorrect || authStatus === "authenticated") {
      setShowAuthPrompt(false);
    }
  };

  const resetCurrentPassage = () => {
    const nextAnswers = clearPassageSavedAnswers(currentPassage.id);
    setSavedAnswers(nextAnswers);
    setQuestionIndex(0);
    setSelectedAnswer("");
    setSubmitted(false);
    setShowAuthPrompt(false);
    setProgressFeedback(null);
  };

  const goToQuestion = (newIndex: number) => {
    setQuestionIndex(newIndex);
  };

  const goToPassage = (index: number) => {
    const targetPassage = passages[index];
    if (!targetPassage) return;
    router.push(targetPassage.href);
  };

  const goToNextQuestion = () => {
    if (questionIndex < currentPassage.questions.length - 1) {
      goToQuestion(questionIndex + 1);
      return;
    }

    if (currentPassageIndex < passages.length - 1) {
      goToPassage(currentPassageIndex + 1);
    }
  };

  const goToPreviousQuestion = () => {
    if (questionIndex > 0) {
      goToQuestion(questionIndex - 1);
      return;
    }

    if (currentPassageIndex > 0) {
      const previousPassage = passages[currentPassageIndex - 1];
      router.push(previousPassage.href);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-4 flex items-center justify-between text-sm text-slate-600">
          <div className="font-medium">بنك الأسئلة / الاستيعاب المقروء</div>
          <div className="rounded-full bg-white px-4 py-2 ring-1 ring-slate-200">
            {currentPassage.sourceName || "المستند / الاستيعاب المقروء"}
          </div>
        </div>

        <div className="mb-6 rounded-[24px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold text-slate-800">{currentPassage.title}</h1>
          <p className="mt-4 whitespace-pre-wrap text-xl leading-[2.3] text-slate-800">{currentPassage.text}</p>
        </div>

        <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
          <aside className="rounded-[24px] bg-white shadow-sm ring-1 ring-slate-200">
            <div className="border-b border-slate-200 px-6 py-5">
              <h2 className="text-2xl font-bold text-slate-800">أسئلة من قطعة {currentPassage.title}</h2>
            </div>

            <div className="max-h-[640px] overflow-y-auto p-3">
              {currentPassage.questions.map((question, index) => {
                const isActive = index === questionIndex;
                const saved = savedAnswers[`${currentPassage.id}-${question.id}`];

                return (
                  <button
                    key={question.id}
                    type="button"
                    onClick={() => goToQuestion(index)}
                    className={`mb-2 w-full rounded-2xl border px-4 py-4 text-right transition ${
                      isActive
                        ? "border-sky-400 bg-sky-50 text-sky-900"
                        : saved
                          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                          : "border-transparent bg-white text-slate-800 hover:bg-slate-50"
                    }`}
                  >
                    <div className="line-clamp-2 text-lg leading-8">{question.text}</div>
                  </button>
                );
              })}
            </div>
          </aside>

          <section className="overflow-hidden rounded-[24px] bg-white shadow-sm ring-1 ring-slate-200">
            <div className="border-b border-slate-200 px-6 py-5">
              <div className="text-2xl font-bold text-sky-600">
                جميع الأسئلة ({questionIndex + 1} من {currentPassage.questions.length})
              </div>
            </div>

            <div className="p-6 md:p-8">
              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
                <h3 className="text-3xl font-bold leading-[1.9] text-slate-800">{currentQuestion.text}</h3>

                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = selectedAnswer === option;
                    const isCorrect = submitted && option === currentQuestion.correctAnswer;
                    const isWrongSelected = submitted && isSelected && option !== currentQuestion.correctAnswer;

                    let classes = "border-slate-200 bg-white text-slate-800 hover:border-sky-300 hover:bg-sky-50";

                    if (isCorrect) {
                      classes = "border-emerald-300 bg-emerald-50 text-emerald-900";
                    } else if (isWrongSelected) {
                      classes = "border-rose-300 bg-rose-50 text-rose-900";
                    } else if (isSelected) {
                      classes = "border-sky-300 bg-sky-50 text-sky-900";
                    }

                    return (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setSelectedAnswer(option);
                          setSubmitted(false);
                          setShowAuthPrompt(false);
                        }}
                        className={`rounded-2xl border px-5 py-5 text-right text-2xl transition ${classes}`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          <span>{option}</span>
                          <span className="text-xl font-bold">{getChoiceLetter(index)}-</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => void confirmAnswer()}
                    disabled={!selectedAnswer}
                    className="rounded-2xl bg-sky-600 px-8 py-4 text-xl font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    تأكيد الإجابة
                  </button>

                  <button
                    onClick={resetCurrentPassage}
                    className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-4 text-lg font-semibold text-slate-700"
                  >
                    <RotateCcw className="h-5 w-5" />
                    إعادة أسئلة هذه القطعة
                  </button>

                  <button
                    onClick={goToPreviousQuestion}
                    className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-lg font-semibold text-slate-700"
                  >
                    السؤال السابق
                  </button>

                  <button
                    onClick={goToNextQuestion}
                    className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-lg font-semibold text-slate-700"
                  >
                    السؤال التالي / قطعة أخرى
                  </button>
                </div>

                {submitted && result ? (
                  <div
                    className={`mt-6 rounded-2xl border px-5 py-5 text-lg leading-9 ${
                      result.isCorrect
                        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                        : "border-rose-200 bg-rose-50 text-rose-900"
                    }`}
                  >
                    <div className="text-2xl font-bold">
                      {result.isCorrect ? "✅ إجابة صحيحة" : "❌ إجابة خاطئة"}
                    </div>
                    <div className="mt-2">
                      <span className="font-bold">شرح اختيارك:</span> {result.selectedExplanation}
                    </div>
                    {!result.isCorrect ? (
                      <>
                        <div className="mt-2">
                          <span className="font-bold">الإجابة الصحيحة:</span> {result.correctAnswer}
                        </div>
                        <div className="mt-2">
                          <span className="font-bold">شرح الإجابة الصحيحة:</span> {result.correctExplanation}
                        </div>
                      </>
                    ) : null}

                    {progressFeedback ? (
                      <div className="mt-4 rounded-2xl border border-white/60 bg-white/60 px-4 py-4 text-sm leading-7">
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

                {showAuthPrompt ? (
                  <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-5 text-sm leading-8 text-amber-800">
                    {result?.isCorrect
                      ? "سجّل دخولك حتى يتم حفظ هذا السؤال كسؤال محلول وإضافة XP إلى ملف الطالب."
                      : "سجّل دخولك حتى يتم حفظ هذا السؤال داخل ملف الطالب وقائمة الأخطاء الخاصة بحسابك."}
                    <div className="mt-3 flex flex-wrap gap-3">
                      <Link href={`/login?next=${encodeURIComponent(questionHref)}`} className="font-semibold text-[#123B7A]">
                        تسجيل الدخول
                      </Link>
                      <Link href={`/register?next=${encodeURIComponent(questionHref)}`} className="font-semibold text-[#123B7A]">
                        إنشاء حساب
                      </Link>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
                  <div className="mb-3 text-lg font-bold text-slate-800">الانتقال إلى سؤال داخل نفس القطعة</div>
                  <div className="flex flex-wrap gap-2">
                    {currentPassage.questions.map((question, index) => (
                      <button
                        key={question.id}
                        onClick={() => goToQuestion(index)}
                        className={`rounded-xl px-4 py-3 text-base font-bold ${
                          index === questionIndex ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        سؤال {index + 1}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
                  <div className="mb-3 text-lg font-bold text-slate-800">الانتقال إلى قطعة أخرى</div>
                  <div className="flex flex-wrap gap-2">
                    {passages.map((passage, index) => (
                      <button
                        key={passage.id}
                        onClick={() => goToPassage(index)}
                        className={`rounded-xl px-4 py-3 text-base font-bold ${
                          passage.id === currentPassage.id ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {passage.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
