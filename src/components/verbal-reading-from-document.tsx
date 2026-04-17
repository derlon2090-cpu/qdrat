"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { PassageDetail, ReadingPassageSummary } from "@/lib/question-bank-api";
import { cn } from "@/lib/utils";

type VerbalReadingFromDocumentProps = {
  currentPassage: PassageDetail;
  passages: ReadingPassageSummary[];
  initialQuestionIndex?: number;
};

function getChoiceLetter(index: number) {
  return ["أ", "ب", "ج", "د"][index] ?? String(index + 1);
}

export function VerbalReadingFromDocument({
  currentPassage,
  passages,
  initialQuestionIndex = 0,
}: VerbalReadingFromDocumentProps) {
  if (!currentPassage.questions.length) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <h1 className="page-heading max-w-none">هذه القطعة لا تحتوي على أسئلة منشورة بعد</h1>
          <p className="section-copy mx-auto mt-4 max-w-2xl text-slate-600">
            أعدنا عرض نص القطعة نفسها، لكن الأسئلة المرتبطة بها لم تُنشر بعد أو ما زالت قيد المراجعة.
          </p>
        </CardContent>
      </Card>
    );
  }

  const router = useRouter();
  const boundedInitialQuestion = Math.min(Math.max(initialQuestionIndex, 0), Math.max(currentPassage.questions.length - 1, 0));
  const [questionIndex, setQuestionIndex] = useState(boundedInitialQuestion);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setQuestionIndex(boundedInitialQuestion);
  }, [boundedInitialQuestion, currentPassage.id]);

  const currentPassageIndex = passages.findIndex((passage) => passage.id === currentPassage.id);
  const currentQuestion = currentPassage.questions[questionIndex];
  const questionKey = `${currentPassage.id}-${currentQuestion.id}`;
  const selectedChoiceId = selectedAnswers[questionKey];
  const isSubmitted = submittedAnswers[questionKey] ?? false;

  const result = useMemo(() => {
    if (!isSubmitted || !selectedChoiceId) return null;

    const selectedChoice = currentQuestion.choices.find((choice) => choice.id === selectedChoiceId) ?? null;
    const correctChoice = currentQuestion.choices.find((choice) => choice.isCorrect) ?? null;
    const isVerified = Boolean(currentQuestion.correctChoiceKey) && !currentQuestion.needsReview && currentQuestion.answerConfidence >= 0.8;

    if (!selectedChoice || !correctChoice) {
      return {
        isVerified: false,
        isCorrect: false,
        correctAnswerText: null,
        explanation: currentQuestion.explanation,
      };
    }

    return {
      isVerified,
      isCorrect: selectedChoice.id === correctChoice.id,
      correctAnswerText: correctChoice.text,
      explanation: currentQuestion.explanation,
    };
  }, [currentQuestion, isSubmitted, selectedChoiceId]);

  function goToQuestion(nextQuestionIndex: number) {
    setQuestionIndex(nextQuestionIndex);
  }

  function goToPassage(nextPassageIndex: number, nextQuestion = 0) {
    const nextPassage = passages[nextPassageIndex];
    if (!nextPassage) return;
    router.push(`/exam?section=verbal_reading&passageId=${nextPassage.id}&question=${nextQuestion}`);
  }

  function confirmAnswer() {
    if (!selectedChoiceId) return;
    setSubmittedAnswers((previous) => ({ ...previous, [questionKey]: true }));
  }

  function goToNextQuestion() {
    if (questionIndex < currentPassage.questions.length - 1) {
      goToQuestion(questionIndex + 1);
      return;
    }

    if (currentPassageIndex >= 0 && currentPassageIndex < passages.length - 1) {
      goToPassage(currentPassageIndex + 1, 0);
    }
  }

  function goToPreviousQuestion() {
    if (questionIndex > 0) {
      goToQuestion(questionIndex - 1);
      return;
    }

    if (currentPassageIndex > 0) {
      const previousPassage = passages[currentPassageIndex - 1];
      const previousQuestionIndex = Math.max(previousPassage.questionCount - 1, 0);
      goToPassage(currentPassageIndex - 1, previousQuestionIndex);
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-4 text-sm text-slate-600">
        <div className="font-medium">بنك الأسئلة / استيعاب المقروء</div>
        <div className="rounded-full bg-white px-4 py-2 ring-1 ring-slate-200">
          {currentPassage.sourceName || "المستند / القطع اللفظية"}
        </div>
      </div>

      <Card>
        <CardContent className="p-6 md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <Badge className="border-transparent bg-[#123B7A] text-white">نص القطعة من المستند</Badge>
              <h1 className="page-heading max-w-none text-right">
                {currentPassage.pieceNumber ? `قطعة ${currentPassage.pieceNumber}: ` : ""}
                {currentPassage.title}
              </h1>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[#123B7A]/10 px-3 py-1 text-xs font-semibold text-[#123B7A]">
                {currentPassage.questions.length} أسئلة
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                {currentPassage.difficulty}
              </span>
            </div>
          </div>

          <div className="mt-6 whitespace-pre-wrap rounded-[1.8rem] bg-slate-50 p-6 text-lg leading-[2.2] text-slate-900 ring-1 ring-slate-200">
            {currentPassage.text}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <aside className="rounded-[24px] bg-white shadow-sm ring-1 ring-slate-200">
          <div className="border-b border-slate-200 px-6 py-5">
            <h2 className="text-2xl font-bold text-slate-800">أسئلة من قطعة {currentPassage.title}</h2>
          </div>

          <div className="max-h-[640px] overflow-y-auto p-3">
            {currentPassage.questions.map((question, index) => {
              const isActive = index === questionIndex;
              const isAnswered = Boolean(submittedAnswers[`${currentPassage.id}-${question.id}`]);

              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => goToQuestion(index)}
                  className={cn(
                    "mb-2 w-full rounded-2xl border px-4 py-4 text-right transition",
                    isActive
                      ? "border-sky-400 bg-sky-50 text-sky-900"
                      : isAnswered
                        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                        : "border-transparent bg-white text-slate-800 hover:bg-slate-50",
                  )}
                >
                  <div className="line-clamp-2 text-lg leading-8">{question.text}</div>
                </button>
              );
            })}
          </div>
        </aside>

        <section className="overflow-hidden rounded-[24px] bg-white shadow-sm ring-1 ring-slate-200">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-6 py-5">
            <div className="text-2xl font-bold text-sky-600">
              جميع الأسئلة ({questionIndex + 1} من {currentPassage.questions.length})
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="rounded-full bg-slate-100 px-3 py-2">المصدر الأصلي</span>
              <span className="rounded-full bg-slate-100 px-3 py-2">عرض نص القطعة كما هو</span>
            </div>
          </div>

          <div className="p-6 md:p-8">
            <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
              <h3 className="text-3xl font-bold leading-[1.9] text-slate-800">{currentQuestion.text}</h3>

              <div className="mt-8 grid gap-4 md:grid-cols-2">
                {currentQuestion.choices.map((choice, index) => {
                  const isSelected = selectedChoiceId === choice.id;
                  const isCorrectChoice = result?.isVerified && choice.isCorrect;
                  const isWrongSelected = result?.isVerified && isSelected && !choice.isCorrect;

                  let classes = "border-slate-200 bg-white text-slate-800 hover:border-sky-300 hover:bg-sky-50";
                  if (isCorrectChoice) {
                    classes = "border-emerald-300 bg-emerald-50 text-emerald-900";
                  } else if (isWrongSelected) {
                    classes = "border-rose-300 bg-rose-50 text-rose-900";
                  } else if (isSelected) {
                    classes = "border-sky-300 bg-sky-50 text-sky-900";
                  }

                  return (
                    <button
                      key={choice.id}
                      type="button"
                      onClick={() => {
                        setSelectedAnswers((previous) => ({ ...previous, [questionKey]: choice.id }));
                        setSubmittedAnswers((previous) => ({ ...previous, [questionKey]: false }));
                      }}
                      className={`rounded-2xl border px-5 py-5 text-right text-2xl transition ${classes}`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <span>{choice.text}</span>
                        <span className="text-xl font-bold">{getChoiceLetter(index)}-</span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button
                  onClick={confirmAnswer}
                  disabled={!selectedChoiceId}
                  className="h-auto rounded-2xl bg-sky-600 px-8 py-4 text-xl font-bold text-white hover:bg-sky-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  تأكيد الإجابة
                </Button>

                <Button variant="outline" onClick={goToPreviousQuestion} className="h-auto rounded-2xl px-6 py-4 text-lg font-semibold">
                  السؤال السابق
                </Button>

                <Button variant="outline" onClick={goToNextQuestion} className="h-auto rounded-2xl px-6 py-4 text-lg font-semibold">
                  السؤال التالي / قطعة أخرى
                </Button>
              </div>

              {isSubmitted && result ? (
                <div
                  className={cn(
                    "mt-6 rounded-2xl border px-5 py-5 text-lg leading-9",
                    result.isVerified
                      ? result.isCorrect
                        ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                        : "border-rose-200 bg-rose-50 text-rose-900"
                      : "border-amber-200 bg-amber-50 text-amber-900",
                  )}
                >
                  <div className="text-2xl font-bold">
                    {result.isVerified
                      ? result.isCorrect
                        ? "✅ إجابة صحيحة"
                        : "❌ إجابة خاطئة"
                      : "ℹ️ الإجابة الرسمية لهذا السؤال ما زالت قيد المراجعة"}
                  </div>
                  {result.correctAnswerText ? (
                    <div className="mt-2">
                      <span className="font-bold">الإجابة الصحيحة:</span> {result.correctAnswerText}
                    </div>
                  ) : null}
                  {result.explanation ? (
                    <div className="mt-2">
                      <span className="font-bold">الشرح المختصر:</span> {result.explanation}
                    </div>
                  ) : null}
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
                      type="button"
                      onClick={() => goToQuestion(index)}
                      className={cn(
                        "rounded-xl px-4 py-3 text-base font-bold",
                        index === questionIndex ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-700",
                      )}
                    >
                      سؤال {index + 1}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-5 ring-1 ring-slate-200">
                <div className="mb-3 text-lg font-bold text-slate-800">الانتقال إلى قطعة أخرى</div>
                <div className="max-h-40 overflow-y-auto">
                  <div className="flex flex-wrap gap-2">
                    {passages.map((passage, index) => (
                      <button
                        key={passage.id}
                        type="button"
                        onClick={() => goToPassage(index, 0)}
                        className={cn(
                          "rounded-xl px-4 py-3 text-base font-bold",
                          passage.id === currentPassage.id ? "bg-sky-600 text-white" : "bg-slate-100 text-slate-700",
                        )}
                      >
                        {passage.title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
