"use client";

import Link from "next/link";
import { Award, BookCheck, RotateCcw, Sparkles } from "lucide-react";

import { formatLastActivity } from "@/components/student-portal-shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { StudentPortalData } from "@/lib/student-portal";

type StudentAchievementsPanelProps = {
  data: Pick<
    StudentPortalData,
    "xp" | "solvedQuestionsCount" | "solvedSections" | "recentSolvedQuestions"
  >;
  sectionId?: string;
  compact?: boolean;
};

function truncateText(value: string, maxLength = 108) {
  const normalized = value.replace(/\s+/g, " ").trim();
  if (normalized.length <= maxLength) {
    return normalized;
  }

  return `${normalized.slice(0, maxLength).trim()}...`;
}

function getRetryLabel(href: string | null) {
  if (!href) return "إعادة التدريب";
  return href.includes("/verbal/reading") ? "إعادة القطعة" : "إعادة الأسئلة";
}

export function StudentAchievementsPanel({
  data,
  sectionId,
  compact = false,
}: StudentAchievementsPanelProps) {
  const visibleSections = compact ? data.solvedSections.slice(0, 4) : data.solvedSections.slice(0, 8);
  const visibleQuestions = compact
    ? data.recentSolvedQuestions.slice(0, 4)
    : data.recentSolvedQuestions.slice(0, 6);

  return (
    <div className="space-y-6" id={sectionId}>
      <Card className="rounded-[2rem] border-white/80 bg-white/96 shadow-soft">
        <CardContent className="space-y-5 p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Badge className="bg-[#eef4ff] text-[#123B7A]">XP وملف الإنجاز</Badge>
              <h3 className="mt-4 display-font text-2xl font-bold text-slate-950">
                تقدّمك الحقيقي داخل بنك الأسئلة
              </h3>
              <p className="mt-2 max-w-3xl text-sm leading-8 text-slate-600">
                كل سؤال صحيح يمنحك {data.xp.perQuestion} XP، وعند الوصول إلى {data.xp.target.toLocaleString("en-US")} XP
                يظهر لك مستوى الجاهزية والاحتراف داخل ملف الطالب.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-[#E8D8B3] bg-[#fffaf0] px-5 py-4 text-right">
              <div className="text-xs font-semibold text-slate-500">المستوى الحالي</div>
              <div className="mt-2 display-font text-2xl font-bold text-slate-950">{data.xp.levelLabel}</div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Award className="h-4 w-4" />
                إجمالي XP
              </div>
              <div className="mt-3 display-font text-3xl font-bold text-slate-950">
                {data.xp.total.toLocaleString("en-US")}
              </div>
            </div>
            <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <BookCheck className="h-4 w-4" />
                الأسئلة المحلولة
              </div>
              <div className="mt-3 display-font text-3xl font-bold text-slate-950">
                {data.solvedQuestionsCount.toLocaleString("en-US")}
              </div>
            </div>
            <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                <Sparkles className="h-4 w-4" />
                المتبقي للهدف
              </div>
              <div className="mt-3 display-font text-3xl font-bold text-slate-950">
                {data.xp.remainingToTarget.toLocaleString("en-US")}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
              <span>التقدم نحو 10,000 XP</span>
              <span>{data.xp.progressPercent}%</span>
            </div>
            <Progress value={data.xp.progressPercent} />
          </div>

          <div className="rounded-[1.4rem] border border-[#E8D8B3] bg-[#fffaf0] px-4 py-4 text-sm leading-8 text-slate-700">
            {data.xp.statusMessage}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.05fr,0.95fr]">
        <Card className="rounded-[2rem] border-white/80 bg-white/96 shadow-soft">
          <CardContent className="space-y-5 p-8">
            <div>
              <p className="section-eyebrow text-[#123B7A]">الأقسام المحلولة</p>
              <h3 className="display-font text-2xl font-bold text-slate-950">
                الأقسام التي أنهيتها ويمكنك إعادتها
              </h3>
            </div>

            {visibleSections.length ? (
              <div className="space-y-3">
                {visibleSections.map((section) => (
                  <div
                    key={`${section.section}-${section.categoryId ?? section.categoryTitle}`}
                    className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="display-font text-lg font-bold text-slate-950">
                          {section.categoryTitle}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                          <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                            {section.solvedCount} سؤال محلول
                          </span>
                          <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                            +{section.xpEarned} XP
                          </span>
                          <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                            {section.questionTypeLabel}
                          </span>
                        </div>
                      </div>

                      {section.retryHref ? (
                        <Link href={section.retryHref}>
                          <Button variant="outline" size="sm" className="gap-2">
                            <RotateCcw className="h-4 w-4" />
                            {getRetryLabel(section.retryHref)}
                          </Button>
                        </Link>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/70 p-6 text-sm leading-8 text-slate-600">
                عندما يحفظ النظام أول أسئلة صحيحة لك، ستظهر هنا الأقسام التي أنهيتها مع زر إعادة الحل لكل قسم.
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-white/80 bg-white/96 shadow-soft">
          <CardContent className="space-y-5 p-8">
            <div>
              <p className="section-eyebrow text-[#123B7A]">آخر الأسئلة المحلولة</p>
              <h3 className="display-font text-2xl font-bold text-slate-950">
                آخر ما تم حفظه داخل ملف الطالب
              </h3>
            </div>

            {visibleQuestions.length ? (
              <div className="space-y-3">
                {visibleQuestions.map((question) => (
                  <div
                    key={`${question.id}-${question.questionKey}`}
                    className="rounded-[1.5rem] border border-slate-200 bg-slate-50/80 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-[#123B7A]">
                          {question.categoryTitle ?? question.questionTypeLabel}
                        </div>
                        <div className="mt-2 text-sm font-bold leading-7 text-slate-950">
                          {truncateText(question.questionText)}
                        </div>
                        <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                          <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                            +{question.xpEarned} XP
                          </span>
                          <span className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">
                            {formatLastActivity(question.solvedAt)}
                          </span>
                        </div>
                      </div>

                      {question.questionHref ? (
                        <Link href={question.questionHref}>
                          <Button variant="outline" size="sm">
                            افتح السؤال
                          </Button>
                        </Link>
                      ) : null}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/70 p-6 text-sm leading-8 text-slate-600">
                لا توجد أسئلة محلولة محفوظة بعد. ابدأ الحل من بنك الأسئلة، وسيظهر سجل الإجابات هنا تلقائيًا.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
