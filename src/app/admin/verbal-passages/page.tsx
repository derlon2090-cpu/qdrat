import { Files } from "lucide-react";

import { AdminVerbalPassagesManager } from "@/components/admin-verbal-passages-manager";
import { PageShell } from "@/components/page-shell";

export default function AdminVerbalPassagesPage() {
  return (
    <PageShell
      eyebrow="admin / verbal_passages"
      title="إدارة بنك القطع اللفظي"
      description="إضافة وتعديل وحذف القطع، إدارة الأسئلة المرتبطة، استيراد CSV أو JSON، ومعاينة المحتوى قبل نشره."
      icon={Files}
      iconWrap="bg-[#fff7ed]"
      iconColor="text-[#d97706]"
      accentClass="shadow-[0_20px_45px_rgba(217,119,6,0.16)]"
      ctaLabel="افتح واجهة الطالب"
      ctaHref="/verbal-passages"
    >
      <AdminVerbalPassagesManager />
    </PageShell>
  );
}
