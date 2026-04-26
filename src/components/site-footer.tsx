"use client";

import Link from "next/link";
import {
  ArrowUp,
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
import { publicFooterLinks, studentFooterLinks } from "@/lib/site-nav";

type SiteFooterProps = {
  variant?: "auto" | "public" | "student";
};

const studentActionLinks = [
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

function FooterBackToTop() {
  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="inline-flex items-center gap-2 text-white/95 transition hover:text-white"
    >
      <ArrowUp className="h-5 w-5" />
      العودة للأعلى
    </button>
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
    <footer className="bg-[linear-gradient(180deg,#16386e_0%,#133463_100%)] text-white">
      <div className="mx-auto w-[min(calc(100%-1rem),1480px)] px-5 py-10 sm:w-[min(calc(100%-2rem),1480px)] sm:px-8 lg:px-12">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <FooterPills />
          <MiyaarLogo href="/dashboard" className="justify-start [&_strong]:text-white" />
        </div>

        <div className="mt-7 h-px bg-white/12" />

        <div className="mt-7 flex flex-wrap items-center justify-center gap-x-8 gap-y-4 text-[1.08rem] font-bold">
          {studentFooterLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-white/95 transition hover:text-white"
            >
              {link.label}
            </Link>
          ))}
          <FooterBackToTop />
        </div>

        <div className="mt-7 rounded-[1.7rem] border border-white/30 bg-white/[0.03] px-6 py-6 text-center text-[1.45rem] font-extrabold leading-9 text-white sm:text-[1.75rem] sm:leading-[3rem]">
          معيار منصة سعودية للتحضير للقدرات الكمي واللفظي بخطة يومية واضحة، وبنك أسئلة وملخصات ومراجعة مركزة.
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-3">
          <div className="rounded-[1.9rem] border border-white/30 bg-white/10 px-6 py-7 text-right">
            <div className="mb-4 inline-flex items-center gap-2 text-[1.45rem] font-black text-[#ffd88e]">
              <MessageCircleMore className="h-6 w-6" />
              تواصل سريع
            </div>
            <p className="text-[1.06rem] leading-9 text-white/88">
              إذا كان عندك سؤال عن الاشتراك أو نقطة البداية أو الدعم، ستجد كل ما تحتاجه في صفحات واضحة ومباشرة.
            </p>
          </div>

          <div className="rounded-[1.9rem] border border-white/30 bg-white/10 px-6 py-7 text-right">
            <div className="mb-4 inline-flex items-center gap-2 text-[1.45rem] font-black text-[#ffd88e]">
              <LayoutPanelTop className="h-6 w-6" />
              واجهتان أوضح
            </div>
            <p className="text-[1.06rem] leading-9 text-white/88">
              الزائر يرى منصة تعريفية مرنة، والطالب يرى لوحة عملية تبدأ بخطة اليوم ثم تعيده لما كان يعمل عليه.
            </p>
          </div>

          <div className="rounded-[1.9rem] border border-white/30 bg-white/10 px-6 py-7 text-right">
            <div className="mb-4 inline-flex items-center gap-2 text-[1.45rem] font-black text-[#ffd88e]">
              <ShieldCheck className="h-6 w-6" />
              ثقة وتنظيم
            </div>
            <p className="text-[1.06rem] leading-9 text-white/88">
              كل قسم صار في مكانه الصحيح مع انتقالات أوضح وأزرار أسهل سواء كنت زائرًا أو طالبًا داخل المنصة.
            </p>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3 border-t border-white/12 pt-7 text-sm font-medium text-white/75">
          {studentActionLinks.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="inline-flex items-center gap-2 transition hover:text-white"
              >
                <Icon className="h-4 w-4 text-[#9bc1ff]" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="mt-7 h-px bg-white/12" />

        <div className="mt-7 flex flex-col gap-4 text-center text-[1.03rem] text-white/80 lg:flex-row lg:items-center lg:justify-between">
          <p>مبني لطلاب القدرات الكمي واللفظي بواجهة أوضح ومسار يومي أذكى.</p>
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
