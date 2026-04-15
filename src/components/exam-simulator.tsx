"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const questions = Array.from({ length: 15 }, (_, index) => index + 1);

const choices = [
  {
    id: "a",
    label: "أ",
    title: "التخطيط : النجاح",
    text: "خيار نموذجي يوضح أسلوب تحديد الإجابة داخل الاختبار المحاكي.",
  },
  {
    id: "b",
    label: "ب",
    title: "السرعة : الخطأ",
    text: "بديل أقل دقة في العلاقة المعنوية المقصودة داخل السؤال.",
  },
  {
    id: "c",
    label: "ج",
    title: "الحفظ : النسيان",
    text: "علاقة غير موازية للتركيب الأصلي من ناحية المنطق.",
  },
  {
    id: "d",
    label: "د",
    title: "الوقت : التأخير",
    text: "لا تعكس العلاقة السببية المقصودة بين طرفي السؤال.",
  },
];

export function ExamSimulator() {
  const [currentQuestion, setCurrentQuestion] = useState(12);
  const [selectedChoice, setSelectedChoice] = useState("a");

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
      <div className="space-y-6">
        <div className="surface-dark p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-white/70">محاكاة معيار</p>
              <h2 className="display-font text-2xl font-bold">اختبار لفظي تجريبي</h2>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2">
                السؤال {currentQuestion} من 40
              </span>
              <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2">
                الوقت المتبقي 34:18
              </span>
            </div>
          </div>
          <Progress value={30} className="mt-5 bg-white/10" indicatorClassName="bg-[linear-gradient(90deg,#ffffff,#f5d58b)]" />
        </div>

        <div className="surface-card p-6 md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">نوع السؤال</p>
              <h3 className="display-font text-2xl font-bold text-slate-950">تناظر لفظي</h3>
            </div>
            <span className="mini-pill bg-violet-50 text-violet-700">مستوى: متوسط</span>
          </div>

          <div className="mt-6 text-lg leading-9 text-slate-900">
            العلاقة بين <strong>التركيز</strong> و<strong>الإنجاز</strong> تشبه العلاقة بين:
          </div>

          <div className="mt-6 grid gap-3">
            {choices.map((choice) => (
              <button
                key={choice.id}
                type="button"
                onClick={() => setSelectedChoice(choice.id)}
                className={`flex items-start gap-3 rounded-[1.5rem] border p-4 text-right transition ${
                  selectedChoice === choice.id
                    ? "border-violet-300 bg-violet-50/80 shadow-soft"
                    : "border-slate-200 bg-white/80"
                }`}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-100 font-bold text-violet-700">
                  {choice.label}
                </span>
                <div>
                  <div className="display-font text-base font-bold text-slate-950">{choice.title}</div>
                  <p className="mt-1 text-sm leading-7 text-slate-600">{choice.text}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <Button variant="outline">السؤال السابق</Button>
            <Button>التالي وعرض النتيجة</Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="surface-card p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm text-slate-500">تنقل سريع</p>
              <h3 className="display-font text-xl font-bold text-slate-950">لوحة الأسئلة</h3>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-5 gap-3">
            {questions.map((question) => {
              const state =
                question === currentQuestion ? "current" : question < currentQuestion ? "done" : "idle";

              return (
                <button
                  key={question}
                  type="button"
                  onClick={() => setCurrentQuestion(question)}
                  className={`aspect-square rounded-2xl border text-sm font-bold transition ${
                    state === "current"
                      ? "border-transparent bg-[linear-gradient(135deg,#16213f,#25345f)] text-white"
                      : state === "done"
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white text-slate-700"
                  }`}
                >
                  {question}
                </button>
              );
            })}
          </div>
        </div>

        <div className="surface-card p-6">
          <p className="text-sm font-semibold text-slate-500">إرشاد سريع</p>
          <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-600">
            <li>الأسئلة المجاب عنها تظهر بحالة مختلفة بصريًا.</li>
            <li>الانتقال بين الأسئلة سريع ومريح على الجوال والديسكتوب.</li>
            <li>يمكن حفظ سؤال للمراجعة قبل التسليم النهائي.</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
