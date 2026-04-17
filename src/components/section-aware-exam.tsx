"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type ExamSectionKey =
  | "verbal_reading"
  | "verbal_analogy"
  | "verbal_completion"
  | "verbal_context"
  | "verbal_odd"
  | "quant_algebra"
  | "quant_ratios"
  | "quant_geometry";

type ExamQuestion = {
  id: number;
  level: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanations: string[];
};

type ExamSection = {
  title: string;
  examTitle: string;
  formulas?: string[];
  questions: ExamQuestion[];
};

const examData: Record<ExamSectionKey, ExamSection> = {
  verbal_reading: {
    title: "القطع اللفظية",
    examTitle: "اختبار القطع اللفظية",
    questions: [
      {
        id: 1,
        level: "متوسط",
        prompt:
          "قرأ الطالب القطعة ثم استنتج أن الفكرة الرئيسة تدور حول أثر القراءة اليومية على تنمية المفردات. ما السؤال الذي يقيس الفكرة العامة؟",
        options: [
          "ما معنى كلمة وردت في السطر الأول؟",
          "ما الفكرة الرئيسة التي تدور حولها القطعة؟",
          "من قائل العبارة الأخيرة؟",
          "كم عدد أسطر القطعة؟",
        ],
        correctIndex: 1,
        explanations: [
          "هذا يقيس معنى مفردة وليس الفكرة العامة.",
          "صحيح، لأن سؤال الفكرة العامة يبحث عن المحور الأساسي للنص كله.",
          "هذا تفصيل جزئي وليس الهدف الرئيس من سؤال القطعة.",
          "هذا سؤال شكلي لا يقيس الفهم القرائي.",
        ],
      },
      {
        id: 2,
        level: "سهل",
        prompt: "إذا ذكرت القطعة أن التخطيط يقلل الأخطاء ويزيد جودة التنفيذ، فما الاستنتاج الأقرب؟",
        options: [
          "التخطيط يسبب الملل دائمًا",
          "التخطيط لا علاقة له بالإنجاز",
          "التخطيط يساعد على تحسين النتائج",
          "كل من يخطط ينجح فورًا",
        ],
        correctIndex: 2,
        explanations: [
          "هذا غير مدعوم من معنى القطعة.",
          "هذا يعاكس الفكرة المذكورة في النص.",
          "صحيح، لأنه استنتاج مباشر من تقليل الأخطاء ورفع جودة التنفيذ.",
          "هذا تعميم زائد، والقطعة لا تقول ذلك.",
        ],
      },
    ],
  },
  verbal_analogy: {
    title: "التناظر اللفظي",
    examTitle: "اختبار التناظر اللفظي",
    questions: [
      {
        id: 1,
        level: "متوسط",
        prompt: "ما العلاقة الأقرب بين: قمة : ذروة ؟",
        options: ["سرعة : تباطؤ", "قمة : ذروة", "ليل : صباح", "بحر : سفينة"],
        correctIndex: 1,
        explanations: [
          "هذه علاقة تضاد، وليست مثل العلاقة المطلوبة.",
          "صحيح، لأن العلاقة هنا ترادف مباشر بين الكلمتين.",
          "هذه أيضًا علاقة تضاد.",
          "هذه ليست علاقة مماثلة في المعنى.",
        ],
      },
      {
        id: 2,
        level: "سهل",
        prompt: "التركيز : الإنجاز :: التخطيط : ؟",
        options: ["النجاح", "التعب", "التأخير", "التردد"],
        correctIndex: 0,
        explanations: [
          "صحيح، لأن التخطيط يقود إلى النجاح كما أن التركيز يدعم الإنجاز.",
          "العلاقة غير متوازية معنويًا.",
          "هذا ناتج سلبي لا يناسب العلاقة.",
          "ليس هو الامتداد الطبيعي للعلاقة.",
        ],
      },
    ],
  },
  verbal_completion: {
    title: "إكمال الجمل",
    examTitle: "اختبار إكمال الجمل",
    questions: [
      {
        id: 1,
        level: "سهل",
        prompt: "أكمل الجملة بما يناسب المعنى: كان القرار ____ لأنه بُني على معلومات دقيقة.",
        options: ["مرتبكًا", "عشوائيًا", "حكيمًا", "مؤجلًا"],
        correctIndex: 2,
        explanations: [
          "هذا يناقض وصف القرار المبني على معلومات دقيقة.",
          "العشوائية لا تتفق مع الدقة.",
          "صحيح، لأن بناء القرار على معلومات دقيقة يدل على الحكمة.",
          "التأجيل لا يرتبط هنا بالمعنى المطلوب.",
        ],
      },
      {
        id: 2,
        level: "متوسط",
        prompt: "اختيارك للكلمة الأنسب يعتمد على ____ بين الجملة الأولى والجملة الختامية.",
        options: ["التناقض", "الترابط", "الإلغاء", "الحياد التام"],
        correctIndex: 1,
        explanations: [
          "ليس المقصود وجود تناقض بل اتصال في المعنى.",
          "صحيح، لأن الإكمال الجيد يعتمد على ترابط السياق.",
          "الإلغاء لا يصف العلاقة بين الجمل.",
          "الحياد لا يخدم هنا معنى الربط السياقي.",
        ],
      },
    ],
  },
  verbal_context: {
    title: "الخطأ السياقي",
    examTitle: "اختبار الخطأ السياقي",
    questions: [
      {
        id: 1,
        level: "متوسط",
        prompt: "حدد الكلمة التي أحدثت خللًا في الجملة: كان العرض واضحًا ومنظمًا ومبهمًا منذ البداية.",
        options: ["واضحًا", "منظمًا", "مبهمًا", "البداية"],
        correctIndex: 2,
        explanations: [
          "واضحًا متسقة مع المعنى العام.",
          "منظمًا تدعم المعنى نفسه.",
          "صحيح، لأن مبهمًا تناقض الوضوح والتنظيم في السياق.",
          "البداية ليست موضع الخلل هنا.",
        ],
      },
      {
        id: 2,
        level: "سهل",
        prompt: "في الجملة: جاء التقرير مختصرًا، دقيقًا، ومبعثرًا. ما الخطأ السياقي؟",
        options: ["مختصرًا", "دقيقًا", "مبعثرًا", "التقرير"],
        correctIndex: 2,
        explanations: [
          "مختصرًا لا تخالف السياق.",
          "دقيقًا تنسجم مع الوصف الجيد.",
          "صحيح، لأن مبعثرًا تفسد التوازن الدلالي للجملة.",
          "التقرير ليس هو موضع الخطأ.",
        ],
      },
    ],
  },
  verbal_odd: {
    title: "المفردة الشاذة",
    examTitle: "اختبار المفردة الشاذة",
    questions: [
      {
        id: 1,
        level: "سهل",
        prompt: "اختر الكلمة الشاذة: كتاب، مجلة، صحيفة، نافذة.",
        options: ["كتاب", "مجلة", "صحيفة", "نافذة"],
        correctIndex: 3,
        explanations: [
          "كتاب من مجموعة المطبوعات.",
          "مجلة من المجموعة نفسها.",
          "صحيفة من المجموعة نفسها.",
          "صحيح، لأن نافذة ليست من فئة المطبوعات أو وسائل القراءة.",
        ],
      },
      {
        id: 2,
        level: "متوسط",
        prompt: "اختر المفردة الشاذة: متر، كيلوجرام، سنتيمتر، كيلومتر.",
        options: ["متر", "كيلوجرام", "سنتيمتر", "كيلومتر"],
        correctIndex: 1,
        explanations: [
          "متر وحدة طول.",
          "صحيح، لأن كيلوجرام وحدة كتلة بينما البقية وحدات طول.",
          "سنتيمتر من وحدات الطول.",
          "كيلومتر من وحدات الطول.",
        ],
      },
    ],
  },
  quant_algebra: {
    title: "الجبر",
    examTitle: "اختبار الجبر",
    formulas: ["إذا كان ax + b = c فإن x = (c - b) / a", "(a + b)² = a² + 2ab + b²"],
    questions: [
      {
        id: 1,
        level: "سهل",
        prompt: "إذا كان 2س + 4 = 10، فما قيمة س؟",
        options: ["2", "3", "4", "5"],
        correctIndex: 1,
        explanations: [
          "عند التعويض لا تتحقق المعادلة.",
          "صحيح، لأن 2س = 6 ثم س = 3.",
          "هذه قيمة أكبر من الحل الصحيح.",
          "هذه لا تحقق طرفي المعادلة.",
        ],
      },
      {
        id: 2,
        level: "متوسط",
        prompt: "ناتج (س + 2)² يساوي:",
        options: ["س² + 4", "س² + 2س + 4", "س² + 4س + 4", "س² + 4س"],
        correctIndex: 2,
        explanations: [
          "ناقص الحد الأوسط 4س.",
          "الحد الأوسط هنا غير صحيح.",
          "صحيح، باستخدام المتطابقة: (a+b)² = a² + 2ab + b².",
          "ناقص الحد الثابت 4.",
        ],
      },
    ],
  },
  quant_ratios: {
    title: "النسب والتناسب",
    examTitle: "اختبار النسب والتناسب",
    formulas: ["التناسب: a/b = c/d", "النسبة المئوية = الجزء ÷ الكل × 100"],
    questions: [
      {
        id: 1,
        level: "سهل",
        prompt: "إذا كانت النسبة بين 4 و10 تساوي النسبة بين 6 و ن، فما قيمة ن؟",
        options: ["10", "12", "15", "18"],
        correctIndex: 2,
        explanations: [
          "لا تحقق التناسب.",
          "أقل من القيمة الصحيحة.",
          "صحيح، لأن 4/10 = 6/ن، ومنه 4ن = 60 ثم ن = 15.",
          "هذه قيمة أعلى من المطلوب.",
        ],
      },
      {
        id: 2,
        level: "متوسط",
        prompt: "إذا كان 25% من عدد يساوي 20، فما العدد الكامل؟",
        options: ["40", "60", "80", "100"],
        correctIndex: 2,
        explanations: [
          "25% من 40 يساوي 10 فقط.",
          "25% من 60 يساوي 15.",
          "صحيح، لأن العدد = 20 ÷ 0.25 = 80.",
          "25% من 100 يساوي 25.",
        ],
      },
    ],
  },
  quant_geometry: {
    title: "الهندسة",
    examTitle: "اختبار الهندسة",
    formulas: ["مساحة المستطيل = الطول × العرض", "مجموع زوايا المثلث = 180°"],
    questions: [
      {
        id: 1,
        level: "سهل",
        prompt: "مستطيل طوله 8 وعرضه 3، فما مساحته؟",
        options: ["11", "24", "22", "16"],
        correctIndex: 1,
        explanations: [
          "هذا جمع وليس مساحة.",
          "صحيح، لأن المساحة = 8 × 3 = 24.",
          "هذه ليست ناتج ضرب الطول في العرض.",
          "هذه قيمة أقل من المساحة الصحيحة.",
        ],
      },
      {
        id: 2,
        level: "متوسط",
        prompt: "إذا كانت زاويتان في مثلث تساويان 50° و60°، فما الزاوية الثالثة؟",
        options: ["50°", "60°", "70°", "80°"],
        correctIndex: 2,
        explanations: [
          "إذا كانت الثالثة 50° يصبح المجموع 160° فقط.",
          "هذا يجعل المجموع 170°.",
          "صحيح، لأن 180 - (50 + 60) = 70.",
          "هذا يجعل المجموع يتجاوز 180°.",
        ],
      },
    ],
  },
};

const sectionLabels: Record<ExamSectionKey, string> = {
  verbal_reading: "القطع اللفظية",
  verbal_analogy: "التناظر اللفظي",
  verbal_completion: "إكمال الجمل",
  verbal_context: "الخطأ السياقي",
  verbal_odd: "المفردة الشاذة",
  quant_algebra: "الجبر",
  quant_ratios: "النسب والتناسب",
  quant_geometry: "الهندسة",
};

function getSectionFromParams(searchParams: URLSearchParams): ExamSectionKey {
  const section = searchParams.get("section") as ExamSectionKey | null;
  if (!section) return "verbal_reading";
  return examData[section] ? section : "verbal_reading";
}

function toArabicChoice(index: number) {
  return ["أ", "ب", "ج", "د"][index] ?? String(index + 1);
}

export function SectionAwareExam() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sectionKey = getSectionFromParams(searchParams);
  const section = examData[sectionKey];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const questions = section.questions;
  const currentQuestion = questions[currentIndex];
  const selectedIndex = answers[currentQuestion.id];
  const answeredCount = Object.keys(answers).length;

  const score = useMemo(() => {
    return questions.reduce((total, question) => {
      return total + (answers[question.id] === question.correctIndex ? 1 : 0);
    }, 0);
  }, [answers, questions]);

  const progress = Math.round(((currentIndex + 1) / questions.length) * 100);

  function handleSelect(optionIndex: number) {
    setAnswers((previous) => ({ ...previous, [currentQuestion.id]: optionIndex }));
  }

  function handleNext() {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((previous) => previous + 1);
      return;
    }
    setSubmitted(true);
  }

  function handlePrevious() {
    if (currentIndex > 0) {
      setCurrentIndex((previous) => previous - 1);
    }
  }

  function resetExam() {
    setSubmitted(false);
    setCurrentIndex(0);
    setAnswers({});
  }

  if (submitted) {
    return (
      <div className="space-y-6">
        <Card className="surface-card p-8 md:p-10">
          <Badge className="border-transparent bg-[#123B7A] text-white">النتيجة النهائية</Badge>
          <h1 className="page-heading mt-4 max-w-none">{section.examTitle}</h1>
          <p className="section-copy mb-0 max-w-3xl text-slate-600">
            أنهيت الاختبار، وهذه خلاصة أدائك بشكل واضح ومباشر داخل نفس القسم الذي بدأت منه.
          </p>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {[
              ["عدد الأسئلة", questions.length],
              ["عدد المجاب", answeredCount],
              ["النتيجة", `${score} / ${questions.length}`],
            ].map(([label, value]) => (
              <div key={label} className="rounded-[1.6rem] bg-slate-50 p-5 ring-1 ring-slate-200">
                <div className="text-sm text-slate-500">{label}</div>
                <div className="display-font mt-2 text-2xl font-bold text-slate-950">{value}</div>
              </div>
            ))}
          </div>

          <div className="mt-8 space-y-4">
            {questions.map((question, index) => {
              const userAnswer = answers[question.id];
              const isCorrect = userAnswer === question.correctIndex;
              return (
                <div key={question.id} className="rounded-[1.7rem] border border-slate-200 p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="display-font text-lg font-bold text-slate-950">السؤال {index + 1}</h2>
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-sm font-semibold",
                        isCorrect ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700",
                      )}
                    >
                      {isCorrect ? "إجابة صحيحة" : "إجابة خاطئة"}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-8 text-slate-700">{question.prompt}</p>
                  <div className="mt-4 space-y-2 text-sm leading-7 text-slate-600">
                    <div>إجابتك: {typeof userAnswer === "number" ? question.options[userAnswer] : "لم يتم اختيار إجابة"}</div>
                    <div>الإجابة الصحيحة: {question.options[question.correctIndex]}</div>
                    <div>الشرح المختصر: {question.explanations[question.correctIndex]}</div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <Button onClick={resetExam}>إعادة الاختبار</Button>
            <Link href="/question-bank">
              <Button variant="outline">العودة إلى بنك الأسئلة</Button>
            </Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-6">
        <div className="surface-dark p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-white/70">محاكاة معيار</p>
              <h2 className="display-font text-2xl font-bold">{section.examTitle}</h2>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2">
                السؤال {currentIndex + 1} من {questions.length}
              </span>
              <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2">{sectionLabels[sectionKey]}</span>
            </div>
          </div>
          <Progress value={progress} className="mt-5 bg-white/10" indicatorClassName="bg-[linear-gradient(90deg,#ffffff,#f5d58b)]" />
        </div>

        <div className="surface-card p-6 md:p-7">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">نوع السؤال</p>
              <h3 className="display-font text-2xl font-bold text-slate-950">{section.title}</h3>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.3rem] bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                <div className="text-xs text-slate-500">المستوى</div>
                <div className="mt-1 text-sm font-bold text-slate-900">{currentQuestion.level}</div>
              </div>
              <div className="rounded-[1.3rem] bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
                <div className="text-xs text-slate-500">أجبت حتى الآن</div>
                <div className="mt-1 text-sm font-bold text-slate-900">{answeredCount} / {questions.length}</div>
              </div>
            </div>
          </div>

          {section.formulas?.length ? (
            <div className="mb-6 rounded-[1.6rem] bg-amber-50 p-5 ring-1 ring-amber-200">
              <div className="mb-3 text-sm font-semibold text-amber-800">تذكير سريع بالقانون</div>
              <div className="space-y-2 text-sm leading-7 text-amber-900">
                {section.formulas.map((formula) => (
                  <div key={formula}>{formula}</div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="rounded-[1.8rem] border border-slate-200 p-5 sm:p-6">
            <h2 className="text-xl font-bold leading-9 text-slate-950">{currentQuestion.prompt}</h2>

            <div className="mt-6 grid gap-3">
              {currentQuestion.options.map((option, optionIndex) => {
                const chosen = selectedIndex === optionIndex;
                const isCorrect = currentQuestion.correctIndex === optionIndex;
                const showFeedback = typeof selectedIndex === "number";

                let stateClasses = "border-slate-200 bg-white text-slate-800";
                if (showFeedback && chosen && isCorrect) {
                  stateClasses = "border-emerald-300 bg-emerald-50 text-emerald-900";
                } else if (showFeedback && chosen && !isCorrect) {
                  stateClasses = "border-rose-300 bg-rose-50 text-rose-900";
                } else if (showFeedback && !chosen && isCorrect) {
                  stateClasses = "border-emerald-200 bg-emerald-50/60 text-emerald-900";
                }

                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => handleSelect(optionIndex)}
                    className={cn("w-full rounded-[1.4rem] border p-4 text-right transition", stateClasses)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-sm font-bold text-white">
                        {toArabicChoice(optionIndex)}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold">{option}</div>
                        {showFeedback && chosen ? (
                          <div className="mt-2 text-sm leading-7">
                            {chosen && isCorrect ? "✅ إجابة صحيحة" : "❌ إجابة خاطئة"}
                            <div className="mt-1">{currentQuestion.explanations[optionIndex]}</div>
                          </div>
                        ) : null}
                        {showFeedback && !chosen && isCorrect ? (
                          <div className="mt-2 text-sm leading-7">الإجابة الصحيحة مع شرح مختصر: {currentQuestion.explanations[optionIndex]}</div>
                        ) : null}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <Button variant="outline" onClick={handlePrevious} disabled={currentIndex === 0}>
              السؤال السابق
            </Button>

            <div className="flex flex-wrap gap-3">
              <Button variant="outline" onClick={() => setSubmitted(true)}>
                عرض النتيجة
              </Button>
              <Button onClick={handleNext}>{currentIndex === questions.length - 1 ? "إنهاء الاختبار" : "التالي"}</Button>
            </div>
          </div>
        </div>
      </div>

      <aside className="surface-card h-fit p-6">
        <div className="mb-4">
          <div className="text-sm text-slate-500">تنقل سريع</div>
          <h2 className="display-font mt-1 text-xl font-bold text-slate-950">لوحة الأسئلة</h2>
        </div>

        <div className="grid grid-cols-5 gap-2">
          {questions.map((question, index) => {
            const answered = typeof answers[question.id] === "number";
            const active = index === currentIndex;
            return (
              <button
                key={question.id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  "rounded-xl px-3 py-3 text-sm font-bold transition",
                  active
                    ? "bg-slate-900 text-white"
                    : answered
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200",
                )}
              >
                {index + 1}
              </button>
            );
          })}
        </div>

        <div className="mt-6 rounded-[1.5rem] bg-slate-50 p-4 ring-1 ring-slate-200">
          <div className="text-sm font-semibold text-slate-900">إرشاد سريع</div>
          <ul className="mt-3 space-y-2 text-sm leading-7 text-slate-600">
            <li>الأسئلة المجاب عنها تتغير حالتها داخل اللوحة مباشرة.</li>
            <li>عند اختيار الإجابة يظهر الصحيح والخاطئ مع شرح مختصر داخل السؤال نفسه.</li>
            <li>المسار يبقى داخل نفس القسم الذي دخلت منه، ولا يتحول إلى قسم آخر.</li>
          </ul>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <Button variant="outline" onClick={() => router.push("/question-bank")}>
            العودة للبنك
          </Button>
          <Link href={`/question-bank`}>
            <Button>غيّر القسم</Button>
          </Link>
        </div>
      </aside>
    </div>
  );
}
