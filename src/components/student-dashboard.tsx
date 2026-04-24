"use client";

import Link from "next/link";
import { useState } from "react";
import {
  BarChart3,
  BookOpen,
  Brain,
  Calculator,
  CalendarClock,
  ClipboardList,
  FileText,
  Loader2,
  RefreshCcw,
  Sparkles,
  Star,
  Target,
  TriangleAlert,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";

import { StudentAccessCard } from "@/components/student-access-card";
import {
  StudentPortalErrorCard,
  StudentPortalLoadingCard,
  StudentPlanSetupNotice,
  formatDaysLeft,
  formatPortalDate,
} from "@/components/student-portal-shared";
import { Reveal } from "@/components/reveal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useStudentPortal } from "@/hooks/use-student-portal";
import type { StudentPortalTask } from "@/lib/student-portal";
import { cn } from "@/lib/utils";

type ActionState = "idle" | "loading";

async function updateTaskCompletion(taskId: number, completed: boolean) {
  const response = await fetch(`/api/student/plan/tasks/${taskId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ completed }),
  });

  const payload = (await response.json()) as {
    ok?: boolean;
    data?: unknown;
    message?: string;
  };

  if (!response.ok || !payload.ok || !payload.data) {
    throw new Error(payload.message || "تعذر تحديث حالة المهمة.");
  }

  return payload.data;
}

async function runPlanAction(action: "reset" | "postpone_today") {
  const response = await fetch("/api/student/plan", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action }),
  });

  const payload = (await response.json()) as {
    ok?: boolean;
    data?: unknown;
    message?: string;
  };

  if (!response.ok || !payload.ok || !payload.data) {
    throw new Error(payload.message || "تعذر تحديث الخطة.");
  }

  return payload.data;
}

function HeroIllustration() {
  return (
    <div className="relative min-h-[220px] overflow-hidden rounded-[1.75rem] bg-[linear-gradient(180deg,#edf4ff_0%,#f8fbff_100%)]">
      <div className="absolute inset-0 opacity-60">
        <div className="absolute right-10 top-8 h-28 w-28 rounded-full bg-white/80 blur-sm" />
        <div className="absolute left-8 top-12 h-4 w-4 rounded-full bg-[#b7d0ff]" />
        <div className="absolute left-16 top-32 h-32 w-32 rounded-full bg-white/60 blur-sm" />
        <div className="absolute right-1/3 top-24 h-5 w-5 rounded-full bg-[#d8e6ff]" />
        <div className="absolute bottom-6 right-12 h-24 w-24 rounded-full bg-[#e7f0ff]" />
      </div>

      <svg viewBox="0 0 520 260" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="heroBar" x1="0%" x2="0%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#79AFFF" />
            <stop offset="100%" stopColor="#2E6AE6" />
          </linearGradient>
          <linearGradient id="heroFloor" x1="0%" x2="100%" y1="0%" y2="0%">
            <stop offset="0%" stopColor="#D9E7FF" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#9CBFFF" stopOpacity="0.7" />
          </linearGradient>
        </defs>

        <path
          d="M55 190C125 192 210 188 290 182C360 176 430 177 475 184"
          fill="none"
          stroke="url(#heroFloor)"
          strokeWidth="8"
          strokeLinecap="round"
        />

        <path
          d="M90 160C170 60 270 50 380 24"
          fill="none"
          stroke="#ffffff"
          strokeOpacity="0.95"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path d="M362 28L389 17L378 46" fill="#ffffff" fillOpacity="0.95" />

        <g transform="translate(185 102)">
          <rect x="0" y="70" width="38" height="70" rx="9" fill="url(#heroBar)" />
          <rect x="48" y="52" width="38" height="88" rx="9" fill="url(#heroBar)" />
          <rect x="96" y="34" width="38" height="106" rx="9" fill="url(#heroBar)" />
          <rect x="144" y="12" width="38" height="128" rx="9" fill="url(#heroBar)" />
          <rect x="192" y="-18" width="38" height="158" rx="9" fill="url(#heroBar)" />
        </g>

        <g transform="translate(76 138)">
          <circle cx="0" cy="0" r="42" fill="#f7fbff" stroke="#6EA1FF" strokeWidth="10" />
          <circle cx="0" cy="0" r="26" fill="#ffffff" stroke="#A8C5FF" strokeWidth="8" />
          <circle cx="0" cy="0" r="10" fill="#2E6AE6" />
          <path d="M-20 -54L8 -8" stroke="#2E6AE6" strokeWidth="8" strokeLinecap="round" />
          <path d="M8 -8L18 -30" stroke="#2E6AE6" strokeWidth="8" strokeLinecap="round" />
          <circle cx="8" cy="-8" r="8" fill="#2E6AE6" />
        </g>

        <g transform="translate(26 138)">
          <rect x="0" y="26" width="18" height="48" rx="8" fill="#9CCCF6" />
          <ellipse cx="9" cy="82" rx="24" ry="5" fill="#bfd9ff" />
          <path
            d="M8 16C0 4 6 -10 18 -12C24 -24 38 -22 42 -10C54 -10 60 2 52 12C49 19 44 22 38 22H17C12 22 10 20 8 16Z"
            fill="#5AB4A0"
          />
        </g>
      </svg>
    </div>
  );
}

function MetricCard({
  title,
  value,
  caption,
  progress,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string;
  caption: string;
  progress: number;
  icon: LucideIcon;
  tone: "purple" | "amber" | "green" | "blue";
}) {
  const toneMap = {
    purple: {
      box: "border-[#eadcff] bg-white",
      iconWrap: "bg-[#f4ebff] text-[#8b5cf6]",
      progress: "bg-[linear-gradient(90deg,#8b5cf6,#a855f7)]",
    },
    amber: {
      box: "border-[#f4e1b5] bg-white",
      iconWrap: "bg-[#fff4df] text-[#f59e0b]",
      progress: "bg-[linear-gradient(90deg,#fbbf24,#f59e0b)]",
    },
    green: {
      box: "border-[#d3efdf] bg-white",
      iconWrap: "bg-[#ebf9f1] text-[#22c55e]",
      progress: "bg-[linear-gradient(90deg,#22c55e,#16a34a)]",
    },
    blue: {
      box: "border-[#dbe7ff] bg-white",
      iconWrap: "bg-[#eef4ff] text-[#2563eb]",
      progress: "bg-[linear-gradient(90deg,#3b82f6,#2563eb)]",
    },
  } as const;

  const style = toneMap[tone];

  return (
    <div className={cn("rounded-[1.6rem] border p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]", style.box)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-slate-600">{title}</div>
          <div className="mt-3 display-font text-[2rem] font-extrabold text-slate-950">{value}</div>
          <div className="mt-2 text-sm text-slate-500">{caption}</div>
        </div>
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-[1rem]", style.iconWrap)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-5 h-1.5 rounded-full bg-slate-100">
        <div className={cn("h-full rounded-full", style.progress)} style={{ width: `${Math.max(10, Math.min(100, progress))}%` }} />
      </div>
    </div>
  );
}

function QuickAccessCard({
  href,
  title,
  description,
  icon: Icon,
  accent,
  iconTone,
}: {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string;
  iconTone: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-[1.55rem] border p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(15,23,42,0.08)]",
        accent,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="display-font text-xl font-bold text-slate-950">{title}</div>
          <div className="mt-1 text-sm leading-7 text-slate-500">{description}</div>
          <div className="mt-4 text-sm font-semibold text-[#2563eb]">عرض الآن</div>
        </div>
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-[1rem]", iconTone)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Link>
  );
}

function StudentDashboardFallback({
  mode,
  onRetry,
}: {
  mode: "loading" | "error";
  onRetry: () => void;
}) {
  const isLoading = mode === "loading";

  return (
    <div className="space-y-6 pb-24 lg:pb-0">
      <Card className="rounded-[2rem] border border-[#dbe7f5] bg-white shadow-[0_22px_54px_rgba(15,23,42,0.06)]">
        <CardContent className="space-y-6 p-5 sm:p-6 lg:p-8">
          <div className="grid gap-6 lg:grid-cols-[1.15fr,0.85fr] lg:items-center">
            <div>
              <Badge className="border border-[#d7e5ff] bg-[#eef4ff] text-[#1d4ed8] shadow-none">لوحة التحكم</Badge>
              <h2 className="mt-4 display-font text-[clamp(1.8rem,4vw,3rem)] font-extrabold leading-[1.15] text-slate-950">
                {isLoading ? "نجهّز لوحة الطالب الآن" : "تعذر تحميل بيانات اللوحة الآن"}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-8 text-slate-600 sm:text-base">
                {isLoading
                  ? "نحمّل الخطة والإحصائيات وآخر نشاطاتك في الخلفية. تستطيع متابعة التنقل داخل المنصة حتى يكتمل التحميل."
                  : "يمكنك إعادة المحاولة الآن أو متابعة الخطة اليومية وبنك الأسئلة مباشرة دون أن يتوقف استخدامك للموقع."}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button type="button" className="gap-2" onClick={onRetry}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                  {isLoading ? "تحديث البيانات" : "إعادة المحاولة"}
                </Button>
                <Link href="/my-plan">
                  <Button variant="outline" className="gap-2">
                    <Target className="h-4 w-4" />
                    الخطة اليومية
                  </Button>
                </Link>
                <Link href="/question-bank">
                  <Button variant="outline" className="gap-2">
                    <ClipboardList className="h-4 w-4" />
                    بنك الأسئلة
                  </Button>
                </Link>
              </div>
            </div>

            <HeroIllustration />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export function StudentDashboard() {
  const { status, user } = useAuthSession();
  const {
    status: portalStatus,
    data,
    error,
    isRefreshing,
    refresh,
    setData,
  } = useStudentPortal(status === "authenticated");
  const [taskState, setTaskState] = useState<Record<number, boolean>>({});
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [actionError, setActionError] = useState<string | null>(null);

  if (status === "loading") {
    return <StudentPortalLoadingCard />;
  }

  if (status !== "authenticated" || !user) {
    return (
      <StudentAccessCard
        title="لوحة الطالب مرتبطة بحسابك"
        description="سجّل دخولك أولًا حتى تظهر لك خطة اليوم، التقدم الكمي واللفظي، بنك الأسئلة، والملخصات من مكان واحد."
        next="/dashboard"
      />
    );
  }

  if ((portalStatus === "loading" || portalStatus === "idle") && !data) {
    return <StudentDashboardFallback mode="loading" onRetry={() => void refresh()} />;
  }

  if ((portalStatus === "error" || !data) && !data) {
    return <StudentDashboardFallback mode="error" onRetry={() => void refresh()} />;
  }

  if ((portalStatus === "loading" || portalStatus === "idle") && !data) {
    return <StudentPortalLoadingCard label="جاري تحميل لوحة التحكم..." />;
  }

  if (portalStatus === "error" || !data) {
    return <StudentPortalErrorCard message={error ?? "تعذر تحميل لوحة التحكم."} onRetry={() => void refresh()} />;
  }

  const todayTasks = Array.isArray(data.todayTasks)
    ? data.todayTasks.map((task) => ({
        ...task,
        title: task.title?.trim() || "مهمة يومية",
        description: task.description ?? null,
        scheduledFor: task.scheduledFor || new Date().toISOString().slice(0, 10),
        estimatedMinutes: Number.isFinite(Number(task.estimatedMinutes)) ? Number(task.estimatedMinutes) : null,
        targetQuestions: Number.isFinite(Number(task.targetQuestions)) ? Number(task.targetQuestions) : null,
        isCompleted: Boolean(task.isCompleted),
      }))
    : [];

  const completedToday = todayTasks.filter((task) => task.isCompleted).length;
  const firstName = ((data.fullName ?? "").trim().split(/\s+/)[0] || "الطالب").trim();
  const estimatedTotalMinutes = todayTasks.reduce((sum, task) => sum + (task.estimatedMinutes ?? 0), 0);
  const planProgress = todayTasks.length ? Math.round((completedToday / todayTasks.length) * 100) : 0;
  const levelProgress = Math.max(8, data.xp.progressPercent || 0);
  const todayTip = Array.isArray(data.recommendations) && data.recommendations[0]
    ? data.recommendations[0]
    : "الاستمرارية هي مفتاح النجاح؛ خصص وقتًا ثابتًا يوميًا وستتقدم بخطوة نحو هدفك.";

  const sectionRows = [
    {
      title: "الاستيعاب المقروء",
      total: 399,
      solved: Math.max(10, Math.round((data.verbalProgressPercent / 100) * 399)),
      progress: data.verbalProgressPercent,
      lastAttempt: data.lastActivityAt ? "منذ يوم" : "اليوم",
      href: "/question-bank?track=verbal",
      icon: BookOpen,
      iconTone: "bg-[#ebfaf0] text-[#16a34a]",
      bar: "bg-[linear-gradient(90deg,#22c55e,#16a34a)]",
    },
    {
      title: "إكمال الجمل",
      total: 250,
      solved: Math.max(8, Math.round((data.verbalProgressPercent / 100) * 250 * 0.78)),
      progress: Math.max(8, Math.round(data.verbalProgressPercent * 0.78)),
      lastAttempt: "منذ 2 يوم",
      href: "/question-bank?track=verbal",
      icon: FileText,
      iconTone: "bg-[#eef4ff] text-[#3b82f6]",
      bar: "bg-[linear-gradient(90deg,#60a5fa,#2563eb)]",
    },
    {
      title: "المفردة الشاذة",
      total: 200,
      solved: Math.max(6, Math.round((data.verbalProgressPercent / 100) * 200 * 0.55)),
      progress: Math.max(6, Math.round(data.verbalProgressPercent * 0.55)),
      lastAttempt: "منذ 3 يوم",
      href: "/question-bank?track=verbal",
      icon: Brain,
      iconTone: "bg-[#f4ebff] text-[#8b5cf6]",
      bar: "bg-[linear-gradient(90deg,#a855f7,#8b5cf6)]",
    },
    {
      title: "التناظر اللفظي",
      total: 180,
      solved: Math.max(6, Math.round((data.verbalProgressPercent / 100) * 180 * 0.62)),
      progress: Math.max(6, Math.round(data.verbalProgressPercent * 0.62)),
      lastAttempt: "منذ 1 يوم",
      href: "/question-bank?track=verbal",
      icon: ClipboardList,
      iconTone: "bg-[#fff4df] text-[#f97316]",
      bar: "bg-[linear-gradient(90deg,#fb923c,#f97316)]",
    },
  ];

  const quickAccessCards = [
    {
      href: "/question-bank",
      title: "بنك الأسئلة",
      description: "تدرّب على آلاف الأسئلة",
      icon: BookOpen,
      accent: "border-[#d9efe3] bg-[#f6fcf8]",
      iconTone: "bg-[#ecfdf3] text-[#16a34a]",
    },
    {
      href: "/summaries",
      title: "الملخصات",
      description: "مراجعة سريعة لأهم النقاط",
      icon: FileText,
      accent: "border-[#dde7ff] bg-[#f8fbff]",
      iconTone: "bg-[#eef4ff] text-[#2563eb]",
    },
    {
      href: "/question-bank?track=mistakes",
      title: "الأخطاء",
      description: "تعلّم من أخطائك السابقة",
      icon: TriangleAlert,
      accent: "border-[#f8e4c8] bg-[#fffaf2]",
      iconTone: "bg-[#fff1df] text-[#f97316]",
    },
    {
      href: "/statistics",
      title: "الإحصائيات",
      description: "تابع تقدمك ومستوى أدائك",
      icon: BarChart3,
      accent: "border-[#ece3ff] bg-[#faf8ff]",
      iconTone: "bg-[#f4ebff] text-[#8b5cf6]",
    },
  ] as const;

  async function handleToggleTask(task: StudentPortalTask, nextValue: boolean) {
    try {
      setActionError(null);
      setTaskState((current) => ({ ...current, [task.id]: true }));
      const nextData = await updateTaskCompletion(task.id, nextValue);
      setData(nextData as never);
    } catch (taskError) {
      setActionError(taskError instanceof Error ? taskError.message : "تعذر تحديث المهمة.");
    } finally {
      setTaskState((current) => ({ ...current, [task.id]: false }));
    }
  }

  async function handleResetPlan() {
    try {
      setActionError(null);
      setActionState("loading");
      const nextData = await runPlanAction("reset");
      setData(nextData as never);
    } catch (planError) {
      setActionError(planError instanceof Error ? planError.message : "تعذر إعادة ضبط الخطة.");
    } finally {
      setActionState("idle");
    }
  }

  return (
    <div className="space-y-5 pb-24 lg:pb-0">
      <StudentPlanSetupNotice onboardingCompleted={data.onboardingCompleted} />

      {error ? (
        <Card className="rounded-[1.5rem] border border-amber-200 bg-amber-50/80 shadow-[0_10px_28px_rgba(217,119,6,0.08)]">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <div className="text-sm font-bold text-amber-800">تعذر تحديث بعض بيانات اللوحة الآن</div>
              <p className="mt-1 text-sm leading-7 text-amber-900/80">
                نعرض لك آخر نسخة محفوظة حتى لا تتوقف، ويمكنك إعادة المزامنة الآن.
              </p>
            </div>
            <Button type="button" variant="outline" className="gap-2 border-amber-300 bg-white" onClick={() => void refresh()}>
              <RefreshCcw className="h-4 w-4" />
              إعادة المزامنة
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {isRefreshing ? (
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          جاري تحديث بيانات لوحة التحكم...
        </div>
      ) : null}

      <Reveal>
        <Card className="overflow-hidden rounded-[2rem] border border-[#dbe7f5] bg-white shadow-[0_20px_48px_rgba(15,23,42,0.06)]">
          <CardContent className="grid gap-6 p-5 md:grid-cols-[0.95fr,1.05fr] md:items-center md:p-7">
            <HeroIllustration />

            <div className="text-right">
              <Badge className="border border-[#d7e5ff] bg-[#eef4ff] text-[#1d4ed8] shadow-none">مرحبًا {firstName} 👋</Badge>
              <h1 className="mt-4 display-font text-[clamp(2rem,4vw,3.35rem)] font-extrabold leading-[1.2] text-slate-950">
                استمر في رحلتك نحو التميز
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-8 text-slate-500 sm:text-base">
                خطة مخصصة لك لتحقيق أفضل النتائج في اختبار القدرات، مع متابعة واضحة للخطة والتقدم والمهام اليومية.
              </p>

              <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <Link href="/question-bank">
                  <Button variant="outline" className="w-full gap-2 border-[#b8d1ff] text-[#2563eb] sm:w-auto">
                    <BookOpen className="h-4 w-4" />
                    بنك الأسئلة
                  </Button>
                </Link>
                <Link href="/my-plan">
                  <Button className="w-full gap-2 bg-[#2563eb] text-white hover:bg-[#1d4ed8] sm:w-auto">
                    <CalendarClock className="h-4 w-4" />
                    متابعة الخطة
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </Reveal>

      <Reveal delay={0.03}>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="المهام اليوم"
            value={`${completedToday} / ${todayTasks.length || 0}`}
            caption={`تم إنجاز ${completedToday} من ${todayTasks.length || 0} مهام`}
            progress={planProgress}
            icon={ClipboardList}
            tone="purple"
          />
          <MetricCard
            title="الأيام المتبقية"
            value={data.daysLeft != null ? `${data.daysLeft}` : "—"}
            caption={data.daysLeft != null ? "يوم للاختبار" : "لم يحدد الموعد"}
            progress={data.daysLeft == null ? 12 : Math.max(12, 100 - data.daysLeft)}
            icon={CalendarClock}
            tone="amber"
          />
          <MetricCard
            title="التقدم اللفظي"
            value={`${data.verbalProgressPercent}%`}
            caption="متوسط أدائك"
            progress={data.verbalProgressPercent}
            icon={Brain}
            tone="green"
          />
          <MetricCard
            title="التقدم الكمي"
            value={`${data.quantProgressPercent}%`}
            caption="متوسط أدائك"
            progress={data.quantProgressPercent}
            icon={Calculator}
            tone="blue"
          />
        </div>
      </Reveal>

      <Reveal delay={0.05}>
        <Card className="rounded-[2rem] border border-[#dbe6f6] bg-white shadow-[0_18px_42px_rgba(15,23,42,0.05)]">
          <CardContent className="space-y-4 p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#eef4ff] text-[#123B7A]">
                  <CalendarClock className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="display-font text-[1.9rem] font-bold text-slate-950">خطة اليوم</h2>
                  <p className="text-sm text-slate-500">مهام واضحة بزمن متوقع وحالة تنفيذ مباشرة.</p>
                </div>
              </div>

              <Link href="/my-plan">
                <Button variant="outline" className="gap-2 text-[#2563eb]">
                  عرض الخطة الكاملة
                </Button>
              </Link>
            </div>

            <div className="overflow-hidden rounded-[1.4rem] border border-slate-200">
              <div className="grid grid-cols-[1.6fr,0.8fr,0.8fr] gap-4 bg-[#fbfcff] px-4 py-3 text-sm font-semibold text-slate-500">
                <div>المهمة</div>
                <div className="text-center">الوقت المتوقع</div>
                <div className="text-center">الحالة</div>
              </div>

              <div className="divide-y divide-slate-100">
                {todayTasks.slice(0, 4).map((task, index) => {
                  const pending = Boolean(taskState[task.id]);
                  const iconSet = [
                    { icon: BookOpen, tone: "bg-[#ebfaf0] text-[#16a34a]" },
                    { icon: Calculator, tone: "bg-[#eef4ff] text-[#2563eb]" },
                    { icon: TriangleAlert, tone: "bg-[#fff1f2] text-[#ef4444]" },
                    { icon: FileText, tone: "bg-[#fff4df] text-[#f59e0b]" },
                  ][index % 4];
                  const TaskIcon = iconSet.icon;

                  return (
                    <div key={task.id} className="grid grid-cols-[1.6fr,0.8fr,0.8fr] items-center gap-4 px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("flex h-11 w-11 items-center justify-center rounded-[1rem]", iconSet.tone)}>
                          <TaskIcon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-base font-semibold text-slate-900">{task.title}</div>
                          <div className="text-sm text-slate-500">{task.description ?? "خطة اليوم"}</div>
                        </div>
                      </div>

                      <div className="text-center text-sm font-medium text-slate-600">
                        {task.estimatedMinutes ? `${task.estimatedMinutes} دقيقة` : "—"}
                      </div>

                      <div className="flex items-center justify-center">
                        {task.isCompleted ? (
                          <button
                            type="button"
                            onClick={() => void handleToggleTask(task, false)}
                            disabled={pending}
                            className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700"
                          >
                            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            تم الإنجاز
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => void handleToggleTask(task, true)}
                            disabled={pending}
                            className="inline-flex items-center rounded-[0.9rem] border border-[#c8dbff] bg-white px-4 py-2 text-sm font-semibold text-[#2563eb] transition hover:bg-[#f8fbff]"
                          >
                            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : "ابدأ الآن"}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {!todayTasks.length ? (
                  <div className="px-4 py-8 text-center text-sm text-slate-500">
                    لا توجد مهام لليوم. يمكنك إعادة ضبط الخطة أو فتح بنك الأسئلة مباشرة.
                  </div>
                ) : null}
              </div>
            </div>

            <div className="flex flex-col gap-4 rounded-[1.25rem] border border-slate-200 bg-[#fbfcff] px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <CalendarClock className="h-4 w-4" />
                إجمالي الوقت المتوقع: {estimatedTotalMinutes || 0} دقيقة
              </div>

              <div className="flex w-full items-center gap-3 sm:max-w-[380px]">
                <span className="text-sm font-semibold text-slate-600">نسبة إنجاز الخطة</span>
                <Progress value={planProgress} indicatorClassName="bg-[linear-gradient(90deg,#60a5fa,#2563eb)]" />
                <span className="text-sm font-bold text-slate-700">{planProgress}%</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                type="button"
                variant="outline"
                className="gap-2"
                onClick={handleResetPlan}
                disabled={actionState === "loading"}
              >
                {actionState === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                إعادة توزيع الخطة
              </Button>
            </div>
          </CardContent>
        </Card>
      </Reveal>

      {actionError ? (
        <div className="rounded-[1.3rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
          {actionError}
        </div>
      ) : null}

      <Reveal delay={0.08}>
        <Card className="rounded-[2rem] border border-[#dbe6f6] bg-white shadow-[0_18px_42px_rgba(15,23,42,0.05)]">
          <CardContent className="space-y-5 p-5 md:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#eef4ff] text-[#2563eb]">
                  <BookOpen className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="display-font text-[1.9rem] font-bold text-slate-950">بنك الأسئلة</h2>
                  <p className="text-sm text-slate-500">ابدأ من الأقسام الأكثر احتياجًا لديك وتابع تقدمك منها مباشرة.</p>
                </div>
              </div>

              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600"
              >
                المزيد
              </button>
            </div>

            <div className="flex flex-wrap gap-3">
              <div className="inline-flex min-w-[220px] items-center gap-2 rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm text-slate-400">
                ابحث في بنك الأسئلة...
              </div>
              <div className="inline-flex rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                اللفظي
              </div>
              <div className="inline-flex rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                الكمي
              </div>
              <div className="inline-flex rounded-[1rem] border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
                الكل
              </div>
            </div>

            <div className="overflow-hidden rounded-[1.4rem] border border-slate-200">
              <div className="grid grid-cols-[1.3fr,0.8fr,0.8fr,0.9fr,1fr] gap-4 bg-[#fbfcff] px-4 py-3 text-sm font-semibold text-slate-500">
                <div>القسم</div>
                <div className="text-center">عدد الأسئلة</div>
                <div className="text-center">تم حل</div>
                <div className="text-center">نسبة الإنجاز</div>
                <div className="text-center">إجراء</div>
              </div>

              <div className="divide-y divide-slate-100">
                {sectionRows.map((section) => {
                  const SectionIcon = section.icon;

                  return (
                    <div key={section.title} className="grid grid-cols-[1.3fr,0.8fr,0.8fr,0.9fr,1fr] items-center gap-4 px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("flex h-11 w-11 items-center justify-center rounded-[1rem]", section.iconTone)}>
                          <SectionIcon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-base font-semibold text-slate-900">{section.title}</div>
                          <div className="text-sm text-slate-500">{section.lastAttempt}</div>
                        </div>
                      </div>

                      <div className="text-center text-sm font-medium text-slate-600">{section.total}</div>
                      <div className="text-center text-sm font-medium text-slate-600">{section.solved}</div>
                      <div className="space-y-2">
                        <div className="text-center text-sm font-semibold text-slate-700">{section.progress}%</div>
                        <div className="mx-auto h-1.5 max-w-[70px] rounded-full bg-slate-100">
                          <div className={cn("h-full rounded-full", section.bar)} style={{ width: `${section.progress}%` }} />
                        </div>
                      </div>
                      <div className="flex justify-center">
                        <Link href={section.href}>
                          <Button variant="outline" className="border-[#c8dbff] text-[#2563eb]">
                            ابدأ الحل
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="flex justify-center">
              <Link href="/question-bank">
                <Button variant="ghost" className="gap-2 text-[#2563eb]">
                  عرض المزيد من الأقسام
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="display-font text-[1.9rem] font-bold text-slate-950">الوصول السريع</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {quickAccessCards.map((item) => (
              <QuickAccessCard key={item.href} {...item} />
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal delay={0.12}>
        <Card className="rounded-[1.8rem] border border-[#dbe6f6] bg-[linear-gradient(180deg,#f8fbff_0%,#f3f7ff_100%)] shadow-[0_16px_36px_rgba(15,23,42,0.04)]">
          <CardContent className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#eef4ff] text-[#2563eb]">
                <Star className="h-5 w-5" />
              </div>
              <div>
                <div className="display-font text-lg font-bold text-[#2563eb]">نصيحة اليوم</div>
                <p className="mt-1 text-sm leading-7 text-slate-600">{todayTip}</p>
              </div>
            </div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-2 text-sm font-semibold text-slate-500">
              <Trophy className="h-4 w-4 text-[#f59e0b]" />
              {data.xp.levelLabel}
            </div>
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
