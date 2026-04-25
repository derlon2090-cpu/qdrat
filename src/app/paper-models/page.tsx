import { Files } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { Reveal } from "@/components/reveal";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getInitialAuthUser } from "@/lib/server-auth";

const models = [
  { title: "نماذج لفظي", text: "ملفات تدريب مرتبة حسب المهارة والصعوبة.", cta: "تحميل الملف" },
  { title: "نماذج كمي", text: "تجميعات أساسية ومكثفة للطباعة والمراجعة.", cta: "تحميل الملف" },
  { title: "نماذج مختلطة", text: "ملفات سريعة قبل الاختبار تجمع الكمي واللفظي.", cta: "عرض الملفات" },
];

export default async function PaperModelsPage() {
  const initialAuthUser = await getInitialAuthUser();

  return (
    <PageShell
      eyebrow="نماذج الورقي"
      title="ملفات وتجميعات جاهزة للطباعة والمراجعة السريعة"
      description="صفحة مستقلة للنماذج الورقية حتى تبقى الصفحة الرئيسية خفيفة، وتصل هنا مباشرة عندما تحتاج ملفًا منظمًا للطباعة."
      icon={Files}
      iconWrap="bg-[#ecfeff]"
      iconColor="text-[#0f766e]"
      accentClass="shadow-[0_20px_45px_rgba(15,118,110,0.16)]"
      headerVariant={initialAuthUser ? "student" : "public"}
      initialAuthUser={initialAuthUser}
    >
      <div className="grid gap-5 md:grid-cols-3">
        {models.map((item, index) => (
          <Reveal key={item.title} delay={index * 0.04}>
            <Card className="rounded-[2rem] border-white/80 bg-white/95 shadow-soft">
              <CardContent className="p-8">
                <h3 className="card-title font-bold text-slate-950">{item.title}</h3>
                <p className="card-text text-slate-600">{item.text}</p>
                <div className="mt-6">
                  <Button variant={index === 0 ? "default" : "outline"}>{item.cta}</Button>
                </div>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>
    </PageShell>
  );
}
