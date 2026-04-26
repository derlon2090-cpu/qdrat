import { Sparkles } from "lucide-react";

import { PublicGuestSectionShell } from "@/components/public-guest-section-shell";

const pricingCards = [
  {
    name: "أساسية",
    subtitle: "للبدء",
    price: "29",
    bullets: ["خطة دراسية مخصصة", "تتبع التقدم", "إحصائيات أساسية", "دعم فني"],
    dot: "bg-[#9aa8bd]",
  },
  {
    name: "متقدمة",
    subtitle: "للنتائج الأفضل",
    price: "59",
    bullets: ["جميع مزايا الأساسية", "تحليلات متقدمة", "اختبارات ذكية", "ملخصات ومراجعات", "دعم فني أولوية"],
    dot: "bg-[#ef4444]",
    featured: true,
  },
  {
    name: "احترافية",
    subtitle: "للتميز والريادة",
    price: "99",
    bullets: ["جميع مزايا المتقدمة", "مساعد ذكي متقدم", "تحديات ومسابقات حصرية", "تقارير أداء مفصلة", "دعم فني 24/7"],
    dot: "bg-[#10b981]",
  },
];

export default function PricingPage() {
  return (
    <PublicGuestSectionShell active="plans">
      <section className="rounded-[1.8rem] border border-[#e6edf9] bg-white px-6 py-12 shadow-[0_24px_70px_rgba(15,34,71,0.06)] lg:px-10">
        <div className="text-center">
          <div className="mb-2 inline-flex items-center gap-2 text-[#fbbf24]">
            <Sparkles className="h-5 w-5" />
          </div>
          <h1 className="text-[clamp(2.2rem,4vw,3.45rem)] font-black tracking-[-0.04em] text-[#102247]">
            أسعار شفافة، قيمة حقيقية
          </h1>
          <p className="mt-3 text-[1.02rem] font-medium text-[#6b7b94]">
            اختر ما يناسبك وابدأ رحلتك بثقة
          </p>

          <div className="mt-7 inline-flex items-center rounded-full bg-[#f2f7ff] p-1.5 text-sm font-black shadow-[0_10px_24px_rgba(15,34,71,0.04)]">
            <span className="rounded-full bg-[#2563eb] px-6 py-2 text-white">شهري</span>
            <span className="px-5 py-2 text-[#6b7b94]">سنوي</span>
            <span className="mr-2 rounded-full bg-[#dbfae8] px-4 py-2 text-[#10b981]">وفر 24%</span>
          </div>
        </div>

        <div className="mx-auto mt-10 grid max-w-6xl gap-4 lg:grid-cols-3 lg:items-end">
          {pricingCards.map((plan) => (
            <article
              key={plan.name}
              className={`relative rounded-[1.55rem] border bg-white px-7 py-8 text-center shadow-[0_18px_40px_rgba(15,34,71,0.045)] ${
                plan.featured
                  ? "border-[#2563eb] shadow-[0_24px_60px_rgba(37,99,235,0.16)] lg:-translate-y-3"
                  : "border-[#e4ecf8]"
              }`}
            >
              {plan.featured ? (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#2563eb] px-7 py-1.5 text-xs font-black text-white shadow-[0_12px_24px_rgba(37,99,235,0.25)]">
                  الأكثر اختيارًا
                </div>
              ) : null}

              <h2 className="text-[2.15rem] font-black text-[#102247]">{plan.name}</h2>
              <p className="mt-2 text-sm font-medium text-[#6d7d96]">{plan.subtitle}</p>
              <div className="mt-7 text-[3.5rem] font-black tracking-tight text-[#102247]">{plan.price}</div>
              <p className="mt-2 text-sm font-semibold text-[#7d8ca3]">ريال / شهريًا</p>

              <ul className="mt-8 space-y-3 text-right text-sm font-medium text-[#61748e]">
                {plan.bullets.map((bullet) => (
                  <li key={bullet} className="flex items-center gap-3">
                    <span className={`h-1.5 w-1.5 rounded-full ${plan.dot}`} />
                    {bullet}
                  </li>
                ))}
              </ul>

              <button
                className={`mt-9 h-12 w-full rounded-[0.95rem] border text-sm font-black transition ${
                  plan.featured
                    ? "border-[#2563eb] bg-[#2563eb] text-white hover:bg-[#1d4ed8]"
                    : "border-[#bed3fb] bg-white text-[#2563eb] hover:bg-[#f6f9ff]"
                }`}
              >
                اختر الخطة
              </button>
            </article>
          ))}
        </div>
      </section>
    </PublicGuestSectionShell>
  );
}
