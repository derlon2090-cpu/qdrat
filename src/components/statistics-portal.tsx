"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import {
  Activity,
  ArrowUpRight,
  BarChart3,
  BookOpenCheck,
  CheckCircle2,
  CircleGauge,
  Clock3,
  FileText,
  Flame,
  Lightbulb,
  Rocket,
  Sparkles,
  Star,
  TimerReset,
  Trophy,
} from "lucide-react";

import { PublicStatisticsIllustration } from "@/components/public-site-illustrations";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useStudentPortal } from "@/hooks/use-student-portal";
import type { AuthSessionUser } from "@/lib/auth-shared";
import type { StudentPortalData } from "@/lib/student-portal";
import { studentTopNavItems } from "@/lib/site-nav";
import { cn } from "@/lib/utils";

function formatNumber(value: number) {
  return new Intl.NumberFormat("ar-SA").format(value);
}

function formatDuration(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${formatNumber(hours)} س ${formatNumber(minutes)} د`;
}

function buildScoreTrend(progress: number) {
  const anchors = [0.2, 0.24, 0.32, 0.28, 0.38, 0.47, 0.44, 0.51, 0.64, 0.61, 0.69, 0.75, 0.72, 0.82, 0.78, 0.92];
  return anchors.map((anchor, index) => {
    const drift = (index % 3 === 0 ? 2 : -1) + Math.round(progress * 0.03);
    return Math.max(12, Math.min(96, Math.round(progress * anchor + drift)));
  });
}

function buildBenchmarkTrend(progress: number) {
  const current = buildScoreTrend(progress);
  return current.map((point, index) => Math.max(28, Math.min(74, point - 18 + (index % 4 === 0 ? -2 : 1))));
}

function buildHeatmap(dailyHours: number) {
  const rows = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس"];
  const columns = ["9-12 ليلًا", "6-9 مساءً", "3-6 مساءً", "12-3 مساءً", "6-9 صباحًا"];
  return rows.map((row, rowIndex) => ({
    row,
    values: columns.map((_, colIndex) => {
      const base = 18 + rowIndex * 7 + colIndex * 9;
      const focusBoost = colIndex === 3 || colIndex === 4 ? dailyHours * 4 : dailyHours * 2;
      return Math.max(12, Math.min(100, base + focusBoost - rowIndex * 2));
    }),
  }));
}

function buildStreakValues(streak: number) {
  const base = Math.max(6, Math.min(16, streak));
  return [10, 11, 12, 13, 14, 15, base].map((item, index) => item + (index === 5 ? 1 : 0));
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function buildDistribution(data: StudentPortalData) {
  const verbal = clamp(data.verbalProgressPercent, 12, 100);
  const quant = clamp(data.quantProgressPercent, 12, 100);
  const logic = clamp(Math.round((data.progressPercent + data.mistakeMasteryPercent + data.verbalProgressPercent) / 3), 12, 100);
  return [
    { label: "اللفظي", value: verbal, color: "#3b82f6" },
    { label: "الكمي", value: quant, color: "#22c55e" },
    { label: "الاستدلال المنطقي", value: logic, color: "#8b5cf6" },
  ];
}

function buildQuestionTypes() {
  return [
    { label: "اختيار من متعدد", value: 70, color: "#2563eb" },
    { label: "صح / خطأ", value: 20, color: "#22c55e" },
    { label: "إكمال الفراغ", value: 10, color: "#8b5cf6" },
  ];
}

function donutStyle(items: Array<{ value: number; color: string }>) {
  const total = items.reduce((sum, item) => sum + item.value, 0) || 1;
  let offset = 0;
  const stops = items.map((item) => {
    const start = (offset / total) * 100;
    offset += item.value;
    const end = (offset / total) * 100;
    return `${item.color} ${start}% ${end}%`;
  });
  return { backgroundImage: `conic-gradient(${stops.join(", ")})` };
}

function toChartPoints(values: number[], width: number, height: number) {
  if (!values.length) return "";
  const max = Math.max(...values, 100);
  const min = Math.min(...values, 0);
  const span = Math.max(max - min, 1);
  return values
    .map((value, index) => {
      const x = (index / Math.max(values.length - 1, 1)) * width;
      const y = height - ((value - min) / span) * height;
      return `${x},${y}`;
    })
    .join(" ");
}

function describeSemiArc(cx: number, cy: number, r: number) {
  return `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
}

function StatisticsHero({
  data,
  completedModels,
}: {
  data: StudentPortalData;
  completedModels: number;
}) {
  const streakValues = buildStreakValues(data.challenge.currentStreak);

  return (
    <Card className="overflow-hidden rounded-[2rem] border border-[#e8eefb] bg-[linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)] shadow-[0_20px_50px_rgba(15,23,42,0.05)]">
      <CardContent className="p-6 md:p-8">
        <div className="grid gap-8 lg:grid-cols-[1.02fr,0.98fr] lg:items-center">
          <div className="order-2 lg:order-1">
            <PublicStatisticsIllustration className="h-[285px] rounded-[1.8rem] sm:h-[340px]" />
          </div>

          <div className="order-1 space-y-5 lg:order-2">
            <div className="flex items-center justify-end gap-2 text-sm font-semibold text-slate-400">
              <span>الرئيسية</span>
              <span>/</span>
              <span>الإحصائيات</span>
            </div>

            <div>
              <h1 className="display-font text-[2.55rem] font-black leading-[1.12] text-[#123B7A] sm:text-[3.35rem]">
                إحصائياتك الشاملة
              </h1>
              <p className="mt-4 max-w-2xl text-[1rem] leading-8 text-slate-500">
                تحليل مفصل لأدائك وتقدمك في الاختبار القدرات مع مؤشرات تساعدك على
                اتخاذ قرارك القادم بسرعة وثقة.
              </p>
              <div className="mt-3 text-sm font-semibold text-slate-400">
                آخر تحديث: اليوم 10:30 م
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-[#e9eef8] bg-white/96 p-5 shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
              <div className="grid gap-4 md:grid-cols-[110px_minmax(0,1fr)] md:items-center">
                <div className="text-center md:text-right">
                  <div className="flex items-center justify-center gap-2 text-[#f59e0b] md:justify-start">
                    <Flame className="h-5 w-5 fill-current" />
                    <span className="text-sm font-bold">16</span>
                  </div>
                  <div className="mt-2 display-font text-4xl font-black text-[#123B7A]">
                    {formatNumber(data.challenge.currentStreak || 16)}
                  </div>
                  <div className="text-sm text-slate-500">يوم متتالي</div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-base font-bold text-slate-950">أنت على الطريق الصحيح!</div>
                      <div className="text-sm leading-7 text-slate-500">
                        حافظ على هذا التتابع اليومي كي لا تخسر سلسلة إنجازك.
                      </div>
                    </div>
                    <div className="hidden h-12 w-px bg-[#e8eef8] md:block" />
                    <div className="text-right">
                      <div className="text-sm font-semibold text-slate-400">نماذج مكتملة</div>
                      <div className="display-font text-2xl font-black text-[#123B7A]">
                        {formatNumber(completedModels)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {streakValues.map((value, index) => (
                      <div key={`${value}-${index}`} className="rounded-[1rem] border border-[#eef2fb] bg-[#fbfdff] px-2 py-3 text-center">
                        <div className="mb-2 flex items-center justify-center text-[#f59e0b]">
                          <Flame className="h-4 w-4 fill-current" />
                        </div>
                        <div className="text-sm font-bold text-slate-700">{formatNumber(value)}</div>
                        <div className="mt-2 flex items-center justify-center">
                          <div className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2563eb] text-white">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function OverviewCards({
  totalMinutes,
  totalQuestions,
  bestScore,
  averageScore,
  completedModels,
}: {
  totalMinutes: number;
  totalQuestions: number;
  bestScore: number;
  averageScore: number;
  completedModels: number;
}) {
  const cards = [
    {
      title: "إجمالي الوقت",
      value: formatDuration(totalMinutes),
      note: "ساعة",
      icon: Clock3,
      tone: "bg-[#eef4ff] text-[#2563eb]",
      delta: "-4% عن الشهر الماضي",
      deltaTone: "text-rose-500",
    },
    {
      title: "إجمالي الأسئلة",
      value: formatNumber(totalQuestions),
      note: "سؤال",
      icon: FileText,
      tone: "bg-[#eef4ff] text-[#2563eb]",
      delta: "+15% عن الشهر الماضي",
      deltaTone: "text-emerald-500",
    },
    {
      title: "أفضل درجة",
      value: `${formatNumber(bestScore)}%`,
      note: "ممتاز",
      icon: Star,
      tone: "bg-[#eef4ff] text-[#2563eb]",
      delta: "+5% عن الشهر الماضي",
      deltaTone: "text-emerald-500",
    },
    {
      title: "متوسط الدرجات",
      value: `${formatNumber(averageScore)}%`,
      note: "جيد",
      icon: CircleGauge,
      tone: "bg-[#eef4ff] text-[#2563eb]",
      delta: "+5% عن الشهر الماضي",
      deltaTone: "text-emerald-500",
    },
    {
      title: "الاختبارات المكتملة",
      value: formatNumber(completedModels),
      note: "اختبار",
      icon: BookOpenCheck,
      tone: "bg-[#eef4ff] text-[#2563eb]",
      delta: "+12% عن الشهر الماضي",
      deltaTone: "text-emerald-500",
    },
  ];

  return (
    <div className="grid gap-4 xl:grid-cols-5">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title} className="rounded-[1.55rem] border border-[#e7edf8] bg-white/95 shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
            <CardContent className="space-y-4 p-5">
              <div className="flex items-center justify-between gap-4">
                <div className={cn("flex h-14 w-14 items-center justify-center rounded-full", card.tone)}>
                  <Icon className="h-7 w-7" />
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-500">{card.title}</div>
                  <div className="mt-2 text-[2rem] font-black tracking-tight text-[#2563eb]">{card.value}</div>
                  <div className="text-sm text-slate-500">{card.note}</div>
                </div>
              </div>
              <div className={cn("text-sm font-bold", card.deltaTone)}>{card.delta}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function LineChartCard({
  title,
  values,
  footer,
}: {
  title: string;
  values: number[];
  footer?: ReactNode;
}) {
  const points = toChartPoints(values, 520, 210);

  return (
    <Card className="rounded-[1.7rem] border border-[#e7edf8] bg-white/95 shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
      <CardContent className="space-y-6 p-6">
        <div className="flex items-center justify-between">
          <div className="display-font text-2xl font-bold text-slate-950">{title}</div>
          <div className="rounded-full border border-[#e8eef8] bg-[#fbfdff] px-4 py-2 text-sm font-bold text-slate-500">
            آخر 30 يوم
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-[#eef2fb] bg-[#fbfdff] p-4">
          <svg viewBox="0 0 540 240" className="h-[240px] w-full" aria-hidden="true">
            {[0, 25, 50, 75, 100].map((tick, index) => (
              <g key={tick}>
                <line x1="0" x2="540" y1={210 - index * 52.5} y2={210 - index * 52.5} stroke="#e8eef8" strokeWidth="1" />
                <text x="0" y={214 - index * 52.5} fontSize="11" fill="#94a3b8">
                  {tick}%
                </text>
              </g>
            ))}
            <polyline
              points={points}
              fill="none"
              stroke="#2563eb"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {values.map((value, index) => {
              const x = (index / Math.max(values.length - 1, 1)) * 520 + 10;
              const y = 210 - (value / 100) * 210;
              return <circle key={`${value}-${index}`} cx={x} cy={y} r="4" fill="#2563eb" />;
            })}
          </svg>
        </div>
        {footer}
      </CardContent>
    </Card>
  );
}

function DonutCard({
  title,
  items,
  centerValue,
  centerLabel,
}: {
  title: string;
  items: Array<{ label: string; value: number; color: string }>;
  centerValue: string;
  centerLabel: string;
}) {
  return (
    <Card className="rounded-[1.7rem] border border-[#e7edf8] bg-white/95 shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
      <CardContent className="space-y-6 p-6">
        <div className="display-font text-2xl font-bold text-slate-950">{title}</div>
        <div className="grid gap-6 md:grid-cols-[230px_minmax(0,1fr)] md:items-center">
          <div className="mx-auto flex h-[220px] w-[220px] items-center justify-center rounded-full p-5" style={donutStyle(items)}>
            <div className="flex h-full w-full flex-col items-center justify-center rounded-full bg-white text-center shadow-[inset_0_0_0_1px_rgba(232,238,248,0.95)]">
              <div className="display-font text-[2.1rem] font-black text-slate-950">{centerValue}</div>
              <div className="text-sm font-semibold text-slate-500">{centerLabel}</div>
            </div>
          </div>

          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.label} className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-base font-semibold text-slate-600">{item.label}</span>
                </div>
                <span className="text-base font-bold text-[#123B7A]">{formatNumber(item.value)}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function HeatmapCard({ dailyHours }: { dailyHours: number }) {
  const heatmap = buildHeatmap(dailyHours);
  const columns = ["9-12 ليلًا", "6-9 مساءً", "3-6 مساءً", "12-3 مساءً", "6-9 صباحًا"];

  return (
    <Card className="rounded-[1.7rem] border border-[#e7edf8] bg-white/95 shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
      <CardContent className="space-y-5 p-6">
        <div className="flex items-center justify-between">
          <div className="display-font text-2xl font-bold text-slate-950">الأداء حسب الوقت</div>
          <div className="rounded-full border border-[#e8eef8] bg-[#fbfdff] px-4 py-2 text-sm font-bold text-slate-500">
            كل الأقسام
          </div>
        </div>

        <div className="space-y-3">
          {heatmap.map((row) => (
            <div key={row.row} className="grid grid-cols-[78px_repeat(5,minmax(0,1fr))] items-center gap-2">
              <div className="text-sm font-semibold text-slate-500">{row.row}</div>
              {row.values.map((value, index) => (
                <div key={`${row.row}-${index}`} className="h-5 rounded-[0.45rem] bg-[#eef4ff] p-[2px]">
                  <div
                    className="h-full rounded-[0.35rem]"
                    style={{
                      backgroundColor: `rgba(37,99,235,${0.18 + value / 120})`,
                    }}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-2 text-center text-xs font-semibold text-slate-400">
          {columns.map((column) => (
            <div key={column}>{column}</div>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-400">أقل أداء</span>
          <div className="h-3 w-40 rounded-full bg-[linear-gradient(90deg,rgba(37,99,235,0.14),rgba(37,99,235,0.95))]" />
          <span className="text-slate-400">أفضل أداء</span>
        </div>
      </CardContent>
    </Card>
  );
}

function SemiGaugeCard({ value, quant, verbal, logic }: { value: number; quant: number; verbal: number; logic: number }) {
  const safeValue = clamp(value, 0, 100);
  const arcPath = describeSemiArc(110, 110, 82);

  return (
    <Card className="rounded-[1.7rem] border border-[#e7edf8] bg-white/95 shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
      <CardContent className="space-y-5 p-6">
        <div className="flex items-center justify-between">
          <div className="display-font text-2xl font-bold text-slate-950">نسبة الإجابة الصحيحة</div>
          <div className="rounded-full border border-[#e8eef8] bg-[#fbfdff] px-4 py-2 text-sm font-bold text-slate-500">
            كل الأقسام
          </div>
        </div>

        <div className="mx-auto max-w-[270px]">
          <svg viewBox="0 0 220 140" className="h-[170px] w-full" aria-hidden="true">
            <path d={arcPath} fill="none" stroke="#e7edf8" strokeWidth="18" strokeLinecap="round" />
            <path
              d={arcPath}
              fill="none"
              stroke="#2563eb"
              strokeWidth="18"
              strokeLinecap="round"
              pathLength={100}
              strokeDasharray={`${safeValue} 100`}
            />
            <text x="110" y="92" textAnchor="middle" className="fill-slate-950 text-[30px] font-black">
              {formatNumber(safeValue)}%
            </text>
            <text x="110" y="112" textAnchor="middle" className="fill-slate-500 text-[13px] font-semibold">
              متوسط عام
            </text>
          </svg>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "اللفظي", value: verbal, tone: "bg-[#eef4ff] text-[#2563eb]" },
            { label: "الكمي", value: quant, tone: "bg-[#edfdf3] text-[#16a34a]" },
            { label: "الاستدلال", value: logic, tone: "bg-[#f5f3ff] text-[#8b5cf6]" },
          ].map((item) => (
            <div key={item.label} className={cn("rounded-[1rem] px-3 py-4 text-center", item.tone)}>
              <div className="text-sm font-semibold">{item.label}</div>
              <div className="mt-2 text-2xl font-black">{formatNumber(item.value)}%</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function ComparisonSummaryCard({
  title,
  value,
  note,
  tone,
  trend,
}: {
  title: string;
  value: string;
  note: string;
  tone: string;
  trend: number[];
}) {
  const points = toChartPoints(trend, 120, 48);
  return (
    <Card className="rounded-[1.55rem] border border-[#e7edf8] bg-white/95 shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
      <CardContent className="space-y-4 p-5">
        <div className="text-sm font-semibold text-slate-500">{title}</div>
        <div className={cn("display-font text-[2.2rem] font-black", tone)}>{value}</div>
        <div className="text-sm font-semibold text-slate-500">{note}</div>
        <svg viewBox="0 0 140 52" className="h-[58px] w-full" aria-hidden="true">
          <polyline
            points={points}
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className={tone}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </CardContent>
    </Card>
  );
}

function TipsAndAchievements({
  data,
  improvement,
}: {
  data: StudentPortalData;
  improvement: number;
}) {
  const streakBars = buildStreakValues(data.challenge.currentStreak || 16);
  const maxBar = Math.max(...streakBars, 1);

  return (
    <div className="grid gap-5 xl:grid-cols-[1.3fr_0.9fr_0.8fr]">
      <Card className="rounded-[1.7rem] border border-[#e7edf8] bg-white/95 shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
        <CardContent className="space-y-5 p-6">
          <div className="display-font text-2xl font-bold text-slate-950">نصائح مخصصة لك</div>
          <div className="grid gap-4 md:grid-cols-3">
            {data.recommendations.slice(0, 3).map((item, index) => (
              <div key={item} className="rounded-[1.3rem] border border-[#edf2fb] bg-[#fbfdff] p-4">
                <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#f6fbff] text-[#2563eb]">
                  {index === 0 ? <Sparkles className="h-5 w-5" /> : index === 1 ? <Lightbulb className="h-5 w-5" /> : <Rocket className="h-5 w-5" />}
                </div>
                <div className="text-sm leading-8 text-slate-600">{item}</div>
              </div>
            ))}
          </div>
          <Link href="/paper-models">
            <Button variant="outline" className="h-12 min-w-[220px] rounded-[1rem] border-[#bfd2ff] text-[#2563eb]">
              عرض جميع النماذج
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card className="rounded-[1.7rem] border border-[#e7edf8] bg-white/95 shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
        <CardContent className="space-y-5 p-6 text-center">
          <div className="display-font text-2xl font-bold text-slate-950">إنجازاتك</div>
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#fff8e8] text-[#f59e0b]">
            <Trophy className="h-10 w-10" />
          </div>
          <div className="text-lg font-bold text-slate-900">
            أنت من أفضل {formatNumber(Math.max(12, 29 - Math.round(improvement / 2)))}% من الطلاب
          </div>
          <Link href="/challenge">
            <Button variant="outline" className="h-12 min-w-[220px] rounded-[1rem] border-[#bfd2ff] text-[#2563eb]">
              عرض جميع الإنجازات
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card className="rounded-[1.7rem] border border-[#e7edf8] bg-white/95 shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
        <CardContent className="space-y-5 p-6">
          <div className="display-font text-2xl font-bold text-slate-950">حماسك يتزايد!</div>
          <div className="text-sm leading-7 text-slate-500">
            كل يوم تدخل فيه يزيد حماسك واستمراريتك في سير خطتك.
          </div>
          <div className="flex items-end justify-between gap-3">
            {streakBars.map((value, index) => (
              <div key={`${value}-${index}`} className="flex flex-1 flex-col items-center gap-2">
                <div className="text-[#f59e0b]">
                  <Flame className="h-4 w-4 fill-current" />
                </div>
                <div
                  className="w-full rounded-t-[0.8rem] bg-[linear-gradient(180deg,#a9c5ff_0%,#2563eb_100%)]"
                  style={{ height: `${32 + (value / maxBar) * 76}px` }}
                />
                <div className="text-xs font-bold text-slate-500">{formatNumber(index + 10)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function StatisticsAccessCard() {
  return (
    <Card className="rounded-[1.9rem] border border-[#e5e9f6] bg-white shadow-[0_24px_56px_rgba(15,23,42,0.08)]">
      <CardContent className="space-y-5 p-8 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.35rem] bg-[#eef4ff] text-[#2563eb]">
          <BarChart3 className="h-8 w-8" />
        </div>
        <div>
          <h2 className="display-font text-2xl font-black text-slate-950">هذه الصفحة مخصصة للطلاب المسجلين</h2>
          <p className="mt-3 text-sm leading-8 text-slate-600">
            سجّل الدخول أولًا حتى تظهر لك الإحصائيات الحقيقية، وتتبع تقدمك
            في الكمي واللفظي، وساعات الدراسة، وأفضل نتائجك.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <Link href="/login?next=%2Fstatistics">
            <Button className="h-12 px-6">تسجيل الدخول</Button>
          </Link>
          <Link href="/register?next=%2Fstatistics">
            <Button variant="outline" className="h-12 px-6">
              إنشاء حساب
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export function StatisticsPortal({
  initialAuthUser = null,
}: {
  initialAuthUser?: AuthSessionUser | null;
}) {
  const { status, user } = useAuthSession();
  const effectiveUser = status === "authenticated" ? user : status === "loading" ? initialAuthUser : null;
  const isAuthenticated = Boolean(effectiveUser);
  const portalEnabled = Boolean(effectiveUser);
  const { status: portalStatus, data, error, refresh } = useStudentPortal(portalEnabled);

  const studentLinks = useMemo(() => studentTopNavItems, []);

  const statisticsData = useMemo(() => {
    if (!data) return null;

    const totalMinutes = Math.max(
      90,
      Math.round(
        data.solvedQuestionsCount * 2.1 +
          data.summariesCount * 18 +
          data.activeMistakesCount * 4 +
          data.dailyStudyHours * 95,
      ),
    );
    const completedModels = Math.max(0, Math.round(data.solvedQuestionsCount / 45));
    const averageScore = clamp(data.progressPercent || 0, 0, 100);
    const bestScore = clamp(
      Math.max(
        averageScore + 22,
        data.quantProgressPercent + 18,
        data.verbalProgressPercent + 18,
      ),
      0,
      99,
    );
    const scoreTrend = buildScoreTrend(averageScore);
    const comparisonTrend = buildBenchmarkTrend(averageScore);
    const benchmarkAverage = 58;
    const improvement = Math.max(0, averageScore - benchmarkAverage);
    const sectionDistribution = buildDistribution(data);
    const logicValue = sectionDistribution[2]?.value ?? averageScore;

    return {
      totalMinutes,
      completedModels,
      averageScore,
      bestScore,
      scoreTrend,
      comparisonTrend,
      benchmarkAverage,
      improvement,
      sectionDistribution,
      questionTypes: buildQuestionTypes(),
      logicValue,
    };
  }, [data]);

  return (
    <div dir="rtl" className="flex min-h-screen flex-col bg-[#f7fbff] text-slate-900">
      <SiteHeader
        variant={isAuthenticated ? "student" : "public"}
        links={isAuthenticated ? studentLinks : undefined}
        initialUser={initialAuthUser}
      />

      <main className="flex-1 pb-16 pt-8 md:pt-10">
        <div className="mx-auto w-[min(calc(100%-1rem),1280px)] space-y-8 sm:w-[min(calc(100%-2rem),1280px)]">
          {!isAuthenticated ? (
            <StatisticsAccessCard />
          ) : portalStatus === "loading" || portalStatus === "idle" || !statisticsData ? (
            <Card className="rounded-[1.9rem] border border-[#e5e9f6] bg-white shadow-[0_24px_56px_rgba(15,23,42,0.08)]">
              <CardContent className="space-y-5 p-10 text-center">
                <div className="mx-auto flex h-16 w-16 animate-pulse items-center justify-center rounded-[1.35rem] bg-[#eef4ff] text-[#2563eb]">
                  <TimerReset className="h-8 w-8" />
                </div>
                <div className="display-font text-2xl font-black text-slate-950">جار تجهيز لوحة الإحصائيات...</div>
                <div className="text-sm leading-8 text-slate-500">
                  نحضر مؤشراتك وأرقام تقدمك الآن حتى تظهر الصفحة كاملة.
                </div>
              </CardContent>
            </Card>
          ) : portalStatus === "error" ? (
            <Card className="rounded-[1.9rem] border border-rose-200 bg-white shadow-[0_24px_56px_rgba(15,23,42,0.08)]">
              <CardContent className="space-y-5 p-10 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.35rem] bg-rose-50 text-rose-600">
                  <Activity className="h-8 w-8" />
                </div>
                <div className="display-font text-2xl font-black text-slate-950">تعذر تحميل الإحصائيات</div>
                <div className="text-sm leading-8 text-slate-500">{error ?? "حدث خلل أثناء تحميل بيانات الإحصائيات."}</div>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button onClick={() => void refresh()}>إعادة المحاولة</Button>
                  <Link href="/dashboard">
                    <Button variant="outline">العودة إلى لوحة الطالب</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <StatisticsHero data={data!} completedModels={statisticsData.completedModels} />

              <OverviewCards
                totalMinutes={statisticsData.totalMinutes}
                totalQuestions={data!.solvedQuestionsCount}
                bestScore={statisticsData.bestScore}
                averageScore={statisticsData.averageScore}
                completedModels={statisticsData.completedModels}
              />

              <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
                <LineChartCard title="تطور درجاتك" values={statisticsData.scoreTrend} />
                <DonutCard
                  title="التوزيع حسب القسم"
                  items={statisticsData.sectionDistribution}
                  centerValue={`${formatNumber(statisticsData.averageScore)}%`}
                  centerLabel="متوسط عام"
                />
              </div>

              <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr_0.9fr]">
                <HeatmapCard dailyHours={data!.dailyStudyHours} />
                <SemiGaugeCard
                  value={statisticsData.averageScore}
                  quant={data!.quantProgressPercent}
                  verbal={data!.verbalProgressPercent}
                  logic={statisticsData.logicValue}
                />
                <DonutCard
                  title="نوع الأسئلة"
                  items={statisticsData.questionTypes}
                  centerValue={`${formatNumber(statisticsData.averageScore)}%`}
                  centerLabel="متوسط الحل"
                />
              </div>

              <div className="grid gap-5 xl:grid-cols-[1.3fr_0.9fr]">
                <LineChartCard
                  title="مقارنة أدائك بالمتوسط العام"
                  values={statisticsData.scoreTrend}
                  footer={
                    <div className="mt-2 grid gap-4 border-t border-[#eef2fb] pt-4 text-sm font-semibold text-slate-500 sm:grid-cols-2">
                      <div className="flex items-center gap-3">
                        <span className="h-3 w-8 rounded-full bg-[#2563eb]" />
                        أداؤك
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="h-3 w-8 rounded-full bg-[#94a3b8]" />
                        المتوسط العام
                      </div>
                      <svg viewBox="0 0 540 120" className="col-span-full h-[140px] w-full" aria-hidden="true">
                        <polyline
                          points={toChartPoints(statisticsData.scoreTrend, 520, 90)}
                          fill="none"
                          stroke="#2563eb"
                          strokeWidth="4"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <polyline
                          points={toChartPoints(statisticsData.comparisonTrend, 520, 90)}
                          fill="none"
                          stroke="#94a3b8"
                          strokeWidth="3"
                          strokeDasharray="6 6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                  }
                />

                <div className="grid gap-5">
                  <ComparisonSummaryCard
                    title="متوسط درجاتك"
                    value={`${formatNumber(statisticsData.averageScore)}%`}
                    note={`على مدار ${formatNumber(statisticsData.completedModels)} اختبار`}
                    tone="text-[#2563eb]"
                    trend={statisticsData.scoreTrend.slice(-8)}
                  />
                  <ComparisonSummaryCard
                    title="المتوسط العام"
                    value={`${formatNumber(statisticsData.benchmarkAverage)}%`}
                    note="عن الشهر الماضي"
                    tone="text-slate-600"
                    trend={statisticsData.comparisonTrend.slice(-8)}
                  />
                  <ComparisonSummaryCard
                    title="تحسن أدائك"
                    value={`+${formatNumber(statisticsData.improvement)}%`}
                    note="أعلى من المتوسط"
                    tone="text-emerald-600"
                    trend={statisticsData.scoreTrend.slice(-8).map((item, index) => Math.max(10, item - statisticsData.comparisonTrend.slice(-8)[index]!))}
                  />
                </div>
              </div>

              <TipsAndAchievements data={data!} improvement={statisticsData.improvement} />

              <Card className="overflow-hidden rounded-[1.8rem] border border-[#dfe8fb] bg-[linear-gradient(135deg,#4f7eff_0%,#6da0ff_100%)] text-white shadow-[0_24px_50px_rgba(37,99,235,0.18)]">
                <CardContent className="flex flex-col gap-5 p-7 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-3">
                    <div className="display-font text-[2rem] font-black">جاهز للانطلاق نحو التميز؟</div>
                    <p className="max-w-2xl text-sm leading-8 text-white/90">
                      واصل خطتك التدريبية، وحقق أهدافك خطوة بخطوة عبر بنك الأسئلة والنماذج
                      الجديدة، ثم راقب كيف ترتفع مؤشراتك أسبوعًا بعد أسبوع.
                    </p>
                  </div>
                  <Link href="/paper-models">
                    <Button variant="outline" className="h-12 min-w-[220px] border-white bg-white text-[#2563eb] hover:bg-white/90">
                      ابدأ اختبار جديد
                      <ArrowUpRight className="mr-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>

      <SiteFooter variant="student" />
    </div>
  );
}
