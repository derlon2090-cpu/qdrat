import Link from "next/link";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/blog", label: "المدونة" },
  { href: "/exam", label: "الاختبار" },
  { href: "/contact", label: "تواصل معنا" },
];

const posts = [
  { title: "كيف تبني خطة يومية للقدرات الكمي واللفظي؟", text: "مقال مختصر يوضح كيف تبدأ بخطة قابلة للتنفيذ بدل الجداول المزدحمة." },
  { title: "متى تنتقل من التدريب إلى الاختبارات المحاكية؟", text: "إشارات واضحة تساعدك تعرف التوقيت المناسب للاختبار الكامل أو المصغر." },
  { title: "كيف تراجع أخطاءك بدون تكرار نفس التعثر؟", text: "طريقة عملية لتحويل الأسئلة الخاطئة إلى مسار مراجعة ذكي داخل معيار." },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader links={navLinks} ctaHref="/exam" ctaLabel="ابدأ الآن" />
      <main className="section-shell pt-10 md:pt-14">
        <div className="mx-auto w-[min(calc(100%-2rem),1120px)]">
          <div className="text-center">
            <p className="text-sm font-semibold text-[#123B7A]">المدونة</p>
            <h1 className="section-title">محتوى يساعدك تتقدم بوضوح أكثر</h1>
            <p className="section-copy mx-auto max-w-3xl">
              مقالات قصيرة، عملية، وموجهة لطلاب القدرات الكمي واللفظي داخل نفس هوية المنصة.
            </p>
          </div>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {posts.map((post) => (
              <Card key={post.title} className="h-full rounded-[2rem] border-white/80 bg-white/95">
                <CardContent className="p-6">
                  <div className="rounded-[1.2rem] bg-[linear-gradient(145deg,rgba(18,59,122,0.10),rgba(201,161,91,0.18))] px-4 py-2 text-sm font-semibold text-[#123B7A]">
                    مقال جديد
                  </div>
                  <h2 className="display-font mt-5 text-2xl font-bold text-slate-950">{post.title}</h2>
                  <p className="mt-4 text-sm leading-8 text-slate-600">{post.text}</p>
                  <div className="mt-6">
                    <Link href="/exam"><Button variant="outline">ابدأ الاختبار التشخيصي</Button></Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
