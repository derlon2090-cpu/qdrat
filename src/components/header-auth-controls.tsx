"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, Loader2, LogOut, Plus, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/hooks/use-auth-session";

const LOGIN_LABEL = "تسجيل الدخول";
const REGISTER_LABEL = "إنشاء حساب";
const LOGOUT_LABEL = "تسجيل الخروج";

type HeaderAuthControlsProps = {
  ctaHref?: string;
  ctaLabel?: string;
  variant?: "public" | "student";
};

export function HeaderAuthControls({
  ctaHref,
  ctaLabel,
  variant = "public",
}: HeaderAuthControlsProps) {
  const router = useRouter();
  const { status, user, refreshSession } = useAuthSession();

  async function handleLogout() {
    const response = await fetch("/api/auth/logout", { method: "POST" });

    if (response.ok) {
      await refreshSession();
      router.replace("/");
      router.refresh();
    }
  }

  const containerClass = variant === "student" ? "hidden items-center gap-2.5 xl:flex" : "hidden items-center gap-2 lg:flex";

  if (status === "loading") {
    return (
      <div className={containerClass} dir="ltr">
        <div className="flex h-[52px] w-[52px] items-center justify-center rounded-[1.05rem] border border-[#e6edf9] bg-white shadow-[0_10px_22px_rgba(15,23,42,0.045)]">
          <Loader2 className="h-4 w-4 animate-spin text-[#123B7A]" />
        </div>
      </div>
    );
  }

  if (status === "authenticated" && user) {
    if (variant === "public") {
      return (
        <div className={containerClass} dir="ltr">
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-[1.15rem] border border-[#e6edf9] bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:text-rose-600"
          >
            {LOGOUT_LABEL}
          </button>
          <Link href="/dashboard">
            <Button>لوحة الطالب</Button>
          </Link>
        </div>
      );
    }

    return (
      <div className={containerClass} dir="ltr">
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex h-[52px] items-center gap-2.5 rounded-[1.05rem] border border-[#e6edf9] bg-white px-5 text-[0.92rem] font-bold text-slate-700 shadow-[0_10px_22px_rgba(15,23,42,0.045)] transition hover:border-rose-200 hover:text-rose-600"
        >
          <LogOut className="h-4 w-4" />
          {LOGOUT_LABEL}
        </button>

        <div className="flex h-[52px] items-center gap-3 rounded-[1.05rem] border border-[#e6edf9] bg-white px-4 shadow-[0_10px_22px_rgba(15,23,42,0.045)]">
          <ChevronDown className="h-4 w-4 text-slate-400" />
          <div className="text-right leading-tight" dir="rtl">
            <div className="text-[1rem] font-extrabold text-slate-900">{user.fullName}</div>
            <div className="mt-1 text-sm font-medium text-slate-400">مستوى متقدم</div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#eef4ff] text-[#2563eb]">
            <UserRound className="h-5 w-5" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden items-center gap-3 lg:flex" dir="ltr">
      <Link
        href="/login"
        className="inline-flex h-[46px] items-center justify-center gap-2 rounded-[0.95rem] bg-[#2563eb] px-[18px] text-sm font-bold text-white shadow-[0_12px_22px_rgba(37,99,235,0.18)] transition hover:bg-[#1d4ed8]"
      >
        <ArrowLeft className="h-4 w-4" />
        {LOGIN_LABEL}
      </Link>
      <Link
        href="/register"
        className="inline-flex h-[46px] items-center justify-center gap-2 rounded-[0.95rem] border border-[#cfe0ff] bg-white px-[18px] text-sm font-bold text-[#2563eb] shadow-[0_8px_18px_rgba(15,23,42,0.03)] transition hover:bg-[#f8fbff]"
      >
        <Plus className="h-4 w-4" />
        {REGISTER_LABEL}
      </Link>
    </div>
  );
}
