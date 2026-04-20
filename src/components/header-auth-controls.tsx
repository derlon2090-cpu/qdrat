"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, LogOut } from "lucide-react";

import { useAuthSession } from "@/hooks/use-auth-session";
import { Button } from "@/components/ui/button";

const LOGIN_LABEL = "\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062f\u062e\u0648\u0644";
const REGISTER_LABEL = "\u0625\u0646\u0634\u0627\u0621 \u062d\u0633\u0627\u0628";
const LOGOUT_LABEL = "\u062a\u0633\u062c\u064a\u0644 \u0627\u0644\u062e\u0631\u0648\u062c";

export function HeaderAuthControls({
  ctaHref,
  ctaLabel,
}: {
  ctaHref: string;
  ctaLabel: string;
}) {
  const router = useRouter();
  const { status, user, refreshSession } = useAuthSession();

  async function handleLogout() {
    const response = await fetch("/api/auth/logout", {
      method: "POST",
    });

    if (response.ok) {
      await refreshSession();
      router.refresh();
    }
  }

  if (status === "loading") {
    return (
      <div className="hidden items-center gap-2 sm:flex">
        <div className="search-btn-header">
          <Loader2 className="h-4 w-4 animate-spin text-[#123B7A]" />
        </div>
        <Link href={ctaHref}>
          <Button>{ctaLabel}</Button>
        </Link>
      </div>
    );
  }

  if (status === "authenticated" && user) {
    return (
      <div className="hidden items-center gap-2 sm:flex">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">
          {user.fullName}
        </div>
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
      <Link href={ctaHref}>
        <Button>{ctaLabel}</Button>
      </Link>
    </div>
  );
}
