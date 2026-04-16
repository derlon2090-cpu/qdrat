import { FileHeart, Star } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { Card, CardContent } from "@/components/ui/card";

const stories = [
  ["+18 درجة", "رهف الشمري", "خلال 6 أسابيع", "الخطة اختصرت عليّ الطريق وجعلت كل يوم أوضح من اليوم الذي قبله."],
  ["ثقة أعلى", "عبدالله القحطاني", "قبل الاختبار النهائي", "لوحة الطالب بينت لي نقاط الضعف الحقيقية بدل ما أوزع جهدي عشوائيًا."],
  ["+11 درجة", "لمى الحربي", "مع مراجعة يومية", "المراجعة داخل معيار كانت أكثر ترتيبًا من أي تجربة سابقة خصوصًا في اللفظي."],
];

export default function WallOfLovePage() {
  return (
    <PageShell
      eyebrow="جدار الحب"
      title="تجارب مختصرة تعكس وضوح التجربة وقوة التنظيم"
      description="صفحة مستقلة للآراء والنتائج حتى تبقى الرئيسية أخف، ومع ذلك يظل عندك مكان واضح يعرض الثقة والتجارب الحقيقية."
      icon={FileHeart}
      iconWrap="bg-[#fdf2f8]"
      iconColor="text-[#db2777]"
      accentClass="shadow-[0_20px_45px_rgba(219,39,119,0.16)]"
      ctaLabel="شاهد النتائج"
      ctaHref="/success-stories"
    >
      <div className="grid gap-5 md:grid-cols-3">
        {stories.map(([result, name, meta, quote], index) => (
          <Reveal key={name} delay={index * 0.04}>
            <Card className="testimonial-card border-white/80 bg-white/95 shadow-soft">
              <div className="rounded-[1.2rem] bg-[linear-gradient(135deg,#f063ad,#db2777)] px-5 py-4 text-center text-2xl font-black text-white">
                {result}
              </div>
              <CardContent className="p-0 pt-6">
                <div className="flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <Star key={starIndex} className="h-4 w-4 fill-current" />
                  ))}
                </div>
                <blockquote className="testimonial-quote text-slate-900">{quote}</blockquote>
                <div className="mt-5 border-t border-slate-100 pt-5">
                  <div className="testimonial-name text-slate-950">{name}</div>
                  <div className="testimonial-role text-slate-500">{meta}</div>
                </div>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </PageShell>
  );
}
