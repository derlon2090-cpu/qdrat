import { BarChart3, Brain, CheckCircle2, Clock3, Sparkles } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

const floatingCards = [
  { label: "25,000+ سؤال", className: "right-3 top-6 text-slate-900" },
  { label: "120+ اختبار", className: "left-3 top-24 text-violet-700 border-violet-200" },
  { label: "خطة ذكية", className: "right-8 bottom-4 text-indigo-700 border-indigo-200" },
  { label: "تقدم أسبوعي", className: "-left-2 bottom-24 text-amber-700 border-amber-200" },
];

const progressBars = [
  { label: "الإتقان", value: 82 },
  { label: "القطع", value: 64 },
  { label: "التناظر", value: 91 },
];

export function HeroShowcase() {
  return (
    <div className="relative">
      {floatingCards.map((item) => (
        <div
          key={item.label}
          className={`absolute z-10 rounded-full border bg-white/95 px-4 py-2 text-sm font-semibold shadow-soft ${item.className}`}
        >
          {item.label}
        </div>
      ))}

      <Card className="overflow-hidden rounded-[2.8rem] border-0 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.15),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.12),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.99),rgba(246,247,252,0.95))] shadow-luxe">
        <CardContent className="grid gap-4 p-5 lg:grid-cols-[0.96fr,1.04fr]">
          <div className="grid gap-4">
            <div className="surface-dark p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm text-white/70">رحلة الطالب</p>
                  <h3 className="display-font mt-2 text-2xl font-bold">
                    تجربة أقرب للطالب وأوضح للقرار
                  </h3>
                </div>
                <Badge className="border-white/10 bg-white/10 text-white">
                  قبل الاختبار بـ 18 يوم
                </Badge>
              </div>

              <div className="mt-5 rounded-[1.8rem] border border-white/10 bg-white/5 p-4">
                <div className="grid gap-4 md:grid-cols-[0.8fr,1.2fr] md:items-center">
                  <div className="mx-auto flex h-48 w-48 items-center justify-center rounded-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.22),transparent_22%),linear-gradient(145deg,rgba(255,255,255,0.14),rgba(255,255,255,0.04))]">
                    <svg viewBox="0 0 180 180" className="h-40 w-40">
                      <circle cx="90" cy="90" r="82" fill="rgba(255,255,255,0.05)" />
                      <path
                        d="M63 69c0-18 12-32 29-32 20 0 33 13 33 31 0 12-5 19-12 24-4 3-7 6-7 12v4H79v-4c0-8-4-12-8-16-5-5-8-11-8-19Z"
                        fill="#fde7b2"
                      />
                      <circle cx="92" cy="66" r="25" fill="#f2c48d" />
                      <path
                        d="M67 69c2-20 16-32 33-32 14 0 28 8 33 23-4-5-10-8-18-8-8 0-13 2-18 7-4 4-8 6-14 7-7 1-11 2-16 3Z"
                        fill="#1f2d5c"
                      />
                      <path
                        d="M54 142c7-21 22-33 41-33 23 0 38 13 45 33"
                        fill="none"
                        stroke="#ffffff"
                        strokeWidth="17"
                        strokeLinecap="round"
                      />
                      <path
                        d="M61 136c9-14 20-21 34-21 16 0 28 7 38 21"
                        fill="none"
                        stroke="#7c3aed"
                        strokeWidth="16"
                        strokeLinecap="round"
                      />
                      <rect
                        x="56"
                        y="120"
                        width="70"
                        height="25"
                        rx="12"
                        fill="#ffffff"
                        opacity="0.18"
                      />
                      <rect
                        x="98"
                        y="120"
                        width="54"
                        height="34"
                        rx="10"
                        fill="#f8e0ac"
                        opacity="0.95"
                      />
                      <rect x="105" y="128" width="40" height="6" rx="3" fill="#1f2d5c" opacity="0.7" />
                    </svg>
                  </div>

                  <div className="space-y-3">
                    <div className="rounded-[1.5rem] border border-white/10 bg-white/5 p-4">
                      <div className="flex items-center gap-2 text-white">
                        <Brain className="h-4 w-4" />
                        <span className="text-sm font-semibold">الخطة الذكية تتغير معك</span>
                      </div>
                      <p className="mt-2 text-sm leading-7 text-white/75">
                        إذا ارتفع أداؤك في التناظر أو انخفضت سرعتك في القطع، تعيد
                        المنصة ترتيب يومك تلقائيًا.
                      </p>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                        <p className="text-xs text-white/60">قبل الخطة</p>
                        <div className="mt-2 font-semibold text-white">تشتت</div>
                        <p className="mt-2 text-xs leading-6 text-white/70">
                          بنوك كثيرة ومراجعة بلا أولوية.
                        </p>
                      </div>
                      <div className="rounded-[1.4rem] border border-white/10 bg-white/5 p-4">
                        <p className="text-xs text-white/60">بعد الخطة</p>
                        <div className="mt-2 font-semibold text-white">مسار واضح</div>
                        <p className="mt-2 text-xs leading-6 text-white/70">
                          جلسة اليوم، مراجعة الغد، واختبار الأسبوع.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Card className="rounded-[2rem] border-white/80 bg-white/92">
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-500">شريط تقدم حي</p>
                      <h3 className="display-font mt-2 text-xl font-bold text-slate-950">
                        الإتقان يتغير أمامك
                      </h3>
                    </div>
                    <Sparkles className="h-5 w-5 text-violet-600" />
                  </div>
                  <div className="mt-5 space-y-4">
                    {progressBars.map((item) => (
                      <div key={item.label} className="space-y-2">
                        <div className="flex items-center justify-between gap-3 text-sm">
                          <span className="text-slate-600">{item.label}</span>
                          <span className="font-semibold text-slate-900">{item.value}%</span>
                        </div>
                        <Progress value={item.value} />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[2rem] border-white/80 bg-white/92">
                <CardContent className="p-5">
                  <p className="text-sm text-slate-500">جلسة اليوم</p>
                  <div className="mt-4 space-y-3">
                    {[
                      { icon: Clock3, label: "15 سؤال لفظي" },
                      { icon: BarChart3, label: "قطعة قصيرة" },
                      { icon: CheckCircle2, label: "مراجعة 8 أخطاء" },
                    ].map((item) => {
                      const Icon = item.icon;
                      return (
                        <div
                          key={item.label}
                          className="flex items-center gap-3 rounded-[1.3rem] border border-slate-200/80 bg-slate-50/80 p-4"
                        >
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,rgba(79,70,229,0.12),rgba(245,158,11,0.18))] text-indigo-700">
                            <Icon className="h-4 w-4" />
                          </div>
                          <span className="font-semibold text-slate-900">{item.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="rounded-[2.3rem] border border-slate-200/80 bg-white/92 p-4 shadow-soft">
            <div className="mx-auto flex h-[530px] w-[290px] flex-col rounded-[2.8rem] border border-slate-200 bg-[linear-gradient(180deg,#fbfbff,#f4f6fc)] p-4 shadow-inner">
              <div className="mx-auto h-1.5 w-24 rounded-full bg-slate-200" />

              <div className="mt-4 rounded-[1.8rem] bg-[linear-gradient(145deg,#4f46e5,#7c3aed)] p-4 text-white">
                <p className="text-xs text-white/70">لوحة الطالب</p>
                <div className="display-font mt-2 text-2xl font-bold">ماذا تذاكر اليوم؟</div>
                <p className="mt-2 text-sm leading-7 text-white/80">
                  جلسة مركزة تجمع التدريب، المراجعة، والاختبار القصير في مسار واحد.
                </p>
              </div>

              <div className="mt-4 rounded-[1.5rem] border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-xs text-slate-500">التقدم الأسبوعي</span>
                  <span className="display-font text-lg font-bold text-slate-950">78%</span>
                </div>
                <Progress value={78} className="mt-3" />
              </div>

              <div className="mt-4 grid gap-3">
                {[
                  "اختبر مستواك الآن",
                  "خطة يومية ذكية",
                  "مراجعة الأخطاء المتكررة",
                  "اختبار محاكي هذا الجمعة",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-[1.3rem] border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-800"
                  >
                    {item}
                  </div>
                ))}
              </div>

              <div className="mt-auto rounded-[1.5rem] border border-amber-200 bg-amber-50 p-4">
                <div className="text-xs text-amber-700">توصية سريعة</div>
                <div className="mt-1 font-semibold text-amber-900">
                  ابدأ بقطعة قصيرة ثم حل 15 سؤال لفظي بزمن محدد
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
