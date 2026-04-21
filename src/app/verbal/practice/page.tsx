import { Suspense } from "react";
import { BookOpenText } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { VerbalPracticeBank } from "@/components/verbal-practice-bank";

export default function VerbalPracticePage() {
  return (
    <PageShell
      eyebrow="اللفظي المصنف"
      title="رتبنا أسئلة اللفظي المتنوعة داخل أقسام واضحة وجاهزة للتدريب"
      description="ابدأ من تناظر لفظي أو إكمال الجمل أو الخطأ السياقي أو المفردة الشاذة أو الفهم القصير. كل سؤال مرتبط بتصحيح بعد التأكيد وشرح للإجابة الصحيحة مع دعم حفظ الأخطاء وXP."
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
        <VerbalPracticeBank />
      </Suspense>
    </PageShell>
  );
}
