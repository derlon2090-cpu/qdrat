import { AppSidebar } from "@/components/app-sidebar";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { StudentDashboard } from "@/components/student-dashboard";

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader ctaHref="/question-bank" ctaLabel="ابدأ تدريب الآن" />
      <main className="section-shell pt-8 md:pt-10">
        <div className="mx-auto flex w-[min(calc(100%-2rem),1280px)] gap-8">
          <AppSidebar />
          <div className="min-w-0 flex-1 space-y-8">
            <StudentDashboard />
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
