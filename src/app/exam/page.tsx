import { Suspense } from "react";

import { Reveal } from "@/components/reveal";
import { SectionAwareExam } from "@/components/section-aware-exam";
import { SiteHeader } from "@/components/site-header";
import { VerbalReadingFromDocument } from "@/components/verbal-reading-from-document";
import { getPassageDetail, getReadingPassageSummaries } from "@/lib/question-bank-api";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/question-bank", label: "بنك الأسئلة" },
  { href: "/diagnostic", label: "التشخيص" },
  { href: "/results", label: "النتائج" },
];

function normalizeSearchParam(value?: string | string[]) {
  if (Array.isArray(value)) return value[0];
  return value;
}

export default async function ExamPage({
  searchParams,
}: {
  searchParams?: Promise<{
    section?: string | string[];
    passageId?: string | string[];
    question?: string | string[];
  }>;
}) {
  const resolvedSearchParams = (searchParams ? await searchParams : {}) ?? {};
  const section = normalizeSearchParam(resolvedSearchParams.section);

  if (section === "verbal_reading") {
    const passages = await getReadingPassageSummaries();
    const requestedPassageId = Number(normalizeSearchParam(resolvedSearchParams.passageId));
    const fallbackPassageId = passages[0]?.id ?? 0;
    const currentPassageId =
      passages.find((passage) => passage.id === requestedPassageId)?.id ?? fallbackPassageId;
    const currentPassage = currentPassageId ? await getPassageDetail(currentPassageId) : null;
    const initialQuestionIndex = Math.max(Number(normalizeSearchParam(resolvedSearchParams.question)) || 0, 0);

    if (currentPassage && passages.length) {
      return (
        <div className="min-h-screen">
          <SiteHeader links={navLinks} ctaHref="/question-bank" ctaLabel="ارجع إلى البنك" />
          <main className="section-shell pt-10 md:pt-14">
            <div className="mx-auto w-[min(calc(100%-2rem),1400px)]">
              <Reveal>
                <VerbalReadingFromDocument
                  currentPassage={currentPassage}
                  passages={passages}
                  initialQuestionIndex={initialQuestionIndex}
                />
              </Reveal>
            </div>
          </main>
        </div>
      );
    }
  }

  return (
    <div className="min-h-screen">
      <SiteHeader links={navLinks} ctaHref="/question-bank" ctaLabel="ارجع إلى البنك" />
      <main className="section-shell pt-10 md:pt-14">
        <div className="mx-auto w-[min(calc(100%-2rem),1240px)]">
          <Reveal>
            <Suspense
              fallback={<div className="surface-card p-8 text-sm text-slate-500">جارٍ تجهيز الاختبار...</div>}
            >
              <SectionAwareExam />
            </Suspense>
          </Reveal>
        </div>
      </main>
    </div>
  );
}
