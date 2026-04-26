import { Clock3, Gift, Lightbulb, Trophy } from "lucide-react";

import { PublicGuestSectionShell } from "@/components/public-guest-section-shell";

const challenges = [
  {
    title: "تحدي الاختبارات",
    desc: "اختبر نفسك في جميع المواد",
    status: "قريبًا",
    prize: "1,500 ريال",
    days: "في خلال 3 أيام",
    tone: "bg-[#fff1fb] text-[#db2777] border-[#f4d7ea]",
  },
  {
    title: "تحدي المذاكرة المركزة",
    desc: "ذاكر أكبر عدد من الأسئلة",
    status: "جارية الآن",
    prize: "750 ريال",
    days: "ينتهي بعد 2 يوم",
    tone: "bg-[#eafaf1] text-[#10b981] border-[#c9f1dd]",
  },
  {
    title: "تحدي الحفظ الكمي",
    desc: "احفظ أكبر عدد من القوانين الصحيحة",
    status: "جارية الآن",
    prize: "1,000 ريال",
    days: "ينتهي بعد 4 أيام",
    tone: "bg-[#eafaf1] text-[#10b981] border-[#c9f1dd]",
  },
];

export default function CompetitionsPage() {
  return (
    <PublicGuestSectionShell active="home">
      <section className="rounded-[1.6rem] border border-[#e6edf9] bg-white px-6 py-12 shadow-[0_24px_70px_rgba(15,34,71,0.06)] lg:px-12">
        <div className="relative text-center">
          <div className="absolute left-0 top-[-0.5rem] hidden items-center gap-3 rounded-[1.8rem] bg-[linear-gradient(180deg,#f7fbff_0%,#eef5ff_100%)] px-7 py-5 text-[#f59e0b] shadow-[0_20px_40px_rgba(15,34,71,0.05)] lg:flex">
            <Trophy className="h-20 w-20 fill-[#fbbf24]/25" />
            <Gift className="h-10 w-10 text-[#8b5cf6]" />
          </div>
          <h1 className="text-[clamp(2.1rem,4vw,3.35rem)] font-black tracking-[-0.04em] text-[#102247]">
            المسابقات والتحديات
          </h1>
          <p className="mt-4 text-lg font-medium text-[#64748b]">شارك، تنافس وتفوق على الطلاب الآخرين</p>

          <div className="mt-10 inline-flex rounded-[0.9rem] border border-[#dce7fb] bg-white p-1 text-sm font-black">
            <span className="rounded-[0.7rem] bg-[#2563eb] px-8 py-2 text-white">الكل</span>
            <span className="px-8 py-2 text-[#64748b]">جارية الآن</span>
            <span className="px-8 py-2 text-[#64748b]">قريبًا</span>
            <span className="px-8 py-2 text-[#64748b]">منتهية</span>
          </div>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {challenges.map((challenge) => (
            <article
              key={challenge.title}
              className="rounded-[1.45rem] border border-[#e4ecf8] bg-white p-7 shadow-[0_18px_44px_rgba(15,34,71,0.045)]"
            >
              <span className={`inline-flex rounded-full border px-5 py-2 text-sm font-black ${challenge.tone}`}>
                {challenge.status}
              </span>
              <h2 className="mt-8 text-2xl font-black text-[#102247]">{challenge.title}</h2>
              <p className="mt-3 text-base font-medium text-[#64748b]">{challenge.desc}</p>
              <div className="mt-8 flex items-center gap-2 text-sm font-bold text-[#64748b]">
                <Clock3 className="h-4 w-4" />
                {challenge.days}
              </div>
              <div className="mt-7 flex items-center justify-between text-lg font-black">
                <span className="text-[#94a3b8]">الجائزة</span>
                <span className="text-[#2563eb]">{challenge.prize}</span>
              </div>
              <button className="mt-8 h-11 w-full rounded-[0.8rem] border border-[#bed3fb] bg-white text-sm font-black text-[#2563eb] transition hover:bg-[#f6f9ff]">
                عرض التفاصيل
              </button>
            </article>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-5 rounded-[1.2rem] bg-[#f4f8ff] px-7 py-6 lg:flex-row lg:items-center lg:justify-between">
          <button className="h-12 rounded-[0.8rem] bg-[#2563eb] px-9 text-sm font-black text-white transition hover:bg-[#1d4ed8]">
            اقترح الآن
          </button>
          <div className="flex items-center gap-4 text-right">
            <div>
              <h3 className="text-xl font-black text-[#2563eb]">اقترح مسابقة جديدة</h3>
              <p className="mt-1 text-sm font-medium text-[#64748b]">لديك فكرة لمسابقة؟ شارك أفكارك</p>
            </div>
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fff7dc] text-[#f59e0b]">
              <Lightbulb className="h-7 w-7" />
            </span>
          </div>
        </div>
      </section>
    </PublicGuestSectionShell>
  );
}
