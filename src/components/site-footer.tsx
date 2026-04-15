import Link from "next/link";
import { ArrowUp, Download, MessageCircleMore, Newspaper, ShieldCheck, Smartphone } from "lucide-react";

import { MiyaarLogo } from "@/components/miyaar-logo";

const footerLinks = [
  { href: "/terms", label: "الشروط والأحكام" },
  { href: "/privacy", label: "سياسة الخصوصية" },
  { href: "/contact", label: "تواصل معنا" },
  { href: "/blog", label: "المدونة" },
  { href: "/exam", label: "اعرف مستواك في القدرات" },
  { href: "/banks", label: "بنوك الأسئلة" },
];

export function SiteFooter() {
  return (
    <footer className="mt-16 bg-[linear-gradient(180deg,#102955,#123b7a_58%,#173f82)] text-white">
      <div className="mx-auto w-[min(calc(100%-2rem),1180px)] py-8">
        <div className="flex flex-col gap-6 border-b border-white/15 pb-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap items-center gap-3 text-sm font-semibold">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2">
              <Download className="h-4 w-4" />
              حمل التطبيق قريبًا
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2">
              <Smartphone className="h-4 w-4" />
              iOS / Android
            </span>
          </div>

          <MiyaarLogo className="[&_strong]:text-white" />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-8 gap-y-4 text-base font-semibold">
          {footerLinks.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-[#F6D28B]">
              {item.label}
            </Link>
          ))}
          <Link href="#hero" className="inline-flex items-center gap-2 transition hover:text-[#F6D28B]">
            <ArrowUp className="h-4 w-4" />
            العودة للأعلى
          </Link>
        </div>

        <div className="mt-6 rounded-[1.2rem] border border-white/12 bg-[#0E2A56] px-5 py-4 text-center text-lg font-semibold">
          معيار منصة سعودية للتحضير للقدرات الكمي واللفظي بخطة يومية واضحة واختبارات محاكية ومراجعة مركزة.
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.4rem] border border-white/12 bg-white/10 p-5 backdrop-blur">
            <div className="flex items-center gap-2 text-[#FFE1A8]">
              <MessageCircleMore className="h-4 w-4" />
              <span className="text-sm font-semibold">تواصل سريع</span>
            </div>
            <p className="mt-3 text-sm leading-7 text-white/85">
              إذا عندك سؤال عن الاشتراك أو الخطة أو بنك معين، صفحة التواصل جاهزة لك.
            </p>
          </div>

          <div className="rounded-[1.4rem] border border-white/12 bg-white/10 p-5 backdrop-blur">
            <div className="flex items-center gap-2 text-[#FFE1A8]">
              <Newspaper className="h-4 w-4" />
              <span className="text-sm font-semibold">محتوى ومقالات</span>
            </div>
            <p className="mt-3 text-sm leading-7 text-white/85">
              جهزنا مساحة مستقلة للمقالات والنصائح والتحديثات حتى تكون التجربة أوضح وأكثر اكتمالًا.
            </p>
          </div>

          <div className="rounded-[1.4rem] border border-white/12 bg-white/10 p-5 backdrop-blur">
            <div className="flex items-center gap-2 text-[#FFE1A8]">
              <ShieldCheck className="h-4 w-4" />
              <span className="text-sm font-semibold">ثقة ووضوح</span>
            </div>
            <p className="mt-3 text-sm leading-7 text-white/85">
              صفحات الخصوصية والشروط أصبحت مستقلة وواضحة بدل أن تبقى روابط شكلية فقط.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-white/15 pt-5 text-sm text-white/75 md:flex-row md:items-center md:justify-between">
          <div>© 2026 معيار. جميع الحقوق محفوظة.</div>
          <div>مبني لطلاب القدرات الكمي واللفظي بواجهة واضحة ومريحة.</div>
        </div>
      </div>
    </footer>
  );
}
