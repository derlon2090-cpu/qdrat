"use client";

import Link from "next/link";
import { AlertTriangle, Loader2 } from "lucide-react";

import type { PlanPressure, StudentPlanType } from "@/lib/student-portal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const planTypeLabels: Record<StudentPlanType, string> = {
  light: "خفيفة",
  medium: "متوسطة",
  intensive: "مكثفة",
};

export const pressureConfig: Record<
  PlanPressure,
  {
    label: string;
    className: string;
  }
> = {
  comfortable: {
    label: "الخطة مريحة",
    className: "border-emerald-200 bg-emerald-50 text-emerald-700",
  },
  balanced: {
    label: "الخطة مناسبة",
    className: "border-sky-200 bg-sky-50 text-sky-700",
  },
  compressed: {
    label: "الخطة مضغوطة",
    className: "border-amber-200 bg-amber-50 text-amber-700",
  },
  needs_more_time: {
    label: "تحتاج وقتًا أكبر",
    className: "border-rose-200 bg-rose-50 text-rose-700",
  },
};

export function formatPortalDate(value: string | null) {
  if (!value) {
    return "غير محدد";
  }

  const date = new Date(`${value}T00:00:00`);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("ar-SA", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function formatLastActivity(value: string | null) {
  if (!value) {
    return "الآن";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "الآن";
  }

  const diffMs = date.getTime() - Date.now();
  const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));

  if (Math.abs(diffDays) < 1) {
    return "اليوم";
  }

  return new Intl.RelativeTimeFormat("ar", { numeric: "auto" }).format(diffDays, "day");
}

export function formatDaysLeft(daysLeft: number | null) {
  if (daysLeft == null) {
    return "غير محدد";
  }

  if (daysLeft === 0) {
    return "اليوم";
  }

  if (daysLeft === 1) {
    return "غدًا";
  }

  return `${daysLeft} يوم`;
}

export function StudentPlanSetupNotice({
  onboardingCompleted,
}: {
  onboardingCompleted: boolean;
}) {
  if (onboardingCompleted) {
    return null;
  }

  return (
    <Card className="border border-[#E8D8B3] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,247,244,0.96))] shadow-soft">
      <CardContent className="flex flex-wrap items-center justify-between gap-4 p-6">
        <div className="space-y-2">
          <div className="display-font text-2xl font-bold text-slate-950">
            إعداد الخطة صار اختياريًا
          </div>
          <p className="max-w-3xl text-sm leading-8 text-slate-600">
            تقدر تستخدم المنصة مباشرة بعد التسجيل، ثم تكمل إعداد الخطة أو تعدلها
            لاحقًا من صفحة الإعداد وقت ما يناسبك.
          </p>
        </div>

        <Link href="/onboarding" className="shrink-0">
          <Button type="button">إعداد الخطة لاحقًا</Button>
        </Link>
      </CardContent>
    </Card>
  );
}

export function StudentPortalLoadingCard({
  label = "جاري تجهيز مساحة الطالب...",
}: {
  label?: string;
}) {
  return (
    <Card>
      <CardContent className="flex items-center justify-center gap-3 p-10 text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" />
        {label}
      </CardContent>
    </Card>
  );
}

export function StudentPortalErrorCard({
  message,
  onRetry,
}: {
  message: string;
  onRetry?: () => void;
}) {
  return (
    <Card className="border border-rose-200 bg-rose-50/80">
      <CardContent className="space-y-4 p-8 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-white text-rose-600">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <div className="display-font text-2xl font-bold text-slate-950">تعذر تحميل بيانات الطالب</div>
        <p className="text-sm leading-8 text-slate-600">{message}</p>
        {onRetry ? (
          <div className="flex justify-center">
            <Button type="button" variant="outline" onClick={onRetry}>
              إعادة المحاولة
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
