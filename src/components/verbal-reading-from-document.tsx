"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, BookOpen, Bookmark, BookmarkCheck, Flag, Type } from "lucide-react";

import type { PassageDetail, ReadingPassageSummary } from "@/lib/question-bank-api";
import { cn } from "@/lib/utils";

type VerbalReadingFromDocumentProps = {
  currentPassage: PassageDetail;
  passages: ReadingPassageSummary[];
  initialQuestionIndex?: number;
};

type SavedAnswerMap = Record<string, string>;
type SavedItemMap = Record<string, boolean>;

const SAVED_ANSWERS_KEY = "miyaar-reading-document-answers";
const SAVED_ITEMS_KEY = "miyaar-reading-document-saved-items";

function getChoiceLetter(index: number) {
  return ["أ", "ب", "ج", "د"][index] ?? String(index + 1);
}

function readSessionMap(key: string) {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.sessionStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function readLocalMap(key: string) {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function persistSessionMap(key: string, value: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(key, JSON.stringify(value));
}

function persistLocalMap(key: string, value: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
}

export function VerbalReadingFromDocument({
  currentPassage,
  passages,
  initialQuestionIndex = 0,
}: VerbalReadingFromDocumentProps) {
  const router = useRouter();
  const boundedInitialQuestion = Math.min(
    Math.max(initialQuestionIndex, 0),
    Math.max(currentPassage.questions.length - 1, 0),
  );

  const [questionIndex, setQuestionIndex] = useState(boundedInitialQuestion);
  const [selectedAnswer, setSelectedAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [savedAnswers, setSavedAnswers] = useState<SavedAnswerMap>({});
  const [savedItems, setSavedItems] = useState<SavedItemMap>({});
  const [showFullPassage, setShowFullPassage] = useState(false);
  const [showExplanationPanel, setShowExplanationPanel] = useState(false);
  const [reportSent, setReportSent] = useState(false);
  const [fontScale, setFontScale] = useState<"base" | "large" | "xl">("large");

  useEffect(() => {
    setSavedAnswers(readSessionMap(SAVED_ANSWERS_KEY) as SavedAnswerMap);
    setSavedItems(readLocalMap(SAVED_ITEMS_KEY) as SavedItemMap);
  }, []);

  useEffect(() => {
    setQuestionIndex(boundedInitialQuestion);
  }, [boundedInitialQuestion, currentPassage.id]);

  const currentPassageIndex = passages.findIndex((passage) => passage.id === currentPassage.id);
  const currentQuestion = currentPassage.questions[questionIndex];

  if (!currentQuestion) {
    return (
      <div dir="rtl" className="rounded-[24px] bg-white p-10 text-center shadow-sm ring-1 ring-slate-200">
        <h1 className="text-3xl font-bold text-slate-800">هذه القطعة لا تحتوي على أسئلة منشورة بعد</h1>
      </div>
    );
  }

  const correctChoice = currentQuestion.choices.find((choice) => choice.isCorrect) ?? null;
  const correctAnswer = correctChoice?.text ?? "";
  const questionKey = `${currentPassage.id}-${currentQuestion.id}`;
  const savedQuestionKey = `question:${questionKey}`;
  const isQuestionSaved = Boolean(savedItems[savedQuestionKey]);

  useEffect(() => {
    const restored = savedAnswers[questionKey] || "";
    setSelectedAnswer(restored);
    setSubmitted(Boolean(restored));
    setShowExplanationPanel(false);
    setReportSent(false);
  }, [questionKey, savedAnswers]);

  const result = useMemo(() => {
    if (!submitted || !selectedAnswer) return null;

    return {
      isCorrect: Boolean(correctAnswer) && selectedAnswer === correctAnswer,
      correctAnswer,
      explanation: currentQuestion.explanation,
      needsReview: currentQuestion.needsReview,
    };
  }, [correctAnswer, currentQuestion.explanation, currentQuestion.needsReview, selectedAnswer, submitted]);

  const fontTokens = useMemo(() => {
    switch (fontScale) {
      case "base":
        return {
          question: "text-2xl leading-[1.85]",
          option: "text-xl",
          passage: "text-lg leading-[2.15]",
        };
      case "xl":
        return {
          question: "text-[2.15rem] leading-[1.95]",
          option: "text-[1.7rem]",
          passage: "text-[1.35rem] leading-[2.35]",
        };
      case "large":
      default:
        return {
          question: "text-3xl leading-[1.9]",
          option: "text-2xl",
          passage: "text-xl leading-[2.3]",
        };
    }
  }, [fontScale]);

  const goToQuestion = (newIndex: number) => {
    setQuestionIndex(newIndex);
  };

  const goToPassage = (index: number, nextQuestion = 0) => {
    const targetPassage = passages[index];
    if (!targetPassage) return;
    router.push(`/exam?section=verbal_reading&passageId=${targetPassage.id}&question=${nextQuestion}`);
  };

  const confirmAnswer = () => {
    if (!selectedAnswer) return;

    setSubmitted(true);
    setSavedAnswers((previous) => {
      const next = {
        ...previous,
        [questionKey]: selectedAnswer,
      };
      persistSessionMap(SAVED_ANSWERS_KEY, next);
      return next;
    });
  };

  const toggleSave = () => {
    setSavedItems((previous) => {
      const next = {
        ...previous,
        [savedQuestionKey]: !previous[savedQuestionKey],
      };
      persistLocalMap(SAVED_ITEMS_KEY, next);
      return next;
    });
  };

  const cycleFontScale = () => {
    setFontScale((previous) => {
      if (previous === "base") return "large";
      if (previous === "large") return "xl";
      return "base";
    });
  };

  const goToNextQuestion = () => {
    if (questionIndex < currentPassage.questions.length - 1) {
      goToQuestion(questionIndex + 1);
      return;
    }

    if (currentPassageIndex < passages.length - 1) {
      goToPassage(currentPassageIndex + 1, 0);
    }
  };

  const goToPreviousQuestion = () => {
    if (questionIndex > 0) {
      goToQuestion(questionIndex - 1);
      return;
    }

    if (currentPassageIndex > 0) {
      const previousPassageIndex = currentPassageIndex - 1;
      const previousPassage = passages[previousPassageIndex];
      const previousQuestionIndex = Math.max(previousPassage.questionCount - 1, 0);
      goToPassage(previousPassageIndex, previousQuestionIndex);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen bg-slate-100 px-4 py-6 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-4 flex items-center justify-between text-sm text-slate-600">
          <div className="font-medium">بنك الأسئلة / استيعاب المقروء</div>
          <div className="rounded-full bg-white px-4 py-2 ring-1 ring-slate-200">
            {currentPassage.sourceName || "المستند / القطع اللفظية"}
          </div>
        </div>

        <div className="mb-6 rounded-[24px] bg-white p-6 shadow-sm ring-1 ring-slate-200">
          <h1 className="text-3xl font-bold text-slate-800">{currentPassage.title}</h1>
          <div className="mt-4">
            <p
              className={cn("whitespace-pre-wrap text-slate-800 transition-all", fontTokens.passage)}
              style={
                showFullPassage
                  ? undefined
                  : {
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }
              }
            >
              {currentPassage.text}
            </p>
            <button
              type="button"
              onClick={() => setShowFullPassage((previous) => !previous)}
              className="mt-2 text-lg font-semibold text-sky-500 hover:text-sky-700"
            >
              {showFullPassage ? "إخفاء" : "المزيد"}
            </button>
          </div>
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
                    className={cn(
                      "mb-2 w-full rounded-2xl border px-4 py-4 text-right transition",
                      isActive
                        ? "border-sky-400 bg-sky-50 text-sky-900"
                        : saved
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
                جميع الأسئلة <span className="text-slate-400">({questionIndex + 1} من {currentPassage.questions.length})</span>
              </div>

              <div className="flex flex-wrap items-center gap-6 text-lg text-sky-500">
                <button
                  type="button"
                  onClick={() => setShowExplanationPanel((previous) => !previous)}
                  className={cn("flex items-center gap-2 font-medium hover:text-sky-700", showExplanationPanel && "text-sky-700")}
                >
                  <BookOpen className="h-5 w-5" />
                  عرض الشرح
                </button>
                <button
                  type="button"
                  onClick={() => setReportSent(true)}
                  className={cn("flex items-center gap-2 font-medium hover:text-sky-700", reportSent && "text-amber-700")}
                >
                  <Flag className="h-5 w-5" />
                  تبليغ عن خطأ
                </button>
                <button
                  type="button"
                  onClick={toggleSave}
                  className={cn("flex items-center gap-2 font-medium hover:text-sky-700", isQuestionSaved && "text-emerald-700")}
                >
                  {isQuestionSaved ? <BookmarkCheck className="h-5 w-5" /> : <Bookmark className="h-5 w-5" />}
                  {isQuestionSaved ? "محفوظ" : "حفظ"}
                </button>
                <button type="button" onClick={cycleFontScale} className="flex items-center gap-2 font-medium hover:text-sky-700">
                  <Type className="h-5 w-5" />
                  الحجم
                </button>
              </div>
            </div>

            <div className="p-6 md:p-8">
              {reportSent ? (
                <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-900">
                  تم استلام البلاغ لهذا السؤال وسيراجَع ضمن قائمة التحرير.
                </div>
              ) : null}

              {showExplanationPanel ? (
                <div className="mb-4 rounded-2xl border border-sky-100 bg-sky-50 px-5 py-4 text-sm leading-8 text-sky-900">
                  {currentQuestion.explanation || "سيظهر الشرح المختصر بعد تأكيد الإجابة، أو بعد توفره في بيانات المستند."}
                </div>
              ) : null}

              <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-6">
                <div className="relative">
                  <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.05]">
                    <div className="text-[10rem] font-black text-sky-700">معيار</div>
                  </div>
                  <h3 className={cn("relative font-bold text-slate-800", fontTokens.question)}>{currentQuestion.text}</h3>
                </div>

                <div className="mt-8 grid gap-4 md:grid-cols-2">
                  {currentQuestion.choices.map((choice, index) => {
                    const isSelected = selectedAnswer === choice.text;
                    const isCorrect = submitted && choice.text === correctAnswer;
                    const isWrongSelected = submitted && isSelected && choice.text !== correctAnswer;

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
                        key={choice.id}
                        type="button"
                        onClick={() => {
                          setSelectedAnswer(choice.text);
                          setSubmitted(false);
                        }}
                        className={`rounded-2xl border px-5 py-5 text-right transition ${classes} ${fontTokens.option}`}
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
                  <button
                    onClick={confirmAnswer}
                    disabled={!selectedAnswer}
                    className="rounded-2xl bg-sky-600 px-8 py-4 text-xl font-bold text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    تأكيد الإجابة
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
                      <span className="font-bold">الإجابة الصحيحة:</span> {result.correctAnswer || "غير متاحة"}
                    </div>
                    <div className="mt-2">
                      <span className="font-bold">الشرح المختصر:</span>{" "}
                      {result.explanation || "الشرح غير متاح في بيانات هذه القطعة بعد."}
                    </div>
                    {result.needsReview ? (
                      <div className="mt-3 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                        <AlertTriangle className="mt-1 h-4 w-4 shrink-0" />
                        <span>هذا السؤال ما زال تحت المراجعة التحريرية، لكن الإجابة المعروضة مأخوذة من بيانات المستند الحالية.</span>
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
                  <div className="flex max-h-48 flex-wrap gap-2 overflow-y-auto">
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
