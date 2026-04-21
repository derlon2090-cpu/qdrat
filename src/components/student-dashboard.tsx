"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  ClipboardList,
  Coins,
  FileText,
  Files,
  Loader2,
  NotebookPen,
  RefreshCcw,
  TriangleAlert,
  UserRound,
} from "lucide-react";

import { StudentAccessCard } from "@/components/student-access-card";
import { StudentAchievementsPanel } from "@/components/student-achievements-panel";
import {
  StudentPortalErrorCard,
  StudentPortalLoadingCard,
  formatDaysLeft,
  formatLastActivity,
  formatPortalDate,
  planTypeLabels,
  pressureConfig,
} from "@/components/student-portal-shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useStudentPortal } from "@/hooks/use-student-portal";
import type { StudentPortalTask } from "@/lib/student-portal";

type ActionState = "idle" | "loading";

const quickActions = [
  {
    href: "/question-bank",
    label: "بنك الأسئلة",
    description: "ابدأ حل الأسئلة مباشرة",
    icon: ClipboardList,
  },
  {
    href: "/question-bank?track=mistakes",
    label: "الأخطاء",
    description: "راجع أسئلتك المتكررة",
    icon: TriangleAlert,
  },
  {
    href: "/summaries",
    label: "الملخصات",
    description: "استكمل ملفاتك المحفوظة",
    icon: FileText,
  },
  {
    href: "/my-plan",
    label: "خطتي",
    description: "راجع مهامك القادمة",
    icon: NotebookPen,
  },
  {
    href: "/paper-models",
    label: "النماذج",
    description: "اختبر نفسك بنماذج مركزة",
    icon: Files,
  },
  {
    href: "/diagnostic",
    label: "التشخيص",
    description: "قِس مستواك وحدد نقطة البداية",
    icon: ClipboardList,
  },
  {
    href: "/statistics",
    label: "الإحصائيات",
    description: "شاهد تقدمك وتحليل الأداء",
    icon: BarChart3,
  },
  {
    href: "/account",
    label: "الحساب",
    description: "راجع بياناتك وإعداداتك",
    icon: UserRound,
  },
  {
    href: "/pricing",
    label: "الاشتراك",
    description: "استعرض الباقات والمزايا",
    icon: Coins,
  },
];

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
    <div className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-4">
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
  const router = useRouter();
  const { status, user } = useAuthSession();
  const { status: portalStatus, data, error, refresh, setData } = useStudentPortal(status === "authenticated");
  const [taskState, setTaskState] = useState<Record<number, boolean>>({});
  const [actionState, setActionState] = useState<ActionState>("idle");
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    if (portalStatus === "ready" && data && !data.onboardingCompleted) {
      router.replace("/onboarding");
    }
  }, [data, portalStatus, router]);

  const pressure = data ? pressureConfig[data.planPressure] : null;
  const completedToday = useMemo(
    () => data?.todayTasks.filter((task) => task.isCompleted).length ?? 0,
    [data?.todayTasks],
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

  if (status === "loading") {
    return <StudentPortalLoadingCard />;
  }

  if (status !== "authenticated" || !user) {
    return (
      <StudentAccessCard
        title="لوحة الطالب مرتبطة بحسابك"
        description="سجل دخولك أولًا حتى تظهر لك خطة اليوم، ونسبة الإنجاز، والأخطاء، وآخر ما توقفت عنده داخل المنصة."
        next="/dashboard"
      />
    );
  }

  if (portalStatus === "loading" || portalStatus === "idle") {
    return <StudentPortalLoadingCard label="جاري تحميل لوحة الطالب..." />;
  }

  if (portalStatus === "error" || !data) {
    return <StudentPortalErrorCard message={error ?? "تعذر تحميل لوحة الطالب."} onRetry={() => void refresh()} />;
  }

  return (
    <div className="space-y-6">
      <Card className="surface-dark border-0">
        <CardContent className="space-y-6 p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Badge className="bg-white/10 text-white">لوحة الطالب</Badge>
              <h2 className="mt-4 display-font text-4xl font-bold text-white">مرحبًا {data.fullName}</h2>
              <p className="mt-3 max-w-3xl text-sm leading-8 text-white/78">
                هذه صفحتك العملية بعد تسجيل الدخول: تبدأ من مهام اليوم، ثم تعيدك إلى آخر ما كنت تعمل عليه، وتعرض لك
                التقدم الكلي والخطة القادمة بوضوح.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4 text-white/88">
                <div className="text-xs text-white/60">باقي على الاختبار</div>
                <div className="mt-2 display-font text-2xl font-bold">{formatDaysLeft(data.daysLeft)}</div>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4 text-white/88">
                <div className="text-xs text-white/60">مستوى الخطة</div>
                <div className="mt-2 display-font text-2xl font-bold">{planTypeLabels[data.planType]}</div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-white/60">نسبة الإنجاز</div>
              <div className="mt-2 display-font text-3xl font-bold text-white">{data.progressPercent}%</div>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-white/60">الأخطاء الحالية</div>
              <div className="mt-2 display-font text-3xl font-bold text-white">{data.totalMistakes}</div>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-white/60">إجمالي XP</div>
              <div className="mt-2 display-font text-3xl font-bold text-white">
                {data.xp.total.toLocaleString("en-US")}
              </div>
            </div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
              <div className="text-sm text-white/60">آخر نشاط</div>
              <div className="mt-2 text-base font-bold text-white">{data.lastActivityLabel ?? "بداية جديدة"}</div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/onboarding">
              <Button className="gap-2">
                <NotebookPen className="h-4 w-4" />
                تعديل إعدادات الخطة
              </Button>
            </Link>
            <Button type="button" variant="outline" className="gap-2" onClick={handleResetPlan} disabled={actionState === "loading"}>
              {actionState === "loading" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
              إعادة جدولة الخطة
            </Button>
          </div>
        </CardContent>
      </Card>

      {actionError ? (
        <div className="rounded-[1.4rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
          {actionError}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[1.15fr,0.85fr]">
        <div className="space-y-6">
          <Card className="rounded-[2rem] border-white/80 bg-white/96 shadow-soft">
            <CardContent className="space-y-5 p-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="section-eyebrow text-[#123B7A]">خطة اليوم</p>
                  <h3 className="display-font text-2xl font-bold text-slate-950">
                    {data.todayTasks.length ? `أنجزت ${completedToday} من ${data.todayTasks.length}` : "لا توجد مهام اليوم"}
                  </h3>
                </div>
                {pressure ? (
                  <span className={`rounded-full border px-3 py-1 text-xs font-bold ${pressure.className}`}>
                    {pressure.label}
                  </span>
                ) : null}
              </div>

              {data.todayTasks.length ? (
                <div className="space-y-3">
                  {data.todayTasks.map((task) => (
                    <TaskRow
                      key={task.id}
                      task={task}
                      pending={Boolean(taskState[task.id])}
                      onToggle={handleToggleTask}
                    />
                  ))}
                </div>
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/70 p-6 text-sm leading-8 text-slate-600">
                  لا توجد مهام مجدولة اليوم حاليًا. يمكنك إعادة ضبط الخطة أو التوجه إلى بنك الأسئلة لبدء جلسة جديدة.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-white/80 bg-white/96 shadow-soft" id="progress">
            <CardContent className="space-y-5 p-8">
              <div>
                <p className="section-eyebrow text-[#123B7A]">تقدمك</p>
                <h3 className="display-font text-2xl font-bold text-slate-950">الكمي واللفظي في مكان واحد</h3>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
                    <span>تقدم الكمي</span>
                    <span>{data.quantProgressPercent}%</span>
                  </div>
                  <Progress value={data.quantProgressPercent} />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
                    <span>تقدم اللفظي</span>
                    <span>{data.verbalProgressPercent}%</span>
                  </div>
                  <Progress value={data.verbalProgressPercent} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/70 p-4">
                  <div className="text-xs font-semibold text-slate-500">المقاطع الكمية المتبقية</div>
                  <div className="mt-3 display-font text-2xl font-bold text-slate-950">
                    {data.quantRemainingSections ?? "غير محدد"}
                  </div>
                </div>
                <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/70 p-4">
                  <div className="text-xs font-semibold text-slate-500">المقاطع اللفظية المتبقية</div>
                  <div className="mt-3 display-font text-2xl font-bold text-slate-950">
                    {data.verbalRemainingSections ?? "غير محدد"}
                  </div>
                </div>
                <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/70 p-4">
                  <div className="text-xs font-semibold text-slate-500">تاريخ الاختبار</div>
                  <div className="mt-3 text-base font-bold text-slate-950">{formatPortalDate(data.examDate)}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <StudentAchievementsPanel data={data} sectionId="xp-progress" />
        </div>

        <div className="space-y-6">
          <Card className="rounded-[2rem] border-white/80 bg-white/96 shadow-soft">
            <CardContent className="space-y-5 p-8">
              <div>
                <p className="section-eyebrow text-[#123B7A]">استكمل من حيث توقفت</p>
                <h3 className="display-font text-2xl font-bold text-slate-950">آخر ما كنت تعمل عليه</h3>
              </div>

              <div className="space-y-3">
                {data.resumeItems.map((item) => (
                  <div key={item.id} className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4">
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
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-white/80 bg-white/96 shadow-soft">
            <CardContent className="space-y-5 p-8">
              <div>
                <p className="section-eyebrow text-[#123B7A]">الانتقال السريع</p>
                <h3 className="display-font text-2xl font-bold text-slate-950">ابدأ مما تحتاجه الآن</h3>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                {quickActions.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link key={item.href} href={item.href} className="rounded-[1.4rem] border border-slate-200 bg-slate-50/70 p-4 transition hover:border-[#d7e3f7] hover:bg-white">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#eef4ff] text-[#123B7A]">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-bold text-slate-900">{item.label}</div>
                          <div className="text-xs leading-6 text-slate-500">{item.description}</div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border-white/80 bg-white/96 shadow-soft">
            <CardContent className="space-y-5 p-8">
              <div>
                <p className="section-eyebrow text-[#123B7A]">التوصيات اليومية</p>
                <h3 className="display-font text-2xl font-bold text-slate-950">ماذا يفضّل أن تبدأ به</h3>
              </div>

              <div className="space-y-3">
                {data.recommendations.map((item) => (
                  <div key={item} className="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4 text-sm leading-8 text-slate-600">
                    {item}
                  </div>
                ))}
              </div>

              <div className="rounded-[1.4rem] border border-[#E8D8B3] bg-[#fffaf0] px-4 py-3 text-sm font-semibold text-slate-700">
                آخر استخدام: {formatLastActivity(data.lastActivityAt)}{data.lastActivityLabel ? ` - ${data.lastActivityLabel}` : ""}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
