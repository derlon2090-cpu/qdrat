"use client";

import Link from "next/link";
import {
  ArrowUp,
  Download,
  FileText,
  Headphones,
  LayoutGrid,
  Lightbulb,
  Play,
  ShieldCheck,
  Smartphone,
  TriangleAlert,
} from "lucide-react";

import { MiyaarLogo } from "@/components/miyaar-logo";
import { StudentSupportAssistant } from "@/components/student-support-assistant";
import { useAuthSession } from "@/hooks/use-auth-session";

type SiteFooterProps = {
  variant?: "auto" | "public" | "student";
};

const studentPrimaryLinks = [
  { href: "/dashboard", label: "لوحتي" },
  { href: "/my-plan", label: "الخطة اليومية" },
  { href: "/question-bank", label: "بنك الأسئلة" },
  { href: "/question-bank?track=mistakes", label: "الأخطاء" },
  { href: "/verbal/practice", label: "المراجعة" },
  { href: "/challenge", label: "تحدي الشهر" },
  { href: "/summary-center", label: "الملخصات" },
  { href: "/paper-models", label: "النماذج" },
  { href: "/account", label: "الإعدادات" },
  { href: "/contact?topic=support", label: "الدعم" },
];

const studentFeatureCards = [
  {
    title: "تواصل سريع",
    desc: "إذا كان عندك سؤال عن الاشتراك أو نقطة البداية أو الدعم، ستجد كل ما تحتاجه في صفحات واضحة ومباشرة.",
    icon: Headphones,
  },
  {
    title: "واجهات أوضح",
    desc: "الزائر يرى منصة تعريفية مرنة، والطالب يرى لوحة عملية تبدأ بخطة اليوم ثم تعيده لما كان يعمل عليه.",
    icon: LayoutGrid,
  },
  {
    title: "ثقة وتنظيم",
    desc: "كل قسم صار في مكانه الصحيح مع انتقالات أوضح وأزرار أسهل سواء كنت زائرًا أو طالبًا داخل المنصة.",
    icon: ShieldCheck,
  },
];

const studentSupportLinks = [
  { href: "/privacy", label: "سياسة الخصوصية", icon: ShieldCheck },
  { href: "/terms", label: "الشروط", icon: FileText },
  { href: "/contact?topic=bug", label: "الإبلاغ عن خطأ", icon: TriangleAlert },
  { href: "/contact?topic=feature", label: "اقتراح ميزة", icon: Lightbulb },
  { href: "/contact?topic=support", label: "دعم فني", icon: Headphones },
];

const publicQuickLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/question-bank", label: "بنك الأسئلة" },
  { href: "/plans", label: "الخطط الدراسية" },
  { href: "/summaries", label: "الملخصات" },
  { href: "/pricing", label: "الأسعار" },
];

const publicInfoLinks = [
  { href: "/about", label: "عن معيار" },
  { href: "/faq", label: "الأسئلة الشائعة" },
  { href: "/privacy", label: "سياسة الخصوصية" },
  { href: "/terms", label: "شروط الاستخدام" },
  { href: "/contact", label: "اتصل بنا" },
];

const socialLinks = [
  { href: "https://www.linkedin.com", label: "in" },
  { href: "https://www.youtube.com", label: "play", icon: Play },
  { href: "https://www.instagram.com", label: "◎" },
  { href: "https://x.com", label: "𝕏" },
];

function StoreButton({ children }: { children: string }) {
  return (
    <span className="inline-flex min-h-[3.4rem] w-[19.5rem] max-w-full items-center justify-center rounded-[1rem] bg-black px-4 py-3 text-center text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {children}
    </span>
  );
}

function PublicFooter() {
  return (
    <footer className="bg-white text-[#0f3670]">
      <div className="mx-auto w-[min(calc(100%-2.5rem),1480px)] px-0 pb-10 pt-16 sm:w-[min(calc(100%-4rem),1480px)]">
        <div
          dir="rtl"
          className="grid gap-10 text-center md:grid-cols-2 md:text-right xl:grid-cols-[1.25fr_1fr_1fr_1fr]"
        >
          <div className="flex flex-col items-center md:items-start">
            <MiyaarLogo href="/" className="justify-center md:justify-start" />
            <p className="mt-5 max-w-sm text-[0.98rem] leading-8 text-slate-500">
              منصة تعليمية مبتكرة تساعد على الاستعداد لاختبار القدرات بكفاءة وثقة.
            </p>
            <div className="mt-5 flex items-center justify-center gap-3 text-[#2563eb] md:justify-start">
              {socialLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-[#eef4ff] text-sm font-bold text-[#2563eb] transition hover:-translate-y-0.5 hover:bg-[#2563eb] hover:text-white"
                    aria-label={item.label}
                  >
                    {Icon ? <Icon className="h-4 w-4 fill-current" /> : item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="display-font text-[1.25rem] font-bold text-[#0f2f69]">روابط سريعة</h3>
            <div className="mt-5 flex flex-col gap-3 text-[0.98rem] text-slate-500">
              {publicQuickLinks.map((link) => (
                <Link key={link.href} href={link.href} className="transition hover:text-[#2563eb]">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="display-font text-[1.25rem] font-bold text-[#0f2f69]">معلومات</h3>
            <div className="mt-5 flex flex-col gap-3 text-[0.98rem] text-slate-500">
              {publicInfoLinks.map((link) => (
                <Link key={link.href} href={link.href} className="transition hover:text-[#2563eb]">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <h3 className="display-font text-[1.25rem] font-bold text-[#0f2f69]">حمّل تطبيقنا</h3>
            <p className="mt-5 text-[0.98rem] leading-8 text-slate-500">
              تجربة أفضل على التطبيق
            </p>
            <div className="mt-5 flex w-full flex-col items-center gap-3 md:items-start">
              <StoreButton>Download on the App Store</StoreButton>
              <StoreButton>GET IT ON Google Play</StoreButton>
            </div>
          </div>
        </div>

        <div className="mt-12 h-px bg-[#edf2fb]" />

        <p className="mt-6 text-center text-sm text-slate-400">
          جميع الحقوق محفوظة © 2024 معيار
        </p>
      </div>
    </footer>
  );
}

function StudentFooter() {
  return (
    <>
      <footer className="mt-auto bg-[#17396f] text-white">
        <div className="w-full px-0 pb-0 pt-10">
          <div className="mx-auto w-[min(calc(100%-2rem),1560px)] sm:w-[min(calc(100%-3rem),1560px)]">
            <div
              dir="ltr"
              className="flex flex-col gap-5 border-b border-white/10 pb-8 md:flex-row md:items-center md:justify-between"
            >
              <MiyaarLogo
                href="/dashboard"
                className="[&_strong]:text-white"
              />

              <div className="flex flex-wrap items-center justify-end gap-3">
                <button
                  type="button"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 text-lg font-bold text-white transition hover:bg-white/10"
                >
                  <Download className="h-5 w-5" />
                  حمل التطبيق قريبًا
                </button>
                <button
                  type="button"
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 text-lg font-bold text-white transition hover:bg-white/10"
                >
                  <Smartphone className="h-5 w-5" />
                  iOS / Android
                </button>
              </div>
            </div>

            <div dir="rtl" className="border-b border-white/10 py-7">
              <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-4 text-xl font-black text-white">
                {studentPrimaryLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="transition hover:text-[#ffd18c]"
                  >
                    {link.label}
                  </Link>
                ))}
                <button
                  type="button"
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="inline-flex items-center gap-2 transition hover:text-[#ffd18c]"
                >
                  <ArrowUp className="h-5 w-5" />
                  العودة للأعلى
                </button>
              </div>
            </div>

            <div dir="rtl" className="py-8">
              <div className="rounded-[2rem] border border-white/18 bg-white/6 px-8 py-10 text-center shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]">
                <p className="mx-auto max-w-6xl text-[2rem] font-black leading-[1.8] text-white md:text-[2.45rem]">
                  معيار منصة سعودية للتحضير للقدرات الكمي واللفظي بخطة يومية واضحة، وبنك أسئلة وملخصات ومراجعة مركزة.
                </p>
              </div>

              <div className="mt-10 grid gap-6 lg:grid-cols-3">
                {studentFeatureCards.map((card) => {
                  const Icon = card.icon;

                  return (
                    <div
                      key={card.title}
                      className="rounded-[2rem] border border-white/18 bg-white/10 px-8 py-10 text-right shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
                    >
                      <div className="mb-5 flex items-center justify-between gap-4">
                        <Icon className="h-7 w-7 text-[#ffcf80]" />
                        <h3 className="text-[2rem] font-black text-[#ffcf80]">
                          {card.title}
                        </h3>
                      </div>
                      <p className="text-[1.38rem] leading-[2.15] text-white/90">
                        {card.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div
              dir="rtl"
              className="flex flex-col gap-5 border-t border-white/10 py-8 text-white/85 lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="text-center text-xl font-medium lg:text-right">
                مبني لطلاب القدرات الكمي واللفظي بواجهة أوضح ومسار يومي أذكى.
              </div>

              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-base font-semibold lg:justify-end">
                {studentSupportLinks.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="inline-flex items-center gap-2 transition hover:text-[#ffd18c]"
                    >
                      <Icon className="h-4 w-4 text-[#ffd18c]" />
                      {item.label}
                    </Link>
                  );
                })}
              </div>

              <div className="text-center text-xl font-medium lg:text-left">
                © 2026 معيار. جميع الحقوق محفوظة.
              </div>
            </div>
          </div>
        </div>
      </footer>

      <div className="fixed bottom-5 left-5 z-[70]">
        <StudentSupportAssistant />
      </div>
    </>
  );
}

export function SiteFooter({ variant = "auto" }: SiteFooterProps) {
  const { status } = useAuthSession();

  if (variant === "auto" && status === "loading") {
    return null;
  }

  const isStudent =
    variant === "student" || (variant === "auto" && status === "authenticated");

  return isStudent ? <StudentFooter /> : <PublicFooter />;
}
