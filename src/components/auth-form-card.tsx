"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  Phone,
  Square,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";

import { useAuthSession } from "@/hooks/use-auth-session";

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
    alt: "أيقونة طالبة",
  },
  {
    value: "male",
    label: "ذكر",
    image: "/avatars/male-student.svg",
    alt: "أيقونة طالب",
  },
];

function FieldLabel({ children }: { children: React.ReactNode }) {
  return <span className="mb-3 block text-right text-sm font-bold text-[#334155]">{children}</span>;
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  icon,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
  icon: React.ReactNode;
}) {
  return (
    <label className="block">
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#64748b]">
          {icon}
        </span>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          type={type}
          placeholder={placeholder}
          className="h-14 w-full rounded-[1.05rem] border border-[#dce5f3] bg-white px-4 pl-12 text-sm text-slate-900 outline-none transition placeholder:text-[#94a3b8] focus:border-[#2f6df2] focus:ring-2 focus:ring-[#dbe7ff]"
          required
        />
      </div>
    </label>
  );
}

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
      <FieldLabel>{label}</FieldLabel>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-[#64748b]">
          <Lock className="h-5 w-5" />
        </span>
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-14 w-full rounded-[1.05rem] border border-[#dce5f3] bg-white px-4 pl-12 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-[#94a3b8] focus:border-[#2f6df2] focus:ring-2 focus:ring-[#dbe7ff]"
          placeholder="•••••••••"
          type={shown ? "text" : "password"}
          required
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 right-4 inline-flex items-center text-[#94a3b8] transition hover:text-[#475569]"
          aria-label={shown ? `إخفاء ${confirm ? "تأكيد " : ""}كلمة المرور` : `إظهار ${confirm ? "تأكيد " : ""}كلمة المرور`}
        >
          {shown ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>
    </label>
  );
}

function SocialButton({
  label,
  mark,
}: {
  label: string;
  mark: React.ReactNode;
}) {
  return (
    <button
      type="button"
      className="flex h-14 w-full items-center justify-center gap-3 rounded-[1.05rem] border border-[#dce5f3] bg-white text-base font-bold text-[#1e293b] transition hover:bg-[#f8fbff]"
    >
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#f8fafc] text-base font-extrabold text-[#1e293b]">
        {mark}
      </span>
      {label}
    </button>
  );
}

export function AuthFormCard({
  mode,
  nextPath = "/dashboard",
}: {
  mode: Mode;
  nextPath?: string;
}) {
  const router = useRouter();
  const { status } = useAuthSession();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [gender, setGender] = useState<GenderValue>("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      router.replace(nextPath);
    }
  }, [nextPath, router, status]);

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
                rememberMe,
              }),
      });

      const payload = (await response.json()) as { ok?: boolean; message?: string };
      if (!response.ok || !payload.ok) {
        throw new Error(payload.message ?? "تعذر إكمال العملية.");
      }

      router.push(nextPath);
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "تعذر إكمال العملية.");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (mode === "login") {
    return (
      <div className="rounded-[2rem] border border-[#e7edf8] bg-white p-8 shadow-[0_26px_60px_rgba(15,23,42,0.08)] md:p-10">
        <div className="text-center">
          <h2 className="display-font text-[2.6rem] font-black text-[#123B7A]">تسجيل الدخول</h2>
          <p className="mt-4 text-[1.06rem] leading-8 text-[#64748b]">
            أهلًا بك مجددًا! يرجى تسجيل الدخول لحسابك
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-9 space-y-5">
          <TextField
            label="البريد الإلكتروني"
            value={identifier}
            onChange={setIdentifier}
            placeholder="example@email.com"
            type="email"
            icon={<Mail className="h-5 w-5" />}
          />

          <PasswordField
            label="كلمة المرور"
            value={password}
            onChange={setPassword}
            shown={showPassword}
            onToggle={() => setShowPassword((value) => !value)}
          />

          <div className="flex items-center justify-between gap-4 text-sm">
            <Link href="/login" className="font-bold text-[#2563eb] transition hover:text-[#1d4ed8]">
              هل نسيت كلمة المرور؟
            </Link>

            <label className="inline-flex items-center gap-2 font-semibold text-[#475569]">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="sr-only"
              />
              <span className="text-[#64748b]">{rememberMe ? "☑" : <Square className="h-5 w-5" />}</span>
              تذكرني
            </label>
          </div>

          {error ? (
            <div className="rounded-[1rem] border border-[#fecdd3] bg-[#fff1f2] px-4 py-3 text-sm font-medium text-[#be123c]">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-[1.05rem] bg-[#2563eb] px-6 text-lg font-bold text-white shadow-[0_16px_28px_rgba(37,99,235,0.2)] transition hover:bg-[#1d4ed8] disabled:opacity-60"
          >
            {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : null}
            تسجيل الدخول
          </button>
        </form>

        <div className="my-8 flex items-center gap-4 text-sm font-semibold text-[#94a3b8]">
          <span className="h-px flex-1 bg-[#e5edf8]" />
          أو
          <span className="h-px flex-1 bg-[#e5edf8]" />
        </div>

        <div className="space-y-4">
          <SocialButton label="تسجيل الدخول عبر Google" mark={<span className="text-[#ea4335]">G</span>} />
          <SocialButton label="تسجيل الدخول عبر Apple" mark={<span className="text-black">A</span>} />
        </div>

        <div className="mt-8 text-center text-base text-[#475569]">
          ليس لديك حساب؟{" "}
          <Link href={`/register?next=${encodeURIComponent(nextPath)}`} className="font-bold text-[#2563eb]">
            إنشاء حساب جديد
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-[0_22px_55px_rgba(15,23,42,0.08)]">
      <div className="display-font text-3xl font-bold text-slate-950">إنشاء حساب</div>
      <p className="mt-3 text-sm leading-8 text-slate-600">
        أنشئ حسابك ليتم حفظ تقدمك، وأسئلتك الخاطئة، وخطتك اليومية باسمك داخل المنصة.
      </p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-5">
        <TextField
          label="الاسم"
          value={fullName}
          onChange={setFullName}
          placeholder="الاسم الكامل"
          icon={<UserRound className="h-5 w-5" />}
        />

        <TextField
          label="البريد الإلكتروني"
          value={email}
          onChange={setEmail}
          placeholder="name@example.com"
          type="email"
          icon={<Mail className="h-5 w-5" />}
        />

        <TextField
          label="رقم الجوال"
          value={phone}
          onChange={setPhone}
          placeholder="05xxxxxxxx"
          icon={<Phone className="h-5 w-5" />}
        />

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

        <PasswordField
          label="كلمة المرور"
          value={password}
          onChange={setPassword}
          shown={showPassword}
          onToggle={() => setShowPassword((value) => !value)}
        />

        <PasswordField
          label="تأكيد كلمة المرور"
          value={confirmPassword}
          onChange={setConfirmPassword}
          shown={showConfirmPassword}
          onToggle={() => setShowConfirmPassword((value) => !value)}
          confirm
        />

        {error ? <div className="rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          إنشاء الحساب
        </button>
      </form>

      <div className="mt-5 text-sm text-slate-500">
        لديك حساب بالفعل؟{" "}
        <Link href={`/login?next=${encodeURIComponent(nextPath)}`} className="font-semibold text-[#123B7A]">
          سجل الدخول
        </Link>
      </div>
    </div>
  );
}
