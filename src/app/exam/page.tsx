"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { Reveal } from "@/components/reveal";
import { SiteHeader } from "@/components/site-header";
import { VerbalReadingFromDocument } from "@/components/verbal-reading-from-document";
import { getPassageDetailSync, getReadingPassageSummariesSync } from "@/lib/question-bank-api";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/question-bank", label: "بنك الأسئلة" },
  { href: "/diagnostic", label: "التشخيص" },
  { href: "/results", label: "النتائج" },
];

function EmptyExamState({ section }: { section?: string | null }) {
  const sectionLabel = section === "quantitative" ? "الكمي" : "اللفظي";

  return (
    <div className="rounded-[28px] bg-white p-8 shadow-sm ring-1 ring-slate-200">
      <div className="text-sm font-medium text-slate-500">بنك الأسئلة / {sectionLabel}</div>
      <h1 className="mt-4 text-3xl font-bold text-slate-900">لا توجد أسئلة حاليًا، سيتم إضافتها قريبًا</h1>
      <p className="mt-4 max-w-2xl text-lg leading-9 text-slate-600">
        تم إفراغ الأقسام القديمة بالكامل، وأصبح هذا المسار مهيأ فقط لعرض البيانات اليدوية الجديدة بنفس
        النصوص الأصلية وبدون أي استخراج تلقائي.
      </p>
    </div>
  );
}

function ExamPageContent() {
  const searchParams = useSearchParams();
  const section = searchParams.get("section");

  const passages = useMemo(() => getReadingPassageSummariesSync(), []);
  const requestedPassageId = searchParams.get("passageId") ?? passages[0]?.id ?? null;
  const currentPassage = useMemo(
    () => (requestedPassageId ? getPassageDetailSync(requestedPassageId) : null),
    [requestedPassageId],
  );
  const initialQuestionIndex = Math.max(Number(searchParams.get("question") ?? 0) || 0, 0);

  return (
    <div className="min-h-screen">
      <SiteHeader links={navLinks} ctaHref="/question-bank" ctaLabel="ارجع إلى البنك" />
      <main className="section-shell pt-10 md:pt-14">
        <div className="mx-auto w-[min(calc(100%-2rem),1400px)]">
          <Reveal>
            {section === "verbal_reading" ? (
              <VerbalReadingFromDocument
                currentPassage={currentPassage}
                passages={passages}
                initialQuestionIndex={initialQuestionIndex}
              />
            ) : (
              <EmptyExamState section={section} />
            )}
          </Reveal>
        </div>
      </main>
    </div>
  );
}

export default function ExamPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen">
          <SiteHeader links={navLinks} ctaHref="/question-bank" ctaLabel="ارجع إلى البنك" />
          <main className="section-shell pt-10 md:pt-14">
            <div className="mx-auto w-[min(calc(100%-2rem),1400px)]">
              <div className="rounded-[28px] bg-white p-8 shadow-sm ring-1 ring-slate-200">
                <div className="text-sm font-medium text-slate-500">بنك الأسئلة / القطع اللفظية</div>
                <h1 className="mt-4 text-3xl font-bold text-slate-900">جارٍ تجهيز عرض القطعة...</h1>
              </div>
            </div>
          </main>
        </div>
      }
    >
      <ExamPageContent />
    </Suspense>
  );
}
