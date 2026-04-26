"use client";

import { DashboardRuntimeGuard } from "@/components/dashboard-runtime-guard";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StudentDashboard } from "@/components/student-dashboard";
import { studentTopNavItems } from "@/lib/site-nav";

export function DashboardShell() {
  return (
    <div className="min-h-screen bg-[#fbfdff]">
      <DashboardRuntimeGuard resetKey="dashboard-header">
        <SiteHeader variant="student" links={studentTopNavItems} />
      </DashboardRuntimeGuard>

      <main className="pb-8 pt-5 md:pb-12 md:pt-7">
        <div className="mx-auto w-[min(calc(100%-1rem),1480px)] sm:w-[min(calc(100%-2rem),1480px)]">
          <DashboardRuntimeGuard resetKey="dashboard-main">
            <StudentDashboard />
          </DashboardRuntimeGuard>

        </div>
      </main>

      <DashboardRuntimeGuard resetKey="dashboard-footer">
        <SiteFooter variant="student" />
      </DashboardRuntimeGuard>
    </div>
  );
}
