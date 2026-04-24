import { Suspense } from "react";

import { AppSidebar } from "@/components/app-sidebar";
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
        <div className="mx-auto flex w-[min(calc(100%-1rem),1360px)] flex-col gap-6 sm:w-[min(calc(100%-2rem),1360px)] xl:flex-row xl:items-start xl:gap-8">
          <DashboardRuntimeGuard resetKey="question-bank-sidebar">
            <AppSidebar />
          </DashboardRuntimeGuard>

          <div className="min-w-0 flex-1">
            <DashboardRuntimeGuard resetKey="question-bank-main">
              <Suspense
                fallback={
                  <div className="rounded-[1.7rem] border border-dashed border-slate-300 bg-white/70 p-8 text-center text-sm text-slate-500">
                    جارٍ تجهيز بنك الأسئلة...
                  </div>
                }
              >
                <QuestionBankOrganizer />
              </Suspense>
            </DashboardRuntimeGuard>
          </div>
        </div>
      </main>

      <DashboardRuntimeGuard resetKey="question-bank-footer">
        <SiteFooter />
      </DashboardRuntimeGuard>
    </div>
  );
}
