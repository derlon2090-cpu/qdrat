"use client";

import { Suspense, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Reveal } from "@/components/reveal";
import { SiteHeader } from "@/components/site-header";
import { getReadingPassageSummariesSync } from "@/lib/question-bank-api";

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
      <div className="text-sm font-medium text-slate-500">
        بنك الأسئلة / {sectionLabel}
      </div>
      <h1 className="mt-4 text-3xl font-bold text-slate-900">
        لا توجد أسئلة حالياً، سيتم إضافتها قريبًا
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-9 text-slate-600">
        هذا المسار لم يعد يُستخدم لعرض القطع اللفظية. إذا كنت تبحث عن بنك
        القطع فستنتقل تلقائيًا إلى الصفحة الجديدة المخصصة له.
      </p>
    </div>
  );
}

function LegacyVerbalRedirect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const passages = useMemo(() => getReadingPassageSummariesSync(), []);

  useEffect(() => {
    const requestedPassageId = searchParams.get("passageId");
    const matchedPassage =
      passages.find((passage) => passage.id === requestedPassageId) ?? passages[0];

    router.replace(matchedPassage?.href ?? "/verbal/reading", { scroll: false });
  }, [passages, router, searchParams]);

  return (
    <div className="rounded-[28px] bg-white p-8 shadow-sm ring-1 ring-slate-200">
      <div className="text-sm font-medium text-slate-500">
        بنك الأسئلة / القطع اللفظية
      </div>
      <h1 className="mt-4 text-3xl font-bold text-slate-900">
        جارٍ تحويلك إلى بنك القطع اللفظية...
      </h1>
    </div>
  );
}

function ExamPageContent() {
  const searchParams = useSearchParams();
  const section = searchParams.get("section");

  return (
    <div className="min-h-screen">
      <SiteHeader links={navLinks} ctaHref="/question-bank" ctaLabel="ارجع إلى البنك" />
      <main className="section-shell pt-10 md:pt-14">
        <div className="mx-auto w-[min(calc(100%-2rem),1400px)]">
          <Reveal>
            {section === "verbal_reading" ? (
              <LegacyVerbalRedirect />
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
                <div className="text-sm font-medium text-slate-500">
                  بنك الأسئلة / القطع اللفظية
                </div>
                <h1 className="mt-4 text-3xl font-bold text-slate-900">
                  جارٍ تجهيز الصفحة...
                </h1>
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
