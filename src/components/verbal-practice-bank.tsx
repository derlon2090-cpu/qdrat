"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { RotateCcw, Sparkles } from "lucide-react";

import { useAuthSession } from "@/hooks/use-auth-session";
import {
  trackQuestionProgressFromClient,
  type ClientQuestionProgressResult,
} from "@/lib/client-question-progress";
import { trackMistakeFromClient } from "@/lib/client-mistakes";
import type { VerbalPracticeQuestion, VerbalQuestionCategoryId } from "@/data/verbal-mixed-bank";
import { Button } from "@/components/ui/button";

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

function buildPracticeHref(pathname: string, currentParams: URLSearchParams, categoryId: string, questionId: string) {
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

  useEffect(() => {
    setSavedAnswers(readSavedAnswers());
  }, []);

  const currentQuestionIndex = questions.findIndex((question) => question.id === activeQuestionId);

  const currentQuestion = questions[currentQuestionIndex] ?? null;

  const currentKey = currentQuestion ? `${currentCategory.id}-${currentQuestion.id}` : "";
  const questionHref = currentQuestion
    ? `/verbal/practice?category=${encodeURIComponent(currentCategory.id)}&question=${encodeURIComponent(currentQuestion.id)}`
    : "/verbal/practice";

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
    if (!searchParams.get("question") || !searchParams.get("category")) {
      router.replace(buildPracticeHref(pathname, new URLSearchParams(searchParams.toString()), currentCategory.id, currentQuestion.id), {
        scroll: false,
      });
    }
  }, [currentCategory.id, currentQuestion, pathname, router, searchParams]);

  useEffect(() => {
    if (!currentQuestion || searchParams.get("reset") !== "1") return;

    const nextAnswers = clearCategorySavedAnswers(currentCategory.id);
    setSavedAnswers(nextAnswers);
    setSelectedAnswer("");
    setSubmitted(false);
    setShowAuthPrompt(false);
    setProgressFeedback(null);

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.delete("reset");
    nextParams.set("category", currentCategory.id);
    nextParams.set("question", questions[0]?.id ?? currentQuestion.id);

    router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
  }, [currentCategory.id, currentQuestion, pathname, questions, router, searchParams]);

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

  function getQuestionProgressClasses(status: QuestionProgressState, active: boolean) {
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

  function openQuestion(categoryId: string, questionId: string) {
    router.replace(buildPracticeHref(pathname, new URLSearchParams(searchParams.toString()), categoryId, questionId), {
      scroll: false,
    });
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

  function handleResetCategory() {
    const nextAnswers = clearCategorySavedAnswers(currentCategory.id);
    setSavedAnswers(nextAnswers);
    setSelectedAnswer("");
    setSubmitted(false);
    setShowAuthPrompt(false);
    setProgressFeedback(null);

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
      xpValue: 5,
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

  if (!currentQuestion) {
    return (
      <div className="rounded-[1.8rem] border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
        لا توجد أسئلة ظاهرة الآن داخل هذا القسم.
      </div>
    );
  }

  const previousQuestion = questions[currentQuestionIndex - 1] ?? null;
  const nextQuestion = questions[currentQuestionIndex + 1] ?? null;

  return (
    <div dir="rtl" className="space-y-6">
      <div className="rounded-[1.9rem] border border-[#E8D8B3] bg-white/95 p-6 shadow-soft">
        <div className="display-font text-2xl font-bold text-slate-950">اختر القسم اللفظي الذي تريد التدريب عليه</div>
        <p className="mt-2 max-w-3xl text-sm leading-8 text-slate-600">
          الأقسام الرسمية الظاهرة الآن هي فقط: إكمال الجمل، الاستيعاب المقروء، المفردة الشاذة، الخطأ السياقي،
          والتناظر اللفظي. أي سؤال من معنى كلمة أو دلالة أو نوع نص داخل فقرة تم ضمه تحت الاستيعاب المقروء بدل
          إظهاره كقسم مستقل.
        </p>

        <div className="mt-5 rounded-[1.6rem] border border-[#E8D8B3] bg-[#fffaf1] p-5">
          <div className="text-sm font-bold text-[#123B7A]">كيف تعرف نوع السؤال قبل الحل؟</div>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {[
              { label: "إكمال الجمل", hint: "أكمل / فراغ / يتم المعنى بـ" },
              {
                label: "الاستيعاب المقروء",
                hint: "يفهم من النص / نستنتج / عنوان مناسب / معنى كلمة داخل النص / ما تفيده عبارة",
              },
              { label: "المفردة الشاذة", hint: "الكلمة المختلفة / الشاذة / ما لا ينتمي" },
              { label: "الخطأ السياقي", hint: "الكلمة الخاطئة / غير المنسجمة / الخطأ في الجملة" },
              { label: "تناظر لفظي", hint: "كلمة : كلمة = كلمة : ؟" },
              { label: "ابدأ بالمطلوب", hint: "حدّد الكلمة المفتاحية في السؤال أولًا ثم اختر القسم المناسب" },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.2rem] border border-white bg-white px-4 py-3 shadow-sm">
                <div className="text-sm font-bold text-slate-900">{item.label}</div>
                <div className="mt-1 text-xs leading-6 text-slate-500">{item.hint}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {categories.map((category) => {
            const active = category.id === currentCategory.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() => openCategory(category.id)}
                className={`rounded-[1.5rem] border p-5 text-right transition ${
                  active
                    ? "border-transparent bg-[linear-gradient(135deg,#102955,#123B7A_55%,#2f5fa7)] text-white shadow-[0_18px_38px_rgba(18,59,122,0.22)]"
                    : "border-slate-200 bg-slate-50/80 text-slate-900 hover:border-[#C99A43] hover:bg-white"
                }`}
              >
                <div className="display-font text-xl font-bold">{category.title}</div>
                <div className={`mt-2 text-sm leading-7 ${active ? "text-white/80" : "text-slate-500"}`}>{category.description}</div>
                <div className={`mt-4 text-xs font-semibold ${active ? "text-white/75" : "text-[#123B7A]"}`}>
                  {category.count} سؤال
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <section className="rounded-[1.9rem] border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-5">
            <div>
              <div className="text-sm font-semibold text-[#123B7A]">
                {currentCategory.title} / سؤال {currentQuestionIndex + 1} من {questions.length}
              </div>
              <h2 className="display-font mt-3 text-3xl font-bold text-slate-950">{currentQuestion.prompt}</h2>
            </div>

            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500 ring-1 ring-slate-200">
              المصدر: {currentQuestion.source}
            </div>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === option;
              const isCorrect = submitted && option === currentQuestion.correctAnswer;
              const isWrongSelected = submitted && isSelected && option !== currentQuestion.correctAnswer;

              let classes = "border-slate-200 bg-white text-slate-800 hover:border-[#C99A43] hover:bg-[#fffaf1]";

              if (isCorrect) {
                classes = "border-emerald-300 bg-emerald-50 text-emerald-900";
              } else if (isWrongSelected) {
                classes = "border-rose-300 bg-rose-50 text-rose-900";
              } else if (isSelected) {
                classes = "border-[#123B7A] bg-[#eef4ff] text-[#123B7A]";
              }

              return (
                <button
                  key={`${currentQuestion.id}-${index + 1}`}
                  type="button"
                  onClick={() => {
                    setSelectedAnswer(option);
                    setSubmitted(false);
                    setShowAuthPrompt(false);
                  }}
                  className={`rounded-[1.4rem] border px-5 py-5 text-right transition ${classes}`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <span className="flex-1 text-lg leading-8">{option}</span>
                    <span className="text-sm font-bold">{getChoiceLetter(index)}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button size="lg" onClick={() => void confirmAnswer()} disabled={!selectedAnswer}>
              تأكيد الإجابة
            </Button>

            <Button variant="outline" size="lg" onClick={handleResetCategory} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              إعادة أسئلة هذا القسم
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => previousQuestion && openQuestion(currentCategory.id, previousQuestion.id)}
              disabled={!previousQuestion}
            >
              السؤال السابق
            </Button>

            <Button
              variant="outline"
              size="lg"
              onClick={() => nextQuestion && openQuestion(currentCategory.id, nextQuestion.id)}
              disabled={!nextQuestion}
            >
              السؤال التالي
            </Button>
          </div>

          {submitted && result ? (
            <div
              className={`mt-6 rounded-[1.4rem] border px-5 py-5 text-base leading-8 ${
                result.isCorrect ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-rose-200 bg-rose-50 text-rose-900"
              }`}
            >
              <div className="text-xl font-bold">{result.isCorrect ? "إجابة صحيحة" : "إجابة خاطئة"}</div>
              {!result.isCorrect ? (
                <div className="mt-3">
                  <span className="font-bold">الإجابة الصحيحة:</span> {result.correctAnswer}
                </div>
              ) : null}
              <div className="mt-3">
                <span className="font-bold">الشرح:</span> {result.explanation}
              </div>

              {progressFeedback ? (
                <div className="mt-4 rounded-[1.1rem] border border-white/60 bg-white/60 px-4 py-3 text-sm leading-7">
                  <div className="flex flex-wrap items-center gap-2 font-bold">
                    <Sparkles className="h-4 w-4" />
                    {progressFeedback.awardedXp > 0
                      ? `تمت إضافة ${progressFeedback.awardedXp} XP إلى ملفك.`
                      : progressFeedback.alreadySolved
                        ? "هذا السؤال محسوب سابقًا داخل إنجازاتك."
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
            <div className="mt-6 rounded-[1.4rem] border border-amber-200 bg-amber-50 px-5 py-5 text-sm leading-8 text-amber-800">
              {result?.isCorrect
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

          <div className="mt-8 grid gap-4 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,1fr)]">
            <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/70 p-5">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                <div className="text-lg font-bold text-slate-900">أسئلة القسم</div>
                <div className="text-xs font-semibold text-slate-500">
                  الأخضر صحيح، الأحمر خطأ
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {questions.map((question, index) => {
                  const status = getQuestionProgressState(question, index);
                  const active = index === currentQuestionIndex;

                  return (
                    <button
                      key={`jump-${question.id}`}
                      type="button"
                      onClick={() => openQuestion(currentCategory.id, question.id)}
                      className={`min-w-[108px] rounded-[999px] border px-5 py-4 text-base font-bold transition ${getQuestionProgressClasses(
                        status,
                        active,
                      )}`}
                    >
                      سؤال {index + 1}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/70 p-5">
              <div className="mb-3 text-lg font-bold text-slate-900">الانتقال إلى قسم لفظي آخر</div>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={`category-${category.id}`}
                    type="button"
                    onClick={() => openCategory(category.id)}
                    className={`rounded-xl px-4 py-3 text-sm font-bold ${
                      category.id === currentCategory.id ? "bg-[#123B7A] text-white" : "bg-white text-slate-700 ring-1 ring-slate-200"
                    }`}
                  >
                    {category.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
