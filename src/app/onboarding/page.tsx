import { Suspense } from "react";
import { Sparkles } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { StudentOnboarding } from "@/components/student-onboarding";

export default function OnboardingPage() {
  return (
    <PageShell
      eyebrow="الإعداد الأولي"
      title="أعطنا معلوماتك الأساسية لنرتب لك خطة يومية مناسبة"
      description="حدد الأيام المتبقية، والوقت اليومي، وما تبقى عليك من المقاطع إن كنت تعرفه، وسنبني لك لوحة طالب وخطة ذكية مرتبطة بحسابك."
      icon={Sparkles}
      iconWrap="bg-[#fff7ed]"
      iconColor="text-[#C99A43]"
      accentClass="shadow-[0_20px_45px_rgba(201,154,67,0.16)]"
      ctaLabel="العودة للوحة الطالب"
      ctaHref="/dashboard"
    >
      <Suspense
        fallback={
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-soft">
            جاري تجهيز إعدادات الخطة...
          </div>
        }
      >
        <StudentOnboarding />
      </Suspense>
    </PageShell>
  );
}
