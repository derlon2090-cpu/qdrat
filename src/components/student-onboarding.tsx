"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CalendarDays, Clock3, Loader2, Save, Sparkles, Target } from "lucide-react";

import { StudentAccessCard } from "@/components/student-access-card";
import { StudentPortalErrorCard, StudentPortalLoadingCard, planTypeLabels } from "@/components/student-portal-shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useStudentPortal } from "@/hooks/use-student-portal";
import type { StudentPlanType } from "@/lib/student-portal";
import { cn } from "@/lib/utils";

const planOptions: Array<{
  value: StudentPlanType;
  title: string;
  description: string;
}> = [
  {
    value: "light",
    title: "خطة خفيفة",
    description: "إيقاع مريح للمذاكرة اليومية مع توزيع أخف للمهام.",
  },
  {
    value: "medium",
    title: "خطة متوسطة",
    description: "أفضل توازن بين الإنجاز والمراجعة لمعظم الطلاب.",
  },
  {
    value: "intensive",
    title: "خطة مكثفة",
    description: "مناسبة إذا كان وقتك محدودًا وتريد رفع الإيقاع اليومي.",
  },
];

type OnboardingFormState = {
  examDate: string;
  daysLeft: string;
  quantRemainingSections: string;
  verbalRemainingSections: string;
  dailyStudyHours: string;
  planType: StudentPlanType;
};

function buildInitialState(): OnboardingFormState {
  return {
    examDate: "",
    daysLeft: "",
    quantRemainingSections: "",
    verbalRemainingSections: "",
    dailyStudyHours: "3",
    planType: "medium",
  };
}

function toNullableNumber(value: string) {
  if (!value.trim()) {
    return null;
  }

  const parsedValue = Number(value);
  return Number.isFinite(parsedValue) ? parsedValue : null;
}

export function StudentOnboarding() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/dashboard";
  const { status, user } = useAuthSession();
  const { status: portalStatus, data, error, refresh } = useStudentPortal(status === "authenticated");
  const [formState, setFormState] = useState<OnboardingFormState>(buildInitialState);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (!data || isInitialized) {
      return;
    }

    setFormState({
      examDate: data.examDate ?? "",
      daysLeft: data.daysLeft != null ? String(data.daysLeft) : "",
      quantRemainingSections: data.quantRemainingSections != null ? String(data.quantRemainingSections) : "",
      verbalRemainingSections: data.verbalRemainingSections != null ? String(data.verbalRemainingSections) : "",
      dailyStudyHours: data.dailyStudyHours ? String(data.dailyStudyHours) : "3",
      planType: data.planType,
    });
    setIsInitialized(true);
  }, [data, isInitialized]);

  const introText = useMemo(() => {
    if (!data?.onboardingCompleted) {
      return "خلنا نضبط بياناتك الأساسية الآن حتى تبني المنصة خطة يومية واضحة وتبدأ مباشرة من لوحة الطالب.";
    }

    return "تستطيع تعديل إعدادات خطتك في أي وقت، والنظام سيعيد توزيع المهام تلقائيًا حسب الأيام المتبقية ومستواك الحالي.";
  }, [data?.onboardingCompleted]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveError(null);
    setIsSaving(true);

    try {
      const response = await fetch("/api/student/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          examDate: formState.examDate || null,
          daysLeft: toNullableNumber(formState.daysLeft),
          quantRemainingSections: toNullableNumber(formState.quantRemainingSections),
          verbalRemainingSections: toNullableNumber(formState.verbalRemainingSections),
          dailyStudyHours: toNullableNumber(formState.dailyStudyHours),
          planType: formState.planType,
        }),
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        message?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.message || "تعذر حفظ إعدادات الخطة.");
      }

      router.push(next);
      router.refresh();
    } catch (submissionError) {
      setSaveError(submissionError instanceof Error ? submissionError.message : "تعذر حفظ إعدادات الخطة.");
    } finally {
      setIsSaving(false);
    }
  }

  if (status === "loading") {
    return <StudentPortalLoadingCard label="جاري تجهيز الإعدادات الأولى..." />;
  }

  if (status !== "authenticated" || !user) {
    return (
      <StudentAccessCard
        title="إعداد الخطة يحتاج حسابًا"
        description="يجب إنشاء حساب وتسجيل الدخول أولًا حتى نبني لك خطة يومية مرتبطة ببياناتك وتقدمك داخل المنصة."
        next="/onboarding"
      />
    );
  }

  if (portalStatus === "loading" || portalStatus === "idle") {
    return <StudentPortalLoadingCard label="جاري تحميل بيانات الخطة..." />;
  }

  if (portalStatus === "error" || !data) {
    return <StudentPortalErrorCard message={error ?? "تعذر تحميل بيانات الخطة."} onRetry={() => void refresh()} />;
  }

  return (
    <div className="space-y-6">
      <Card className="surface-dark border-0">
        <CardContent className="space-y-5 p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="mini-pill border border-white/10 bg-white/5 text-white">الإعداد الأولي</div>
              <h2 className="mt-4 display-font text-3xl font-bold text-white">
                {data.onboardingCompleted ? "حدّث خطتك الذكية" : `أهلًا ${user.fullName}، لنضبط خطتك`}
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-8 text-white/78">{introText}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-5 py-4 text-right text-white/88">
              <div className="text-xs text-white/60">الخطة الحالية</div>
              <div className="mt-2 display-font text-2xl font-bold">{planTypeLabels[data.planType]}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.1fr,0.9fr]">
        <Card className="rounded-[2rem] border-white/80 bg-white/96 shadow-soft">
          <CardContent className="space-y-6 p-8">
            <div className="flex items-center gap-3 text-slate-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-[1.2rem] bg-[#eef4ff] text-[#123B7A]">
                <CalendarDays className="h-6 w-6" />
              </div>
              <div>
                <div className="display-font text-2xl font-bold">بيانات الاختبار</div>
                <p className="mt-1 text-sm text-slate-500">إذا لم تكن متأكدًا من أي حقل يمكنك تركه فارغًا.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">تاريخ الاختبار</span>
                <Input
                  type="date"
                  value={formState.examDate}
                  onChange={(event) => setFormState((current) => ({ ...current, examDate: event.target.value }))}
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">أو كم يومًا متبقيًا</span>
                <Input
                  type="number"
                  min={0}
                  placeholder="مثال: 30"
                  value={formState.daysLeft}
                  onChange={(event) => setFormState((current) => ({ ...current, daysLeft: event.target.value }))}
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">المقاطع المتبقية في الكمي</span>
                <Input
                  type="number"
                  min={0}
                  placeholder="اتركه فارغًا إذا لا تعرف"
                  value={formState.quantRemainingSections}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, quantRemainingSections: event.target.value }))
                  }
                />
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold text-slate-700">المقاطع المتبقية في اللفظي</span>
                <Input
                  type="number"
                  min={0}
                  placeholder="اتركه فارغًا إذا لا تعرف"
                  value={formState.verbalRemainingSections}
                  onChange={(event) =>
                    setFormState((current) => ({ ...current, verbalRemainingSections: event.target.value }))
                  }
                />
              </label>
            </div>

            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">كم ساعة تستطيع المذاكرة يوميًا</span>
              <Input
                type="number"
                min={0.5}
                max={12}
                step={0.5}
                value={formState.dailyStudyHours}
                onChange={(event) => setFormState((current) => ({ ...current, dailyStudyHours: event.target.value }))}
              />
            </label>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-white/80 bg-white/96 shadow-soft">
          <CardContent className="space-y-6 p-8">
            <div className="flex items-center gap-3 text-slate-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-[1.2rem] bg-[#fff7ed] text-[#C99A43]">
                <Sparkles className="h-6 w-6" />
              </div>
              <div>
                <div className="display-font text-2xl font-bold">اختر نوع الخطة</div>
                <p className="mt-1 text-sm text-slate-500">يمكن تعديلها لاحقًا إذا تغيّر وقتك أو قرب الاختبار.</p>
              </div>
            </div>

            <div className="space-y-3">
              {planOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setFormState((current) => ({ ...current, planType: option.value }))}
                  className={cn(
                    "w-full rounded-[1.6rem] border p-5 text-right transition",
                    formState.planType === option.value
                      ? "border-[#123B7A] bg-[#f7fbff] shadow-[0_14px_30px_rgba(18,59,122,0.12)]"
                      : "border-slate-200 bg-white hover:border-[#d7e3f7]",
                  )}
                >
                  <div className="display-font text-xl font-bold text-slate-950">{option.title}</div>
                  <p className="mt-2 text-sm leading-7 text-slate-600">{option.description}</p>
                </button>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                  <Clock3 className="h-4 w-4" />
                  الساعات الحالية
                </div>
                <div className="mt-3 display-font text-2xl font-bold text-slate-950">{data.dailyStudyHours} ساعة</div>
              </div>
              <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
                  <Target className="h-4 w-4" />
                  حالة الإعداد
                </div>
                <div className="mt-3 display-font text-2xl font-bold text-slate-950">
                  {data.onboardingCompleted ? "مفعّل" : "أول مرة"}
                </div>
              </div>
            </div>

            {saveError ? (
              <div className="rounded-[1.4rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                {saveError}
              </div>
            ) : null}

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={isSaving} className="gap-2">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {data.onboardingCompleted ? "حفظ التعديلات" : "إنشاء الخطة"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.push("/dashboard")}>
                العودة للوحة الطالب
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
