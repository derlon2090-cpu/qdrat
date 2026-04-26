"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BarChart3,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  Filter,
  FolderOpen,
  Loader2,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  Trophy,
} from "lucide-react";

import { PublicPaperModelsIllustration } from "@/components/public-site-illustrations";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthSession } from "@/hooks/use-auth-session";
import type { AuthSessionUser } from "@/lib/auth-shared";
import { studentTopNavItems } from "@/lib/site-nav";
import { cn } from "@/lib/utils";

type ExamTypeFilter = "الكل" | "لفظي" | "كمي" | "مختلط";
type SectionFilter = "الكل" | "عام" | "متقدم";
type LevelFilter = "الكل" | "مبتدئ" | "متوسط" | "متقدم";
type SortFilter = "الأحدث" | "الأكثر استخدامًا" | "الأعلى تقييمًا";
type ExamBadge = "جديد" | "شامل" | "متقدم";

type TrainingModel = {
  id: string;
  title: string;
  subtitle: string;
  questions: number;
  minutes: number;
  performance: number;
  badge: ExamBadge;
  badgeTone: string;
  progressTone: string;
  examType: Exclude<ExamTypeFilter, "الكل">;
  section: Exclude<SectionFilter, "الكل">;
  level: Exclude<LevelFilter, "الكل">;
};

const modelsSeed: TrainingModel[] = [
  {
    id: "model-48",
    title: "نموذج اختبار 48",
    subtitle: "محاكاة شاملة لاختبار القدرات العامة",
    questions: 120,
    minutes: 155,
    performance: 72,
    badge: "جديد",
    badgeTone: "bg-[#eefdf4] text-[#16a34a]",
    progressTone: "bg-[#22c55e]",
    examType: "مختلط",
    section: "عام",
    level: "متوسط",
  },
  {
    id: "model-47",
    title: "نموذج اختبار 47",
    subtitle: "محاكاة شاملة لاختبار القدرات العامة",
    questions: 120,
    minutes: 155,
    performance: 72,
    badge: "شامل",
    badgeTone: "bg-[#eef4ff] text-[#2563eb]",
    progressTone: "bg-[#22c55e]",
    examType: "مختلط",
    section: "عام",
    level: "متوسط",
  },
  {
    id: "model-43",
    title: "نموذج اختبار 43",
    subtitle: "محاكاة شاملة لاختبار القدرات العامة",
    questions: 120,
    minutes: 155,
    performance: 72,
    badge: "شامل",
    badgeTone: "bg-[#eef4ff] text-[#2563eb]",
    progressTone: "bg-[#22c55e]",
    examType: "مختلط",
    section: "عام",
    level: "متوسط",
  },
  {
    id: "model-41",
    title: "نموذج اختبار 41",
    subtitle: "محاكاة شاملة لاختبار القدرات العامة",
    questions: 120,
    minutes: 155,
    performance: 72,
    badge: "متقدم",
    badgeTone: "bg-[#fff1f2] text-[#e11d48]",
    progressTone: "bg-[#2563eb]",
    examType: "مختلط",
    section: "متقدم",
    level: "متقدم",
  },
  {
    id: "model-40",
    title: "نموذج اختبار 40",
    subtitle: "محاكاة شاملة لاختبار القدرات العامة",
    questions: 120,
    minutes: 155,
    performance: 72,
    badge: "جديد",
    badgeTone: "bg-[#eefdf4] text-[#16a34a]",
    progressTone: "bg-[#f59e0b]",
    examType: "مختلط",
    section: "عام",
    level: "مبتدئ",
  },
  {
    id: "model-42",
    title: "نموذج اختبار 42",
    subtitle: "محاكاة شاملة لاختبار القدرات العامة",
    questions: 120,
    minutes: 155,
    performance: 72,
    badge: "شامل",
    badgeTone: "bg-[#eef4ff] text-[#2563eb]",
    progressTone: "bg-[#2563eb]",
    examType: "مختلط",
    section: "عام",
    level: "متوسط",
  },
  {
    id: "model-38",
    title: "نموذج اختبار 38",
    subtitle: "محاكاة شاملة لاختبار القدرات العامة",
    questions: 120,
    minutes: 155,
    performance: 72,
    badge: "متقدم",
    badgeTone: "bg-[#fff1f2] text-[#e11d48]",
    progressTone: "bg-[#f59e0b]",
    examType: "مختلط",
    section: "متقدم",
    level: "متقدم",
  },
  {
    id: "model-37",
    title: "نموذج اختبار 37",
    subtitle: "محاكاة شاملة لاختبار القدرات العامة",
    questions: 120,
    minutes: 155,
    performance: 72,
    badge: "شامل",
    badgeTone: "bg-[#eef4ff] text-[#2563eb]",
    progressTone: "bg-[#7c3aed]",
    examType: "مختلط",
    section: "عام",
    level: "متوسط",
  },
];

function formatNumber(value: number) {
  return new Intl.NumberFormat("ar-SA").format(value);
}

function ModelsOverviewCards() {
  const cards = [
    {
      title: "إجمالي النماذج",
      value: "48",
      note: "نموذج متاح",
      icon: FolderOpen,
      tone: "bg-[#eef4ff] text-[#2563eb]",
    },
    {
      title: "نموذج مكتمل",
      value: "12",
      note: "تم الاختبار",
      icon: CheckCircle2,
      tone: "bg-[#eef4ff] text-[#2563eb]",
    },
    {
      title: "متوسط الدرجات",
      value: "72%",
      note: "أداؤك العام",
      icon: Trophy,
      tone: "bg-[#edfdf3] text-[#16a34a]",
    },
    {
      title: "أفضل درجة",
      value: "94%",
      note: "أعلى نتيجة",
      icon: Sparkles,
      tone: "bg-[#fff7ed] text-[#f59e0b]",
    },
    {
      title: "إجمالي الوقت",
      value: "24 س 35 د",
      note: "وقت الاختبارات",
      icon: Clock3,
      tone: "bg-[#eef4ff] text-[#2563eb]",
    },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="rounded-[1.55rem] border border-[#e7edf8] bg-white/95 shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
            <CardContent className="flex items-center justify-between gap-4 p-5">
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-500">{card.title}</div>
                <div className="mt-2 text-[2rem] font-black tracking-tight text-slate-950">{card.value}</div>
                <div className="mt-1 text-sm text-slate-400">{card.note}</div>
              </div>
              <div className={cn("flex h-14 w-14 items-center justify-center rounded-full", card.tone)}>
                <Icon className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function PaperModelsPortal({
  initialAuthUser = null,
}: {
  initialAuthUser?: AuthSessionUser | null;
}) {
  const { status, user } = useAuthSession();
  const effectiveUser = status === "authenticated" ? user : status === "loading" ? initialAuthUser : null;
  const isAuthenticated = Boolean(effectiveUser);

  const [query, setQuery] = useState("");
  const [examType, setExamType] = useState<ExamTypeFilter>("الكل");
  const [section, setSection] = useState<SectionFilter>("الكل");
  const [level, setLevel] = useState<LevelFilter>("الكل");
  const [sortBy, setSortBy] = useState<SortFilter>("الأحدث");
  const [page, setPage] = useState(1);

  const studentModelLinks = useMemo(() => studentTopNavItems, []);

  const visibleModels = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const nextModels = modelsSeed.filter((item) => {
      if (examType !== "الكل" && item.examType !== examType) return false;
      if (section !== "الكل" && item.section !== section) return false;
      if (level !== "الكل" && item.level !== level) return false;
      if (
        normalizedQuery &&
        !`${item.title} ${item.subtitle}`.toLowerCase().includes(normalizedQuery)
      ) {
        return false;
      }
      return true;
    });

    nextModels.sort((left, right) => {
      if (sortBy === "الأعلى تقييمًا") return right.performance - left.performance;
      if (sortBy === "الأكثر استخدامًا") return right.questions - left.questions;
      return Number(right.id.replace(/\D/g, "")) - Number(left.id.replace(/\D/g, ""));
    });

    return nextModels;
  }, [examType, level, query, section, sortBy]);

  const pagedModels = visibleModels.slice(0, 8);

  return (
    <div dir="rtl" className="min-h-screen bg-[#f7fbff] text-slate-900">
      <SiteHeader
        variant={isAuthenticated ? "student" : "public"}
        links={isAuthenticated ? studentModelLinks : undefined}
        initialUser={initialAuthUser}
      />

      <main className="pb-16 pt-8 md:pt-10">
        <div className="mx-auto w-[min(calc(100%-1rem),1280px)] space-y-8 sm:w-[min(calc(100%-2rem),1280px)]">
          <Card className="overflow-hidden rounded-[2rem] border border-[#e8eefb] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)] shadow-[0_20px_50px_rgba(15,23,42,0.05)]">
            <CardContent className="p-6 md:p-8">
              <div className="grid gap-8 lg:grid-cols-[1.02fr,0.98fr] lg:items-center">
                <div className="order-2 lg:order-1">
                  <PublicPaperModelsIllustration className="h-[280px] rounded-[1.75rem] sm:h-[345px]" />
                </div>

                <div className="order-1 lg:order-2">
                  <div className="flex items-center justify-end gap-2 text-sm font-semibold text-slate-400">
                    <span>الرئيسية</span>
                    <span>/</span>
                    <span>النماذج</span>
                  </div>

                  <div className="mt-5">
                    <h1 className="display-font text-[2.4rem] font-black text-[#123B7A] sm:text-[3.2rem]">
                      جميع النماذج التدريبية
                    </h1>
                    <p className="mt-4 max-w-2xl text-[1rem] leading-8 text-slate-500">
                      تدرب على نماذج محاكية للاختبار الحقيقي لرفع جاهزيتك وتحقيق أفضل النتائج.
                    </p>
                  </div>

                  <div className="mt-8 grid gap-3 sm:grid-cols-3">
                    {[
                      {
                        title: "محاكاة حقيقية",
                        note: "تحاكي نمط الاختبار الفعلي",
                        icon: CheckCircle2,
                      },
                      {
                        title: "تصحيح فوري",
                        note: "تعرف على مستواك مباشرة",
                        icon: Target,
                      },
                      {
                        title: "إحصائيات تفصيلية",
                        note: "تحليل أدائك بعد كل اختبار",
                        icon: BarChart3,
                      },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <Card key={item.title} className="rounded-[1.3rem] border border-[#edf2fb] bg-white/90 shadow-[0_12px_26px_rgba(15,23,42,0.03)]">
                          <CardContent className="flex items-center gap-4 p-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#eef4ff] text-[#2563eb]">
                              <Icon className="h-5 w-5" />
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-bold text-slate-900">{item.title}</div>
                              <div className="mt-1 text-xs leading-6 text-slate-500">{item.note}</div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[1.7rem] border border-[#e7edf8] bg-white/95 shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
            <CardContent className="space-y-5 p-5 md:p-6">
              <div className="grid gap-3 xl:grid-cols-[190px_1fr_170px_170px_170px_170px]">
                <div className="flex items-center gap-3 rounded-[1rem] border border-[#e7edf8] bg-[#fbfdff] px-4 py-3 text-sm font-bold text-slate-600">
                  <Filter className="h-4 w-4 text-slate-400" />
                  ترتيب حسب
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value as SortFilter)}
                    className="mr-auto bg-transparent text-sm font-bold outline-none"
                  >
                    <option value="الأحدث">الأحدث</option>
                    <option value="الأكثر استخدامًا">الأكثر استخدامًا</option>
                    <option value="الأعلى تقييمًا">الأعلى تقييمًا</option>
                  </select>
                </div>

                <div className="flex h-12 items-center gap-3 rounded-[1rem] border border-[#e7edf8] bg-[#fbfdff] px-4">
                  <Search className="h-4 w-4 text-slate-400" />
                  <input
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="ابحث عن نموذج..."
                    className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  />
                </div>

                <select
                  value={examType}
                  onChange={(event) => setExamType(event.target.value as ExamTypeFilter)}
                  className="h-12 rounded-[1rem] border border-[#e7edf8] bg-[#fbfdff] px-4 text-sm font-bold text-slate-700 outline-none"
                >
                  <option value="الكل">نوع الاختبار: الكل</option>
                  <option value="مختلط">مختلط</option>
                  <option value="كمي">كمي</option>
                  <option value="لفظي">لفظي</option>
                </select>

                <select
                  value={section}
                  onChange={(event) => setSection(event.target.value as SectionFilter)}
                  className="h-12 rounded-[1rem] border border-[#e7edf8] bg-[#fbfdff] px-4 text-sm font-bold text-slate-700 outline-none"
                >
                  <option value="الكل">القسم: الكل</option>
                  <option value="عام">عام</option>
                  <option value="متقدم">متقدم</option>
                </select>

                <select
                  value={level}
                  onChange={(event) => setLevel(event.target.value as LevelFilter)}
                  className="h-12 rounded-[1rem] border border-[#e7edf8] bg-[#fbfdff] px-4 text-sm font-bold text-slate-700 outline-none"
                >
                  <option value="الكل">المستوى: الكل</option>
                  <option value="مبتدئ">مبتدئ</option>
                  <option value="متوسط">متوسط</option>
                  <option value="متقدم">متقدم</option>
                </select>

                <Button
                  type="button"
                  variant="outline"
                  className="h-12 rounded-[1rem] border-[#bfd2ff] text-[#2563eb]"
                  onClick={() => {
                    setQuery("");
                    setExamType("الكل");
                    setSection("الكل");
                    setLevel("الكل");
                    setSortBy("الأحدث");
                  }}
                >
                  إعادة ضبط
                </Button>
              </div>
            </CardContent>
          </Card>

          <ModelsOverviewCards />

          <Card className="rounded-[1.7rem] border border-[#e7edf8] bg-white/95 shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
            <CardContent className="space-y-6 p-6">
              <div className="flex flex-col gap-4 border-b border-[#eef3fb] pb-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <div className="display-font text-2xl font-bold text-slate-950">جميع النماذج</div>
                  <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-bold text-[#2563eb]">
                    {formatNumber(visibleModels.length)}
                  </span>
                </div>

                <div className="flex items-center gap-6 text-sm font-semibold">
                  <button type="button" className="border-b-2 border-[#2563eb] pb-2 text-[#2563eb]">
                    جميع النماذج
                  </button>
                  <button type="button" className="pb-2 text-slate-400">
                    النماذج المفضلة
                  </button>
                </div>
              </div>

              {!isAuthenticated ? (
                <div className="rounded-[1.5rem] border border-[#e5e9f6] bg-white px-6 py-10 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.35rem] bg-[#fff7ed] text-[#C99A43]">
                    <FolderOpen className="h-8 w-8" />
                  </div>
                  <h2 className="mt-5 display-font text-2xl font-black text-slate-950">هذه الصفحة مخصصة للطلاب المسجلين</h2>
                  <p className="mt-3 text-sm leading-8 text-slate-600">
                    افتح النماذج الكاملة، وابدأ الاختبارات، وتابع أداءك بعد تسجيل الدخول إلى حسابك.
                  </p>
                  <div className="mt-5 flex flex-wrap justify-center gap-3">
                    <Link href="/login?next=%2Fpaper-models">
                      <Button className="h-12 px-6">تسجيل الدخول</Button>
                    </Link>
                    <Link href="/register?next=%2Fpaper-models">
                      <Button variant="outline" className="h-12 px-6">إنشاء حساب</Button>
                    </Link>
                  </div>
                </div>
              ) : (
                <>
                  <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    {pagedModels.map((item) => (
                      <Card key={item.id} className="rounded-[1.5rem] border border-[#e9eef8] bg-white/95 shadow-[0_14px_30px_rgba(15,23,42,0.03)]">
                        <CardContent className="space-y-4 p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-[#f59e0b]">☆</span>
                              <span className={cn("rounded-full px-3 py-1 text-xs font-bold", item.badgeTone)}>
                                {item.badge}
                              </span>
                            </div>
                            <div className="flex h-11 w-11 items-center justify-center rounded-[1rem] bg-[#eef4ff] text-[#2563eb]">
                              <FileText className="h-5 w-5" />
                            </div>
                          </div>

                          <div className="space-y-2 text-right">
                            <div className="display-font text-xl font-bold text-slate-950">{item.title}</div>
                            <div className="text-sm leading-7 text-slate-500">{item.subtitle}</div>
                          </div>

                          <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                            <span className="flex items-center gap-1">
                              <Clock3 className="h-3.5 w-3.5" />
                              {formatNumber(item.minutes)} دقيقة
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="h-3.5 w-3.5" />
                              {formatNumber(item.questions)} سؤال
                            </span>
                          </div>

                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                              <span>متوسط الأداء: {item.performance}%</span>
                              <span>72%</span>
                            </div>
                            <div className="h-1.5 overflow-hidden rounded-full bg-[#edf2fb]">
                              <div className={cn("h-full rounded-full", item.progressTone)} style={{ width: `${item.performance}%` }} />
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              className="flex h-10 w-10 items-center justify-center rounded-[0.9rem] border border-[#d6e3fb] bg-white text-[#2563eb]"
                              aria-label="إحصائيات النموذج"
                            >
                              <BarChart3 className="h-4 w-4" />
                            </button>
                            <Link href="/exam" className="flex-1">
                              <Button variant="outline" className="h-10 w-full rounded-[0.9rem] border-[#bfd2ff] text-[#2563eb]">
                                ابدأ الاختبار
                              </Button>
                            </Link>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="flex items-center justify-center gap-2 pt-3">
                    <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e1e9f8] bg-white text-slate-400">
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setPage(value)}
                        className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-bold transition",
                          page === value
                            ? "border-[#2563eb] bg-[#2563eb] text-white"
                            : "border-[#e1e9f8] bg-white text-slate-500",
                        )}
                      >
                        {value}
                      </button>
                    ))}
                    <span className="px-2 text-slate-400">...</span>
                    <button type="button" className="flex h-10 min-w-10 items-center justify-center rounded-full border border-[#e1e9f8] bg-white px-3 text-sm font-bold text-slate-500">
                      12
                    </button>
                    <button type="button" className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e1e9f8] bg-white text-slate-400">
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[1.7rem] border border-[#e7edf8] bg-white/95 shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
            <CardContent className="grid gap-5 p-6 md:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  title: "نماذج محدثة باستمرار",
                  text: "يتم تحديث نماذج جديدة وفق آخر التحديثات",
                  icon: Sparkles,
                  tone: "bg-[#edfdf3] text-[#22c55e]",
                },
                {
                  title: "تحليل شامل للأداء",
                  text: "احصل على تقرير مفصل بعد كل اختبار",
                  icon: BarChart3,
                  tone: "bg-[#eef4ff] text-[#2563eb]",
                },
                {
                  title: "محاكاة واقعية",
                  text: "تصميم مشابه للاختبار الحقيقي تمامًا",
                  icon: Target,
                  tone: "bg-[#fff1f2] text-[#ef4444]",
                },
                {
                  title: "تتبع التقدم",
                  text: "راقب تطور أدائك عبر الوقت بسهولة",
                  icon: SlidersHorizontal,
                  tone: "bg-[#eef4ff] text-[#2563eb]",
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className="flex items-center gap-4 rounded-[1.4rem] border border-[#edf2fb] bg-white p-4">
                    <div className={cn("flex h-14 w-14 items-center justify-center rounded-full", item.tone)}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="text-right">
                      <div className="text-base font-bold text-slate-900">{item.title}</div>
                      <div className="mt-1 text-sm leading-7 text-slate-500">{item.text}</div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>
      </main>

      <SiteFooter variant="student" />
    </div>
  );
}
