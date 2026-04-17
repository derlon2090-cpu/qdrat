import { Suspense } from "react";

import { SiteHeader } from "@/components/site-header";
import { Reveal } from "@/components/reveal";
import { SectionAwareExam } from "@/components/section-aware-exam";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/question-bank", label: "بنك الأسئلة" },
  { href: "/diagnostic", label: "التشخيص" },
  { href: "/results", label: "النتائج" },
];

export default function ExamPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader links={navLinks} ctaHref="/question-bank" ctaLabel="ارجع إلى البنك" />
      <main className="section-shell pt-10 md:pt-14">
        <div className="mx-auto w-[min(calc(100%-2rem),1240px)]">
          <Reveal>
            <Suspense fallback={<div className="surface-card p-8 text-sm text-slate-500">جارٍ تجهيز الاختبار...</div>}>
              <SectionAwareExam />
            </Suspense>
          </Reveal>
        </div>
      </main>
    </div>
  );
}
