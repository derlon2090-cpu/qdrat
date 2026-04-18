import { Suspense } from "react";
import { UserPlus } from "lucide-react";

import { AuthFormCard } from "@/components/auth-form-card";
import { PageShell } from "@/components/page-shell";

export default function RegisterPage() {
  return (
    <PageShell
      eyebrow="إنشاء حساب"
      title="أنشئ حسابك وابدأ حفظ الأخطاء تلقائيًا"
      description="بمجرد إنشاء الحساب سيرتبط كل سؤال تخطئ فيه باسمك، وتستطيع مراجعته لاحقًا داخل قسم الأخطاء في بنك الأسئلة."
      icon={UserPlus}
      iconWrap="bg-[#fff7ed]"
      iconColor="text-[#C99A43]"
      accentClass="shadow-[0_20px_45px_rgba(201,154,67,0.16)]"
      ctaLabel="تسجيل الدخول"
      ctaHref="/login"
    >
      <Suspense
        fallback={
          <div className="rounded-[2rem] border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-soft">
            جارٍ تجهيز صفحة إنشاء الحساب...
          </div>
        }
      >
        <AuthFormCard mode="register" />
      </Suspense>
    </PageShell>
  );
}
