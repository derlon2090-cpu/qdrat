import { Crown, Rocket, Send, Sparkles } from "lucide-react";

import { PublicGuestSectionShell } from "@/components/public-guest-section-shell";

const planCards = [
  {
    title: "الخطة الأساسية",
    name: "الأساسية",
    price: "29",
    note: "للبداية وتنظيم المذاكرة بذكاء",
    icon: Send,
    tint: "bg-[#faf7ff] border-[#ece3ff]",
    iconTone: "bg-[#f2ebff] text-[#8b5cf6]",
    button: "border-[#d9caff] text-[#7c5ce5] hover:bg-[#faf7ff]",
    bullets: ["خطة دراسية مخصصة", "تتبع التقدم", "إحصائيات أساسية", "دعم فني سريع"],
  },
  {
    title: "الخطة المتقدمة",
    name: "المتقدمة",
    price: "59",
    note: "لمن يريد نتائج أفضل وتقدماً أسرع",
    icon: Crown,
    tint: "bg-white border-[#3b82f6]",
    iconTone: "bg-[#eff5ff] text-[#2563eb]",
    button: "border-[#2563eb] bg-[#2563eb] text-white hover:bg-[#1d4ed8]",
    bullets: ["جميع مزايا الأساسية", "تحليلات متقدمة", "اختبارات ذكية", "ملخصات ومراجعات", "دعم فني أولوية"],
    featured: true,
  },
  {
    title: "الخطة الاحترافية",
    name: "الاحترافية",
    price: "99",
    note: "للطموحين الذين يسعون للتميز",
    icon: Rocket,
    tint: "bg-[#f4fffb] border-[#d9f6eb]",
    iconTone: "bg-[#e8fbf3] text-[#10b981]",
    button: "border-[#c9f1dd] text-[#10b981] hover:bg-[#f2fffa]",
    bullets: ["جميع مزايا المتقدمة", "مساعد ذكي متقدم", "تحديات ومسابقات حصرية", "تقارير أداء مفصلة", "دعم فني 24/7"],
  },
];

export default function PlansPage() {
  return (
    <PublicGuestSectionShell active="plans">
      <section className="rounded-[1.8rem] border border-[#e6edf9] bg-white px-6 py-12 shadow-[0_24px_70px_rgba(15,34,71,0.06)] lg:px-10">
        <div className="text-center">
          <div className="mb-2 inline-flex items-center gap-2 text-[#5e8eff]">
            <Sparkles className="h-4 w-4" />
            <span className="text-[0.88rem] font-bold">خطط مرنة</span>
          </div>
          <h1 className="text-[clamp(2.2rem,4vw,3.5rem)] font-black tracking-[-0.04em] text-[#102247]">
            اختر الخطة المناسبة لك
          </h1>
          <p className="mt-3 text-[1.02rem] font-medium text-[#6b7b94]">
            خطط مرنة تناسب احتياجاتك في رحلتك الدراسية
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-6xl gap-4 lg:grid-cols-3 lg:items-end">
          {planCards.map((plan) => {
            const Icon = plan.icon;

            return (
              <article
                key={plan.name}
                className={`relative rounded-[1.55rem] border px-7 py-8 text-center shadow-[0_18px_40px_rgba(15,34,71,0.045)] ${plan.tint} ${
                  plan.featured ? "lg:-translate-y-3" : ""
                }`}
              >
                {plan.featured ? (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#2563eb] px-7 py-1.5 text-xs font-black text-white shadow-[0_12px_24px_rgba(37,99,235,0.25)]">
                    الأكثر اختيارًا
                  </div>
                ) : null}

                <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-[1.3rem] ${plan.iconTone}`}>
                  <Icon className="h-7 w-7" />
                </div>
                <p className="mt-5 text-sm font-extrabold text-[#55708f]">{plan.title}</p>
                <h2 className="mt-2 text-[2.15rem] font-black text-[#102247]">{plan.name}</h2>
                <p className="mt-2 text-sm font-medium text-[#6d7d96]">{plan.note}</p>
                <div className="mt-7 text-[3.5rem] font-black tracking-tight text-[#102247]">{plan.price}</div>
                <p className="mt-2 text-sm font-semibold text-[#7d8ca3]">ريال / شهريًا</p>

                <ul className="mt-8 space-y-3 text-right text-sm font-medium text-[#61748e]">
                  {plan.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-center gap-3">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#a3b3c8]" />
                      {bullet}
                    </li>
                  ))}
                </ul>

                <button
                  className={`mt-9 h-12 w-full rounded-[0.95rem] border text-sm font-black transition ${plan.button}`}
                >
                  اختر الخطة
                </button>
              </article>
            );
          })}
        </div>
      </section>
    </PublicGuestSectionShell>
  );
}
