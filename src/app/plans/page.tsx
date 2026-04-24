import Link from "next/link";
import { CalendarCheck2, Clock3, Target } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const planCards = [
  {
    title: "خطة يومية واضحة",
    text: "قسّم أسبوعك إلى مهام قصيرة وواضحة بدل أن تبدأ بدون ترتيب أو أولويات.",
    icon: CalendarCheck2,
    tone: "bg-[#edfdf3] text-[#2f855a]",
  },
  {
    title: "حسب وقتك الفعلي",
    text: "اختر المسار المناسب لعدد ساعاتك، ثم عدّل الخطة لاحقًا عندما يتغير وقتك أو مستواك.",
    icon: Clock3,
    tone: "bg-[#eef4ff] text-[#123B7A]",
  },
  {
    title: "مرتبطة بهدفك",
    text: "ابدأ من تشخيص سريع أو من هدف درجتك، ثم دع الخطة ترتب لك الطريق الأقرب للوصول.",
    icon: Target,
    tone: "bg-[#fff8e5] text-[#b7791f]",
  },
];

export default function PlansPage() {
  return (
    <PageShell
      eyebrow="الخطط"
      title="خطط دراسية مرتبة للزائر، ولوحة تنفيذ كاملة بعد تسجيل الدخول"
      description="هذه الصفحة عامة وتشرح فكرة الخطط داخل معيار بشكل واضح. عندما تسجل دخولك ستنتقل إلى لوحة الخطة اليومية الكاملة داخل حسابك، بدون أن تخرج من الواجهة الجديدة."
      icon={CalendarCheck2}
      iconWrap="bg-[#edfdf3]"
      iconColor="text-[#2f855a]"
      accentClass="shadow-[0_20px_45px_rgba(47,133,90,0.14)]"
      ctaLabel="قارن الخطط والأسعار"
      ctaHref="/pricing"
    >
      <div className="grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <Reveal>
          <Card className="rounded-[2rem] border-white/80 bg-white/95 shadow-soft">
            <CardContent className="p-8">
              <h2 className="display-font text-2xl font-bold text-slate-950">كيف تعمل الخطط داخل معيار؟</h2>
              <div className="mt-5 space-y-4 text-[1.02rem] leading-8 text-slate-600">
                <p>نبدأ بتحديد مستواك ووقتك وعدد الأيام المتبقية، ثم نبني لك توزيعًا واضحًا بين الكمي واللفظي والمراجعة.</p>
                <p>إذا سجلت الدخول، تتحول الخطة من صفحة تعريفية إلى مساحة تنفيذ يومية فيها مهام ومؤشرات إنجاز وتحديث تلقائي للتوزيع.</p>
                <p>لهذا جعلنا رابط الخطط في الواجهة العامة يفتح صفحة عامة مرتبة، بينما تبقى لوحة الطالب الكاملة داخل الحساب فقط.</p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="/register">
                  <Button>أنشئ حسابك وابدأ الخطة</Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline">شاهد تفاصيل الباقات</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </Reveal>

        <div className="grid gap-4">
          {planCards.map((item, index) => {
            const Icon = item.icon;

            return (
              <Reveal key={item.title} delay={index * 0.05}>
                <Card className="rounded-[1.8rem] border-white/80 bg-white/95 shadow-soft">
                  <CardContent className="flex items-start gap-4 p-6">
                    <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-[1.2rem] ${item.tone}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="display-font text-xl font-bold text-slate-950">{item.title}</h3>
                      <p className="mt-2 text-[0.98rem] leading-8 text-slate-600">{item.text}</p>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            );
          })}
        </div>
      </div>
    </PageShell>
  );
}
