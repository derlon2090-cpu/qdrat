import Link from "next/link";

import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { planPoints, weeklyPlan } from "@/data/miyaar";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/diagnostic", label: "التشخيص" },
  { href: "/question-banks", label: "بنوك الأسئلة" },
  { href: "/study-plan", label: "الخطة اليومية" },
  { href: "/pricing", label: "الأسعار" },
];

export default function StudyPlanPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader links={navLinks} ctaHref="/exam" ctaLabel="ابدأ من التشخيص" />
      <main className="section-shell pt-10 md:pt-14">
        <div className="mx-auto w-[min(calc(100%-2rem),1180px)] space-y-10">
          <Reveal>
            <div className="surface-card p-8">
              <p className="section-eyebrow text-[#123B7A]">الخطة اليومية</p>
              <h1 className="page-heading">خطة تتغير مع مستواك بدل جدول ثابت للجميع</h1>
              <p className="section-copy">
                هذه الصفحة تشرح كيف تتولد الخطة، كيف تتبدل، وكيف تتحول الأخطاء والنتائج إلى جلسات تدريب واضحة.
              </p>
            </div>
          </Reveal>

          <div className="grid gap-5 md:grid-cols-3">
            {planPoints.map((item, index) => (
              <Reveal key={item.title} delay={index * 0.04}>
                <Card className="h-full rounded-[2rem] border-white/80 bg-white/95 shadow-soft">
                  <CardContent className="p-7">
                    <div className="display-font mb-5 text-sm font-bold tracking-[0.18em] text-[#123B7A]">
                      0{index + 1}
                    </div>
                    <h3 className="display-font card-title font-bold text-slate-950">{item.title}</h3>
                    <p className="card-text text-slate-600">{item.text}</p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>

          <Reveal>
            <Card className="rounded-[2.2rem] border-white/80 bg-white/95 shadow-soft">
              <CardContent className="p-8">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="section-eyebrow text-[#123B7A]">مثال بصري</p>
                    <h2 className="section-title max-w-none">كيف يبدو أسبوعك الأول؟</h2>
                  </div>
                  <Link href="/dashboard">
                    <Button variant="outline">عرض لوحة الطالب</Button>
                  </Link>
                </div>
                <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {weeklyPlan.map((item) => (
                    <div key={item.day} className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-5">
                      <div className="text-sm text-slate-500">{item.day}</div>
                      <div className="display-font mt-2 text-lg font-bold text-slate-950">{item.task}</div>
                      <div className="mt-3 text-sm text-slate-500">{item.progress}% مكتمل</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
