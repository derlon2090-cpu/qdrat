import { AppSidebar } from "@/components/app-sidebar";
import { DashboardRuntimeGuard } from "@/components/dashboard-runtime-guard";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StudentDashboard } from "@/components/student-dashboard";

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader ctaHref="/question-bank" ctaLabel="ابدأ تدريب الآن" />
      <main className="section-shell pt-8 pb-8 md:pt-10 md:pb-12">
        <div className="mx-auto flex w-[min(calc(100%-2rem),1280px)] gap-8">
          <DashboardRuntimeGuard resetKey="dashboard-sidebar">
            <AppSidebar />
          </DashboardRuntimeGuard>
          <div className="min-w-0 flex-1 space-y-8">
            <DashboardRuntimeGuard resetKey="dashboard-main">
              <StudentDashboard />
            </DashboardRuntimeGuard>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
