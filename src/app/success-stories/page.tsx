import Link from "next/link";

import { Reveal } from "@/components/reveal";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { testimonials } from "@/data/miyaar";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/diagnostic", label: "التشخيص" },
  { href: "/question-banks", label: "بنوك الأسئلة" },
  { href: "/study-plan", label: "الخطة اليومية" },
  { href: "/pricing", label: "الأسعار" },
];

export default function SuccessStoriesPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader links={navLinks} ctaHref="/exam" ctaLabel="ابدأ رحلتك" />
      <main className="section-shell pt-10 md:pt-14">
        <div className="mx-auto w-[min(calc(100%-2rem),1180px)]">
          <Reveal>
            <div className="text-center">
              <p className="section-eyebrow text-[#123B7A]">نتائج وتجارب الطلاب</p>
              <h1 className="section-title mx-auto">صفحة مستقلة للثقة بدل حشر كل الشهادات في الهوم</h1>
              <p className="section-copy mx-auto">
                هنا تظهر النتائج والاقتباسات بشكل أهدأ، بينما تبقى الصفحة الرئيسية مختصرة ومركزة على التحويل.
              </p>
            </div>
          </Reveal>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {testimonials.map((item, index) => (
              <Reveal key={item.name} delay={index * 0.04}>
                <Card className="h-full rounded-[2rem] border-white/80 bg-white/95 shadow-soft">
                  <CardContent className="p-8">
                    <div className="display-font mb-5 text-3xl font-bold text-[#123B7A]">{item.result}</div>
                    <blockquote className="testimonial-quote text-slate-900">{item.quote}</blockquote>
                    <div className="mt-6 border-t border-slate-100 pt-5">
                      <div className="display-font testimonial-name text-slate-950">{item.name}</div>
                      <div className="testimonial-role text-slate-500">{item.meta}</div>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/exam">
              <Button>ابدأ التشخيص الآن</Button>
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
