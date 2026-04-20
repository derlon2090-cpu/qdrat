import { House } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { StudentDashboard } from "@/components/student-dashboard";

export default function DashboardPage() {
  return (
    <PageShell
      eyebrow="لوحة الطالب"
      title="ابدأ يومك من خطة واضحة، ثم استكمل من آخر مكان توقفت عنده"
      description="هذه أول صفحة بعد تسجيل الدخول: تعرض مهام اليوم، ونسبة الإنجاز، وآخر نشاط، وأسرع طريق للانتقال إلى بنك الأسئلة أو الأخطاء أو الملخصات."
      icon={House}
      iconWrap="bg-[#eef4ff]"
      iconColor="text-[#123B7A]"
      accentClass="shadow-[0_20px_45px_rgba(18,59,122,0.14)]"
      ctaLabel="تعديل إعدادات الخطة"
      ctaHref="/onboarding"
    >
      <StudentDashboard />
    </PageShell>
  );
}
