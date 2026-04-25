import { Suspense } from "react";
import { redirect } from "next/navigation";

import { DashboardRuntimeGuard } from "@/components/dashboard-runtime-guard";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { VerbalPracticeBank } from "@/components/verbal-practice-bank";
import {
  getVerbalQuestionCategory,
  getVerbalQuestionsByCategory,
  verbalQuestionCategories,
} from "@/data/verbal-mixed-bank";
import { getInitialAuthUser } from "@/lib/server-auth";

type VerbalPracticePageProps = {
  searchParams: Promise<{
    category?: string;
    question?: string;
  }>;
};

export default async function VerbalPracticePage({ searchParams }: VerbalPracticePageProps) {
  const initialAuthUser = await getInitialAuthUser();
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
    questions.find((question) => question.id === resolvedSearchParams.question)?.id ??
    questions[0]?.id ??
    null;

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
    <div className="min-h-screen bg-[#f8fafc] text-slate-950">
      <DashboardRuntimeGuard resetKey="verbal-practice-header">
        <SiteHeader
          variant={initialAuthUser ? "student" : "public"}
          ctaHref="/question-bank?track=verbal"
          ctaLabel="ارجع إلى بنك الأسئلة"
          initialUser={initialAuthUser}
        />
      </DashboardRuntimeGuard>

      <main className="mx-auto w-full max-w-[1600px] px-4 pb-16 pt-6 sm:px-6 xl:px-8">
        <section className="space-y-5">
          <DashboardRuntimeGuard resetKey="verbal-practice-main">
            <div className="rounded-[1.8rem] border border-slate-200 bg-white px-5 py-5 shadow-[0_18px_38px_rgba(15,23,42,0.05)] sm:px-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-[#1d4ed8]">اللفظي / داخل القسم</div>
                  <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                    حل أسئلة اللفظي بواجهة منظمة وواضحة
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm leading-8 text-slate-600">
                    نفس منطق الحفظ والتقدم موجود، لكن العرض هنا مرتب بشكل عملي: سؤال، تقدم،
                    تنقل جانبي، وشرح تحت السؤال.
                  </p>
                </div>

                <div className="rounded-full bg-[#eef4ff] px-4 py-2 text-sm font-semibold text-[#1d4ed8]">
                  {questions.length} سؤال في هذا القسم
                </div>
              </div>
            </div>

            <Suspense
              fallback={
                <div className="rounded-[1.7rem] border border-dashed border-slate-300 bg-white/80 p-8 text-center text-sm text-slate-500">
                  جار تجهيز واجهة التدريب اللفظي...
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
          </DashboardRuntimeGuard>
        </section>
      </main>

      <DashboardRuntimeGuard resetKey="verbal-practice-footer">
        <SiteFooter />
      </DashboardRuntimeGuard>
    </div>
  );
}
