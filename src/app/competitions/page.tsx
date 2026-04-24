import Link from "next/link";
import { Clock3, Swords, Trophy } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const competitionCards = [
  {
    title: "تحدي شهري",
    text: "لوحة أبطال شهرية تعتمد على XP والتقدم الفعلي داخل التدريب والمراجعة.",
    icon: Trophy,
    tone: "bg-[#fff8e5] text-[#b7791f]",
  },
  {
    title: "نزال مباشر",
    text: "تحديات قصيرة بين الطلاب على عدد محدد من الأسئلة مع نتيجة فورية وتحفيز إضافي.",
    icon: Swords,
    tone: "bg-[#f5f3ff] text-[#7c3aed]",
  },
  {
    title: "مهمات يومية وسلسلة",
    text: "كل يوم تفتح لك مهام ونقاط إضافية، ومع الانتظام يرتفع ترتيبك تدريجيًا.",
    icon: Clock3,
    tone: "bg-[#eef4ff] text-[#123B7A]",
  },
];

export default function CompetitionsPage() {
  return (
    <PageShell
      eyebrow="المسابقات"
      title="تعرف على نظام التحديات أولًا، ثم افتح لوحة المنافسة من داخل حسابك"
      description="بدل أن ينقلك الشريط العام إلى واجهة الطالب مباشرة، أصبح رابط المسابقات يفتح صفحة عامة حديثة تشرح التحديات والترتيب ولوحة الأبطال. أما اللوحة التفاعلية الكاملة فتظهر بعد تسجيل الدخول."
      icon={Trophy}
      iconWrap="bg-[#fff8e5]"
      iconColor="text-[#b7791f]"
      accentClass="shadow-[0_20px_45px_rgba(183,121,31,0.16)]"
      ctaLabel="سجل وادخل التحدي"
      ctaHref="/register"
    >
      <div className="grid gap-5 md:grid-cols-3">
        {competitionCards.map((item, index) => {
          const Icon = item.icon;

          return (
            <Reveal key={item.title} delay={index * 0.05}>
              <Card className="h-full rounded-[2rem] border-white/80 bg-white/95 shadow-soft">
                <CardContent className="p-8">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-[1.2rem] ${item.tone}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h2 className="mt-5 display-font text-xl font-bold text-slate-950">{item.title}</h2>
                  <p className="mt-3 text-[0.98rem] leading-8 text-slate-600">{item.text}</p>
                </CardContent>
              </Card>
            </Reveal>
          );
        })}
      </div>

      <Reveal delay={0.18}>
        <Card className="rounded-[2rem] border-white/80 bg-white/95 shadow-soft">
          <CardContent className="flex flex-col gap-5 p-8 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="display-font text-2xl font-bold text-slate-950">لوحة التحدي الحقيقية داخل حسابك</h2>
              <p className="mt-3 max-w-3xl text-[1.02rem] leading-8 text-slate-600">
                بعد الدخول إلى حسابك ستشاهد ترتيبك اليومي والأسبوعي والشهري، وستعرف كم ينقصك للدخول إلى المراكز الأعلى، وتبدأ النزال المباشر مع الطلاب.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/register">
                <Button>أنشئ حسابك</Button>
              </Link>
              <Link href="/question-bank">
                <Button variant="outline">ابدأ التدريب أولًا</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </Reveal>
    </PageShell>
  );
}
