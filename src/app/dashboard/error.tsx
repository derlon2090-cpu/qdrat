"use client";

import Link from "next/link";
import { useEffect } from "react";
import { AlertTriangle, ArrowRight, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Dashboard route error:", error);
  }, [error]);

  return (
    <div className="rounded-[2rem] border border-rose-200 bg-white p-6 shadow-[0_18px_42px_rgba(15,23,42,0.06)] sm:p-8">
      <div className="mx-auto max-w-2xl text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-50 text-rose-600">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h2 className="mt-5 text-2xl font-extrabold tracking-tight text-slate-950 sm:text-3xl">
          تعذر فتح لوحة الطالب الآن
        </h2>
        <p className="mt-3 text-sm leading-8 text-slate-600 sm:text-base">
          حصل خطأ غير متوقع أثناء تحميل بيانات لوحتي. جرّب إعادة المحاولة، وإذا استمرت المشكلة
          يمكنك الانتقال مباشرة إلى الخطة اليومية أو بنك الأسئلة.
        </p>

        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={reset} className="gap-2">
            <RefreshCcw className="h-4 w-4" />
            إعادة المحاولة
          </Button>
          <Link href="/my-plan">
            <Button variant="outline" className="w-full gap-2 sm:w-auto">
              <ArrowRight className="h-4 w-4" />
              الذهاب إلى الخطة اليومية
            </Button>
          </Link>
          <Link href="/question-bank">
            <Button variant="outline" className="w-full gap-2 sm:w-auto">
              <ArrowRight className="h-4 w-4" />
              الذهاب إلى بنك الأسئلة
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
