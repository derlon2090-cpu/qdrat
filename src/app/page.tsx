import Link from "next/link";
import { Star } from "lucide-react";

import { HeroShowcase } from "@/components/hero-showcase";
import { Reveal } from "@/components/reveal";
import { SectionTitle } from "@/components/section-title";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const whyBenefits = [
  {
    title: "بنوك واضحة للكمي واللفظي",
    text: "تصل للقسم المناسب بسرعة وتبدأ التدريب من المكان الصح.",
  },
  {
    title: "خطة تتغير مع مستواك",
    text: "جلساتك اليومية تتحرك حسب النتيجة والأخطاء والتقدم.",
  },
  {
    title: "مراجعة مرتبة بلا تشتيت",
    text: "المحفوظ والخاطئ والضعيف يدخلان في مسار واحد واضح.",
  },
  {
    title: "نماذج قريبة من الواقع",
    text: "اختبارات سريعة وكاملة قبل يوم الاختبار بواجهة مريحة.",
  },
];

const diagnosticPoints = [
  "تحدد نقطة البداية في دقائق قليلة.",
  "ترتب أولويات الكمي واللفظي مباشرة.",
  "تبني أول أسبوع من الخطة بعد النتيجة.",
];

const testimonials = [
  ["+18 درجة", "الخطة اختصرت عليّ الطريق وجعلت كل يوم أوضح من اليوم الذي قبله.", "رهف الشمري", "خلال 6 أسابيع"],
  ["ثقة أعلى", "لوحة الطالب بينت لي نقاط الضعف الحقيقية بدل ما أوزع جهدي عشوائيًا.", "عبدالله القحطاني", "قبل الاختبار النهائي"],
  ["+11 درجة", "المراجعة داخل معيار كانت أكثر ترتيبًا خصوصًا في اللفظي والأخطاء المتكررة.", "لمى الحربي", "مع مراجعة يومية"],
];

const productShots = [
  {
    title: "خطتي",
    text: "خطة اليوم وخطة الأسبوع والتوصيات في مساحة واحدة أوضح.",
    href: "/my-plan",
    cta: "عرض خطتي",
  },
  {
    title: "بنك الأسئلة",
    text: "بحث مباشر داخل نص السؤال مع بنوك مرتبة حسب القسم والمهارة.",
    href: "/question-bank",
    cta: "افتح البنك",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <SiteHeader ctaHref="/diagnostic" ctaLabel="ابدأ الآن" />

      <main>
        <section className="hero-school section-shell overflow-hidden" id="hero">
          <div className="mx-auto grid w-[min(calc(100%-2rem),1180px)] gap-12 lg:grid-cols-[0.96fr,1.04fr] lg:items-center">
            <Reveal>
              <span className="inline-flex rounded-full border border-white/18 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90">
                منصة قدرات للكمي واللفظي فقط
              </span>
              <h1 className="page-heading hero-title mt-6 text-white">
                تحضير أذكى للقدرات
                <span className="highlight block">الكمي واللفظي</span>
              </h1>
              <p className="hero-subtitle text-white/82">
                منصة تساعدك تقيس مستواك وتبني خطة واضحة بدون تشتيت.
              </p>
              <div className="hero-actions flex flex-wrap gap-3">
                <Link href="/diagnostic">
                  <Button size="lg" className="btn-primary">
                    ابدأ الآن
                  </Button>
                </Link>
                <Link href="/exam">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/20 bg-white/10 text-white hover:bg-white/15"
                  >
                    اختبر مستواك
                  </Button>
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.05}>
              <HeroShowcase />
            </Reveal>
          </div>
        </section>

        <section className="section-shell" id="diagnostic">
          <div className="mx-auto grid w-[min(calc(100%-2rem),1180px)] gap-6 lg:grid-cols-[0.9fr,1.1fr]">
            <Reveal>
              <Card className="rounded-[2.2rem] border border-[#E8D8B3] bg-[linear-gradient(180deg,#fffdfa,#f7f1e5)] shadow-soft">
                <CardContent className="p-8">
                  <span className="mini-pill bg-[#123B7A]/5 text-[#123B7A]">التشخيص السريع</span>
                  <h2 className="section-title max-w-2xl text-right">ابدأ من اختبار قصير يحدد نقطة البداية</h2>
                  <p className="section-copy max-w-2xl text-right">
                    تشخيص سريع يريك أين تبدأ الآن، ثم يرتب أولويات التدريب في الكمي واللفظي مباشرة.
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link href="/diagnostic">
                      <Button size="lg">ابدأ التشخيص</Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </Reveal>

            <Reveal delay={0.05}>
              <div className="grid gap-4 md:grid-cols-3">
                {diagnosticPoints.map((item, index) => (
                  <Card key={item} className="rounded-[2rem] border-white/80 bg-white/94 shadow-soft">
                    <CardContent className="p-7">
                      <div className="display-font mb-5 text-sm font-bold tracking-[0.18em] text-[#123B7A]">
                        0{index + 1}
                      </div>
                      <p className="card-text text-slate-700">{item}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </Reveal>
          </div>
        </section>

        <section className="section-shell" id="why">
          <div className="mx-auto w-[min(calc(100%-2rem),1180px)]">
            <Reveal>
              <SectionTitle
                badge="لماذا معيار"
                title="كل ما تحتاجه يظهر لك بشكل أخف وأوضح"
                text="4 مزايا أساسية فقط، ثم تنتقل مباشرة إلى التدريب عند الحاجة."
              />
            </Reveal>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {whyBenefits.map((item, index) => (
                <Reveal key={item.title} delay={index * 0.04}>
                  <Card className="rounded-[2rem] border-white/85 bg-white/95 shadow-soft">
                    <CardContent className="p-7 md:p-8">
                      <div className="flex items-start gap-4">
                        <div className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[linear-gradient(145deg,rgba(18,59,122,0.08),rgba(201,161,91,0.24))] text-lg font-bold text-[#123B7A]">
                          {index + 1}
                        </div>
                        <div>
                          <h3 className="display-font card-title font-bold text-slate-950">{item.title}</h3>
                          <p className="card-text text-slate-600">{item.text}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell" id="product">
          <div className="mx-auto w-[min(calc(100%-2rem),1180px)]">
            <Reveal>
              <SectionTitle
                badge="لقطات من المنتج"
                title="واجهتان واضحتان بدل شرح طويل"
                text="لمحة سريعة على الصفحات الأهم، ثم تنتقل مباشرة إلى الصفحة المناسبة."
              />
            </Reveal>
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {productShots.map((item, index) => (
                <Reveal key={item.title} delay={index * 0.05}>
                  <Card className="overflow-hidden rounded-[2.2rem] border-white/80 bg-white/95 shadow-soft">
                    <CardContent className="p-0">
                      <div className="border-b border-slate-100 bg-[linear-gradient(145deg,#123B7A,#1B3562)] p-7 text-white">
                        <div className="grid gap-3">
                          <div className="h-4 w-20 rounded-full bg-white/20" />
                          <div className="h-28 rounded-[1.5rem] bg-white/10" />
                          <div className="grid grid-cols-2 gap-3">
                            <div className="h-12 rounded-2xl bg-white/10" />
                            <div className="h-12 rounded-2xl bg-white/10" />
                          </div>
                        </div>
                      </div>
                      <div className="p-7">
                        <h3 className="display-font card-title font-bold text-slate-950">{item.title}</h3>
                        <p className="card-text text-slate-600">{item.text}</p>
                        <div className="mt-6">
                          <Link href={item.href}>
                            <Button variant="outline">{item.cta}</Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className="section-shell" id="testimonials">
          <div className="mx-auto w-[min(calc(100%-2rem),1180px)]">
            <Reveal>
              <SectionTitle
                badge="آراء الطلاب"
                title="آراء مختصرة تعكس وضوح التجربة وقوة الخطة"
                text="ثقة أعلى، تنظيم أوضح، وتجربة أسهل من أول استخدام."
              />
            </Reveal>
            <div className="mt-10">
              <div className="mb-6 flex justify-center">
                <span className="mini-pill border-[#CFE3D2] bg-[#F3F9F4] px-5 py-2 text-[#2C8B50]">
                  أكثر من 16,000 مستخدم
                </span>
              </div>
              <div className="grid gap-5 md:grid-cols-3">
                {testimonials.map(([result, quote, name, meta], index) => (
                  <Reveal key={`${name}-${index}`} delay={index * 0.04}>
                    <Card className="testimonial-card h-full overflow-hidden border-white/80 bg-white/95 shadow-soft">
                      <div className="mx-1 rounded-[1.2rem] bg-[linear-gradient(135deg,#123B7A,#1E56A0)] px-5 py-4 text-center text-2xl font-black text-white shadow-soft">
                        {result}
                      </div>
                      <CardContent className="p-0 pt-6">
                        <div className="flex items-center gap-1 text-amber-500">
                          {Array.from({ length: 5 }).map((_, starIndex) => (
                            <Star key={starIndex} className="h-4 w-4 fill-current" />
                          ))}
                        </div>
                        <blockquote className="testimonial-quote text-slate-900">{quote}</blockquote>
                        <div className="mt-5 border-t border-slate-100 pt-5">
                          <div className="display-font testimonial-name text-slate-950">{name}</div>
                          <div className="testimonial-role text-slate-500">{meta}</div>
                        </div>
                      </CardContent>
                    </Card>
                  </Reveal>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="section-shell" id="cta">
          <div className="mx-auto w-[min(calc(100%-2rem),1180px)]">
            <Reveal>
              <Card className="overflow-hidden rounded-[2.5rem] border border-[#E8D8B3] bg-[radial-gradient(circle_at_top_left,rgba(18,59,122,0.10),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(201,161,91,0.14),transparent_18%),linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,247,244,0.95))] shadow-luxe">
                <CardContent className="flex flex-col items-start justify-between gap-8 p-8 md:flex-row md:items-center md:p-10">
                  <div>
                    <span className="mini-pill bg-[#123B7A]/5 text-[#123B7A]">ابدأ رحلتك مع معيار</span>
                    <h2 className="section-title max-w-2xl text-right">جاهز تبدأ خطة ترفع درجتك؟</h2>
                    <p className="section-copy max-w-2xl text-right">
                      ابدأ اليوم، ودع معيار يحدد لك ماذا تذاكر ومتى تراجع وكيف تتابع تقدمك في الكمي واللفظي.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/diagnostic">
                      <Button size="lg" variant="secondary">
                        ابدأ الآن
                      </Button>
                    </Link>
                    <Link href="/exam">
                      <Button size="lg" variant="outline">
                        اختبر مستواك
                      </Button>
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
