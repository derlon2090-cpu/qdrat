import { ClipboardList } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    title: "اختبار قصير وواضح",
    text: "أسئلة مختصرة تحدد نقطة البداية في الكمي واللفظي بدون إغراق.",
  },
  {
    title: "نتيجة أولية مباشرة",
    text: "تعرف أين تبدأ، وما المهارة التي تستحق الوقت أكثر في أول أسبوع.",
  },
  {
    title: "خطة أول أسبوع",
    text: "تتحول النتيجة مباشرة إلى جلسات مرتبة بدل التخمين والتشتت.",
  },
];

export default function DiagnosticPage() {
  return (
    <PageShell
      eyebrow="التشخيص"
      title="ابدأ من التشخيص إذا كنت تريد أقصر طريق واضح"
      description="صفحة البداية التي تقيس مستواك بسرعة، ثم تبني أولوياتك في الكمي واللفظي قبل الدخول إلى التدريب المكثف."
      icon={ClipboardList}
      iconWrap="bg-[#eff6ff]"
      iconColor="text-[#2563eb]"
      accentClass="shadow-[0_20px_45px_rgba(37,99,235,0.16)]"
      ctaLabel="ابدأ الاختبار"
      ctaHref="/exam"
    >
      <div className="grid gap-5 lg:grid-cols-[1.1fr,0.9fr]">
        <Reveal>
          <Card className="rounded-[2rem] border-white/80 bg-white/95 shadow-soft">
            <CardContent className="p-8">
              <p className="section-eyebrow text-[#2563eb]">كيف يعمل</p>
              <h2 className="section-title max-w-none">3 خطوات فقط قبل أن تبدأ الخطة</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {steps.map((item, index) => (
                  <div key={item.title} className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-5">
                    <div className="display-font text-sm font-bold tracking-[0.18em] text-[#2563eb]">
                      0{index + 1}
                    </div>
                    <h3 className="card-title mt-4 font-bold text-slate-950">{item.title}</h3>
                    <p className="card-text text-slate-600">{item.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={0.04}>
          <Card className="surface-dark rounded-[2rem] border-0">
            <CardContent className="p-8">
              <p className="text-sm text-white/70">مثال على الناتج</p>
              <h2 className="display-font mt-3 text-3xl font-bold">نتيجة أولية تحدد القرار التالي</h2>
              <div className="mt-6 space-y-4">
                {[
                  "الكمي: أساسيات النسب ثم السرعة.",
                  "اللفظي: استيعاب ثم تناظر ثم مراجعة أخطاء.",
                  "الأولوية هذا الأسبوع: 4 جلسات قصيرة بدل خطة طويلة مشتتة.",
                ].map((item) => (
                  <div key={item} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 text-white/90">
                    {item}
                  </div>
                ))}
              </div>
              <div className="mt-6">
                <Button variant="secondary">شاهد شكل الخطة بعد التشخيص</Button>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </PageShell>
  );
}
