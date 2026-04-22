import { UserPlus } from "lucide-react";

import { AuthFormCard } from "@/components/auth-form-card";
import { AuthHighlightPanel } from "@/components/auth-highlight-panel";
import { PageShell } from "@/components/page-shell";

type RegisterPageProps = {
  searchParams: Promise<{
    next?: string | string[];
  }>;
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const resolvedSearchParams = await searchParams;
  const nextPath =
    typeof resolvedSearchParams.next === "string"
      ? resolvedSearchParams.next
      : resolvedSearchParams.next?.[0] ?? "/dashboard";

  return (
    <PageShell
      eyebrow="إنشاء حساب"
      title="أنشئ حسابك وابدأ رحلة مرتبة من أول يوم"
      description="من أول تسجيل سيتم حفظ تقدمك وأخطائك وخطتك اليومية داخل تجربة أوضح وأسرع وأكثر قابلية للمتابعة."
      icon={UserPlus}
      iconWrap="bg-[#fff7ed]"
      iconColor="text-[#C99A43]"
      accentClass="shadow-[0_20px_45px_rgba(201,154,67,0.16)]"
      ctaLabel="تسجيل الدخول"
      ctaHref={`/login?next=${encodeURIComponent(nextPath)}`}
    >
      <div className="grid gap-6 xl:grid-cols-[1.06fr,0.94fr]">
        <AuthHighlightPanel mode="register" />
        <AuthFormCard mode="register" nextPath={nextPath} />
      </div>
    </PageShell>
  );
}
