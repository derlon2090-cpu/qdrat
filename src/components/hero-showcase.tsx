import Image from "next/image";
import { BarChart3, CheckCircle2, GraduationCap } from "lucide-react";

import { Progress } from "@/components/ui/progress";

const floatingCards = [
  { label: "25,000+ سؤال", className: "right-8 top-8" },
  { label: "120+ اختبار", className: "left-8 top-20" },
  { label: "خطة ذكية", className: "right-10 bottom-10" },
];

export function HeroShowcase() {
  return (
    <div>
      <div className="grid gap-4 lg:hidden">
        <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 text-white backdrop-blur">
          <div className="relative overflow-hidden rounded-[1.8rem] border-[6px] border-[#D3A14B] bg-[linear-gradient(180deg,#123B7A,#15305F)]">
            <div className="relative h-[320px]">
              <Image
                src="/hero-characters-source.png"
                alt="طلاب يستعدون لاختبار القدرات"
                fill
                priority
                className="object-cover object-[42%_12%] scale-[1.03]"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,28,58,0.08),rgba(9,28,58,0.02))]" />
            </div>
            <div className="absolute left-4 top-4 rounded-full border border-white/20 bg-[#123B7A]/80 px-3 py-2 text-sm font-semibold text-white backdrop-blur">
              +120 اختبار
            </div>
            <div className="absolute bottom-4 right-4 rounded-full border border-white/20 bg-[#123B7A]/78 px-3 py-2 text-sm font-semibold text-white backdrop-blur">
              خطة ذكية
            </div>
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/15 bg-white/92 p-4 shadow-soft">
          <div className="rounded-[1.5rem] bg-[linear-gradient(145deg,#123B7A,#1f4c96)] p-4 text-white">
            <div className="text-xs text-white/70">شريط تقدم حي</div>
            <div className="display-font mt-2 text-xl font-bold">الإتقان 82%</div>
          </div>
          <div className="mt-4 grid gap-3">
            {[
              { label: "الكمي", value: 86 },
              { label: "اللفظي", value: 79 },
            ].map((item) => (
              <div key={item.label} className="rounded-[1.3rem] border border-slate-200 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-semibold text-slate-900">{item.label}</span>
                  <span className="text-sm font-bold text-[#123B7A]">{item.value}%</span>
                </div>
                <Progress value={item.value} className="mt-3" />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="relative hidden min-h-[560px] lg:block">
        {floatingCards.map((item) => (
          <div
            key={item.label}
            className={`absolute z-10 rounded-full border border-white/25 bg-white/12 px-4 py-2 text-sm font-semibold text-white shadow-soft backdrop-blur ${item.className}`}
          >
            {item.label}
          </div>
        ))}

        <div className="relative mx-auto flex h-[560px] w-full items-end justify-center">
          <div className="absolute left-8 top-10 w-[460px]">
            <div className="rounded-[2rem] border-[8px] border-[#D3A14B] bg-[linear-gradient(180deg,#14325f,#123b7a)] p-2 shadow-[0_30px_70px_rgba(0,0,0,0.22)]">
              <div className="relative overflow-hidden rounded-[1.5rem]">
                <div className="relative h-[382px]">
                  <Image
                    src="/hero-characters-source.png"
                    alt="طلاب وطالبات القدرات"
                    fill
                    priority
                    className="object-cover object-[42%_12%] scale-[1.02]"
                  />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_18%,rgba(18,59,122,0.08),transparent_20%),linear-gradient(180deg,rgba(9,28,58,0.08),rgba(9,28,58,0.02))]" />
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-[1.8rem] border border-white/15 bg-white/10 p-5 text-white backdrop-blur">
              <div className="flex items-center gap-2 text-white/85">
                <GraduationCap className="h-5 w-5" />
                <span className="text-sm font-semibold">قدرات كمي ولفظي</span>
              </div>
              <div className="mt-4 grid gap-3">
                {[
                  "أسئلة متنوعة واختبارات محاكية",
                  "خطة يومية حسب مستواك",
                  "مراجعة ذكية للأخطاء المتكررة",
                ].map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/90"
                  >
                    <CheckCircle2 className="h-4 w-4 text-[#F6D28B]" />
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="absolute right-6 bottom-8 w-[290px] rounded-[2rem] border border-white/25 bg-white/95 p-4 shadow-[0_24px_50px_rgba(0,0,0,0.16)]">
            <div className="rounded-[1.5rem] bg-[linear-gradient(145deg,#123B7A,#1f4c96)] p-4 text-white">
              <div className="text-xs text-white/70">جلسة اليوم</div>
              <div className="display-font mt-2 text-xl font-bold">20 كمي + 15 لفظي</div>
              <div className="mt-2 text-sm text-white/80">ثم مراجعة 8 أخطاء قبل الاختبار المصغّر</div>
            </div>

            <div className="mt-4 rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs text-slate-500">الإتقان العام</span>
                <span className="display-font text-lg font-bold text-slate-950">82%</span>
              </div>
              <Progress value={82} className="mt-3" />
            </div>

            <div className="mt-4 grid gap-3">
              {[
                { label: "الكمي", value: 86 },
                { label: "اللفظي", value: 79 },
              ].map((item) => (
                <div key={item.label} className="rounded-[1.3rem] border border-slate-200 bg-white p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-semibold text-slate-900">{item.label}</span>
                    <span className="text-sm font-bold text-[#123B7A]">{item.value}%</span>
                  </div>
                  <Progress value={item.value} className="mt-3" />
                </div>
              ))}
            </div>

            <div className="mt-4 rounded-[1.4rem] border border-[#E3C58E] bg-[#FFF7E8] p-4">
              <div className="flex items-center gap-2 text-[#123B7A]">
                <BarChart3 className="h-4 w-4" />
                <span className="text-sm font-semibold">توصية سريعة</span>
              </div>
              <div className="mt-2 text-sm leading-7 text-slate-700">
                إذا أنهيت الكمي بسرعة اليوم، انتقل مباشرة إلى لفظي تناظر قبل المراجعة.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
