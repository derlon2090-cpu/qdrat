import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent } from "@/components/ui/card";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/diagnostic", label: "التشخيص" },
  { href: "/question-banks", label: "بنوك الأسئلة" },
  { href: "/study-plan", label: "الخطة اليومية" },
  { href: "/pricing", label: "الأسعار" },
];

const points = [
  "معيار موجودة لتقليل التشتت بين المصادر المختلفة.",
  "تركز فقط على القدرات الكمي واللفظي بدل التوسع المبكر.",
  "تبني التجربة حول القرار التالي: ماذا أذاكر الآن؟",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader links={navLinks} ctaHref="/contact" ctaLabel="تواصل معنا" />
      <main className="section-shell pt-10 md:pt-14">
        <div className="mx-auto w-[min(calc(100%-2rem),980px)]">
          <Reveal>
            <div className="text-center">
              <p className="section-eyebrow text-[#123B7A]">من نحن / لماذا معيار</p>
              <h1 className="section-title mx-auto">منصة تبسط القرار قبل أن تكثر الشرح</h1>
              <p className="section-copy mx-auto">
                هذه الصفحة تحكي لماذا بُنيت معيار، ولماذا تبقي الصفحة الرئيسية خفيفة بينما تنتقل التفاصيل إلى صفحات مستقلة.
              </p>
            </div>
          </Reveal>

          <div className="mt-10 space-y-4">
            {points.map((point, index) => (
              <Reveal key={point} delay={index * 0.04}>
                <Card className="rounded-[1.8rem] border-white/80 bg-white/95 shadow-soft">
                  <CardContent className="p-7">
                    <div className="display-font mb-4 text-sm font-bold tracking-[0.18em] text-[#123B7A]">
                      0{index + 1}
                    </div>
                    <p className="card-text text-slate-700">{point}</p>
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
