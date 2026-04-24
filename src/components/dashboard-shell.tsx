"use client";

import {
  BarChart3,
  BookOpen,
  CalendarDays,
  ClipboardList,
  House,
  Trophy,
  UserRound,
} from "lucide-react";

import { DashboardRuntimeGuard } from "@/components/dashboard-runtime-guard";
import { SiteHeader } from "@/components/site-header";
import { StudentDashboard } from "@/components/student-dashboard";

export function DashboardShell() {
  const dashboardLinks = [
    { href: "/dashboard", label: "لوحتي", icon: House },
    { href: "/my-plan", label: "الخطة اليومية", icon: CalendarDays },
    { href: "/question-bank", label: "بنك الأسئلة", icon: BookOpen },
    { href: "/challenge", label: "تحدي الشهر", icon: Trophy },
    { href: "/paper-models", label: "النماذج", icon: ClipboardList },
    { href: "/statistics", label: "الإحصائيات", icon: BarChart3 },
    { href: "/account", label: "الإعدادات", icon: UserRound },
  ];

  return (
    <div className="min-h-screen bg-[#fbfdff]">
      <DashboardRuntimeGuard resetKey="dashboard-header">
        <SiteHeader links={dashboardLinks} />
      </DashboardRuntimeGuard>

      <main className="pb-8 pt-5 md:pb-12 md:pt-7">
        <div className="mx-auto w-[min(calc(100%-1rem),1480px)] sm:w-[min(calc(100%-2rem),1480px)]">
          <DashboardRuntimeGuard resetKey="dashboard-main">
            <StudentDashboard />
          </DashboardRuntimeGuard>

          <DashboardRuntimeGuard resetKey="dashboard-footer">
            <footer className="pb-4 pt-8 text-center text-sm font-medium text-slate-400">
              2024 © جميع الحقوق محفوظة - معيار
            </footer>
          </DashboardRuntimeGuard>
        </div>
      </main>
    </div>
  );
}
