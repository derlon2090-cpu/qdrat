import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  BarChart3,
  ShieldCheck,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

import { AuthFormCard } from "@/components/auth-form-card";
import { MiyaarLogo } from "@/components/miyaar-logo";
import { PublicLaptopIllustration } from "@/components/public-site-illustrations";

type LoginPageProps = {
  searchParams: Promise<{
    next?: string | string[];
  }>;
};

const benefitCards = [
  {
    title: "بنك أسئلة ذكي",
    text: "آلاف الأسئلة المحددة والمصنفة مع حلول تفصيلية",
    icon: BookOpen,
    tone: "bg-[#eef4ff] text-[#2563eb]",
  },
  {
    title: "خطط دراسة مخصصة",
    text: "خطط ذكية تناسب مستواك ووقتك لتحقيق أفضل النتائج",
    icon: CalendarDays,
    tone: "bg-[#ebfbf0] text-[#22c55e]",
  },
  {
    title: "تحليل أداء متقدم",
    text: "إحصائيات دقيقة تساعدك على معرفة نقاط قوتك ومجالات التحسين",
    icon: BarChart3,
    tone: "bg-[#f4ebff] text-[#8b5cf6]",
  },
  {
    title: "تجربة سلسلة",
    text: "واجهة سهلة الاستخدام بتصميم عصري وتجربة مريحة",
    icon: Zap,
    tone: "bg-[#fff4df] text-[#f59e0b]",
  },
];

const trustStats = [
  {
    value: "+120K",
    label: "طالب وطالبة",
    icon: Users,
    tone: "bg-[#eef4ff] text-[#2563eb]",
  },
  {
    value: "+1.5M",
    label: "سؤال تمت الإجابة عليه",
    icon: TrendingUp,
    tone: "bg-[#ebfbf0] text-[#22c55e]",
  },
  {
    value: "4.9/5",
    label: "تقييم الطلاب",
    icon: Star,
    tone: "bg-[#fff4df] text-[#f59e0b]",
  },
  {
    value: "+300",
    label: "ملخص شامل",
    icon: BookOpen,
    tone: "bg-[#f4ebff] text-[#8b5cf6]",
  },
];

const footerColumns = [
  {
    title: "الرئيسية",
    links: [
      { href: "/", label: "الرئيسية" },
      { href: "/question-bank", label: "بنك الأسئلة" },
      { href: "/my-plan", label: "الخطط" },
      { href: "/pricing", label: "الأسعار" },
    ],
  },
  {
    title: "الموارد",
    links: [
      { href: "/summaries", label: "الملخصات" },
      { href: "/articles", label: "المقالات" },
      { href: "/faq", label: "الأسئلة الشائعة" },
      { href: "/free-lessons", label: "الدروس المجانية" },
    ],
  },
  {
    title: "الشركة",
    links: [
      { href: "/about", label: "من نحن" },
      { href: "/contact", label: "تواصل معنا" },
      { href: "/privacy", label: "سياسة الخصوصية" },
      { href: "/terms", label: "الشروط والأحكام" },
    ],
  },
];

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const nextPath =
    typeof resolvedSearchParams.next === "string"
      ? resolvedSearchParams.next
      : resolvedSearchParams.next?.[0] ?? "/dashboard";

  return (
    <div dir="rtl" className="min-h-screen bg-[#f8fbff] text-slate-900">
      <header className="border-b border-[#e7edf8] bg-white">
        <div className="mx-auto flex w-[min(calc(100%-2rem),1200px)] items-center justify-between px-1 py-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-base font-bold text-[#64748b] transition hover:text-[#123B7A]"
          >
            <ArrowLeft className="h-4 w-4" />
            العودة إلى الصفحة الرئيسية
          </Link>

          <MiyaarLogo href="/" />
        </div>
      </header>

      <main>
        <section className="overflow-hidden border-b border-[#edf2fb] bg-[radial-gradient(circle_at_left_bottom,rgba(84,125,255,0.08),transparent_24%),radial-gradient(circle_at_20%_42%,rgba(183,206,255,0.22),transparent_16%),linear-gradient(180deg,#f8fbff_0%,#f3f7ff_100%)]">
          <div className="mx-auto grid w-[min(calc(100%-2rem),1200px)] gap-8 px-1 py-14 lg:grid-cols-[1.05fr,0.95fr] lg:items-start">
            <div className="order-2 lg:order-2">
              <AuthFormCard mode="login" nextPath={nextPath} />
            </div>

            <div className="order-1 lg:order-1">
              <div className="max-w-[520px]">
                <h1 className="display-font text-[clamp(2.8rem,5vw,4.4rem)] font-black leading-[1.15] text-[#123B7A]">
                  مرحبًا بك في <span className="text-[#2563eb]">معيار</span>
                </h1>
                <p className="mt-5 max-w-[460px] text-[1.12rem] leading-9 text-[#64748b]">
                  منصة ذكية تساعدك على الاستعداد لاختبار القدرات بأحدث الأساليب وأفضل المحتويات.
                </p>
              </div>

              <div className="mt-10 space-y-4">
                {benefitCards.map((card) => {
                  const Icon = card.icon;

                  return (
                    <div
                      key={card.title}
                      className="flex items-center justify-between rounded-[1.5rem] border border-white/70 bg-white/88 px-6 py-5 shadow-[0_14px_34px_rgba(15,23,42,0.04)] backdrop-blur-sm"
                    >
                      <div className={`flex h-14 w-14 items-center justify-center rounded-full ${card.tone}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="text-right">
                        <h2 className="display-font text-[1.28rem] font-bold text-[#0f2f69]">{card.title}</h2>
                        <p className="mt-2 text-sm leading-7 text-[#64748b]">{card.text}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-8">
                <PublicLaptopIllustration className="h-[320px] rounded-[2rem]" />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto w-[min(calc(100%-2rem),1200px)] px-1 py-12">
          <div className="overflow-hidden rounded-[1.8rem] border border-[#e6edf9] bg-white px-6 py-9 shadow-[0_18px_42px_rgba(15,23,42,0.04)]">
            <h2 className="text-center display-font text-[2.05rem] font-black text-[#123B7A]">
              آلاف الطلاب يثقون في معيار
            </h2>

            <div className="mt-8 grid gap-0 md:grid-cols-4">
              {trustStats.map((stat, index) => {
                const Icon = stat.icon;

                return (
                  <div
                    key={stat.label}
                    className={`px-4 py-3 text-center ${index !== trustStats.length - 1 ? "border-b border-[#eef3fb] md:border-b-0 md:border-l" : ""}`}
                  >
                    <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${stat.tone}`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="mt-4 display-font text-[2rem] font-extrabold text-[#123B7A]">{stat.value}</div>
                    <div className="mt-2 text-sm font-semibold text-[#64748b]">{stat.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-[#e6edf9] bg-white">
        <div className="mx-auto w-[min(calc(100%-2rem),1200px)] px-1 py-12">
          <div className="grid gap-8 lg:grid-cols-[0.33fr,0.17fr,0.17fr,0.17fr,0.16fr]">
            <div>
              <MiyaarLogo href="/" />
              <p className="mt-5 max-w-sm text-[1rem] leading-8 text-[#64748b]">
                منصة تعليمية متكاملة لمساعدتك على التفوق في اختبار القدرات وتحقيق أهدافك الأكاديمية.
              </p>
              <div className="mt-5 flex items-center gap-3 text-[#2563eb]">
                {["𝕏", "◎", "▶", "⌂"].map((item) => (
                  <span
                    key={item}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#e7edf8] bg-white text-base shadow-[0_10px_24px_rgba(15,23,42,0.04)]"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>

            {footerColumns.map((column) => (
              <div key={column.title}>
                <h3 className="display-font text-[1.2rem] font-bold text-[#123B7A]">{column.title}</h3>
                <ul className="mt-5 space-y-3 text-[0.98rem] text-[#64748b]">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      <Link href={link.href} className="transition hover:text-[#2563eb]">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="rounded-[1.6rem] border border-[#e7edf8] bg-[#f8fbff] p-6 text-center shadow-[0_14px_34px_rgba(15,23,42,0.04)]">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[#eef4ff] text-[#123B7A]">
                <ShieldCheck className="h-8 w-8" />
              </div>
              <h3 className="mt-4 display-font text-[1.2rem] font-bold text-[#123B7A]">بيئة آمنة</h3>
              <p className="mt-3 text-sm leading-7 text-[#64748b]">نحن نهتم بأمان بياناتك وخصوصيتك</p>
            </div>
          </div>

          <div className="mt-10 border-t border-[#edf2fb] pt-5 text-center text-sm text-[#94a3b8]">
            جميع الحقوق محفوظة © 2024 معيار
          </div>
        </div>
      </footer>
    </div>
  );
}
