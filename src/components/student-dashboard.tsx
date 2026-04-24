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
import { StudentAchievementsPanel } from "@/components/student-achievements-panel";
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

const trainingTracks = [
  {
    key: "quant",
    title: "المسار الكمي",
    description: "حسابي، هندسي، مقارنة ومسائل تحتاج متابعة منظمة وواضحة.",
    accentClass: "border-[#d7e5ff] bg-[#f8fbff]",
    iconWrapClass: "bg-[#eaf2ff] text-[#1d4ed8]",
    indicatorClassName: "bg-[linear-gradient(90deg,#1d4ed8,#60a5fa)]",
    ringTone: "blue" as const,
    icon: BarChart3,
  },
  {
    key: "verbal",
    title: "المسار اللفظي",
    description: "إكمال جمل، تناظر، مفردة شاذة، وفهم مقروء بمراجعة يومية.",
    accentClass: "border-[#d5f0ec] bg-[#f4fdfa]",
    iconWrapClass: "bg-[#e9fbf8] text-[#0f766e]",
    indicatorClassName: "bg-[linear-gradient(90deg,#0f766e,#2dd4bf)]",
    ringTone: "teal" as const,
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

function CompactStatCard({
  title,
  value,
  caption,
  icon: Icon,
  tone,
  iconWrap,
}: {
  title: string;
  value: string;
  caption: string;
  icon: LucideIcon;
  tone: string;
  iconWrap: string;
}) {
  return (
    <div className={cn("rounded-[1.6rem] border p-4 shadow-[0_14px_28px_rgba(15,23,42,0.05)] sm:p-5", tone)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-semibold text-slate-500">{title}</div>
          <div className="mt-3 display-font text-2xl font-extrabold text-slate-950 sm:text-[2rem]">{value}</div>
          <div className="mt-2 text-xs leading-6 text-slate-500 sm:text-sm">{caption}</div>
        </div>
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem]", iconWrap)}>
          <Icon className="h-5 w-5" />
        </div>
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
        "group rounded-[1.5rem] border p-4 shadow-[0_12px_24px_rgba(15,23,42,0.04)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(15,23,42,0.08)]",
        tone,
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="display-font text-lg font-bold text-slate-950">{title}</div>
          <div className="mt-1 text-sm leading-7 text-slate-500">{description}</div>
        </div>
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-[1rem]", iconWrap)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </Link>
  );
}

function TaskRow({
  task,
  pending,
  onToggle,
}: {
  task: StudentPortalTask;
  pending: boolean;
  onToggle: (task: StudentPortalTask, nextValue: boolean) => void;
}) {
  return (
    <div className="rounded-[1.45rem] border border-slate-200 bg-white/92 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="display-font text-lg font-bold text-slate-950">{task.title}</div>
          {task.description ? <p className="mt-2 text-sm leading-7 text-slate-600">{task.description}</p> : null}
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
            {task.estimatedMinutes ? (
              <span className="rounded-full bg-slate-100 px-3 py-1">{task.estimatedMinutes} دقيقة</span>
            ) : null}
            {task.targetQuestions ? (
              <span className="rounded-full bg-slate-100 px-3 py-1">{task.targetQuestions} سؤالًا</span>
            ) : null}
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          variant={task.isCompleted ? "secondary" : "outline"}
          disabled={pending}
          onClick={() => onToggle(task, !task.isCompleted)}
          className="shrink-0"
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : task.isCompleted ? "تمت" : "إنهاء"}
        </Button>
      </div>
    </div>
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
          <div className="grid gap-6 xl:grid-cols-[1.2fr,0.8fr]">
            <div>
              <Badge className="border border-[#d7e5ff] bg-[#eef4ff] text-[#1d4ed8] shadow-none">
                لوحة الطالب
              </Badge>
              <h2 className="mt-4 display-font text-[clamp(1.7rem,4.1vw,3rem)] font-extrabold leading-[1.18] text-slate-950">
                {isLoading ? "نجهز لوحة الطالب الآن" : "تعذر تحميل بيانات اللوحة الآن"}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
                {isLoading
                  ? "نحمّل الخطة، الإحصائيات، وآخر نشاطاتك في الخلفية. تستطيع متابعة التنقل داخل المنصة حتى يكتمل التحميل."
                  : "يمكنك إعادة المحاولة الآن أو فتح الخطة اليومية وبنك الأسئلة مباشرة دون توقف."}
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
                  {isLoading ? "جارٍ التحميل" : "تحتاج إعادة مزامنة"}
                </div>
                <div className="mt-2 text-sm leading-7 text-slate-600">
                  {isLoading
                    ? "ستعود المهام والتقدم فور اكتمال الاستجابة."
                    : "بمجرد نجاح إعادة المحاولة ستعود الإحصائيات كما كانت."}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
                <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4 text-slate-800 sm:px-5">
                  <div className="text-xs text-slate-500">بديل سريع</div>
                  <div className="mt-2 display-font text-xl font-bold text-slate-950 sm:text-2xl">الخطة</div>
                  <div className="mt-1 text-xs text-slate-500">ابدأ من مهام اليوم مباشرة</div>
                </div>
                <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4 text-slate-800 sm:px-5">
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
        description="سجل دخولك أولًا حتى تظهر لك خطة اليوم، نسبة الإنجاز، آخر نشاط، والانتقال السريع إلى بنك الأسئلة والأخطاء والملخصات."
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
    return <StudentPortalLoadingCard label="جارٍ تحميل لوحة الطالب..." />;
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

  const upcomingTasks = Array.isArray(data.upcomingTasks)
    ? data.upcomingTasks.map((task) => ({
        ...task,
        title: task.title?.trim() || "مهمة قادمة",
        description: task.description ?? null,
        scheduledFor: task.scheduledFor || new Date().toISOString().slice(0, 10),
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
      : ["ابدأ الآن من القسم الذي يحتاج تركيزًا أكبر، ثم انتقل مباشرة إلى التدريب."];

  const recentSolvedQuestions = Array.isArray(data.recentSolvedQuestions) ? data.recentSolvedQuestions : [];
  const pressure = pressureConfig[data.planPressure] ?? pressureConfig.balanced;
  const normalizedFullName = (data.fullName ?? "").trim();
  const firstName = normalizedFullName.split(/\s+/)[0] || normalizedFullName || "الطالب";
  const primaryResumeItem = resumeItems[0] ?? null;
  const completedToday = todayTasks.filter((task) => task.isCompleted).length;
  const weakestMistakeLabel = data.weakestMistakeLabel ?? "لم تتضح نقطة ضعف واحدة بعد";
  const dashboardToneLabel =
    todayTasks.length > 0 && completedToday >= Math.max(1, Math.ceil(todayTasks.length / 2))
      ? "أنت ممتاز اليوم"
      : data.challenge.currentStreak >= 5
        ? "ثبات رائع هذا الأسبوع"
        : "جاهز تبدأ بخطوة واضحة";
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
        href: primaryResumeItem?.href ?? "/question-bank",
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
        description: `${preview.slice(0, 64)}${preview.length > 64 ? "..." : ""} • ${formatLastActivity(question.solvedAt)}`,
        href: typeof question.questionHref === "string" && question.questionHref.trim() ? question.questionHref : sectionHref,
      });
    });

    return items.slice(0, 3);
  })();

  const topSummaryCards = [
    {
      id: "streak",
      title: "سلسلة الدراسة",
      value: `${data.challenge.currentStreak}`,
      caption: "يوم متتالي",
      tone: "border-[#ffe7c2] bg-[#fffaf1]",
      iconWrap: "bg-[#fff1df] text-[#f97316]",
      icon: Zap,
    },
    {
      id: "level",
      title: "المستوى الحالي",
      value: data.xp.levelLabel,
      caption:
        data.xp.nextLevelLabel && data.xp.xpToNextLevel > 0
          ? `باقي ${data.xp.xpToNextLevel} XP للوصول إلى ${data.xp.nextLevelLabel}`
          : "أنت في أعلى مستوى حاليًا",
      tone: "border-[#d9e7ff] bg-[#f8fbff]",
      iconWrap: "bg-[#eef4ff] text-[#1d4ed8]",
      icon: Trophy,
    },
    {
      id: "xp",
      title: "النقاط",
      value: data.xp.total.toLocaleString("en-US"),
      caption: `${data.challenge.monthlyXp.toLocaleString("en-US")} XP هذا الشهر`,
      tone: "border-[#dde7f6] bg-white",
      iconWrap: "bg-[#f8fafc] text-[#123B7A]",
      icon: BarChart3,
    },
  ] as const;

  const overviewStats = [
    {
      id: "overall-progress",
      title: "نسبة الإنجاز الكلية",
      value: `${data.progressPercent}%`,
      caption: "أنت تتقدم بشكل واضح",
      ringValue: data.progressPercent,
      ringLabel: "إنجاز",
      ringTone: "blue" as const,
    },
    {
      id: "daily-hours",
      title: "ساعات الدراسة اليومية",
      value: `${data.dailyStudyHours} ساعات`,
      caption: planTypeLabels[data.planType],
      ringValue: Math.min(100, data.dailyStudyHours * 20),
      ringLabel: "ساعات",
      ringTone: "teal" as const,
    },
    {
      id: "exam-date",
      title: "الموعد المتبقي للاختبار",
      value: formatDaysLeft(data.daysLeft),
      caption: formatPortalDate(data.examDate),
      ringValue: data.daysLeft == null ? 0 : Math.max(10, Math.min(100, 100 - data.daysLeft)),
      ringLabel: "الموعد",
      ringTone: "gold" as const,
    },
    {
      id: "remaining-sections",
      title: "عدد المقاطع المتبقية",
      value: `${data.quantRemainingSections ?? 0} / ${data.verbalRemainingSections ?? 0}`,
      caption: "كمي / لفظي",
      ringValue: data.progressPercent,
      ringLabel: "المسارات",
      ringTone: "blue" as const,
    },
  ] as const;

  const quickTools = [
    {
      href: "/question-bank",
      title: "بنك الأسئلة",
      description: "تدرب على آلاف الأسئلة",
      icon: ClipboardList,
      tone: "border-[#d8e5f7] bg-[#f8fbff]",
      iconWrap: "bg-[#eef4ff] text-[#123B7A]",
    },
    {
      href: "/question-bank?track=mistakes",
      title: "الأخطاء",
      description: "راجع أخطاءك وتعلم منها",
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
          جارٍ تحديث بيانات لوحة الطالب في الخلفية...
        </div>
      ) : null}

      <Reveal>
        <Card className="overflow-hidden rounded-[2rem] border border-[#dbe7f5] bg-white shadow-[0_22px_54px_rgba(15,23,42,0.06)] sm:rounded-[2.5rem]">
          <CardContent className="space-y-6 p-5 sm:space-y-8 sm:p-6 lg:p-8">
            <div className="grid gap-6 xl:grid-cols-[1.35fr,1fr] xl:items-start">
              <div>
                <Badge className="border border-[#d7e5ff] bg-[#eef4ff] text-[#1d4ed8] shadow-none">لوحتي</Badge>
                <h2 className="mt-4 display-font text-[clamp(1.75rem,4.2vw,3.35rem)] font-extrabold leading-[1.18] text-slate-950">
                  مرحبًا بك، {firstName} 👋
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
                  هذه لوحة واضحة وعملية: خطة اليوم أولًا، ثم تقدمك، ثم العودة المباشرة لآخر نقطة توقفت عندها بدون تكدس أو بحث طويل.
                </p>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="mini-pill border-slate-200 bg-white/85 text-slate-700">
                    {data.challenge.currentStreak} أيام متواصلة
                  </span>
                  <span className="mini-pill border-slate-200 bg-white/85 text-slate-700">
                    {completedToday}/{todayTasks.length || 0} من مهام اليوم
                  </span>
                  <span className="mini-pill border-slate-200 bg-white/85 text-slate-700">{dashboardToneLabel}</span>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link href="/my-plan">
                    <Button className="w-full gap-2 bg-[#1d4ed8] text-white shadow-[0_14px_32px_rgba(29,78,216,0.18)] hover:bg-[#1e40af] sm:w-auto">
                      <Target className="h-4 w-4" />
                      ابدأ الخطة اليومية
                    </Button>
                  </Link>
                  <Link href={primaryResumeItem?.href ?? "/question-bank"}>
                    <Button variant="outline" className="w-full gap-2 border-slate-200 bg-white text-slate-800 hover:bg-slate-50 sm:w-auto">
                      <Zap className="h-4 w-4" />
                      استكمل من حيث توقفت
                    </Button>
                  </Link>
                  <Link href="/question-bank">
                    <Button variant="outline" className="w-full gap-2 border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 sm:w-auto">
                      <ClipboardList className="h-4 w-4" />
                      ابدأ تدريبًا الآن
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {topSummaryCards.map((card) => (
                  <CompactStatCard
                    key={card.id}
                    title={card.title}
                    value={card.value}
                    caption={card.caption}
                    icon={card.icon}
                    tone={card.tone}
                    iconWrap={card.iconWrap}
                  />
                ))}
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              {overviewStats.map((item) => (
                <div
                  key={item.id}
                  className="rounded-[1.55rem] border border-slate-200 bg-white/92 p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-500">{item.title}</div>
                      <div className="mt-3 display-font text-2xl font-extrabold text-slate-950">{item.value}</div>
                      <div className="mt-2 text-sm leading-7 text-slate-500">{item.caption}</div>
                    </div>
                    <ProgressRing value={item.ringValue} label={item.ringLabel} tone={item.ringTone} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </Reveal>

      <Reveal delay={0.03}>
        <div className="grid gap-6 xl:grid-cols-[0.9fr,1.25fr,0.95fr] xl:items-start">
          <Card className="order-3 rounded-[2rem] border border-[#dde7f6] bg-white/96 shadow-[0_18px_42px_rgba(15,23,42,0.05)] xl:order-1">
            <CardContent className="space-y-5 p-5 sm:p-6 lg:p-8">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="section-eyebrow text-[#123B7A]">استكمل من حيث توقفت</p>
                  <h3 className="display-font text-[clamp(1.45rem,2.2vw,2rem)] font-bold text-slate-950">
                    عودة سريعة إلى آخر نقطة
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-500">
                    آخر ملف أو قسم فتحته يظهر هنا حتى لا تبدأ من جديد في كل مرة.
                  </p>
                </div>
                <Link href={primaryResumeItem?.href ?? "/question-bank"}>
                  <Button className="w-full gap-2 sm:w-auto">
                    <Zap className="h-4 w-4" />
                    {primaryResumeItem?.ctaLabel ?? "أكمل الآن"}
                  </Button>
                </Link>
              </div>

              <div className="space-y-3">
                {resumeItems.length ? (
                  resumeItems.map((item, index) => (
                    <div
                      key={item.id}
                      className={cn(
                        "rounded-[1.45rem] border p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]",
                        index === 0 ? "border-[#d9e7ff] bg-[#f8fbff]" : "border-slate-200 bg-white",
                      )}
                    >
                      <div className="display-font text-lg font-bold text-slate-950">{item.title}</div>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{item.subtitle}</p>
                      <div className="mt-4">
                        <Link href={item.href}>
                          <Button variant="outline" className="w-full gap-2 sm:w-auto">
                            {item.ctaLabel}
                            <ArrowLeft className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1.45rem] border border-dashed border-slate-300 bg-slate-50/70 p-5 text-sm leading-8 text-slate-600">
                    لا يوجد مسار سابق واضح بعد. ابدأ من بنك الأسئلة أو الخطة اليومية وستظهر العودة السريعة هنا تلقائيًا.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card id="today-plan" className="order-1 rounded-[2rem] border border-[#dbe6f6] bg-white shadow-[0_18px_46px_rgba(18,59,122,0.08)] xl:order-2">
            <CardContent className="space-y-5 p-5 sm:p-6 lg:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="section-eyebrow text-[#123B7A]">مهام اليوم</p>
                  <h3 className="display-font text-2xl font-bold text-slate-950">
                    {todayTasks.length ? `أنجزت ${completedToday} من ${todayTasks.length}` : "لا توجد مهام لليوم"}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-500">
                    هذا أهم جزء في اللوحة: مهام واضحة، تنفيذ سريع، وتحديث مباشر بمجرد إكمال كل مهمة.
                  </p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${pressure.className}`}>{pressure.label}</span>
              </div>

              {todayTasks.length ? (
                <div className="space-y-3">
                  {todayTasks.map((task) => (
                    <TaskRow key={task.id} task={task} pending={Boolean(taskState[task.id])} onToggle={handleToggleTask} />
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/70 p-6 text-sm leading-8 text-slate-600">
                  لا توجد مهام مجدولة اليوم. يمكنك إعادة ضبط الخطة أو فتح بنك الأسئلة لبدء جلسة جديدة.
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
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
                  إعادة جدولة الخطة
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="order-2 rounded-[2rem] border border-[#d9e7f9] bg-white shadow-[0_18px_42px_rgba(15,23,42,0.05)] xl:order-3">
            <CardContent className="space-y-5 p-5 sm:p-6 lg:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="section-eyebrow text-[#123B7A]">تقدمك اليوم</p>
                  <h3 className="display-font text-2xl font-bold text-slate-950">كمي ولفظي بشكل واضح</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-500">
                    راقب نسبة الإتقان الحالية، ثم خذ التوصية التالية بدل التشتت بين الأقسام.
                  </p>
                </div>
                <Badge className="bg-[#eef4ff] text-[#1d4ed8]">تقرير مختصر</Badge>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                {trainingTracks.map((track) => {
                  const isQuant = track.key === "quant";
                  const progressValue = isQuant ? data.quantProgressPercent : data.verbalProgressPercent;
                  const solvedCount = recentSolvedQuestions.filter((item) => item.section === (isQuant ? "quantitative" : "verbal")).length;

                  return (
                    <div key={track.key} className="rounded-[1.55rem] border border-slate-200 bg-white p-4 text-center shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                      <div className="text-sm font-bold text-slate-700">{isQuant ? "الكمي" : "اللفظي"}</div>
                      <div className="mt-4 flex justify-center">
                        <ProgressRing value={progressValue} label={isQuant ? "كمي" : "لفظي"} tone={track.ringTone} />
                      </div>
                      <div className="mt-3 rounded-[1rem] bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                        {solvedCount} سؤالًا من آخر الجلسات
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="rounded-[1.55rem] border border-[#f1dfb8] bg-[#fffaf1] p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-[#fff1df] text-[#f97316]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="display-font text-lg font-bold text-slate-950">نصيحة اليوم</div>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{recommendations[0]}</p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/question-bank?track=quant">
                  <Button variant="outline" className="w-full gap-2 sm:w-auto">
                    ادخل الكمي
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/question-bank?track=verbal">
                  <Button variant="outline" className="w-full gap-2 sm:w-auto">
                    ادخل اللفظي
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
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
        <Card className="rounded-[2rem] border border-slate-200 bg-white/98 shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
          <CardContent className="space-y-5 p-5 sm:p-6 lg:p-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="section-eyebrow text-[#123B7A]">أدوات سريعة</p>
                <h3 className="display-font text-2xl font-bold text-slate-950">ادخل إلى الأقسام الرئيسية فورًا</h3>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  نفس الهوية الحالية لكن بتنقل أسرع وواضح على الجوال والتابلت والديسكتوب.
                </p>
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

      <Reveal delay={0.08}>
        <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
          <Card className="rounded-[2rem] border border-slate-200 bg-white/98 shadow-[0_18px_42px_rgba(15,23,42,0.06)]" id="progress">
            <CardContent className="space-y-5 p-5 sm:p-6 lg:p-8">
              <div>
                <p className="section-eyebrow text-[#123B7A]">مساراتك الرئيسية</p>
                <h3 className="display-font text-2xl font-bold text-slate-950">كمي ولفظي بصورة عملية واضحة</h3>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  اعرف ما أنجزته، وما الذي بقي، وأين يجب أن يبدأ تركيزك اليوم.
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                {trainingTracks.map((track) => {
                  const isQuant = track.key === "quant";
                  const progressValue = isQuant ? data.quantProgressPercent : data.verbalProgressPercent;
                  const remaining = isQuant ? data.quantRemainingSections : data.verbalRemainingSections;
                  const Icon = track.icon;

                  return (
                    <div key={track.key} className={`rounded-[1.8rem] border p-5 ${track.accentClass}`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-[1rem] ${track.iconWrapClass}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <ProgressRing value={progressValue} label={isQuant ? "كمي" : "لفظي"} tone={track.ringTone} />
                      </div>
                      <div className="mt-4">
                        <div className="display-font text-xl font-bold text-slate-950">{track.title}</div>
                        <div className="mt-2 text-sm leading-7 text-slate-500">{track.description}</div>
                      </div>
                      <div className="mt-4 space-y-2">
                        <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
                          <span>نسبة الإتقان</span>
                          <span>{progressValue}%</span>
                        </div>
                        <Progress value={progressValue} indicatorClassName={track.indicatorClassName} />
                      </div>
                      <div className="mt-4 rounded-[1.2rem] border border-white/70 bg-white/70 px-4 py-3 text-sm font-semibold text-slate-700">
                        المتبقي الآن: {remaining ?? "غير محدد"} قسم
                      </div>
                      <div className="mt-4">
                        <Link href={isQuant ? "/question-bank?track=quant" : "/question-bank?track=verbal"}>
                          <Button variant="outline" className="w-full gap-2 sm:w-auto">
                            ادخل {isQuant ? "الكمي" : "اللفظي"}
                            <ArrowLeft className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/70 p-4">
                  <div className="text-xs font-semibold text-slate-500">هدف الأسبوع</div>
                  <div className="mt-3 display-font text-2xl font-bold text-slate-950">{data.weeklyGoal.targetQuestions} سؤالًا</div>
                  <div className="mt-2 text-sm text-slate-500">مع مراجعة {data.weeklyGoal.mistakesReview} سؤال من الأخطاء.</div>
                </div>
                <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/70 p-4">
                  <div className="text-xs font-semibold text-slate-500">خطة الكمي</div>
                  <div className="mt-3 display-font text-2xl font-bold text-slate-950">{data.weeklyGoal.quantSections} مقطع</div>
                  <div className="mt-2 text-sm text-slate-500">وزّع الجهد اليومي بدل التكدس في آخر الأسبوع.</div>
                </div>
                <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/70 p-4">
                  <div className="text-xs font-semibold text-slate-500">خطة اللفظي</div>
                  <div className="mt-3 display-font text-2xl font-bold text-slate-950">{data.weeklyGoal.verbalSections} مقطع</div>
                  <div className="mt-2 text-sm text-slate-500">الثبات اليومي القصير أفضل من جلسة طويلة ومتأخرة.</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6">
            <Card className="rounded-[2rem] border border-[#dbe6f6] bg-white shadow-[0_18px_42px_rgba(18,59,122,0.08)]">
              <CardContent className="space-y-5 p-5 sm:p-6 lg:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="section-eyebrow text-[#123B7A]">أخطاء تحتاج مراجعة</p>
                    <h3 className="display-font text-2xl font-bold text-slate-950">راجعها الآن قبل أن تتكرر</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-500">
                      تتبع ذكي لحالات الأسئلة: أخطأت فيها، قيد التدريب، ثم أتقنتها.
                    </p>
                  </div>
                  <ProgressRing value={data.mistakeMasteryPercent} label="إتقان" tone="gold" />
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.4rem] border border-rose-200 bg-rose-50/80 p-4">
                    <div className="text-xs font-semibold text-rose-600">تحتاج مراجعة</div>
                    <div className="mt-3 display-font text-2xl font-bold text-rose-700">{data.activeMistakesCount}</div>
                  </div>
                  <div className="rounded-[1.4rem] border border-sky-200 bg-sky-50/80 p-4">
                    <div className="text-xs font-semibold text-sky-600">قيد التدريب</div>
                    <div className="mt-3 display-font text-2xl font-bold text-sky-700">{data.mistakesInTrainingCount}</div>
                  </div>
                  <div className="rounded-[1.4rem] border border-emerald-200 bg-emerald-50/80 p-4">
                    <div className="text-xs font-semibold text-emerald-600">أتقنتها</div>
                    <div className="mt-3 display-font text-2xl font-bold text-emerald-700">{data.masteredMistakesCount}</div>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-white/85 p-4">
                  <div className="text-xs font-semibold text-slate-500">أكثر جزء يحتاج تركيزًا</div>
                  <div className="mt-2 text-base font-bold text-slate-950">{weakestMistakeLabel}</div>
                  <div className="mt-2 text-sm leading-7 text-slate-500">
                    نسبة التثبيت الحالية من كامل أخطائك هي {data.mistakeMasteryPercent}%، ومع كل جلسة ناجحة ستنتقل الأسئلة من الأخطاء إلى التدريب ثم إلى الإتقان.
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link href="/question-bank?track=mistakes#mistakes-trainer">
                    <Button className="w-full gap-2 sm:w-auto">
                      <TriangleAlert className="h-4 w-4" />
                      ابدأ تدريب الأخطاء
                    </Button>
                  </Link>
                  <Link href="/question-bank?track=mistakes">
                    <Button variant="outline" className="w-full gap-2 sm:w-auto">
                      <Brain className="h-4 w-4" />
                      افتح لوحة الأخطاء
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border border-slate-200 bg-white/98 shadow-[0_18px_42px_rgba(15,23,42,0.06)]" id="recent-activity">
              <CardContent className="space-y-5 p-5 sm:p-6 lg:p-8">
                <div>
                  <p className="section-eyebrow text-[#123B7A]">آخر نشاطاتك</p>
                  <h3 className="display-font text-2xl font-bold text-slate-950">آخر ما فعلته داخل المنصة</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-500">
                    حتى تعرف أين كنت، وماذا يجب أن تكمل بعده بدون الرجوع للبداية.
                  </p>
                </div>

                <div className="space-y-3">
                  {recentActivityItems.length ? (
                    recentActivityItems.map((item) => (
                      <div
                        key={item.id}
                        className="rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)]"
                      >
                        <div className="display-font text-lg font-bold text-slate-950">{item.title}</div>
                        <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
                        <div className="mt-4">
                          <Link href={item.href}>
                            <Button variant="outline" className="w-full gap-2 sm:w-auto">
                              افتح هذا القسم
                              <ArrowLeft className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/70 p-6 text-sm leading-8 text-slate-600">
                      لا يوجد نشاط حديث بعد. ابدأ من بنك الأسئلة أو الخطة اليومية وسيظهر سجلك هنا تلقائيًا.
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[2rem] border border-[#f1dfb8] bg-white shadow-[0_18px_42px_rgba(183,121,31,0.10)]">
              <CardContent className="space-y-5 p-5 sm:p-6 lg:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="section-eyebrow text-[#b7791f]">تحدي الشهر</p>
                    <h3 className="display-font text-2xl font-bold text-slate-950">{data.challenge.currentTitle}</h3>
                    <p className="mt-2 text-sm leading-7 text-slate-500">{data.challenge.countdownLabel}</p>
                  </div>
                  <ProgressRing value={data.xp.progressPercent} label="XP" tone="gold" />
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[1.4rem] border border-amber-200 bg-amber-50/80 p-4">
                    <div className="text-xs font-semibold text-amber-700">ترتيبك الشهري</div>
                    <div className="mt-3 display-font text-2xl font-bold text-slate-950">
                      {data.challenge.monthlyRank ? `#${data.challenge.monthlyRank}` : "خارج الترتيب"}
                    </div>
                  </div>
                  <div className="rounded-[1.4rem] border border-slate-200 bg-white p-4">
                    <div className="text-xs font-semibold text-slate-500">XP هذا الشهر</div>
                    <div className="mt-3 display-font text-2xl font-bold text-slate-950">
                      {data.challenge.monthlyXp.toLocaleString("en-US")}
                    </div>
                  </div>
                  <div className="rounded-[1.4rem] border border-slate-200 bg-white p-4">
                    <div className="text-xs font-semibold text-slate-500">السلسلة الحالية</div>
                    <div className="mt-3 display-font text-2xl font-bold text-slate-950">{data.challenge.currentStreak} يوم</div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge className={data.challenge.xpMultiplier.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-700"}>
                    {data.challenge.xpMultiplier.label}
                  </Badge>
                  <Badge className={data.challenge.rankProtection.active ? "bg-[#fff7e8] text-[#b7791f]" : "bg-slate-100 text-slate-700"}>
                    {data.challenge.rankProtection.label}
                  </Badge>
                </div>

                <div className="rounded-[1.5rem] border border-slate-200 bg-white/85 p-4 text-sm leading-8 text-slate-600">
                  {data.challenge.rankProtection.active
                    ? data.challenge.rankProtection.description
                    : data.challenge.nextMonthlyRankGap
                      ? `تبقى لك ${data.challenge.nextMonthlyRankGap.toLocaleString("en-US")} XP للوصول إلى المركز التالي في التحدي.`
                      : data.challenge.xpMultiplier.description}
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link href="/challenge">
                    <Button className="w-full gap-2 sm:w-auto">
                      <Trophy className="h-4 w-4" />
                      افتح لوحة التحدي
                    </Button>
                  </Link>
                  <Link href="/question-bank?track=mistakes#mistakes-trainer">
                    <Button variant="outline" className="w-full gap-2 sm:w-auto">
                      <Zap className="h-4 w-4" />
                      اجمع XP من الأخطاء
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <StudentAchievementsPanel data={data} sectionId="xp-progress" compact />
      </Reveal>

      <MobileQuickDock />
    </div>
  );
}
