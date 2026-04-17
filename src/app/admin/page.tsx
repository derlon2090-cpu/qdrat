import { AlertTriangle, CheckCircle2, Database, FileSearch, Layers3 } from "lucide-react";

import { Reveal } from "@/components/reveal";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getLatestIngestionReport } from "@/lib/ingestion-report";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/question-bank", label: "بنك الأسئلة" },
  { href: "/dashboard", label: "لوحة الطالب" },
  { href: "/admin", label: "الإدارة" },
];

export default async function AdminPage() {
  const report = await getLatestIngestionReport();

  const kpis = report
    ? [
        { label: "القطع المستخرجة", value: String(report.summary.totalPassages), icon: Layers3 },
        { label: "الأسئلة المكتشفة", value: String(report.summary.totalQuestions), icon: Database },
        { label: "عالية الثقة", value: String(report.summary.highConfidenceQuestions), icon: CheckCircle2 },
        { label: "قيد المراجعة", value: String(report.summary.reviewQueueCount), icon: AlertTriangle },
      ]
    : [];

  return (
    <div className="min-h-screen">
      <SiteHeader links={navLinks} ctaHref="/question-bank" ctaLabel="افتح بنك الأسئلة" />

      <main className="section-shell pt-10 md:pt-14">
        <div className="mx-auto w-[min(calc(100%-2rem),1180px)] space-y-10">
          <Reveal>
            <div className="surface-dark p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-3xl">
                  <p className="text-sm text-white/70">Extraction Console</p>
                  <h1 className="display-font mt-3 text-4xl font-bold md:text-5xl">
                    لوحة مراجعة استخراج بنك القطع اللفظية
                  </h1>
                  <p className="mt-4 max-w-2xl text-base leading-8 text-white/78">
                    هذه اللوحة تعرض آخر تشغيل لـ pipeline الاستخراج: المصدر، عدد القطع، عدد الأسئلة،
                    والعناصر التي تحتاج مراجعة قبل النشر داخل المنصة.
                  </p>
                </div>

                {report ? (
                  <div className="rounded-[1.5rem] border border-white/12 bg-white/8 px-5 py-4 text-sm text-white/80">
                    <div>المصدر: {report.source.title}</div>
                    <div className="mt-1">آخر تحديث: {new Date(report.generatedAt).toLocaleString("ar-SA")}</div>
                  </div>
                ) : (
                  <div className="rounded-[1.5rem] border border-amber-200/30 bg-amber-500/10 px-5 py-4 text-sm text-amber-100">
                    لا يوجد تقرير استخراج بعد. شغّل أوامر ingest ثم parse ثم validate.
                  </div>
                )}
              </div>
            </div>
          </Reveal>

          {report ? (
            <>
              <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                {kpis.map((item, index) => {
                  const Icon = item.icon;

                  return (
                    <Reveal key={item.label} delay={index * 0.04}>
                      <Card>
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 text-slate-500">
                            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#fff7e8] text-[#a86f00]">
                              <Icon className="h-5 w-5" />
                            </span>
                            <span className="text-sm">{item.label}</span>
                          </div>
                          <div className="display-font mt-5 text-3xl font-bold text-slate-950">{item.value}</div>
                        </CardContent>
                      </Card>
                    </Reveal>
                  );
                })}
              </div>

              <div className="grid gap-8 lg:grid-cols-[1.05fr,0.95fr]">
                <Reveal>
                  <Card>
                    <CardContent className="p-7">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-sm text-slate-500">Review Queue</p>
                          <h2 className="display-font mt-2 text-2xl font-bold text-slate-950">
                            الأسئلة والقطع التي تحتاج تدقيق
                          </h2>
                        </div>
                        <Badge className="bg-amber-50 text-amber-700">Needs Review</Badge>
                      </div>

                      <div className="mt-6 space-y-3">
                        {report.reviewItems.slice(0, 10).map((item, index) => (
                          <div
                            key={`${item.issueType}-${index}`}
                            className="rounded-[1.35rem] border border-slate-200/80 bg-slate-50/80 p-4"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="display-font text-base font-bold text-slate-950">
                                {item.issueType}
                              </div>
                              <span className="mini-pill bg-rose-50 text-rose-700">
                                ثقة {Math.round((item.confidence ?? 0) * 100)}%
                              </span>
                            </div>
                            <p className="mt-2 text-sm leading-7 text-slate-600">{item.issueDetails}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </Reveal>

                <div className="space-y-5">
                  <Reveal delay={0.04}>
                    <div className="surface-dark p-6">
                      <p className="text-sm text-white/70">Passage Preview</p>
                      <h2 className="display-font mt-3 text-2xl font-bold text-white">
                        أول القطع المستخرجة من الملف
                      </h2>
                      <div className="mt-5 space-y-3">
                        {report.passagesPreview.slice(0, 6).map((item) => (
                          <div
                            key={`${item.pieceNumber}-${item.pieceTitle}`}
                            className="rounded-[1.3rem] border border-white/10 bg-white/5 p-4"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-3">
                              <div className="display-font text-base font-bold text-white">
                                قطعة {item.pieceNumber ?? "—"}: {item.pieceTitle}
                              </div>
                              <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                                {item.questions} أسئلة
                              </span>
                            </div>
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/70">
                              <span>ثقة {Math.round((item.confidence ?? 0) * 100)}%</span>
                              <span>•</span>
                              <span>{item.needsReview ? "تحتاج مراجعة" : "جاهزة مبدئيًا"}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Reveal>

                  <Reveal delay={0.08}>
                    <Card>
                      <CardContent className="p-6">
                        <p className="text-sm text-slate-500">Workflow</p>
                        <h3 className="display-font mt-2 text-2xl font-bold text-slate-950">
                          مسار التشغيل الصحيح
                        </h3>
                        <div className="mt-5 grid gap-3">
                          {[
                            "npm run ingest",
                            "npm run parse",
                            "npm run validate",
                            "npm run publish",
                          ].map((step) => (
                            <div
                              key={step}
                              className="flex items-center gap-3 rounded-[1.15rem] border border-slate-200 bg-slate-50 px-4 py-3"
                            >
                              <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#123B7A]/10 text-[#123B7A]">
                                <FileSearch className="h-4 w-4" />
                              </span>
                              <code className="text-sm font-semibold text-slate-700">{step}</code>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </Reveal>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </main>
    </div>
  );
}
