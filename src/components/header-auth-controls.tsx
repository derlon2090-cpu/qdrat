"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { House, Loader2, LogOut } from "lucide-react";

import { useAuthSession } from "@/hooks/use-auth-session";
import { Button } from "@/components/ui/button";

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
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    });

    if (response.ok) {
      await refreshSession();
      router.replace("/");
      router.refresh();
    }
  }

  if (status === "loading") {
    return (
      <div className="hidden items-center gap-2 sm:flex">
        <div className="search-btn-header">
          <Loader2 className="h-4 w-4 animate-spin text-[#123B7A]" />
        </div>
      </div>
    );
  }

  if (status === "authenticated" && user) {
    return (
      <div className="hidden items-center gap-2 sm:flex">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
          {user.fullName}
        </div>
        <Link href="/dashboard">
          <Button variant="outline" className="gap-2">
            <House className="h-4 w-4" />
            لوحة الطالب
          </Button>
        </Link>
        <button
          type="button"
          onClick={handleLogout}
          className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:text-rose-600"
        >
          <LogOut className="h-4 w-4" />
          {LOGOUT_LABEL}
        </button>
      </div>
    );
  }

  return (
    <div className="hidden items-center gap-2 sm:flex">
      <Link
        href="/login"
        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#123B7A]/20 hover:text-[#123B7A]"
      >
        {LOGIN_LABEL}
      </Link>
      <Link
        href="/register"
        className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#123B7A]/20 hover:text-[#123B7A]"
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
