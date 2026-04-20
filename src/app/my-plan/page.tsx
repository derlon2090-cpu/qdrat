import { NotebookPen } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { StudentPlan } from "@/components/student-plan";

export default function MyPlanPage() {
  return (
    <PageShell
      eyebrow="خطتي"
      title="خطة ذكية تتوزع تلقائيًا حسب وقتك والأيام المتبقية"
      description="راجع مهام اليوم والأيام القادمة، وأعد ضبط الخطة أو أجّل مهام اليوم إذا تغيّر وقتك، مع إبقاء التقدم الكلي تحت عينك."
      icon={NotebookPen}
      iconWrap="bg-[#edfdf3]"
      iconColor="text-[#2f855a]"
      accentClass="shadow-[0_20px_45px_rgba(47,133,90,0.16)]"
      ctaLabel="تعديل إعدادات الخطة"
      ctaHref="/onboarding"
    >
      <StudentPlan />
    </PageShell>
  );
}
