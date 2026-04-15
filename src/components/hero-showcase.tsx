import Image from "next/image";
import { BarChart3 } from "lucide-react";

import { Progress } from "@/components/ui/progress";

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
        <div className="relative mx-auto flex h-[560px] w-full items-end justify-center">
          <div className="absolute left-8 top-12 w-[452px]">
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
          </div>

          <div className="absolute right-10 bottom-8 w-[300px] rounded-[2rem] border border-white/25 bg-white/96 p-4 shadow-[0_24px_50px_rgba(0,0,0,0.16)]">
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
