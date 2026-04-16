import Link from "next/link";

import { Reveal } from "@/components/reveal";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  dashboardBars,
  dashboardMetrics,
  dashboardSummary,
  studentFeed,
  studentRecommendations,
  weeklyPlan,
} from "@/data/miyaar";
import { getDatabaseHealth } from "@/lib/db";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/question-bank", label: "بنك الأسئلة" },
  { href: "/dashboard", label: "لوحة الطالب" },
  { href: "/results", label: "النتائج" },
];

export default async function DashboardPage() {
  const databaseHealth = await getDatabaseHealth();

  return (
    <div className="min-h-screen">
      <SiteHeader links={navLinks} ctaHref="/exam" ctaLabel="ابدأ جلسة اليوم" />
      <main className="section-shell pt-10 md:pt-14">
        <div className="mx-auto grid w-[min(calc(100%-2rem),1180px)] gap-8 lg:grid-cols-[1.08fr,0.92fr]">
          <Reveal>
            <div className="surface-card p-7">
              <Badge>Dashboard الطالب</Badge>
              <h1 className="page-heading mt-5">مسارك اليومي واضح، وتقدمك دائمًا تحت عينك</h1>
              <p className="section-copy max-w-2xl">
                هذه اللوحة تجمع أهم ما يحتاجه الطالب في مكان واحد: التقدم، الجلسات القادمة، المراجعة، والآن أيضًا
                حالة الاتصال بقاعدة البيانات.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/exam">
                  <Button>ابدأ جلسة اليوم</Button>
                </Link>
                <Link href="/results">
                  <Button variant="outline">راجع آخر نتيجة</Button>
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="surface-dark p-7">
              <p className="text-sm text-white/70">Neon Status</p>
              <h2 className="display-font mt-3 text-3xl font-bold">حالة ربط قاعدة البيانات</h2>
              <div className="mt-6 space-y-3">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5">
                  <div className="display-font text-2xl font-bold">
                    {databaseHealth.connected
                      ? "متصل"
                      : databaseHealth.configured
                        ? "بحاجة تصحيح"
                        : "غير مفعّل"}
                  </div>
                  <div className="mt-2 text-sm leading-7 text-white/78">{databaseHealth.message}</div>
                </div>

                {databaseHealth.connected ? (
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                      <div className="display-font text-lg font-bold">{databaseHealth.database}</div>
                      <div className="mt-1 text-sm text-white/70">اسم القاعدة</div>
                    </div>
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                      <div className="display-font text-lg font-bold">{databaseHealth.user}</div>
                      <div className="mt-1 text-sm text-white/70">المستخدم</div>
                    </div>
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                      <div className="display-font text-lg font-bold break-all">{databaseHealth.host}</div>
                      <div className="mt-1 text-sm text-white/70">المضيف</div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4 text-sm leading-7 text-white/78">
                    أضف رابط الاتصال داخل <code className="rounded bg-white/10 px-2 py-1">.env.local</code> ثم افتح
                    <code className="mr-2 rounded bg-white/10 px-2 py-1">/api/database-health</code>
                    للتأكد من نجاح الربط.
                  </div>
                )}
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mx-auto mt-10 w-[min(calc(100%-2rem),1180px)]">
          <Reveal>
            <Card>
              <CardContent className="p-7">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">مركز التحكم</p>
                    <h3 className="display-font text-2xl font-bold text-slate-950">
                      كل المؤشرات المهمة في واجهة واحدة
                    </h3>
                  </div>
                  <Badge className="bg-amber-50 text-amber-700">Student View</Badge>
                </div>

                <div className="mt-6 grid gap-5 lg:grid-cols-[1.3fr,0.7fr]">
                  <div className="space-y-5">
                    {dashboardMetrics.map((item) => (
                      <div key={item.title} className="rounded-[1.7rem] border border-slate-200/80 bg-white/80 p-5">
                        <p className="text-sm text-slate-500">{item.title}</p>
                        <div className="display-font mt-2 text-3xl font-bold text-slate-950">{item.value}</div>
                        <p className="mt-2 text-sm leading-7 text-slate-600">{item.note}</p>
                      </div>
                    ))}
                    <div className="rounded-[1.7rem] border border-slate-200/80 bg-white/80 p-5">
                      <p className="text-sm text-slate-500">نقاط القوة والضعف</p>
                      <div className="mt-4 space-y-4">
                        {dashboardBars.map((item) => (
                          <div key={item.label} className="space-y-2">
                            <div className="text-sm text-slate-600">{item.label}</div>
                            <Progress value={item.value} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {dashboardSummary.map((item) => (
                      <div key={item.label} className="rounded-[1.7rem] border border-slate-200/80 bg-white/80 p-5">
                        <div className="display-font text-3xl font-bold text-slate-950">{item.value}</div>
                        <p className="mt-2 text-sm text-slate-600">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </Reveal>
        </div>

        <div className="mx-auto mt-10 grid w-[min(calc(100%-2rem),1180px)] gap-8 lg:grid-cols-[1fr,0.95fr]">
          <Reveal>
            <Card>
              <CardContent className="p-7">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">الخطة الأسبوعية</p>
                    <h3 className="display-font text-2xl font-bold text-slate-950">مسار هذا الأسبوع</h3>
                  </div>
                  <Badge>Adaptive Plan</Badge>
                </div>
                <div className="mt-6 space-y-4">
                  {weeklyPlan.map((item) => (
                    <div key={item.day} className="rounded-[1.5rem] border border-slate-200/80 bg-white/75 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-sm text-slate-500">{item.day}</div>
                          <div className="display-font mt-1 text-lg font-bold text-slate-950">{item.task}</div>
                        </div>
                        <div className="display-font text-lg font-bold text-slate-950">{item.progress}%</div>
                      </div>
                      <Progress value={item.progress} className="mt-4" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Reveal>

          <div className="space-y-5">
            <Reveal delay={0.04}>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm font-semibold text-slate-500">نشاط حديث</p>
                  <h3 className="display-font mt-3 text-2xl font-bold text-slate-950">ما الذي أنجزته مؤخرًا</h3>
                  <div className="mt-5 space-y-3">
                    {studentFeed.map((item) => (
                      <div
                        key={item}
                        className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50/80 p-4 text-sm leading-7 text-slate-600"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Reveal>

            <Reveal delay={0.08}>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm font-semibold text-slate-500">توصيات اليوم</p>
                  <h3 className="display-font mt-3 text-2xl font-bold text-slate-950">اقتراحات مبنية على الأداء</h3>
                  <div className="mt-5 space-y-3">
                    {studentRecommendations.map((item) => (
                      <div
                        key={item}
                        className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50/80 p-4 text-sm leading-7 text-slate-600"
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </div>
      </main>
    </div>
  );
}
