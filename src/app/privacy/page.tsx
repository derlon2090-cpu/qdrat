import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/privacy", label: "الخصوصية" },
  { href: "/terms", label: "الشروط" },
  { href: "/contact", label: "تواصل معنا" },
];

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader links={navLinks} ctaHref="/exam" ctaLabel="ابدأ الآن" />
      <main className="section-shell pt-10 md:pt-14">
        <div className="mx-auto w-[min(calc(100%-2rem),920px)]">
          <Card className="rounded-[2.2rem] border-white/80 bg-white/95">
            <CardContent className="p-8">
              <p className="text-sm font-semibold text-[#123B7A]">سياسة الخصوصية</p>
              <h1 className="section-title text-right">كيف نحافظ على بياناتك داخل معيار</h1>
              <div className="mt-6 space-y-5 text-base leading-9 text-slate-700">
                <p>نجمع فقط البيانات اللازمة لتقديم تجربة تعليمية أفضل داخل منصة القدرات الكمي واللفظي.</p>
                <p>تستخدم بيانات الأداء لتخصيص الخطة اليومية، ترتيب المراجعة، وتحسين تجربة الطالب داخل المنصة.</p>
                <p>لا نشارك بياناتك الشخصية مع أطراف خارجية لأغراض تسويقية، وتبقى معلوماتك محمية ضمن بيئة المنصة.</p>
                <p>يمكنك التواصل معنا في أي وقت لطلب تحديث بياناتك أو الاستفسار عن طريقة استخدامها.</p>
              </div>
              <div className="mt-8">
                <Link href="/contact"><Button>تواصل معنا</Button></Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
