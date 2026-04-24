"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  BookText,
  Calculator,
  CalendarDays,
  ChartSpline,
  CheckCheck,
  ChevronDown,
  ClipboardList,
  Clock3,
  FileText,
  NotebookPen,
  Sparkles,
  Target,
  TriangleAlert,
} from "lucide-react";

import { StudentAccessCard } from "@/components/student-access-card";
import { StudentPlanSetupNotice, formatDaysLeft } from "@/components/student-portal-shared";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useStudentPortal } from "@/hooks/use-student-portal";
import type { StudentPortalTask } from "@/lib/student-portal";
import { cn } from "@/lib/utils";

function HeroArtwork() {
  return (
    <div className="relative h-[280px] overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_30%_35%,rgba(255,255,255,0.95),transparent_46%),linear-gradient(180deg,#eef5ff_0%,#f7fbff_100%)]">
      <div className="absolute inset-0 opacity-80">
        <div className="absolute left-6 top-14 h-5 w-5 rounded-full bg-[#dbe8ff]" />
        <div className="absolute left-20 bottom-10 h-20 w-20 rounded-full bg-[#edf4ff]" />
        <div className="absolute right-16 top-12 h-6 w-6 rounded-full bg-[#e7f0ff]" />
        <div className="absolute right-32 bottom-8 h-24 w-24 rounded-full bg-white/70 blur-sm" />
      </div>

      <svg viewBox="0 0 600 260" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="barsBlue" x1="0%" x2="0%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#79AFFF" />
            <stop offset="100%" stopColor="#2E6AE6" />
          </linearGradient>
          <linearGradient id="floorLine" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#d8e7ff" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#9cbfff" stopOpacity="0.9" />
          </linearGradient>
        </defs>

        <path
          d="M80 198C180 198 270 194 340 188C410 182 470 182 522 188"
          fill="none"
          stroke="url(#floorLine)"
          strokeLinecap="round"
          strokeWidth="8"
        />

        <path
          d="M110 150C170 76 266 44 408 42"
          fill="none"
          stroke="#ffffff"
          strokeLinecap="round"
          strokeOpacity="0.95"
          strokeWidth="7"
        />
        <path d="M392 30L416 42L396 58" fill="#ffffff" fillOpacity="0.95" />

        <g transform="translate(190 100)">
          <rect x="0" y="78" width="42" height="72" rx="10" fill="url(#barsBlue)" />
          <rect x="52" y="60" width="42" height="90" rx="10" fill="url(#barsBlue)" />
          <rect x="104" y="40" width="42" height="110" rx="10" fill="url(#barsBlue)" />
          <rect x="156" y="18" width="42" height="132" rx="10" fill="url(#barsBlue)" />
          <rect x="208" y="-16" width="42" height="166" rx="10" fill="url(#barsBlue)" />
        </g>

        <g transform="translate(106 164)">
          <circle cx="0" cy="0" r="45" fill="#f7fbff" stroke="#6EA1FF" strokeWidth="10" />
          <circle cx="0" cy="0" r="27" fill="#ffffff" stroke="#A8C5FF" strokeWidth="8" />
          <circle cx="0" cy="0" r="10" fill="#2E6AE6" />
          <path d="M-22 -56L6 -9" stroke="#2E6AE6" strokeLinecap="round" strokeWidth="8" />
          <path d="M6 -9L19 -31" stroke="#2E6AE6" strokeLinecap="round" strokeWidth="8" />
          <circle cx="6" cy="-9" r="8" fill="#2E6AE6" />
        </g>

        <g transform="translate(30 166)">
          <rect x="0" y="18" width="18" height="56" rx="8" fill="#8cc6a9" />
          <ellipse cx="9" cy="84" rx="26" ry="5" fill="#cde2ff" />
          <path
            d="M7 10C2 2 7 -12 20 -14C26 -26 42 -25 47 -11C59 -11 65 3 57 14C52 22 45 24 38 24H18C13 24 10 20 7 10Z"
            fill="#65bda0"
          />
        </g>
      </svg>
    </div>
  );
}

function DashboardMetricCard({
  title,
  value,
  caption,
  progress,
  tone,
  icon: Icon,
}: {
  title: string;
  value: string;
  caption: string;
  progress: number;
  tone: "blue" | "green" | "amber" | "purple";
  icon: typeof Calculator;
}) {
  const styles = {
    blue: {
      iconWrap: "bg-[#eef4ff] text-[#2563eb]",
      bar: "bg-[linear-gradient(90deg,#60a5fa,#2563eb)]",
    },
    green: {
      iconWrap: "bg-[#eaf8ef] text-[#22c55e]",
      bar: "bg-[linear-gradient(90deg,#4ade80,#22c55e)]",
    },
    amber: {
      iconWrap: "bg-[#fff4df] text-[#f59e0b]",
      bar: "bg-[linear-gradient(90deg,#fdba74,#f59e0b)]",
    },
    purple: {
      iconWrap: "bg-[#f4ebff] text-[#8b5cf6]",
      bar: "bg-[linear-gradient(90deg,#a78bfa,#8b5cf6)]",
    },
  } as const;

  const current = styles[tone];

  return (
    <div className="rounded-[1.6rem] border border-[#e6edf9] bg-white p-5 shadow-[0_14px_32px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-bold text-slate-700">{title}</div>
          <div className="mt-3 display-font text-[2rem] font-extrabold text-slate-950">{value}</div>
          <div className="mt-2 text-sm text-slate-500">{caption}</div>
        </div>
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-[1rem]", current.iconWrap)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 h-1.5 rounded-full bg-slate-100">
        <div
          className={cn("h-full rounded-full", current.bar)}
          style={{ width: `${Math.max(10, Math.min(progress, 100))}%` }}
        />
      </div>
    </div>
  );
}

function QuickAccessCard({
  href,
  title,
  description,
  action,
  icon: Icon,
  iconWrap,
  surface,
}: {
  href: string;
  title: string;
  description: string;
  action: string;
  icon: typeof BookOpen;
  iconWrap: string;
  surface: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-[1.6rem] border p-5 shadow-[0_14px_32px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_34px_rgba(15,23,42,0.08)]",
        surface,
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <div className="display-font text-xl font-bold text-slate-950">{title}</div>
          <div className="mt-1 text-sm leading-7 text-slate-500">{description}</div>
          <div className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-[#2563eb]">
            <ArrowLeft className="h-4 w-4" />
            {action}
          </div>
        </div>
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-[1rem]", iconWrap)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Link>
  );
}

function taskKindLabel(kind: StudentPortalTask["taskKind"]) {
  switch (kind) {
    case "diagnostic":
      return "تشخيص";
    case "review":
      return "مراجعة";
    case "mock_exam":
      return "نموذج";
    case "practice":
    default:
      return "تدريب";
  }
}

function taskHref(task: StudentPortalTask) {
  if (task.taskKind === "mock_exam") return "/paper-models";
  if (task.taskKind === "review") return "/question-bank?track=mistakes";
  if (task.taskKind === "diagnostic") return "/diagnostic";
  return "/question-bank";
}

function taskMeta(task: StudentPortalTask) {
  if (task.taskKind === "review") {
    return {
      icon: TriangleAlert,
      iconWrap: "bg-[#fff2ee] text-[#ef4444]",
      subtitle: task.description || "مراجعة الأخطاء الشائعة",
    };
  }

  if (task.taskKind === "mock_exam") {
    return {
      icon: NotebookPen,
      iconWrap: "bg-[#eef3ff] text-[#2563eb]",
      subtitle: task.description || "تدريب محاكي للاختبار",
    };
  }

  if (task.taskKind === "diagnostic") {
    return {
      icon: ClipboardList,
      iconWrap: "bg-[#f4ebff] text-[#8b5cf6]",
      subtitle: task.description || "قياس المستوى الحالي",
    };
  }

  if ((task.title || "").includes("ملخص")) {
    return {
      icon: FileText,
      iconWrap: "bg-[#fff4df] text-[#f59e0b]",
      subtitle: task.description || "ملخصات اليوم",
    };
  }

  return {
    icon: BookOpen,
    iconWrap: "bg-[#eaf8ef] text-[#22c55e]",
    subtitle: task.description || "الاستيعاب المقروء",
  };
}

function minutesLabel(minutes: number | null) {
  if (!minutes) return "-";
  return `${minutes} دقيقة`;
}

function StudentDashboardFallback({
  loading,
  onRetry,
}: {
  loading: boolean;
  onRetry: () => void;
}) {
  return (
    <div className="rounded-[2rem] border border-[#e6edf9] bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.05)] sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row-reverse lg:items-center">
        <div className="flex-1">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d7e5ff] bg-[#eef4ff] px-4 py-1.5 text-sm font-bold text-[#2563eb]">
            <Sparkles className="h-4 w-4" />
            لوحة التحكم
          </div>
          <h2 className="mt-4 display-font text-[clamp(1.9rem,4vw,3.2rem)] font-extrabold leading-[1.15] text-slate-950">
            {loading ? "نجهّز لك لوحة التحكم الآن" : "تعذر تحميل اللوحة الآن"}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-8 text-slate-600 sm:text-base">
            {loading
              ? "يتم الآن تجهيز بيانات الخطة اليومية، تقدمك داخل الأقسام، وآخر نشاطاتك حتى تظهر اللوحة كاملة بشكل مرتب."
              : "يمكنك إعادة المحاولة الآن، أو متابعة الخطة اليومية وبنك الأسئلة حتى تعود بيانات اللوحة للعمل من جديد."}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex h-12 items-center gap-2 rounded-[1.1rem] bg-[#2563eb] px-5 text-sm font-bold text-white shadow-[0_14px_26px_rgba(37,99,235,0.25)]"
            >
              <Sparkles className="h-4 w-4" />
              {loading ? "تحديث البيانات" : "إعادة المحاولة"}
            </button>
            <Link
              href="/my-plan"
              className="inline-flex h-12 items-center rounded-[1.1rem] border border-[#d7e5ff] bg-white px-5 text-sm font-bold text-[#2563eb]"
            >
              الذهاب إلى الخطة
            </Link>
            <Link
              href="/question-bank"
              className="inline-flex h-12 items-center rounded-[1.1rem] border border-[#d7e5ff] bg-white px-5 text-sm font-bold text-[#2563eb]"
            >
              فتح بنك الأسئلة
            </Link>
          </div>
        </div>

        <div className="lg:w-[48%]">
          <HeroArtwork />
        </div>
      </div>
    </div>
  );
}

export function StudentDashboard() {
  const { status, user } = useAuthSession();
  const { status: portalStatus, data, refresh } = useStudentPortal(status === "authenticated");

  if (status === "loading") {
    return <StudentDashboardFallback loading onRetry={() => void refresh()} />;
  }

  if (status !== "authenticated" || !user) {
    return (
      <StudentAccessCard
        title="لوحة التحكم مرتبطة بحسابك"
        description="سجل دخولك أولًا حتى تظهر لك خطة اليوم، التقدم الكمي واللفظي، بنك الأسئلة، والملخصات داخل لوحة واحدة واضحة."
        next="/dashboard"
      />
    );
  }

  if ((portalStatus === "loading" || portalStatus === "idle") && !data) {
    return <StudentDashboardFallback loading onRetry={() => void refresh()} />;
  }

  if (!data || portalStatus === "error") {
    return <StudentDashboardFallback loading={false} onRetry={() => void refresh()} />;
  }

  const todayTasks = Array.isArray(data.todayTasks) ? data.todayTasks.slice(0, 4) : [];
  const completedToday = todayTasks.filter((task) => task.isCompleted).length;
  const planProgress = todayTasks.length ? Math.round((completedToday / todayTasks.length) * 100) : 0;
  const estimatedTotalMinutes = todayTasks.reduce((sum, task) => sum + (task.estimatedMinutes ?? 0), 0);
  const recommendation =
    Array.isArray(data.recommendations) && data.recommendations[0]
      ? data.recommendations[0]
      : "الاستمرارية هي مفتاح النجاح، خصص وقتًا ثابتًا يوميًا وتقدم خطوة بخطوة نحو هدفك.";

  const questionRows = [
    {
      title: "الاستيعاب المقروء",
      total: 399,
      solved: Math.max(12, Math.round((data.verbalProgressPercent / 100) * 399)),
      progress: Math.max(10, Math.round(data.verbalProgressPercent * 0.46)),
      lastSolved: "منذ يوم",
      href: "/question-bank?track=verbal",
      icon: BookOpen,
      iconWrap: "bg-[#eaf8ef] text-[#22c55e]",
      bar: "bg-[linear-gradient(90deg,#4ade80,#22c55e)]",
    },
    {
      title: "إكمال الجمل",
      total: 250,
      solved: Math.max(10, Math.round((data.verbalProgressPercent / 100) * 250)),
      progress: Math.max(10, Math.round(data.verbalProgressPercent * 0.48)),
      lastSolved: "منذ 2 يوم",
      href: "/question-bank?track=verbal",
      icon: FileText,
      iconWrap: "bg-[#eef4ff] text-[#3b82f6]",
      bar: "bg-[linear-gradient(90deg,#60a5fa,#3b82f6)]",
    },
    {
      title: "المفردة الشاذة",
      total: 200,
      solved: Math.max(8, Math.round((data.verbalProgressPercent / 100) * 200)),
      progress: Math.max(8, Math.round(data.verbalProgressPercent * 0.33)),
      lastSolved: "منذ 3 يوم",
      href: "/question-bank?track=verbal",
      icon: Sparkles,
      iconWrap: "bg-[#f4ebff] text-[#8b5cf6]",
      bar: "bg-[linear-gradient(90deg,#a78bfa,#8b5cf6)]",
    },
    {
      title: "التناظر اللفظي",
      total: 180,
      solved: Math.max(8, Math.round((data.verbalProgressPercent / 100) * 180)),
      progress: Math.max(8, Math.round(data.verbalProgressPercent * 0.4)),
      lastSolved: "منذ يوم",
      href: "/question-bank?track=verbal",
      icon: BookText,
      iconWrap: "bg-[#fff4df] text-[#f59e0b]",
      bar: "bg-[linear-gradient(90deg,#fdba74,#f97316)]",
    },
  ];

  const quickCards = [
    {
      href: "/statistics",
      title: "الإحصائيات",
      description: "تتبع تقدمك ومستوى أدائك",
      action: "عرض الإحصائيات",
      icon: BarChart3,
      iconWrap: "bg-[#f4ebff] text-[#8b5cf6]",
      surface: "border-[#eadcff] bg-[#fbf9ff]",
    },
    {
      href: "/question-bank?track=mistakes",
      title: "الأخطاء",
      description: `تعلم من أخطائك السابقة${data.activeMistakesCount ? ` (${data.activeMistakesCount})` : ""}`,
      action: "مراجعة الأخطاء",
      icon: TriangleAlert,
      iconWrap: "bg-[#fff4df] text-[#f59e0b]",
      surface: "border-[#f6e1c5] bg-[#fffaf4]",
    },
    {
      href: "/summaries",
      title: "الملخصات",
      description: "مراجعة سريعة لأهم النقاط",
      action: "عرض الملخصات",
      icon: FileText,
      iconWrap: "bg-[#eef4ff] text-[#2563eb]",
      surface: "border-[#dbe7ff] bg-[#f8fbff]",
    },
    {
      href: "/question-bank",
      title: "بنك الأسئلة",
      description: "تدرب على آلاف الأسئلة",
      action: "ابدأ الآن",
      icon: BookOpen,
      iconWrap: "bg-[#eaf8ef] text-[#22c55e]",
      surface: "border-[#d9f0e4] bg-[#f7fdf9]",
    },
  ];

  return (
    <div className="space-y-6 pb-10">
      {!data.onboardingCompleted ? (
        <div className="rounded-[1.6rem] border border-[#e6edf9] bg-white p-4 shadow-[0_14px_32px_rgba(15,23,42,0.04)]">
          <StudentPlanSetupNotice onboardingCompleted={data.onboardingCompleted} />
        </div>
      ) : null}

      <section className="rounded-[2rem] border border-[#dfe8f7] bg-[linear-gradient(180deg,#f4f8ff_0%,#f8fbff_100%)] p-5 shadow-[0_18px_42px_rgba(15,23,42,0.05)] sm:p-6 lg:p-7">
        <div className="flex flex-col gap-6 lg:flex-row-reverse lg:items-center lg:gap-10">
          <div className="flex-1">
            <div className="text-[1.7rem] font-bold text-slate-950 sm:text-[2rem]">
              مرحبًا بك! <span className="mr-1">👋</span>
            </div>
            <h2 className="mt-5 display-font text-[clamp(2.3rem,4.2vw,4rem)] font-extrabold leading-[1.15] text-slate-950">
              استمر في رحلتك نحو التميز
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-slate-500">
              خطة مخصصة لك لتحقيق أفضل النتائج في اختبار القدرات.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Link
                href="/my-plan"
                className="inline-flex h-[72px] min-w-[240px] items-center justify-center gap-3 rounded-[1.15rem] bg-[#2563eb] px-8 text-[1.05rem] font-bold text-white shadow-[0_14px_26px_rgba(37,99,235,0.25)] transition hover:bg-[#1d4ed8]"
              >
                <CalendarDays className="h-5 w-5" />
                متابعة الخطة
              </Link>
              <Link
                href="/question-bank"
                className="inline-flex h-[72px] min-w-[240px] items-center justify-center gap-3 rounded-[1.15rem] border border-[#bfd3ff] bg-white px-8 text-[1.05rem] font-bold text-[#2563eb] transition hover:bg-[#f8fbff]"
              >
                <BookOpen className="h-5 w-5" />
                بنك الأسئلة
              </Link>
            </div>
          </div>

          <div className="lg:w-[48%]">
            <HeroArtwork />
          </div>
        </div>
      </section>

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <DashboardMetricCard
          title="التقدم الكمي"
          value={`${data.quantProgressPercent}%`}
          caption="متوسط أدائك"
          progress={data.quantProgressPercent}
          tone="blue"
          icon={Calculator}
        />
        <DashboardMetricCard
          title="التقدم اللفظي"
          value={`${data.verbalProgressPercent}%`}
          caption="متوسط أدائك"
          progress={data.verbalProgressPercent}
          tone="green"
          icon={ChartSpline}
        />
        <DashboardMetricCard
          title="الأيام المتبقية"
          value={formatDaysLeft(data.daysLeft)}
          caption="للاختبار القدرات"
          progress={Math.max(12, 100 - Math.min(data.daysLeft ?? 90, 90))}
          tone="amber"
          icon={CalendarDays}
        />
        <DashboardMetricCard
          title="المهام اليوم"
          value={`${completedToday} / ${todayTasks.length || 0}`}
          caption={`تم إنجاز ${completedToday} من ${todayTasks.length || 0} مهام`}
          progress={planProgress}
          tone="purple"
          icon={ClipboardList}
        />
      </section>

      <section className="rounded-[2rem] border border-[#e6edf9] bg-white shadow-[0_18px_42px_rgba(15,23,42,0.05)]">
        <div className="flex items-center justify-between gap-3 border-b border-[#edf2fa] px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#eef4ff] text-[#2563eb]">
              <CalendarDays className="h-5 w-5" />
            </div>
            <div>
              <div className="display-font text-2xl font-bold text-slate-950">خطة اليوم</div>
            </div>
          </div>

          <Link href="/my-plan" className="inline-flex items-center gap-2 text-sm font-bold text-[#2563eb]">
            عرض الخطة الكاملة
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </div>

        <div className="px-5 pb-4 pt-3 sm:px-6">
          <div className="hidden rounded-[1.15rem] bg-[#f8fbff] px-4 py-3 text-sm font-bold text-slate-500 md:grid md:grid-cols-[140px_150px_minmax(0,1.7fr)]">
            <div>الحالة</div>
            <div>الوقت المتوقع</div>
            <div className="text-right">المهمة</div>
          </div>

          <div className="mt-3 space-y-2.5">
            {todayTasks.length ? (
              todayTasks.map((task) => {
                const meta = taskMeta(task);
                const Icon = meta.icon;

                return (
                  <div
                    key={task.id}
                    className="rounded-[1.15rem] border border-[#edf2fa] bg-white px-4 py-3 shadow-[0_8px_22px_rgba(15,23,42,0.03)] md:grid md:grid-cols-[140px_150px_minmax(0,1.7fr)] md:items-center"
                  >
                    <div className="flex items-center justify-start md:justify-center">
                      {task.isCompleted ? (
                        <span className="inline-flex items-center gap-2 rounded-[0.95rem] border border-[#cbeed9] bg-[#eefaf4] px-4 py-2 text-sm font-bold text-[#16a34a]">
                          <CheckCheck className="h-4 w-4" />
                          تم الإنجاز
                        </span>
                      ) : (
                        <Link
                          href={taskHref(task)}
                          className="inline-flex h-11 items-center justify-center rounded-[0.95rem] border border-[#bfd3ff] bg-white px-5 text-sm font-bold text-[#2563eb] transition hover:bg-[#f8fbff]"
                        >
                          ابدأ الآن
                        </Link>
                      )}
                    </div>

                    <div className="mt-3 text-sm font-semibold text-slate-500 md:mt-0 md:text-center">
                      {minutesLabel(task.estimatedMinutes)}
                    </div>

                    <div className="mt-4 flex items-center gap-3 md:mt-0 md:justify-end">
                      <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem]", meta.iconWrap)}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 text-right">
                        <div className="text-base font-bold text-slate-900">{task.title}</div>
                        <div className="mt-1 text-sm text-slate-500">{meta.subtitle}</div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-[1.4rem] border border-dashed border-[#dbe7ff] bg-[#f8fbff] px-5 py-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-[#2563eb] shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                  <CalendarDays className="h-5 w-5" />
                </div>
                <div className="mt-4 display-font text-2xl font-bold text-slate-950">لا توجد مهام اليوم</div>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  افتح الخطة اليومية لتوليد مهامك أو إعادة توزيعها لهذا اليوم.
                </p>
              </div>
            )}
          </div>

          <div className="mt-5 flex flex-col gap-4 border-t border-[#edf2fa] pt-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Clock3 className="h-4 w-4 text-slate-400" />
              إجمالي الوقت المتوقع: {estimatedTotalMinutes || 0} دقيقة
            </div>

            <div className="flex items-center gap-4 sm:min-w-[320px]">
              <span className="text-sm font-bold text-slate-500">نسبة إنجاز الخطة</span>
              <div className="h-2 flex-1 rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#93c5fd,#2563eb)]"
                  style={{ width: `${Math.max(8, planProgress)}%` }}
                />
              </div>
              <span className="text-sm font-bold text-slate-700">{planProgress}%</span>
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-[#e6edf9] bg-white shadow-[0_18px_42px_rgba(15,23,42,0.05)]">
        <div className="flex items-center justify-between gap-3 border-b border-[#edf2fa] px-5 py-4 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#eef4ff] text-[#2563eb]">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <div className="display-font text-2xl font-bold text-slate-950">بنك الأسئلة</div>
            </div>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full border border-[#e6edf9] bg-white px-4 py-2 text-sm font-bold text-slate-500"
          >
            المزيد
            <ChevronDown className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 pb-5 pt-4 sm:px-6">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full max-w-[360px]">
              <input
                type="search"
                placeholder="ابحث في بنك الأسئلة..."
                className="h-12 w-full rounded-[1rem] border border-[#e6edf9] bg-white px-4 pr-11 text-sm font-medium text-slate-700 outline-none transition focus:border-[#bfd3ff]"
              />
              <BookText className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            </div>

            <div className="flex flex-wrap gap-2">
              {["الكل", "اللفظي", "الكمي"].map((label, index) => (
                <button
                  key={label}
                  type="button"
                  className={cn(
                    "inline-flex h-11 items-center rounded-[0.95rem] border px-4 text-sm font-bold transition",
                    index === 0
                      ? "border-[#d7e5ff] bg-[#f8fbff] text-[#2563eb]"
                      : "border-[#e6edf9] bg-white text-slate-600 hover:bg-[#f8fbff]",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden rounded-[1.15rem] bg-[#f8fbff] px-4 py-3 text-sm font-bold text-slate-500 lg:grid lg:grid-cols-[140px_120px_140px_120px_120px_minmax(0,1.8fr)]">
            <div>إجراء</div>
            <div>آخر حل</div>
            <div>نسبة الإنجاز</div>
            <div>تم الحل</div>
            <div>عدد الأسئلة</div>
            <div className="text-right">القسم</div>
          </div>

          <div className="space-y-2.5">
            {questionRows.map((row) => {
              const Icon = row.icon;
              return (
                <div
                  key={row.title}
                  className="rounded-[1.15rem] border border-[#edf2fa] bg-white px-4 py-3 shadow-[0_8px_22px_rgba(15,23,42,0.03)] lg:grid lg:grid-cols-[140px_120px_140px_120px_120px_minmax(0,1.8fr)] lg:items-center"
                >
                  <div className="flex items-center lg:justify-start">
                    <Link
                      href={row.href}
                      className="inline-flex h-11 items-center justify-center rounded-[0.95rem] border border-[#d7e5ff] bg-white px-5 text-sm font-bold text-[#2563eb] transition hover:bg-[#f8fbff]"
                    >
                      ابدأ الحل
                    </Link>
                  </div>

                  <div className="mt-3 text-sm font-semibold text-slate-500 lg:mt-0">{row.lastSolved}</div>

                  <div className="mt-3 flex items-center gap-3 lg:mt-0">
                    <span className="text-sm font-bold text-slate-700">{row.progress}%</span>
                    <div className="h-2 flex-1 rounded-full bg-slate-100">
                      <div className={cn("h-full rounded-full", row.bar)} style={{ width: `${row.progress}%` }} />
                    </div>
                  </div>

                  <div className="mt-3 text-sm font-semibold text-slate-700 lg:mt-0">{row.solved}</div>
                  <div className="mt-3 text-sm font-semibold text-slate-700 lg:mt-0">{row.total}</div>

                  <div className="mt-4 flex items-center gap-3 lg:mt-0 lg:justify-end">
                    <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem]", row.iconWrap)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-slate-900">{row.title}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-center pt-1">
            <Link href="/question-bank" className="inline-flex items-center gap-2 text-sm font-bold text-[#2563eb]">
              عرض المزيد من الأقسام
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4 text-right display-font text-3xl font-bold text-slate-950">الوصول السريع</div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {quickCards.map((card) => (
            <QuickAccessCard key={card.title} {...card} />
          ))}
        </div>
      </section>

      <section className="rounded-[1.7rem] border border-[#dbe7ff] bg-[linear-gradient(180deg,#f7fbff_0%,#f3f8ff_100%)] px-5 py-5 shadow-[0_14px_32px_rgba(15,23,42,0.04)] sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef4ff] text-[#2563eb]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="text-lg font-extrabold text-[#2563eb]">نصيحة اليوم</div>
              <div className="mt-1 text-sm leading-7 text-slate-600">{recommendation}</div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-slate-500 shadow-[0_8px_20px_rgba(15,23,42,0.04)]">
            <Target className="h-4 w-4 text-[#2563eb]" />
            خصص وقتًا ثابتًا يوميًا وتقدم خطوة بخطوة نحو هدفك.
          </div>
        </div>
      </section>
    </div>
  );
}
