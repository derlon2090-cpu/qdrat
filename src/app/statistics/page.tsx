import { BarChart3 } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { StudentStatistics } from "@/components/student-statistics";

export default function StatisticsPage() {
  return (
    <PageShell
      eyebrow="الإحصائيات"
      title="قياس واضح للتقدم في الكمي واللفظي مع أرقام تساعدك على القرار القادم"
      description="هذه الصفحة تعرض التقدم الكلي، ونسبة إنجاز كل مسار، وعدد الأخطاء، والملاحظات الحالية، مع قراءة سريعة لوضع الخطة وما إذا كانت مناسبة أو تحتاج إعادة توزيع."
      icon={BarChart3}
      iconWrap="bg-[#f5f3ff]"
      iconColor="text-[#7c3aed]"
      accentClass="shadow-[0_20px_45px_rgba(124,58,237,0.14)]"
      ctaLabel="العودة للوحة الطالب"
      ctaHref="/dashboard"
    >
      <StudentStatistics />
    </PageShell>
  );
}
