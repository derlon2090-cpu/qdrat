"use client";

import Link from "next/link";
import {
  Bot,
  CircleHelp,
  Download,
  FileText,
  Headphones,
  RefreshCcw,
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
    <footer className="bg-[radial-gradient(circle_at_top,#eef5ff_0%,#f8fbff_38%,#ffffff_100%)]">
      <div className="mx-auto w-[min(calc(100%-1rem),1480px)] py-10 sm:w-[min(calc(100%-2rem),1480px)] sm:py-12">
        <div className="rounded-[2.25rem] border border-[#e6eefc] bg-white px-6 py-7 shadow-[0_26px_80px_rgba(15,23,42,0.08)] sm:px-8 lg:px-12">
          <div className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
            <div className="order-3 flex flex-col items-center gap-3 text-center xl:order-1 xl:min-w-[260px] xl:items-start xl:text-right">
              <MiyaarLogo href="/dashboard" className="justify-center xl:justify-start" />
              <p className="text-[1.03rem] font-medium text-[#74839d]">
                جميع الحقوق محفوظة © 2024
              </p>
            </div>

            <div className="order-2 flex flex-1 flex-col items-center gap-5 xl:px-6">
              <div className="flex flex-wrap items-center justify-center gap-4 text-center text-[#50607c] lg:gap-6">
                <div className="flex items-center gap-3 rounded-full px-1 py-1">
                  <RefreshCcw className="h-6 w-6 text-[#2f6df2]" />
                  <div className="text-right leading-7">
                    <div className="text-base font-semibold">آخر تحديث</div>
                    <div className="text-[1.15rem] font-bold text-[#123b7a]">اليوم، 10:30 م</div>
                  </div>
                </div>

                <div className="hidden h-10 w-px bg-[#e8eef8] lg:block" />

                <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-[1.06rem] font-semibold text-[#5e6f8a]">
                  {studentActionLinks.map((item, index) => {
                    const Icon = item.icon;

                    return (
                      <div key={item.href} className="flex items-center">
                        <Link
                          href={item.href}
                          className="inline-flex items-center gap-2 transition hover:text-[#2563eb]"
                        >
                          <Icon className="h-5 w-5 text-[#2f6df2]" />
                          {item.label}
                        </Link>
                        {index !== studentActionLinks.length - 1 ? (
                          <span className="mx-4 hidden h-8 w-px bg-[#e8eef8] md:block" />
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="order-1 flex justify-center xl:order-3 xl:min-w-[300px] xl:justify-end">
              <div className="flex items-center gap-4 rounded-full border border-[#ebf2ff] bg-[#fbfdff] px-5 py-4 shadow-[0_16px_40px_rgba(15,23,42,0.06)]">
                <div className="space-y-1 text-right">
                  <div className="text-[1.55rem] font-black text-[#123b7a]">مساعدك الذكي</div>
                  <div className="inline-flex items-center gap-2 text-[1.02rem] font-medium text-[#64748b]">
                    <span className="h-2.5 w-2.5 rounded-full bg-[#22c55e]" />
                    نحن هنا لمساعدتك
                  </div>
                </div>

                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[radial-gradient(circle_at_35%_35%,#56a1ff_0%,#2f6df2_55%,#123b7a_100%)] text-white shadow-[0_18px_38px_rgba(37,99,235,0.25)]">
                  <Bot className="h-10 w-10" />
                </div>
              </div>
            </div>
          </div>
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
