import { ShieldCheck } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const guaranteePoints = [
  "توضيح الشروط بشكل مباشر وبدون تعقيد.",
  "ربط الضمان بخطة واضحة واستخدام فعلي للمنصة.",
  "رفع الثقة عند الطالب قبل الاشتراك أو البدء.",
];

export default function GoldenGuaranteePage() {
  return (
    <PageShell
      eyebrow="الضمان الذهبي"
      title="صفحة ثقة مستقلة تشرح الضمان بشكل أهدأ وأوضح"
      description="بدل ضغط هذه الرسالة داخل الواجهة الرئيسية، هذه الصفحة تشرح الضمان الذهبي، كيف يعمل، ولماذا نقدمه بثقة."
      icon={ShieldCheck}
      iconWrap="bg-[#fff8e5]"
      iconColor="text-[#b7791f]"
      accentClass="shadow-[0_20px_45px_rgba(183,121,31,0.16)]"
      ctaLabel="شاهد الأسعار"
      ctaHref="/pricing"
    >
      <div className="grid gap-5 lg:grid-cols-[1.1fr,0.9fr]">
        <Reveal>
          <Card className="rounded-[2rem] border-white/80 bg-white/95 shadow-soft">
            <CardContent className="p-8">
              <p className="section-eyebrow text-[#b7791f]">لماذا نقدمه</p>
              <h2 className="section-title max-w-none">طبقة ثقة إضافية قبل اتخاذ القرار</h2>
              <div className="space-y-4">
                {guaranteePoints.map((item) => (
                  <div key={item} className="rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-5 text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Reveal>

        <Reveal delay={0.04}>
          <Card className="surface-dark rounded-[2rem] border-0">
            <CardContent className="p-8">
              <p className="text-sm text-white/70">CTA واضح</p>
              <h2 className="display-font mt-3 text-3xl font-bold">إذا كانت الثقة هي سؤالك الأول، فهذه الصفحة لك</h2>
              <p className="mt-4 text-white/78">
                اقرأ الشروط، افهم آلية الضمان، ثم انتقل إلى الخطة المناسبة وأنت أوضح قرارًا من البداية.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button variant="secondary">ابدأ الآن</Button>
                <Button variant="outline" className="border-white/20 bg-white/10 text-white hover:bg-white/15">
                  تواصل معنا
                </Button>
              </div>
            </CardContent>
          </Card>
        </Reveal>
      </div>
    </PageShell>
  );
}
