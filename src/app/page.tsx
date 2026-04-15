import Link from "next/link";
import { ArrowLeft, CheckCircle2, PlayCircle, Star } from "lucide-react";

import { HeroShowcase } from "@/components/hero-showcase";
import { Reveal } from "@/components/reveal";
import { SectionTitle } from "@/components/section-title";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { finalStats, interfaces } from "@/data/miyaar";

const navLinks = [
  { href: "/#hero", label: "الرئيسية" },
  { href: "/#why", label: "المزايا" },
  { href: "/#student", label: "تجربة الطالب" },
  { href: "/#testimonials", label: "آراء الطلاب" },
];

const trustCards = [
  ["أكثر من 25,000 سؤال", "كمي ولفظي داخل بنوك مرتبة وسهلة الوصول"],
  ["120+ اختبار محاكي", "نماذج قريبة من الاختبار الحقيقي بزمن وتقارير مفهومة"],
  ["16,000+ طالب", "منصة واضحة تشجع على الالتزام اليومي والاستمرار"],
  ["خطة ذكية يومية", "تحدد لك ماذا تذاكر ومتى تراجع حسب مستواك"],
];

const whyCards = [
  ["بنك أسئلة ضخم", "كمي ولفظي داخل بنوك مرتبة وواضحة."],
  ["خطة على مقاسك", "خطة يومية تتغير حسب مستواك الحقيقي."],
  ["مراجعة الأخطاء", "كل أخطائك ترجع لك في مسار واضح."],
  ["اختبارات محاكية", "تجربة قريبة من الاختبار بزمن وتقارير."],
  ["تحليلات أداء", "تعرف أين تتعثر في الكمي أو اللفظي."],
  ["توصيات يومية", "المنصة تقول لك ماذا تبدأ به اليوم."],
];

const steps = [
  ["01", "اختبر مستواك", "ابدأ بتشخيص سريع يحدد أين تقف بدل التخمين."],
  ["02", "خذ خطة يومية ذكية", "اعرف ماذا تذاكر اليوم وماذا تراجع غدًا."],
  ["03", "ارفع درجتك خطوة بخطوة", "راقب تقدمك وانتقل للاختبارات المحاكية في الوقت المناسب."],
];

const testimonials = [
  ["رهف الشمري", "طالبة قدرات", "+18 درجة", "خلال 6 أسابيع", "الخطة كانت واضحة جدًا، وكل يوم أعرف ماذا أبدأ به بدل التشتت."],
  ["عبدالله القحطاني", "طالب ثالث ثانوي", "ثقة أعلى", "قبل الاختبار النهائي", "لوحة الطالب أوضحت لي أخطائي المتكررة وجعلت المراجعة أذكى."],
  ["لمى الحربي", "مستخدمة مستمرة", "+11 درجة", "مع مراجعة يومية", "واجهة مريحة جدًا، والتقارير فرقت معي بين ضعف الفهم وضعف السرعة."],
];

const heroMetrics = ["25,000+ سؤال", "120+ اختبار", "16,000+ طالب", "خطة ذكية يومية"];

const bankHighlights = [
  { title: "الكمي", text: "تدريب منظم على أهم أفكار وأسئلة القدرات الكمي." },
  { title: "اللفظي", text: "بنوك لفظي واضحة تغطي الاستيعاب، التناظر، والسياق." },
  { title: "الاختبارات", text: "اختبارات محاكية كاملة تقيس مستواك قبل يوم الاختبار." },
  { title: "المراجعة", text: "مسار خاص للأسئلة الخاطئة والمحفوظه والضعيفة." },
];

const studentBars = [
  { label: "الكمي", value: 86 },
  { label: "اللفظي", value: 79 },
  { label: "الإتقان العام", value: 82 },
];

const studentPlan = [
  { day: "اليوم 1", task: "كمي سرعة + أساسيات", progress: 84 },
  { day: "اليوم 2", task: "لفظي استيعاب + تناظر", progress: 62 },
  { day: "اليوم 3", task: "مراجعة أخطاء متكررة", progress: 41 },
  { day: "اليوم 4", task: "اختبار محاكي مصغّر", progress: 18 },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader links={navLinks} ctaHref="/#cta" ctaLabel="ابدأ الآن" />

      <main>
        <section className="hero-school section-shell overflow-hidden pb-10 pt-10 md:pt-16" id="hero">
          <div className="mx-auto grid w-[min(calc(100%-2rem),1180px)] gap-10 lg:grid-cols-[0.92fr,1.08fr] lg:items-center">
            <Reveal>
              <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90">
                منصة قدرات كمي ولفظي فقط
              </span>
              <h1 className="page-heading mt-6 max-w-3xl text-white">
                تحضير أذكى للقدرات
                <span className="block text-[#FFE1A8]">الكمي واللفظي</span>
                بخطة يومية واختبارات تحاكي الواقع
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-9 text-white/85">
                منصة عربية حديثة تساعدك تعرف مستواك، تمشي بخطة واضحة، وتتدرج في
                الكمي واللفظي حتى يوم الاختبار بدون تشتت.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="#cta"><Button size="lg" variant="secondary">ابدأ الآن</Button></Link>
                <Link href="#student"><Button size="lg" variant="outline" className="border-white/25 bg-white/10 text-white hover:bg-white/15">شاهد تجربة الطالب</Button></Link>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link href="/exam" className="inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-[#FFE1A8]">
                  <PlayCircle className="h-4 w-4" />
                  اختبر مستواك الآن
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {heroMetrics.map((item) => (
                  <span key={item} className="rounded-full border border-white/18 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-soft backdrop-blur">
                    {item}
                  </span>
                ))}
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <HeroShowcase />
            </Reveal>
          </div>
        </section>

        <section className="section-shell pt-0">
          <div className="mx-auto grid w-[min(calc(100%-2rem),1180px)] gap-4 md:grid-cols-2 xl:grid-cols-4">
            {trustCards.map(([value, label], index) => (
              <Reveal key={value} delay={index * 0.03}>
                <Card className="rounded-[2rem] border-white/80 bg-white/90">
                  <CardContent className="p-6">
                    <div className="display-font text-3xl font-bold text-slate-950">{value}</div>
                    <div className="mt-3 text-base leading-8 text-slate-600">{label}</div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="section-shell" id="why">
          <div className="mx-auto w-[min(calc(100%-2rem),1180px)]">
            <Reveal><SectionTitle badge="لماذا معيار؟" title="كل ما يحتاجه طالب القدرات الكمي واللفظي في منصة واحدة" text="فوائد سريعة وواضحة: بنك أسئلة، خطة ذكية، مراجعة، اختبارات، وتحليلات تجعل التقدم أسهل." /></Reveal>
            <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {whyCards.map(([title, text], index) => (
                <Reveal key={title} delay={index * 0.04}>
                  <Card className="h-full rounded-[2rem] border-white/80 bg-white/92">
                    <CardContent className="p-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,rgba(18,59,122,0.10),rgba(201,161,91,0.24))] text-[#123B7A]">
                        {index + 1}
                      </div>
                      <h3 className="display-font mt-5 text-2xl font-bold text-slate-950">{title}</h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell pt-2">
          <div className="mx-auto grid w-[min(calc(100%-2rem),1180px)] gap-8 lg:grid-cols-[0.84fr,1.16fr] lg:items-center">
            <Reveal>
              <div className="surface-card p-7">
                <span className="mini-pill bg-[#123B7A]/5 text-[#123B7A]">كيف تعمل المنصة</span>
                <h2 className="section-title max-w-2xl text-right">ابدأ بتشخيص سريع، ثم خذ خطة يومية، ثم راقب صعودك</h2>
                <p className="section-copy max-w-xl text-right">نفس الفكرة الناجحة تسويقيًا: خطوات قليلة، واضحة، ومباشرة بدل الشرح الطويل في البداية.</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link href="/exam"><Button>اختبر مستواك الآن</Button></Link>
                  <Link href="#student"><Button variant="outline">شاهد رحلة الطالب</Button></Link>
                </div>
              </div>
            </Reveal>
            <div className="grid gap-4 md:grid-cols-3">
              {steps.map(([step, title, text], index) => (
                <Reveal key={step} delay={index * 0.05}>
                  <Card className="h-full rounded-[2rem] border-white/80 bg-white/92"><CardContent className="p-6"><div className="display-font text-sm font-bold tracking-[0.18em] text-[#123B7A]">{step}</div><h3 className="display-font mt-4 text-2xl font-bold text-slate-950">{title}</h3><p className="mt-3 text-sm leading-8 text-slate-600">{text}</p></CardContent></Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell" id="banks">
          <div className="mx-auto grid w-[min(calc(100%-2rem),1180px)] gap-8 lg:grid-cols-[1.12fr,0.88fr]">
            <Reveal>
              <SectionTitle badge="بنوك الأسئلة" title="اختصرنا الصفحة الرئيسية، وتركنا التفاصيل لصفحة البنوك" text="هنا نظرة سريعة على أهم الأقسام فقط، ثم زر واضح يقودك إلى جميع البنوك بدون إغراق مبكر بالتفاصيل." align="right" />
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {bankHighlights.map((item) => (
                  <Card key={item.title} className="rounded-[2rem] border-white/80 bg-white/92">
                    <CardContent className="p-6">
                      <h3 className="display-font text-2xl font-bold text-slate-950">{item.title}</h3>
                      <p className="mt-3 text-sm leading-8 text-slate-600">{item.text}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-6">
                <Link href="/banks"><Button size="lg">استعرض جميع البنوك</Button></Link>
              </div>
            </Reveal>
            <div className="space-y-5">
              <Reveal delay={0.05}>
                <div className="surface-dark p-6">
                  <p className="text-sm text-white/70">الأسئلة الأكثر تدريبًا</p>
                  <div className="mt-5 grid gap-3">
                    {["التناظر اللفظي", "إكمال الجمل", "الخطأ السياقي", "القطع القصيرة"].map((item) => (
                      <div key={item} className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                        <div className="display-font text-lg font-bold text-white">{item}</div>
                        <div className="mt-1 text-sm text-white/70">محتوى حي يتحرك مع استخدام الطلاب</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
              <Reveal delay={0.08}>
                <Card className="rounded-[2rem] border-white/80 bg-white/92">
                  <CardContent className="p-6">
                    <p className="text-sm font-semibold text-slate-500">لماذا هذا أفضل للصفحة الرئيسية؟</p>
                    <div className="mt-4 space-y-3 text-sm leading-8 text-slate-600">
                      {[
                        "يوصل الفكرة بسرعة بدل فتح البحث والفلترة مبكرًا داخل الصفحة الرئيسية.",
                        "يترك صفحة البنوك المتخصصة للبحث العميق والتدريب التفصيلي.",
                        "يحافظ على سرعة الإقناع في الأعلى قبل الدخول إلى التفاصيل.",
                      ].map((item) => (
                        <div key={item} className="flex gap-2">
                          <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="section-shell" id="student">
          <div className="mx-auto w-[min(calc(100%-2rem),1180px)]">
            <Reveal><SectionTitle badge="تجربة الطالب" title="هذه أقوى نقطة في معيار: لوحة واضحة تقول لك ماذا تفعل الآن" text="الخطة، جلسة اليوم، شريط التقدم، وتوصيات المراجعة تظهر في مساحة واحدة أنيقة وواضحة." /></Reveal>
            <div className="mt-10 grid gap-6 lg:grid-cols-[1.18fr,0.82fr]">
              <Reveal>
                <Card className="rounded-[2.3rem] border-white/80 bg-white/92">
                  <CardContent className="space-y-6 p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div><p className="text-sm text-slate-500">الخطة الذكية تتغير معك</p><h3 className="display-font text-2xl font-bold text-slate-950">Dashboard يريك القرار التالي</h3></div>
                      <Link href="/dashboard"><Button variant="outline">شاهد تجربة الطالب</Button></Link>
                    </div>
                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="rounded-[1.7rem] border border-slate-200/80 bg-slate-50/80 p-5">
                        <p className="text-sm text-slate-500">شريط تقدم حي</p>
                        <div className="mt-4 space-y-4">{studentBars.map((item) => <div key={item.label} className="space-y-2"><div className="flex items-center justify-between text-sm"><span>{item.label}</span><span>{item.value}%</span></div><Progress value={item.value} /></div>)}</div>
                      </div>
                      <div className="rounded-[1.7rem] border border-slate-200/80 bg-slate-50/80 p-5">
                        <p className="text-sm text-slate-500">خطة هذا الأسبوع</p>
                        <div className="mt-4 space-y-3">{studentPlan.map((item) => <div key={item.day} className="rounded-[1.4rem] border border-slate-200/80 bg-white p-4"><div className="text-sm text-slate-500">{item.day}</div><div className="display-font mt-1 text-lg font-bold text-slate-950">{item.task}</div><Progress value={item.progress} className="mt-4" /></div>)}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
              <Reveal delay={0.05}>
                <div className="space-y-5">
                  <div className="surface-dark p-6"><p className="text-sm text-white/70">جلسة اليوم</p><div className="mt-4 grid gap-3">{["20 سؤال كمي", "15 سؤال لفظي", "مراجعة 8 أخطاء"].map((item) => <div key={item} className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4 text-white">{item}</div>)}</div></div>
                  <Card className="rounded-[2rem] border-white/80 bg-white/92"><CardContent className="p-6"><p className="text-sm font-semibold text-slate-500">توصية سريعة</p><div className="mt-4 space-y-3 text-sm leading-8 text-slate-600">{["ابدأ بالكمي إذا كان عندك وقت قصير اليوم.", "اجعل اللفظي بعده مباشرة لرفع التنوع الذهني.", "إذا تحسنت سرعتك، تتغير الأولويات تلقائيًا."].map((item) => <div key={item} className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50/80 p-4">{item}</div>)}</div></CardContent></Card>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="section-shell" id="interfaces">
          <div className="mx-auto w-[min(calc(100%-2rem),1180px)]">
            <Reveal><SectionTitle badge="عرض الواجهات" title="عرض بصري سريع للواجهات بدل قسم وصفي طويل" text="فكرة أقرب للـ slider: شاشات واضحة، عنوان بسيط، وانتقال سريع إلى كل واجهة." /></Reveal>
            <div className="mt-10 flex snap-x gap-5 overflow-x-auto pb-2">
              {interfaces.map((item, index) => (
                <Reveal key={item.title} delay={index * 0.04} className="min-w-[320px] flex-1 snap-start md:min-w-[360px]">
                  <Card className="h-full overflow-hidden rounded-[2.2rem] border-white/80 bg-white/92">
                    <div className="border-b border-slate-200/80 bg-[linear-gradient(145deg,rgba(18,59,122,0.08),rgba(201,161,91,0.14))] p-5">
                      <div className="rounded-[1.6rem] border border-white/80 bg-white/85 p-4 shadow-soft">
                        <div className="h-8 rounded-2xl bg-[linear-gradient(135deg,#123B7A,#C9A15B)]" />
                        <div className="mt-3 grid gap-2">
                          <div className="h-14 rounded-[1rem] bg-slate-100" />
                          <div className="grid gap-2 sm:grid-cols-2">
                            <div className="h-16 rounded-[1rem] bg-slate-100" />
                            <div className="h-16 rounded-[1rem] bg-slate-100" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,rgba(18,59,122,0.12),rgba(201,161,91,0.18))] text-[#123B7A]">
                          {index + 1}
                        </div>
                        <span className="mini-pill bg-amber-50 text-amber-700">واجهة أساسية</span>
                      </div>
                      <h3 className="display-font mt-5 text-xl font-bold text-slate-950">{item.title}</h3>
                      <p className="mt-3 text-sm leading-8 text-slate-600">{item.text}</p>
                      <Link href={item.href} className="mt-5 flex items-center justify-between rounded-[1.3rem] border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:bg-white"><span>{item.cta}</span><ArrowLeft className="h-4 w-4" /></Link>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell" id="testimonials">
          <div className="mx-auto w-[min(calc(100%-2rem),1180px)]">
            <Reveal><SectionTitle badge="آراء الطلاب" title="3 شهادات واضحة تكفي لبناء الثقة من غير إطالة" text="النتيجة، المدة، والانطباع عن الخطة تظهر مباشرة مثل أقوى صفحات المنصات التعليمية." /></Reveal>
            <div className="mt-10 grid gap-5 lg:grid-cols-3">{testimonials.map(([name, role, result, meta, quote], index) => <Reveal key={name} delay={index * 0.05}><Card className="h-full rounded-[2.2rem] border-white/80 bg-white/92"><CardContent className="p-6"><div className="flex items-start justify-between gap-4"><div><div className="display-font font-bold text-slate-950">{name}</div><div className="text-sm text-slate-500">{role}</div></div><div className="flex items-center gap-1 text-amber-500">{Array.from({ length: 5 }).map((_, starIndex) => <Star key={starIndex} className="h-4 w-4 fill-current" />)}</div></div><blockquote className="mt-5 text-base leading-9 text-slate-900">{quote}</blockquote><div className="mt-6 flex flex-wrap gap-2"><span className="mini-pill bg-[#123B7A]/5 text-[#123B7A]">{result}</span><span className="mini-pill bg-amber-50 text-amber-700">{meta}</span></div></CardContent></Card></Reveal>)}</div>
          </div>
        </section>

        <section className="section-shell pt-4">
          <div className="mx-auto grid w-[min(calc(100%-2rem),1180px)] gap-4 rounded-[2rem] bg-[linear-gradient(145deg,#0f264f,#123b7a_55%,#1f4c96)] p-5 text-white shadow-luxe md:grid-cols-4">{finalStats.map((item) => <div key={item.label} className="rounded-[1.4rem] border border-white/10 bg-white/5 p-5"><div className="display-font text-3xl font-bold">{item.value}</div><div className="mt-2 text-sm text-white/70">{item.label}</div></div>)}</div>
        </section>

        <section className="section-shell pt-2" id="cta">
          <div className="mx-auto w-[min(calc(100%-2rem),1180px)]">
            <Reveal>
              <Card className="overflow-hidden rounded-[2.5rem] border-0 bg-[radial-gradient(circle_at_top_left,rgba(18,59,122,0.10),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(201,161,91,0.12),transparent_18%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,247,244,0.94))] shadow-luxe">
                <CardContent className="flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center">
                  <div><span className="mini-pill bg-[#123B7A]/5 text-[#123B7A]">ابدأ رحلتك مع معيار</span><h2 className="section-title max-w-2xl text-right">جاهز تبدأ خطة ترفع درجتك؟</h2><p className="section-copy max-w-2xl text-right">ابدأ اليوم، ودع معيار يحدد لك ماذا تذاكر ومتى تراجع وكيف تتابع تقدمك في الكمي واللفظي.</p></div>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/exam"><Button size="lg" variant="secondary">ابدأ الآن</Button></Link>
                    <Link href="/dashboard"><Button size="lg" variant="outline">شاهد تجربة الطالب</Button></Link>
                    <Link href="/exam" className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-[#123B7A] transition hover:text-[#0f2f61]"><PlayCircle className="h-4 w-4" />اختبر مستواك الآن</Link>
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
