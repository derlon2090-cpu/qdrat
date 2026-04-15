import Link from "next/link";

import { Reveal } from "@/components/reveal";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { resultsBreakdown, resultsMetrics, reviewCards } from "@/data/miyaar";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/exam", label: "الاختبار" },
  { href: "/results", label: "النتائج" },
  { href: "/dashboard", label: "لوحة الطالب" },
];

export default function ResultsPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader links={navLinks} ctaHref="/dashboard" ctaLabel="لوحة الطالب" />
      <main className="section-shell pt-10 md:pt-14">
        <div className="mx-auto w-[min(calc(100%-2rem),1180px)]">
          <Reveal>
            <div className="surface-dark p-7">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-sm text-white/70">نتيجة الاختبار المحاكي</p>
                  <h1 className="display-font mt-3 text-4xl font-bold text-white md:text-5xl">
                    أداء واضح يساعدك على القرار التالي
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-8 text-white/70">
                    ليس الهدف رقمًا فقط، بل فهم أين تتحسن وأين تحتاج مراجعة أكثر.
                  </p>
                </div>
                <div className="mx-auto grid h-36 w-36 place-items-center rounded-full bg-[radial-gradient(circle_closest-side,#182647_73%,transparent_74%_100%),conic-gradient(#f4d290_0_84%,rgba(255,255,255,0.12)_84%_100%)] md:mx-0">
                  <div className="display-font text-4xl font-bold text-white">84</div>
                </div>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {resultsMetrics.map((item) => (
                  <div
                    key={item.label}
                    className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
                  >
                    <div className="display-font text-2xl font-bold text-white">{item.value}</div>
                    <div className="mt-1 text-sm text-white/70">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mx-auto mt-10 grid w-[min(calc(100%-2rem),1180px)] gap-8 lg:grid-cols-[1.12fr,0.88fr]">
          <Reveal>
            <Card>
              <CardContent className="p-7">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">تفصيل المهارات</p>
                    <h3 className="display-font text-2xl font-bold text-slate-950">
                      أين كان الأداء أقوى؟
                    </h3>
                  </div>
                  <Link href="/dashboard">
                    <Button variant="outline">نقل إلى لوحة الطالب</Button>
                  </Link>
                </div>
                <div className="mt-6 space-y-5">
                  {resultsBreakdown.map((item) => (
                    <div key={item.label} className="space-y-2">
                      <div className="text-sm text-slate-600">{item.label}</div>
                      <Progress value={item.value} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal delay={0.05}>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-semibold text-slate-500">اقتراحات مباشرة</p>
                <h3 className="display-font mt-3 text-2xl font-bold text-slate-950">
                  ماذا تفعل بعد هذا الاختبار؟
                </h3>
                <ul className="mt-5 space-y-3 text-sm leading-8 text-slate-600">
                  <li>أعد مراجعة القطع التي استغرقت وقتًا أطول من المعتاد.</li>
                  <li>استفد من سرعة التناظر وخصص وقتًا أكبر لإكمال الجمل.</li>
                  <li>ادخل الاختبار التالي بخطة مركزة بدل حل عشوائي.</li>
                </ul>
              </CardContent>
            </Card>
          </Reveal>
        </div>

        <div className="mx-auto mt-10 w-[min(calc(100%-2rem),1180px)]">
          <Reveal>
            <Card>
              <CardContent className="p-7">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">مراجعة الأخطاء</p>
                    <h3 className="display-font text-2xl font-bold text-slate-950">
                      بطاقات مراجعة أنيقة وعملية
                    </h3>
                  </div>
                  <Link href="/banks">
                    <Button>العودة إلى البنوك</Button>
                  </Link>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {reviewCards.map((item) => (
                    <div
                      key={item.title}
                      className="rounded-[1.7rem] border border-slate-200/80 bg-slate-50/80 p-5"
                    >
                      <Badge className="bg-violet-50 text-violet-700">Review</Badge>
                      <h4 className="display-font mt-4 text-xl font-bold text-slate-950">
                        {item.title}
                      </h4>
                      <p className="mt-2 text-sm leading-8 text-slate-600">{item.text}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </main>
    </div>
  );
}
