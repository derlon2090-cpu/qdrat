import { Suspense } from "react";
import { redirect } from "next/navigation";
import { BookOpenText } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { VerbalPracticeBank } from "@/components/verbal-practice-bank";
import {
  getVerbalQuestionCategory,
  getVerbalQuestionsByCategory,
  verbalQuestionCategories,
} from "@/data/verbal-mixed-bank";

type VerbalPracticePageProps = {
  searchParams: Promise<{
    category?: string;
    question?: string;
  }>;
};

export default async function VerbalPracticePage({ searchParams }: VerbalPracticePageProps) {
  const resolvedSearchParams = await searchParams;
  if (
    resolvedSearchParams.category === "short_reading" ||
    resolvedSearchParams.category === "reading_comprehension"
  ) {
    const nextParams = new URLSearchParams();
    if (resolvedSearchParams.question) {
      nextParams.set("question", resolvedSearchParams.question);
    }
    redirect(`/verbal/reading${nextParams.toString() ? `?${nextParams.toString()}` : ""}`);
  }
  const activeCategory = getVerbalQuestionCategory(
    resolvedSearchParams.category ?? "sentence_completion",
  );
  const questions = getVerbalQuestionsByCategory(activeCategory.id);
  const activeQuestionId =
    questions.find((question) => question.id === resolvedSearchParams.question)?.id ?? questions[0]?.id ?? null;

  const categories = verbalQuestionCategories.map((category) => {
    const categoryQuestions = getVerbalQuestionsByCategory(category.id);
    return {
      id: category.id,
      title: category.title,
      description: category.description,
      count: categoryQuestions.length,
      firstQuestionId: categoryQuestions[0]?.id ?? null,
    };
  });

  return (
    <PageShell
      eyebrow="اللفظي المصنف"
      title="رتبنا أسئلة اللفظي المتنوعة داخل أقسام واضحة وجاهزة للتدريب"
      description="الأقسام الرسمية الظاهرة الآن هي: إكمال الجمل، الاستيعاب المقروء، المفردة الشاذة، الخطأ السياقي، والتناظر اللفظي. أي سؤال من معنى كلمة أو دلالة أو نوع نص داخل فقرة تم ضمه تحت الاستيعاب المقروء."
      icon={BookOpenText}
      iconWrap="bg-[#eef4ff]"
      iconColor="text-[#123B7A]"
      accentClass="shadow-[0_20px_45px_rgba(18,59,122,0.16)]"
      ctaLabel="افتح بنك الأسئلة"
      ctaHref="/question-bank"
    >
      <Suspense
        fallback={
          <div className="rounded-[1.7rem] border border-dashed border-slate-300 bg-white/70 p-8 text-center text-sm text-slate-500">
            جاري تجهيز أقسام اللفظي...
          </div>
        }
      >
        <VerbalPracticeBank
          categories={categories}
          currentCategory={{
            id: activeCategory.id,
            title: activeCategory.title,
            description: activeCategory.description,
          }}
          questions={questions}
          activeQuestionId={activeQuestionId}
        />
      </Suspense>
    </PageShell>
  );
}
