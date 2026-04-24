"use client";

import { DashboardRuntimeGuard } from "@/components/dashboard-runtime-guard";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StudentDashboard } from "@/components/student-dashboard";

export function DashboardShell() {
  const dashboardLinks = [
    { href: "/dashboard", label: "لوحة التحكم" },
    { href: "/question-bank", label: "بنك الأسئلة" },
    { href: "/summaries", label: "الملخصات" },
    { href: "/statistics", label: "الإحصائيات" },
  ];

  return (
    <div className="min-h-screen">
      <DashboardRuntimeGuard resetKey="dashboard-header">
        <SiteHeader links={dashboardLinks} />
      </DashboardRuntimeGuard>

      <main className="section-shell pb-8 pt-6 md:pb-12 md:pt-8">
        <div className="mx-auto w-[min(calc(100%-1rem),1400px)] sm:w-[min(calc(100%-2rem),1400px)]">
          <DashboardRuntimeGuard resetKey="dashboard-main">
            <StudentDashboard />
          </DashboardRuntimeGuard>
        </div>
      </main>

      <DashboardRuntimeGuard resetKey="dashboard-footer">
        <SiteFooter />
      </DashboardRuntimeGuard>
    </div>
  );
}
