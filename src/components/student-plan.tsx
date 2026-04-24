"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowLeft,
  BookOpenCheck,
  CalendarDays,
  CheckCheck,
  ChevronDown,
  ChevronUp,
  Clock3,
  Loader2,
  NotebookPen,
  RefreshCcw,
  Sparkles,
  Target,
  type LucideIcon,
} from "lucide-react";

import { Reveal } from "@/components/reveal";
import { StudentAccessCard } from "@/components/student-access-card";
import {
  StudentPortalErrorCard,
  StudentPortalLoadingCard,
  StudentPlanSetupNotice,
  formatDaysLeft,
  formatPortalDate,
  planTypeLabels,
  pressureConfig,
} from "@/components/student-portal-shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useStudentPortal } from "@/hooks/use-student-portal";
import type { StudentPortalTask } from "@/lib/student-portal";
import { cn } from "@/lib/utils";

type PlanAction = "reset" | "postpone_today";

const taskKindLabels: Record<StudentPortalTask["taskKind"], string> = {
  diagnostic: "تشخيص",
  practice: "تدريب",
  review: "مراجعة",
  mock_exam: "نموذج",
};

const taskKindTone: Record<StudentPortalTask["taskKind"], string> = {
  diagnostic: "bg-sky-50 text-sky-700 border-sky-200",
  practice: "bg-blue-50 text-blue-700 border-blue-200",
  review: "bg-amber-50 text-amber-700 border-amber-200",
  mock_exam: "bg-violet-50 text-violet-700 border-violet-200",
};

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

async function runPlanAction(action: PlanAction) {
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

function PlanHeroStat({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
}) {
  return (
    <div className="rounded-[1.3rem] border border-white/12 bg-white/6 p-4 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-white/70">{title}</div>
          <div className="mt-2 display-font text-2xl font-bold sm:text-[1.85rem]">{value}</div>
          <div className="mt-1 text-xs text-white/65">{subtitle}</div>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-[0.95rem] bg-white/12 text-white/90">
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function TodayTaskItem({
  task,
  pending,
  onToggle,
}: {
  task: StudentPortalTask;
  pending: boolean;
  onToggle: (task: StudentPortalTask, nextValue: boolean) => void;
}) {
  return (
    <div className="rounded-[1.35rem] border border-slate-200 bg-white px-4 py-3.5 shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition-transform duration-200 hover:-translate-y-0.5">
      <div className="flex items-start gap-3">
        <button
          type="button"
          disabled={pending}
          onClick={() => onToggle(task, !task.isCompleted)}
          className={cn(
            "mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
            task.isCompleted
              ? "border-[#123B7A] bg-[#123B7A] text-white"
              : "border-slate-300 bg-white text-transparent",
            pending && "cursor-wait opacity-75",
          )}
          aria-label={task.isCompleted ? "إلغاء إتمام المهمة" : "إتمام المهمة"}
        >
          {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCheck className="h-3.5 w-3.5" />}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="display-font text-base font-bold text-slate-950 sm:text-lg">{task.title}</div>
            <span
              className={cn(
                "rounded-full border px-2.5 py-1 text-[11px] font-bold",
                taskKindTone[task.taskKind],
              )}
            >
              {taskKindLabels[task.taskKind]}
            </span>
          </div>

          {task.description ? (
            <p className="mt-2 text-sm leading-7 text-slate-600">{task.description}</p>
          ) : null}

          <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-slate-500">
            {task.targetQuestions ? (
              <span className="rounded-full bg-slate-100 px-3 py-1">كمي {task.targetQuestions} س</span>
            ) : null}
            {task.estimatedMinutes ? (
              <span className="rounded-full bg-slate-100 px-3 py-1">وقت {task.estimatedMinutes} د</span>
            ) : null}
            <span className="rounded-full bg-slate-100 px-3 py-1">{task.scheduledFor}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrackDistributionCard({
  title,
  code,
  progress,
  remaining,
  weeklyTarget,
  tone,
}: {
  title: string;
  code: string;
  progress: number;
  remaining: number | null;
  weeklyTarget: number;
  tone: "blue" | "amber";
}) {
  const barClass =
    tone === "amber"
      ? "[&>div]:bg-[linear-gradient(90deg,#fb923c,#f59e0b)]"
      : "[&>div]:bg-[linear-gradient(90deg,#2563eb,#60a5fa)]";

  const badgeClass =
    tone === "amber" ? "bg-[#fff4e8] text-[#f97316]" : "bg-[#edf4ff] text-[#2563eb]";

  return (
    <div className="rounded-[1.45rem] border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="display-font text-lg font-bold text-slate-950">{title}</div>
          <div className="mt-1 flex flex-wrap gap-3 text-xs font-semibold text-slate-500">
            <span>المقاطع المتبقية {remaining ?? "-"}</span>
            <span>المهام المتبقية {weeklyTarget}</span>
          </div>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.95rem] text-sm font-black",
            badgeClass,
          )}
        >
          {code}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-3">
        <div className="min-w-[3rem] text-sm font-bold text-slate-700">{progress}%</div>
        <Progress value={progress} className={cn("h-2.5 flex-1 bg-slate-100", barClass)} />
      </div>
    </div>
  );
}

function QuickSummaryCard({
  title,
  value,
  caption,
  icon: Icon,
  iconTone,
}: {
  title: string;
  value: string;
  caption: string;
  icon: LucideIcon;
  iconTone: string;
}) {
  return (
    <div className="rounded-[1.35rem] border border-slate-200 bg-white px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-slate-500">{title}</div>
          <div className="mt-2 display-font text-2xl font-extrabold text-slate-950">{value}</div>
          <div className="mt-1 text-xs text-slate-500">{caption}</div>
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-[0.95rem]", iconTone)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

export function StudentPlan() {
  const { status, user } = useAuthSession();
  const { status: portalStatus, data, error, refresh, setData } = useStudentPortal(status === "authenticated");
  const [taskState, setTaskState] = useState<Record<number, boolean>>({});
  const [actionState, setActionState] = useState<"idle" | "loading">("idle");
  const [actionError, setActionError] = useState<string | null>(null);
  const [showWeeklyView, setShowWeeklyView] = useState(false);

  async function handleToggleTask(task: StudentPortalTask, nextValue: boolean) {
    try {
      setActionError(null);
      setTaskState((current) => ({ ...current, [task.id]: true }));
      const nextData = await updateTaskCompletion(task.id, nextValue);
      setData(nextData as never);
    } catch (taskError) {
      setActionError(taskError instanceof Error ? taskError.message : "تعذر تحديث حالة المهمة.");
    } finally {
      setTaskState((current) => ({ ...current, [task.id]: false }));
    }
  }

  async function handlePlanAction(action: PlanAction) {
    try {
      setActionError(null);
      setActionState("loading");
      const nextData = await runPlanAction(action);
      setData(nextData as never);
    } catch (planError) {
      setActionError(planError instanceof Error ? planError.message : "تعذر تحديث الخطة.");
    } finally {
      setActionState("idle");
    }
  }

  if (status === "loading") {
    return <StudentPortalLoadingCard label="جاري تجهيز صفحة الخطة..." />;
  }

  if (status !== "authenticated" || !user) {
    return (
      <StudentAccessCard
        title="صفحة الخطة مرتبطة بحسابك"
        description="يجب تسجيل الدخول أولًا حتى تظهر لك مهام اليوم، وإعادة توزيع الخطة، والمتابعة اليومية الخاصة بك."
        next="/my-plan"
      />
    );
  }

  if (portalStatus === "loading" || portalStatus === "idle") {
    return <StudentPortalLoadingCard label="جاري تحميل بيانات الخطة..." />;
  }

  if (portalStatus === "error" || !data) {
    return <StudentPortalErrorCard message={error ?? "تعذر تحميل بيانات الخطة."} onRetry={() => void refresh()} />;
  }

  const pressure = pressureConfig[data.planPressure];
  const completedToday = data.todayTasks.filter((task) => task.isCompleted).length;
  const totalSectionsRemaining =
    (data.quantRemainingSections ?? data.weeklyGoal.quantSections) +
    (data.verbalRemainingSections ?? data.weeklyGoal.verbalSections);

  return (
    <div className="space-y-6">
      <StudentPlanSetupNotice onboardingCompleted={data.onboardingCompleted} />

      <Reveal>
        <Card className="overflow-hidden rounded-[2rem] border-0 bg-[linear-gradient(135deg,#123B7A_0%,#1D4ED8_100%)] shadow-[0_30px_60px_rgba(18,59,122,0.24)]">
          <CardContent className="relative p-5 sm:p-6 lg:p-7">
            <div className="absolute inset-y-0 left-0 hidden w-1/3 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15),transparent_68%)] lg:block" />

            <div className="relative grid gap-6 xl:grid-cols-[1.08fr,0.92fr] xl:items-start">
              <div className="order-2 xl:order-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full bg-[#e8fff4] px-3 py-1 text-xs font-bold text-[#1c7a50]">
                    الخطة معدلة
                  </span>
                  <span
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-bold",
                      pressure.className.replace("bg-", "bg-white/10 ").replace("border-", "border-white/20 ").replace("text-", "text-white "),
                    )}
                  >
                    {pressure.label}
                  </span>
                </div>

                <div className="mt-4 display-font text-[clamp(2rem,4vw,3rem)] font-extrabold leading-[1.15] text-white">
                  خطتك اليومية
                </div>
                <p className="mt-3 max-w-2xl text-sm leading-8 text-white/80 sm:text-base">
                  خطة تتغير مع أدائك ولا مع قالب ثابت. هنا تظهر تفاصيل الخطة اليومية والأسبوعية،
                  وتستطيع إعادة التوزيع حسب تأخرك أو وقتك المتاح.
                </p>

                <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  <PlanHeroStat title="نوع الخطة" value={planTypeLabels[data.planType]} subtitle="الخطة الحالية" icon={Target} />
                  <PlanHeroStat title="الوقت اليومي" value={`${data.dailyStudyHours} س`} subtitle="متوسط" icon={Clock3} />
                  <PlanHeroStat title="المواد المتبقية" value={`${totalSectionsRemaining}`} subtitle="وحدة" icon={BookOpenCheck} />
                  <PlanHeroStat title="الأيام المتبقية" value={formatDaysLeft(data.daysLeft)} subtitle="يوم" icon={CalendarDays} />
                </div>

                <div className="mt-4 flex flex-wrap gap-2.5">
                  <Link href="/onboarding">
                    <Button
                      type="button"
                      className="rounded-full bg-[#0d2f65] px-4 text-white shadow-[0_12px_24px_rgba(7,19,40,0.2)] hover:bg-[#0a2552]"
                    >
                      <NotebookPen className="h-4 w-4" />
                      تعديل إعدادات الخطة
                    </Button>
                  </Link>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void handlePlanAction("reset")}
                    disabled={actionState === "loading"}
                    className="rounded-full border-white/15 bg-white/10 px-4 text-white hover:bg-white/16 hover:text-white"
                  >
                    {actionState === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
                    أعد ضبط الخطة
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => void handlePlanAction("postpone_today")}
                    disabled={actionState === "loading"}
                    className="rounded-full border-white/15 bg-white/10 px-4 text-white hover:bg-white/16 hover:text-white"
                  >
                    <CalendarDays className="h-4 w-4" />
                    أجّل مهام اليوم
                  </Button>
                </div>
              </div>

              <div className="order-1 flex min-h-[180px] items-center justify-center xl:order-2 xl:min-h-[unset] xl:justify-end">
                <div className="flex w-full max-w-[260px] items-end justify-center gap-4 rounded-[1.75rem] border border-white/14 bg-white/8 px-5 py-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-sm">
                  <div className="flex-1">
                    <div className="rounded-[1.2rem] bg-white/12 p-3 text-white">
                      <div className="text-xs font-semibold text-white/70">موعد الاختبار</div>
                      <div className="mt-2 text-sm font-bold">{formatPortalDate(data.examDate)}</div>
                    </div>
                    <div className="mt-3 rounded-[1.2rem] bg-white/12 p-3 text-white">
                      <div className="text-xs font-semibold text-white/70">إنجاز اليوم</div>
                      <div className="mt-2 display-font text-2xl font-extrabold">
                        {completedToday}/{data.todayTasks.length || 0}
                      </div>
                    </div>
                  </div>

                  <div className="relative flex h-28 w-24 shrink-0 items-center justify-center rounded-[1.5rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(224,236,255,0.92))] shadow-[0_18px_34px_rgba(7,19,40,0.18)]">
                    <div className="absolute -top-3 right-3 h-5 w-12 rounded-full bg-white/70 shadow-sm" />
                    <div className="space-y-2">
                      {[0, 1, 2, 3].map((row) => (
                        <div key={row} className="flex items-center gap-2">
                          <span className="h-3.5 w-3.5 rounded-[4px] bg-[#9cc3ff]" />
                          <span className="block h-1.5 w-8 rounded-full bg-[#d7e6ff]" />
                        </div>
                      ))}
                    </div>
                    <div className="absolute -bottom-3 -left-2 flex h-11 w-11 items-center justify-center rounded-full bg-[#f8fbff] text-[#123B7A] shadow-[0_12px_28px_rgba(7,19,40,0.18)]">
                      <Clock3 className="h-5 w-5" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </Reveal>

      {actionError ? (
        <div className="rounded-[1.35rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
          {actionError}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.02fr,0.98fr]">
        <Reveal>
          <Card className="overflow-hidden rounded-[2rem] border border-[#e4ebf7] bg-white shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
            <CardContent className="space-y-5 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setShowWeeklyView((current) => !current)}
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-600 transition hover:bg-slate-100"
                >
                  {showWeeklyView ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  عرض الأسبوع
                </button>

                <div className="text-right">
                  <div className="display-font text-2xl font-bold text-slate-950">توزيع الخطة</div>
                  <div className="mt-1 text-sm text-slate-500">خطة ذكية تتوزع تلقائيًا بحسب تقدمك</div>
                </div>
              </div>

              <div className="space-y-4">
                <TrackDistributionCard
                  title="الكمي"
                  code="Σ"
                  progress={data.quantProgressPercent}
                  remaining={data.quantRemainingSections}
                  weeklyTarget={data.weeklyGoal.quantSections}
                  tone="blue"
                />
                <TrackDistributionCard
                  title="اللفظي"
                  code="A"
                  progress={data.verbalProgressPercent}
                  remaining={data.verbalRemainingSections}
                  weeklyTarget={data.weeklyGoal.verbalSections}
                  tone="amber"
                />
              </div>

              {showWeeklyView ? (
                <div className="rounded-[1.35rem] border border-slate-200 bg-[#fbfdff] p-4">
                  <div className="mb-3 text-sm font-bold text-slate-700">نظرة سريعة على الأيام القادمة</div>
                  <div className="space-y-2.5">
                    {data.upcomingTasks.length ? (
                      data.upcomingTasks.slice(0, 4).map((task) => (
                        <div
                          key={task.id}
                          className="flex items-center justify-between gap-3 rounded-[1rem] border border-slate-200 bg-white px-3 py-3 text-sm"
                        >
                          <div className="min-w-0">
                            <div className="truncate font-bold text-slate-800">{task.title}</div>
                            <div className="mt-1 text-xs text-slate-500">{task.scheduledFor}</div>
                          </div>
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold text-slate-500">
                            {taskKindLabels[task.taskKind]}
                          </span>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-[1rem] border border-dashed border-slate-300 bg-white px-4 py-5 text-sm text-slate-500">
                        لا توجد مهام محفوظة للأيام القادمة حاليًا.
                      </div>
                    )}
                  </div>
                </div>
              ) : null}

              <div className="rounded-[1.2rem] border border-[#dbe8ff] bg-[#f4f8ff] px-4 py-3 text-sm leading-7 text-[#3b4f72]">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#2563eb] shadow-sm">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>{data.recommendations[0] ?? "توزيع الخطة يتحدث تلقائيًا بناءً على أدائك وتقدّمك في المهام."}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </Reveal>

        <Reveal>
          <Card className="overflow-hidden rounded-[2rem] border border-[#e4ebf7] bg-white shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
            <CardContent className="space-y-5 p-5 sm:p-6">
              <div className="flex items-center justify-between gap-3">
                <div className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-bold text-[#2563eb]">
                  {data.todayTasks.length} مهام
                </div>
                <div className="text-right">
                  <div className="display-font text-2xl font-bold text-slate-950">مهام اليوم</div>
                  <div className="mt-1 text-sm text-slate-500">ابدأ الآن من المطلوب الأولوية</div>
                </div>
              </div>

              {data.todayTasks.length ? (
                <div className="space-y-3">
                  {data.todayTasks.map((task) => (
                    <TodayTaskItem
                      key={task.id}
                      task={task}
                      pending={Boolean(taskState[task.id])}
                      onToggle={handleToggleTask}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.35rem] border border-dashed border-slate-300 bg-slate-50 px-5 py-6 text-sm leading-8 text-slate-600">
                  لا توجد مهام لليوم حاليًا. يمكنك إعادة ضبط الخطة أو تأجيل مهام اليوم عند الحاجة.
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowWeeklyView(true)}
                  className="rounded-full border-[#d9e4fb] text-[#2563eb] hover:bg-[#f5f9ff]"
                >
                  عرض الخطة كاملة
                  <ArrowLeft className="h-4 w-4" />
                </Button>

                <div className="min-w-[190px] flex-1 sm:max-w-[220px]">
                  <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-500">
                    <span>مكتملة</span>
                    <span>{completedToday}/{data.todayTasks.length || 0}</span>
                  </div>
                  <Progress
                    value={data.todayTasks.length ? (completedToday / data.todayTasks.length) * 100 : 0}
                    className="h-2 bg-slate-100 [&>div]:bg-[linear-gradient(90deg,#123B7A,#3b82f6)]"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </div>

      <Reveal>
        <Card className="rounded-[2rem] border border-[#e4ebf7] bg-white shadow-[0_18px_42px_rgba(15,23,42,0.06)]">
          <CardContent className="space-y-5 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <div className="display-font text-2xl font-bold text-slate-950">نظرة سريعة على تقدمك</div>
              <div className="text-sm text-slate-500">أرقام مختصرة تحت عينك</div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <QuickSummaryCard
                title="إجمالي الأسئلة المحلولة"
                value={new Intl.NumberFormat("ar-SA").format(data.solvedQuestionsCount)}
                caption="إجمالي الأداء الحالي"
                icon={Target}
                iconTone="bg-[#eef4ff] text-[#2563eb]"
              />
              <QuickSummaryCard
                title="نسبة الإنجاز الكلية"
                value={`${data.progressPercent}%`}
                caption="متوسط التنفيذ"
                icon={Sparkles}
                iconTone="bg-[#eefbf1] text-[#16a34a]"
              />
              <QuickSummaryCard
                title="سلسلة الإنجاز"
                value={`${data.challenge.currentStreak} يوم`}
                caption="استمرار الدراسة"
                icon={Clock3}
                iconTone="bg-[#fff4e8] text-[#f97316]"
              />
              <QuickSummaryCard
                title="ملخصات محفوظة"
                value={new Intl.NumberFormat("ar-SA").format(data.summariesCount)}
                caption="جاهزة للمراجعة"
                icon={BookOpenCheck}
                iconTone="bg-[#f3edff] text-[#8b5cf6]"
              />
            </div>
          </CardContent>
        </Card>
      </Reveal>
    </div>
  );
}
