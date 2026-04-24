import { Suspense } from "react";

import { DashboardRuntimeGuard } from "@/components/dashboard-runtime-guard";
import { QuestionBankOrganizer } from "@/components/question-bank-organizer";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export default function QuestionBankPage() {
  return (
    <div className="min-h-screen">
      <DashboardRuntimeGuard resetKey="question-bank-header">
        <SiteHeader ctaHref="/exam" ctaLabel="ابدأ اختبارًا الآن" />
      </DashboardRuntimeGuard>

      <main className="section-shell pb-8 pt-6 md:pb-12 md:pt-8">
        <div className="mx-auto w-[min(calc(100%-1rem),1480px)] sm:w-[min(calc(100%-2rem),1480px)]">
          <DashboardRuntimeGuard resetKey="question-bank-main">
            <Suspense
              fallback={
                <div className="rounded-[1.7rem] border border-dashed border-slate-300 bg-white/70 p-8 text-center text-sm text-slate-500">
                  جاري تجهيز بنك الأسئلة...
                </div>
              }
            >
              <QuestionBankOrganizer />
            </Suspense>
          </DashboardRuntimeGuard>
        </div>
      </main>

      <DashboardRuntimeGuard resetKey="question-bank-footer">
        <SiteFooter />
      </DashboardRuntimeGuard>
    </div>
  );
}
