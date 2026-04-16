import { Coins } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const pricingPlans = [
  {
    title: "الخطة الأساسية",
    price: "79 ر.س",
    text: "لمن يريد بداية مرتبة تشمل التشخيص، بنوك الأسئلة، والمراجعة الأساسية.",
  },
  {
    title: "معيار بلس",
    price: "149 ر.س",
    text: "يشمل الخطة اليومية، لوحة الطالب، والاختبارات المحاكية بشكل أوسع.",
  },
  {
    title: "الخطة المكثفة",
    price: "249 ر.س",
    text: "للطلاب القريبين من الاختبار ويحتاجون تدريبًا أعلى ومراجعة أكثر تركيزًا.",
  },
];

export default function PricingPage() {
  return (
    <PageShell
      eyebrow="الأسعار"
      title="خطط واضحة ومرتبة بدل صفحة مزدحمة بالخيارات"
      description="فصلنا الأسعار عن الصفحة الرئيسية حتى يبقى مسار التحويل أوضح: هنا فقط تقارن الخطط وتقرر ما يناسب مرحلتك."
      icon={Coins}
      iconWrap="bg-[#fff8e5]"
      iconColor="text-[#b7791f]"
      accentClass="shadow-[0_20px_45px_rgba(183,121,31,0.16)]"
      ctaLabel="استفسر عن الخطة"
      ctaHref="/contact"
    >
      <div className="grid gap-5 md:grid-cols-3">
        {pricingPlans.map((plan, index) => (
          <Reveal key={plan.title} delay={index * 0.04}>
            <Card className="h-full rounded-[2rem] border-white/80 bg-white/95 shadow-soft">
              <CardContent className="p-8">
                <h2 className="display-font card-title font-bold text-slate-950">{plan.title}</h2>
                <div className="display-font mb-5 text-4xl font-bold text-[#123B7A]">{plan.price}</div>
                <p className="card-text text-slate-600">{plan.text}</p>
                <div className="mt-8">
                  <Button className="w-full" variant={index === 1 ? "default" : "outline"}>
                    اختر هذه الخطة
                  </Button>
                </div>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </PageShell>
  );
}
