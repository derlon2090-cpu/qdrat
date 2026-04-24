"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2, LogOut, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuthSession } from "@/hooks/use-auth-session";

const LOGIN_LABEL = "تسجيل الدخول";
const REGISTER_LABEL = "إنشاء حساب";
const LOGOUT_LABEL = "تسجيل الخروج";

export function HeaderAuthControls({
  ctaHref,
  ctaLabel,
}: {
  ctaHref?: string;
  ctaLabel?: string;
}) {
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

  if (status === "loading") {
    return (
      <div className="hidden items-center gap-3 xl:flex" dir="ltr">
        <div className="flex h-[56px] w-[56px] items-center justify-center rounded-[1.2rem] border border-[#e6edf9] bg-white shadow-[0_12px_26px_rgba(15,23,42,0.05)]">
          <Loader2 className="h-4 w-4 animate-spin text-[#123B7A]" />
        </div>
      </div>
    );
  }

  if (status === "authenticated" && user) {
    return (
      <div className="hidden items-center gap-4 xl:flex" dir="ltr">
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex h-[56px] items-center gap-3 rounded-[1.2rem] border border-[#e6edf9] bg-white px-6 text-[0.95rem] font-bold text-slate-700 shadow-[0_12px_26px_rgba(15,23,42,0.05)] transition hover:border-rose-200 hover:text-rose-600"
        >
          <LogOut className="h-4 w-4" />
          {LOGOUT_LABEL}
        </button>

        <div className="flex h-[56px] items-center gap-4 rounded-[1.2rem] border border-[#e6edf9] bg-white px-5 shadow-[0_12px_26px_rgba(15,23,42,0.05)]">
          <ChevronDown className="h-4 w-4 text-slate-400" />
          <div className="text-right leading-tight" dir="rtl">
            <div className="text-[1.05rem] font-extrabold text-slate-900">{user.fullName}</div>
            <div className="mt-1 text-sm font-medium text-slate-400">مستوى متقدم</div>
          </div>
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef4ff] text-[#2563eb]">
            <UserRound className="h-5 w-5" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="hidden items-center gap-2 lg:flex">
      <Link
        href="/login"
        className="rounded-[1.15rem] border border-[#e6edf9] bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#123B7A]/20 hover:text-[#123B7A]"
      >
        {LOGIN_LABEL}
      </Link>
      <Link
        href="/register"
        className="rounded-[1.15rem] border border-[#e6edf9] bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#123B7A]/20 hover:text-[#123B7A]"
      >
        {REGISTER_LABEL}
      </Link>
      {ctaHref && ctaLabel ? (
        <Link href={ctaHref}>
          <Button>{ctaLabel}</Button>
        </Link>
      ) : null}
    </div>
  );
}
