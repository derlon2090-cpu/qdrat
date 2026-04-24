import Link from "next/link";
import { BookOpen, FileText, PenTool } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const summaryCards = [
  {
    title: "ملخصات مركزة",
    text: "راجع المفاهيم الأساسية بسرعة قبل التدريب أو قبل الدخول إلى النموذج الكامل.",
    icon: BookOpen,
    tone: "bg-[#fff4df] text-[#f59e0b]",
  },
  {
    title: "ملفات PDF داخل الموقع",
    text: "بعد تسجيل الدخول تستطيع رفع ملفك وفتحه صفحة صفحة مع ملاحظات ومساحات حل محفوظة.",
    icon: FileText,
    tone: "bg-[#eef4ff] text-[#123B7A]",
  },
  {
    title: "مراجعة بالقلم والملاحظات",
    text: "أضف تعليماتك الخاصة وراجعها لاحقًا من نفس المكتبة بدون أن تضيع ملفاتك.",
    icon: PenTool,
    tone: "bg-[#edfdf3] text-[#2f855a]",
  },
];

export default function SummaryCenterPage() {
  return (
    <PageShell
      eyebrow="الملخصات"
      title="مكتبة عامة للتعريف، ومكتبة تفاعلية كاملة داخل الحساب"
      description="رابط الملخصات في الواجهة العامة يوصلك الآن إلى صفحة تعريفية حديثة بدل مساحة الطالب الداخلية. وعندما تسجل دخولك تستطيع فتح مكتبة الملخصات التفاعلية الكاملة من داخل حسابك."
      icon={BookOpen}
      iconWrap="bg-[#fff4df]"
      iconColor="text-[#f59e0b]"
      accentClass="shadow-[0_20px_45px_rgba(245,158,11,0.16)]"
      ctaLabel="أنشئ حسابًا لفتح المكتبة"
      ctaHref="/register"
    >
      <div className="grid gap-5 md:grid-cols-3">
        {summaryCards.map((item, index) => {
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
              <h2 className="display-font text-2xl font-bold text-slate-950">هل تريد المكتبة الكاملة؟</h2>
              <p className="mt-3 max-w-3xl text-[1.02rem] leading-8 text-slate-600">
                بعد تسجيل الدخول ستظهر لك مكتبة الملخصات الخاصة بك، ورفع ملفات PDF، والتفاعل داخل الصفحات، والعودة إلى ملفاتك المحفوظة في أي وقت.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/register">
                <Button>ابدأ الآن</Button>
              </Link>
              <Link href="/question-bank">
                <Button variant="outline">استكشف بنك الأسئلة</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </Reveal>
    </PageShell>
  );
}
