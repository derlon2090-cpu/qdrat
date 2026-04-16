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

const diagnosticPoints = [
  "يعطيك نقطة بداية واضحة بدل التخمين.",
  "يرتب أولويات الكمي واللفظي حسب مستواك.",
  "يبني أول أسبوع من الخطة مباشرة بعد النتيجة.",
];

export default function DiagnosticPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader links={navLinks} ctaHref="/exam" ctaLabel="ابدأ التشخيص" />
      <main className="section-shell pt-10 md:pt-14">
        <div className="mx-auto grid w-[min(calc(100%-2rem),1180px)] gap-8 lg:grid-cols-[1fr,0.9fr]">
          <Reveal>
            <div className="surface-card p-8">
              <p className="section-eyebrow text-[#123B7A]">صفحة التشخيص</p>
              <h1 className="page-heading">ابدأ من هنا إذا كنت تريد أقصر طريق واضح</h1>
              <p className="section-copy">
                التشخيص هو أسرع طريقة لمعرفة أين تبدأ، وما الذي يحتاجه مستواك الآن، وكيف تتوزع أولويات التدريب.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/exam">
                  <Button>ابدأ التشخيص</Button>
                </Link>
                <Link href="/study-plan">
                  <Button variant="outline">شاهد كيف تتولد الخطة</Button>
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="surface-dark p-7">
              <p className="text-sm text-white/70">3 نتائج مباشرة</p>
              <div className="mt-5 space-y-4">
                {diagnosticPoints.map((item) => (
                  <div key={item} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-5 text-white/90">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
