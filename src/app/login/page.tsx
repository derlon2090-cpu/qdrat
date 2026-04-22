import { LogIn } from "lucide-react";

import { AuthFormCard } from "@/components/auth-form-card";
import { AuthHighlightPanel } from "@/components/auth-highlight-panel";
import { PageShell } from "@/components/page-shell";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string | string[];
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const nextPath =
    typeof resolvedSearchParams.next === "string"
      ? resolvedSearchParams.next
      : resolvedSearchParams.next?.[0] ?? "/dashboard";

  return (
    <PageShell
      eyebrow="الدخول"
      title="سجّل دخولك وابدأ من حيث توقفت مباشرة"
      description="واجهة دخول سريعة وواضحة تنقلك إلى خطتك اليومية، أخطائك، وملخصاتك بدون انتظار أو خطوات مشتتة."
      icon={LogIn}
      iconWrap="bg-[#eef4ff]"
      iconColor="text-[#123B7A]"
      accentClass="shadow-[0_20px_45px_rgba(18,59,122,0.14)]"
      ctaLabel="إنشاء حساب"
      ctaHref={`/register?next=${encodeURIComponent(nextPath)}`}
    >
      <div className="grid gap-6 xl:grid-cols-[1.06fr,0.94fr]">
        <AuthHighlightPanel mode="login" />
        <AuthFormCard mode="login" nextPath={nextPath} />
      </div>
    </PageShell>
  );
}
