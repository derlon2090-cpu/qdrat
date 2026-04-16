import { BookCopy } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { Card, CardContent } from "@/components/ui/card";

const updates = [
  {
    title: "إضافة بنك كمي جديد",
    text: "أسئلة نسب وتناسب ومقارنات مع تنظيم أسهل داخل البحث.",
  },
  {
    title: "تحسين التشخيص السريع",
    text: "نتيجة أولية أوضح وخطة أول أسبوع أبسط في العرض.",
  },
  {
    title: "مراجعة أخطاء أذكى",
    text: "ترتيب الخاطئ والمحفوظ داخل مسار واحد مختصر.",
  },
];

export default function UpdatesPage() {
  return (
    <PageShell
      eyebrow="إصدارات"
      title="كل جديد مهم في المنصة يظهر هنا بشكل مختصر وواضح"
      description="صفحة خفيفة تجمع ما تم إضافته أو تحسينه: بنوك جديدة، تطويرات في التشخيص، وتغييرات مؤثرة على تجربة الطالب."
      icon={BookCopy}
      iconWrap="bg-[#f5f3ff]"
      iconColor="text-[#7c3aed]"
      accentClass="shadow-[0_20px_45px_rgba(124,58,237,0.16)]"
      ctaLabel="ارجع إلى بنك الأسئلة"
      ctaHref="/question-bank"
    >
      <div className="grid gap-5 md:grid-cols-3">
        {updates.map((item, index) => (
          <Reveal key={item.title} delay={index * 0.04}>
            <Card className="rounded-[2rem] border-white/80 bg-white/95 shadow-soft">
              <CardContent className="p-8">
                <div className="display-font text-sm font-bold tracking-[0.18em] text-[#7c3aed]">
                  0{index + 1}
                </div>
                <h3 className="card-title mt-5 font-bold text-slate-950">{item.title}</h3>
                <p className="card-text text-slate-600">{item.text}</p>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </PageShell>
  );
}
