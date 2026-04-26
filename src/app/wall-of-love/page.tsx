import { Quote, Star, Heart } from "lucide-react";

import { PublicGuestSectionShell } from "@/components/public-guest-section-shell";

const testimonials = [
  {
    quote: "مسار معيار غيّر طريقتي بالمذاكرة بالكامل، الخطة منظمة والنتائج ارتفعت عندي بشكل واضح.",
    name: "أحمد الحسيني",
    role: "طالب - هندسة",
    tone: "bg-[#fff9fb] border-[#f8e6ef]",
  },
  {
    quote: "ساعدني أركز على المهم وأختصر وقتي جدًا، خصوصًا ترتيب الأقسام والملخصات السريعة.",
    name: "روان الشهري",
    role: "طالبة - طب",
    tone: "bg-[#f9fbff] border-[#e6eefc]",
  },
  {
    quote: "المساعد الذكي فهم احتياجي بسرعة، وصرت أعرف وين أبدأ بدون تشتت.",
    name: "عبدالله القحطاني",
    role: "طالب - تحصيلي",
    tone: "bg-[#f7fffb] border-[#ddf5e9]",
  },
  {
    quote: "أحب التحديات والمسابقات، تحفزني وتخليني أتعلم أشياء جديدة كل أسبوع.",
    name: "نورة المطيري",
    role: "طالبة - حاسب",
    tone: "bg-[#fbf9ff] border-[#ece3ff]",
  },
  {
    quote: "التقارير والتحليلات ساعدتني أفهم نقاط ضعفي وأطور نفسي بخطوات واضحة.",
    name: "عبدالله السبيعي",
    role: "طالب - إدارة أعمال",
    tone: "bg-[#fffdf8] border-[#f8eed6]",
  },
  {
    quote: "أنصح كل طالب يجرب معيار، التجربة مرتبة وواضحة وفيها ثقة كبيرة.",
    name: "سارة الدوسري",
    role: "طالبة - السنة الأولى",
    tone: "bg-[#f8fbff] border-[#e7efff]",
  },
];

function Stars() {
  return (
    <div className="flex items-center justify-center gap-1 text-[#fbbf24]">
      {Array.from({ length: 5 }).map((_, index) => (
        <Star key={index} className="h-4 w-4 fill-current" />
      ))}
    </div>
  );
}

export default function WallOfLovePage() {
  return (
    <PublicGuestSectionShell active="home">
      <section className="rounded-[1.8rem] border border-[#e6edf9] bg-white px-6 py-12 shadow-[0_24px_70px_rgba(15,34,71,0.06)] lg:px-10">
        <div className="text-center">
          <div className="mb-3 inline-flex items-center gap-2 text-[#ef4444]">
            <Heart className="h-5 w-5 fill-current" />
            <span className="text-[0.92rem] font-black">جدار الحب</span>
          </div>
          <h1 className="text-[clamp(2.2rem,4vw,3.4rem)] font-black tracking-[-0.04em] text-[#102247]">
            قصص نجاح حقيقية من طلاب حققوا أهدافهم
          </h1>
          <p className="mt-3 text-[1.02rem] font-medium text-[#6b7b94]">
            آراء وتجارب مرتبة تعكس وضوح الرحلة وقوة التنظيم داخل المنصة
          </p>

          <div className="mt-6 flex flex-col items-center justify-center gap-3">
            <Stars />
            <p className="text-sm font-semibold text-[#7b8ea8]">
              4.9 من 5 بناءً على أكثر من 10,000 تقييم طلابي
            </p>
          </div>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {testimonials.map((item) => (
            <article
              key={item.name}
              className={`rounded-[1.45rem] border px-6 py-6 shadow-[0_16px_36px_rgba(15,34,71,0.04)] ${item.tone}`}
            >
              <Quote className="h-6 w-6 text-[#c4cfe4]" />
              <p className="mt-4 text-[1.02rem] leading-8 text-[#41546f]">{item.quote}</p>

              <div className="mt-6 flex items-center justify-between gap-4">
                <div className="flex-1 text-right">
                  <div className="font-black text-[#102247]">{item.name}</div>
                  <div className="mt-1 text-sm text-[#7b8ea8]">{item.role}</div>
                  <div className="mt-2">
                    <Stars />
                  </div>
                </div>
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-sm font-black text-[#2563eb] shadow-sm">
                  {item.name.slice(0, 1)}
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PublicGuestSectionShell>
  );
}
