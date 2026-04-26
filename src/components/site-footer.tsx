"use client";

import Link from "next/link";
import {
  FileText,
  Headphones,
  Lightbulb,
  Play,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";

import { MiyaarLogo } from "@/components/miyaar-logo";
import { StudentSupportAssistant } from "@/components/student-support-assistant";
import { useAuthSession } from "@/hooks/use-auth-session";

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
    <span className="inline-flex h-14 w-72 max-w-full items-center justify-center rounded-[1.05rem] bg-black px-5 text-center text-base font-black tracking-tight text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      {children}
    </span>
  );
}

function PublicFooter() {
  return (
    <footer className="bg-white text-[#0f3670]">
      <div className="mx-auto w-[min(calc(100%-2rem),1480px)] px-4 pb-9 pt-16 sm:w-[min(calc(100%-4rem),1480px)] lg:px-0">
        <div
          dir="rtl"
          className="grid gap-12 text-center md:grid-cols-2 md:text-right xl:grid-cols-[1.35fr_1fr_1fr_1.15fr]"
        >
          <div className="flex flex-col items-center md:items-start">
            <MiyaarLogo href="/" className="justify-center md:justify-start" />
            <p className="mt-8 max-w-sm text-xl font-medium leading-[2.1] text-[#536985]">
              منصة تعليمية مبتكرة تساعد على الاستعداد لاختبار القدرات بكفاءة وثقة.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4 md:justify-start">
              {socialLinks.map((item) => {
                const Icon = item.icon;

                return (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-[#f0f5ff] text-sm font-bold text-[#2563eb] transition hover:-translate-y-0.5 hover:bg-[#2563eb] hover:text-white"
                    aria-label={item.label}
                  >
                    {Icon ? <Icon className="h-5 w-5 fill-current" /> : item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-black text-[#0f3670]">روابط سريعة</h3>
            <div className="mt-8 flex flex-col gap-5 text-xl font-medium text-[#536985]">
              {publicQuickLinks.map((link) => (
                <Link key={link.href} href={link.href} className="transition hover:text-[#2563eb]">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-2xl font-black text-[#0f3670]">معلومات</h3>
            <div className="mt-8 flex flex-col gap-5 text-xl font-medium text-[#536985]">
              {publicInfoLinks.map((link) => (
                <Link key={link.href} href={link.href} className="transition hover:text-[#2563eb]">
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex flex-col items-center md:items-start">
            <h3 className="text-2xl font-black text-[#0f3670]">حمّل تطبيقنا</h3>
            <p className="mt-8 text-xl font-medium leading-9 text-[#536985]">
              تجربة أفضل على التطبيق
            </p>
            <div className="mt-8 flex w-full flex-col items-center gap-4 md:items-start">
              <StoreButton>Download on the App Store</StoreButton>
              <StoreButton>GET IT ON Google Play</StoreButton>
            </div>
          </div>
        </div>

        <div className="mt-16 h-px bg-[#e4ebf5]" />

        <p className="mt-9 text-center text-base font-medium text-[#8aa0bd]">
          جميع الحقوق محفوظة © 2024 معيار
        </p>
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
