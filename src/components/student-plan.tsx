"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarDays, Loader2, NotebookPen, RefreshCcw } from "lucide-react";

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
    throw new Error(payload.message || "تعذر تحديث المهمة.");
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

function TaskListRow({
  task,
  pending,
  onToggle,
}: {
  task: StudentPortalTask;
  pending: boolean;
  onToggle: (task: StudentPortalTask, nextValue: boolean) => void;
}) {
  return (
    <div className="rounded-[1.4rem] border border-slate-200 bg-white/90 p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="display-font text-lg font-bold text-slate-950">{task.title}</div>
          {task.description ? <p className="mt-2 text-sm leading-7 text-slate-600">{task.description}</p> : null}
          <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1">{task.scheduledFor}</span>
            {task.estimatedMinutes ? (
              <span className="rounded-full bg-slate-100 px-3 py-1">{task.estimatedMinutes} دقيقة</span>
            ) : null}
          </div>
        </div>
        <Button
          type="button"
          size="sm"
          variant={task.isCompleted ? "secondary" : "outline"}
          disabled={pending}
          onClick={() => onToggle(task, !task.isCompleted)}
        >
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : task.isCompleted ? "تمت" : "إنهاء"}
        </Button>
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

  async function handlePlanAction(action: "reset" | "postpone_today") {
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
    return <StudentPortalLoadingCard label="جاري تجهيز الخطة..." />;
  }

  if (status !== "authenticated" || !user) {
    return (
      <StudentAccessCard
        title="صفحة الخطة مرتبطة بحسابك"
        description="يجب تسجيل الدخول أولًا حتى تظهر لك خطة الأيام القادمة، وإعادة الجدولة، ومهام المراجعة الخاصة بك."
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

  return (
    <div className="space-y-6">
      <StudentPlanSetupNotice onboardingCompleted={data.onboardingCompleted} />

      <Card className="surface-dark border-0">
        <CardContent className="space-y-6 p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm text-white/60">الخطة الذكية</p>
              <h2 className="mt-3 display-font text-4xl font-bold text-white">خطة تتغير مع أدائك لا مع قالب ثابت</h2>
              <p className="mt-3 max-w-3xl text-sm leading-8 text-white/78">
                هنا تظهر تفاصيل الخطة اليومية والأسبوعية، مع أزرار لإعادة توزيعها أو تأجيل مهام اليوم إذا تغير وقتك.
              </p>
            </div>
            <div className={`rounded-full border px-4 py-2 text-sm font-bold ${pressure.className}`}>
              {pressure.label}
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 text-white">
              <div className="text-sm text-white/60">الأيام المتبقية</div>
              <div className="mt-2 display-font text-3xl font-bold">{formatDaysLeft(data.daysLeft)}</div>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 text-white">
              <div className="text-sm text-white/60">نوع الخطة</div>
              <div className="mt-2 display-font text-3xl font-bold">{planTypeLabels[data.planType]}</div>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 text-white">
              <div className="text-sm text-white/60">الوقت اليومي</div>
              <div className="mt-2 display-font text-3xl font-bold">{data.dailyStudyHours} س</div>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 text-white">
              <div className="text-sm text-white/60">موعد الاختبار</div>
              <div className="mt-2 text-base font-bold">{formatPortalDate(data.examDate)}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/onboarding">
              <Button className="gap-2">
                <NotebookPen className="h-4 w-4" />
                تعديل إعدادات الخطة
              </Button>
            </Link>
            <Button type="button" variant="outline" className="gap-2" onClick={() => void handlePlanAction("reset")} disabled={actionState === "loading"}>
              <RefreshCcw className="h-4 w-4" />
              أعد ضبط الخطة
            </Button>
            <Button type="button" variant="outline" className="gap-2" onClick={() => void handlePlanAction("postpone_today")} disabled={actionState === "loading"}>
              <CalendarDays className="h-4 w-4" />
              أجّل مهام اليوم
            </Button>
          </div>
        </CardContent>
      </Card>

      {actionError ? (
        <div className="rounded-[1.4rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
          {actionError}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <div className="space-y-6">
          <Card className="rounded-[2rem] border-white/80 bg-white/96 shadow-soft">
            <CardContent className="space-y-5 p-8">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="section-eyebrow text-[#123B7A]">مهام اليوم</p>
                  <h3 className="display-font text-2xl font-bold text-slate-950">ابدأ من المطلوب الآن</h3>
                </div>
                <div className="text-sm font-semibold text-slate-500">
                  {data.todayTasks.filter((task) => task.isCompleted).length} / {data.todayTasks.length}
                </div>
              </div>

              {data.todayTasks.length ? (
                <div className="space-y-3">
                  {data.todayTasks.map((task) => (
                    <TaskListRow
                      key={task.id}
                      task={task}
                      pending={Boolean(taskState[task.id])}
                      onToggle={handleToggleTask}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/70 p-6 text-sm leading-8 text-slate-600">
                  لا توجد مهام اليوم حاليًا. استخدم زر إعادة الضبط إذا أردت توزيعًا جديدًا وفق وضعك الحالي.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-white/80 bg-white/96 shadow-soft">
            <CardContent className="space-y-5 p-8">
              <div>
                <p className="section-eyebrow text-[#123B7A]">المهام القادمة</p>
                <h3 className="display-font text-2xl font-bold text-slate-950">نظرة سريعة على الأيام القادمة</h3>
              </div>

              <div className="space-y-3">
                {data.upcomingTasks.length ? (
                  data.upcomingTasks.map((task) => (
                    <TaskListRow
                      key={task.id}
                      task={task}
                      pending={Boolean(taskState[task.id])}
                      onToggle={handleToggleTask}
                    />
                  ))
                ) : (
                  <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/70 p-6 text-sm leading-8 text-slate-600">
                    لا توجد مهام قادمة محفوظة حاليًا.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="rounded-[2rem] border-white/80 bg-white/96 shadow-soft">
            <CardContent className="space-y-5 p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-[1.2rem] bg-[#eef4ff] text-[#123B7A]">
                  <CalendarDays className="h-6 w-6" />
                </div>
                <div>
                  <p className="section-eyebrow text-[#123B7A]">الهدف الأسبوعي</p>
                  <h3 className="display-font text-2xl font-bold text-slate-950">ماذا نريد هذا الأسبوع</h3>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/70 p-4">
                  <div className="text-xs font-semibold text-slate-500">مقاطع الكمي</div>
                  <div className="mt-2 display-font text-2xl font-bold text-slate-950">{data.weeklyGoal.quantSections}</div>
                </div>
                <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/70 p-4">
                  <div className="text-xs font-semibold text-slate-500">مقاطع اللفظي</div>
                  <div className="mt-2 display-font text-2xl font-bold text-slate-950">{data.weeklyGoal.verbalSections}</div>
                </div>
                <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/70 p-4">
                  <div className="text-xs font-semibold text-slate-500">الأسئلة المستهدفة</div>
                  <div className="mt-2 display-font text-2xl font-bold text-slate-950">{data.weeklyGoal.targetQuestions}</div>
                </div>
                <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/70 p-4">
                  <div className="text-xs font-semibold text-slate-500">مراجعة الأخطاء</div>
                  <div className="mt-2 display-font text-2xl font-bold text-slate-950">{data.weeklyGoal.mistakesReview}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-white/80 bg-white/96 shadow-soft">
            <CardContent className="space-y-5 p-8">
              <div>
                <p className="section-eyebrow text-[#123B7A]">التقدم الكلي</p>
                <h3 className="display-font text-2xl font-bold text-slate-950">نسب الإنجاز الحالية</h3>
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
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-white/80 bg-white/96 shadow-soft">
            <CardContent className="space-y-4 p-8">
              <div>
                <p className="section-eyebrow text-[#123B7A]">توصيات الخطة</p>
                <h3 className="display-font text-2xl font-bold text-slate-950">كيف تتصرف إذا تأخرت</h3>
              </div>
              <div className="space-y-3">
                {data.recommendations.map((item) => (
                  <div key={item} className="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4 text-sm leading-8 text-slate-600">
                    {item}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
