import { Reveal } from "@/components/reveal";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { adminActivity, adminKpis, adminQueues } from "@/data/miyaar";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/banks", label: "البنوك" },
  { href: "/dashboard", label: "لوحة الطالب" },
  { href: "/admin", label: "الإدارة" },
];

export default function AdminPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader links={navLinks} ctaHref="/banks" ctaLabel="إدارة البنوك" />
      <main className="section-shell pt-10 md:pt-14">
        <div className="mx-auto w-[min(calc(100%-2rem),1180px)]">
          <Reveal>
            <div className="surface-dark p-7">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm text-white/70">Admin Console</p>
                  <h1 className="display-font mt-3 text-4xl font-bold md:text-5xl">
                    مؤشرات المحتوى والمراجعة وإدارة المنصة
                  </h1>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold">
                    18 بنك نشط
                  </span>
                  <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold">
                    342 عنصرًا يحتاج مراجعة
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>

        <div className="mx-auto mt-10 grid w-[min(calc(100%-2rem),1180px)] gap-5 md:grid-cols-2 xl:grid-cols-4">
          {adminKpis.map((item, index) => (
            <Reveal key={item.label} delay={index * 0.04}>
              <Card>
                <CardContent className="p-6">
                  <div className="display-font text-3xl font-bold text-slate-950">{item.value}</div>
                  <p className="mt-2 text-sm text-slate-600">{item.label}</p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>

        <div className="mx-auto mt-10 grid w-[min(calc(100%-2rem),1180px)] gap-8 lg:grid-cols-[1.08fr,0.92fr]">
          <Reveal>
            <Card>
              <CardContent className="p-7">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">طوابير العمل</p>
                    <h3 className="display-font text-2xl font-bold text-slate-950">
                      العناصر التي تحتاج تدخلًا
                    </h3>
                  </div>
                  <Badge className="bg-amber-50 text-amber-700">Content Queue</Badge>
                </div>
                <div className="mt-6 space-y-3">
                  {adminQueues.map((item) => (
                    <div
                      key={item}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-slate-200/80 bg-slate-50/80 p-4"
                    >
                      <div>
                        <div className="display-font text-base font-bold text-slate-950">
                          طابور مراجعة
                        </div>
                        <div className="mt-1 text-sm leading-7 text-slate-600">{item}</div>
                      </div>
                      <span className="mini-pill bg-emerald-50 text-emerald-700">قيد التنفيذ</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Reveal>

          <div className="space-y-5">
            <Reveal delay={0.04}>
              <div className="surface-dark p-6">
                <p className="text-sm text-white/70">نشاط الإدارة</p>
                <h3 className="display-font mt-3 text-2xl font-bold text-white">
                  آخر العمليات داخل المنصة
                </h3>
                <div className="mt-5 space-y-3">
                  {adminActivity.map((item, index) => (
                    <div
                      key={item}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-[1.4rem] border border-white/10 bg-white/5 p-4"
                    >
                      <div>
                        <div className="display-font text-base font-bold text-white">
                          نشاط {index + 1}
                        </div>
                        <div className="mt-1 text-sm leading-7 text-white/70">{item}</div>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          index === 2
                            ? "bg-rose-500/15 text-rose-200"
                            : "bg-emerald-500/15 text-emerald-200"
                        }`}
                      >
                        {index === 2 ? "بحاجة متابعة" : "تم"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm font-semibold text-slate-500">لماذا هذه اللوحة مهمة؟</p>
                  <ul className="mt-4 space-y-3 text-sm leading-8 text-slate-600">
                    <li>توفر رؤية سريعة لحالة المحتوى دون فتح عشرات الصفحات.</li>
                    <li>تربط بين جودة المحتوى وحركة المستخدمين داخل المنصة.</li>
                    <li>تسهّل إدارة البنوك والقطع والتفاسير من مركز واحد.</li>
                  </ul>
                </CardContent>
              </Card>
            </Reveal>
          </div>
        </div>
      </main>
    </div>
  );
}
