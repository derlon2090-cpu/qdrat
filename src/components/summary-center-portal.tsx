"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Clock3,
  FileText,
  FolderOpen,
  Loader2,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";

import { PublicSummaryFolderIllustration } from "@/components/public-site-illustrations";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthSession } from "@/hooks/use-auth-session";
import { studentTopNavItems } from "@/lib/site-nav";
import type { SummaryListItem } from "@/lib/summaries";
import { cn } from "@/lib/utils";

type SummaryCategory = "الكل" | "كمي" | "لفظي";
type SummaryLevel = "الكل" | "مبتدئ" | "متوسط" | "متقدم";
type SortKey = "الأحدث" | "الأقدم" | "الأكثر صفحات" | "الأقل صفحات";

type SummaryCenterRow = {
  id: string;
  title: string;
  subtitle: string;
  category: Exclude<SummaryCategory, "الكل">;
  level: Exclude<SummaryLevel, "الكل">;
  pageCount: number;
  readingMinutes: number;
  createdAt: string;
  status: "تمت القراءة" | "قراءة الملخص";
  statusTone: string;
  href: string;
};

const summaryCenterStudentLinks = studentTopNavItems.map((item) =>
  item.href === "/summaries" ? { ...item, href: "/summary-center" } : item,
);

const previewRows: SummaryCenterRow[] = [
  {
    id: "preview-1",
    title: "الاستيعاب المقروء",
    subtitle: "ملخص شامل",
    category: "كمي",
    level: "متوسط",
    pageCount: 24,
    readingMinutes: 25,
    createdAt: "2024-05-20",
    status: "تمت القراءة",
    statusTone: "bg-emerald-50 text-emerald-700 border-emerald-200",
    href: "/login?next=/summary-center",
  },
  {
    id: "preview-2",
    title: "التناظر اللفظي",
    subtitle: "ملخص شامل",
    category: "لفظي",
    level: "مبتدئ",
    pageCount: 18,
    readingMinutes: 18,
    createdAt: "2024-05-18",
    status: "قراءة الملخص",
    statusTone: "bg-white text-[#2563eb] border-[#cfe0ff]",
    href: "/login?next=/summary-center",
  },
  {
    id: "preview-3",
    title: "القياس",
    subtitle: "ملخص شامل",
    category: "كمي",
    level: "متوسط",
    pageCount: 16,
    readingMinutes: 15,
    createdAt: "2024-05-16",
    status: "قراءة الملخص",
    statusTone: "bg-white text-[#2563eb] border-[#cfe0ff]",
    href: "/login?next=/summary-center",
  },
  {
    id: "preview-4",
    title: "أكمل الجمل",
    subtitle: "ملخص شامل",
    category: "لفظي",
    level: "متقدم",
    pageCount: 22,
    readingMinutes: 20,
    createdAt: "2024-05-15",
    status: "تمت القراءة",
    statusTone: "bg-emerald-50 text-emerald-700 border-emerald-200",
    href: "/login?next=/summary-center",
  },
];

async function readSummaries() {
  const response = await fetch("/api/summaries", { cache: "no-store" });
  const payload = (await response.json()) as {
    ok?: boolean;
    items?: SummaryListItem[];
    message?: string;
  };

  if (!response.ok || !Array.isArray(payload.items)) {
    throw new Error(payload.message || "تعذر جلب مكتبة الملخصات.");
  }

  return payload.items;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("ar-SA").format(value);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString("en-CA");
}

function inferCategory(fileName: string): Exclude<SummaryCategory, "الكل"> {
  const normalized = fileName.toLowerCase();
  const verbalKeywords = ["لفظ", "تناظر", "إكمال", "مفرد", "استيعاب", "قراءة", "خطأ", "سياقي"];
  const quantKeywords = ["كمي", "هندس", "نسب", "قياس", "جبر", "معادل", "إحص", "عدد"];

  if (verbalKeywords.some((keyword) => normalized.includes(keyword))) {
    return "لفظي";
  }

  if (quantKeywords.some((keyword) => normalized.includes(keyword))) {
    return "كمي";
  }

  return "كمي";
}

function inferLevel(item: SummaryListItem): Exclude<SummaryLevel, "الكل"> {
  if (item.pageCount >= 24 || item.noteCount >= 5) {
    return "متقدم";
  }

  if (item.pageCount >= 16 || item.reviewedPages >= 3) {
    return "متوسط";
  }

  return "مبتدئ";
}

function estimateReadingMinutes(item: SummaryListItem) {
  return Math.max(12, Math.round(item.pageCount * 1.15 + item.noteCount * 2 + item.reviewedPages));
}

function mapItemToRow(item: SummaryListItem): SummaryCenterRow {
  const completed = item.completionRatio >= 55 || item.reviewedPages >= Math.max(1, Math.round(item.pageCount * 0.25));

  return {
    id: item.id,
    title: item.fileName.replace(/\.pdf$/i, ""),
    subtitle: "ملخص شامل",
    category: inferCategory(item.fileName),
    level: inferLevel(item),
    pageCount: item.pageCount,
    readingMinutes: estimateReadingMinutes(item),
    createdAt: item.createdAt,
    status: completed ? "تمت القراءة" : "قراءة الملخص",
    statusTone: completed
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : "bg-white text-[#2563eb] border-[#cfe0ff]",
    href: `/summaries/${item.id}`,
  };
}

function SummaryStatsCards({
  summariesCount,
  readCount,
  readingMinutes,
  topicsCount,
}: {
  summariesCount: number;
  readCount: number;
  readingMinutes: number;
  topicsCount: number;
}) {
  const cards = [
    {
      title: "الموضوعات",
      value: formatNumber(topicsCount),
      note: "تصنيف رئيسي",
      icon: BookOpen,
      tone: "bg-[#eef4ff] text-[#2563eb]",
    },
    {
      title: "وقت القراءة",
      value: `${formatNumber(Math.floor(readingMinutes / 60))} س ${formatNumber(readingMinutes % 60)} د`,
      note: "إجمالي الوقت",
      icon: Clock3,
      tone: "bg-[#fff4df] text-[#f59e0b]",
    },
    {
      title: "تمت قراءتها",
      value: formatNumber(readCount),
      note: "ملخص مقروء",
      icon: CheckCircle2,
      tone: "bg-[#edfdf3] text-[#22c55e]",
    },
    {
      title: "إجمالي الملخصات",
      value: formatNumber(summariesCount),
      note: "ملخص شامل",
      icon: FileText,
      tone: "bg-[#f5f3ff] text-[#7c3aed]",
    },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;

        return (
          <Card key={card.title} className="rounded-[1.7rem] border border-[#e9eef8] bg-white/95 shadow-[0_14px_34px_rgba(15,23,42,0.035)]">
            <CardContent className="flex items-center justify-between gap-4 p-6">
              <div className="text-right">
                <div className="text-sm font-semibold text-slate-500">{card.title}</div>
                <div className="mt-2 text-[2rem] font-black tracking-tight text-slate-950">{card.value}</div>
                <div className="mt-1 text-sm text-slate-400">{card.note}</div>
              </div>
              <div className={cn("flex h-14 w-14 items-center justify-center rounded-full", card.tone)}>
                <Icon className="h-7 w-7" />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function SummaryCenterPortal() {
  const { status, user } = useAuthSession();
  const [items, setItems] = useState<SummaryListItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<SummaryCategory>("الكل");
  const [level, setLevel] = useState<SummaryLevel>("الكل");
  const [sortKey, setSortKey] = useState<SortKey>("الأحدث");
  const [visibleCount, setVisibleCount] = useState(8);

  const isAuthenticated = status === "authenticated" && Boolean(user);

  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      setIsLoadingItems(false);
      return;
    }

    let cancelled = false;
    setIsLoadingItems(true);
    setError(null);

    void readSummaries()
      .then((nextItems) => {
        if (!cancelled) {
          setItems(nextItems);
        }
      })
      .catch((nextError) => {
        if (!cancelled) {
          setError(nextError instanceof Error ? nextError.message : "تعذر جلب مكتبة الملخصات.");
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingItems(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated]);

  const rows = useMemo(() => items.map(mapItemToRow), [items]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const nextRows = rows.filter((row) => {
      if (category !== "الكل" && row.category !== category) {
        return false;
      }

      if (level !== "الكل" && row.level !== level) {
        return false;
      }

      if (
        normalizedQuery &&
        !`${row.title} ${row.subtitle} ${row.category}`.toLowerCase().includes(normalizedQuery)
      ) {
        return false;
      }

      return true;
    });

    nextRows.sort((left, right) => {
      switch (sortKey) {
        case "الأقدم":
          return new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime();
        case "الأكثر صفحات":
          return right.pageCount - left.pageCount;
        case "الأقل صفحات":
          return left.pageCount - right.pageCount;
        case "الأحدث":
        default:
          return new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime();
      }
    });

    return nextRows;
  }, [category, level, query, rows, sortKey]);

  const visibleRows = filteredRows.slice(0, visibleCount);
  const topicsCount = new Set(rows.map((row) => row.category)).size;
  const readCount = rows.filter((row) => row.status === "تمت القراءة").length;
  const totalReadingMinutes = rows.reduce((sum, row) => sum + row.readingMinutes, 0);

  const previewStats = {
    summariesCount: 128,
    readCount: 42,
    readingMinutes: 18 * 60 + 45,
    topicsCount: 12,
  };

  const currentStats = isAuthenticated
    ? {
        summariesCount: rows.length,
        readCount,
        readingMinutes: totalReadingMinutes,
        topicsCount,
      }
    : previewStats;

  const activeRows = isAuthenticated ? visibleRows : previewRows;

  return (
    <div dir="rtl" className="min-h-screen bg-[#f7fbff] text-slate-900">
      <SiteHeader variant={isAuthenticated ? "student" : "public"} links={isAuthenticated ? summaryCenterStudentLinks : undefined} />

      <main className="pb-16 pt-8 md:pt-10">
        <div className="mx-auto w-[min(calc(100%-1rem),1280px)] space-y-8 sm:w-[min(calc(100%-2rem),1280px)]">
          <Card className="overflow-hidden rounded-[2rem] border border-[#e9eef8] bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_24%),linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)] shadow-[0_24px_50px_rgba(15,23,42,0.05)]">
            <CardContent className="p-7 md:p-8">
              <div className="grid gap-8 lg:grid-cols-[0.92fr,1.08fr] lg:items-center">
                <div className="order-2 lg:order-1">
                  <PublicSummaryFolderIllustration className="h-[250px] rounded-[1.6rem] sm:h-[320px]" />
                </div>

                <div className="order-1 lg:order-2">
                  <div className="text-sm font-semibold text-slate-400">الرئيسية / مركز الملخصات</div>
                  <div className="mt-5 flex items-start justify-between gap-4">
                    <div>
                      <h1 className="display-font text-[2.2rem] font-black text-[#123B7A] sm:text-[3rem]">
                        مركز الملخصات
                      </h1>
                      <p className="mt-4 max-w-2xl text-[1rem] leading-8 text-slate-500">
                        ملخصات شاملة ومنظمة لجميع مواضيع القدرات مختصرة ومكتوبة بعناية لمساعدتك على الفهم والمراجعة السريعة.
                      </p>
                    </div>
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-[1.25rem] bg-[#eef4ff] text-[#2563eb] shadow-[0_16px_30px_rgba(37,99,235,0.12)]">
                      <FileText className="h-8 w-8" />
                    </div>
                  </div>

                  <div className="mt-6 flex flex-wrap gap-3">
                    {isAuthenticated ? (
                      <>
                        <Link href="/summaries">
                          <Button className="h-12 px-6">إدارة مكتبة PDF</Button>
                        </Link>
                        <Link href="/question-bank">
                          <Button variant="outline" className="h-12 px-6">الانتقال إلى بنك الأسئلة</Button>
                        </Link>
                      </>
                    ) : (
                      <>
                        <Link href="/login?next=%2Fsummary-center">
                          <Button className="h-12 px-6">سجل الدخول لفتح الملخصات</Button>
                        </Link>
                        <Link href="/register?next=%2Fsummary-center">
                          <Button variant="outline" className="h-12 px-6">إنشاء حساب جديد</Button>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <SummaryStatsCards
            summariesCount={currentStats.summariesCount}
            readCount={currentStats.readCount}
            readingMinutes={currentStats.readingMinutes}
            topicsCount={currentStats.topicsCount}
          />

          <div className="relative grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)]">
            {!isAuthenticated ? (
              <div className="absolute inset-0 z-20 flex items-center justify-center">
                <Card className="w-full max-w-xl border border-[#e5e9f6] bg-white/96 shadow-[0_24px_56px_rgba(15,23,42,0.14)] backdrop-blur">
                  <CardContent className="space-y-5 p-8 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.35rem] bg-[#fff7ed] text-[#C99A43]">
                      <FolderOpen className="h-8 w-8" />
                    </div>
                    <div>
                      <h2 className="display-font text-2xl font-black text-slate-950">هذه الواجهة مخصصة للطلاب المسجلين</h2>
                      <p className="mt-3 text-sm leading-8 text-slate-600">
                        تستطيع تصفح مركز الملخصات الكامل وقراءة الملفات وحفظ تقدمك فقط بعد تسجيل الدخول إلى حسابك.
                      </p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-3">
                      <Link href="/login?next=%2Fsummary-center">
                        <Button className="h-12 px-6">تسجيل الدخول</Button>
                      </Link>
                      <Link href="/register?next=%2Fsummary-center">
                        <Button variant="outline" className="h-12 px-6">إنشاء حساب</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : null}

            <aside className={cn("space-y-5", !isAuthenticated && "pointer-events-none blur-[2px] opacity-45")}>
              <Card className="rounded-[1.7rem] border border-[#e9eef8] bg-white/95 shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
                <CardContent className="space-y-5 p-6">
                  <div className="flex items-center justify-between">
                    <div className="display-font text-xl font-bold text-slate-950">تصفية الملخصات</div>
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setCategory("الكل");
                        setLevel("الكل");
                        setSortKey("الأحدث");
                      }}
                      className="text-sm font-bold text-[#2563eb]"
                    >
                      مسح الكل
                    </button>
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm font-semibold text-slate-500">التصنيف</div>
                    <div className="grid grid-cols-2 gap-3">
                      {(["الكل", "كمي", "لفظي"] as SummaryCategory[]).map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setCategory(item)}
                          className={cn(
                            "rounded-[1rem] border px-4 py-3 text-sm font-bold transition",
                            category === item
                              ? "border-[#b9d0ff] bg-[#eef4ff] text-[#2563eb]"
                              : "border-[#e7edf8] bg-white text-slate-600 hover:bg-[#f8fbff]",
                          )}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm font-semibold text-slate-500">المستوى</div>
                    <div className="grid grid-cols-2 gap-3">
                      {(["الكل", "مبتدئ", "متوسط", "متقدم"] as SummaryLevel[]).map((item) => (
                        <button
                          key={item}
                          type="button"
                          onClick={() => setLevel(item)}
                          className={cn(
                            "rounded-[1rem] border px-4 py-3 text-sm font-bold transition",
                            level === item
                              ? "border-[#b9d0ff] bg-[#eef4ff] text-[#2563eb]"
                              : "border-[#e7edf8] bg-white text-slate-600 hover:bg-[#f8fbff]",
                          )}
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="text-sm font-semibold text-slate-500">ترتيب حسب</div>
                    <div className="rounded-[1rem] border border-[#e7edf8] bg-[#fbfdff] px-4 py-3">
                      <select
                        value={sortKey}
                        onChange={(event) => setSortKey(event.target.value as SortKey)}
                        className="w-full bg-transparent text-sm font-bold text-slate-700 outline-none"
                      >
                        {(["الأحدث", "الأقدم", "الأكثر صفحات", "الأقل صفحات"] as SortKey[]).map((item) => (
                          <option key={item} value={item}>
                            {item}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[1.7rem] border border-[#e9eef8] bg-white/95 shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
                <CardContent className="space-y-4 p-6">
                  <div className="display-font text-xl font-bold text-slate-950">إحصائيات سريعة</div>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">إجمالي الملخصات</span>
                      <span className="font-bold text-[#2563eb]">{formatNumber(currentStats.summariesCount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">إجمالي الصفحات</span>
                      <span className="font-bold text-[#2563eb]">{formatNumber((isAuthenticated ? rows : previewRows).reduce((sum, row) => sum + row.pageCount, 0))}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">إجمالي وقت القراءة</span>
                      <span className="font-bold text-[#f59e0b]">{`${formatNumber(Math.floor(currentStats.readingMinutes / 60))} س ${formatNumber(currentStats.readingMinutes % 60)} د`}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">متوسط التقييم</span>
                      <span className="font-bold text-[#f59e0b]">4.8 / 5</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </aside>

            <section className={cn("space-y-5", !isAuthenticated && "pointer-events-none blur-[2px] opacity-45")}>
              <Card className="rounded-[1.7rem] border border-[#e9eef8] bg-white/95 shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
                <CardContent className="space-y-5 p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <div className="display-font text-2xl font-bold text-slate-950">جميع الملخصات</div>
                      <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-bold text-[#2563eb]">
                        {formatNumber(isAuthenticated ? filteredRows.length : previewRows.length)} ملخص
                      </span>
                    </div>

                    <div className="flex w-full items-center gap-3 sm:max-w-md">
                      <div className="flex h-12 flex-1 items-center gap-3 rounded-[1rem] border border-[#e7edf8] bg-[#fbfdff] px-4">
                        <Search className="h-4 w-4 text-slate-400" />
                        <input
                          value={query}
                          onChange={(event) => setQuery(event.target.value)}
                          placeholder="ابحث في الملخصات..."
                          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                          disabled={!isAuthenticated}
                        />
                      </div>
                    </div>
                  </div>

                  {isLoadingItems ? (
                    <div className="flex min-h-[220px] items-center justify-center gap-3 text-slate-500">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      جارٍ تحميل الملخصات...
                    </div>
                  ) : error ? (
                    <div className="rounded-[1.2rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
                      {error}
                    </div>
                  ) : isAuthenticated && !filteredRows.length ? (
                    <div className="rounded-[1.5rem] border border-dashed border-[#d7e3f7] bg-[#fbfdff] px-6 py-10 text-center">
                      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eef4ff] text-[#2563eb]">
                        <FolderOpen className="h-7 w-7" />
                      </div>
                      <div className="mt-4 display-font text-2xl font-bold text-slate-950">لا توجد ملخصات مطابقة</div>
                      <p className="mt-3 text-sm leading-8 text-slate-600">
                        غيّر الفلاتر الحالية أو ابدأ برفع أول ملخص من مكتبة PDF الخاصة بك.
                      </p>
                      <div className="mt-5">
                        <Link href="/summaries">
                          <Button>اذهب إلى مكتبة PDF</Button>
                        </Link>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="hidden grid-cols-[140px_120px_110px_110px_110px_minmax(0,1fr)] gap-4 rounded-[1.2rem] bg-[#f8fbff] px-5 py-3 text-sm font-bold text-slate-400 lg:grid">
                        <div>الحالة</div>
                        <div>تاريخ الإضافة</div>
                        <div>وقت القراءة</div>
                        <div>عدد الصفحات</div>
                        <div>التصنيف</div>
                        <div>عنوان الملخص</div>
                      </div>

                      <div className="space-y-3">
                        {activeRows.map((row) => (
                          <div
                            key={row.id}
                            className="grid gap-4 rounded-[1.35rem] border border-[#edf2fb] bg-white px-5 py-4 lg:grid-cols-[140px_120px_110px_110px_110px_minmax(0,1fr)] lg:items-center"
                          >
                            <div className="lg:order-6">
                              <Link
                                href={row.href}
                                className={cn(
                                  "inline-flex min-h-[42px] items-center justify-center rounded-full border px-4 text-sm font-bold transition",
                                  row.statusTone,
                                )}
                              >
                                {row.status}
                              </Link>
                            </div>
                            <div className="text-sm font-semibold text-slate-500 lg:order-5">{formatDate(row.createdAt)}</div>
                            <div className="text-sm font-semibold text-slate-500 lg:order-4">{formatNumber(row.readingMinutes)} دقيقة</div>
                            <div className="text-sm font-semibold text-slate-500 lg:order-3">{formatNumber(row.pageCount)}</div>
                            <div className="lg:order-2">
                              <span
                                className={cn(
                                  "inline-flex rounded-full px-3 py-1 text-xs font-bold",
                                  row.category === "كمي"
                                    ? "bg-[#eef4ff] text-[#2563eb]"
                                    : "bg-[#edfdf3] text-[#16a34a]",
                                )}
                              >
                                {row.category}
                              </span>
                            </div>
                            <div className="flex items-start gap-3 lg:order-1">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.9rem] bg-[#eef4ff] text-[#2563eb]">
                                <FileText className="h-5 w-5" />
                              </div>
                              <div className="min-w-0">
                                <div className="truncate text-base font-bold text-slate-900">{row.title}</div>
                                <div className="mt-1 text-sm text-slate-500">{row.subtitle}</div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {isAuthenticated && filteredRows.length > visibleCount ? (
                        <div className="flex justify-center pt-2">
                          <button
                            type="button"
                            onClick={() => setVisibleCount((current) => current + 8)}
                            className="inline-flex h-11 items-center justify-center rounded-full border border-[#d8e3f8] bg-white px-6 text-sm font-bold text-[#2563eb] transition hover:bg-[#f8fbff]"
                          >
                            عرض المزيد
                          </button>
                        </div>
                      ) : null}
                    </>
                  )}
                </CardContent>
              </Card>
            </section>
          </div>

          <section className="space-y-6">
            <div className="text-center">
              <h2 className="display-font text-[2rem] font-black text-[#123B7A]">لماذا ملخصات معيار؟</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  title: "موثوقة ودقيقة",
                  text: "مراجعة من خبراء متخصصين في مجال القدرات",
                  icon: ShieldCheck,
                  tone: "bg-[#eef4ff] text-[#2563eb]",
                },
                {
                  title: "تسهل المراجعة",
                  text: "مصممة لتوفير وقتك وتسهيل المراجعة قبل الاختبار",
                  icon: Clock3,
                  tone: "bg-[#fff4df] text-[#f59e0b]",
                },
                {
                  title: "محدثة باستمرار",
                  text: "تحدث الملخصات باستمرار لضمان أفضل محتوى",
                  icon: Sparkles,
                  tone: "bg-[#edfdf3] text-[#22c55e]",
                },
                {
                  title: "مختصرة ومركزة",
                  text: "محتوى مختصر يغطي أهم النقاط بدون تشويش أو تعقيد",
                  icon: SlidersHorizontal,
                  tone: "bg-[#f5f3ff] text-[#7c3aed]",
                },
              ].map((item) => {
                const CardIcon = item.icon;

                return (
                  <Card key={item.title} className="rounded-[1.6rem] border border-[#e9eef8] bg-white/95 shadow-[0_14px_34px_rgba(15,23,42,0.035)]">
                    <CardContent className="space-y-4 p-6 text-center">
                      <div className={cn("mx-auto flex h-14 w-14 items-center justify-center rounded-full", item.tone)}>
                        <CardIcon className="h-6 w-6" />
                      </div>
                      <div className="display-font text-xl font-bold text-slate-950">{item.title}</div>
                      <p className="text-sm leading-8 text-slate-500">{item.text}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </section>

          <Card className="overflow-hidden rounded-[1.8rem] border border-[#dfe8fb] bg-[linear-gradient(135deg,#5b8dff_0%,#7aa8ff_100%)] text-white shadow-[0_24px_50px_rgba(37,99,235,0.18)]">
            <CardContent className="flex flex-col gap-5 p-7 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="display-font text-[2rem] font-black">جاهز لاختبار قدراتك؟</div>
                <p className="mt-3 max-w-2xl text-sm leading-8 text-white/90">
                  بعد مراجعة الملخصات، اختبر نفسك في بنك الأسئلة وابدأ بقياس مستواك الحقيقي.
                </p>
              </div>
              <Link href="/question-bank">
                <Button variant="outline" className="h-12 min-w-[220px] border-white bg-white text-[#2563eb] hover:bg-white/90">
                  الانتقال إلى بنك الأسئلة
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
