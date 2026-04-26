"use client";

import Link from "next/link";
import {
  ChevronUp,
  CircleHelp,
  Download,
  FileText,
  Headphones,
  LayoutPanelTop,
  MessageCircleMore,
  ShieldCheck,
  Smartphone,
  TriangleAlert,
} from "lucide-react";

import { MiyaarLogo } from "@/components/miyaar-logo";
import { useAuthSession } from "@/hooks/use-auth-session";
import { publicFooterLinks } from "@/lib/site-nav";

type SiteFooterProps = {
  variant?: "auto" | "public" | "student";
};

const studentFooterLinks = [
  { href: "/dashboard", label: "لوحتي" },
  { href: "/my-plan", label: "الخطة اليومية" },
  { href: "/question-bank", label: "بنك الأسئلة" },
  { href: "/question-bank?track=mistakes", label: "الأخطاء" },
  { href: "/statistics", label: "المراجعة" },
  { href: "/challenge", label: "تحدي الشهر" },
  { href: "/summaries", label: "الملخصات" },
  { href: "/paper-models", label: "النماذج" },
  { href: "/account", label: "الإعدادات" },
  { href: "/contact?topic=support", label: "الدعم" },
  { href: "#top", label: "العودة للأعلى", icon: ChevronUp },
];

const studentFooterCards = [
  {
    title: "تواصل سريع",
    text: "إذا كان عندك سؤال عن الاشتراك أو نقطة البداية أو الدعم، ستجد كل ما تحتاجه في صفحات واضحة ومباشرة.",
    icon: MessageCircleMore,
  },
  {
    title: "واجهتان أوضح",
    text: "الزائر يرى منصة تعريفية مرنة، والطالب يرى لوحة عملية تبدأ بخطة اليوم ثم تعيده لما كان يعمل عليه.",
    icon: LayoutPanelTop,
  },
  {
    title: "ثقة وتنظيم",
    text: "كل قسم صار في مكانه الصحيح مع انتقالات أوضح وأزرار أسهل سواء كنت زائرًا أو طالبًا داخل المنصة.",
    icon: ShieldCheck,
  },
];

const studentSupportLinks = [
  { href: "/privacy", label: "سياسة الخصوصية", icon: ShieldCheck },
  { href: "/terms", label: "الشروط", icon: FileText },
  { href: "/contact?topic=bug", label: "الإبلاغ عن خطأ", icon: TriangleAlert },
  { href: "/contact?topic=feature", label: "اقتراح ميزة", icon: CircleHelp },
  { href: "/contact?topic=support", label: "دعم فني", icon: Headphones },
];

function FooterPills() {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/6 px-5 py-3 text-sm font-bold text-white">
        <Download className="h-4 w-4" />
        حمل التطبيق قريبًا
      </span>
      <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/6 px-5 py-3 text-sm font-bold text-white/95">
        <Smartphone className="h-4 w-4" />
        iOS / Android
      </span>
    </div>
  );
}

function PublicFooter() {
  return (
    <footer className="bg-[linear-gradient(180deg,#16386e_0%,#133463_100%)] text-white">
      <div className="mx-auto w-[min(calc(100%-1rem),1480px)] px-5 py-10 sm:w-[min(calc(100%-2rem),1480px)] sm:px-8 lg:px-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <FooterPills />
          <MiyaarLogo href="/" className="justify-start [&_strong]:text-white" />
        </div>

        <div className="mt-7 h-px bg-white/12" />

        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-[1.08rem] font-bold">
          {publicFooterLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-white/95 transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="mt-7 rounded-[1.7rem] border border-white/30 bg-white/[0.03] px-6 py-6 text-center text-[1.45rem] font-extrabold leading-9 text-white sm:text-[1.75rem] sm:leading-[3rem]">
          معيار منصة سعودية للتحضير للقدرات الكمي واللفظي بخطة يومية واضحة، وبنك أسئلة وملخصات ومراجعة مركزة.
        </div>

        <div className="mt-8 h-px bg-white/12" />

        <div className="mt-7 flex flex-col gap-4 text-center text-[1.03rem] text-white/80 lg:flex-row lg:items-center lg:justify-between">
          <p>© 2026 معيار. جميع الحقوق محفوظة.</p>
          <p>واجهة تعريفية واضحة للزائر مع وصول أسرع لبنك الأسئلة والخطط والملخصات.</p>
        </div>
      </div>
    </footer>
  );
}

function StudentFooter() {
  return (
    <footer className="mt-auto bg-[#173f78] text-white">
      <div className="mx-auto w-[min(calc(100%-1rem),1480px)] px-5 py-10 sm:w-[min(calc(100%-2rem),1480px)] sm:px-8 lg:px-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <FooterPills />
          <MiyaarLogo href="/dashboard" className="justify-start [&_strong]:text-white" />
        </div>

        <div className="mt-7 h-px bg-white/12" />

        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-[1.08rem] font-extrabold text-white">
          {studentFooterLinks.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-2 text-white transition hover:text-white/90"
              >
                {item.label}
                {Icon ? <Icon className="h-5 w-5" /> : null}
              </Link>
            );
          })}
        </div>

        <div className="mt-7 rounded-[2rem] border border-white/18 bg-white/[0.05] px-8 py-10 text-center text-[1.75rem] font-black leading-[3.45rem] text-white sm:text-[2.1rem] sm:leading-[4rem]">
          معيار منصة سعودية للتحضير للقدرات الكمي واللفظي بخطة يومية واضحة، وبنك أسئلة وملخصات ومراجعة مركزة.
        </div>

        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {studentFooterCards.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-[2rem] border border-white/22 bg-white/[0.08] px-7 py-8 text-right"
              >
                <div className="mb-5 flex items-center justify-between">
                  <Icon className="h-6 w-6 text-[#ffcf73]" />
                  <h3 className="text-[1.95rem] font-black text-[#ffcf73]">{item.title}</h3>
                </div>
                <p className="text-[1.18rem] leading-[2.55rem] text-white/92">{item.text}</p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 h-px bg-white/12" />

        <div className="mt-6 flex flex-col gap-4 text-center text-[1.03rem] text-white/82 xl:flex-row xl:items-center xl:justify-between">
          <p>مبني لطلاب القدرات الكمي واللفظي بواجهة أوضح ومسار يومي أذكى.</p>

          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-[1rem] font-semibold text-white/82">
            {studentSupportLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center gap-2 transition hover:text-white"
                >
                  <Icon className="h-4.5 w-4.5" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <p>© 2026 معيار. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </footer>
  );
}

export function SiteFooter({ variant = "auto" }: SiteFooterProps) {
  const { status } = useAuthSession();
  const isStudent =
    variant === "student" || (variant === "auto" && status === "authenticated");

  return isStudent ? <StudentFooter /> : <PublicFooter />;
}
