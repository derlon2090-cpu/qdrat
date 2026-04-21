import { House } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { StudentDashboard } from "@/components/student-dashboard";

export default function DashboardPage() {
  return (
    <PageShell
      eyebrow="لوحة الطالب"
      title="ابدأ يومك من لوحة أكاديمية واضحة، ثم أكمل من آخر نقطة توقفت عندها"
      description="خطة اليوم، التقدم، المراجعة، والانتقال السريع بين الأقسام الأساسية داخل واجهة واحدة مرتبة وواضحة."
      icon={House}
      iconWrap="bg-[#eef4ff]"
      iconColor="text-[#123B7A]"
      accentClass="shadow-[0_20px_45px_rgba(18,59,122,0.14)]"
      ctaLabel="ضبط الخطة"
      ctaHref="/onboarding"
    >
      <StudentDashboard />
    </PageShell>
  );
}
