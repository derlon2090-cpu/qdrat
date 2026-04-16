import Link from "next/link";

import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/diagnostic", label: "التشخيص" },
  { href: "/question-banks", label: "بنوك الأسئلة" },
  { href: "/study-plan", label: "الخطة اليومية" },
  { href: "/pricing", label: "الأسعار" },
];

const pricingPlans = [
  {
    title: "الخطة الأساسية",
    price: "79 ر.س",
    text: "لمن يريد البدء ببنوك الأسئلة والتشخيص والمراجعة الأساسية.",
  },
  {
    title: "معيار بلس",
    price: "149 ر.س",
    text: "لمن يريد الخطة اليومية ولوحة الطالب والاختبارات المحاكية بشكل أوسع.",
  },
  {
    title: "الخطة المكثفة",
    price: "249 ر.س",
    text: "لمن يقترب من الاختبار ويحتاج تدريبًا أعلى ومراجعة أكثر تركيزًا.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader links={navLinks} ctaHref="/exam" ctaLabel="ابدأ الآن" />
      <main className="section-shell pt-10 md:pt-14">
        <div className="mx-auto w-[min(calc(100%-2rem),1180px)]">
          <Reveal>
            <div className="text-center">
              <p className="section-eyebrow text-[#123B7A]">الأسعار</p>
              <h1 className="section-title mx-auto">خطط واضحة بدون تعقيد</h1>
              <p className="section-copy mx-auto">
                صفحة مستقلة للأسعار حتى لا تتحول الصفحة الرئيسية إلى مساحة شرح واشتراك في نفس الوقت.
              </p>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {pricingPlans.map((plan, index) => (
              <Reveal key={plan.title} delay={index * 0.04}>
                <Card className="h-full rounded-[2rem] border-white/80 bg-white/95 shadow-soft">
                  <CardContent className="p-8">
                    <h2 className="display-font card-title font-bold text-slate-950">{plan.title}</h2>
                    <div className="display-font mb-5 text-4xl font-bold text-[#123B7A]">{plan.price}</div>
                    <p className="card-text text-slate-600">{plan.text}</p>
                    <div className="mt-8">
                      <Link href="/contact">
                        <Button className="w-full">استفسر عن الخطة</Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
