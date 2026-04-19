"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { useState } from "react";

type Mode = "login" | "register";
type GenderValue = "" | "male" | "female";

const genderOptions: Array<{
  value: Exclude<GenderValue, "">;
  label: string;
  image: string;
  alt: string;
}> = [
  {
    value: "female",
    label: "أنثى",
    image: "/avatars/female-student.svg",
    alt: "أيقونة أنثى",
  },
  {
    value: "male",
    label: "ذكر",
    image: "/avatars/male-student.svg",
    alt: "أيقونة ذكر",
  },
];

function PasswordField({
  label,
  value,
  onChange,
  shown,
  onToggle,
  confirm = false,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  shown: boolean;
  onToggle: () => void;
  confirm?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">{label}</span>
      <div className="relative">
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-12 w-full rounded-2xl border border-slate-200 px-4 pl-12 text-sm outline-none transition focus:border-[#123B7A]"
          placeholder="******"
          type={shown ? "text" : "password"}
          required
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 left-3 inline-flex items-center text-slate-400 transition hover:text-slate-700"
          aria-label={shown ? `إخفاء ${confirm ? "تأكيد " : ""}كلمة المرور` : `إظهار ${confirm ? "تأكيد " : ""}كلمة المرور`}
        >
          {shown ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </label>
  );
}

export function AuthFormCard({ mode }: { mode: Mode }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/question-bank?track=mistakes";

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<GenderValue>("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (mode === "register" && !gender) {
      setError("اختر الجنس قبل إنشاء الحساب.");
      return;
    }

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
                gender,
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
          : "سجل دخولك للوصول إلى قائمة الأخطاء الخاصة بك ومتابعة تقدمك."}
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        {mode === "register" ? (
          <>
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

            <div className="space-y-3">
              <div className="text-sm font-semibold text-slate-700">اختر الجنس</div>
              <div className="grid gap-4 sm:grid-cols-2">
                {genderOptions.map((option) => {
                  const isSelected = gender === option.value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setGender(option.value)}
                      className={`rounded-[1.8rem] border bg-white p-5 text-center transition ${
                        isSelected
                          ? "border-[#C99A43] bg-[#fffaf2] shadow-[0_16px_30px_rgba(201,154,67,0.16)]"
                          : "border-slate-200 hover:border-[#d8c6a3] hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex justify-center">
                        <div className="rounded-[1.5rem] bg-slate-50 px-6 py-4">
                          <Image src={option.image} alt={option.alt} width={88} height={88} className="h-20 w-20" />
                        </div>
                      </div>
                      <div className="mt-4 text-2xl font-semibold text-slate-700">{option.label}</div>
                    </button>
                  );
                })}
              </div>
            </div>
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

        <PasswordField
          label="كلمة المرور"
          value={password}
          onChange={setPassword}
          shown={showPassword}
          onToggle={() => setShowPassword((value) => !value)}
        />

        {mode === "register" ? (
          <PasswordField
            label="تأكيد كلمة المرور"
            value={confirmPassword}
            onChange={setConfirmPassword}
            shown={showConfirmPassword}
            onToggle={() => setShowConfirmPassword((value) => !value)}
            confirm
          />
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
              سجل الدخول
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
