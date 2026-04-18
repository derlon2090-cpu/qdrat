"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { useAuthSession } from "@/hooks/use-auth-session";
import { trackMistakeFromClient } from "@/lib/client-mistakes";
import type { VerbalPassageRecord } from "@/lib/verbal-passages";

type ViewerMode = "student" | "admin";

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
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, "A" | "B" | "C" | "D" | undefined>>({});
  const [submittedAnswers, setSubmittedAnswers] = useState<Record<string, boolean>>({});
  const [authPromptQuestionId, setAuthPromptQuestionId] = useState<string | null>(null);
  const { status: authStatus } = useAuthSession();

  const questionMap = useMemo(
    () =>
      Object.fromEntries(
        passage.questions.map((question) => [
          question.id,
          {
            options: getQuestionOptions(question),
          },
        ]),
      ),
    [passage.questions],
  );

  useEffect(() => {
    setSelectedAnswers({});
    setSubmittedAnswers({});
    setAuthPromptQuestionId(null);
  }, [passage.id]);

  const submittedCount = useMemo(
    () => passage.questions.filter((question) => submittedAnswers[question.id]).length,
    [passage.questions, submittedAnswers],
  );

  const isPassageCompleted = mode === "student" && passage.questions.length > 0 && submittedCount === passage.questions.length;

  async function confirmQuestionAnswer(question: VerbalPassageRecord["questions"][number]) {
    const selected = selectedAnswers[question.id];
    if (!selected) return;

    setSubmittedAnswers((previous) => ({
      ...previous,
      [question.id]: true,
    }));

    const result = await trackMistakeFromClient({
      questionKey: `${passage.slug}:${question.id}`,
      section: "verbal",
      sourceBank: "بنك القطع اللفظي",
      questionTypeLabel: "لفظي",
      questionText: question.questionText,
      questionHref: `/verbal/reading?passage=${encodeURIComponent(passage.slug)}`,
      metadata: {
        passageTitle: passage.title,
        questionOrder: question.questionOrder,
      },
      outcome: selected === question.correctOption ? "correct" : "incorrect",
    });

    if (result.unauthorized && selected !== question.correctOption) {
      setAuthPromptQuestionId(question.id);
      return;
    }

    if (selected === question.correctOption || authStatus === "authenticated") {
      setAuthPromptQuestionId((current) => (current === question.id ? null : current));
    }
  }

  return (
    <div className="space-y-6" dir="rtl">
      <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm text-slate-500">القطع اللفظي / {mode === "admin" ? "وضع الإدارة" : "وضع الطالب"}</div>
            <h1 className="display-font mt-3 text-3xl font-bold text-slate-950">{passage.title}</h1>
            <div className="mt-2 text-xs font-semibold text-[#123B7A]">/{passage.slug}</div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-full bg-[#123B7A]/8 px-3 py-1 font-semibold text-[#123B7A]">
              {passage.questions.length} أسئلة
            </span>
            <span
              className={`rounded-full px-3 py-1 font-semibold ${
                passage.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
              }`}
            >
              {passage.status === "published" ? "منشورة" : "مسودة"}
            </span>
            <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
              النسخة {passage.version}
            </span>
          </div>
        </div>

        <div className="mt-5 whitespace-pre-wrap text-lg leading-9 text-slate-800">{passage.passageText}</div>
      </div>

      <div className="space-y-4">
        {passage.questions.map((question, questionIndex) => {
          const selected = selectedAnswers[question.id];
          const submitted = submittedAnswers[question.id];
          const isCorrect = submitted && selected === question.correctOption;

          return (
            <div key={question.id} className="rounded-[1.8rem] border border-slate-200 bg-white p-6 shadow-sm">
              <div className="display-font text-xl font-bold text-slate-950">
                السؤال {questionIndex + 1}
              </div>
              <div className="mt-3 text-lg leading-8 text-slate-900">{question.questionText}</div>

              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {questionMap[question.id]?.options.map((option) => {
                  const isSelected = selected === option.key;
                  const isAdminCorrect = mode === "admin" && option.key === question.correctOption;
                  const isStudentCorrect = submitted && option.key === question.correctOption;
                  const isStudentWrongSelected = submitted && isSelected && option.key !== question.correctOption;

                  let classes = "border-slate-200 bg-white text-slate-800 hover:border-[#123B7A]/30 hover:bg-slate-50";

                  if (isAdminCorrect || isStudentCorrect) {
                    classes = "border-emerald-300 bg-emerald-50 text-emerald-900";
                  } else if (isStudentWrongSelected) {
                    classes = "border-rose-300 bg-rose-50 text-rose-900";
                  } else if (isSelected) {
                    classes = "border-[#123B7A]/30 bg-[#123B7A]/5 text-[#123B7A]";
                  }

                  return (
                    <button
                      key={`${question.id}-${option.key}`}
                      type="button"
                      disabled={mode === "admin"}
                      onClick={() => {
                        setSelectedAnswers((previous) => ({
                          ...previous,
                          [question.id]: option.key,
                        }));
                        setSubmittedAnswers((previous) => ({
                          ...previous,
                          [question.id]: false,
                        }));
                        setAuthPromptQuestionId((current) => (current === question.id ? null : current));
                      }}
                      className={`rounded-[1.25rem] border px-4 py-4 text-right transition ${classes} ${
                        mode === "admin" ? "cursor-default" : ""
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="text-base leading-7">{option.text}</div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
                          {option.label}
                        </span>
                      </div>
                      {mode === "admin" && option.key === question.correctOption ? (
                        <div className="mt-3 text-sm font-semibold text-emerald-700">الإجابة الصحيحة</div>
                      ) : null}
                    </button>
                  );
                })}
              </div>

              {mode === "student" ? (
                <div className="mt-5">
                  <button
                    type="button"
                    onClick={() => void confirmQuestionAnswer(question)}
                    disabled={!selected}
                    className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    تأكيد الإجابة
                  </button>
                </div>
              ) : null}

              {mode === "student" && submitted ? (
                <div
                  className={`mt-5 rounded-[1.25rem] border px-4 py-4 text-sm leading-8 ${
                    isCorrect ? "border-emerald-200 bg-emerald-50 text-emerald-900" : "border-rose-200 bg-rose-50 text-rose-900"
                  }`}
                >
                  <div className="font-bold">{isCorrect ? "✅ إجابة صحيحة" : "❌ إجابة خاطئة"}</div>
                  {selected ? (
                    <div className="mt-2">
                      <span className="font-semibold">اختيارك:</span>{" "}
                      {selected === "A" ? question.optionA : selected === "B" ? question.optionB : selected === "C" ? question.optionC : question.optionD}
                    </div>
                  ) : null}
                  {question.explanation ? (
                    <div className="mt-2">
                      <span className="font-semibold">الشرح المختصر:</span> {question.explanation}
                    </div>
                  ) : null}
                  {!isCorrect ? (
                    <div className="mt-2">
                      <span className="font-semibold">الإجابة الصحيحة:</span>{" "}
                      {question.correctOption === "A"
                        ? question.optionA
                        : question.correctOption === "B"
                          ? question.optionB
                          : question.correctOption === "C"
                            ? question.optionC
                            : question.optionD}
                    </div>
                  ) : null}
                </div>
              ) : null}

              {mode === "student" && authPromptQuestionId === question.id ? (
                <div className="mt-4 rounded-[1.25rem] border border-amber-200 bg-amber-50 px-4 py-4 text-sm leading-8 text-amber-800">
                  سجّل دخولك حتى يتم حفظ هذا السؤال داخل قائمة الأخطاء الخاصة بحسابك.
                  <div className="mt-3 flex flex-wrap gap-3">
                    <Link href="/login?next=/question-bank?track=mistakes" className="font-semibold text-[#123B7A]">
                      تسجيل الدخول
                    </Link>
                    <Link href="/register?next=/question-bank?track=mistakes" className="font-semibold text-[#123B7A]">
                      إنشاء حساب
                    </Link>
                  </div>
                </div>
              ) : null}

              {mode === "admin" && question.explanation ? (
                <div className="mt-5 rounded-[1.25rem] border border-slate-200 bg-slate-50 px-4 py-4 text-sm leading-8 text-slate-700">
                  <span className="font-semibold text-slate-900">الشرح:</span> {question.explanation}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {isPassageCompleted ? (
        <div className="rounded-[1.8rem] border border-[#E8D8B3] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,247,244,0.96))] p-6 shadow-sm">
          <div className="display-font text-2xl font-bold text-slate-950">أنهيت أسئلة هذه القطعة</div>
          <p className="mt-3 text-sm leading-8 text-slate-600">
            يمكنك الآن الانتقال مباشرة إلى القطعة التالية أو الرجوع إلى نتائج البحث لاختيار قطعة أخرى بعنوانها.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            {onOpenNextPassage ? (
              <button
                type="button"
                onClick={onOpenNextPassage}
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
              >
                {nextPassageTitle ? `انتقل إلى ${nextPassageTitle}` : "الانتقال إلى القطعة التالية"}
              </button>
            ) : null}

            {onBackToResults ? (
              <button
                type="button"
                onClick={onBackToResults}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
              >
                اختر قطعة أخرى
              </button>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
