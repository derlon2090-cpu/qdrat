import Link from "next/link";

import { Reveal } from "@/components/reveal";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { passageQuestions } from "@/data/miyaar";
import { getInitialAuthUser } from "@/lib/server-auth";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/banks", label: "البنوك" },
  { href: "/passage", label: "القطعة" },
  { href: "/exam", label: "الاختبار" },
  { href: "/results", label: "النتائج" },
];

export default async function PassagePage() {
  const initialAuthUser = await getInitialAuthUser();

  return (
    <div className="min-h-screen">
      <SiteHeader
        variant={initialAuthUser ? "student" : "public"}
        links={initialAuthUser ? undefined : navLinks}
        ctaHref="/verbal/reading"
        ctaLabel="ابدأ اختبار القطع"
        initialUser={initialAuthUser}
      />
      <main className="section-shell pt-10 md:pt-14">
        <div className="mx-auto grid w-[min(calc(100%-2rem),1180px)] gap-8 lg:grid-cols-[1.08fr,0.92fr]">
          <Reveal>
            <div className="surface-card p-7">
              <Badge>صفحة القطعة</Badge>
              <h1 className="page-heading mt-5">
                تجربة قراءة مريحة تربط النص بعدة أسئلة بلا تكرار
              </h1>
              <p className="section-copy max-w-2xl">
                هذه الواجهة مصممة لتخزين القطعة مرة واحدة ثم ربطها بأسئلة متعددة، مع مساحة
                قراءة واضحة، وعرض الأسئلة بطريقة تساعد الطالب على الفهم لا على التشتت.
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href="/verbal/reading">
                  <Button>ابدأ اختبار القطع</Button>
                </Link>
                <Link href="/banks">
                  <Button variant="outline">العودة للبنوك</Button>
                </Link>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <div className="surface-dark p-7">
              <p className="text-sm text-white/70">مؤشر الصفحة</p>
              <h2 className="display-font mt-3 text-3xl font-bold">
                قراءة أوضح، أسئلة مرتبطة، ومراجعة أذكى
              </h2>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                {[
                  { value: "4", label: "أسئلة مرتبطة" },
                  { value: "1", label: "قطعة أساسية" },
                  { value: "10 د", label: "جلسة مركزة" },
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

        <div className="mx-auto mt-10 grid w-[min(calc(100%-2rem),1180px)] gap-8 lg:grid-cols-[1.12fr,0.88fr]">
          <Reveal>
            <Card>
              <CardContent className="space-y-6 p-7">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">القطعة النصية</p>
                    <h3 className="display-font text-2xl font-bold text-slate-950">
                      القراءة المركزة أساس فهم القطع
                    </h3>
                  </div>
                  <Badge className="bg-violet-50 text-violet-700">مهارة: الفكرة العامة</Badge>
                </div>

                <div className="space-y-5 text-base leading-9 text-slate-900">
                  <p>
                    النجاح في أسئلة القطع لا يعتمد على القراءة السريعة وحدها، بل على القدرة
                    على فهم البناء العام للنص، وربط كل فقرة بهدفها، والتمييز بين الفكرة
                    الرئيسية والتفاصيل الداعمة.
                  </p>
                  <p>
                    ولهذا صممت واجهة معيار بحيث تبرز النص بوضوح، وتضع الأسئلة المرتبطة به في
                    تدفق متسلسل، وتقلل أي عناصر جانبية قد تصرف الانتباه عن مهمة القراءة
                    والتحليل.
                  </p>
                </div>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal delay={0.05}>
            <Card>
              <CardContent className="p-6">
                <p className="text-sm font-semibold text-slate-500">ملخص سريع</p>
                <h3 className="display-font mt-3 text-2xl font-bold text-slate-950">
                  ما الذي يقاس هنا؟
                </h3>
                <ul className="mt-5 space-y-3 text-sm leading-8 text-slate-600">
                  <li>فهم الفكرة العامة للقطعة.</li>
                  <li>تمييز العلاقات بين الفقرات.</li>
                  <li>استنتاج مقصد الكاتب من السياق.</li>
                </ul>
              </CardContent>
            </Card>
          </Reveal>
        </div>

        <div className="mx-auto mt-10 w-[min(calc(100%-2rem),1180px)]">
          <Reveal>
            <Card>
              <CardContent className="p-7">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">الأسئلة المرتبطة</p>
                    <h3 className="display-font text-2xl font-bold text-slate-950">
                      أسئلة هذه القطعة
                    </h3>
                  </div>
                  <Link href="/results">
                    <Button variant="outline">عرض النتيجة النموذجية</Button>
                  </Link>
                </div>

                <div className="mt-6 grid gap-4">
                  {passageQuestions.map((question, index) => (
                    <div
                      key={question.title}
                      className="rounded-[1.7rem] border border-slate-200/80 bg-white/75 p-5"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="display-font text-lg font-bold text-slate-950">
                          سؤال {index + 1}
                        </div>
                        <Badge className="bg-amber-50 text-amber-700">{question.meta}</Badge>
                      </div>
                      <h4 className="display-font mt-3 text-xl font-bold text-slate-950">
                        {question.title}
                      </h4>
                      <div className="mt-4 grid gap-3">
                        {["أ", "ب", "ج", "د"].map((choice) => (
                          <div
                            key={choice}
                            className="flex items-start gap-3 rounded-[1.4rem] border border-slate-200 bg-white/80 p-4"
                          >
                            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 font-bold text-violet-700">
                              {choice}
                            </span>
                            <div className="text-sm leading-7 text-slate-600">
                              خيار نموذجي يوضح شكل الإجابة داخل صفحة القطعة.
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </main>
    </div>
  );
}
