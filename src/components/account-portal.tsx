"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import {
  Bell,
  CalendarDays,
  Camera,
  Check,
  CreditCard,
  Flame,
  Heart,
  LockKeyhole,
  LogOut,
  Mail,
  Medal,
  MonitorSmartphone,
  PencilLine,
  ShieldCheck,
  Smartphone,
  Star,
  Trophy,
  User,
} from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import type { AuthSessionUser } from "@/lib/auth-shared";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useStudentPortal } from "@/hooks/use-student-portal";
import { studentTopNavItems } from "@/lib/site-nav";
import { cn } from "@/lib/utils";

type AccountPortalProps = {
  initialAuthUser: AuthSessionUser;
};

type SettingsTab = {
  label: string;
  icon: typeof User;
  active?: boolean;
};

const settingsTabs: SettingsTab[] = [
  { label: "الملف الشخصي", icon: User, active: true },
  { label: "الأمان وكلمة المرور", icon: LockKeyhole },
  { label: "الإشعارات", icon: Bell },
  { label: "الاشتراكات والفواتير", icon: CreditCard },
  { label: "الإنجازات", icon: Trophy },
  { label: "المفضلة", icon: Heart },
  { label: "الجلسات النشطة", icon: MonitorSmartphone },
];

function formatNumber(value: number) {
  return new Intl.NumberFormat("ar-SA").format(value);
}

function formatDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${formatNumber(hours)} س ${formatNumber(minutes)} د`;
}

function fallbackAvatar(user: AuthSessionUser | null) {
  if (!user) return "/avatars/male-student.svg";
  return user.gender === "female" ? "/avatars/female-student.svg" : "/avatars/male-student.svg";
}

function buildStreakTimeline(streak: number) {
  const base = Math.max(12, streak - 6);
  const labels = ["1 مايو", "2 مايو", "3 مايو", "4 مايو", "قبل أمس", "أمس", "اليوم"];
  return labels.map((label, index) => ({
    label,
    value: base + index,
    active: index === labels.length - 1,
  }));
}

async function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("تعذر قراءة الصورة المختارة."));
    reader.readAsDataURL(file);
  });
}

async function loadImage(source: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("تعذر تجهيز الصورة المختارة."));
    image.src = source;
  });
}

async function optimizeAvatar(file: File) {
  const source = await readFileAsDataUrl(file);
  const image = await loadImage(source);
  const maxSide = 720;
  const ratio = Math.min(1, maxSide / Math.max(image.width, image.height));
  const width = Math.max(1, Math.round(image.width * ratio));
  const height = Math.max(1, Math.round(image.height * ratio));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");

  if (!context) {
    return source;
  }

  context.drawImage(image, 0, 0, width, height);
  return canvas.toDataURL("image/jpeg", 0.9);
}

export function AccountPortal({ initialAuthUser }: AccountPortalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user, refreshSession } = useAuthSession();
  const { data, refresh } = useStudentPortal(true);
  const effectiveUser = user ?? initialAuthUser;

  const [fullName, setFullName] = useState(effectiveUser.fullName);
  const [email, setEmail] = useState(effectiveUser.email ?? "");
  const [phone, setPhone] = useState(effectiveUser.phone ?? "");
  const [gender, setGender] = useState<"male" | "female">(effectiveUser.gender === "female" ? "female" : "male");
  const [avatarData, setAvatarData] = useState<string | null>(effectiveUser.avatarData ?? null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setFullName(effectiveUser.fullName);
    setEmail(effectiveUser.email ?? "");
    setPhone(effectiveUser.phone ?? "");
    setGender(effectiveUser.gender === "female" ? "female" : "male");
    setAvatarData(effectiveUser.avatarData ?? null);
  }, [effectiveUser.avatarData, effectiveUser.email, effectiveUser.fullName, effectiveUser.gender, effectiveUser.phone]);

  const heroProgress = data?.progressPercent ?? 72;
  const solvedQuestions = data?.solvedQuestionsCount ?? 2156;
  const bestScore = Math.max(data?.quantProgressPercent ?? 68, data?.verbalProgressPercent ?? 74, 96);
  const streak = data?.challenge.currentStreak ?? 18;
  const totalMinutes = Math.max(((data?.dailyStudyHours ?? 2) * 60 * Math.max(1, streak)), 2538);
  const joinDate = "15 أبريل 2024";
  const avatarSrc = avatarData || effectiveUser.avatarData || fallbackAvatar(effectiveUser);
  const streakTimeline = useMemo(() => buildStreakTimeline(streak), [streak]);

  async function handleLogout() {
    const response = await fetch("/api/auth/logout", { method: "POST" });
    if (response.ok) {
      await refreshSession();
      router.replace("/");
      router.refresh();
    }
  }

  async function persistProfile(nextAvatarData: string | null = avatarData, successMessage = "تم حفظ التعديلات بنجاح.") {
    const response = await fetch("/api/student/profile", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fullName,
        email,
        phone,
        gender,
        avatarData: nextAvatarData,
      }),
    });

    const payload = (await response.json()) as {
      ok?: boolean;
      message?: string;
      user?: AuthSessionUser | null;
    };

    if (!response.ok || !payload.ok) {
      throw new Error(payload.message ?? "تعذر حفظ تحديثات الحساب.");
    }

    const updatedUser = payload.user ?? null;
    if (updatedUser) {
      setFullName(updatedUser.fullName);
      setEmail(updatedUser.email ?? "");
      setPhone(updatedUser.phone ?? "");
      setGender(updatedUser.gender === "female" ? "female" : "male");
      setAvatarData(updatedUser.avatarData ?? nextAvatarData ?? null);
    }

    setSaveMessage(successMessage);
    window.dispatchEvent(
      new CustomEvent("miyaar:session-updated", {
        detail: {
          authenticated: true,
          user: updatedUser ?? {
            ...effectiveUser,
            fullName,
            email,
            phone,
            gender,
            avatarData: nextAvatarData,
          },
        },
      }),
    );
    await refreshSession();
    await refresh();
    router.refresh();
  }

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setSaveError(null);
    setSaveMessage(null);
    setSaving(true);

    try {
      const optimized = await optimizeAvatar(file);
      setAvatarData(optimized);
      await persistProfile(optimized, "تم تحديث الصورة الشخصية بنجاح.");
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "تعذر تجهيز الصورة.");
    } finally {
      setSaving(false);
      event.target.value = "";
    }
  }

  async function handleSave() {
    setSaving(true);
    setSaveError(null);
    setSaveMessage(null);

    try {
      await persistProfile();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "تعذر حفظ التعديلات.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[radial-gradient(circle_at_top,#eef5ff_0%,#f8fbff_32%,#ffffff_70%)] text-slate-900">
      <SiteHeader variant="student" links={studentTopNavItems} initialUser={initialAuthUser} />

      <main className="mx-auto w-[min(calc(100%-1rem),1480px)] pb-8 pt-5 sm:w-[min(calc(100%-2rem),1480px)] md:pb-12 md:pt-7">
        <div className="grid gap-6 xl:[direction:ltr] xl:grid-cols-[minmax(0,1fr)_280px]">
          <section className="space-y-6 xl:[direction:rtl]">
            <Card className="overflow-hidden rounded-[2rem] border border-[#dbe5ff] bg-[radial-gradient(circle_at_left,rgba(255,255,255,0.08),transparent_35%),linear-gradient(120deg,#2c54f1_0%,#2950ec_35%,#1d49df_100%)] text-white shadow-[0_26px_64px_rgba(37,80,235,0.24)]">
              <CardContent className="grid gap-8 p-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
                <div className="space-y-5">
                  <div>
                    <p className="text-base font-semibold text-white/85">تقدمك العام</p>
                    <div className="mt-2 display-font text-6xl font-black">{formatNumber(heroProgress)}%</div>
                  </div>
                  <div className="h-3 overflow-hidden rounded-full bg-white/20">
                    <div
                      className="h-full rounded-full bg-[#6df08f] shadow-[0_0_20px_rgba(109,240,143,0.45)]"
                      style={{ width: `${Math.max(16, heroProgress)}%` }}
                    />
                  </div>
                  <p className="text-xl text-white/90">ممتاز! استمر على هذا الطريق.</p>
                  <Button
                    type="button"
                    onClick={() => document.getElementById("account-form-section")?.scrollIntoView({ behavior: "smooth" })}
                    className="h-14 rounded-full bg-white px-8 text-base font-bold text-[#1f4eea] shadow-[0_16px_34px_rgba(0,0,0,0.14)] hover:bg-white/95"
                  >
                    <PencilLine className="ml-2 h-4 w-4" />
                    تعديل الملف الشخصي
                  </Button>
                </div>

                <div className="flex flex-col items-center gap-5 text-center md:flex-row md:justify-between md:text-right">
                  <div className="space-y-3">
                    <h1 className="display-font text-5xl font-black">{fullName || effectiveUser.fullName}</h1>
                    <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-base font-semibold">
                      <ShieldCheck className="h-4 w-4 text-[#89f5ac]" />
                      مستوى متقدم
                    </div>
                    <p className="max-w-xl text-lg leading-9 text-white/92">
                      استمر في التعلم والممارسة كل يوم لتصل إلى هدفك وتحقق أفضل النتائج.
                    </p>
                  </div>

                  <div className="relative h-44 w-44 rounded-full border-4 border-white/85 bg-white/10 p-1 shadow-[0_20px_40px_rgba(15,23,42,0.25)]">
                    <div className="h-full w-full overflow-hidden rounded-full bg-white">
                      <img src={avatarSrc} alt={fullName || effectiveUser.fullName} className="h-full w-full object-cover" />
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute bottom-3 left-3 flex h-12 w-12 items-center justify-center rounded-full border border-white/30 bg-[#123b7a] text-white shadow-[0_12px_30px_rgba(15,23,42,0.28)] transition hover:scale-105"
                    >
                      <Camera className="h-5 w-5" />
                    </button>
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  title: "أيام متتالية",
                  value: formatNumber(streak),
                  note: "يوم متواصل",
                  icon: Flame,
                  tone: "bg-[#fff4eb] text-[#f97316]",
                  valueColor: "text-[#22a457]",
                },
                {
                  title: "الأسئلة المحلولة",
                  value: formatNumber(solvedQuestions),
                  note: "سؤال",
                  icon: Medal,
                  tone: "bg-[#eef4ff] text-[#2563eb]",
                  valueColor: "text-[#2563eb]",
                },
                {
                  title: "أفضل درجة",
                  value: `${formatNumber(bestScore)}%`,
                  note: "ممتاز",
                  icon: Star,
                  tone: "bg-[#fff8e7] text-[#f59e0b]",
                  valueColor: "text-[#2563eb]",
                },
                {
                  title: "الوقت الإجمالي",
                  value: formatDuration(totalMinutes),
                  note: "وقت الدراسة",
                  icon: CalendarDays,
                  tone: "bg-[#eef4ff] text-[#2563eb]",
                  valueColor: "text-[#2563eb]",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <Card key={item.title} className="rounded-[1.8rem] border border-[#e7edf8] bg-white/95 shadow-[0_18px_38px_rgba(15,23,42,0.04)]">
                    <CardContent className="flex items-center justify-between gap-4 p-6">
                      <div className="space-y-2 text-right">
                        <div className="text-lg font-bold text-slate-800">{item.title}</div>
                        <div className={cn("display-font text-5xl font-black", item.valueColor)}>{item.value}</div>
                        <div className="text-lg text-slate-500">{item.note}</div>
                      </div>
                      <div className={cn("flex h-14 w-14 items-center justify-center rounded-full", item.tone)}>
                        <Icon className="h-7 w-7" />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
              <Card className="overflow-hidden rounded-[1.9rem] border border-[#d9dcff] bg-[linear-gradient(150deg,#7b56ff_0%,#5a43d6_45%,#3e38b5_100%)] text-white shadow-[0_24px_55px_rgba(91,67,214,0.24)]">
                <CardContent className="relative flex min-h-[255px] flex-col justify-between overflow-hidden p-8">
                  <div className="absolute inset-0 opacity-20">
                    <div className="absolute -left-16 bottom-0 h-44 w-44 rounded-full bg-white/12" />
                    <div className="absolute right-10 top-10 h-px w-24 rotate-[-22deg] bg-white/60" />
                    <div className="absolute left-14 top-16 h-px w-20 rotate-[40deg] bg-white/45" />
                  </div>
                  <div className="relative space-y-5">
                    <div className="text-6xl font-black leading-none text-white/35">“</div>
                    <p className="max-w-sm text-[2rem] font-semibold leading-[1.9]">
                      النجاح ليس صدفة، بل هو نتيجة الاستمرار والعمل الجاد كل يوم.
                    </p>
                  </div>
                  <div className="relative text-2xl font-semibold text-white/85">كونان باول</div>
                </CardContent>
              </Card>

              <Card className="rounded-[1.9rem] border border-[#e7edf8] bg-white/95 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
                <CardContent className="space-y-5 p-7">
                  <div className="flex items-center justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#eef4ff] text-[#2563eb]">
                      <CalendarDays className="h-5 w-5" />
                    </div>
                    <div className="text-right">
                      <h2 className="display-font text-3xl font-black text-[#123B7A]">أيامك المتتالية</h2>
                      <p className="mt-2 text-base text-slate-500">استمر في التعلم كل يوم للحفاظ على سلسلة الإنجاز.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-3">
                    {streakTimeline.map((day) => (
                      <div key={`${day.label}-${day.value}`} className="text-center">
                        <div className="mb-3 text-sm font-semibold text-slate-400">{day.label}</div>
                        <div
                          className={cn(
                            "mx-auto flex h-14 w-14 items-center justify-center rounded-full border-2 text-lg font-black",
                            day.active
                              ? "border-[#f8c14f] bg-[#fff4d6] text-[#f59e0b]"
                              : "border-[#d8f5df] bg-[#f2fcf4] text-[#22a457]",
                          )}
                        >
                          {day.active ? <Flame className="h-6 w-6 fill-current" /> : <Check className="h-6 w-6" />}
                        </div>
                        <div className="mt-3 text-2xl font-black text-slate-700">{formatNumber(day.value)}</div>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-full border border-[#d6f4df] bg-[#f2fcf5] px-5 py-3 text-center text-base font-semibold text-[#22a457]">
                    رائع! حافظت على سلسلة {formatNumber(streak)} يوم متتالي.
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
              <Card id="account-form-section" className="rounded-[2rem] border border-[#e7edf8] bg-white/95 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
                <CardContent className="space-y-6 p-8">
                  <div className="text-center">
                    <h2 className="display-font text-3xl font-black text-[#123B7A]">معلومات الحساب</h2>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-slate-500">الاسم الكامل</span>
                      <div className="relative">
                        <Input value={fullName} onChange={(event) => setFullName(event.target.value)} className="h-14 rounded-[1rem] pl-12 pr-4 text-base" />
                        <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      </div>
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-slate-500">الجنس</span>
                      <div className="relative">
                        <select
                          value={gender}
                          onChange={(event) => setGender(event.target.value === "female" ? "female" : "male")}
                          className="flex h-14 w-full appearance-none rounded-[1rem] border border-slate-200 bg-white/90 px-4 py-3 text-base text-slate-900 outline-none transition focus:border-[#2563eb] focus:ring-4 focus:ring-[#edf4ff]"
                        >
                          <option value="male">ذكر</option>
                          <option value="female">أنثى</option>
                        </select>
                        <User className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      </div>
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-slate-500">البريد الإلكتروني</span>
                      <div className="relative">
                        <Input value={email} onChange={(event) => setEmail(event.target.value)} dir="ltr" className="h-14 rounded-[1rem] pl-12 pr-4 text-base" />
                        <Mail className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      </div>
                    </label>

                    <label className="space-y-2">
                      <span className="text-sm font-semibold text-slate-500">تاريخ الانضمام</span>
                      <div className="relative">
                        <Input value={joinDate} readOnly className="h-14 rounded-[1rem] pl-12 pr-4 text-base text-slate-500" />
                        <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      </div>
                    </label>

                    <label className="space-y-2 md:col-span-2">
                      <span className="text-sm font-semibold text-slate-500">رقم الجوال</span>
                      <div className="relative">
                        <Input value={phone} onChange={(event) => setPhone(event.target.value)} dir="ltr" className="h-14 rounded-[1rem] pl-12 pr-4 text-base" />
                        <Smartphone className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                      </div>
                    </label>
                  </div>

                  {saveError ? (
                    <div className="rounded-[1rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
                      {saveError}
                    </div>
                  ) : null}

                  {saveMessage ? (
                    <div className="rounded-[1rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                      {saveMessage}
                    </div>
                  ) : null}

                  <div className="flex justify-center">
                    <Button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="h-14 min-w-[220px] rounded-[1rem] bg-[#2563eb] px-8 text-base font-bold shadow-[0_18px_36px_rgba(37,99,235,0.22)] hover:bg-[#1d4ed8]"
                    >
                      {saving ? "جار حفظ التغييرات..." : "حفظ التغييرات"}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[2rem] border border-[#e7edf8] bg-[linear-gradient(180deg,#f7fbff_0%,#ffffff_100%)] shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
                <CardContent className="space-y-6 p-7">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#eef4ff] text-[#2563eb] shadow-[0_14px_26px_rgba(37,99,235,0.12)]">
                    <Medal className="h-10 w-10" />
                  </div>
                  <div className="space-y-3 text-right">
                    <h3 className="display-font text-3xl font-black text-[#123B7A]">تحديث مستواك</h3>
                    <p className="text-[1.55rem] leading-10 text-slate-800">
                      أنت على بعد {formatNumber(Math.max(1, 100 - heroProgress))}% للوصول إلى المستوى التالي
                    </p>
                  </div>
                  <div className="h-4 overflow-hidden rounded-full bg-[#e8eefc]">
                    <div className="h-full rounded-full bg-[linear-gradient(90deg,#2563eb_0%,#4f8dff_100%)]" style={{ width: `${heroProgress}%` }} />
                  </div>
                  <div className="text-lg font-bold text-[#123B7A]">{formatNumber(heroProgress)}%</div>
                </CardContent>
              </Card>
            </div>
          </section>

          <aside className="space-y-5 xl:[direction:rtl]">
            <Card className="rounded-[1.8rem] border border-[#e7edf8] bg-white/95 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
              <CardContent className="space-y-2 p-5">
                {settingsTabs.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      className={cn(
                        "flex w-full items-center justify-between rounded-[1rem] px-4 py-4 text-right text-lg font-semibold transition",
                        item.active
                          ? "bg-[#eef4ff] text-[#2563eb] shadow-[0_12px_24px_rgba(37,99,235,0.08)]"
                          : "text-slate-700 hover:bg-slate-50",
                      )}
                    >
                      <Icon className={cn("h-5 w-5", item.active ? "text-[#2563eb]" : "text-slate-400")} />
                      <span>{item.label}</span>
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center justify-between rounded-[1rem] px-4 py-4 text-right text-lg font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <LogOut className="h-5 w-5 text-slate-400" />
                  <span>تسجيل الخروج</span>
                </button>
              </CardContent>
            </Card>

            <Card className="rounded-[1.8rem] border border-[#e7edf8] bg-white/95 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
              <CardContent className="space-y-4 p-5 text-center">
                <h3 className="display-font text-2xl font-black text-[#123B7A]">حمل التطبيق</h3>
                <p className="text-sm leading-7 text-slate-500">وتعلّم في أي وقت وفي أي مكان</p>
                <div className="grid gap-3">
                  <Link
                    href="#"
                    className="rounded-[1rem] border border-slate-200 bg-black px-4 py-3 text-sm font-bold text-white"
                  >
                    App Store
                  </Link>
                  <Link
                    href="#"
                    className="rounded-[1rem] border border-slate-200 bg-black px-4 py-3 text-sm font-bold text-white"
                  >
                    Google Play
                  </Link>
                </div>
              </CardContent>
            </Card>
          </aside>
        </div>
      </main>
    </div>
  );
}
