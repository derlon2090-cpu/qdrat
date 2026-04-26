"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type ChangeEvent, type ReactNode } from "react";
import {
  Award,
  BadgeCheck,
  Bell,
  BookOpen,
  CalendarDays,
  Camera,
  Check,
  CheckCircle2,
  ChevronLeft,
  Clock3,
  CreditCard,
  Crown,
  Eye,
  Flame,
  Gem,
  Heart,
  Info,
  Laptop,
  LockKeyhole,
  LogOut,
  Mail,
  Medal,
  MonitorSmartphone,
  MoreVertical,
  PencilLine,
  Receipt,
  Shield,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Star,
  TabletSmartphone,
  Trophy,
  User,
  Wallet,
  type LucideIcon,
} from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuthSession } from "@/hooks/use-auth-session";
import type { AuthSessionUser } from "@/lib/auth-shared";
import { studentTopNavItems } from "@/lib/site-nav";
import { cn } from "@/lib/utils";
import { useStudentPortal } from "@/hooks/use-student-portal";

type AccountPortalProps = {
  initialAuthUser: AuthSessionUser;
};

type SettingsTabKey =
  | "profile"
  | "security"
  | "notifications"
  | "billing"
  | "achievements"
  | "favorites"
  | "sessions";

type SettingsTab = {
  key: SettingsTabKey;
  label: string;
  icon: typeof User;
};

const settingsTabs: SettingsTab[] = [
  { key: "profile", label: "الملف الشخصي", icon: User },
  { key: "security", label: "الأمان وكلمة المرور", icon: LockKeyhole },
  { key: "notifications", label: "الإشعارات", icon: Bell },
  { key: "billing", label: "الاشتراكات والفواتير", icon: CreditCard },
  { key: "achievements", label: "الإنجازات", icon: Trophy },
  { key: "favorites", label: "المفضلة", icon: Heart },
  { key: "sessions", label: "الجلسات النشطة", icon: MonitorSmartphone },
];

type NotificationPreference = {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
};

type FavoriteItem = {
  title: string;
  meta: string;
  time: string;
  category: string;
};

type SessionItem = {
  title: string;
  device: string;
  location: string;
  status: string;
  current?: boolean;
  icon: typeof Laptop;
};

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

function SectionFrame({
  eyebrow,
  title,
  description,
  icon: Icon,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  icon: typeof User;
  children: ReactNode;
}) {
  return (
    <Card className="rounded-[2rem] border border-[#e7edf8] bg-white/95 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
      <CardContent className="space-y-6 p-7">
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-[#eef4ff] text-[#2563eb] shadow-[0_14px_30px_rgba(37,99,235,0.12)]">
            <Icon className="h-8 w-8" />
          </div>
          <div className="space-y-2 text-right">
            <div className="text-sm font-semibold text-slate-400">{eyebrow}</div>
            <h2 className="text-[2rem] font-black tracking-tight text-[#123B7A]">{title}</h2>
            <p className="max-w-2xl text-base leading-8 text-slate-500">{description}</p>
          </div>
        </div>
        {children}
      </CardContent>
    </Card>
  );
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconTone,
}: {
  title: string;
  value: string;
  subtitle: string;
  icon: typeof Medal;
  iconTone: string;
}) {
  return (
    <Card className="rounded-[1.8rem] border border-[#e7edf8] bg-white/95 shadow-[0_18px_38px_rgba(15,23,42,0.04)]">
      <CardContent className="flex items-center justify-between gap-4 p-6">
        <div className="space-y-2 text-right">
          <div className="text-lg font-bold text-slate-800">{title}</div>
          <div className="text-5xl font-black text-[#2563eb]">{value}</div>
          <div className="text-lg text-slate-500">{subtitle}</div>
        </div>
        <div className={cn("flex h-14 w-14 items-center justify-center rounded-full", iconTone)}>
          <Icon className="h-7 w-7" />
        </div>
      </CardContent>
    </Card>
  );
}

function Toggle({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-7 w-12 items-center rounded-full border transition",
        checked ? "border-[#2563eb] bg-[#2563eb]" : "border-slate-200 bg-slate-100",
      )}
    >
      <span
        className={cn(
          "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition",
          checked ? "right-1" : "right-6",
        )}
      />
    </button>
  );
}

function TabButton({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-[0.95rem] px-4 py-2 text-sm font-bold transition",
        active ? "bg-[#2563eb] text-white shadow-[0_10px_20px_rgba(37,99,235,0.18)]" : "bg-[#f6f9ff] text-slate-500 hover:bg-[#eef4ff]",
      )}
    >
      {children}
    </button>
  );
}

export function AccountPortal({ initialAuthUser }: AccountPortalProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { user, refreshSession } = useAuthSession();
  const { data, refresh } = useStudentPortal(true);
  const effectiveUser = user ?? initialAuthUser;

  const [activeTab, setActiveTab] = useState<SettingsTabKey>("profile");
  const [fullName, setFullName] = useState(effectiveUser.fullName);
  const [email, setEmail] = useState(effectiveUser.email ?? "");
  const [phone, setPhone] = useState(effectiveUser.phone ?? "");
  const [gender, setGender] = useState<"male" | "female">(effectiveUser.gender === "female" ? "female" : "male");
  const [avatarData, setAvatarData] = useState<string | null>(effectiveUser.avatarData ?? null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [securityMessage, setSecurityMessage] = useState<string | null>(null);
  const [securityError, setSecurityError] = useState<string | null>(null);

  const [notificationSettings, setNotificationSettings] = useState<NotificationPreference[]>([
    {
      id: "study-reminders",
      title: "إشعارات الدروس والمراجعات",
      description: "استقبل التذكيرات بالمراجعة والدروس والواجبات.",
      enabled: true,
    },
    {
      id: "results",
      title: "نتائج الاختبارات والنتائج",
      description: "تنبيهات عند ظهور النتائج أو انتهاء محاكاة جديدة.",
      enabled: true,
    },
    {
      id: "tips",
      title: "تنبيهات النصائح والتحفيز",
      description: "بطاقات تحفيزية واقتراحات تحسن تقدمك اليومي.",
      enabled: true,
    },
    {
      id: "marketing",
      title: "العروض والخصومات",
      description: "أخبار الباقات الجديدة والعروض الموسمية المميزة.",
      enabled: false,
    },
    {
      id: "weekly",
      title: "التذكيرات الأسبوعية",
      description: "ملخص أسبوعي لتقدمك وما تحتاج إلى مراجعته.",
      enabled: true,
    },
  ]);

  const [achievementFilter, setAchievementFilter] = useState<"all" | "done" | "progress">("all");
  const [favoritesFilter, setFavoritesFilter] = useState<"all" | "tests" | "lessons">("all");

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
  const weeklyConsistency = Math.min(100, heroProgress + 12);

  const achievements = [
    {
      title: "مستمر",
      desc: `أكمل ${formatNumber(streak)} أيام متتالية`,
      progress: 100,
      detail: `${formatNumber(streak)}/${formatNumber(streak)}`,
      icon: Flame,
      color: "from-[#ffe8c7] to-[#fff6e8]",
      iconTone: "bg-[#fff0db] text-[#f59e0b]",
      bucket: "done" as const,
    },
    {
      title: "الخبير",
      desc: "أجب عن 100 سؤال بدقة مرتفعة",
      progress: 68,
      detail: "68/100",
      icon: Award,
      color: "from-[#eef4ff] to-[#f8fbff]",
      iconTone: "bg-[#eef4ff] text-[#2563eb]",
      bucket: "progress" as const,
    },
    {
      title: "المتفوق",
      desc: "احصل على 90% أو أعلى في اختبار كامل",
      progress: 100,
      detail: "1/1",
      icon: BadgeCheck,
      color: "from-[#ecfdf3] to-[#f4fff8]",
      iconTone: "bg-[#e9fcef] text-[#22a457]",
      bucket: "done" as const,
    },
  ];

  const filteredAchievements =
    achievementFilter === "all"
      ? achievements
      : achievements.filter((item) => item.bucket === achievementFilter);

  const favorites: FavoriteItem[] = [
    {
      title: "اختبار القدرات العامة (محوسب)",
      meta: "40 سؤال",
      time: "آخر زيارة منذ 40 دقيقة",
      category: "tests",
    },
    {
      title: "شرح النسبة والتناسب",
      meta: "15 دقيقة",
      time: "آخر زيارة منذ 15 دقيقة",
      category: "lessons",
    },
    {
      title: "ملخص باب الكيمياء الحرارية",
      meta: "الملخصات",
      time: "تمت إضافته للمفضلة هذا الأسبوع",
      category: "lessons",
    },
  ];

  const filteredFavorites =
    favoritesFilter === "all" ? favorites : favorites.filter((item) => item.category === favoritesFilter);

  const activeSessions: SessionItem[] = [
    {
      title: "هذا الجهاز",
      device: "Chrome • Windows",
      location: "الرياض، الآن",
      status: "متصل حاليًا",
      current: true,
      icon: Laptop,
    },
    {
      title: "iPhone 14 Pro",
      device: "Safari • iOS",
      location: "منذ 10:30 م",
      status: "آخر نشاط على الجوال",
      icon: Smartphone,
    },
    {
      title: "MacBook Air",
      device: "Chrome • macOS",
      location: "منذ 9:15 ص",
      status: "آخر نشاط منذ 12 يوم",
      icon: TabletSmartphone,
    },
  ];

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

  function handleSecuritySave() {
    setSecurityError(null);
    setSecurityMessage(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setSecurityError("أكمل الحقول الثلاثة قبل حفظ كلمة المرور.");
      return;
    }

    if (newPassword.length < 8) {
      setSecurityError("يجب أن تكون كلمة المرور الجديدة 8 أحرف على الأقل.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setSecurityError("كلمة المرور الجديدة وتأكيدها غير متطابقين.");
      return;
    }

    setSecurityMessage("تم التحقق من المدخلات. اربط هذا القسم لاحقًا مع API تغيير كلمة المرور.");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  }

  function renderProfileSection() {
    return (
      <section className="space-y-6">
        <Card className="overflow-hidden rounded-[2rem] border border-[#dbe5ff] bg-[radial-gradient(circle_at_left,rgba(255,255,255,0.08),transparent_35%),linear-gradient(120deg,#2c54f1_0%,#2950ec_35%,#1d49df_100%)] text-white shadow-[0_26px_64px_rgba(37,80,235,0.24)]">
          <CardContent className="grid gap-8 p-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
            <div className="space-y-5">
              <div>
                <p className="text-base font-semibold text-white/85">تقدمك العام</p>
                <div className="mt-2 text-6xl font-black">{formatNumber(heroProgress)}%</div>
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
                <h1 className="text-5xl font-black">{fullName || effectiveUser.fullName}</h1>
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
          <MetricCard
            title="أيام متتالية"
            value={formatNumber(streak)}
            subtitle="يوم متواصل"
            icon={Flame}
            iconTone="bg-[#fff4eb] text-[#f97316]"
          />
          <MetricCard
            title="الأسئلة المحلولة"
            value={formatNumber(solvedQuestions)}
            subtitle="سؤال"
            icon={Medal}
            iconTone="bg-[#eef4ff] text-[#2563eb]"
          />
          <MetricCard
            title="أفضل درجة"
            value={`${formatNumber(bestScore)}%`}
            subtitle="ممتاز"
            icon={Star}
            iconTone="bg-[#fff8e7] text-[#f59e0b]"
          />
          <MetricCard
            title="الوقت الإجمالي"
            value={formatDuration(totalMinutes)}
            subtitle="وقت الدراسة"
            icon={CalendarDays}
            iconTone="bg-[#eef4ff] text-[#2563eb]"
          />
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
                  <h2 className="text-3xl font-black text-[#123B7A]">أيامك المتتالية</h2>
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
                رائع! حافظت على سلسلة {formatNumber(streak)} يوم متتالية.
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_320px]">
          <Card id="account-form-section" className="rounded-[2rem] border border-[#e7edf8] bg-white/95 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
            <CardContent className="space-y-6 p-8">
              <div className="text-center">
                <h2 className="text-3xl font-black text-[#123B7A]">معلومات الحساب</h2>
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
                <h3 className="text-3xl font-black text-[#123B7A]">تحديث مستواك</h3>
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
    );
  }

  function renderSecuritySection() {
    const securityRules = [
      "يجب أن تحتوي كلمة المرور على 8 أحرف على الأقل.",
      "يفضل أن تتضمن أحرفًا كبيرة وصغيرة.",
      "تحتوي على أرقام ورموز لتعزيز الأمان.",
    ];

    return (
      <Card className="mx-auto max-w-[720px] rounded-[2rem] border border-[#e7edf8] bg-white shadow-[0_24px_60px_rgba(37,99,235,0.08)]">
        <CardContent className="space-y-6 p-6 md:p-8">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <div className="flex items-center gap-1">
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>الأمان وكلمة المرور</span>
            </div>
            <span>الإعدادات</span>
          </div>

          <div className="grid items-start gap-6 md:grid-cols-[140px_minmax(0,1fr)] md:[direction:ltr]">
            <div className="flex justify-center md:[direction:rtl]">
              <div className="relative flex h-28 w-28 items-center justify-center">
                <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_center,rgba(37,99,235,0.18),transparent_70%)] blur-2xl" />
                <div className="absolute -left-1 top-7 h-2 w-2 rounded-full bg-[#90b4ff]" />
                <div className="absolute -right-1 bottom-8 h-2 w-2 rounded-full bg-[#90b4ff]" />
                <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[linear-gradient(180deg,#eff5ff_0%,#e3ecff_100%)] shadow-[0_16px_34px_rgba(37,99,235,0.12)]">
                  <div className="flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-[linear-gradient(180deg,#5f8cff_0%,#2563eb_100%)] text-white shadow-[0_20px_36px_rgba(37,99,235,0.24)]">
                    <ShieldCheck className="h-8 w-8" />
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 text-right md:[direction:rtl]">
              <div className="space-y-2">
                <h3 className="text-[2rem] font-black text-[#123B7A]">الأمان وكلمة المرور</h3>
                <p className="text-sm leading-7 text-slate-500">
                  قم بتحديث كلمة المرور الحالية لضمان بقاء حسابك محميًا بأفضل درجة أمان.
                </p>
              </div>

              <div className="space-y-3">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-500">كلمة المرور الحالية</span>
                  <div className="relative">
                    <Input
                      value={currentPassword}
                      onChange={(event) => setCurrentPassword(event.target.value)}
                      type="password"
                      className="h-12 rounded-[1rem] border-[#e7edf8] bg-white pl-11 pr-4 text-base shadow-none"
                    />
                    <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                  </div>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-500">كلمة المرور الجديدة</span>
                  <div className="relative">
                    <Input
                      value={newPassword}
                      onChange={(event) => setNewPassword(event.target.value)}
                      type="password"
                      className="h-12 rounded-[1rem] border-[#e7edf8] bg-white pl-11 pr-4 text-base shadow-none"
                    />
                    <Shield className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                  </div>
                </label>

                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-500">تأكيد كلمة المرور الجديدة</span>
                  <div className="relative">
                    <Input
                      value={confirmPassword}
                      onChange={(event) => setConfirmPassword(event.target.value)}
                      type="password"
                      className="h-12 rounded-[1rem] border-[#e7edf8] bg-white pl-11 pr-4 text-base shadow-none"
                    />
                    <Eye className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-300" />
                  </div>
                </label>
              </div>

              <div className="rounded-[1rem] border border-[#d8e6ff] bg-[#f8fbff] px-4 py-4">
                <div className="mb-2 flex items-center justify-between text-sm font-bold text-[#123B7A]">
                  <Info className="h-4 w-4 text-[#2563eb]" />
                  <span>تلميحات الأمان</span>
                </div>
                <ul className="space-y-1.5 text-sm leading-7 text-slate-600">
                  {securityRules.map((rule) => (
                    <li key={rule} className="flex items-center gap-2">
                      <Check className="h-4 w-4 text-emerald-500" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {securityError ? (
                <div className="rounded-[1rem] border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-600">
                  {securityError}
                </div>
              ) : null}

              {securityMessage ? (
                <div className="rounded-[1rem] border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
                  {securityMessage}
                </div>
              ) : null}

              <Button
                type="button"
                onClick={handleSecuritySave}
                className="h-12 w-full rounded-[0.95rem] bg-[#2563eb] text-base font-bold shadow-[0_14px_28px_rgba(37,99,235,0.18)] hover:bg-[#1d4ed8]"
              >
                حفظ كلمة المرور
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  function renderNotificationsSection() {
    return (
      <Card className="mx-auto max-w-[720px] rounded-[2rem] border border-[#e7edf8] bg-white shadow-[0_24px_60px_rgba(37,99,235,0.08)]">
        <CardContent className="space-y-6 p-6 md:p-8">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <div className="flex items-center gap-1">
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>الإشعارات</span>
            </div>
            <span>الإعدادات</span>
          </div>

          <div className="flex flex-col items-center gap-3 text-center">
            <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,#fff7cc_0%,#fff1ab_52%,#ffe489_100%)] shadow-[0_16px_32px_rgba(245,158,11,0.18)]">
              <div className="absolute right-0 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">1</div>
              <Bell className="h-11 w-11 text-[#f5a623]" />
            </div>
            <div className="space-y-1 text-right">
              <h3 className="text-[2rem] font-black text-[#123B7A]">الإشعارات</h3>
              <p className="text-sm leading-7 text-slate-500">إدارة التفضيلات الخاصة بالإشعارات التي تصلك.</p>
            </div>
          </div>

          <div className="overflow-hidden rounded-[1.2rem] border border-[#edf2fb] bg-white">
            {notificationSettings.map((item, index) => (
              <div
                key={item.id}
                className={cn(
                  "flex items-center justify-between gap-4 px-4 py-4",
                  index !== notificationSettings.length - 1 && "border-b border-[#edf2fb]",
                )}
              >
                <Toggle
                  checked={item.enabled}
                  onChange={(next) =>
                    setNotificationSettings((current) =>
                      current.map((entry) => (entry.id === item.id ? { ...entry, enabled: next } : entry)),
                    )
                  }
                />
                <div className="space-y-1 text-right">
                  <div className="text-base font-bold text-slate-800">{item.title}</div>
                  <div className="text-sm leading-7 text-slate-500">{item.description}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between rounded-[1rem] border border-[#dbe5ff] bg-[#f8fbff] px-4 py-3 text-sm text-slate-500">
            <Info className="h-4 w-4 text-[#2563eb]" />
            <span>ستصلك الإشعارات على متصفحك وبريدك الإلكتروني حسب الخيارات التي فعلتها.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  function renderBillingSection() {
    const billingFeatures: Array<{ label: string; icon: LucideIcon }> = [
      { label: "نماذج كاملة", icon: BookOpen },
      { label: "إحصائيات متقدمة", icon: Medal },
      { label: "مراجعة ذكية", icon: Sparkles },
      { label: "دعم الأولوية", icon: Shield },
    ];

    return (
      <Card className="mx-auto max-w-[760px] rounded-[2rem] border border-[#e7edf8] bg-white shadow-[0_24px_60px_rgba(37,99,235,0.08)]">
        <CardContent className="space-y-6 p-6 md:p-8">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <div className="flex items-center gap-1">
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>الاشتراكات والفواتير</span>
            </div>
            <span>الإعدادات</span>
          </div>

          <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_140px] md:[direction:ltr]">
            <div className="space-y-4 text-right md:[direction:rtl]">
              <h3 className="text-[2rem] font-black text-[#123B7A]">الاشتراكات والفواتير</h3>
              <p className="text-sm leading-7 text-slate-500">
                متابعة اشتراكك الحالي والاطلاع على حالة الباقة والفواتير المرتبطة بحسابك.
              </p>
            </div>
            <div className="flex justify-center md:[direction:rtl]">
              <div className="flex h-24 w-24 items-center justify-center rounded-[1.7rem] bg-[linear-gradient(180deg,#f4f8ff_0%,#dfe9ff_100%)] shadow-[0_16px_32px_rgba(59,130,246,0.12)]">
                <CreditCard className="h-10 w-10 text-[#5b7cff]" />
              </div>
            </div>
          </div>

          <div className="rounded-[1.35rem] border border-[#dce6ff] bg-[linear-gradient(135deg,#0f2f61_0%,#123b7a_55%,#1f4eea_100%)] p-5 text-white shadow-[0_18px_38px_rgba(18,59,122,0.22)]">
            <div className="flex items-start justify-between gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-white/10 text-white">
                <Crown className="h-6 w-6" />
              </div>
              <div className="space-y-2 text-right">
                <div className="inline-flex items-center rounded-full bg-[#1f8f55] px-2.5 py-1 text-[11px] font-bold">نشطة</div>
                <div className="text-xl font-black">الباقة المميزة</div>
                <p className="text-sm text-white/80">الوصول الكامل لجميع البنوك والاختبارات حتى 15 مايو 2024</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-4">
            {billingFeatures.map(({ label, icon: Icon }) => (
              <div key={label} className="rounded-[1.1rem] border border-[#edf2fb] bg-[#fbfdff] p-4 text-center">
                <Icon className="mx-auto h-5 w-5 text-[#2563eb]" />
                <div className="mt-3 text-sm font-semibold text-slate-700">{label}</div>
              </div>
            ))}
          </div>

          <div className="space-y-4 rounded-[1.2rem] border border-[#edf2fb] bg-white p-5">
            <div className="flex items-center justify-between">
              <div className="rounded-full border border-[#d7e3ff] px-3 py-1 text-xs font-bold text-[#2563eb]">فيزا</div>
              <div className="text-right">
                <div className="text-lg font-bold text-slate-800">طريقة الدفع</div>
                <div className="text-sm text-slate-500">**** **** **** 4242</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="button" variant="outline" className="h-11 rounded-[0.95rem] border-[#d7e3ff] px-5 text-[#2563eb] shadow-none">
                إدارة الاشتراك
              </Button>
              <Button type="button" variant="ghost" className="h-11 rounded-[0.95rem] px-4 text-rose-500 hover:bg-rose-50 hover:text-rose-600">
                إلغاء الاشتراك
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  function renderAchievementsSection() {
    return (
      <Card className="mx-auto max-w-[760px] rounded-[2rem] border border-[#e7edf8] bg-white shadow-[0_24px_60px_rgba(37,99,235,0.08)]">
        <CardContent className="space-y-6 p-6 md:p-8">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <div className="flex items-center gap-1">
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>الإنجازات</span>
            </div>
            <span>الإعدادات</span>
          </div>

          <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_120px] md:[direction:ltr]">
            <div className="space-y-4 text-right md:[direction:rtl]">
              <h3 className="text-[2rem] font-black text-[#123B7A]">الإنجازات</h3>
              <p className="text-sm leading-7 text-slate-500">تابع إنجازاتك وبياناتك التعليمية المصنفة.</p>
            </div>
            <div className="flex justify-center md:[direction:rtl]">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_35%,#fff4d8_0%,#ffe29b_55%,#ffd36b_100%)] shadow-[0_16px_32px_rgba(245,158,11,0.14)]">
                <Trophy className="h-11 w-11 text-[#d58c00]" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2 rounded-[1rem] bg-[#f7fbff] p-1">
            <TabButton active={achievementFilter === "all"} onClick={() => setAchievementFilter("all")}>
              الكل
            </TabButton>
            <TabButton active={achievementFilter === "done"} onClick={() => setAchievementFilter("done")}>
              تم تحقيقها
            </TabButton>
            <TabButton active={achievementFilter === "progress"} onClick={() => setAchievementFilter("progress")}>
              قيد التقدم
            </TabButton>
          </div>

          <div className="space-y-3">
            {filteredAchievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <div key={achievement.title} className="rounded-[1rem] border border-[#edf2fb] bg-white px-4 py-4">
                  <div className="mb-3 flex items-start justify-between gap-4">
                    <div className={cn("flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br", achievement.color)}>
                      <Icon className={cn("h-5 w-5", achievement.iconTone)} />
                    </div>
                    <div className="flex-1 text-right">
                      <div className="text-base font-bold text-slate-800">{achievement.title}</div>
                      <div className="text-sm text-slate-500">{achievement.desc}</div>
                    </div>
                  </div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-semibold text-slate-700">{achievement.detail}</span>
                    <span className="text-slate-400">{formatNumber(achievement.progress)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#edf2fb]">
                    <div
                      className={cn("h-full rounded-full", achievement.progress === 100 ? "bg-[#22a457]" : "bg-[#2563eb]")}
                      style={{ width: `${achievement.progress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <Button type="button" variant="outline" className="h-11 w-full rounded-[0.95rem] border-[#d7e3ff] px-6 text-[#2563eb] shadow-none">
            عرض جميع الإنجازات
          </Button>
        </CardContent>
      </Card>
    );
  }

  function renderFavoritesSection() {
    return (
      <Card className="mx-auto max-w-[760px] rounded-[2rem] border border-[#e7edf8] bg-white shadow-[0_24px_60px_rgba(37,99,235,0.08)]">
        <CardContent className="space-y-6 p-6 md:p-8">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <div className="flex items-center gap-1">
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>المفضلة</span>
            </div>
            <span>الإعدادات</span>
          </div>

          <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_120px] md:[direction:ltr]">
            <div className="space-y-4 text-right md:[direction:rtl]">
              <h3 className="text-[2rem] font-black text-[#123B7A]">المفضلة</h3>
              <p className="text-sm leading-7 text-slate-500">الاختبارات والدروس المحفوظة لديك للعودة إليها بسرعة.</p>
            </div>
            <div className="flex justify-center md:[direction:rtl]">
              <div className="flex h-20 w-20 items-center justify-center rounded-[1.35rem] bg-[linear-gradient(180deg,#ffe7f4_0%,#ffd6ef_100%)] shadow-[0_14px_30px_rgba(236,72,153,0.12)]">
                <Heart className="h-9 w-9 fill-current text-[#d946ef]" />
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2 rounded-[1rem] bg-[#f7fbff] p-1">
            <TabButton active={favoritesFilter === "all"} onClick={() => setFavoritesFilter("all")}>
              الكل
            </TabButton>
            <TabButton active={favoritesFilter === "tests"} onClick={() => setFavoritesFilter("tests")}>
              الاختبارات
            </TabButton>
            <TabButton active={favoritesFilter === "lessons"} onClick={() => setFavoritesFilter("lessons")}>
              الدروس
            </TabButton>
          </div>

          <div className="space-y-3">
            {filteredFavorites.map((item) => (
              <div key={item.title} className="rounded-[1rem] border border-[#edf2fb] bg-white px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                  <button type="button" className="flex h-9 w-9 items-center justify-center rounded-full text-slate-300 transition hover:bg-slate-50 hover:text-slate-500">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  <div className="flex-1 text-right">
                    <div className="text-base font-bold text-slate-800">{item.title}</div>
                    <div className="mt-1 text-sm text-slate-500">{item.meta}</div>
                    <div className="mt-1 text-xs text-slate-400">{item.time}</div>
                  </div>
                  <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full bg-[#fff7ed] text-[#f59e0b]">
                    <Star className="h-5 w-5 fill-current" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <Button type="button" variant="outline" className="h-11 w-full rounded-[0.95rem] border-[#d7e3ff] px-6 text-[#2563eb] shadow-none">
            إدارة المفضلة
          </Button>
        </CardContent>
      </Card>
    );
  }

  function renderSessionsSection() {
    return (
      <Card className="mx-auto max-w-[760px] rounded-[2rem] border border-[#e7edf8] bg-white shadow-[0_24px_60px_rgba(37,99,235,0.08)]">
        <CardContent className="space-y-6 p-6 md:p-8">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-400">
            <div className="flex items-center gap-1">
              <ChevronLeft className="h-3.5 w-3.5" />
              <span>الجلسات النشطة</span>
            </div>
            <span>الإعدادات</span>
          </div>

          <div className="grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_120px] md:[direction:ltr]">
            <div className="space-y-4 text-right md:[direction:rtl]">
              <h3 className="text-[2rem] font-black text-[#123B7A]">الجلسات النشطة</h3>
              <p className="text-sm leading-7 text-slate-500">الأجهزة التي تم تسجيل الدخول منها داخل حسابك.</p>
            </div>
            <div className="flex justify-center md:[direction:rtl]">
              <div className="flex h-20 w-20 items-center justify-center rounded-[1.35rem] bg-[linear-gradient(180deg,#eaf3ff_0%,#d8e8ff_100%)] shadow-[0_14px_30px_rgba(59,130,246,0.12)]">
                <MonitorSmartphone className="h-10 w-10 text-[#6a9bff]" />
              </div>
            </div>
          </div>

          {activeSessions[0] ? (
            <div className="rounded-[1.1rem] border border-[#dbe5ff] bg-[#f8fbff] px-4 py-4">
              <div className="mb-2 flex items-center justify-between gap-4">
                <div className="rounded-full border border-[#d7e3ff] px-3 py-1 text-xs font-bold text-[#2563eb]">هذا الجهاز</div>
                <div className="text-right">
                  <div className="text-base font-bold text-slate-800">{activeSessions[0].title}</div>
                  <div className="text-sm text-slate-500">{activeSessions[0].device}</div>
                  <div className="text-xs text-slate-400">{activeSessions[0].location}</div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="space-y-3">
            {activeSessions.slice(1).map((session) => {
              const Icon = session.icon;
              return (
                <div key={session.title} className="rounded-[1rem] border border-[#edf2fb] bg-white px-4 py-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f7faff] text-[#7b8da7]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 text-right">
                      <div className="text-base font-bold text-slate-800">{session.title}</div>
                      <div className="text-sm text-slate-500">{session.device}</div>
                      <div className="text-xs text-slate-400">{session.location}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="rounded-[0.95rem] border border-rose-100 bg-rose-50 px-4 py-3 text-center text-sm font-semibold text-rose-500">
            تسجيل الخروج من جميع الأجهزة الأخرى
          </div>
        </CardContent>
      </Card>
    );
  }

  function renderMainSection() {
    switch (activeTab) {
      case "profile":
        return renderProfileSection();
      case "security":
        return renderSecuritySection();
      case "notifications":
        return renderNotificationsSection();
      case "billing":
        return renderBillingSection();
      case "achievements":
        return renderAchievementsSection();
      case "favorites":
        return renderFavoritesSection();
      case "sessions":
        return renderSessionsSection();
      default:
        return renderProfileSection();
    }
  }

  return (
    <div dir="rtl" className="min-h-screen bg-[radial-gradient(circle_at_top,#eef5ff_0%,#f8fbff_32%,#ffffff_70%)] text-slate-900">
      <SiteHeader variant="student" links={studentTopNavItems} initialUser={initialAuthUser} />

      <main className="mx-auto w-[min(calc(100%-1rem),1480px)] pb-8 pt-5 sm:w-[min(calc(100%-2rem),1480px)] md:pb-12 md:pt-7">
        <div className="grid gap-6 xl:[direction:ltr] xl:grid-cols-[minmax(0,1fr)_290px]">
          <section className="space-y-6 xl:[direction:rtl]">{renderMainSection()}</section>

          <aside className="space-y-5 xl:[direction:rtl]">
            <Card className="rounded-[1.8rem] border border-[#e7edf8] bg-white/95 shadow-[0_18px_40px_rgba(15,23,42,0.05)]">
              <CardContent className="space-y-2 p-5">
                {settingsTabs.map((item) => {
                  const Icon = item.icon;
                  const active = activeTab === item.key;

                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => setActiveTab(item.key)}
                      className={cn(
                        "flex w-full items-center justify-between rounded-[1rem] px-4 py-4 text-right text-lg font-semibold transition",
                        active
                          ? "bg-[#eef4ff] text-[#2563eb] shadow-[0_12px_24px_rgba(37,99,235,0.08)]"
                          : "text-slate-700 hover:bg-slate-50",
                      )}
                    >
                      <Icon className={cn("h-5 w-5", active ? "text-[#2563eb]" : "text-slate-400")} />
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
                <h3 className="text-2xl font-black text-[#123B7A]">حمل التطبيق</h3>
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
