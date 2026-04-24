"use client";

import Link from "next/link";
import {
  ArrowLeft,
  BadgeCheck,
  BarChart3,
  BookOpen,
  BookText,
  CalendarCheck2,
  CalendarDays,
  ChevronDown,
  Headphones,
  Mail,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Trophy,
  TriangleAlert,
  Users,
} from "lucide-react";

import { HomeAuthRedirect } from "@/components/home-auth-redirect";
import { MiyaarLogo } from "@/components/miyaar-logo";
import {
  PublicLaptopIllustration,
  PublicNewsletterIllustration,
} from "@/components/public-site-illustrations";
import { SiteHeader } from "@/components/site-header";

const navLinks = [
  { href: "/", label: "الرئيسية", active: true },
  { href: "/question-bank", label: "بنك الأسئلة" },
  { href: "/plans", label: "الخطط" },
  { href: "/summary-center", label: "الملخصات" },
  { href: "/pricing", label: "الأسعار" },
  { href: "/competitions", label: "المسابقات" },
  { href: "/wall-of-love", label: "تجارب الطلاب" },
];

const topStats = [
  { value: "+120K", label: "طالب وطالبة", icon: Users, tone: "text-[#2563eb] bg-[#eef4ff]" },
  { value: "+1.5M", label: "سؤال تمت الإجابة عليه", icon: TrendingUp, tone: "text-[#22c55e] bg-[#ebfbf0]" },
  { value: "4.9/5", label: "تقييم الطلاب", icon: Star, tone: "text-[#f59e0b] bg-[#fff4df]" },
  { value: "+300", label: "ملخص شامل", icon: BookOpen, tone: "text-[#8b5cf6] bg-[#f4ebff]" },
];

const features = [
  {
    title: "خطط دراسية ذكية",
    text: "خطة مخصصة حسب مستواك ووقتك لتصل إلى هدفك.",
    cta: "عرض الخطط",
    href: "/plans",
    icon: CalendarCheck2,
    tone: "text-[#22c55e] bg-[#ebfbf0]",
  },
  {
    title: "بنك الأسئلة",
    text: "آلاف الأسئلة مع الحلول التفصيلية والتصنيفات الذكية.",
    cta: "تصفح الأسئلة",
    href: "/question-bank",
    icon: BookText,
    tone: "text-[#2563eb] bg-[#eef4ff]",
  },
  {
    title: "مسابقات وتحديات",
    text: "شارك في المسابقات الأسبوعية واختر مستواك بين الطلاب.",
    cta: "استكشف المسابقات",
    href: "/competitions",
    icon: Trophy,
    tone: "text-[#8b5cf6] bg-[#f4ebff]",
  },
  {
    title: "إحصائيات دقيقة",
    text: "تابع تقدمك وتحليل أدائك بشكل تفصيلي وواضح.",
    cta: "عرض الإحصائيات",
    href: "/statistics",
    icon: BarChart3,
    tone: "text-[#8b5cf6] bg-[#f4ebff]",
  },
  {
    title: "أخطاء شائعة",
    text: "تعلّم من أخطائك السابقة وتجنب تكرارها في اختبارك.",
    cta: "تصفح الأخطاء",
    href: "/question-bank?track=mistakes",
    icon: TriangleAlert,
    tone: "text-[#ef4444] bg-[#fff1f2]",
  },
  {
    title: "ملخصات مركزة",
    text: "ملخصات شاملة ومبسطة لجميع الموضوعات المهمة.",
    cta: "استعرض الملخصات",
    href: "/summary-center",
    icon: BookOpen,
    tone: "text-[#f59e0b] bg-[#fff4df]",
  },
];

const steps = [
  {
    title: "أنشئ حسابك",
    text: "سجل دخولك وابدأ رحلتك التعليمية معنا.",
    icon: Users,
    tone: "text-[#2563eb] bg-[#eef4ff]",
  },
  {
    title: "اختر خطتك",
    text: "اختر الخطة المناسبة لمستواك وهدفك.",
    icon: CalendarCheck2,
    tone: "text-[#2563eb] bg-[#eef4ff]",
  },
  {
    title: "ابدأ التعلم",
    text: "حل الأسئلة، تابع تقدمك، واصل لأعلى الدرجات.",
    icon: BadgeCheck,
    tone: "text-[#2563eb] bg-[#eef4ff]",
  },
];

const testimonials = [
  {
    text: "الخطة الدراسية المنظمة وفرت علي وقت كثير وأصبح كل طالب يجرب يرى معيار.",
    name: "محمد الشهري",
    score: "الدرجة: 97",
  },
  {
    text: "بنك الأسئلة قوي جدًا، والتصنيفات ساعدتني أركز على نقاط ضعفي واختباري كان أفضل.",
    name: "سارة العتيبي",
    score: "الدرجة: 96",
  },
  {
    text: "الملخصات في معيار كانت سببًا رئيسيًا في فهمي السريع للمفاهيم وحل العديد من الأسئلة.",
    name: "عبدالله الحربي",
    score: "الدرجة: 98",
  },
];

const whyChoose = [
  {
    title: "محتوى عالي الجودة",
    text: "محتوى مخصص من نخبة المتخصصين.",
    icon: BadgeCheck,
  },
  {
    title: "تحديثات مستمرة",
    text: "تطور المحتوى والأسئلة بشكل دوري.",
    icon: Sparkles,
  },
  {
    title: "دعم مستمر",
    text: "فريق الدعم جاهز لمساعدتك في أي وقت.",
    icon: Headphones,
  },
  {
    title: "موثوق وآمن",
    text: "بيئة آمنة لحسابك وبياناتك الخاصة.",
    icon: ShieldCheck,
  },
];

export default function HomePage() {
  return (
    <div dir="rtl" className="min-h-screen bg-[#f8fbff] text-slate-900">
      <HomeAuthRedirect />

      <SiteHeader variant="public" links={navLinks} />

      <main>
        <section className="overflow-hidden border-b border-[#edf2fb] bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.08),transparent_26%),linear-gradient(180deg,#ffffff_0%,#fbfdff_100%)]">
          <div className="mx-auto grid w-[min(calc(100%-1.5rem),1280px)] gap-10 px-1 py-12 sm:w-[min(calc(100%-2rem),1280px)] lg:grid-cols-[1.02fr,0.98fr] lg:items-center lg:py-16">
            <div className="order-2 lg:order-1">
              <PublicLaptopIllustration />
            </div>

            <div className="order-1 lg:order-2">
              <div className="text-right">
                <div className="text-[1.7rem] font-bold text-slate-800">
                  معيار.. طريقك الذكي
                </div>
                <h1 className="mt-3 display-font text-[clamp(2.7rem,5vw,4.9rem)] font-black leading-[1.18] text-[#0f2f69]">
                  نحو أعلى الدرجات
                </h1>
                <p className="mt-5 max-w-2xl text-[1.08rem] leading-9 text-slate-500">
                  منصة تعليمية متكاملة تساعدك على الاستعداد لاختبار القدرات بأحدث
                  الأساليب وأفضل المحتويات.
                </p>

                <div className="mt-8 flex flex-wrap gap-4">
                  <Link
                    href="/diagnostic"
                    className="inline-flex h-[58px] min-w-[178px] items-center justify-center rounded-[1rem] bg-[#2563eb] px-7 text-[1rem] font-bold text-white shadow-[0_14px_26px_rgba(37,99,235,0.22)] transition hover:bg-[#1d4ed8]"
                  >
                    ابدأ الآن مجانًا
                  </Link>
                  <Link
                    href="/question-bank"
                    className="inline-flex h-[58px] min-w-[178px] items-center justify-center rounded-[1rem] border border-[#cfe0ff] bg-white px-7 text-[1rem] font-bold text-[#2563eb] transition hover:bg-[#f8fbff]"
                  >
                    استكشف بنك الأسئلة
                  </Link>
                </div>

                <div className="mt-8 flex flex-wrap gap-7 text-sm font-medium text-slate-500">
                  <div className="inline-flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-[#2563eb]" />
                    آلاف الأسئلة المحلولة
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <BadgeCheck className="h-4 w-4 text-[#2563eb]" />
                    شرح مبسط واحترافي
                  </div>
                  <div className="inline-flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-[#2563eb]" />
                    تحديثات مستمرة
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="pb-7 text-center">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[#e2e8f8] bg-white text-slate-500 shadow-[0_10px_24px_rgba(15,23,42,0.06)]">
              <ChevronDown className="h-5 w-5" />
            </span>
          </div>
        </section>

        <section className="mx-auto -mt-4 w-[min(calc(100%-1.5rem),1200px)] sm:w-[min(calc(100%-2rem),1200px)]">
          <div className="grid gap-0 overflow-hidden rounded-[1.8rem] border border-[#e6edf9] bg-white shadow-[0_18px_42px_rgba(15,23,42,0.04)] md:grid-cols-4">
            {topStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div
                  key={stat.label}
                  className={`px-6 py-8 text-center ${index !== topStats.length - 1 ? "border-b border-[#eef3fb] md:border-b-0 md:border-l" : ""}`}
                >
                  <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${stat.tone}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="mt-4 display-font text-[2.2rem] font-extrabold text-[#0f2f69]">{stat.value}</div>
                  <div className="mt-2 text-[1rem] font-semibold text-slate-500">{stat.label}</div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto w-[min(calc(100%-1.5rem),1180px)] px-1 py-16 sm:w-[min(calc(100%-2rem),1180px)]">
          <div className="text-center">
            <h2 className="display-font text-[2.35rem] font-black text-[#0f2f69]">كل ما تحتاجه في مكان واحد</h2>
            <p className="mt-3 text-[1.05rem] text-slate-500">أدوات ذكية ومحتوى احترافي لخطة دراسة ناجحة</p>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={feature.title}
                  href={feature.href}
                  className="rounded-[1.7rem] border border-[#e6edf9] bg-white p-8 text-center shadow-[0_16px_34px_rgba(15,23,42,0.04)] transition hover:-translate-y-1 hover:shadow-[0_20px_38px_rgba(15,23,42,0.08)]"
                >
                  <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${feature.tone}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 display-font text-[1.45rem] font-bold text-[#0f2f69]">{feature.title}</h3>
                  <p className="mt-3 text-[1rem] leading-8 text-slate-500">{feature.text}</p>
                  <div className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-[#2563eb]">
                    <ArrowLeft className="h-4 w-4" />
                    {feature.cta}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mx-auto w-[min(calc(100%-1.5rem),1120px)] px-1 py-4 sm:w-[min(calc(100%-2rem),1120px)]">
          <div className="text-center">
            <h2 className="display-font text-[2.2rem] font-black text-[#0f2f69]">كيف تبدأ رحلتك مع معيار؟</h2>
            <p className="mt-3 text-[1.04rem] text-slate-500">ثلاث خطوات بسيطة للتميز</p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.title} className="relative rounded-[1.7rem] border border-[#e6edf9] bg-white p-7 shadow-[0_16px_34px_rgba(15,23,42,0.04)]">
                  <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${step.tone}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 display-font text-center text-[1.4rem] font-bold text-[#0f2f69]">{step.title}</h3>
                  <p className="mt-3 text-center text-[1rem] leading-8 text-slate-500">{step.text}</p>
                  {index < steps.length - 1 ? (
                    <span className="pointer-events-none absolute -left-5 top-1/2 hidden -translate-y-1/2 text-[#9db8ff] md:block">
                      <ArrowLeft className="h-5 w-5" />
                    </span>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto w-[min(calc(100%-1.5rem),1180px)] px-1 py-16 sm:w-[min(calc(100%-2rem),1180px)]">
          <div className="text-center">
            <h2 className="display-font text-[2.2rem] font-black text-[#0f2f69]">ماذا يقول طلابنا؟</h2>
            <p className="mt-3 text-[1.04rem] text-slate-500">تجارب حقيقية لطلاب حققوا التميز مع معيار</p>
          </div>

          <div className="mt-10 grid gap-6 lg:grid-cols-3">
            {testimonials.map((item) => (
              <div key={item.name} className="rounded-[1.7rem] border border-[#e6edf9] bg-white p-7 shadow-[0_16px_34px_rgba(15,23,42,0.04)]">
                <div className="text-right text-[2rem] font-black text-[#c6d5f6]">"</div>
                <p className="mt-1 text-[1rem] leading-8 text-slate-600">{item.text}</p>
                <div className="mt-6 flex items-center justify-between border-t border-[#edf2fb] pt-5">
                  <div className="text-right">
                    <div className="display-font text-[1.2rem] font-bold text-[#0f2f69]">{item.name}</div>
                    <div className="text-sm text-slate-500">{item.score}</div>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#eff4ff] text-[#9bb6f0]">
                    <Users className="h-5 w-5" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#2563eb]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#d6e1f8]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#d6e1f8]" />
          </div>
        </section>

        <section className="mx-auto w-[min(calc(100%-1.5rem),1180px)] px-1 py-4 sm:w-[min(calc(100%-2rem),1180px)]">
          <div className="text-center">
            <h2 className="display-font text-[2.2rem] font-black text-[#0f2f69]">لماذا تختار معيار؟</h2>
          </div>
          <div className="mt-8 grid gap-0 overflow-hidden rounded-[1.8rem] border border-[#e6edf9] bg-white shadow-[0_16px_34px_rgba(15,23,42,0.04)] md:grid-cols-4">
            {whyChoose.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className={`px-7 py-8 text-center ${index !== 0 ? "border-t border-[#eef3fb] md:border-t-0 md:border-r" : ""}`}>
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eef4ff] text-[#2563eb]">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="mt-5 display-font text-[1.3rem] font-bold text-[#0f2f69]">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-500">{item.text}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto w-[min(calc(100%-1.5rem),1180px)] px-1 py-16 sm:w-[min(calc(100%-2rem),1180px)]">
          <div className="overflow-hidden rounded-[1.8rem] bg-[linear-gradient(135deg,#dbe8ff_0%,#edf4ff_60%,#e7f0ff_100%)] px-6 py-7 shadow-[0_18px_38px_rgba(15,23,42,0.05)] md:px-8 md:py-8">
            <div className="grid gap-8 lg:grid-cols-[0.42fr,0.58fr] lg:items-center">
              <div className="order-2 lg:order-1">
                <PublicNewsletterIllustration />
              </div>
              <div className="order-1 lg:order-2">
                <h2 className="display-font text-[2rem] font-black text-[#2563eb]">اشترك في نشرتنا البريدية</h2>
                <p className="mt-3 text-[1rem] leading-8 text-slate-600">
                  احصل على نصائح دراسية، تحديثات المنصة، وأفضل العروض.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button className="inline-flex h-12 items-center justify-center rounded-[0.95rem] bg-[#2563eb] px-6 text-sm font-bold text-white shadow-[0_12px_22px_rgba(37,99,235,0.2)] transition hover:bg-[#1d4ed8]">
                    اشترك الآن
                  </button>
                  <div className="flex h-12 flex-1 items-center gap-3 rounded-[0.95rem] border border-white/70 bg-white px-4 text-sm text-slate-400">
                    <Mail className="h-4 w-4 text-slate-400" />
                    أدخل بريدك الإلكتروني
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="mt-8 border-t border-[#e6edf9] bg-white">
          <div className="mx-auto w-[min(calc(100%-1.5rem),1180px)] px-1 py-14 sm:w-[min(calc(100%-2rem),1180px)]">
            <div className="grid gap-10 lg:grid-cols-[0.34fr,0.22fr,0.22fr,0.22fr]">
              <div>
                <MiyaarLogo href="/" />
                <p className="mt-5 max-w-sm text-[0.98rem] leading-8 text-slate-500">
                  منصة تعليمية مبتكرة تساعد على الاستعداد لاختبار القدرات بكفاءة وثقة.
                </p>
                <div className="mt-5 flex items-center gap-3 text-[#2563eb]">
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef4ff]">𝕏</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef4ff]">◉</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef4ff]">▶</span>
                  <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef4ff]">in</span>
                </div>
              </div>

              <div>
                <h3 className="display-font text-[1.25rem] font-bold text-[#0f2f69]">روابط سريعة</h3>
                <ul className="mt-5 space-y-3 text-[0.98rem] text-slate-500">
                  <li><Link href="/" className="hover:text-[#2563eb]">الرئيسية</Link></li>
                  <li><Link href="/question-bank" className="hover:text-[#2563eb]">بنك الأسئلة</Link></li>
                  <li><Link href="/plans" className="hover:text-[#2563eb]">الخطط الدراسية</Link></li>
                  <li><Link href="/summary-center" className="hover:text-[#2563eb]">الملخصات</Link></li>
                  <li><Link href="/pricing" className="hover:text-[#2563eb]">الأسعار</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="display-font text-[1.25rem] font-bold text-[#0f2f69]">معلومات</h3>
                <ul className="mt-5 space-y-3 text-[0.98rem] text-slate-500">
                  <li><Link href="/about" className="hover:text-[#2563eb]">عن معيار</Link></li>
                  <li><Link href="/faq" className="hover:text-[#2563eb]">الأسئلة الشائعة</Link></li>
                  <li><Link href="/privacy" className="hover:text-[#2563eb]">سياسة الخصوصية</Link></li>
                  <li><Link href="/terms" className="hover:text-[#2563eb]">شروط الاستخدام</Link></li>
                  <li><Link href="/contact" className="hover:text-[#2563eb]">اتصل بنا</Link></li>
                </ul>
              </div>

              <div>
                <h3 className="display-font text-[1.25rem] font-bold text-[#0f2f69]">حمل تطبيقنا</h3>
                <p className="mt-5 text-[0.98rem] leading-8 text-slate-500">تجربة أفضل على التطبيق</p>
                <div className="mt-5 space-y-3">
                  <div className="rounded-[1rem] bg-black px-4 py-3 text-center text-sm font-bold text-white">Download on the App Store</div>
                  <div className="rounded-[1rem] bg-black px-4 py-3 text-center text-sm font-bold text-white">GET IT ON Google Play</div>
                </div>
              </div>
            </div>

            <div className="mt-12 border-t border-[#edf2fb] pt-6 text-center text-sm text-slate-400">
              جميع الحقوق محفوظة © 2024 معيار
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}
