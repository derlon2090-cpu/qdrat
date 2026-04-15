import Link from "next/link";
import { ArrowLeft, CheckCircle2, PlayCircle, Sparkles, Star } from "lucide-react";

import { HeroShowcase } from "@/components/hero-showcase";
import { Reveal } from "@/components/reveal";
import { SectionTitle } from "@/components/section-title";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const navLinks = [
  { href: "/#hero", label: "الرئيسية" },
  { href: "/#why", label: "لماذا معيار" },
  { href: "/#student", label: "تجربة الطالب" },
  { href: "/#testimonials", label: "آراء الطلاب" },
];

const trustCards = [
  ["25,000+ سؤال", "تدريب منظم على الكمي واللفظي داخل بنوك واضحة وسريعة الوصول."],
  ["120+ اختبار", "اختبارات محاكية تقيس مستواك قبل يوم الاختبار بأسلوب قريب من الواقع."],
  ["16,000+ طالب", "منصة عربية مرتبة تساعدك تلتزم بالخطة وتراجع بدون تشتيت."],
  ["خطة ذكية يومية", "تعرف اليوم ماذا تبدأ به، ومتى تراجع، ومتى تنتقل للاختبار."],
];

const bankHighlights = [
  { title: "الكمي", text: "تدريب منظم على أهم أفكار وأسئلة القدرات الكمي." },
  { title: "اللفظي", text: "بنوك لفظي واضحة تغطي الاستيعاب، التناظر، والسياق." },
  { title: "الاختبارات", text: "اختبارات محاكية كاملة تقيس مستواك قبل يوم الاختبار." },
  { title: "المراجعة", text: "مسار خاص للأسئلة الخاطئة والمحفوظه والضعيفة." },
];

const mostTrained = ["التناظر اللفظي", "إكمال الجمل", "الخطأ السياقي", "القطع القصيرة"];

const whyReasons = [
  "منصة واضحة ومختصرة تختصر عليك طريق القدرات بدل التنقل بين مصادر كثيرة.",
  "قاعدة أسئلة كبيرة تتحرك مع التدريب وتخدم الكمي واللفظي داخل نفس التجربة.",
  "خطة ذكية ومراجعة مرتبة تجعلك تعرف القرار التالي بدون تشتت.",
];

const diagnosticPoints = [
  "يعطيك نقطة بداية واضحة بدل المذاكرة العشوائية.",
  "يرتب أولويات الكمي واللفظي حسب مستواك الحالي.",
  "يبني أول أسبوع من الخطة بناءً على النتيجة.",
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

const interfaces = [
  {
    title: "التشخيص السريع",
    text: "واجهة قصيرة تحدد مستواك وتبدأ منها الخطة الذكية بدل التخمين.",
    href: "/exam",
    cta: "ابدأ التشخيص",
  },
  {
    title: "الصفحة الرئيسية",
    text: "Landing مرتبة برسالة مباشرة، مزايا واضحة، وآراء تعطي ثقة من أول شاشة.",
    href: "/",
    cta: "عرض الصفحة",
  },
  {
    title: "صفحة بنوك الأسئلة",
    text: "استعراض البنوك والبحث العميق والفلترة حسب النوع والمهارة والصعوبة.",
    href: "/banks",
    cta: "فتح البنوك",
  },
  {
    title: "لوحة الطالب",
    text: "خطة الأسبوع، التقدم، جلسة اليوم، وتوصيات المراجعة في مكان واحد.",
    href: "/dashboard",
    cta: "شاهد اللوحة",
  },
];

const testimonials = [
  ["رهف الشمري", "طالبة قدرات", "+18 درجة", "خلال 6 أسابيع", "الخطة كانت واضحة جدًا، وكل يوم أعرف ماذا أبدأ به بدل التشتت بين الأقسام."],
  ["عبدالله القحطاني", "طالب ثالث ثانوي", "ثقة أعلى", "قبل الاختبار النهائي", "لوحة الطالب أوضحت لي نقاط الضعف الحقيقية، وصار القرار التالي واضحًا جدًا."],
  ["لمى الحربي", "مستخدمة مستمرة", "+11 درجة", "مع مراجعة يومية", "المراجعة صارت مرتبة أكثر من أي تجربة سابقة، خصوصًا في اللفظي والأخطاء المتكررة."],
];

const testimonialColors = [
  "bg-[linear-gradient(135deg,#123B7A,#1E56A0)]",
  "bg-[linear-gradient(135deg,#C99A43,#B78122)]",
  "bg-[linear-gradient(135deg,#1C3767,#315DA6)]",
];

const testimonialAvatars = [
  "from-[#123B7A] to-[#2D67B4]",
  "from-[#C99A43] to-[#D9B26A]",
  "from-[#26497F] to-[#16315E]",
];

const heroMetrics = ["25,000+ سؤال", "120+ اختبار", "16,000+ طالب", "خطة ذكية يومية"];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader links={navLinks} ctaHref="/#cta" ctaLabel="ابدأ الآن" />

      <main>
        <section className="hero-school section-shell overflow-hidden pb-12 pt-10 md:pt-16" id="hero">
          <div className="mx-auto grid w-[min(calc(100%-2rem),1180px)] gap-12 lg:grid-cols-[0.96fr,1.04fr] lg:items-center">
            <Reveal>
              <span className="inline-flex rounded-full border border-white/18 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90">
                منصة قدرات كمي ولفظي فقط
              </span>
              <h1 className="page-heading mt-6 max-w-3xl text-white">
                تحضير أذكى للقدرات
                <span className="block text-[#F6D28B]">الكمي واللفظي</span>
                بخطة يومية واختبارات تحاكي الواقع
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-9 text-white/82">
                منصة عربية حديثة تساعدك تعرف مستواك، تمشي بخطة واضحة، وتتدرج في الكمي واللفظي حتى يوم
                الاختبار بدون تشتيت.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href="#cta">
                  <Button size="lg" variant="secondary">
                    ابدأ الآن
                  </Button>
                </Link>
                <Link href="#student">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/20 bg-white/10 text-white hover:bg-white/15"
                  >
                    شاهد تجربة الطالب
                  </Button>
                </Link>
              </div>
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <Link
                  href="/exam"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-white transition hover:text-[#F6D28B]"
                >
                  <PlayCircle className="h-4 w-4" />
                  اختبر مستواك الآن
                </Link>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                {heroMetrics.map((item) => (
                  <span
                    key={item}
                    className="rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white shadow-soft backdrop-blur"
                  >
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
                <Card className="rounded-[2rem] border-white/80 bg-white/92 shadow-soft">
                  <CardContent className="p-6">
                    <div className="display-font text-3xl font-bold text-[#123B7A]">{value}</div>
                    <div className="mt-3 text-base leading-8 text-slate-600">{label}</div>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
        </section>

        <section className="section-shell" id="why">
          <div className="mx-auto grid w-[min(calc(100%-2rem),1180px)] gap-8 lg:grid-cols-[1.12fr,0.88fr]">
            <Reveal>
              <SectionTitle
                badge="لماذا معيار"
                title="اختصرنا الصفحة الرئيسية، وتركنا التفاصيل لصفحة البنوك"
                text="هنا نظرة سريعة على أهم الأقسام فقط، ثم زر واضح يقودك إلى جميع البنوك بدون إغراق مبكر بالتفاصيل."
                align="right"
              />
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {bankHighlights.map((item, index) => (
                  <Card key={item.title} className="rounded-[2rem] border-white/80 bg-white/94 shadow-soft">
                    <CardContent className="p-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,rgba(18,59,122,0.08),rgba(201,161,91,0.22))] text-lg font-bold text-[#123B7A]">
                        {index + 1}
                      </div>
                      <h3 className="display-font mt-5 text-2xl font-bold text-slate-950">{item.title}</h3>
                      <p className="mt-3 text-sm leading-8 text-slate-600">{item.text}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-6">
                <Link href="/banks">
                  <Button size="lg">استعرض جميع البنوك</Button>
                </Link>
              </div>
            </Reveal>

            <div className="space-y-5">
              <Reveal delay={0.05}>
                <Card className="rounded-[2.1rem] border border-[#E8D8B3] bg-[linear-gradient(180deg,#fffdfa,#f8f3ea)] shadow-soft">
                  <CardContent className="p-6">
                    <div className="grid gap-4">
                      {whyReasons.map((item, index) => (
                        <div key={item} className="flex items-center gap-4 rounded-[1.6rem] border border-[#EADFC8] bg-white/90 px-5 py-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(145deg,rgba(18,59,122,0.10),rgba(201,161,91,0.24))] text-[#C99A43]">
                            <Sparkles className="h-5 w-5" />
                          </div>
                          <p className="text-base leading-8 text-slate-800">{item}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </Reveal>

              <Reveal delay={0.08}>
                <div className="surface-dark p-6">
                  <p className="text-sm text-white/70">الأسئلة الأكثر تدريبًا</p>
                  <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    {mostTrained.map((item) => (
                      <div key={item} className="rounded-[1.4rem] border border-white/10 bg-white/6 p-4">
                        <div className="display-font text-lg font-bold text-white">{item}</div>
                        <div className="mt-1 text-sm text-white/70">محتوى حي يتحرك مع استخدام الطلاب</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="section-shell pt-2" id="diagnostic">
          <div className="mx-auto grid w-[min(calc(100%-2rem),1180px)] gap-6 lg:grid-cols-[0.9fr,1.1fr]">
            <Reveal>
              <Card className="rounded-[2.2rem] border border-[#E8D8B3] bg-[linear-gradient(180deg,#fffdfa,#f7f1e5)] shadow-soft">
                <CardContent className="p-7">
                  <span className="mini-pill bg-[#123B7A]/5 text-[#123B7A]">التشخيص السريع</span>
                  <h2 className="section-title max-w-2xl text-right">ابدأ بتشخيص يحدد المسار قبل أي خطة</h2>
                  <p className="section-copy max-w-2xl text-right">
                    بدل البدء العشوائي، خذ اختبارًا تشخيصيًا قصيرًا يبين لك أين تبدأ في الكمي واللفظي
                    ويغذي الخطة الذكية مباشرة.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link href="/exam">
                      <Button size="lg">ابدأ التشخيص</Button>
                    </Link>
                    <Link href="/dashboard">
                      <Button size="lg" variant="outline">
                        شاهد كيف تتغير الخطة
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </Reveal>

            <Reveal delay={0.05}>
              <div className="grid gap-4 md:grid-cols-3">
                {diagnosticPoints.map((item, index) => (
                  <Card key={item} className="rounded-[2rem] border-white/80 bg-white/94 shadow-soft">
                    <CardContent className="p-6">
                      <div className="display-font text-sm font-bold tracking-[0.18em] text-[#123B7A]">
                        0{index + 1}
                      </div>
                      <p className="mt-4 text-base leading-8 text-slate-700">{item}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section className="section-shell" id="student">
          <div className="mx-auto w-[min(calc(100%-2rem),1180px)]">
            <Reveal>
              <SectionTitle
                badge="تجربة الطالب"
                title="هذه أقوى نقطة في معيار: لوحة واضحة تقول لك ماذا تفعل الآن"
                text="الخطة، جلسة اليوم، شريط التقدم، وتوصيات المراجعة تظهر في مساحة واحدة أنيقة وواضحة."
              />
            </Reveal>
            <div className="mt-10 grid gap-6 lg:grid-cols-[1.18fr,0.82fr]">
              <Reveal>
                <Card className="rounded-[2.3rem] border-white/80 bg-white/94 shadow-soft">
                  <CardContent className="space-y-6 p-6">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-slate-500">الخطة الذكية تتغير معك</p>
                        <h3 className="display-font text-2xl font-bold text-slate-950">
                          Dashboard يريك القرار التالي
                        </h3>
                      </div>
                      <Link href="/dashboard">
                        <Button variant="outline">شاهد تجربة الطالب</Button>
                      </Link>
                    </div>
                    <div className="grid gap-5 md:grid-cols-2">
                      <div className="rounded-[1.7rem] border border-slate-200/80 bg-slate-50/80 p-5">
                        <p className="text-sm text-slate-500">شريط تقدم حي</p>
                        <div className="mt-4 space-y-4">
                          {studentBars.map((item) => (
                            <div key={item.label} className="space-y-2">
                              <div className="flex items-center justify-between text-sm">
                                <span>{item.label}</span>
                                <span>{item.value}%</span>
                              </div>
                              <Progress value={item.value} />
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-[1.7rem] border border-slate-200/80 bg-slate-50/80 p-5">
                        <p className="text-sm text-slate-500">خطة هذا الأسبوع</p>
                        <div className="mt-4 space-y-3">
                          {studentPlan.map((item) => (
                            <div
                              key={item.day}
                              className="rounded-[1.4rem] border border-slate-200/80 bg-white p-4"
                            >
                              <div className="text-sm text-slate-500">{item.day}</div>
                              <div className="display-font mt-1 text-lg font-bold text-slate-950">
                                {item.task}
                              </div>
                              <Progress value={item.progress} className="mt-4" />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Reveal>
              <Reveal delay={0.05}>
                <div className="space-y-5">
                  <div className="surface-dark p-6">
                    <p className="text-sm text-white/70">جلسة اليوم</p>
                    <div className="mt-4 grid gap-3">
                      {["20 سؤال كمي", "15 سؤال لفظي", "مراجعة 8 أخطاء"].map((item) => (
                        <div
                          key={item}
                          className="rounded-[1.4rem] border border-white/10 bg-white/6 p-4 text-white"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                  <Card className="rounded-[2rem] border-white/80 bg-white/94 shadow-soft">
                    <CardContent className="p-6">
                      <p className="text-sm font-semibold text-slate-500">توصية سريعة</p>
                      <div className="mt-4 space-y-3 text-sm leading-8 text-slate-600">
                        {[
                          "ابدأ بالكمي إذا كان عندك وقت قصير اليوم.",
                          "اجعل اللفظي بعده مباشرة لرفع التنوع الذهني.",
                          "إذا تحسنت سرعتك، تتغير الأولويات تلقائيًا.",
                        ].map((item) => (
                          <div
                            key={item}
                            className="rounded-[1.4rem] border border-slate-200/80 bg-slate-50/80 p-4"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        <section className="section-shell" id="interfaces">
          <div className="mx-auto w-[min(calc(100%-2rem),1180px)]">
            <Reveal>
              <SectionTitle
                badge="عرض الواجهات"
                title="أربع شاشات أساسية فقط بدل عرض طويل ومزدحم"
                text="عرض بصري سريع يوصلك للفكرة بسرعة: التشخيص، الرئيسية، البنوك، ولوحة الطالب."
              />
            </Reveal>
            <div className="mt-10 flex snap-x gap-5 overflow-x-auto pb-3">
              {interfaces.map((item, index) => (
                <Reveal key={item.title} delay={index * 0.04} className="min-w-[285px] max-w-[285px] flex-none snap-start md:min-w-[300px] md:max-w-[300px]">
                  <Card className="h-full overflow-hidden rounded-[2.2rem] border-white/80 bg-white/94 shadow-soft">
                    <div className="border-b border-slate-200/80 bg-[linear-gradient(145deg,rgba(18,59,122,0.08),rgba(201,161,91,0.16))] p-5">
                      <div className="rounded-[1.7rem] border border-white/80 bg-white/90 p-4 shadow-soft">
                        <div className="flex items-center justify-between">
                          <div className="h-8 w-28 rounded-2xl bg-[linear-gradient(135deg,#123B7A,#C9A15B)]" />
                          <div className="h-3 w-12 rounded-full bg-slate-200" />
                        </div>
                        <div className="mt-3 grid gap-2">
                          <div className="h-28 rounded-[1.1rem] bg-[linear-gradient(180deg,#eef3fb,#f7efe1)]" />
                          <div className="grid gap-2 sm:grid-cols-2">
                            <div className="h-12 rounded-[1rem] bg-slate-100" />
                            <div className="h-12 rounded-[1rem] bg-slate-100" />
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
                      <Link
                        href={item.href}
                        className="mt-5 flex items-center justify-between rounded-[1.3rem] border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm font-semibold text-slate-800 transition hover:-translate-y-0.5 hover:bg-white"
                      >
                        <span>{item.cta}</span>
                        <ArrowLeft className="h-4 w-4" />
                      </Link>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-center gap-2">
              {interfaces.map((item, index) => (
                <span
                  key={item.title}
                  className={`h-2.5 rounded-full ${index === 0 ? "w-8 bg-[#123B7A]" : "w-2.5 bg-slate-300"}`}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell" id="testimonials">
          <div className="mx-auto w-[min(calc(100%-2rem),1180px)]">
            <Reveal>
              <SectionTitle
                badge="آراء الطلاب"
                title="آراء مرتبة وواضحة تعكس سهولة الاستخدام وقوة الخطة"
                text="أبقيناها مختصرة وواضحة حتى تعطي الثقة بدون إطالة، وبألوان متناسقة مع هوية معيار الجديدة."
              />
            </Reveal>
            <div className="mt-10">
              <div className="mb-6 flex justify-center">
                <span className="mini-pill border-[#CFE3D2] bg-[#F3F9F4] px-5 py-2 text-[#2C8B50]">
                  أكثر من 16,000 مستخدم
                </span>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
              {testimonials.map(([name, role, result, meta, quote], index) => (
                <Reveal key={`${name}-${index}`} delay={index * 0.04}>
                  <Card className="h-full overflow-hidden rounded-[2.2rem] border-white/80 bg-white/95 shadow-soft">
                    <div
                      className={`mx-5 mt-5 rounded-[1.2rem] px-5 py-4 text-center text-2xl font-black text-white shadow-soft ${testimonialColors[index % testimonialColors.length]}`}
                    >
                      {result}
                    </div>
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <div className="display-font font-bold text-slate-950">{name}</div>
                          <div className="text-sm text-slate-500">{role}</div>
                        </div>
                        <div className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br text-sm font-black text-white ${testimonialAvatars[index % testimonialAvatars.length]}`}>
                          {name.slice(0, 1)}
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-1 text-amber-500">
                          {Array.from({ length: 5 }).map((_, starIndex) => (
                            <Star key={starIndex} className="h-4 w-4 fill-current" />
                          ))}
                        </div>
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                          {meta}
                        </span>
                      </div>
                      <blockquote className="mt-5 text-base leading-9 text-slate-900">{quote}</blockquote>
                      <div className="mt-6 border-t border-slate-100 pt-4 text-sm font-semibold text-[#123B7A]">
                        {meta}
                      </div>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell pt-2" id="cta">
          <div className="mx-auto w-[min(calc(100%-2rem),1180px)]">
            <Reveal>
              <Card className="overflow-hidden rounded-[2.5rem] border border-[#E8D8B3] bg-[radial-gradient(circle_at_top_left,rgba(18,59,122,0.10),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(201,161,91,0.14),transparent_18%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,247,244,0.95))] shadow-luxe">
                <CardContent className="flex flex-col items-start justify-between gap-6 p-8 md:flex-row md:items-center">
                  <div>
                    <span className="mini-pill bg-[#123B7A]/5 text-[#123B7A]">ابدأ رحلتك مع معيار</span>
                    <h2 className="section-title max-w-2xl text-right">جاهز تبدأ خطة ترفع درجتك؟</h2>
                    <p className="section-copy max-w-2xl text-right">
                      ابدأ اليوم، ودع معيار يحدد لك ماذا تذاكر ومتى تراجع وكيف تتابع تقدمك في الكمي
                      واللفظي.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/exam">
                      <Button size="lg" variant="secondary">
                        ابدأ الآن
                      </Button>
                    </Link>
                    <Link href="/dashboard">
                      <Button size="lg" variant="outline">
                        شاهد تجربة الطالب
                      </Button>
                    </Link>
                    <Link
                      href="/exam"
                      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold text-[#123B7A] transition hover:text-[#0f2f61]"
                    >
                      <PlayCircle className="h-4 w-4" />
                      اختبر مستواك الآن
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </section>

        <SiteFooter />
      </main>
    </div>
  );
}
