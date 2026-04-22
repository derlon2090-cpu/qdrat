"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  BarChart3,
  Brain,
  ClipboardList,
  Compass,
  FileText,
  Files,
  Loader2,
  NotebookPen,
  RefreshCcw,
  Sparkles,
  Target,
  TriangleAlert,
  Trophy,
  UserRound,
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

const quickActions = [
  {
    href: "/question-bank",
    label: "بنك الأسئلة",
    description: "ابدأ تدريبًا سريعًا أو افتح جلسة مركزة في الكمي أو اللفظي.",
    icon: ClipboardList,
  },
  {
    href: "/challenge",
    label: "تحدي الشهر",
    description: "تابع XP وترتيبك الحالي واعرف كم يفصلك عن المركز التالي داخل لوحة الأبطال.",
    icon: Trophy,
  },
  {
    href: "/question-bank?track=mistakes",
    label: "الأخطاء",
    description: "ادخل إلى تدريب الأخطاء الذكي، وابدأ من الأسئلة الأضعف حتى تصل إلى الإتقان.",
    icon: TriangleAlert,
  },
  {
    href: "/dashboard#progress",
    label: "المراجعة",
    description: "تابع الكمي واللفظي، واعرف أين يبدأ التركيز اليوم.",
    icon: Target,
  },
  {
    href: "/summaries",
    label: "الملخصات",
    description: "ارجع إلى ملفاتك المحفوظة وأكمل من آخر صفحة توقفت عندها.",
    icon: FileText,
  },
  {
    href: "/paper-models",
    label: "النماذج",
    description: "اختبر نفسك بنماذج تدريبية واقعية ومحاكية للاختبار.",
    icon: Files,
  },
  {
    href: "/diagnostic",
    label: "اختبار سريع",
    description: "قِس مستواك الحالي وحدد نقطة الانطلاق الأنسب لك.",
    icon: Compass,
  },
  {
    href: "/statistics",
    label: "الإحصائيات",
    description: "شاهد تقدمك ونِسب الإتقان في الأقسام المختلفة.",
    icon: BarChart3,
  },
  {
    href: "/account",
    label: "الإعدادات",
    description: "عدّل بياناتك وإعدادات خطتك الدراسية من مكان واحد.",
    icon: UserRound,
  },
];

const trainingTracks = [
  {
    key: "quant",
    title: "المسار الكمي",
    description: "حسابي، هندسي، مقارنات ومسائل تحتاج متابعة منتظمة وواضحة.",
    accentClass:
      "border-[#d7e5ff] bg-[linear-gradient(180deg,rgba(241,246,255,0.98),rgba(255,255,255,0.98))]",
    iconWrapClass: "bg-[#eaf2ff] text-[#1d4ed8]",
    indicatorClassName: "bg-[linear-gradient(90deg,#1d4ed8,#60a5fa)]",
    ringTone: "blue" as const,
    icon: BarChart3,
  },
  {
    key: "verbal",
    title: "المسار اللفظي",
    description: "إكمال جمل، تناظر، مفردة شاذة، وفهم مقروء بمراجعة يومية.",
    accentClass:
      "border-[#d5f0ec] bg-[linear-gradient(180deg,rgba(241,253,251,0.98),rgba(255,255,255,0.98))]",
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
  const normalized = Math.max(0, Math.min(100, value));
  const ringColor = tone === "teal" ? "#0EA5A4" : tone === "gold" ? "#F59E0B" : "#1D4ED8";

  return (
    <div
      className="grid h-24 w-24 place-items-center rounded-full"
      style={{
        background: `conic-gradient(${ringColor} ${normalized * 3.6}deg, rgba(226,232,240,0.92) 0deg)`,
      }}
    >
      <div className="grid h-[5.1rem] w-[5.1rem] place-items-center rounded-full bg-white text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
        <div className="display-font text-2xl font-extrabold text-slate-950">{normalized}%</div>
        <div className="text-[11px] font-semibold text-slate-500">{label}</div>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  caption,
  icon: Icon,
  className,
  iconWrapClass,
}: {
  title: string;
  value: string;
  caption: string;
  icon: LucideIcon;
  className: string;
  iconWrapClass: string;
}) {
  return (
    <Card className={`rounded-[2rem] border shadow-[0_18px_38px_rgba(15,23,42,0.06)] ${className}`}>
      <CardContent className="flex items-start justify-between gap-4 p-5">
        <div className="min-w-0">
          <div className="text-xs font-semibold tracking-[0.14em] text-slate-400">{title}</div>
          <div className="mt-3 display-font text-3xl font-extrabold text-slate-950">{value}</div>
          <div className="mt-2 text-sm leading-7 text-slate-500">{caption}</div>
        </div>
        <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.15rem] ${iconWrapClass}`}>
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );
}

function QuickActionCard({
  href,
  label,
  description,
  icon: Icon,
}: {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <Link
      href={href}
      className="group rounded-[1.7rem] border border-slate-200/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] p-4 shadow-[0_14px_36px_rgba(15,23,42,0.05)] transition duration-200 hover:-translate-y-1 hover:border-[#bfd3f3] hover:shadow-[0_20px_46px_rgba(29,78,216,0.10)]"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] bg-[#eef4ff] text-[#123B7A] transition group-hover:scale-105">
          <Icon className="h-5 w-5" />
        </div>
        <div className="min-w-0">
          <div className="display-font text-lg font-bold text-slate-950">{label}</div>
          <div className="mt-1 text-sm leading-7 text-slate-500">{description}</div>
        </div>
      </div>
    </Link>
  );
}

function HeroQuickStartCard({
  href,
  label,
  description,
  badge,
  icon: Icon,
  iconWrapClass,
  borderClass,
}: {
  href: string;
  label: string;
  description: string;
  badge: string;
  icon: LucideIcon;
  iconWrapClass: string;
  borderClass: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "group rounded-[1.8rem] border bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.94))] p-5 shadow-[0_16px_34px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(15,23,42,0.08)]",
        borderClass,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mini-pill">{badge}</div>
          <div className="mt-3 display-font text-xl font-bold text-slate-950">{label}</div>
          <div className="mt-2 text-sm leading-7 text-slate-500">{description}</div>
        </div>
        <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem]", iconWrapClass)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-2 text-sm font-bold text-[#123B7A]">
        افتح القسم
        <ArrowLeft className="h-4 w-4 transition-transform duration-200 group-hover:-translate-x-1" />
      </div>
    </Link>
  );
}

function MobileQuickDock() {
  const items = [
    { href: "/question-bank", label: "ابدأ", icon: Zap },
    { href: "/my-plan", label: "الخطة", icon: Target },
    { href: "/question-bank?track=mistakes", label: "الأخطاء", icon: TriangleAlert },
  ];

  return (
    <div className="fixed inset-x-4 bottom-4 z-[140] lg:hidden">
      <div className="grid grid-cols-3 gap-2 rounded-[1.8rem] border border-white/80 bg-white/94 p-2 shadow-[0_20px_44px_rgba(15,23,42,0.14)] backdrop-blur-xl">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center gap-1 rounded-[1.2rem] px-3 py-3 text-center transition hover:bg-slate-50"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-[0.95rem] bg-[#eef4ff] text-[#123B7A]">
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
    <div className="rounded-[1.6rem] border border-slate-200 bg-white/92 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
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

export function StudentDashboard() {
  const { status, user } = useAuthSession();
  const { status: portalStatus, data, error, refresh, setData } = useStudentPortal(status === "authenticated");
  const [taskState, setTaskState] = useState<Record<number, boolean>>({});
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [actionError, setActionError] = useState<string | null>(null);

  const completedToday = useMemo(
    () => data?.todayTasks.filter((task) => task.isCompleted).length ?? 0,
    [data?.todayTasks],
  );

  if (status === "loading") {
    return <StudentPortalLoadingCard />;
  }

  if (status !== "authenticated" || !user) {
    return (
      <StudentAccessCard
        title="لوحة الطالب مرتبطة بحسابك"
        description="سجل دخولك أولًا حتى تظهر لك خطة اليوم، نسبة الإنجاز، آخر نشاط، وأسرع انتقال إلى بنك الأسئلة والأخطاء والملخصات."
        next="/dashboard"
      />
    );
  }

  if (portalStatus === "loading" || portalStatus === "idle") {
    return <StudentPortalLoadingCard label="جارٍ تحميل لوحة الطالب..." />;
  }

  if (portalStatus === "error" || !data) {
    return <StudentPortalErrorCard message={error ?? "تعذر تحميل لوحة الطالب."} onRetry={() => void refresh()} />;
  }

  const pressure = pressureConfig[data.planPressure];
  const firstName = data.fullName.trim().split(/\s+/)[0] || data.fullName;
  const primaryResumeItem = data.resumeItems[0] ?? null;
  const secondaryResumeItem = data.resumeItems[1] ?? null;
  const upcomingTask = data.upcomingTasks[0] ?? null;
  const weakestMistakeLabel = data.weakestMistakeLabel ?? "لم تتضح نقطة ضعف واحدة بعد";
  const dashboardToneLabel =
    data.todayTasks.length > 0 && completedToday >= Math.max(1, Math.ceil(data.todayTasks.length / 2))
      ? "أنت ممتاز اليوم"
      : data.challenge.currentStreak >= 5
        ? "ثبات رائع هذا الأسبوع"
        : "جاهز تبدأ بخطوة واضحة";
  const heroQuickStartCards = [
    {
      href: primaryResumeItem?.href ?? "/question-bank",
      label: primaryResumeItem ? "أكمل من آخر نقطة" : "ابدأ تدريبًا سريعًا",
      description: primaryResumeItem
        ? primaryResumeItem.title
        : "ادخل مباشرة إلى بنك الأسئلة وابدأ بجلسة قصيرة وواضحة.",
      badge: primaryResumeItem ? "استكمال" : "بداية سريعة",
      icon: Zap,
      iconWrapClass: "bg-[#eef4ff] text-[#123B7A]",
      borderClass: "border-[#d8e5f7] hover:border-[#bfd3f3]",
    },
    {
      href: "/question-bank?track=mistakes#mistakes-trainer",
      label: "راجع أخطاءك الآن",
      description: `${data.activeMistakesCount} سؤال يحتاج مراجعة، ونسبة الإتقان الحالية ${data.mistakeMasteryPercent}%.`,
      badge: "الأخطاء",
      icon: TriangleAlert,
      iconWrapClass: "bg-[#fff1f2] text-[#dc2626]",
      borderClass: "border-[#ffd4da] hover:border-[#f8a8b5]",
    },
    {
      href: "/challenge",
      label: "ادخل تحدي الشهر",
      description: data.challenge.monthlyRank
        ? `ترتيبك الحالي #${data.challenge.monthlyRank}، وتستطيع رفعه من نفس اللوحة.`
        : "ابدأ جمع XP وادخل لوحة الأبطال هذا الشهر.",
      badge: "تحفيز",
      icon: Trophy,
      iconWrapClass: "bg-[#fff8e5] text-[#b7791f]",
      borderClass: "border-[#f1dfb8] hover:border-[#e7c981]",
    },
    {
      href: "/diagnostic",
      label: "كويز سريع",
      description: "اختبار قصير يحدد أين تبدأ الآن إذا كنت محتارًا بين أكثر من قسم.",
      badge: "سريع",
      icon: Sparkles,
      iconWrapClass: "bg-[#f5f3ff] text-[#7c3aed]",
      borderClass: "border-[#e6ddfb] hover:border-[#c9b5fa]",
    },
    {
      href: upcomingTask ? "/my-plan" : "/summaries",
      label: upcomingTask ? "نفّذ مهمة اليوم" : "افتح مكتبة الملخصات",
      description: upcomingTask
        ? upcomingTask.title
        : `لديك ${data.summariesCount.toLocaleString("en-US")} ملفًا محفوظًا داخل مكتبتك.`,
      badge: upcomingTask ? "الخطة اليومية" : "الملخصات",
      icon: upcomingTask ? Target : FileText,
      iconWrapClass: upcomingTask ? "bg-[#edfdf3] text-[#2f855a]" : "bg-[#eef4ff] text-[#123B7A]",
      borderClass: upcomingTask ? "border-[#d9f2e1] hover:border-[#9fdfb7]" : "border-[#d8e5f7] hover:border-[#bfd3f3]",
    },
  ];
  const recentActivityItems = useMemo(
    () => {
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

      data.recentSolvedQuestions.slice(0, 3).forEach((question, index) => {
        const title = question.categoryTitle?.trim() || question.questionTypeLabel || "سؤال محلول";
        const preview = question.questionText.trim();

        items.push({
          id: `recent-question-${question.id}-${index}`,
          title,
          description: `${preview.slice(0, 64)}${preview.length > 64 ? "..." : ""} • ${formatLastActivity(question.solvedAt)}`,
          href:
            question.questionHref ??
            (question.section === "quantitative" ? "/question-bank?track=quant" : "/question-bank?track=verbal"),
        });
      });

      return items.slice(0, 3);
    },
    [data.lastActivityAt, data.lastActivityLabel, data.recentSolvedQuestions, primaryResumeItem?.href],
  );

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
    <div className="space-y-8 pb-16 md:pb-20 lg:pb-0">
      <StudentPlanSetupNotice onboardingCompleted={data.onboardingCompleted} />

      <Reveal>
        <Card className="overflow-hidden rounded-[2.5rem] border border-[#dbe7f5] bg-[radial-gradient(circle_at_top_right,rgba(29,78,216,0.08),transparent_24%),radial-gradient(circle_at_16%_16%,rgba(14,165,164,0.08),transparent_20%),linear-gradient(180deg,rgba(255,255,255,0.99),rgba(248,250,252,0.96))] shadow-[0_22px_54px_rgba(15,23,42,0.06)]">
        <CardContent className="space-y-8 p-8">
          <div className="grid gap-8 xl:grid-cols-[1.15fr,0.85fr]">
            <div>
              <Badge className="border border-[#d7e5ff] bg-[#eef4ff] text-[#1d4ed8] shadow-none">لوحة الطالب</Badge>
              <h2 className="mt-4 max-w-[12ch] display-font text-[clamp(2rem,4.1vw,3.45rem)] font-extrabold leading-[1.18] text-slate-950">
                أهلًا يا {firstName}، نبدأ من هنا
              </h2>
              <p className="mt-3 max-w-3xl text-base leading-8 text-slate-600">
                هذه لوحة عملية وليست نصوصًا فقط: أكمل من آخر نقطة، افتح خطة اليوم، وادخل مباشرة إلى الأقسام التي تحتاجها الآن.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="mini-pill border-slate-200 bg-white/85 text-slate-700">
                  {data.challenge.currentStreak} أيام متواصلة
                </span>
                <span className="mini-pill border-slate-200 bg-white/85 text-slate-700">
                  {completedToday}/{data.todayTasks.length || 0} من مهام اليوم
                </span>
                <span className="mini-pill border-slate-200 bg-white/85 text-slate-700">
                  {dashboardToneLabel}
                </span>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href={primaryResumeItem?.href ?? "/question-bank"}>
                  <Button className="gap-2 bg-[#1d4ed8] text-white shadow-[0_14px_32px_rgba(29,78,216,0.18)] hover:bg-[#1e40af]">
                    <Zap className="h-4 w-4" />
                    {primaryResumeItem ? primaryResumeItem.ctaLabel : "ابدأ الآن"}
                  </Button>
                </Link>
                <Link href="#today-plan">
                  <Button variant="outline" className="gap-2 border-slate-200 bg-white text-slate-800 hover:bg-slate-50">
                    <Target className="h-4 w-4" />
                    خطة اليوم
                  </Button>
                </Link>
                <Link href="/onboarding">
                  <Button variant="outline" className="gap-2 border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100">
                    <Compass className="h-4 w-4" />
                    ضبط الخطة
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-[2rem] border border-slate-200 bg-white/90 p-5 shadow-[0_16px_34px_rgba(15,23,42,0.05)]">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold tracking-[0.16em] text-slate-500">الإنجاز الأسبوعي</div>
                    <div className="mt-3 display-font text-3xl font-bold text-slate-950">{data.progressPercent}%</div>
                    <div className="mt-2 text-sm leading-7 text-slate-600">
                      تقدمك الكلي في الكمي واللفظي والخطة يظهر هنا بصورة واضحة وسريعة.
                    </div>
                  </div>
                  <ProgressRing value={data.progressPercent} label="إنجاز" tone="gold" />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4 text-slate-800">
                  <div className="text-xs text-slate-500">الاختبار القادم</div>
                  <div className="mt-2 display-font text-2xl font-bold text-slate-950">{formatDaysLeft(data.daysLeft)}</div>
                  <div className="mt-1 text-xs text-slate-500">{formatPortalDate(data.examDate)}</div>
                </div>
                <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 px-5 py-4 text-slate-800">
                  <div className="text-xs text-slate-500">إيقاع الخطة</div>
                  <div className="mt-2 display-font text-2xl font-bold text-slate-950">{planTypeLabels[data.planType]}</div>
                  <div className="mt-1 text-xs text-slate-500">{pressure.label}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="خطة اليوم"
              value={`${completedToday}/${data.todayTasks.length || 0}`}
              caption="أنجز المهمات اليومية ثم انتقل إلى المراجعة الذكية."
              icon={Target}
              className="border-emerald-200 bg-[linear-gradient(180deg,rgba(236,253,245,0.96),rgba(255,255,255,0.98))]"
              iconWrapClass="bg-emerald-100 text-emerald-700"
            />
            <MetricCard
              title="تقدم الكمي"
              value={`${data.quantProgressPercent}%`}
              caption={`المتبقي ${data.quantRemainingSections ?? "غير محدد"} قسم في هذا المسار.`}
              icon={BarChart3}
              className="border-sky-200 bg-[linear-gradient(180deg,rgba(240,249,255,0.96),rgba(255,255,255,0.98))]"
              iconWrapClass="bg-sky-100 text-sky-700"
            />
            <MetricCard
              title="تقدم اللفظي"
              value={`${data.verbalProgressPercent}%`}
              caption={`المتبقي ${data.verbalRemainingSections ?? "غير محدد"} قسم في هذا المسار.`}
              icon={Brain}
              className="border-amber-200 bg-[linear-gradient(180deg,rgba(255,251,235,0.96),rgba(255,255,255,0.98))]"
              iconWrapClass="bg-amber-100 text-amber-700"
            />
            <MetricCard
              title="أخطاء تحتاج مراجعة"
              value={String(data.activeMistakesCount)}
              caption={`${data.mistakeMasteryPercent}% نسبة الإتقان الحالية، و${data.mistakesInTrainingCount} سؤال في التدريب الآن.`}
              icon={TriangleAlert}
              className="border-rose-200 bg-[linear-gradient(180deg,rgba(255,241,242,0.96),rgba(255,255,255,0.98))]"
              iconWrapClass="bg-rose-100 text-rose-700"
            />
          </div>
        </CardContent>
        </Card>
      </Reveal>

      <Reveal delay={0.03}>
        <Card className="rounded-[2.1rem] border border-[#dde7f6] bg-white/96 shadow-[0_18px_44px_rgba(15,23,42,0.05)]">
          <CardContent className="space-y-5 p-6 md:p-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="section-eyebrow text-[#123B7A]">أكمل من آخر نقطة</p>
                <h3 className="display-font text-[clamp(1.5rem,2.4vw,2.2rem)] font-bold text-slate-950">
                  ادخل مباشرة إلى آخر ملف أو تدريب توقفت عنده
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  هذا أول قسم عملي تحت لوحتك، لأن أهم شيء للطالب أن يكمل من حيث توقف دون بحث طويل.
                </p>
              </div>
              <Link href={primaryResumeItem?.href ?? "/question-bank"}>
                <Button className="gap-2">
                  <Zap className="h-4 w-4" />
                  {primaryResumeItem?.ctaLabel ?? "أكمل الآن"}
                </Button>
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {data.resumeItems.slice(0, 2).map((item) => (
                <div
                  key={item.id}
                  className="rounded-[1.6rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.9))] p-5 shadow-[0_12px_28px_rgba(15,23,42,0.04)]"
                >
                  <div className="display-font text-lg font-bold text-slate-950">{item.title}</div>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{item.subtitle}</p>
                  <div className="mt-4">
                    <Link href={item.href}>
                      <Button variant="outline" className="gap-2">
                        {item.ctaLabel}
                        <ArrowLeft className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}

              <div className="rounded-[1.6rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(241,249,255,0.98),rgba(255,255,255,0.95))] p-5 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
                <div className="text-xs font-semibold text-slate-500">الخطوة التالية</div>
                <div className="mt-3 display-font text-lg font-bold text-slate-950">
                  {upcomingTask ? upcomingTask.title : secondaryResumeItem?.title ?? "ابدأ من بنك الأسئلة"}
                </div>
                <p className="mt-2 text-sm leading-7 text-slate-600">
                  {upcomingTask
                    ? "مهمتك التالية جاهزة داخل الخطة اليومية ويمكنك تنفيذها مباشرة من نفس اللوحة."
                    : secondaryResumeItem
                      ? secondaryResumeItem.subtitle
                      : "إذا لم يكن لديك سجل سابق واضح، ابدأ بجلسة مركزة قصيرة ثم ابنِ عليها."}
                </p>
                <div className="mt-4">
                  <Link href={upcomingTask ? "/my-plan" : secondaryResumeItem?.href ?? "/question-bank"}>
                    <Button variant="outline" className="gap-2">
                      افتح الآن
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Reveal>

      <Reveal delay={0.04}>
        <Card className="rounded-[2rem] border border-[#d9e7f9] bg-[linear-gradient(180deg,rgba(248,252,255,0.99),rgba(255,255,255,0.97))] shadow-[0_18px_42px_rgba(15,23,42,0.05)]">
          <CardContent className="space-y-5 p-6 md:p-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="section-eyebrow text-[#123B7A]">توصية اليوم</p>
                <h3 className="display-font text-[clamp(1.45rem,2.3vw,2.05rem)] font-bold text-slate-950">
                  ابدأ من الأكثر أثرًا اليوم
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  توصية قصيرة تساعدك على اختيار الخطوة التالية بدل التشتت بين الأقسام.
                </p>
              </div>
              <Badge className="bg-[#eef4ff] text-[#1d4ed8]">ذكية ومباشرة</Badge>
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.1fr,0.9fr]">
              <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-[#eef4ff] text-[#123B7A]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="display-font text-lg font-bold text-slate-950">
                      {data.recommendations[0] ?? "ابدأ اليوم بما يرفع ثباتك أولًا ثم انتقل إلى التدريب."}
                    </div>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {upcomingTask
                        ? `أفضل خطوة تالية لك الآن: ${upcomingTask.title}`
                        : secondaryResumeItem
                          ? `يمكنك بعد ذلك الانتقال إلى: ${secondaryResumeItem.title}`
                          : "لوحتك جاهزة لتبدأ من بنك الأسئلة أو تراجع الأخطاء مباشرة."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3">
                {data.recommendations.slice(1, 3).map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.4rem] border border-slate-200 bg-white/90 px-4 py-4 text-sm leading-7 text-slate-600"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </Reveal>

      <Reveal delay={0.05}>
        <Card className="rounded-[2.1rem] border border-[#dde7f6] bg-white/96 shadow-[0_18px_44px_rgba(15,23,42,0.05)]">
          <CardContent className="space-y-5 p-6 md:p-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="section-eyebrow text-[#123B7A]">ابدأ من هنا</p>
                <h3 className="display-font text-[clamp(1.5rem,2.4vw,2.2rem)] font-bold text-slate-950">
                  أربع خطوات واضحة بدل البحث الطويل
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  هذه أهم الأكشنات التي يحتاجها الطالب فور دخوله: ابدأ، راجع، أكمل، ثم تابع ترتيبك.
                </p>
              </div>
              <Link href="/question-bank">
                <Button variant="outline" className="gap-2">
                  <ClipboardList className="h-4 w-4" />
                  ابدأ تدريب الآن
                </Button>
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {heroQuickStartCards.map((item) => (
                <HeroQuickStartCard key={item.href + item.label} {...item} />
              ))}
            </div>
          </CardContent>
        </Card>
      </Reveal>

      {actionError ? (
        <div className="rounded-[1.4rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
          {actionError}
        </div>
      ) : null}

      <Reveal delay={0.08}>
      <div className="grid gap-6 xl:grid-cols-[1.18fr,0.82fr]">
        <div className="space-y-6">
          <Card
            id="today-plan"
            className="rounded-[2rem] border border-[#dbe6f6] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,250,255,0.96))] shadow-[0_18px_46px_rgba(18,59,122,0.08)]"
          >
            <CardContent className="space-y-5 p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="section-eyebrow text-[#123B7A]">الخطة اليومية</p>
                  <h3 className="display-font text-2xl font-bold text-slate-950">
                    {data.todayTasks.length ? `أنجزت ${completedToday} من ${data.todayTasks.length}` : "لا توجد مهام لليوم"}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-500">
                    مهام واضحة، تنفيذ سريع، وتحديث مباشر بمجرد إنهاء كل مهمة.
                  </p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${pressure.className}`}>
                  {pressure.label}
                </span>
              </div>

              {data.todayTasks.length ? (
                <div className="space-y-3">
                  {data.todayTasks.map((task) => (
                    <TaskRow key={task.id} task={task} pending={Boolean(taskState[task.id])} onToggle={handleToggleTask} />
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/70 p-6 text-sm leading-8 text-slate-600">
                  لا توجد مهام مجدولة اليوم حاليًا. يمكنك إعادة ضبط الخطة أو التوجه إلى بنك الأسئلة لبدء جلسة جديدة.
                </div>
              )}

              <div className="flex flex-wrap gap-3 pt-2">
                <Link href="/onboarding">
                  <Button className="gap-2">
                    <NotebookPen className="h-4 w-4" />
                    تعديل إعدادات الخطة
                  </Button>
                </Link>
                <Button
                  type="button"
                  variant="outline"
                  className="gap-2"
                  onClick={handleResetPlan}
                  disabled={actionState === "loading"}
                >
                  {actionState === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                  إعادة جدولة الخطة
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card
            className="rounded-[2rem] border border-slate-200 bg-white/98 shadow-[0_18px_42px_rgba(15,23,42,0.06)]"
            id="progress"
          >
            <CardContent className="space-y-5 p-8">
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
                          <Button variant="outline" className="gap-2">
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
                  <div className="mt-3 display-font text-2xl font-bold text-slate-950">
                    {data.weeklyGoal.targetQuestions} سؤالًا
                  </div>
                  <div className="mt-2 text-sm text-slate-500">
                    مع مراجعة {data.weeklyGoal.mistakesReview} سؤال من الأخطاء.
                  </div>
                </div>
                <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/70 p-4">
                  <div className="text-xs font-semibold text-slate-500">خطة الكمي</div>
                  <div className="mt-3 display-font text-2xl font-bold text-slate-950">
                    {data.weeklyGoal.quantSections} مقطع
                  </div>
                  <div className="mt-2 text-sm text-slate-500">حافظ على توزيع متوازن بدل التكديس في نهاية الأسبوع.</div>
                </div>
                <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/70 p-4">
                  <div className="text-xs font-semibold text-slate-500">خطة اللفظي</div>
                  <div className="mt-3 display-font text-2xl font-bold text-slate-950">
                    {data.weeklyGoal.verbalSections} مقطع
                  </div>
                  <div className="mt-2 text-sm text-slate-500">الاستمرار اليومي القصير أفضل من جلسة متأخرة وطويلة.</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <StudentAchievementsPanel data={data} sectionId="xp-progress" />
        </div>

        <div className="space-y-6">
          <Card className="rounded-[2rem] border border-[#f1dfb8] bg-[linear-gradient(180deg,rgba(255,252,245,0.99),rgba(255,255,255,0.96))] shadow-[0_18px_42px_rgba(183,121,31,0.10)]">
            <CardContent className="space-y-5 p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="section-eyebrow text-[#b7791f]">تحدي الشهر</p>
                  <h3 className="display-font text-2xl font-bold text-slate-950">
                    {data.challenge.currentTitle}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-500">
                    {data.challenge.countdownLabel}
                  </p>
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
                  <div className="mt-3 display-font text-2xl font-bold text-slate-950">
                    {data.challenge.currentStreak} يوم
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge
                  className={
                    data.challenge.xpMultiplier.active
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-700"
                  }
                >
                  {data.challenge.xpMultiplier.label}
                </Badge>
                <Badge
                  className={
                    data.challenge.rankProtection.active
                      ? "bg-[#fff7e8] text-[#b7791f]"
                      : "bg-slate-100 text-slate-700"
                  }
                >
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
                  <Button className="gap-2">
                    <Trophy className="h-4 w-4" />
                    افتح لوحة التحدي
                  </Button>
                </Link>
                <Link href="/question-bank?track=mistakes#mistakes-trainer">
                  <Button variant="outline" className="gap-2">
                    <Zap className="h-4 w-4" />
                    اجمع XP من الأخطاء
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border border-[#dbe6f6] bg-[linear-gradient(180deg,rgba(255,255,255,0.99),rgba(243,248,255,0.96))] shadow-[0_18px_42px_rgba(18,59,122,0.08)]">
            <CardContent className="space-y-5 p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="section-eyebrow text-[#123B7A]">تدرب على أخطائك</p>
                  <h3 className="display-font text-2xl font-bold text-slate-950">حوّل الأخطاء إلى إتقان</h3>
                  <p className="mt-2 text-sm leading-7 text-slate-500">
                    ابدأ جلسة مركزة من أخطائك السابقة، مع تتبع ذكي للحالات: أخطأت فيه، قيد التدريب، ثم أتقنته.
                  </p>
                </div>
                <ProgressRing value={data.mistakeMasteryPercent} label="إتقان" tone="gold" />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.4rem] border border-rose-200 bg-rose-50/80 p-4">
                  <div className="text-xs font-semibold text-rose-600">تحتاج مراجعة</div>
                  <div className="mt-3 display-font text-2xl font-bold text-rose-700">
                    {data.activeMistakesCount}
                  </div>
                </div>
                <div className="rounded-[1.4rem] border border-sky-200 bg-sky-50/80 p-4">
                  <div className="text-xs font-semibold text-sky-600">قيد التدريب</div>
                  <div className="mt-3 display-font text-2xl font-bold text-sky-700">
                    {data.mistakesInTrainingCount}
                  </div>
                </div>
                <div className="rounded-[1.4rem] border border-emerald-200 bg-emerald-50/80 p-4">
                  <div className="text-xs font-semibold text-emerald-600">أتقنتها</div>
                  <div className="mt-3 display-font text-2xl font-bold text-emerald-700">
                    {data.masteredMistakesCount}
                  </div>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-white/85 p-4">
                <div className="text-xs font-semibold text-slate-500">أكثر جزء يحتاج تركيزًا</div>
                <div className="mt-2 text-base font-bold text-slate-950">{weakestMistakeLabel}</div>
                <div className="mt-2 text-sm leading-7 text-slate-500">
                  نسبة التثبيت الحالية من كامل أخطائك هي {data.mistakeMasteryPercent}%، ومع كل جلسة ناجحة ستنتقل الأسئلة من
                  الأخطاء إلى التدريب ثم إلى الإتقان.
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href="/question-bank?track=mistakes#mistakes-trainer">
                  <Button className="gap-2">
                    <TriangleAlert className="h-4 w-4" />
                    ابدأ تدريب الأخطاء الآن
                  </Button>
                </Link>
                <Link href="/question-bank?track=mistakes">
                  <Button variant="outline" className="gap-2">
                    <Brain className="h-4 w-4" />
                    افتح لوحة الأخطاء
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border border-slate-200 bg-white/98 shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
            <CardContent className="space-y-5 p-8">
              <div>
                <p className="section-eyebrow text-[#123B7A]">آخر نشاطاتك</p>
                <h3 className="display-font text-2xl font-bold text-slate-950">آخر ما فعلته داخل المنصة</h3>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  سجل مختصر لآخر ما أنجزته أو فتحته حتى تعرف أين كنت وماذا يجب أن تكمل بعده.
                </p>
              </div>

              <div className="space-y-3">
                {recentActivityItems.length ? recentActivityItems.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[1.6rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.9))] p-4 shadow-[0_12px_28px_rgba(15,23,42,0.04)]"
                  >
                    <div className="display-font text-lg font-bold text-slate-950">{item.title}</div>
                    <p className="mt-2 text-sm leading-7 text-slate-600">{item.description}</p>
                    <div className="mt-4">
                      <Link href={item.href}>
                        <Button variant="outline" className="gap-2">
                          افتح هذا القسم
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                )) : (
                  <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/70 p-6 text-sm leading-8 text-slate-600">
                    لا يوجد نشاط حديث بعد. ابدأ من بنك الأسئلة أو الخطة اليومية وسيظهر سجلك هنا تلقائيًا.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="hidden rounded-[2rem] border border-slate-200 bg-white/98 shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
            <CardContent className="space-y-5 p-8">
              <div>
                <p className="section-eyebrow text-[#123B7A]">الأقسام الرئيسية</p>
                <h3 className="display-font text-2xl font-bold text-slate-950">لوحة بطاقات واضحة</h3>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  كل قسم رئيسي ظاهر كبطاقة مستقلة حتى يبدأ الطالب فورًا بدون بحث طويل.
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {quickActions.map((item) => (
                  <QuickActionCard key={item.href} href={item.href} label={item.label} description={item.description} icon={item.icon} />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="hidden rounded-[2rem] border border-slate-200 bg-white/98 shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
            <CardContent className="space-y-5 p-8">
              <div>
                <p className="section-eyebrow text-[#123B7A]">توصيات اليوم</p>
                <h3 className="display-font text-2xl font-bold text-slate-950">ابدأ من الأكثر أثرًا</h3>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  توصيات قصيرة تساعدك على اختيار أفضل خطوة تالية بدل التشتت بين الأقسام.
                </p>
              </div>

              <div className="space-y-3">
                {data.recommendations.map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.5rem] border border-slate-200 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,250,252,0.92))] p-4"
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] bg-[#eef4ff] text-[#123B7A]">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div className="text-sm leading-8 text-slate-600">{item}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.4rem] border border-[#E8D8B3] bg-[#fffaf0] px-4 py-4 text-sm font-semibold text-slate-700">
                  آخر استخدام: {formatLastActivity(data.lastActivityAt)}
                  {data.lastActivityLabel ? ` - ${data.lastActivityLabel}` : ""}
                </div>
                <div className="rounded-[1.4rem] border border-[#dcefe8] bg-[#f0fdf7] px-4 py-4 text-sm font-semibold text-slate-700">
                  {upcomingTask
                    ? `التالي في الخطة: ${upcomingTask.title}`
                    : secondaryResumeItem
                      ? `بعدها مباشرة: ${secondaryResumeItem.title}`
                      : "لوحتك جاهزة لتبدأ من أي قسم الآن."}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </Reveal>
      <MobileQuickDock />
    </div>
  );
}
