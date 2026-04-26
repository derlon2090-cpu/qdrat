"use client";

import Link from "next/link";
import {
  Download,
  FileText,
  Headphones,
  Lightbulb,
  RefreshCw,
  ShieldCheck,
  Smartphone,
  TriangleAlert,
} from "lucide-react";

import { MiyaarLogo } from "@/components/miyaar-logo";
import { StudentSupportAssistant } from "@/components/student-support-assistant";
import { useAuthSession } from "@/hooks/use-auth-session";
import { publicFooterLinks } from "@/lib/site-nav";

type SiteFooterProps = {
  variant?: "auto" | "public" | "student";
};

const studentSupportLinks = [
  { href: "/privacy", label: "سياسة الخصوصية", icon: ShieldCheck },
  { href: "/terms", label: "الشروط", icon: FileText },
  { href: "/contact?topic=bug", label: "الإبلاغ عن خطأ", icon: TriangleAlert },
  { href: "/contact?topic=feature", label: "اقتراح ميزة", icon: Lightbulb },
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
    <footer className="mt-auto bg-[#f8fbff] pt-10 text-[#102247]">
      <div
        dir="ltr"
        className="w-full border-t border-[#e7edf8] bg-white px-5 py-5 shadow-[0_-18px_55px_rgba(15,34,71,0.08)] sm:px-8 lg:px-12"
      >
        <div className="mx-auto grid w-full max-w-[1840px] items-center gap-5 lg:grid-cols-[300px_minmax(0,1fr)_330px]">
          <div className="flex items-center justify-center gap-4 lg:justify-start">
            <MiyaarLogo href="/dashboard" className="shrink-0" />
            <div className="h-14 w-px bg-[#e2e8f4]" />
            <div dir="rtl" className="text-right text-sm leading-7 text-[#6d7b92]">
              <div className="font-semibold text-[#34445d]">© 2026 معيار</div>
              <div>جميع الحقوق محفوظة</div>
            </div>
          </div>

          <div
            dir="rtl"
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-3 text-sm font-semibold text-[#64748b] xl:gap-x-7"
          >
            <div className="inline-flex items-center gap-2 border-x border-[#e2e8f4] px-5 text-[#34445d]">
              <RefreshCw className="h-5 w-5 text-[#2563eb]" />
              <span>آخر تحديث اليوم، 10:30 م</span>
            </div>
            {studentSupportLinks.map((item) => {
              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex items-center gap-2 transition hover:text-[#2563eb]"
                >
                  <Icon className="h-5 w-5 text-[#2563eb]" />
                  {item.label}
                </Link>
              );
            })}
          </div>

          <StudentSupportAssistant />
        </div>
      </div>
    </footer>
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
