"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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

function safeNumber(value: unknown, fallback = 0) {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : fallback;
}

function safeNullableNumber(value: unknown) {
  const normalized = Number(value);
  return Number.isFinite(normalized) ? normalized : null;
}

function safeText(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function safeOptionalText(value: unknown) {
  return typeof value === "string" && value.trim() ? value : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function normalizeTaskKind(
  value: unknown,
): StudentPortalTask["taskKind"] {
  return value === "diagnostic" ||
    value === "practice" ||
    value === "review" ||
    value === "mock_exam"
    ? value
    : "practice";
}

function normalizePlanType(value: unknown) {
  return value === "light" || value === "medium" || value === "intensive"
    ? value
    : "medium";
}

const trainingTracks = [
  {
    key: "quant",
    title: "المسار الكمي",
    description: "حسابي، هندسي، مقارنات ومسائل تحتاج متابعة منتظمة وواضحة.",
    accentClass:
      "border-[#d7e5ff] bg-[#f8fbff]",
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
      "border-[#d5f0ec] bg-[#f4fdfa]",
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
      <CardContent className="flex items-start justify-between gap-4 p-4 sm:p-5">
        <div className="min-w-0">
          <div className="text-xs font-semibold tracking-[0.14em] text-slate-400">{title}</div>
          <div className="mt-3 display-font text-2xl font-extrabold text-slate-950 sm:text-3xl">{value}</div>
          <div className="mt-2 text-sm leading-7 text-slate-500">{caption}</div>
        </div>
        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-[1.15rem] sm:h-14 sm:w-14 ${iconWrapClass}`}>
          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
        </div>
      </CardContent>
    </Card>
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
        "group rounded-[1.6rem] border bg-white p-4 shadow-[0_16px_34px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_24px_48px_rgba(15,23,42,0.08)] sm:rounded-[1.8rem] sm:p-5",
        borderClass,
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mini-pill">{badge}</div>
          <div className="mt-3 display-font text-lg font-bold text-slate-950 sm:text-xl">{label}</div>
          <div className="mt-2 text-sm leading-7 text-slate-500">{description}</div>
        </div>
        <div className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] sm:h-12 sm:w-12", iconWrapClass)}>
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
    { href: "/dashboard", label: "لوحتي", icon: Compass },
    { href: "/my-plan", label: "الخطة", icon: Target },
    { href: "/question-bank", label: "الأسئلة", icon: ClipboardList },
    { href: "/question-bank?track=mistakes", label: "المراجعة", icon: TriangleAlert },
  ];

  return (
    <div className="fixed inset-x-3 bottom-3 z-[140] lg:hidden [padding-bottom:env(safe-area-inset-bottom)]">
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

function DashboardFallbackMetric({
  title,
  value,
  caption,
}: {
  title: string;
  value: string;
  caption: string;
}) {
  return (
    <div className="rounded-[1.5rem] border border-slate-200 bg-white/92 p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <div className="text-xs font-semibold tracking-[0.14em] text-slate-400">{title}</div>
      <div className="mt-3 display-font text-2xl font-extrabold text-slate-950 sm:text-3xl">{value}</div>
      <div className="mt-2 text-sm leading-7 text-slate-500">{caption}</div>
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
      <Card className="overflow-hidden rounded-[2rem] border border-[#dbe7f5] bg-white shadow-[0_22px_54px_rgba(15,23,42,0.06)] sm:rounded-[2.5rem]">
        <CardContent className="space-y-6 p-5 sm:space-y-8 sm:p-6 lg:p-8">
          <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr] xl:gap-8">
            <div>
              <Badge className="border border-[#d7e5ff] bg-[#eef4ff] text-[#1d4ed8] shadow-none">
                لوحة الطالب
              </Badge>
              <h2 className="mt-4 max-w-[12ch] display-font text-[clamp(1.7rem,4.1vw,3.2rem)] font-extrabold leading-[1.18] text-slate-950">
                {isLoading ? "جار تجهيز بيانات لوحتك الآن" : "صار خلل بسيط في بيانات اللوحة"}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
                {isLoading
                  ? "نحمّل الخطة والتقدم وآخر النشاطات الآن. أثناء ذلك تظل المسارات الأساسية والانتقال السريع متاحة لك بدون انتظار."
                  : "تعثر طلب بيانات لوحة الطالب الآن، لكن تقدر تكمل مباشرة من الخطة اليومية أو بنك الأسئلة أو تعيد المحاولة من هنا."}
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
                    ? "سيتم عرض التقدم والمهام فور اكتمال الاستجابة."
                    : "بمجرد نجاح إعادة المحاولة ستعود الإحصاءات والمهام كما كانت."}
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

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <DashboardFallbackMetric
              title="مهام اليوم"
              value={isLoading ? "..." : "--"}
              caption="ستظهر هنا خطة اليوم فور وصول البيانات."
            />
            <DashboardFallbackMetric
              title="التقدم الكمي"
              value={isLoading ? "..." : "--"}
              caption="يبقى هذا القسم جاهزًا بعد أول استجابة ناجحة."
            />
            <DashboardFallbackMetric
              title="التقدم اللفظي"
              value={isLoading ? "..." : "--"}
              caption="سنملأ هذا المؤشر تلقائيًا عند رجوع البيانات."
            />
            <DashboardFallbackMetric
              title="مراجعة الأخطاء"
              value={isLoading ? "..." : "--"}
              caption="يمكنك الدخول إلى قسم الأخطاء حتى أثناء التعثر."
            />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[2rem] border border-[#dde7f6] bg-white/96 shadow-[0_18px_44px_rgba(15,23,42,0.05)]">
        <CardContent className="space-y-5 p-5 sm:p-6 lg:p-8">
          <div>
            <p className="section-eyebrow text-[#123B7A]">ابدأ الآن</p>
            <h3 className="display-font text-[clamp(1.45rem,2.3vw,2rem)] font-bold text-slate-950">
              المسارات الرئيسية ما زالت متاحة
            </h3>
            <p className="mt-2 text-sm leading-7 text-slate-500">
              لا نوقفك بسبب تعثر مؤقت. اختر ما تريد متابعته الآن ثم ارجع لاحقًا للوحة الكاملة.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <HeroQuickStartCard
              href="/my-plan"
              label="ابدأ الخطة اليومية"
              description="افتح مهام اليوم وتابع التنفيذ مباشرة بدون انتظار تحميل اللوحة."
              badge="الخطة"
              icon={Target}
              iconWrapClass="bg-[#edfdf3] text-[#2f855a]"
              borderClass="border-[#d9f2e1] hover:border-[#9fdfb7]"
            />
            <HeroQuickStartCard
              href="/question-bank"
              label="ادخل بنك الأسئلة"
              description="ابدأ تدريبًا كميًا أو لفظيًا فورًا حتى لو كانت بيانات اللوحة تتأخر."
              badge="التدريب"
              icon={ClipboardList}
              iconWrapClass="bg-[#eef4ff] text-[#123B7A]"
              borderClass="border-[#d8e5f7] hover:border-[#bfd3f3]"
            />
            <HeroQuickStartCard
              href="/question-bank?track=mistakes#mistakes-trainer"
              label="راجع أخطاءك"
              description="إذا كانت لديك أخطاء محفوظة، يمكنك متابعة تدريبها مباشرة من هذا المسار."
              badge="الأخطاء"
              icon={TriangleAlert}
              iconWrapClass="bg-[#fff1f2] text-[#dc2626]"
              borderClass="border-[#ffd4da] hover:border-[#f8a8b5]"
            />
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
        description="سجل دخولك أولًا حتى تظهر لك خطة اليوم، نسبة الإنجاز، آخر نشاط، وأسرع انتقال إلى بنك الأسئلة والأخطاء والملخصات."
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
        title: typeof task.title === "string" && task.title.trim() ? task.title : "مهمة يومية",
        description: typeof task.description === "string" ? task.description : null,
        scheduledFor:
          typeof task.scheduledFor === "string" && task.scheduledFor.trim()
            ? task.scheduledFor
            : new Date().toISOString().slice(0, 10),
        estimatedMinutes: Number.isFinite(Number(task.estimatedMinutes))
          ? Number(task.estimatedMinutes)
          : null,
        targetQuestions: Number.isFinite(Number(task.targetQuestions))
          ? Number(task.targetQuestions)
          : null,
        isCompleted: Boolean(task.isCompleted),
      }))
    : [];
  const upcomingTasks = Array.isArray(data.upcomingTasks)
    ? data.upcomingTasks.map((task) => ({
        ...task,
        title: typeof task.title === "string" && task.title.trim() ? task.title : "مهمة قادمة",
        description: typeof task.description === "string" ? task.description : null,
        scheduledFor:
          typeof task.scheduledFor === "string" && task.scheduledFor.trim()
            ? task.scheduledFor
            : new Date().toISOString().slice(0, 10),
        estimatedMinutes: Number.isFinite(Number(task.estimatedMinutes))
          ? Number(task.estimatedMinutes)
          : null,
        targetQuestions: Number.isFinite(Number(task.targetQuestions))
          ? Number(task.targetQuestions)
          : null,
        isCompleted: Boolean(task.isCompleted),
      }))
    : [];
  const resumeItems = Array.isArray(data.resumeItems)
    ? data.resumeItems
        .map((item, index) => ({
          id:
            typeof item.id === "string" && item.id.trim() ? item.id : `resume-item-${index + 1}`,
          title:
            typeof item.title === "string" && item.title.trim() ? item.title : "متابعة سريعة",
          subtitle:
            typeof item.subtitle === "string" && item.subtitle.trim()
              ? item.subtitle
              : "افتح هذا المسار لإكمال ما توقفت عنده.",
          href: typeof item.href === "string" && item.href.trim() ? item.href : "/question-bank",
          ctaLabel:
            typeof item.ctaLabel === "string" && item.ctaLabel.trim()
              ? item.ctaLabel
              : "أكمل الآن",
        }))
        .slice(0, 3)
    : [];
  const recommendations =
    Array.isArray(data.recommendations) && data.recommendations.length
      ? data.recommendations.filter(
          (item): item is string => typeof item === "string" && item.trim().length > 0,
        )
      : ["ابدأ بجلسة قصيرة من القسم الذي يحتاجه مستواك الآن."];
  const recentSolvedQuestions = Array.isArray(data.recentSolvedQuestions)
    ? data.recentSolvedQuestions
    : [];
  const challenge = {
    currentTitle: data.challenge?.currentTitle ?? "تحدي الشهر",
    monthlyRank: data.challenge?.monthlyRank ?? null,
    monthlyXp: Number(data.challenge?.monthlyXp ?? 0),
    currentStreak: Number(data.challenge?.currentStreak ?? 0),
    countdownLabel: data.challenge?.countdownLabel ?? "تابع ترتيبك الشهري داخل المنصة.",
    nextMonthlyRankGap: data.challenge?.nextMonthlyRankGap ?? null,
    xpMultiplier: {
      active: Boolean(data.challenge?.xpMultiplier?.active),
      label: data.challenge?.xpMultiplier?.label ?? "مضاعفة XP غير مفعلة الآن",
      description:
        data.challenge?.xpMultiplier?.description ?? "استمر في الحل اليومي لرفع نقاطك تدريجيًا.",
    },
    rankProtection: {
      active: Boolean(data.challenge?.rankProtection?.active),
      label: data.challenge?.rankProtection?.label ?? "بدون حماية مركز حاليًا",
      description:
        data.challenge?.rankProtection?.description ??
        "كلما تقدمت في الترتيب ستظهر لك حماية المركز تلقائيًا.",
    },
  };
  const weeklyGoal = {
    quantSections: Number(data.weeklyGoal?.quantSections ?? 0),
    verbalSections: Number(data.weeklyGoal?.verbalSections ?? 0),
    targetQuestions: Number(data.weeklyGoal?.targetQuestions ?? 0),
    mistakesReview: Number(data.weeklyGoal?.mistakesReview ?? 0),
  };
  const xpProgressPercent = Number(data.xp?.progressPercent ?? 0);
  const pressure = pressureConfig[data.planPressure] ?? pressureConfig.balanced;
  const normalizedFullName = (data.fullName ?? "").trim();
  const firstName = normalizedFullName.split(/\s+/)[0] || normalizedFullName || "الطالب";
  const primaryResumeItem = resumeItems[0] ?? null;
  const secondaryResumeItem = resumeItems[1] ?? null;
  const upcomingTask = upcomingTasks[0] ?? null;
  const completedToday = todayTasks.filter((task) => task.isCompleted).length;
  const weakestMistakeLabel = data.weakestMistakeLabel ?? "لم تتضح نقطة ضعف واحدة بعد";
  const dashboardToneLabel =
    todayTasks.length > 0 && completedToday >= Math.max(1, Math.ceil(todayTasks.length / 2))
      ? "أنت ممتاز اليوم"
      : challenge.currentStreak >= 5
        ? "ثبات رائع هذا الأسبوع"
        : "جاهز تبدأ بخطوة واضحة";
  const heroQuickStartCards = [
    {
      href: "/my-plan",
      label: "ابدأ الخطة اليومية",
      description: todayTasks.length
        ? `لديك ${todayTasks.length} مهام لليوم، أنجز منها ${completedToday} حتى الآن.`
        : "افتح الخطة اليومية ورتب أول خطوة دراسية بشكل واضح.",
      badge: "الخطة",
      icon: Target,
      iconWrapClass: "bg-[#edfdf3] text-[#2f855a]",
      borderClass: "border-[#d9f2e1] hover:border-[#9fdfb7]",
    },
    {
      href: "/question-bank",
      label: "ادخل بنك الأسئلة",
      description: "ابدأ تدريبًا كميًا أو لفظيًا مباشرة من القسم الأنسب لك الآن.",
      badge: "التدريب",
      icon: ClipboardList,
      iconWrapClass: "bg-[#eef4ff] text-[#123B7A]",
      borderClass: "border-[#d8e5f7] hover:border-[#bfd3f3]",
    },
    {
      href: "/question-bank?track=mistakes#mistakes-trainer",
      label: "راجع الأخطاء",
      description: `${data.activeMistakesCount} سؤال يحتاج مراجعة، ونسبة الإتقان الحالية ${data.mistakeMasteryPercent}%.`,
      badge: "الأخطاء",
      icon: TriangleAlert,
      iconWrapClass: "bg-[#fff1f2] text-[#dc2626]",
      borderClass: "border-[#ffd4da] hover:border-[#f8a8b5]",
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

      const safeRecentSolvedQuestions = recentSolvedQuestions.map((question) => ({
        ...question,
        categoryTitle: typeof question.categoryTitle === "string" ? question.categoryTitle : "",
        questionTypeLabel:
          typeof question.questionTypeLabel === "string" ? question.questionTypeLabel : "",
        questionText: typeof question.questionText === "string" ? question.questionText : "",
        questionHref: typeof question.questionHref === "string" ? question.questionHref : null,
        section: question.section === "quantitative" ? "quantitative" : "verbal",
      }));

      safeRecentSolvedQuestions.slice(0, 3).forEach((question, index) => {
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
    [data.lastActivityAt, data.lastActivityLabel, recentSolvedQuestions, primaryResumeItem?.href],
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
    <div className="space-y-6 pb-24 sm:space-y-8 lg:pb-0">
      <StudentPlanSetupNotice onboardingCompleted={data.onboardingCompleted} />

      {error ? (
        <Card className="rounded-[1.7rem] border border-amber-200 bg-amber-50/80 shadow-[0_10px_28px_rgba(217,119,6,0.08)]">
          <CardContent className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="min-w-0">
              <div className="text-sm font-bold text-amber-800">تعذر تحديث بعض بيانات اللوحة الآن</div>
              <p className="mt-1 text-sm leading-7 text-amber-900/80">
                نعرض لك آخر نسخة محفوظة حتى لا تتوقف. يمكنك إعادة المزامنة الآن أو متابعة
                الخطة والتدريب كالمعتاد.
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
          جار تحديث بيانات لوحة الطالب في الخلفية...
        </div>
      ) : null}

      <Reveal>
        <Card className="overflow-hidden rounded-[2rem] border border-[#dbe7f5] bg-white shadow-[0_22px_54px_rgba(15,23,42,0.06)] sm:rounded-[2.5rem]">
        <CardContent className="space-y-6 p-5 sm:space-y-8 sm:p-6 lg:p-8">
          <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr] xl:gap-8">
            <div>
              <Badge className="border border-[#d7e5ff] bg-[#eef4ff] text-[#1d4ed8] shadow-none">لوحة الطالب</Badge>
              <h2 className="mt-4 max-w-[11ch] display-font text-[clamp(1.7rem,4.1vw,3.45rem)] font-extrabold leading-[1.18] text-slate-950 sm:max-w-[12ch]">
                أهلًا يا {firstName}، نبدأ من هنا
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
                هذه لوحة عملية وليست نصوصًا فقط: أكمل من آخر نقطة، افتح خطة اليوم، وادخل مباشرة إلى الأقسام التي تحتاجها الآن.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="mini-pill border-slate-200 bg-white/85 text-slate-700">
                  {challenge.currentStreak} أيام متواصلة
                </span>
                <span className="mini-pill border-slate-200 bg-white/85 text-slate-700">
                  {completedToday}/{todayTasks.length || 0} من مهام اليوم
                </span>
                <span className="mini-pill border-slate-200 bg-white/85 text-slate-700">
                  {dashboardToneLabel}
                </span>
              </div>

              <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
                <Link href={primaryResumeItem?.href ?? "/question-bank"}>
                  <Button className="w-full gap-2 bg-[#1d4ed8] text-white shadow-[0_14px_32px_rgba(29,78,216,0.18)] hover:bg-[#1e40af] sm:w-auto">
                    <Zap className="h-4 w-4" />
                    {primaryResumeItem ? primaryResumeItem.ctaLabel : "ابدأ الآن"}
                  </Button>
                </Link>
                <Link href="#today-plan">
                  <Button variant="outline" className="w-full gap-2 border-slate-200 bg-white text-slate-800 hover:bg-slate-50 sm:w-auto">
                    <Target className="h-4 w-4" />
                    خطة اليوم
                  </Button>
                </Link>
                <Link href="/onboarding">
                  <Button variant="outline" className="w-full gap-2 border-teal-200 bg-teal-50 text-teal-700 hover:bg-teal-100 sm:w-auto">
                    <Compass className="h-4 w-4" />
                    ضبط الخطة
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-[1.7rem] border border-slate-200 bg-white/90 p-4 shadow-[0_16px_34px_rgba(15,23,42,0.05)] sm:rounded-[2rem] sm:p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-xs font-semibold tracking-[0.16em] text-slate-500">الإنجاز الأسبوعي</div>
                    <div className="mt-3 display-font text-2xl font-bold text-slate-950 sm:text-3xl">{data.progressPercent}%</div>
                    <div className="mt-2 text-sm leading-7 text-slate-600">
                      تقدمك الكلي في الكمي واللفظي والخطة يظهر هنا بصورة واضحة وسريعة.
                    </div>
                  </div>
                  <ProgressRing value={data.progressPercent} label="إنجاز" tone="gold" />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-2">
                <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4 text-slate-800 sm:px-5">
                  <div className="text-xs text-slate-500">الاختبار القادم</div>
                  <div className="mt-2 display-font text-xl font-bold text-slate-950 sm:text-2xl">{formatDaysLeft(data.daysLeft)}</div>
                  <div className="mt-1 text-xs text-slate-500">{formatPortalDate(data.examDate)}</div>
                </div>
                <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50 px-4 py-4 text-slate-800 sm:px-5">
                  <div className="text-xs text-slate-500">إيقاع الخطة</div>
                  <div className="mt-2 display-font text-xl font-bold text-slate-950 sm:text-2xl">{planTypeLabels[data.planType]}</div>
                  <div className="mt-1 text-xs text-slate-500">{pressure.label}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <MetricCard
              title="خطة اليوم"
              value={`${completedToday}/${todayTasks.length || 0}`}
              caption="أنجز المهمات اليومية ثم انتقل إلى المراجعة الذكية."
              icon={Target}
              className="border-emerald-200 bg-emerald-50/70"
              iconWrapClass="bg-emerald-100 text-emerald-700"
            />
            <MetricCard
              title="تقدم الكمي"
              value={`${data.quantProgressPercent}%`}
              caption={`المتبقي ${data.quantRemainingSections ?? "غير محدد"} قسم في هذا المسار.`}
              icon={BarChart3}
              className="border-sky-200 bg-sky-50/70"
              iconWrapClass="bg-sky-100 text-sky-700"
            />
            <MetricCard
              title="تقدم اللفظي"
              value={`${data.verbalProgressPercent}%`}
              caption={`المتبقي ${data.verbalRemainingSections ?? "غير محدد"} قسم في هذا المسار.`}
              icon={Brain}
              className="border-amber-200 bg-amber-50/70"
              iconWrapClass="bg-amber-100 text-amber-700"
            />
            <MetricCard
              title="أخطاء تحتاج مراجعة"
              value={String(data.activeMistakesCount)}
              caption={`${data.mistakeMasteryPercent}% نسبة الإتقان الحالية، و${data.mistakesInTrainingCount} سؤال في التدريب الآن.`}
              icon={TriangleAlert}
              className="border-rose-200 bg-rose-50/70"
              iconWrapClass="bg-rose-100 text-rose-700"
            />
          </div>
        </CardContent>
        </Card>
      </Reveal>

      <Reveal delay={0.03}>
        <Card className="rounded-[2.1rem] border border-[#dde7f6] bg-white/96 shadow-[0_18px_44px_rgba(15,23,42,0.05)]">
          <CardContent className="space-y-5 p-5 sm:p-6 lg:p-8">
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
                <Button className="w-full gap-2 sm:w-auto">
                  <Zap className="h-4 w-4" />
                  {primaryResumeItem?.ctaLabel ?? "أكمل الآن"}
                </Button>
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {resumeItems.slice(0, 2).map((item) => (
                <div
                  key={item.id}
                  className="rounded-[1.6rem] border border-slate-200 bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.04)]"
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
              ))}

              <div className="rounded-[1.6rem] border border-slate-200 bg-sky-50/60 p-5 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
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
                    <Button variant="outline" className="w-full gap-2 sm:w-auto">
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
        <div className="grid gap-6 xl:grid-cols-[1.02fr,0.98fr]">
          <Card className="rounded-[2.1rem] border border-[#dde7f6] bg-white/96 shadow-[0_18px_44px_rgba(15,23,42,0.05)]">
            <CardContent className="space-y-5 p-5 sm:p-6 lg:p-8">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="section-eyebrow text-[#123B7A]">ابدأ الآن</p>
                  <h3 className="display-font text-[clamp(1.5rem,2.4vw,2.15rem)] font-bold text-slate-950">
                    ثلاث خطوات عملية واضحة
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-500">
                    افتح الخطة اليومية، ادخل بنك الأسئلة، ثم راجع الأخطاء. هذه أهم 3 خطوات يحتاجها الطالب فور دخوله.
                  </p>
                </div>
                <Link href="/question-bank">
                  <Button variant="outline" className="w-full gap-2 sm:w-auto">
                    <ClipboardList className="h-4 w-4" />
                    ابدأ تدريب الآن
                  </Button>
                </Link>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {heroQuickStartCards.map((item) => (
                  <HeroQuickStartCard key={item.href + item.label} {...item} />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border border-[#d9e7f9] bg-white shadow-[0_18px_42px_rgba(15,23,42,0.05)]">
            <CardContent className="space-y-5 p-5 sm:p-6 lg:p-8">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="section-eyebrow text-[#123B7A]">توصية اليوم</p>
                  <h3 className="display-font text-[clamp(1.45rem,2.3vw,2rem)] font-bold text-slate-950">
                    ابدأ من الأكثر أثرًا اليوم
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-500">
                    توصية ذكية مختصرة تساعدك على معرفة أفضل خطوة تالية بدل التشتت بين الأقسام.
                  </p>
                </div>
                <Badge className="bg-[#eef4ff] text-[#1d4ed8]">ذكية ومباشرة</Badge>
              </div>

              <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-[0_12px_28px_rgba(15,23,42,0.04)]">
                <div className="flex items-start gap-3">
                  <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-[#eef4ff] text-[#123B7A]">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="display-font text-lg font-bold text-slate-950">
                      {recommendations[0] ?? "ابدأ اليوم بما يرفع ثباتك أولًا ثم انتقل إلى التدريب."}
                    </div>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      {upcomingTask
                        ? `أفضل خطوة تالية لك الآن: ${upcomingTask.title}`
                        : secondaryResumeItem
                          ? `بعدها مباشرة يمكنك الانتقال إلى: ${secondaryResumeItem.title}`
                          : "لوحتك جاهزة لتبدأ من بنك الأسئلة أو تراجع الأخطاء مباشرة."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {recommendations.slice(1, 3).map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.4rem] border border-slate-200 bg-white/90 px-4 py-4 text-sm leading-7 text-slate-600"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="pt-1">
                <Link href={upcomingTask ? "/my-plan" : secondaryResumeItem?.href ?? "/question-bank"}>
                  <Button variant="outline" className="w-full gap-2 sm:w-auto">
                    افتح التوصية الآن
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

      <Reveal delay={0.08}>
      <div className="grid gap-6 xl:grid-cols-[1.18fr,0.82fr]">
        <div className="grid gap-6">
          <Card
            id="today-plan"
            className="rounded-[2rem] border border-[#dbe6f6] bg-white shadow-[0_18px_46px_rgba(18,59,122,0.08)]"
          >
            <CardContent className="space-y-5 p-5 sm:p-6 lg:p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="section-eyebrow text-[#123B7A]">الخطة اليومية</p>
                  <h3 className="display-font text-2xl font-bold text-slate-950">
                    {todayTasks.length ? `أنجزت ${completedToday} من ${todayTasks.length}` : "لا توجد مهام لليوم"}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-500">
                    مهام واضحة، تنفيذ سريع، وتحديث مباشر بمجرد إنهاء كل مهمة.
                  </p>
                </div>
                <span className={`rounded-full border px-3 py-1 text-xs font-bold ${pressure.className}`}>
                  {pressure.label}
                </span>
              </div>

              {todayTasks.length ? (
                <div className="space-y-3">
                  {todayTasks.map((task) => (
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
                  <Button className="w-full gap-2 sm:w-auto">
                    <NotebookPen className="h-4 w-4" />
                    تعديل إعدادات الخطة
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

          <Card
            className="rounded-[2rem] border border-slate-200 bg-white/98 shadow-[0_18px_42px_rgba(15,23,42,0.06)]"
            id="progress"
          >
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
                  <div className="mt-3 display-font text-2xl font-bold text-slate-950">
                    {weeklyGoal.targetQuestions} سؤالًا
                  </div>
                  <div className="mt-2 text-sm text-slate-500">
                    مع مراجعة {weeklyGoal.mistakesReview} سؤال من الأخطاء.
                  </div>
                </div>
                <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/70 p-4">
                  <div className="text-xs font-semibold text-slate-500">خطة الكمي</div>
                  <div className="mt-3 display-font text-2xl font-bold text-slate-950">
                    {weeklyGoal.quantSections} مقطع
                  </div>
                  <div className="mt-2 text-sm text-slate-500">حافظ على توزيع متوازن بدل التكديس في نهاية الأسبوع.</div>
                </div>
                <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/70 p-4">
                  <div className="text-xs font-semibold text-slate-500">خطة اللفظي</div>
                  <div className="mt-3 display-font text-2xl font-bold text-slate-950">
                    {weeklyGoal.verbalSections} مقطع
                  </div>
                  <div className="mt-2 text-sm text-slate-500">الاستمرار اليومي القصير أفضل من جلسة متأخرة وطويلة.</div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        <div className="grid gap-6">
          <Card className="order-3 rounded-[2rem] border border-[#f1dfb8] bg-white shadow-[0_18px_42px_rgba(183,121,31,0.10)]">
            <CardContent className="space-y-5 p-5 sm:p-6 lg:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="section-eyebrow text-[#b7791f]">تحدي الشهر</p>
                  <h3 className="display-font text-2xl font-bold text-slate-950">
                    {challenge.currentTitle}
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-500">
                    {challenge.countdownLabel}
                  </p>
                </div>
                <ProgressRing value={xpProgressPercent} label="XP" tone="gold" />
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.4rem] border border-amber-200 bg-amber-50/80 p-4">
                  <div className="text-xs font-semibold text-amber-700">ترتيبك الشهري</div>
                  <div className="mt-3 display-font text-2xl font-bold text-slate-950">
                    {challenge.monthlyRank ? `#${challenge.monthlyRank}` : "خارج الترتيب"}
                  </div>
                </div>
                <div className="rounded-[1.4rem] border border-slate-200 bg-white p-4">
                  <div className="text-xs font-semibold text-slate-500">XP هذا الشهر</div>
                  <div className="mt-3 display-font text-2xl font-bold text-slate-950">
                    {challenge.monthlyXp.toLocaleString("en-US")}
                  </div>
                </div>
                <div className="rounded-[1.4rem] border border-slate-200 bg-white p-4">
                  <div className="text-xs font-semibold text-slate-500">السلسلة الحالية</div>
                  <div className="mt-3 display-font text-2xl font-bold text-slate-950">
                    {challenge.currentStreak} يوم
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge
                  className={
                    challenge.xpMultiplier.active
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-slate-100 text-slate-700"
                  }
                >
                  {challenge.xpMultiplier.label}
                </Badge>
                <Badge
                  className={
                    challenge.rankProtection.active
                      ? "bg-[#fff7e8] text-[#b7791f]"
                      : "bg-slate-100 text-slate-700"
                  }
                >
                  {challenge.rankProtection.label}
                </Badge>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-white/85 p-4 text-sm leading-8 text-slate-600">
                {challenge.rankProtection.active
                  ? challenge.rankProtection.description
                  : challenge.nextMonthlyRankGap
                  ? `تبقى لك ${challenge.nextMonthlyRankGap.toLocaleString("en-US")} XP للوصول إلى المركز التالي في التحدي.`
                  : challenge.xpMultiplier.description}
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

          <Card className="order-1 rounded-[2rem] border border-[#dbe6f6] bg-white shadow-[0_18px_42px_rgba(18,59,122,0.08)]">
            <CardContent className="space-y-5 p-5 sm:p-6 lg:p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="section-eyebrow text-[#123B7A]">أخطاء تحتاج مراجعة</p>
                  <h3 className="display-font text-2xl font-bold text-slate-950">راجعها الآن قبل أن تتكرر</h3>
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
                  <Button className="w-full gap-2 sm:w-auto">
                    <TriangleAlert className="h-4 w-4" />
                    ابدأ تدريب الأخطاء الآن
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

          <Card className="order-2 rounded-[2rem] border border-slate-200 bg-white/98 shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
            <CardContent className="space-y-5 p-5 sm:p-6 lg:p-8">
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
                )) : (
                  <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/70 p-6 text-sm leading-8 text-slate-600">
                    لا يوجد نشاط حديث بعد. ابدأ من بنك الأسئلة أو الخطة اليومية وسيظهر سجلك هنا تلقائيًا.
                  </div>
                )}
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

