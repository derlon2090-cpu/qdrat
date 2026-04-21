import { Suspense } from "react";
import { BriefcaseBusiness } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { QuestionBankOrganizer } from "@/components/question-bank-organizer";

export default function QuestionBankPage() {
  return (
    <PageShell
      eyebrow="بنك الأسئلة"
      title="بنك أسئلة منظم بين القطع اللفظية والأقسام التدريبية"
      description="القطع اللفظية لها قسم مستقل، وباقي الأسئلة اللفظية موزعة الآن إلى فهم المقروء، المفردات، الدلالة اللغوية، تصنيف النص، التناظر اللفظي، إكمال الجمل، الخطأ السياقي، والمفردة الشاذة مع تصحيح وشرح بعد التأكيد."
      icon={BriefcaseBusiness}
      iconWrap="bg-[#fff7ed]"
      iconColor="text-[#d97706]"
      accentClass="shadow-[0_20px_45px_rgba(217,119,6,0.16)]"
      ctaLabel="ابدأ الآن"
      ctaHref="/diagnostic"
    >
      <Suspense
        fallback={
          <div className="rounded-[1.7rem] border border-dashed border-slate-300 bg-white/70 p-8 text-center text-sm text-slate-500">
            جارٍ تجهيز بنك الأسئلة...
          </div>
        }
      >
        <QuestionBankOrganizer />
      </Suspense>
    </PageShell>
  );
}
