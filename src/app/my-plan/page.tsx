import { AppSidebar } from "@/components/app-sidebar";
import { DashboardRuntimeGuard } from "@/components/dashboard-runtime-guard";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StudentPlan } from "@/components/student-plan";

export default function MyPlanPage() {
  return (
    <div className="min-h-screen">
      <DashboardRuntimeGuard resetKey="plan-header">
        <SiteHeader ctaHref="/onboarding" ctaLabel="تعديل إعدادات الخطة" />
      </DashboardRuntimeGuard>

      <main className="section-shell pb-8 pt-6 md:pb-12 md:pt-8">
        <div className="mx-auto flex w-[min(calc(100%-1rem),1360px)] flex-col gap-6 sm:w-[min(calc(100%-2rem),1360px)] xl:flex-row xl:items-start xl:gap-8">
          <DashboardRuntimeGuard resetKey="plan-sidebar">
            <AppSidebar />
          </DashboardRuntimeGuard>

          <div className="min-w-0 flex-1">
            <DashboardRuntimeGuard resetKey="plan-main">
              <StudentPlan />
            </DashboardRuntimeGuard>
          </div>
        </div>
      </main>

      <DashboardRuntimeGuard resetKey="plan-footer">
        <SiteFooter />
      </DashboardRuntimeGuard>
    </div>
  );
}
