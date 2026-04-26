import { DashboardRuntimeGuard } from "@/components/dashboard-runtime-guard";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StudentPlan } from "@/components/student-plan";

export default function MyPlanPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardRuntimeGuard resetKey="plan-header">
        <SiteHeader variant="student" ctaHref="/onboarding" ctaLabel="تعديل إعدادات الخطة" />
      </DashboardRuntimeGuard>

      <main className="section-shell flex-1 pb-8 pt-6 md:pb-12 md:pt-8">
        <div className="mx-auto w-[min(calc(100%-1rem),1480px)] sm:w-[min(calc(100%-2rem),1480px)]">
          <DashboardRuntimeGuard resetKey="plan-main">
            <StudentPlan />
          </DashboardRuntimeGuard>
        </div>
      </main>

      <DashboardRuntimeGuard resetKey="plan-footer">
        <SiteFooter variant="student" />
      </DashboardRuntimeGuard>
    </div>
  );
}
