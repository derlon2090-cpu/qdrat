"use client";

import Link from "next/link";
import { ArrowLeft, BarChart3, ClipboardList, FileText, TriangleAlert } from "lucide-react";

import { StudentAccessCard } from "@/components/student-access-card";
import {
  StudentPortalErrorCard,
  StudentPortalLoadingCard,
  StudentPlanSetupNotice,
  formatDaysLeft,
  formatLastActivity,
  planTypeLabels,
  pressureConfig,
} from "@/components/student-portal-shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useStudentPortal } from "@/hooks/use-student-portal";

const performanceCards = [
  {
    key: "progress",
    label: "التقدم الكلي",
    tone: "bg-[#eef4ff] text-[#123B7A]",
  },
  {
    key: "mistakes",
    label: "إجمالي الأخطاء",
    tone: "bg-[#fff4f4] text-[#c2410c]",
  },
  {
    key: "summaries",
    label: "الملخصات المحفوظة",
    tone: "bg-[#edfdf3] text-[#2f855a]",
  },
  {
    key: "days",
    label: "الأيام المتبقية",
    tone: "bg-[#f5f3ff] text-[#7c3aed]",
  },
] as const;

export function StudentStatistics() {
  const { status, user } = useAuthSession();
  const { status: portalStatus, data, error, refresh } = useStudentPortal(status === "authenticated");

  if (status === "loading") {
    return <StudentPortalLoadingCard label="جارٍ تجهيز الإحصائيات..." />;
  }

  if (status !== "authenticated" || !user) {
    return (
      <StudentAccessCard
        title="صفحة الإحصائيات مرتبطة بحسابك"
        description="يجب تسجيل الدخول أولًا لعرض تقدمك الحقيقي في الكمي واللفظي، وعدد أخطائك، وآخر نشاط لك داخل المنصة."
        next="/statistics"
      />
    );
  }

  if (portalStatus === "loading" || portalStatus === "idle") {
    return <StudentPortalLoadingCard label="جارٍ تحميل بيانات الإحصائيات..." />;
  }

  if (portalStatus === "error" || !data) {
    return <StudentPortalErrorCard message={error ?? "تعذر تحميل الإحصائيات."} onRetry={() => void refresh()} />;
  }

  const pressure = pressureConfig[data.planPressure];
  const cards = {
    progress: `${data.progressPercent}%`,
    mistakes: `${data.totalMistakes}`,
    summaries: `${data.summariesCount}`,
    days: formatDaysLeft(data.daysLeft),
  };

  return (
    <div className="space-y-6">
      <StudentPlanSetupNotice onboardingCompleted={data.onboardingCompleted} />

      <Card className="surface-dark border-0">
        <CardContent className="space-y-5 p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Badge className="bg-white/10 text-white">الإحصائيات</Badge>
              <h2 className="mt-4 display-font text-4xl font-bold text-white">مؤشرات واضحة تساعدك على القرار التالي</h2>
              <p className="mt-3 max-w-3xl text-sm leading-8 text-white/78">
                هنا تجد صورة سريعة عن مستوى التقدم، ونسبة الإنجاز، والضغط الحالي على الخطة، وهل الوقت المتبقي
                يحتاج مراجعة أكثر أو استمرارًا على نفس الإيقاع.
              </p>
            </div>
            <div className={`rounded-full border px-4 py-2 text-sm font-bold ${pressure.className}`}>
              {pressure.label}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            {performanceCards.map((item) => (
              <div key={item.key} className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 text-white">
                <div className="text-sm text-white/60">{item.label}</div>
                <div className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-bold ${item.tone}`}>
                  {cards[item.key]}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.02fr,0.98fr]">
        <Card className="rounded-[2rem] border-white/80 bg-white/96 shadow-soft">
          <CardContent className="space-y-6 p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[1.1rem] bg-[#eef4ff] text-[#123B7A]">
                <BarChart3 className="h-6 w-6" />
              </div>
              <div>
                <p className="section-eyebrow text-[#123B7A]">التقدم</p>
                <h3 className="display-font text-2xl font-bold text-slate-950">الكمي واللفظي تحت عينك</h3>
              </div>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
                  <span>الكمي</span>
                  <span>{data.quantProgressPercent}%</span>
                </div>
                <Progress value={data.quantProgressPercent} />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
                  <span>اللفظي</span>
                  <span>{data.verbalProgressPercent}%</span>
                </div>
                <Progress value={data.verbalProgressPercent} />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4">
                  <div className="text-xs font-semibold text-slate-500">خطة الدراسة</div>
                  <div className="mt-2 display-font text-2xl font-bold text-slate-950">{planTypeLabels[data.planType]}</div>
                </div>
                <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4">
                  <div className="text-xs font-semibold text-slate-500">آخر نشاط</div>
                  <div className="mt-2 text-base font-bold text-slate-950">{formatLastActivity(data.lastActivityAt)}</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-white/80 bg-white/96 shadow-soft">
          <CardContent className="space-y-6 p-8">
            <div>
              <p className="section-eyebrow text-[#123B7A]">ملخص الأداء</p>
              <h3 className="display-font text-2xl font-bold text-slate-950">أين تركز الآن؟</h3>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4">
                <div className="text-xs font-semibold text-slate-500">أخطاء الكمي</div>
                <div className="mt-2 display-font text-2xl font-bold text-slate-950">{data.quantitativeMistakes}</div>
              </div>
              <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4">
                <div className="text-xs font-semibold text-slate-500">أخطاء اللفظي</div>
                <div className="mt-2 display-font text-2xl font-bold text-slate-950">{data.verbalMistakes}</div>
              </div>
              <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4">
                <div className="text-xs font-semibold text-slate-500">ساعات الدراسة اليومية</div>
                <div className="mt-2 display-font text-2xl font-bold text-slate-950">{data.dailyStudyHours} س</div>
              </div>
              <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4">
                <div className="text-xs font-semibold text-slate-500">ملاحظات هذا الأسبوع</div>
                <div className="mt-2 display-font text-2xl font-bold text-slate-950">{data.weeklyGoal.mistakesReview}</div>
              </div>
            </div>

            <div className="space-y-3">
              {data.recommendations.map((item) => (
                <div key={item} className="rounded-[1.4rem] border border-slate-200 bg-white p-4 text-sm leading-8 text-slate-600">
                  {item}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[2rem] border-white/80 bg-white/96 shadow-soft">
        <CardContent className="space-y-5 p-8">
          <div>
            <p className="section-eyebrow text-[#123B7A]">الانتقال السريع</p>
            <h3 className="display-font text-2xl font-bold text-slate-950">حوّل الأرقام إلى خطوة عملية</h3>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <Link href="/question-bank?track=mistakes" className="rounded-[1.4rem] border border-slate-200 bg-slate-50/70 p-4 transition hover:border-[#d7e3f7] hover:bg-white">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#fff1f2] text-rose-600">
                  <TriangleAlert className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-950">مراجعة الأخطاء</div>
                  <div className="text-xs leading-6 text-slate-500">ابدأ بما يكرر نفسه</div>
                </div>
              </div>
            </Link>

            <Link href="/my-plan" className="rounded-[1.4rem] border border-slate-200 bg-slate-50/70 p-4 transition hover:border-[#d7e3f7] hover:bg-white">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#eef4ff] text-[#123B7A]">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-950">عدّل الخطة</div>
                  <div className="text-xs leading-6 text-slate-500">إذا تأخرت أو تغيّر وقتك</div>
                </div>
              </div>
            </Link>

            <Link href="/summaries" className="rounded-[1.4rem] border border-slate-200 bg-slate-50/70 p-4 transition hover:border-[#d7e3f7] hover:bg-white">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#edfdf3] text-[#2f855a]">
                  <FileText className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-950">راجع الملخصات</div>
                  <div className="text-xs leading-6 text-slate-500">استكمل ملفاتك المحفوظة</div>
                </div>
              </div>
            </Link>

            <Link href="/dashboard" className="rounded-[1.4rem] border border-slate-200 bg-slate-50/70 p-4 transition hover:border-[#d7e3f7] hover:bg-white">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#f5f3ff] text-[#7c3aed]">
                  <ArrowLeft className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-950">العودة للوحة الطالب</div>
                  <div className="text-xs leading-6 text-slate-500">مهام اليوم وآخر نشاط</div>
                </div>
              </div>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
