import { BriefcaseBusiness } from "lucide-react";

import { BankExplorer } from "@/components/bank-explorer";
import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { Card, CardContent } from "@/components/ui/card";
import { bankCollections, banks, questionSearchItems } from "@/data/miyaar";

export default function QuestionBankPage() {
  return (
    <PageShell
      eyebrow="بنك الأسئلة"
      title="فتش وتدرّب على الأسئلة حسب القسم والمهارة والصعوبة"
      description="هذه الصفحة مخصصة للتدريب والبحث: سؤال مباشر، بنوك مرتبة، وفلاتر تخليك تصل بسرعة بدل الدوران داخل أقسام كثيرة."
      icon={BriefcaseBusiness}
      iconWrap="bg-[#fff7ed]"
      iconColor="text-[#d97706]"
      accentClass="shadow-[0_20px_45px_rgba(217,119,6,0.16)]"
      ctaLabel="ابدأ البحث"
      ctaHref="/question-bank"
    >
      <div className="grid gap-8 lg:grid-cols-[1.18fr,0.82fr]">
        <Reveal>
          <BankExplorer items={banks} questions={questionSearchItems} />
        </Reveal>

        <div className="space-y-5">
          <Reveal delay={0.04}>
            <Card className="surface-dark rounded-[2rem] border-0">
              <CardContent className="p-8">
                <p className="text-sm text-white/70">الأولوية الآن</p>
                <h2 className="display-font mt-3 text-3xl font-bold">سؤال مباشر أولًا ثم قرار أوضح</h2>
                <div className="mt-6 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                  {[
                    { value: "بحث", label: "داخل نص السؤال" },
                    { value: "فلترة", label: "قسم + صعوبة + مهارة" },
                    { value: "فتح", label: "السؤال مباشرة" },
                  ].map((item) => (
                    <div key={item.label} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                      <div className="display-font text-2xl font-bold">{item.value}</div>
                      <div className="mt-1 text-sm text-white/70">{item.label}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal delay={0.08}>
            <Card className="rounded-[2rem] border-white/80 bg-white/95 shadow-soft">
              <CardContent className="p-8">
                <p className="section-eyebrow text-[#d97706]">الأقسام الحية</p>
                <h3 className="card-title font-bold text-slate-950">تصنيفات واضحة بدل تشتيت بصري</h3>
                <div className="space-y-4">
                  {bankCollections.slice(0, 3).map((group) => (
                    <div key={group.title} className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50/80 p-4">
                      <div className="display-font font-bold text-slate-950">{group.title}</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {group.items.map((item) => (
                          <span key={item} className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600">
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </div>
    </PageShell>
  );
}
