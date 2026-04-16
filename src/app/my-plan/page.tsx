import { NotebookPen } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { weeklyPlan } from "@/data/miyaar";

const planHighlights = [
  "جلسة اليوم تظهر أولًا بدل قائمة طويلة.",
  "الخطة تتغير مع النتيجة والسرعة والمراجعة.",
  "المحفوظ والخاطئ يدخلان مباشرة في الأولويات القادمة.",
];

export default function MyPlanPage() {
  return (
    <PageShell
      eyebrow="خطتي"
      title="خطة يومية تتغير مع مستواك بدل جدول ثابت للجميع"
      description="هذه الصفحة تلخص يومك وأسبوعك القادم: ما الذي تذاكره الآن، ما الذي يراجع لاحقًا، وكيف يتحرك التقدم معك."
      icon={NotebookPen}
      iconWrap="bg-[#edfdf3]"
      iconColor="text-[#2f855a]"
      accentClass="shadow-[0_20px_45px_rgba(47,133,90,0.16)]"
      ctaLabel="شاهد خطة اليوم"
      ctaHref="/dashboard"
    >
      <div className="grid gap-5 lg:grid-cols-[1fr,0.95fr]">
        <Reveal>
          <Card className="rounded-[2rem] border-white/80 bg-white/95 shadow-soft">
            <CardContent className="p-8">
              <p className="section-eyebrow text-[#2f855a]">خطة هذا الأسبوع</p>
              <h2 className="section-title max-w-none">مسار مرتب من 4 أيام</h2>
              <div className="space-y-4">
                {weeklyPlan.map((item) => (
                  <div key={item.day} className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <div className="text-sm text-slate-500">{item.day}</div>
                        <div className="display-font mt-1 text-lg font-bold text-slate-950">{item.task}</div>
                      </div>
                      <div className="display-font text-lg font-bold text-[#2f855a]">{item.progress}%</div>
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
            <Card className="surface-dark rounded-[2rem] border-0">
              <CardContent className="p-8">
                <p className="text-sm text-white/70">جلسة اليوم</p>
                <h2 className="display-font mt-3 text-3xl font-bold">20 كمي + 15 لفظي + مراجعة 8 أخطاء</h2>
                <div className="mt-6 space-y-3">
                  {planHighlights.map((item) => (
                    <div key={item} className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 text-white/85">
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal delay={0.08}>
            <Card className="rounded-[2rem] border-white/80 bg-white/95 shadow-soft">
              <CardContent className="p-8">
                <p className="section-eyebrow text-[#2f855a]">مراجعة سريعة</p>
                <h3 className="card-title font-bold text-slate-950">إذا كان وقتك قصيرًا اليوم</h3>
                <p className="card-text text-slate-600">
                  ابدأ بالكمي السريع أولًا، ثم انقل اللفظي إلى جلسة ثانية خفيفة. الخطة ستعيد ترتيب الأولويات تلقائيًا بعد الإنجاز.
                </p>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </div>
    </PageShell>
  );
}
