"use client";

import Link from "next/link";
import {
  ArrowUp,
  Download,
  LayoutTemplate,
  MessageCircleMore,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import { MiyaarLogo } from "@/components/miyaar-logo";
import { useAuthSession } from "@/hooks/use-auth-session";
import { publicFooterLinks, studentFooterLinks } from "@/lib/site-nav";

type SiteFooterProps = {
  variant?: "auto" | "public" | "student";
};

const studentHighlights = [
  {
    title: "تواصل سريع",
    description:
      "إذا كان عندك سؤال عن الاشتراك أو نقطة البداية أو الدعم، ستجد كل ما تحتاجه في صفحات واضحة ومباشرة.",
    icon: MessageCircleMore,
  },
  {
    title: "واجهتان أوضح",
    description:
      "الزائر يرى منصة تعريفية مرتبة، والطالب يرى لوحة عملية تبدأ بخطة اليوم ثم تعيده لما كان يعمل عليه.",
    icon: LayoutTemplate,
  },
  {
    title: "ثقة وتنظيم",
    description:
      "كل قسم صار في مكانه الصحيح مع انتقالات أوضح وأزرار أسهل سواء كنت زائرًا أو طالبًا داخل المنصة.",
    icon: ShieldCheck,
  },
];

export function SiteFooter({ variant = "auto" }: SiteFooterProps) {
  const { status } = useAuthSession();
  const isStudent =
    variant === "student" || (variant === "auto" && status === "authenticated");
  const links = isStudent ? studentFooterLinks : publicFooterLinks;
  const homeHref = isStudent ? "/dashboard" : "/";

  return (
    <footer className="bg-[linear-gradient(180deg,#16386e_0%,#133463_100%)] text-white">
      <div className="mx-auto w-[min(calc(100%-1rem),1480px)] px-5 py-10 sm:w-[min(calc(100%-2rem),1480px)] sm:px-8 lg:px-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/6 px-5 py-3 text-sm font-bold text-white transition hover:bg-white/10"
            >
              <Download className="h-4 w-4" />
              حمل التطبيق قريبًا
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/6 px-5 py-3 text-sm font-bold text-white/95 transition hover:bg-white/10"
            >
              <Smartphone className="h-4 w-4" />
              iOS / Android
            </button>
          </div>

          <MiyaarLogo href={homeHref} className="justify-start [&_strong]:text-white" />
        </div>

        <div className="mt-7 h-px bg-white/12" />

        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-[1.08rem] font-bold">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-white/95 transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="inline-flex items-center gap-2 text-white/95 transition hover:text-white"
          >
            <ArrowUp className="h-4 w-4" />
            العودة للأعلى
          </button>
        </div>

        <div className="mt-7 rounded-[1.7rem] border border-white/30 bg-white/[0.03] px-6 py-6 text-center text-[1.45rem] font-extrabold leading-9 text-white sm:text-[1.75rem] sm:leading-[3rem]">
          معيار منصة سعودية للتحضير للقدرات الكمي واللفظي بخطة يومية واضحة، وبنك
          أسئلة وملخصات ومراجعة مركزة.
        </div>

        <div className="mt-7 grid gap-4 lg:grid-cols-3">
          {studentHighlights.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="rounded-[1.9rem] border border-white/25 bg-white/[0.08] px-6 py-7"
              >
                <div className="mb-4 flex items-center justify-between">
                  <Icon className="h-5 w-5 text-[#ffd884]" />
                  <h3 className="text-[1.6rem] font-black text-[#ffe4a6]">
                    {item.title}
                  </h3>
                </div>
                <p className="text-[1.08rem] leading-9 text-white/85">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="mt-8 h-px bg-white/12" />

        <div className="mt-7 flex flex-col gap-4 text-center text-[1.03rem] text-white/80 lg:flex-row lg:items-center lg:justify-between">
          <p>© 2026 معيار. جميع الحقوق محفوظة.</p>
          <p>مبني لطلاب القدرات الكمي واللفظي بواجهة أوضح ومسار يومي أذكى.</p>
        </div>
      </div>
    </footer>
  );
}
