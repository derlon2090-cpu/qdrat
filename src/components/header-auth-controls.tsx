"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ChevronDown, Loader2, LogOut, Plus, Settings } from "lucide-react";

import type { AuthSessionUser } from "@/lib/auth-shared";
import { useAuthSession } from "@/hooks/use-auth-session";

function fallbackAvatar(user: AuthSessionUser) {
  return user.gender === "female" ? "/avatars/female-student.svg" : "/avatars/male-student.svg";
}

const LOGIN_LABEL = "تسجيل الدخول";
const REGISTER_LABEL = "إنشاء حساب";
const LOGOUT_LABEL = "تسجيل الخروج";

type HeaderAuthControlsProps = {
  ctaHref?: string;
  ctaLabel?: string;
  variant?: "public" | "student";
  initialUser?: AuthSessionUser | null;
};

export function HeaderAuthControls({
  variant = "public",
  initialUser = null,
}: HeaderAuthControlsProps) {
  const router = useRouter();
  const { status, user, refreshSession } = useAuthSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  async function handleLogout() {
    const response = await fetch("/api/auth/logout", { method: "POST" });

    if (response.ok) {
      setMenuOpen(false);
      await refreshSession();
      router.replace("/");
      router.refresh();
    }
  }

  useEffect(() => {
    if (!menuOpen) return;

    function handlePointerDown(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [menuOpen]);

  const containerClass =
    variant === "student" ? "hidden items-center gap-2 lg:flex xl:gap-2.5" : "hidden items-center gap-3 lg:flex";
  const effectiveUser = status === "authenticated" ? user : status === "loading" ? initialUser : null;
  const isAuthenticated = Boolean(effectiveUser);

  if (status === "loading" && !effectiveUser) {
    return (
      <div className={containerClass} dir="ltr">
        <div className="flex h-[52px] w-[52px] items-center justify-center rounded-[1.05rem] border border-[#e6edf9] bg-white shadow-[0_10px_22px_rgba(15,23,42,0.045)]">
          <Loader2 className="h-4 w-4 animate-spin text-[#123B7A]" />
        </div>
      </div>
    );
  }

  if (isAuthenticated && effectiveUser) {
    return (
      <div className={containerClass} dir="ltr">
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            aria-expanded={menuOpen}
            aria-haspopup="menu"
            className="flex h-[50px] items-center gap-2.5 rounded-[1.05rem] border border-[#e6edf9] bg-white px-3 shadow-[0_10px_22px_rgba(15,23,42,0.045)] transition hover:border-[#cdddff] hover:bg-[#f8fbff] xl:h-[52px] xl:gap-3 xl:px-4"
          >
            <ChevronDown
              className={`h-4 w-4 text-slate-400 transition-transform ${menuOpen ? "rotate-180" : ""}`}
            />
            <div className="max-w-[116px] text-right leading-tight xl:max-w-[148px]" dir="rtl">
              <div className="truncate text-[0.95rem] font-extrabold text-slate-900 xl:text-[1rem]">
                {effectiveUser.fullName}
              </div>
              <div className="mt-1 text-sm font-medium text-slate-400">مستوى متقدم</div>
            </div>
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-[#eef4ff] text-[#2563eb]">
              <img
                src={effectiveUser.avatarData || fallbackAvatar(effectiveUser)}
                alt={effectiveUser.fullName}
                className="h-full w-full object-cover"
              />
            </div>
          </button>

          {menuOpen ? (
            <div
              role="menu"
              dir="rtl"
              className="absolute left-0 top-[calc(100%+0.7rem)] z-50 min-w-[220px] overflow-hidden rounded-[1.1rem] border border-[#e6edf9] bg-white p-2 text-right shadow-[0_24px_54px_rgba(15,23,42,0.14)]"
            >
              <Link
                href="/account"
                role="menuitem"
                onClick={() => setMenuOpen(false)}
                className="flex items-center justify-between rounded-[0.9rem] px-3 py-3 text-sm font-bold text-slate-700 transition hover:bg-[#f8fbff] hover:text-[#123B7A]"
              >
                <span>إعدادات الحساب</span>
                <Settings className="h-4 w-4 text-slate-400" />
              </Link>
              {variant === "public" ? (
                <Link
                  href="/dashboard"
                  role="menuitem"
                  onClick={() => setMenuOpen(false)}
                  className="mt-1 flex items-center justify-between rounded-[0.9rem] px-3 py-3 text-sm font-bold text-slate-700 transition hover:bg-[#f8fbff] hover:text-[#123B7A]"
                >
                  <span>لوحة الطالب</span>
                  <ArrowLeft className="h-4 w-4 text-slate-400" />
                </Link>
              ) : null}
              <button
                type="button"
                role="menuitem"
                onClick={handleLogout}
                className="mt-1 flex w-full items-center justify-between rounded-[0.9rem] px-3 py-3 text-sm font-bold text-rose-600 transition hover:bg-rose-50"
              >
                <span>{LOGOUT_LABEL}</span>
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : null}
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
