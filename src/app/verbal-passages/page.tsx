import { Suspense } from "react";
import { BookOpenText } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { VerbalPassagesBrowser } from "@/components/verbal-passages-browser";

export default function VerbalPassagesPage() {
  return (
    <PageShell
      eyebrow="verbal_passages"
      title="بنك القطع اللفظي"
      description="افتح القطعة مباشرة باسمها المفتاحي، أو ابدأ بقطعة عشوائية تلقائيًا، ثم ابحث بعنوانها أو بكلماتها المفتاحية."
      icon={BookOpenText}
      iconWrap="bg-[#eef4ff]"
      iconColor="text-[#123B7A]"
      accentClass="shadow-[0_20px_45px_rgba(18,59,122,0.14)]"
      ctaLabel="افتح بنك الأسئلة"
      ctaHref="/question-bank"
    >
      <Suspense
        fallback={
          <div className="rounded-[1.8rem] border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
            جاري تجهيز بنك القطع اللفظي...
          </div>
        }
      >
        <VerbalPassagesBrowser mode="student" />
      </Suspense>
    </PageShell>
  );
}
