"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpenText,
  Brain,
  Calculator,
  CheckCircle2,
  FileQuestion,
  Scale,
  Search,
  Sigma,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type TrackId = "verbal" | "quant";
type ChoiceKey = "A" | "B" | "C" | "D";
type ExamSectionKey =
  | "verbal_reading"
  | "verbal_analogy"
  | "verbal_completion"
  | "verbal_context"
  | "verbal_odd"
  | "quant_algebra"
  | "quant_ratios"
  | "quant_geometry";

const journeySteps = [
  {
    id: 1,
    title: "اختيار القسم الرئيسي",
    text: "ابدأ من كمي أو لفظي بدل التنقل بين بنوك كثيرة من أول لحظة.",
  },
  {
    id: 2,
    title: "اختيار الباب الداخلي",
    text: "كل قسم له أبواب واضحة ومهارات مرتبة حتى تعرف أين تبدأ بالضبط.",
  },
  {
    id: 3,
    title: "بدء التدريب المباشر",
    text: "القانون أو المهارة أولًا، ثم تدريب منظم مع Feedback فوري بعد الإجابة.",
  },
];

const verbalSections = [
  {
    id: "reading",
    examSection: "verbal_reading" as ExamSectionKey,
    title: "القطع اللفظية",
    description: "ابدأ من استيعاب المقروء بأسئلة الفكرة العامة، الاستنتاج، وتحليل العلاقات داخل النص.",
    metrics: ["741 قطعة", "استيعاب + استنتاج", "تدريب تدريجي"],
    drills: ["الفكرة العامة", "الاستنتاج", "تحليل العلاقات"],
  },
  {
    id: "analogies",
    examSection: "verbal_analogy" as ExamSectionKey,
    title: "التناظر اللفظي",
    description: "تدريب على العلاقات اللفظية بشكل منظم: ترادف، تضاد، جزء وكل، وسبب ونتيجة.",
    metrics: ["1,840 سؤال", "العلاقات اللفظية", "سرعة + دقة"],
    drills: ["ترادف", "تضاد", "سبب ونتيجة"],
  },
  {
    id: "completion",
    examSection: "verbal_completion" as ExamSectionKey,
    title: "إكمال الجمل",
    description: "يركز على فهم السياق وربط المعنى المناسب داخل الجملة دون تشتيت.",
    metrics: ["1,260 سؤال", "فهم السياق", "تدرج ذكي"],
    drills: ["سياق مباشر", "استنتاج المعنى", "إكمال مزدوج"],
  },
  {
    id: "contextual-error",
    examSection: "verbal_context" as ExamSectionKey,
    title: "الخطأ السياقي",
    description: "اعرف الكلمة أو العبارة التي تخل بتوازن الجملة أو المعنى المقصود.",
    metrics: ["780 سؤال", "تحليل المعنى", "مراجعة مركزة"],
    drills: ["الكلمة الشاذة", "تعارض المعنى", "توازن السياق"],
  },
  {
    id: "odd-word",
    examSection: "verbal_odd" as ExamSectionKey,
    title: "المفردة الشاذة",
    description: "تصنيف المجموعات واكتشاف العنصر المختلف بسرعة وبصيرة أوضح.",
    metrics: ["1,110 سؤال", "تصنيف دقيق", "إحماء سريع"],
    drills: ["المجموعة الأنسب", "العنصر المختلف", "الترابط الدلالي"],
  },
];

const quantSections = [
  {
    id: "algebra",
    examSection: "quant_algebra" as ExamSectionKey,
    title: "الجبر",
    icon: Sigma,
    law: "باب الجبر يبدأ من تبسيط التعابير والمعادلات الأساسية ثم ينتقل إلى مسائل المتغيرات خطوة بخطوة.",
    formulas: ["3x + 5 = 20 → x = 5", "إذا a/b = c/d فإن ad = bc", "المعادلة التربيعية تبنى من التحليل أولًا"],
    drills: ["معادلات من خطوة واحدة", "تبسيط التعابير", "مسائل المتغيرات"],
  },
  {
    id: "ratios",
    examSection: "quant_ratios" as ExamSectionKey,
    title: "النسب والتناسب",
    icon: Scale,
    law: "هذا الباب يعتمد على قراءة العلاقة بين القيم بسرعة، ثم تحويلها إلى نسبة أو تناسب مباشر.",
    formulas: ["النسبة = الجزء ÷ الكل", "التناسب: a/b = c/d", "النسبة المئوية = القيمة ÷ الكل × 100"],
    drills: ["نسبة مباشرة", "تناسب طردي", "نسبة مئوية"],
  },
  {
    id: "geometry",
    examSection: "quant_geometry" as ExamSectionKey,
    title: "الهندسة",
    icon: Calculator,
    law: "المطلوب هنا حفظ القوانين الأساسية فقط ثم تطبيقها مباشرة على الأشكال المعتادة في القدرات.",
    formulas: ["مساحة المستطيل = الطول × العرض", "محيط المربع = 4 × الضلع", "مجموع زوايا المثلث = 180°"],
    drills: ["المحيط والمساحة", "الزوايا", "أشكال مركبة"],
  },
];

const sampleQuestions = {
  verbal: {
    title: "التناظر اللفظي",
    question: "ما العلاقة الأقرب بين: قمة : ذروة ؟",
    explanation: "الإجابة الصحيحة: (ب) لأن العلاقة هنا ترادف مباشر بين كلمتين تحملان المعنى نفسه.",
    correct: "B" as ChoiceKey,
    choices: [
      { key: "A" as ChoiceKey, text: "سرعة : تباطؤ" },
      { key: "B" as ChoiceKey, text: "قمة : ذروة" },
      { key: "C" as ChoiceKey, text: "ليل : صباح" },
      { key: "D" as ChoiceKey, text: "بحر : سفينة" },
    ],
  },
  quant: {
    title: "النسب والتناسب",
    question: "إذا كانت النسبة بين 4 و10 تساوي النسبة بين 6 و ن، فما قيمة ن؟",
    explanation: "الإجابة الصحيحة: (ج) لأن 4/10 = 6/ن، ومنه 4ن = 60 ثم ن = 15.",
    correct: "C" as ChoiceKey,
    choices: [
      { key: "A" as ChoiceKey, text: "10" },
      { key: "B" as ChoiceKey, text: "12" },
      { key: "C" as ChoiceKey, text: "15" },
      { key: "D" as ChoiceKey, text: "18" },
    ],
  },
};

const trackMeta = {
  verbal: {
    label: "القسم اللفظي",
    title: "أبواب لفظي مرتبة وواضحة",
    description: "ابدأ من القطع أو التناظر أو إكمال الجمل، وكل باب له مهاراته وتمارينه بدون خلط مع الكمي.",
    accent: "from-[#123B7A] to-[#274f93]",
    stats: ["قطع + تناظر + سياق", "أبواب مرتبة", "تدرج في الصعوبة"],
  },
  quant: {
    label: "القسم الكمي",
    title: "القوانين ثم التطبيق المباشر",
    description: "كل باب يعرض لك الفكرة والقوانين الأساسية أولًا، وبعدها تنتقل مباشرة إلى التدريبات المرتبطة.",
    accent: "from-[#d9a441] to-[#c99200]",
    stats: ["قوانين أساسية", "تطبيق فوري", "أبواب واضحة"],
  },
};

function examHref(section: ExamSectionKey) {
  return `/exam?section=${section}`;
}

function toArabicChoice(key: ChoiceKey) {
  switch (key) {
    case "A":
      return "أ";
    case "B":
      return "ب";
    case "C":
      return "ج";
    case "D":
      return "د";
  }
}

export function QuestionBankOrganizer() {
  const [track, setTrack] = useState<TrackId>("verbal");
  const [selectedChoice, setSelectedChoice] = useState<ChoiceKey | null>(null);

  const sample = sampleQuestions[track];
  const feedback = useMemo(() => {
    if (!selectedChoice) return null;
    const correct = selectedChoice === sample.correct;
    return {
      correct,
      message: correct
        ? "إجابة صحيحة. هذا هو الشكل الذي يجب أن يراه الطالب مباشرة بعد الاختيار."
        : "إجابة خاطئة. يظهر الخيار الصحيح مع شرح مختصر ومباشر بلا إطالة.",
    };
  }, [sample, selectedChoice]);

  return (
    <div className="space-y-8">
      <Card className="rounded-[2.2rem] border border-[#E8D8B3] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,247,244,0.96))] shadow-soft">
        <CardContent className="space-y-8 p-6 md:p-8">
          <div className="grid gap-6 xl:grid-cols-[1.1fr,0.9fr]">
            <div className="space-y-4">
              <Badge className="border-transparent bg-[#123B7A] text-white">ابدأ من هنا</Badge>
              <h2 className="display-font section-title max-w-none text-right text-slate-950">
                اختر أولًا بين الكمي واللفظي، ثم ادخل في باب مرتب وواضح
              </h2>
              <p className="section-copy mb-0 max-w-2xl text-slate-600">
                الصفحة لم تعد تبدأ ببحث مختلط وفلاتر كثيرة. الآن المسار أوضح: قسم رئيسي، ثم باب داخلي، ثم تدريب مباشر
                مع Feedback سريع بعد الإجابة.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
              {journeySteps.map((step) => (
                <div
                  key={step.id}
                  className="rounded-[1.5rem] border border-slate-200/80 bg-white/85 p-4 text-right shadow-sm"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="display-font text-lg font-bold text-[#123B7A]">0{step.id}</div>
                    <Target className="h-5 w-5 text-[#C99A43]" />
                  </div>
                  <div className="mt-3 text-base font-semibold text-slate-950">{step.title}</div>
                  <div className="mt-2 text-sm leading-7 text-slate-500">{step.text}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {([
              {
                id: "verbal",
                title: "اللفظي",
                subtitle: "قطع، تناظر، إكمال الجمل، الخطأ السياقي، والمفردة الشاذة.",
                icon: BookOpenText,
              },
              {
                id: "quant",
                title: "الكمي",
                subtitle: "الجبر، النسب، الهندسة، ثم التدريب المباشر بعد القانون.",
                icon: Calculator,
              },
            ] as const).map((item) => {
              const Icon = item.icon;
              const active = track === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setTrack(item.id);
                    setSelectedChoice(null);
                  }}
                  className={cn(
                    "rounded-[1.9rem] border p-6 text-right transition-all",
                    active
                      ? "border-transparent bg-[linear-gradient(135deg,#102955,#123B7A_55%,#2f5fa7)] text-white shadow-[0_24px_50px_rgba(18,59,122,0.22)]"
                      : "border-slate-200/80 bg-white/88 text-slate-900 shadow-sm hover:-translate-y-0.5 hover:shadow-md",
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="display-font text-2xl font-bold">{item.title}</div>
                      <div className={cn("mt-3 text-sm leading-7", active ? "text-white/80" : "text-slate-500")}>
                        {item.subtitle}
                      </div>
                    </div>
                    <div
                      className={cn(
                        "flex h-14 w-14 items-center justify-center rounded-[1.3rem]",
                        active ? "bg-white/10" : "bg-[#fff7ed]",
                      )}
                    >
                      <Icon className={cn("h-7 w-7", active ? "text-white" : "text-[#C99A43]")} />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-8 xl:grid-cols-[1.15fr,0.85fr]">
        <div className="space-y-6">
          <Card className="overflow-hidden rounded-[2.2rem] border-0">
            <CardContent className="p-0">
              <div className={cn("bg-gradient-to-l p-8 text-white", trackMeta[track].accent)}>
                <Badge className="border-white/20 bg-white/10 text-white">{trackMeta[track].label}</Badge>
                <h3 className="display-font mt-4 text-3xl font-bold">{trackMeta[track].title}</h3>
                <p className="mt-3 max-w-2xl text-sm leading-8 text-white/85">{trackMeta[track].description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {trackMeta[track].stats.map((stat) => (
                    <span key={stat} className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold">
                      {stat}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {track === "verbal" ? (
            <section className="grid gap-4 md:grid-cols-2">
              {verbalSections.map((section) => (
                <article key={section.id} className="rounded-[1.9rem] border border-slate-200/80 bg-white/92 p-6 shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="display-font text-xl font-bold text-slate-950">{section.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{section.description}</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-[1.1rem] bg-[#fff7ed]">
                      <Brain className="h-6 w-6 text-[#C99A43]" />
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {section.metrics.map((metric) => (
                      <span key={metric} className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700">
                        {metric}
                      </span>
                    ))}
                  </div>

                  <div className="mt-5">
                    <div className="mb-3 text-sm font-semibold text-slate-900">ابدأ من هذه المهارات</div>
                    <div className="space-y-2">
                      {section.drills.map((drill) => (
                        <div key={drill} className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200">
                          {drill}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <Link
                      href={examHref(section.examSection)}
                      className={cn(buttonVariants({ variant: "default" }), "h-11 px-5 text-sm")}
                    >
                      ابدأ التدريب
                    </Link>
                    <button
                      type="button"
                      onClick={() => window.dispatchEvent(new CustomEvent("miyaar:open-search"))}
                      className="text-sm font-semibold text-[#123B7A]"
                    >
                      ابحث داخل الباب
                    </button>
                  </div>
                </article>
              ))}
            </section>
          ) : (
            <section className="space-y-5">
              {quantSections.map((section) => {
                const Icon = section.icon;
                return (
                  <article key={section.id} className="rounded-[2rem] bg-white p-6 shadow-sm ring-1 ring-slate-200">
                    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
                      <div>
                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-[#fff7ed]">
                            <Icon className="h-6 w-6 text-[#C99A43]" />
                          </div>
                          <h3 className="display-font text-xl font-bold text-slate-950">{section.title}</h3>
                        </div>
                        <p className="mt-4 text-sm leading-8 text-slate-600">{section.law}</p>
                        <div className="mt-5">
                          <div className="mb-3 text-sm font-semibold text-slate-900">القوانين الأساسية</div>
                          <div className="space-y-2">
                            {section.formulas.map((formula) => (
                              <div
                                key={formula}
                                className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-700 ring-1 ring-slate-200"
                              >
                                {formula}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-[1.8rem] bg-slate-50 p-5 ring-1 ring-slate-200">
                        <div className="text-sm font-semibold text-slate-900">التدريبات المرتبطة</div>
                        <div className="mt-4 space-y-3">
                          {section.drills.map((drill) => (
                            <div
                              key={drill}
                              className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-200"
                            >
                              <span className="text-sm font-medium text-slate-700">{drill}</span>
                              <Link
                                href={examHref(section.examSection)}
                                className={cn(buttonVariants({ variant: "default", size: "sm" }), "h-10 rounded-xl px-4")}
                              >
                                ابدأ
                              </Link>
                            </div>
                          ))}
                        </div>

                        <Link
                          href={examHref(section.examSection)}
                          className={cn(buttonVariants({ variant: "outline" }), "mt-5 flex w-full justify-center")}
                        >
                          عرض جميع تدريبات {section.title}
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </div>

        <div className="space-y-5">
          <Card className="surface-dark rounded-[2rem] border-0">
            <CardContent className="p-8">
              <p className="text-sm text-white/70">معاينة التفاعل داخل التدريب</p>
              <h3 className="display-font mt-3 text-2xl font-bold">{sample.title}</h3>
              <p className="mt-4 text-sm leading-8 text-white/80">{sample.question}</p>

              <div className="mt-5 grid gap-3">
                {sample.choices.map((choice) => {
                  const active = selectedChoice === choice.key;
                  return (
                    <button
                      key={choice.key}
                      type="button"
                      onClick={() => setSelectedChoice(choice.key)}
                      className={cn(
                        "flex items-center gap-3 rounded-[1.2rem] border px-4 py-3 text-right transition-all",
                        active
                          ? "border-white/20 bg-white/12 text-white"
                          : "border-white/10 bg-white/5 text-white/80 hover:bg-white/10",
                      )}
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 font-bold text-[#F5D08A]">
                        {toArabicChoice(choice.key)}
                      </span>
                      <span className="text-sm leading-7">{choice.text}</span>
                    </button>
                  );
                })}
              </div>

              {feedback ? (
                <div
                  className={cn(
                    "mt-5 rounded-[1.4rem] border p-4 text-sm leading-8",
                    feedback.correct
                      ? "border-emerald-300 bg-emerald-500/10 text-emerald-50"
                      : "border-amber-300 bg-amber-500/10 text-amber-50",
                  )}
                >
                  <div className="mb-2 flex items-center gap-2 font-semibold">
                    {feedback.correct ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                    {feedback.message}
                  </div>
                  <div>{sample.explanation}</div>
                </div>
              ) : (
                <div className="mt-5 rounded-[1.4rem] border border-white/10 bg-white/5 p-4 text-sm leading-8 text-white/70">
                  اختر أي إجابة لترى كيف يظهر التصحيح الفوري والشرح المختصر للطالب.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border border-[#E8D8B3] bg-white/92 shadow-soft">
            <CardContent className="p-8">
              <Badge>البحث السريع</Badge>
              <h3 className="display-font mt-4 text-2xl font-bold text-slate-950">تحتاج سؤالًا محددًا؟</h3>
              <p className="mt-3 text-sm leading-8 text-slate-600">
                البحث لم يعد واجهة الصفحة كلها، لكنه ما زال موجودًا كميزة قوية إذا كنت تبحث عن كلمة داخل سؤال أو عنوان قطعة.
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => window.dispatchEvent(new CustomEvent("miyaar:open-search"))}
                  className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
                >
                  <Search className="h-4 w-4" />
                  افتح البحث
                </button>
                <Link href="/diagnostic" className={cn(buttonVariants({ variant: "secondary" }), "gap-2")}>
                  <FileQuestion className="h-4 w-4" />
                  ابدأ التشخيص
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border border-slate-200/80 bg-white/92 shadow-soft">
            <CardContent className="p-8">
              <Badge className="bg-emerald-50 text-emerald-700">لقطة سريعة</Badge>
              <h3 className="display-font mt-4 text-2xl font-bold text-slate-950">المسار الذي سيراه الطالب</h3>
              <div className="mt-5 space-y-3">
                {[
                  "1. يختار كمي أو لفظي.",
                  "2. يدخل إلى باب مرتب وواضح بدل قائمة مختلطة.",
                  "3. يبدأ التدريب ويأخذ Feedback مباشر بعد كل اختيار.",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-[1.2rem] bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                    <Sparkles className="mt-1 h-4 w-4 text-[#C99A43]" />
                    <div className="text-sm leading-7 text-slate-700">{item}</div>
                  </div>
                ))}
              </div>

              <Link
                href={examHref(track === "verbal" ? "verbal_reading" : "quant_algebra")}
                className={cn(buttonVariants({ variant: "default" }), "mt-5 flex gap-2")}
              >
                ابدأ أول تدريب
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
