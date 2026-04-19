import { Users } from "lucide-react";

import { AdminUsersOverview } from "@/components/admin-users-overview";
import { PageShell } from "@/components/page-shell";

export default function AdminUsersPage() {
  return (
    <PageShell
      eyebrow="admin / users"
      title="إدارة المستخدمين والجلسات والاشتراكات"
      description="عرض منظم للحسابات المسجلة داخل قاعدة البيانات، مع الباقات، حالة الاشتراك، آخر الجلسات، وملخص الأخطاء لكل مستخدم."
      icon={Users}
      iconWrap="bg-[#eef4ff]"
      iconColor="text-[#123B7A]"
      accentClass="shadow-[0_20px_45px_rgba(18,59,122,0.16)]"
      ctaLabel="ارجع إلى لوحة الإدارة"
      ctaHref="/admin"
    >
      <AdminUsersOverview />
    </PageShell>
  );
}
