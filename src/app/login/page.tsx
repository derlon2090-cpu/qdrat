import { Suspense } from "react";
import { LogIn } from "lucide-react";

import { AuthFormCard } from "@/components/auth-form-card";
import { PageShell } from "@/components/page-shell";

export default function LoginPage() {
  return (
    <PageShell
      eyebrow="الدخول"
      title="سجّل دخولك ليتم حفظ أخطائك وتقدمك باسمك"
      description="بعد تسجيل الدخول ستظهر لك قائمة الأخطاء الخاصة بحسابك فقط، ويمكنك تدريبها حتى تنتقل من الخطأ إلى قيد التدريب ثم إلى الإتقان."
      icon={LogIn}
      iconWrap="bg-[#eef4ff]"
      iconColor="text-[#123B7A]"
      accentClass="shadow-[0_20px_45px_rgba(18,59,122,0.14)]"
      ctaLabel="إنشاء حساب"
      ctaHref="/register"
    >
      <Suspense
        fallback={
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-soft">
            جارٍ تجهيز صفحة تسجيل الدخول...
          </div>
        }
      >
        <AuthFormCard mode="login" />
      </Suspense>
    </PageShell>
  );
}
