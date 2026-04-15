import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/terms", label: "الشروط" },
  { href: "/privacy", label: "الخصوصية" },
  { href: "/contact", label: "تواصل معنا" },
];

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader links={navLinks} ctaHref="/exam" ctaLabel="ابدأ الآن" />
      <main className="section-shell pt-10 md:pt-14">
        <div className="mx-auto w-[min(calc(100%-2rem),920px)]">
          <Card className="rounded-[2.2rem] border-white/80 bg-white/95">
            <CardContent className="p-8">
              <p className="text-sm font-semibold text-[#123B7A]">الشروط والأحكام</p>
              <h1 className="section-title text-right">استخدام واضح ومنظم لمنصة معيار</h1>
              <div className="mt-6 space-y-5 text-base leading-9 text-slate-700">
                <p>المنصة مخصصة للتحضير لاختبار القدرات الكمي واللفظي عبر محتوى تدريبي وخطط واختبارات محاكية.</p>
                <p>يجب استخدام الحساب الشخصي بشكل فردي وعدم مشاركة بيانات الدخول مع أطراف أخرى.</p>
                <p>أي محتوى تدريبي أو تقارير أو خطط داخل المنصة مخصص للاستخدام الشخصي ولا يسمح بإعادة نشره دون إذن.</p>
                <p>قد تتطور مزايا المنصة وواجهاتها بمرور الوقت بهدف تحسين التجربة، مع الحفاظ على جوهر الخدمة الأساسية.</p>
              </div>
              <div className="mt-8">
                <Link href="/privacy"><Button variant="outline">راجع سياسة الخصوصية</Button></Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
