"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useState } from "react";

type Mode = "login" | "register";

export function AuthFormCard({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/question-bank?track=mistakes";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (mode === "register" && password !== confirmPassword) {
      setError("تأكيد كلمة المرور غير مطابق.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(mode === "register" ? "/api/auth/register" : "/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body:
          mode === "register"
            ? JSON.stringify({
                fullName,
                email,
                phone,
                password,
              })
            : JSON.stringify({
                identifier,
                password,
              }),
      });

      const payload = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "تعذر إكمال العملية.");
      }

      router.push(next);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "تعذر إكمال العملية.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-soft">
      <div className="display-font text-3xl font-bold text-slate-950">
        {mode === "register" ? "إنشاء حساب" : "تسجيل الدخول"}
      </div>
      <p className="mt-3 text-sm leading-8 text-slate-600">
        {mode === "register"
          ? "أنشئ حسابك ليتم حفظ أسئلتك الخاطئة وخطتك وتقدمك باسمك."
          : "سجّل دخولك للوصول إلى قائمة الأخطاء الخاصة بك ومتابعة تقدمك."}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        {mode === "register" ? (
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">الاسم</span>
            <input
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#123B7A]"
              placeholder="الاسم الكامل"
              required
            />
          </label>
        ) : null}

        {mode === "register" ? (
          <>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">البريد الإلكتروني</span>
              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#123B7A]"
                placeholder="name@example.com"
                type="email"
              />
            </label>
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">رقم الجوال</span>
              <input
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#123B7A]"
                placeholder="05xxxxxxxx"
              />
            </label>
          </>
        ) : (
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">البريد الإلكتروني أو رقم الجوال</span>
            <input
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#123B7A]"
              placeholder="name@example.com أو 05xxxxxxxx"
              required
            />
          </label>
        )}

        <label className="block">
          <span className="mb-2 block text-sm font-semibold text-slate-700">كلمة المرور</span>
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#123B7A]"
            placeholder="******"
            type="password"
            required
          />
        </label>

        {mode === "register" ? (
          <label className="block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">تأكيد كلمة المرور</span>
            <input
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              className="h-12 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none transition focus:border-[#123B7A]"
              placeholder="******"
              type="password"
              required
            />
          </label>
        ) : null}

        {error ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {mode === "register" ? "إنشاء الحساب" : "تسجيل الدخول"}
        </button>
      </form>

      <div className="mt-5 text-sm text-slate-500">
        {mode === "register" ? (
          <>
            لديك حساب بالفعل؟{" "}
            <Link href={`/login?next=${encodeURIComponent(next)}`} className="font-semibold text-[#123B7A]">
              سجّل الدخول
            </Link>
          </>
        ) : (
          <>
            ليس لديك حساب؟{" "}
            <Link href={`/register?next=${encodeURIComponent(next)}`} className="font-semibold text-[#123B7A]">
              أنشئ حسابًا
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
