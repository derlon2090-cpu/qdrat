import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";

import { BankExplorer } from "@/components/bank-explorer";
import { Reveal } from "@/components/reveal";
import { SectionTitle } from "@/components/section-title";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  banks,
  benefits,
  dashboardBars,
  dashboardMetrics,
  dashboardSummary,
  features,
  finalStats,
  heroProof,
  interfaces,
  planPoints,
  proofStats,
  quickStats,
  testimonials,
  weeklyPlan,
} from "@/data/miyaar";

const navLinks = [
  { href: "/#features", label: "المزايا" },
  { href: "/#banks", label: "بنوك الأسئلة" },
  { href: "/#plan", label: "الخطة الذكية" },
  { href: "/#dashboard", label: "لوحة الطالب" },
  { href: "/#testimonials", label: "آراء الطلاب" },
  { href: "/#interfaces", label: "الواجهات" },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader links={navLinks} />

      <main>
        <section className="section-shell overflow-hidden pt-10 md:pt-16" id="hero">
          <div className="mx-auto grid w-[min(calc(100%-2rem),1180px)] gap-10 md:grid-cols-[1.03fr,0.97fr] md:items-center">
            <Reveal>
              <Badge>منصة قدرات عربية حديثة بلمسة فاخرة</Badge>
              <h1 className="page-heading mt-5">
                استعد لاختبار القدرات بطريقة <span className="bg-[linear-gradient(135deg,#1e2a55,#7568ff,#d2a85a)] bg-clip-text text-transparent">أذكى</span> مع معيار
              </h1>
              <p className="section-copy max-w-2xl">
                بنوك أسئلة ضخمة، قطع لفظية مترابطة، اختبارات محاكية، وخطة يومية ذكية
                مصممة حسب مستواك الحقيقي. كل ذلك داخل تجربة عربية واضحة، راقية،
                وتمنحك إحساس الثقة من أول ثانية.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link href="#cta">
                  <Button size="lg">ابدأ الآن</Button>
                </Link>
                <Link href="/banks">
                  <Button size="lg" variant="outline">
                    تصفح البنوك
                  </Button>
                </Link>
              </div>

              <div className="mt-7 flex flex-wrap gap-3">
                {heroProof.map((item) => (
                  <div
                    key={item.title}
                    className="rounded-[1.4rem] border border-white/70 bg-white/80 px-4 py-3 shadow-soft"
                  >
                    <div className="display-font text-sm font-bold text-slate-950">{item.title}</div>
                    <div className="mt-1 text-xs text-slate-500">{item.text}</div>
                  </div>
                ))}
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {quickStats.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Card key={item.label}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Icon className="h-4 w-4 text-violet-700" />
                          <span className="text-xs">{item.label}</span>
                        </div>
                        <div className="display-font mt-2 text-2xl font-bold text-slate-950">{item.value}</div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <div className="relative">
                <div className="absolute right-8 top-0 rounded-full border border-violet-200 bg-white/90 px-4 py-2 text-sm font-semibold text-violet-700 shadow-soft">
                  +16,000 طالب يذاكر مع معيار
                </div>
                <div className="absolute -left-2 bottom-16 rounded-full border border-amber-200 bg-white/90 px-4 py-2 text-sm font-semibold text-amber-700 shadow-soft">
                  خطة تتغير مع مستواك
                </div>
                <Card className="overflow-hidden rounded-[2.3rem] bg-[radial-gradient(circle_at_top_right,rgba(117,104,255,0.16),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(247,248,253,0.92))] p-6 shadow-luxe">
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200/80 pb-5">
                    <div>
                      <p className="text-sm text-slate-500">لوحة معيار</p>
                      <h2 className="display-font text-2xl font-bold text-slate-950">
                        تجربة منظمة تقودك للدرجة الأعلى
                      </h2>
                    </div>
                    <Badge>MVP جاهز</Badge>
                  </div>

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="rounded-[1.8rem] bg-[linear-gradient(145deg,#16213f,#2b3570,#7568ff)] p-5 text-white shadow-luxe">
                      <p className="text-sm text-white/70">توصيات اليوم</p>
                      <div className="display-font mt-3 text-2xl font-bold leading-relaxed">
                        قطعة قصيرة + 15 سؤال لفظي + مراجعة الأخطاء
                      </div>
                      <p className="mt-3 text-sm leading-7 text-white/70">
                        المسار اليومي يتشكل تلقائيًا حسب السرعة والدقة والوقت المتاح
                        قبل الاختبار.
                      </p>
                      <Progress
                        value={72}
                        className="mt-5 bg-white/15"
                        indicatorClassName="bg-[linear-gradient(90deg,#f6deb1,#ffffff)]"
                      />
                    </div>

                    <Card className="rounded-[1.8rem] bg-white/90">
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm text-slate-500">الإتقان الحالي</p>
                          <div className="display-font text-2xl font-bold text-slate-950">82%</div>
                        </div>
                        <div className="mt-5 space-y-4">
                          {[
                            { label: "التناظر", value: 91 },
                            { label: "إكمال الجمل", value: 76 },
                            { label: "القطع", value: 63 },
                          ].map((item) => (
                            <div key={item.label} className="space-y-2">
                              <div className="text-sm text-slate-600">{item.label}</div>
                              <Progress value={item.value} />
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <div className="surface-dark md:col-span-2 p-5">
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div>
                          <p className="text-sm text-white/70">بنوك جاهزة حسب المهارة</p>
                          <h3 className="display-font mt-2 text-xl font-bold">
                            ابنِ اختبارك أو تدرب بسرعة
                          </h3>
                        </div>
                        <span className="mini-pill border-white/10 bg-white/10 text-white">لفظي</span>
                      </div>

                      <div className="mt-5 grid gap-3 sm:grid-cols-3">
                        {banks.slice(0, 3).map((bank) => (
                          <div
                            key={bank.id}
                            className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4"
                          >
                            <div className="text-sm text-white/70">{bank.title}</div>
                            <div className="display-font mt-2 text-2xl font-bold text-white">
                              {bank.count.toLocaleString("en-US")}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="section-shell pt-2">
          <div className="mx-auto grid w-[min(calc(100%-2rem),1180px)] gap-4 rounded-[2rem] bg-[linear-gradient(145deg,#111930,#182646_60%,#1d2b56)] p-5 text-white shadow-luxe md:grid-cols-4">
            {proofStats.map((item) => (
              <div key={item.label} className="rounded-[1.4rem] border border-white/10 bg-white/5 p-5">
                <div className="display-font text-3xl font-bold">{item.value}</div>
                <div className="mt-2 text-sm text-white/70">{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="section-shell" id="features">
          <div className="mx-auto w-[min(calc(100%-2rem),1180px)]">
            <Reveal>
              <SectionTitle
                badge="المزايا الأساسية"
                title="كل ما يحتاجه طالب القدرات داخل تجربة واحدة واضحة وراقية"
                text="استلهمنا من الهيكلة التسويقية القوية للمنصات التعليمية الكبيرة، لكن صغناها لهوية معيار بشكل أكثر هدوءًا، تنظيمًا، واحترافًا."
              />
            </Reveal>

            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <Reveal key={feature.title} delay={index * 0.04}>
                    <Card className="h-full rounded-[2rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(245,247,252,0.9))]">
                      <CardContent className="p-6">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,rgba(117,104,255,0.14),rgba(210,168,90,0.16))] text-violet-700">
                          <Icon className="h-6 w-6" />
                        </div>
                        <h3 className="display-font mt-5 text-xl font-bold text-slate-950">
                          {feature.title}
                        </h3>
                        <p className="mt-3 text-sm leading-8 text-slate-600">{feature.text}</p>
                      </CardContent>
                    </Card>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        <section className="section-shell" id="banks">
          <div className="mx-auto grid w-[min(calc(100%-2rem),1180px)] gap-8 lg:grid-cols-[1.18fr,0.82fr]">
            <Reveal>
              <SectionTitle
                badge="بنوك الأسئلة"
                title="ابحث وفلتر وتدرّب على البنك المناسب في ثوانٍ"
                text="لفظي، قطع، تناظر لفظي، إكمال الجمل، الخطأ السياقي، والمفردة الشاذة. كل بنك مصمم ليخدم التدريب السريع والاختبار المخصص."
                align="right"
              />
              <div className="mt-8">
                <BankExplorer items={banks} />
              </div>
            </Reveal>

            <div className="space-y-5">
              <Reveal delay={0.05}>
                <div className="surface-dark p-6">
                  <p className="text-sm text-white/70">كيف تُبنى بنوك معيار؟</p>
                  <h3 className="display-font mt-3 text-2xl font-bold">هيكلة ذكية وتخصيص مرن</h3>
                  <div className="mt-5 space-y-3">
                    {[
                      {
                        title: "هيكلة ذكية",
                        text: "ربط القطعة بعدة أسئلة بدل تكرار النص داخل كل عنصر.",
                      },
                      {
                        title: "تصنيف دقيق",
                        text: "كل سؤال مرتبط بمهارة وصعوبة وتكرار وتفسير واضح.",
                      },
                      {
                        title: "استخدام مرن",
                        text: "تدريب سريع، اختبار مخصص، أو توصية يومية حسب الأداء.",
                      },
                    ].map((item) => (
                      <div
                        key={item.title}
                        className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4"
                      >
                        <div className="display-font text-base font-bold text-white">{item.title}</div>
                        <div className="mt-1 text-sm leading-7 text-white/70">{item.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>

              <Reveal delay={0.08}>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm font-semibold text-slate-500">ميزة إضافية مهمة</p>
                    <ul className="mt-4 space-y-3 text-sm leading-8 text-slate-600">
                      {benefits.map((item) => (
                        <li key={item} className="flex gap-2">
                          <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="section-shell" id="plan">
          <div className="mx-auto grid w-[min(calc(100%-2rem),1180px)] gap-8 lg:grid-cols-[0.9fr,1.1fr]">
            <Reveal>
              <div className="surface-card p-7">
                <Badge>الخطة الذكية</Badge>
                <h2 className="section-title max-w-2xl text-right">
                  ليست خطة ثابتة للجميع. إنها خطة تتشكل حسبك أنت.
                </h2>
                <p className="section-copy max-w-xl text-right">
                  معيار تتابع أداء الطالب وتبني له مسارًا يوميًا أو أسبوعيًا بحسب
                  نقاط القوة والضعف، قرب موعد الاختبار، وعدد الساعات المتاحة له.
                </p>
                <div className="mt-6 grid gap-3">
                  {planPoints.map((point) => (
                    <div
                      key={point.title}
                      className="rounded-[1.5rem] border border-slate-200/80 bg-white/80 p-5"
                    >
                      <div className="display-font text-lg font-bold text-slate-950">{point.title}</div>
                      <div className="mt-2 text-sm leading-8 text-slate-600">{point.text}</div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <div className="surface-card p-7">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">أسبوعك في معيار</p>
                    <h3 className="display-font text-2xl font-bold text-slate-950">
                      الخطة تتحسن مع كل جلسة
                    </h3>
                  </div>
                  <Badge>Dynamic Plan</Badge>
                </div>
                <div className="mt-6 space-y-4">
                  {weeklyPlan.map((item) => (
                    <div
                      key={item.day}
                      className="rounded-[1.5rem] border border-slate-200/80 bg-white/70 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="text-sm text-slate-500">{item.day}</div>
                          <div className="display-font mt-1 text-lg font-bold text-slate-950">
                            {item.task}
                          </div>
                        </div>
                        <div className="display-font text-lg font-bold text-slate-950">
                          {item.progress}%
                        </div>
                      </div>
                      <Progress value={item.progress} className="mt-4" />
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        <section className="section-shell" id="dashboard">
          <div className="mx-auto w-[min(calc(100%-2rem),1180px)]">
            <Reveal>
              <SectionTitle
                badge="لوحة الطالب"
                title="Dashboard أنيق يوضح التقدم بلا تعقيد"
                text="نسبة التقدم، نقاط القوة والضعف، عدد الأسئلة المحلولة، المحفوظة، الأداء الأسبوعي، وتوصيات اليوم في مساحة واحدة واضحة."
              />
            </Reveal>

            <Reveal delay={0.04}>
              <Card className="mt-10 p-2">
                <CardContent className="space-y-6 p-6">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-500">مسار الطالب</p>
                      <h3 className="display-font text-2xl font-bold text-slate-950">
                        لوحة مريحة تركز على القرار التالي
                      </h3>
                    </div>
                    <Link href="/dashboard">
                      <Button variant="outline">فتح اللوحة</Button>
                    </Link>
                  </div>

                  <div className="grid gap-5 lg:grid-cols-[1.3fr,0.7fr]">
                    <div className="space-y-5">
                      {dashboardMetrics.map((item) => (
                        <div
                          key={item.title}
                          className="rounded-[1.7rem] border border-slate-200/80 bg-white/80 p-5"
                        >
                          <p className="text-sm text-slate-500">{item.title}</p>
                          <div className="display-font mt-2 text-3xl font-bold text-slate-950">
                            {item.value}
                          </div>
                          <p className="mt-2 text-sm leading-7 text-slate-600">{item.note}</p>
                        </div>
                      ))}

                      <div className="rounded-[1.7rem] border border-slate-200/80 bg-white/80 p-5">
                        <p className="text-sm text-slate-500">نقاط القوة والضعف</p>
                        <div className="mt-4 space-y-4">
                          {dashboardBars.map((item) => (
                            <div key={item.label} className="space-y-2">
                              <div className="text-sm text-slate-600">{item.label}</div>
                              <Progress value={item.value} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {dashboardSummary.map((item) => (
                        <div
                          key={item.label}
                          className="rounded-[1.7rem] border border-slate-200/80 bg-white/80 p-5"
                        >
                          <div className="display-font text-3xl font-bold text-slate-950">
                            {item.value}
                          </div>
                          <p className="mt-2 text-sm text-slate-600">{item.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </section>

        <section className="section-shell" id="testimonials">
          <div className="mx-auto w-[min(calc(100%-2rem),1180px)]">
            <Reveal>
              <SectionTitle
                badge="آراء الطلاب"
                title="ثقة تنعكس في التجربة لا في الكلمات فقط"
                text="بطاقات شهادات منظمة وراقية تركز على أثر المنصة: التحسن، وضوح الخطة، وراحة الاستخدام."
              />
            </Reveal>

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {testimonials.map((item, index) => (
                <Reveal key={item.name} delay={index * 0.05}>
                  <Card className="h-full bg-[linear-gradient(180deg,rgba(255,255,255,0.96),rgba(244,246,251,0.92))]">
                    <CardContent className="p-6">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,rgba(117,104,255,0.14),rgba(210,168,90,0.16))] text-lg font-bold text-violet-700">
                        “
                      </div>
                      <blockquote className="mt-4 leading-9 text-slate-900">
                        {item.quote}
                      </blockquote>
                      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200/80 pt-4">
                        <div>
                          <div className="display-font font-bold text-slate-950">{item.name}</div>
                          <div className="text-sm text-slate-500">{item.meta}</div>
                        </div>
                        <div className="text-left md:text-right">
                          <div className="display-font font-bold text-slate-950">{item.result}</div>
                          <div className="text-sm text-slate-500">الأثر الملحوظ</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell pt-4">
          <div className="mx-auto grid w-[min(calc(100%-2rem),1180px)] gap-4 rounded-[2rem] bg-[linear-gradient(145deg,#111930,#182646_60%,#1d2b56)] p-5 text-white shadow-luxe md:grid-cols-4">
            {finalStats.map((item) => (
              <div key={item.label} className="rounded-[1.4rem] border border-white/10 bg-white/5 p-5">
                <div className="display-font text-3xl font-bold">{item.value}</div>
                <div className="mt-2 text-sm text-white/70">{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        <section className="section-shell" id="interfaces">
          <div className="mx-auto w-[min(calc(100%-2rem),1180px)]">
            <Reveal>
              <SectionTitle
                badge="الواجهات المطلوبة"
                title="نموذج متكامل لرحلة معيار من الصفحة الأولى حتى الإدارة"
                text="هذه روابط الواجهات الأساسية المبدئية: الصفحة الرئيسية، بنوك الأسئلة، صفحة القطعة، الاختبار المحاكي، النتائج، لوحة الطالب، ولوحة الإدارة."
              />
            </Reveal>

            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {interfaces.map((item, index) => (
                <Reveal key={item.title} delay={index * 0.04}>
                  <Card className="h-full">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,rgba(117,104,255,0.14),rgba(210,168,90,0.16))] text-sm font-bold text-violet-700">
                          {index + 1}
                        </div>
                        <span className="mini-pill bg-amber-50 text-amber-700">Prototype</span>
                      </div>
                      <h3 className="display-font mt-5 text-xl font-bold text-slate-950">
                        {item.title}
                      </h3>
                      <p className="mt-3 text-sm leading-8 text-slate-600">{item.text}</p>
                      <Link
                        href={item.href}
                        className="mt-5 flex items-center justify-between rounded-[1.3rem] border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5"
                      >
                        <span>{item.cta}</span>
                        <ArrowLeft className="h-4 w-4" />
                      </Link>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell pt-2" id="cta">
          <div className="mx-auto w-[min(calc(100%-2rem),1180px)]">
            <Reveal>
              <Card className="overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(117,104,255,0.12),transparent_20%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(246,247,252,0.94))]">
                <CardContent className="flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center">
                  <div>
                    <Badge>ابدأ من اليوم</Badge>
                    <h2 className="section-title max-w-2xl text-right">
                      ارفع مستواك في القدرات مع معيار
                    </h2>
                    <p className="section-copy max-w-2xl text-right">
                      واجهة فاخرة، خطة ذكية، ومحتوى منظم يجعل الطالب يشعر أنه داخل
                      منصة كبيرة صُممت بعناية حقيقية.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/exam">
                      <Button size="lg">شاهد الاختبار</Button>
                    </Link>
                    <Link href="/banks">
                      <Button size="lg" variant="outline">
                        تصفح البنوك
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </section>
      </main>
    </div>
  );
}
