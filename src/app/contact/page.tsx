import { Mail, MessageCircle, Phone } from "lucide-react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { Card, CardContent } from "@/components/ui/card";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/contact", label: "تواصل معنا" },
  { href: "/blog", label: "المدونة" },
  { href: "/privacy", label: "الخصوصية" },
];

const contactItems = [
  { icon: Mail, title: "البريد", value: "support@miyaar.sa" },
  { icon: MessageCircle, title: "واتساب", value: "+966 50 000 0000" },
  { icon: Phone, title: "هاتف", value: "+966 11 000 0000" },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader links={navLinks} ctaHref="/exam" ctaLabel="ابدأ الآن" />
      <main className="section-shell pt-10 md:pt-14">
        <div className="mx-auto w-[min(calc(100%-2rem),1080px)]">
          <div className="rounded-[2.4rem] bg-[linear-gradient(145deg,#0f264f,#123b7a_55%,#1f4c96)] p-8 text-white shadow-luxe">
            <p className="text-sm text-white/75">تواصل معنا</p>
            <h1 className="page-heading mt-5 max-w-3xl text-white">مساعدة واضحة وسريعة لطلاب معيار</h1>
            <p className="max-w-2xl text-lg leading-9 text-white/80">
              إذا كان عندك سؤال عن الاشتراك أو الخطة أو الأداء داخل المنصة، هذه الصفحة مخصصة لتسهيل الوصول إلينا.
            </p>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {contactItems.map((item) => {
              const Icon = item.icon;
              return (
                <Card key={item.title} className="rounded-[2rem] border-white/80 bg-white/95">
                  <CardContent className="p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,rgba(18,59,122,0.10),rgba(201,161,91,0.20))] text-[#123B7A]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h2 className="display-font mt-5 text-xl font-bold text-slate-950">{item.title}</h2>
                    <p className="mt-3 text-base text-slate-700">{item.value}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
