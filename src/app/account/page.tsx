import { UserRound } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { StudentAccount } from "@/components/student-account";
import { getInitialAuthUser } from "@/lib/server-auth";

export default async function AccountPage() {
  const initialAuthUser = await getInitialAuthUser();

  return (
    <PageShell
      eyebrow="الحساب"
      title="بياناتك الشخصية وإعدادات خطتك في مكان واحد واضح وعملي"
      description="من هنا تراجع معلومات الحساب الأساسية، والجنس، وبيانات التواصل، ونوع الخطة الحالية، وموعد الاختبار، مع اختصارات سريعة لتعديل الإعدادات أو متابعة الدراسة."
      icon={UserRound}
      iconWrap="bg-[#eef4ff]"
      iconColor="text-[#123B7A]"
      accentClass="shadow-[0_20px_45px_rgba(18,59,122,0.14)]"
      ctaLabel="تعديل الإعدادات"
      ctaHref="/onboarding"
      headerVariant="student"
      initialAuthUser={initialAuthUser}
    >
      <StudentAccount />
    </PageShell>
  );
}
