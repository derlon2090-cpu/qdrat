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

const questions = [
  ["كيف أبدأ؟", "ابدأ بالتشخيص إذا كنت تريد نقطة بداية أوضح، ثم انتقل إلى الخطة والبنوك."],
  ["هل المنصة للكمي واللفظي؟", "نعم، المنصة مخصصة لاختبار القدرات الكمي واللفظي فقط."],
  ["هل يوجد بحث عن سؤال؟", "نعم، صفحة بنوك الأسئلة تدعم البحث داخل نص السؤال نفسه مع فلاتر إضافية."],
  ["كيف أراجع أخطائي؟", "الأسئلة الخاطئة والمحفوظه تظهر في مسار مراجعة مستقل وواضح داخل تجربة الطالب."],
];

export default function FaqPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader links={navLinks} ctaHref="/contact" ctaLabel="اسألنا مباشرة" />
      <main className="section-shell pt-10 md:pt-14">
        <div className="mx-auto w-[min(calc(100%-2rem),980px)]">
          <Reveal>
            <div className="text-center">
              <p className="section-eyebrow text-[#123B7A]">الأسئلة الشائعة</p>
              <h1 className="section-title mx-auto">كل ما يحتاجه الطالب قبل أن يبدأ</h1>
              <p className="section-copy mx-auto">
                فصلنا هذه الأسئلة في صفحة مستقلة حتى لا تتحول الصفحة الرئيسية إلى قائمة شروحات طويلة.
              </p>
            </div>
          </Reveal>

          <div className="mt-10 space-y-4">
            {questions.map(([title, text], index) => (
              <Reveal key={title} delay={index * 0.04}>
                <Card className="rounded-[1.8rem] border-white/80 bg-white/95 shadow-soft">
                  <CardContent className="p-7">
                    <h2 className="display-font card-title font-bold text-slate-950">{title}</h2>
                    <p className="card-text text-slate-600">{text}</p>
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
