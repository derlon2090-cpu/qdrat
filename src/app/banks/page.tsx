import Link from "next/link";

import { BankExplorer } from "@/components/bank-explorer";
import { Reveal } from "@/components/reveal";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { bankCollections, banks, questionSearchItems } from "@/data/miyaar";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/banks", label: "البنوك" },
  { href: "/passage", label: "القطعة" },
  { href: "/exam", label: "الاختبار" },
  { href: "/dashboard", label: "لوحة الطالب" },
  { href: "/admin", label: "الإدارة" },
];

export default function BanksPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader links={navLinks} ctaHref="/exam" ctaLabel="اختبار مخصص" />
      <main className="section-shell pt-10 md:pt-14">
        <div className="mx-auto grid w-[min(calc(100%-2rem),1180px)] gap-8 lg:grid-cols-[1.08fr,0.92fr]">
          <Reveal>
            <div className="surface-card p-7">
              <Badge>صفحة بنوك الأسئلة</Badge>
              <h1 className="page-heading mt-5">ابحث عن السؤال أولًا، ثم انتقل للبنك المناسب</h1>
              <p className="section-copy max-w-2xl">
                خففنا هذه الصفحة بصريًا: بحث مباشر داخل نص السؤال، ثم بنوك مرتبة عندما تحتاج تدريبًا أوسع.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/exam">
                  <Button>ابدأ التشخيص</Button>
                </Link>
                <Link href="/">
                  <Button variant="outline">العودة للرئيسية</Button>
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="surface-dark p-7">
              <p className="text-sm text-white/70">الأولوية الآن</p>
              <h2 className="display-font mt-3 text-3xl font-bold">نتيجة سريعة ثم قرار أوضح</h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  { value: "بحث", label: "داخل نص السؤال" },
                  { value: "فلاتر", label: "قسم + صعوبة + مهارة" },
                  { value: "فتح", label: "السؤال مباشرة" },
                ].map((item) => (
                  <div key={item.label} className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                    <div className="display-font text-2xl font-bold">{item.value}</div>
                    <div className="mt-1 text-sm text-white/70">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mx-auto mt-10 grid w-[min(calc(100%-2rem),1180px)] gap-8 lg:grid-cols-[1.18fr,0.82fr]">
          <Reveal>
            <BankExplorer items={banks} questions={questionSearchItems} />
          </Reveal>

          <div className="space-y-5">
            <Reveal delay={0.04}>
              <div className="surface-dark p-6">
                <p className="text-sm text-white/70">بنية التجربة</p>
                <h3 className="display-font mt-3 text-2xl font-bold">تدريب واسع بدون ازدحام بصري</h3>
                <div className="mt-5 grid gap-4">
                  {bankCollections.map((group) => (
                    <div
                      key={group.title}
                      className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
                    >
                      <div className="display-font text-lg font-bold text-white">{group.title}</div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {group.items.map((item) => (
                          <span
                            key={item}
                            className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs text-white/80"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm font-semibold text-slate-500">ترتيب الصفحة</p>
                  <ul className="mt-4 space-y-3 text-sm leading-8 text-slate-600">
                    <li>ابدأ ببحث السؤال عندما تعرف ما تريد.</li>
                    <li>استخدم البنوك عندما تحتاج تدريبًا أوسع حسب المهارة.</li>
                    <li>ارجع للتشخيص إذا احتجت نقطة بداية أوضح.</li>
                  </ul>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </div>
      </main>
    </div>
  );
}
