import { Suspense } from "react";

import { DashboardRuntimeGuard } from "@/components/dashboard-runtime-guard";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { VerbalPassagesBrowser } from "@/components/verbal-passages-browser";
import { getInitialAuthUser } from "@/lib/server-auth";

export default async function VerbalPassagesPage() {
  const initialAuthUser = await getInitialAuthUser();

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-950">
      <DashboardRuntimeGuard resetKey="verbal-passages-header">
        <SiteHeader
          variant={initialAuthUser ? "student" : "public"}
          ctaHref="/question-bank?track=verbal"
          ctaLabel="ارجع إلى بنك الأسئلة"
          initialUser={initialAuthUser}
        />
      </DashboardRuntimeGuard>

      <main className="mx-auto w-full max-w-[1600px] px-4 pb-16 pt-6 sm:px-6 xl:px-8">
        <section className="space-y-5">
          <DashboardRuntimeGuard resetKey="verbal-passages-main">
            <div className="rounded-[1.8rem] border border-slate-200 bg-white px-5 py-5 shadow-[0_18px_38px_rgba(15,23,42,0.05)] sm:px-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-[#1d4ed8]">اللفظي / الاستيعاب</div>
                  <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-950">
                    استيعاب مقروء بواجهة حل منظمة وواضحة
                  </h1>
                  <p className="mt-2 max-w-3xl text-sm leading-8 text-slate-600">
                    ابحث عن القطعة، افتحها مباشرة، ثم حل أسئلتها بنفس ترتيب شاشة التدريب
                    الجديدة: سؤال، تقدم، تنقل جانبي، وشرح تحت الإجابة.
                  </p>
                </div>

                <div className="rounded-full bg-[#eef4ff] px-4 py-2 text-sm font-semibold text-[#1d4ed8]">
                  قطع لفظية جاهزة للحل
                </div>
              </div>
            </div>

            <Suspense
              fallback={
                <div className="rounded-[1.8rem] border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
                  جار تجهيز بنك الاستيعاب المقروء...
                </div>
              }
            >
              <VerbalPassagesBrowser mode="student" />
            </Suspense>
          </DashboardRuntimeGuard>
        </section>
      </main>

      <DashboardRuntimeGuard resetKey="verbal-passages-footer">
        <SiteFooter />
      </DashboardRuntimeGuard>
    </div>
  );
}
