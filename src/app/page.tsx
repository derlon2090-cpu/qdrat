import Image from "next/image";
import Link from "next/link";
import { PlayCircle, Star } from "lucide-react";

import { HeroShowcase } from "@/components/hero-showcase";
import { Reveal } from "@/components/reveal";
import { SectionTitle } from "@/components/section-title";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const navLinks = [
  { href: "/#hero", label: "الرئيسية" },
  { href: "/#why", label: "لماذا معيار" },
  { href: "/#diagnostic", label: "التشخيص" },
  { href: "/#testimonials", label: "آراء الطلاب" },
];

const whyBenefits = [
  {
    title: "أسئلة متنوعة واختبارات محاكية لزيادة تحضيرك",
    text: "هنا تلقى أكبر تنوع من أسئلة الكمي واللفظي، وتقدر تسوي اختبارات سريعة أو كاملة تعزز فهمك.",
  },
  {
    title: "خطة مذاكرة تناسب مستواك بالضبط",
    text: "الخطة اليومية والأسبوعية تتغير حسب مستواك ونتيجتك، بدل جدول ثابت لا يناسب الجميع.",
  },
  {
    title: "مراجعة مرتبة لكل ما حفظته أو أخطأت فيه",
    text: "أي سؤال يحتاج مراجعة يرجع لك في مسار واضح، حتى توصل له بسهولة بدون ضياع بين الأقسام.",
  },
  {
    title: "نماذج جاهزة للتدريب قبل يوم الاختبار",
    text: "ابدأ من نماذج كاملة أو مصغرة بسرعة، ثم انتقل للبنوك التفصيلية عندما تحتاج تدريبًا أعمق.",
  },
];

const diagnosticPoints = [
  "يعطيك نقطة بداية واضحة بدل المذاكرة العشوائية.",
  "يرتب أولويات الكمي واللفظي حسب مستواك الحالي.",
  "يبني أول أسبوع من الخطة بناءً على النتيجة.",
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
                <Link href="/banks">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/20 bg-white/10 text-white hover:bg-white/15"
                  >
                    استعرض البنوك
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
            </Reveal>

            <Reveal delay={0.05}>
              <HeroShowcase />
            </Reveal>
          </div>
        </section>

        <section className="section-shell" id="why">
          <div className="mx-auto w-[min(calc(100%-2rem),1180px)]">
            <Reveal>
              <SectionTitle
                badge="لماذا معيار"
                title="كل ما تحتاجه للتحضير يظهر لك بشكل أوضح وأخف"
                text="رتبنا البداية بحيث تعرف الفكرة بسرعة: مزايا واضحة، واجهة أهدأ، ثم تنتقل للتفاصيل عند الحاجة."
              />
            </Reveal>
            <div className="mt-10 grid gap-8 lg:grid-cols-[1.05fr,0.95fr] lg:items-start">
              <div className="space-y-5">
                {whyBenefits.map((item, index) => (
                  <Reveal key={item.title} delay={index * 0.04}>
                    <Card className="rounded-[2rem] border-white/85 bg-white/95 shadow-soft">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(145deg,rgba(18,59,122,0.08),rgba(201,161,91,0.24))] text-lg font-bold text-[#123B7A]">
                            {index + 1}
                          </div>
                          <div>
                            <h3 className="display-font text-2xl font-bold text-slate-950">{item.title}</h3>
                            <p className="mt-3 text-base leading-8 text-slate-600">{item.text}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Reveal>
                ))}
              </div>

              <Reveal delay={0.05}>
                <Card className="overflow-hidden rounded-[2.3rem] border border-[#E8D8B3] bg-[linear-gradient(180deg,#fffdfa,#f7f1e5)] shadow-soft">
                  <CardContent className="p-8">
                    <div className="rounded-[2rem] bg-[linear-gradient(180deg,#fff4cf,#ffd86f)] p-6">
                      <div className="relative mx-auto overflow-hidden rounded-[2rem] border-4 border-[#0F325F] bg-[linear-gradient(180deg,#ffe293,#ffd55f)]">
                        <div className="relative h-[420px] w-full">
                          <Image
                            src="/why-miyaar-art.png"
                            alt="تبغى أقولك ليش معيار"
                            fill
                            className="object-cover object-center"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 rounded-[1.8rem] bg-[linear-gradient(145deg,#123B7A,#1C4F96)] px-5 py-5 text-center text-lg font-bold leading-8 text-white">
                      بداية أوضح، وترتيب أخف، ثم انتقال مباشر إلى البنوك أو التشخيص بدون ازدحام.
                    </div>
                  </CardContent>
                </Card>
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
                    <Link href="/banks">
                      <Button size="lg" variant="outline">
                        انتقل إلى البنوك
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
                    <Link href="/banks">
                      <Button size="lg" variant="outline">
                        استعرض البنوك
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
