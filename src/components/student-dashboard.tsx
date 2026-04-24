"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  Brain,
  ClipboardList,
  Compass,
  Loader2,
  NotebookPen,
  RefreshCcw,
  Sparkles,
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
  formatLastActivity,
  formatPortalDate,
  planTypeLabels,
  pressureConfig,
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

const quickTools = [
  {
    href: "/question-bank",
    title: "بنك الأسئلة",
    description: "تدرّب على آلاف الأسئلة",
    icon: ClipboardList,
    tone: "border-[#d8e5f7] bg-[#f8fbff]",
    iconWrap: "bg-[#eef4ff] text-[#123B7A]",
  },
  {
    href: "/question-bank?track=mistakes",
    title: "الأخطاء",
    description: "راجع أخطاءك وتعلّم منها",
    icon: TriangleAlert,
    tone: "border-[#ffd4da] bg-[#fff7f8]",
    iconWrap: "bg-[#fff1f2] text-[#dc2626]",
  },
  {
    href: "/summaries",
    title: "الملخصات",
    description: "ملخصاتك الخاصة والمفضلة",
    icon: Brain,
    tone: "border-[#d5f0ec] bg-[#f4fdfa]",
    iconWrap: "bg-[#e9fbf8] text-[#0f766e]",
  },
  {
    href: "/paper-models",
    title: "النماذج",
    description: "اختبر نفسك بنماذج محاكية",
    icon: NotebookPen,
    tone: "border-[#ecd9ff] bg-[#fcf8ff]",
    iconWrap: "bg-[#f5f3ff] text-[#7c3aed]",
  },
  {
    href: "/diagnostic",
    title: "التشخيص",
    description: "اختبر مستواك الآن",
    icon: Compass,
    tone: "border-[#dce9ff] bg-[#f8fbff]",
    iconWrap: "bg-[#eef4ff] text-[#2563eb]",
  },
] as const;

const trackCards = [
  {
    key: "quant",
    title: "الكمي",
    tone: "blue" as const,
    ringTone: "blue" as const,
    iconWrap: "bg-[#eef4ff] text-[#1d4ed8]",
    icon: BarChart3,
  },
  {
    key: "verbal",
    title: "اللفظي",
    tone: "orange" as const,
    ringTone: "gold" as const,
    iconWrap: "bg-[#fff1df] text-[#f97316]",
    icon: Brain,
  },
] as const;

async function updateTaskCompletion(taskId: number, completed: boolean) {
  const response = await fetch(`/api/student/plan/tasks/${taskId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
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
    headers: {
      "Content-Type": "application/json",
    },
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

function ProgressRing({
  value,
  label,
  tone = "blue",
}: {
  value: number;
  label: string;
  tone?: "blue" | "teal" | "gold";
}) {
  const normalized = Math.max(0, Math.min(100, Math.round(value)));
  const ringColor = tone === "teal" ? "#0EA5A4" : tone === "gold" ? "#F59E0B" : "#1D4ED8";

  return (
    <div
      className="grid h-20 w-20 place-items-center rounded-full sm:h-24 sm:w-24"
      style={{
        background: `conic-gradient(${ringColor} ${normalized * 3.6}deg, rgba(226,232,240,0.92) 0deg)`,
      }}
    >
      <div className="grid h-[4.25rem] w-[4.25rem] place-items-center rounded-full bg-white text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.85)] sm:h-[5.1rem] sm:w-[5.1rem]">
        <div className="display-font text-xl font-extrabold text-slate-950 sm:text-2xl">{normalized}%</div>
        <div className="text-[11px] font-semibold text-slate-500">{label}</div>
      </div>
    </div>
  );
}

function QuickToolCard({
  href,
  title,
  description,
  icon: Icon,
  tone,
  iconWrap,
}: {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  tone: string;
  iconWrap: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group rounded-[1.45rem] border p-4 shadow-[0_10px_22px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_16px_30px_rgba(15,23,42,0.08)]",
        tone,
      )}
    >
      <div className="flex items-center gap-3">
        <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem]", iconWrap)}>
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="display-font text-lg font-bold text-slate-950">{title}</div>
          <div className="mt-1 text-sm leading-7 text-slate-500">{description}</div>
        </div>
      </div>
    </Link>
  );
}

function MobileQuickDock() {
  const items = [
    { href: "/dashboard", label: "لوحتي", icon: Compass },
    { href: "/my-plan", label: "الخطة", icon: Target },
    { href: "/question-bank", label: "الأسئلة", icon: ClipboardList },
    { href: "/question-bank?track=mistakes", label: "المراجعة", icon: TriangleAlert },
  ];

  return (
    <div className="fixed inset-x-3 bottom-3 z-[140] md:hidden [padding-bottom:env(safe-area-inset-bottom)]">
      <div className="grid grid-cols-4 gap-2 rounded-[1.6rem] border border-white/80 bg-white/94 p-2 shadow-[0_20px_44px_rgba(15,23,42,0.14)] backdrop-blur-xl">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex min-h-[4.5rem] flex-col items-center justify-center gap-1 rounded-[1.15rem] px-2 py-2.5 text-center transition hover:bg-slate-50"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-[0.95rem] bg-[#eef4ff] text-[#123B7A]">
                <Icon className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-slate-700">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
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
    <div className="space-y-6 pb-24 sm:space-y-8 lg:pb-0">
      <Card className="rounded-[2rem] border border-[#dbe7f5] bg-white shadow-[0_22px_54px_rgba(15,23,42,0.06)] sm:rounded-[2.5rem]">
        <CardContent className="space-y-6 p-5 sm:space-y-8 sm:p-6 lg:p-8">
          <div className="grid gap-6 xl:grid-cols-[1.12fr,0.88fr] xl:items-center">
            <div>
              <Badge className="border border-[#d7e5ff] bg-[#eef4ff] text-[#1d4ed8] shadow-none">لوحة الطالب</Badge>
              <h2 className="mt-4 display-font text-[clamp(1.7rem,4.1vw,3rem)] font-extrabold leading-[1.18] text-slate-950">
                {isLoading ? "نجهّز لوحة الطالب الآن" : "تعذر تحميل بيانات اللوحة الآن"}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
                {isLoading
                  ? "نحمّل الخطة، الإحصائيات، وآخر نشاطاتك في الخلفية. تستطيع متابعة التنقل داخل المنصة حتى يكتمل التحميل."
                  : "يمكنك إعادة المحاولة الآن أو فتح الخطة اليومية وبنك الأسئلة مباشرة دون أن يتوقف استخدامك للموقع."}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Button type="button" className="w-full gap-2 sm:w-auto" onClick={onRetry}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                  {isLoading ? "تحديث البيانات" : "إعادة المحاولة"}
                </Button>
                <Link href="/my-plan">
                  <Button variant="outline" className="w-full gap-2 sm:w-auto">
                    <Target className="h-4 w-4" />
                    اذهب إلى الخطة اليومية
                  </Button>
                </Link>
                <Link href="/question-bank">
                  <Button variant="outline" className="w-full gap-2 sm:w-auto">
                    <ClipboardList className="h-4 w-4" />
                    افتح بنك الأسئلة
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-[1.7rem] border border-slate-200 bg-slate-50/70 p-5">
                <div className="text-xs font-semibold tracking-[0.16em] text-slate-500">حالة اللوحة</div>
                <div className="mt-3 display-font text-2xl font-bold text-slate-950 sm:text-3xl">
                  {isLoading ? "جاري التحميل" : "تحتاج إعادة مزامنة"}
                </div>
                <div className="mt-2 text-sm leading-7 text-slate-600">
                  {isLoading
                    ? "ستعود المهام والتقدم فور اكتمال الاستجابة."
                    : "بمجرد نجاح إعادة المحاولة ستعود الإحصائيات والمهام كما كانت."}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
                <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4 sm:px-5">
                  <div className="text-xs text-slate-500">بديل سريع</div>
                  <div className="mt-2 display-font text-xl font-bold text-slate-950 sm:text-2xl">الخطة</div>
                  <div className="mt-1 text-xs text-slate-500">ابدأ من مهام اليوم مباشرة</div>
                </div>
                <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4 sm:px-5">
                  <div className="text-xs text-slate-500">بديل سريع</div>
                  <div className="mt-2 display-font text-xl font-bold text-slate-950 sm:text-2xl">الأسئلة</div>
                  <div className="mt-1 text-xs text-slate-500">افتح التدريب بدون انتظار</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <MobileQuickDock />
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
        description="سجّل دخولك أولًا حتى تظهر لك خطة اليوم، نسبة الإنجاز، آخر نشاط، والتنقل السريع إلى بنك الأسئلة والأخطاء والملخصات."
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
    return <StudentPortalLoadingCard label="جاري تحميل لوحة الطالب..." />;
  }

  if (portalStatus === "error" || !data) {
    return <StudentPortalErrorCard message={error ?? "تعذر تحميل لوحة الطالب."} onRetry={() => void refresh()} />;
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

  const resumeItems = Array.isArray(data.resumeItems)
    ? data.resumeItems
        .map((item, index) => ({
          id: item.id?.trim() || `resume-item-${index + 1}`,
          title: item.title?.trim() || "متابعة سريعة",
          subtitle: item.subtitle?.trim() || "افتح هذا المسار لإكمال ما توقفت عنده.",
          href: item.href?.trim() || "/question-bank",
          ctaLabel: item.ctaLabel?.trim() || "أكمل الآن",
        }))
        .slice(0, 3)
    : [];

  const recommendations =
    Array.isArray(data.recommendations) && data.recommendations.length
      ? data.recommendations.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
      : ["ابدأ من القسم الذي يحتاج تركيزًا أكبر، ثم انتقل مباشرة إلى التدريب."];

  const recentSolvedQuestions = Array.isArray(data.recentSolvedQuestions) ? data.recentSolvedQuestions : [];
  const normalizedFullName = (data.fullName ?? "").trim();
  const firstName = normalizedFullName.split(/\s+/)[0] || normalizedFullName || "الطالب";
  const completedToday = todayTasks.filter((task) => task.isCompleted).length;
  const pressure = pressureConfig[data.planPressure] ?? pressureConfig.balanced;
  const levelProgressValue = Math.max(8, data.xp.progressPercent || 0);
  const quantSolvedCount = recentSolvedQuestions.filter((item) => item.section === "quantitative").length;
  const verbalSolvedCount = recentSolvedQuestions.filter((item) => item.section === "verbal").length;
  const recentActivityItems = (() => {
    const items: Array<{
      id: string;
      title: string;
      description: string;
      href: string;
    }> = [];

    if (data.lastActivityLabel || data.lastActivityAt) {
      items.push({
        id: "latest-session",
        title: data.lastActivityLabel ?? "آخر تفاعل داخل المنصة",
        description: formatLastActivity(data.lastActivityAt),
        href: "/question-bank",
      });
    }

    recentSolvedQuestions.slice(0, 3).forEach((question, index) => {
      const title =
        (typeof question.categoryTitle === "string" && question.categoryTitle.trim()) ||
        (typeof question.questionTypeLabel === "string" && question.questionTypeLabel.trim()) ||
        "سؤال محلول";
      const preview = typeof question.questionText === "string" ? question.questionText.trim() : "";
      const sectionHref =
        question.section === "quantitative" ? "/question-bank?track=quant" : "/question-bank?track=verbal";

      items.push({
        id: `recent-question-${question.id}-${index}`,
        title,
        description: `${preview.slice(0, 56)}${preview.length > 56 ? "..." : ""} • ${formatLastActivity(question.solvedAt)}`,
        href: typeof question.questionHref === "string" && question.questionHref.trim() ? question.questionHref : sectionHref,
      });
    });

    return items.slice(0, 3);
  })();

  const resumeFeed = (resumeItems.length ? resumeItems : recentActivityItems)
    .slice(0, 3)
    .map((item) => ({
      id: item.id,
      title: item.title,
      description: "subtitle" in item ? item.subtitle : item.description,
      href: item.href,
    }));
  const todayTip = recommendations[0] ?? "ابدأ من أضعف نقطة لديك ثم انتقل مباشرة إلى التطبيق.";
  const sparklineBars = [38, 44, 41, 57, 50, 69, 61, 76];

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
    <div className="space-y-6 pb-24 sm:space-y-8 lg:pb-0">
      <StudentPlanSetupNotice onboardingCompleted={data.onboardingCompleted} />

      {error ? (
        <Card className="rounded-[1.7rem] border border-amber-200 bg-amber-50/80 shadow-[0_10px_28px_rgba(217,119,6,0.08)]">
          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="min-w-0">
              <div className="text-sm font-bold text-amber-800">تعذر تحديث بعض بيانات اللوحة الآن</div>
              <p className="mt-1 text-sm leading-7 text-amber-900/80">
                نعرض لك آخر نسخة محفوظة حتى لا تتوقف. يمكنك إعادة المزامنة الآن أو متابعة الخطة والتدريب كالمعتاد.
              </p>
            </div>
            <Button type="button" variant="outline" className="gap-2 border-amber-300 bg-white sm:shrink-0" onClick={() => void refresh()}>
              <RefreshCcw className="h-4 w-4" />
              إعادة المزامنة
            </Button>
          </CardContent>
        </Card>
      ) : null}

      {isRefreshing ? (
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin" />
          جاري تحديث بيانات لوحة الطالب في الخلفية...
        </div>
      ) : null}

      <Reveal>
        <Card className="overflow-hidden rounded-[2rem] border border-[#dbe7f5] bg-white shadow-[0_22px_54px_rgba(15,23,42,0.06)] sm:rounded-[2.5rem]">
          <CardContent className="space-y-6 p-5 sm:space-y-8 sm:p-6 lg:p-8">
            <div className="grid gap-6 xl:grid-cols-[1.5fr,0.95fr] xl:items-start">
              <div>
                <Badge className="border border-[#d7e5ff] bg-[#eef4ff] text-[#1d4ed8] shadow-none">لوحتي</Badge>
                <h2 className="mt-4 display-font text-[clamp(2rem,4.2vw,3.4rem)] font-extrabold leading-[1.15] text-slate-950">
                  مرحبًا بك، {firstName} 👋
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-500 sm:text-base sm:leading-8">
                  استمر بنفس الحماس، أنت على الطريق الصحيح. الخطة أولًا، ثم التقدم، ثم استكمال ما توقفت عنده من مكان واحد.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-3">
                <div className="rounded-[1.55rem] border border-[#ffe7c2] bg-[#fffaf1] p-4 shadow-[0_12px_28px_rgba(249,115,22,0.06)]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs font-semibold text-slate-500">سلسلة الدراسة</div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-[#fff1df] text-[#f97316]">
                      <Zap className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-4 display-font text-[2rem] font-extrabold text-slate-950">{data.challenge.currentStreak}</div>
                  <div className="mt-1 text-sm font-medium text-slate-500">يوم متتالي</div>
                  <div className="mt-4 flex h-10 items-end gap-1.5">
                    {sparklineBars.map((height, index) => (
                      <span
                        key={`spark-${index}`}
                        className="flex-1 rounded-full bg-[linear-gradient(180deg,#93c5fd,#2563eb)]"
                        style={{ height: `${height}%` }}
                      />
                    ))}
                  </div>
                </div>

                <div className="rounded-[1.55rem] border border-[#d9e7ff] bg-[#f8fbff] p-4 shadow-[0_12px_28px_rgba(29,78,216,0.05)]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs font-semibold text-slate-500">المستوى الحالي</div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-[#eef4ff] text-[#1d4ed8]">
                      <Trophy className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-4 display-font text-[1.8rem] font-extrabold text-slate-950">{data.xp.levelLabel}</div>
                  <div className="mt-2 text-sm font-medium text-slate-500">
                    {data.xp.nextLevelLabel && data.xp.xpToNextLevel > 0
                      ? `${data.xp.xpToNextLevel} XP للوصول إلى ${data.xp.nextLevelLabel}`
                      : "أنت في أعلى مستوى حاليًا"}
                  </div>
                  <div className="mt-4">
                    <Progress value={levelProgressValue} indicatorClassName="bg-[linear-gradient(90deg,#2563eb,#60a5fa)]" />
                  </div>
                </div>

                <div className="rounded-[1.55rem] border border-[#dde7f6] bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-xs font-semibold text-slate-500">النقاط</div>
                    <div className="flex h-10 w-10 items-center justify-center rounded-[1rem] bg-[#f8fafc] text-[#123B7A]">
                      <BarChart3 className="h-4 w-4" />
                    </div>
                  </div>
                  <div className="mt-4 display-font text-[2rem] font-extrabold text-slate-950">
                    {data.xp.total.toLocaleString("en-US")}
                  </div>
                  <div className="mt-2 inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                    +{data.challenge.monthlyXp.toLocaleString("en-US")} هذا الشهر
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[1.85rem] border border-slate-200 bg-white">
              <div className="grid gap-0 divide-y divide-slate-200 md:grid-cols-2 md:divide-x md:divide-y-0 xl:grid-cols-4">
                <div className="flex items-center justify-between gap-4 px-5 py-5">
                  <div>
                    <div className="text-sm font-semibold text-slate-500">نسبة الإنجاز الكلية</div>
                    <div className="mt-3 display-font text-[2rem] font-extrabold text-slate-950">{data.progressPercent}%</div>
                    <div className="mt-1 text-sm text-slate-500">أنت تتقدم بشكل رائع</div>
                  </div>
                  <ProgressRing value={data.progressPercent} label="إنجاز" tone="blue" />
                </div>

                <div className="px-5 py-5">
                  <div className="text-sm font-semibold text-slate-500">ساعات الدراسة اليومية</div>
                  <div className="mt-3 display-font text-[2rem] font-extrabold text-slate-950">{data.dailyStudyHours} ساعات</div>
                  <div className="mt-1 text-sm text-slate-500">{planTypeLabels[data.planType]}</div>
                </div>

                <div className="px-5 py-5">
                  <div className="text-sm font-semibold text-slate-500">الموعد المتبقي للاختبار</div>
                  <div className="mt-3 display-font text-[2rem] font-extrabold text-slate-950">{formatDaysLeft(data.daysLeft)}</div>
                  <div className="mt-1 text-sm text-slate-500">{formatPortalDate(data.examDate)}</div>
                </div>

                <div className="px-5 py-5">
                  <div className="text-sm font-semibold text-slate-500">عدد المقاطع المتبقية</div>
                  <div className="mt-3 flex items-center gap-5">
                    <div>
                      <div className="text-sm font-semibold text-slate-500">اللفظي</div>
                      <div className="display-font mt-1 text-[2rem] font-extrabold text-slate-950">
                        {data.verbalRemainingSections ?? 0}
                      </div>
                    </div>
                    <div className="h-12 w-px bg-slate-200" />
                    <div>
                      <div className="text-sm font-semibold text-slate-500">الكمي</div>
                      <div className="display-font mt-1 text-[2rem] font-extrabold text-slate-950">
                        {data.quantRemainingSections ?? 0}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Reveal>

      <Reveal delay={0.03}>
        <div className="grid gap-6 xl:grid-cols-[0.9fr,1.18fr,0.92fr]">
          <Card className="order-2 rounded-[2rem] border border-[#dbe6f6] bg-white shadow-[0_18px_42px_rgba(18,59,122,0.08)] xl:order-1">
            <CardContent className="space-y-5 p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="section-eyebrow text-[#123B7A]">تقدمك اليوم</p>
                  <h3 className="display-font text-2xl font-bold text-slate-950">تقرير مفصل</h3>
                </div>
                <Badge className="bg-[#eef4ff] text-[#1d4ed8]">اليوم</Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
                {trackCards.map((track) => {
                  const Icon = track.icon;
                  const progressValue = track.key === "quant" ? data.quantProgressPercent : data.verbalProgressPercent;
                  const solvedCount = track.key === "quant" ? quantSolvedCount : verbalSolvedCount;

                  return (
                    <div key={track.key} className="rounded-[1.45rem] border border-slate-200 bg-white p-4 text-center shadow-[0_10px_20px_rgba(15,23,42,0.04)]">
                      <div className="flex items-center justify-between gap-3">
                        <div className={cn("flex h-10 w-10 items-center justify-center rounded-[1rem]", track.iconWrap)}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="text-sm font-bold text-slate-700">{track.title}</div>
                      </div>
                      <div className="mt-4 flex justify-center">
                        <ProgressRing value={progressValue} label={track.title} tone={track.ringTone} />
                      </div>
                      <div className="mt-3 rounded-[1rem] bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                        {solvedCount} سؤالًا من آخر الجلسات
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.2rem] border border-emerald-200 bg-emerald-50/80 px-4 py-3">
                  <div className="text-xs font-semibold text-emerald-700">الأسئلة المحلولة</div>
                  <div className="mt-2 display-font text-xl font-bold text-slate-950">{data.solvedQuestionsCount}</div>
                </div>
                <div className="rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3">
                  <div className="text-xs font-semibold text-slate-500">الأخطاء النشطة</div>
                  <div className="mt-2 display-font text-xl font-bold text-slate-950">{data.activeMistakesCount}</div>
                </div>
              </div>

              <div className="rounded-[1.45rem] border border-[#f1dfb8] bg-[#fffaf1] p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-[#fff1df] text-[#f97316]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="display-font text-lg font-bold text-slate-950">نصيحة اليوم</div>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{todayTip}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card id="today-plan" className="order-1 rounded-[2rem] border border-[#dbe6f6] bg-white shadow-[0_18px_42px_rgba(18,59,122,0.08)] xl:order-2">
            <CardContent className="space-y-5 p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="section-eyebrow text-[#123B7A]">مهام اليوم</p>
                  <h3 className="display-font text-2xl font-bold text-slate-950">
                    {todayTasks.length ? `${completedToday} / ${todayTasks.length}` : "لا توجد مهام لليوم"}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="border border-[#d7e5ff] bg-[#eef4ff] text-[#1d4ed8] shadow-none">
                    {todayTasks.length} مهام
                  </Badge>
                  <span className={cn("rounded-full border px-3 py-1 text-xs font-bold", pressure.className)}>{pressure.label}</span>
                </div>
              </div>

              <div className="space-y-3">
                {todayTasks.length ? (
                  todayTasks.map((task, index) => {
                    const pending = Boolean(taskState[task.id]);
                    const metaTone = [
                      "bg-[#eef4ff] text-[#1d4ed8]",
                      "bg-[#fff1df] text-[#f97316]",
                      "bg-[#e9fbf8] text-[#0f766e]",
                      "bg-[#f5f3ff] text-[#7c3aed]",
                    ][index % 4];

                    return (
                      <div
                        key={task.id}
                        className={cn(
                          "grid gap-3 rounded-[1.3rem] border px-4 py-3 transition",
                          task.isCompleted ? "border-emerald-200 bg-emerald-50/60" : "border-slate-200 bg-white",
                        )}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <button
                            type="button"
                            onClick={() => void handleToggleTask(task, !task.isCompleted)}
                            disabled={pending}
                            className={cn(
                              "flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition",
                              task.isCompleted
                                ? "border-emerald-500 bg-emerald-500 text-white"
                                : "border-slate-300 bg-white text-transparent hover:border-[#1d4ed8]",
                            )}
                            aria-label={task.isCompleted ? "إلغاء إكمال المهمة" : "إنهاء المهمة"}
                          >
                            {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "✓"}
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className={cn("rounded-full px-2.5 py-1 text-[11px] font-bold", metaTone)}>
                                {task.targetQuestions ? "كمي" : task.estimatedMinutes ? "لفظي" : "مراجعة"}
                              </span>
                              {task.estimatedMinutes ? (
                                <span className="text-xs font-semibold text-slate-400">{task.estimatedMinutes} د</span>
                              ) : null}
                            </div>
                            <div className="mt-2 text-sm font-semibold text-slate-800 sm:text-base">{task.title}</div>
                            {task.description ? (
                              <p className="mt-1 text-sm leading-7 text-slate-500">{task.description}</p>
                            ) : null}
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="rounded-[1.4rem] border border-dashed border-slate-300 bg-slate-50/80 p-5 text-sm leading-8 text-slate-600">
                    لا توجد مهام مجدولة اليوم. افتح الخطة اليومية لإعادة توزيع المهام أو ابدأ من بنك الأسئلة.
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                <Link href="/my-plan">
                  <Button className="w-full gap-2 sm:w-auto">
                    <Target className="h-4 w-4" />
                    عرض الخطة كاملة
                  </Button>
                </Link>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full gap-2 sm:w-auto"
                  onClick={handleResetPlan}
                  disabled={actionState === "loading"}
                >
                  {actionState === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                  أعد ضبط الخطة
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="order-3 rounded-[2rem] border border-slate-200 bg-white shadow-[0_18px_42px_rgba(15,23,42,0.05)] xl:order-3">
            <CardContent className="space-y-5 p-5 sm:p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="section-eyebrow text-[#123B7A]">استكمل من حيث توقفت</p>
                  <h3 className="display-font text-2xl font-bold text-slate-950">أكمل من آخر نقطة</h3>
                </div>
                <Link href={resumeFeed[0]?.href ?? "/question-bank"}>
                  <Button variant="outline" className="gap-2">
                    أكمل الآن
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <div className="space-y-3">
                {resumeFeed.length ? (
                  resumeFeed.map((item) => (
                    <Link
                      key={item.id}
                      href={item.href}
                      className="block rounded-[1.35rem] border border-slate-200 bg-white px-4 py-4 shadow-[0_10px_22px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-[#d7e5ff] hover:bg-[#f8fbff]"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="display-font text-lg font-bold text-slate-950">{item.title}</div>
                          <div className="mt-1 text-sm leading-7 text-slate-500">{item.description}</div>
                        </div>
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-[#eef4ff] text-[#1d4ed8]">
                          <ClipboardList className="h-4 w-4" />
                        </div>
                      </div>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-[1.4rem] border border-dashed border-slate-300 bg-slate-50/80 p-5 text-sm leading-8 text-slate-600">
                    لا يوجد مسار سابق واضح بعد. ابدأ من بنك الأسئلة أو الملخصات وسنحفظ آخر نقطة لك تلقائيًا.
                  </div>
                )}
              </div>

              <Link href="/question-bank">
                <Button variant="outline" className="w-full gap-2">
                  عرض كل الأنشطة
                  <ArrowLeft className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </Reveal>

      {actionError ? (
        <div className="rounded-[1.4rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
          {actionError}
        </div>
      ) : null}

      <Reveal delay={0.06}>
        <Card className="rounded-[2rem] border border-slate-200 bg-white shadow-[0_18px_42px_rgba(15,23,42,0.05)]">
          <CardContent className="space-y-5 p-5 sm:p-6">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="section-eyebrow text-[#123B7A]">أدوات سريعة</p>
                <h3 className="display-font text-2xl font-bold text-slate-950">اختصاراتك الأساسية</h3>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
              {quickTools.map((item) => (
                <QuickToolCard
                  key={item.href}
                  href={item.href}
                  title={item.title}
                  description={item.description}
                  icon={item.icon}
                  tone={item.tone}
                  iconWrap={item.iconWrap}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </Reveal>

      <MobileQuickDock />
    </div>
  );
}
