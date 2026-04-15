import { BarChart3, CheckCircle2, GraduationCap } from "lucide-react";

import { Progress } from "@/components/ui/progress";

const floatingCards = [
  { label: "25,000+ سؤال", className: "right-6 top-6" },
  { label: "120+ اختبار", className: "left-8 top-20" },
  { label: "خطة ذكية", className: "right-10 bottom-8" },
  { label: "تقدم أسبوعي", className: "-left-1 bottom-24" },
];

export function HeroShowcase() {
  return (
    <div>
      <div className="grid gap-4 lg:hidden">
        <div className="rounded-[2rem] border border-white/15 bg-white/10 p-4 text-white backdrop-blur">
          <div className="rounded-[1.6rem] border-[6px] border-[#D39B2F] bg-[linear-gradient(180deg,#0f694b,#0d8a5b)] p-5">
            <div className="text-sm text-white/75">قدرات كمي ولفظي</div>
            <h3 className="display-font mt-3 text-2xl font-bold leading-tight">
              خطة يومية واضحة واختبارات تحاكي الواقع
            </h3>
            <div className="mt-4 grid gap-2">
              {["20 سؤال كمي", "15 سؤال لفظي", "مراجعة 8 أخطاء"].map((item) => (
                <div key={item} className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium">
                  {item}
                </div>
              ))}
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

      <div className="relative hidden min-h-[540px] lg:block">
      {floatingCards.map((item) => (
        <div
          key={item.label}
          className={`absolute z-10 rounded-full border border-white/25 bg-white/12 px-4 py-2 text-sm font-semibold text-white shadow-soft backdrop-blur ${item.className}`}
        >
          {item.label}
        </div>
      ))}

      <div className="relative mx-auto flex h-[540px] w-full items-end justify-center">
        <div className="absolute left-10 top-10 h-[380px] w-[430px] rounded-[1.8rem] border-[8px] border-[#D39B2F] bg-[linear-gradient(180deg,#0f694b,#0d8a5b)] shadow-[0_30px_70px_rgba(0,0,0,0.22)]">
          <div className="absolute inset-0 rounded-[1.2rem] bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.08),transparent_20%),radial-gradient(circle_at_80%_24%,rgba(255,255,255,0.07),transparent_18%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0.10))]" />
          <div className="relative z-10 p-7 text-white">
            <div className="flex items-center gap-2 text-white/85">
              <GraduationCap className="h-5 w-5" />
              <span className="text-sm font-semibold">قدرات كمي ولفظي</span>
            </div>
            <h3 className="display-font mt-6 max-w-[260px] text-3xl font-black leading-tight">
              تمهيد يومي منظم يساعدك تقفل على اختبارك
            </h3>
            <div className="mt-6 grid gap-3">
              {[
                "خطة يومية حسب مستواك",
                "اختبارات محاكية للقدرات",
                "مراجعة ذكية للأخطاء المتكررة",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white/90"
                >
                  <CheckCircle2 className="h-4 w-4 text-[#FFE1A8]" />
                  {item}
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-3 right-8 h-2 w-20 rounded-full bg-white/80" />
        </div>

        <div className="absolute bottom-0 left-16 h-[295px] w-[138px]">
          <div className="absolute bottom-[168px] left-[32px] h-[44px] w-[44px] rounded-full bg-[#EBC3A4]" />
          <div className="absolute bottom-[182px] left-[20px] h-[28px] w-[66px] rounded-full bg-[#23242A]" />
          <div className="absolute bottom-[130px] left-[14px] h-[90px] w-[84px] rounded-t-[42px] rounded-b-[24px] bg-[#E9EBF1]" />
          <div className="absolute bottom-0 left-26 h-[142px] w-[22px] rounded-full bg-[#2E3038]" />
          <div className="absolute bottom-0 left-[58px] h-[142px] w-[24px] rounded-full bg-[#2E3038]" />
          <div className="absolute bottom-[104px] left-0 h-[20px] w-[46px] rotate-[18deg] rounded-full bg-[#E9EBF1]" />
          <div className="absolute bottom-[104px] right-0 h-[20px] w-[46px] -rotate-[16deg] rounded-full bg-[#E9EBF1]" />
          <div className="absolute bottom-[160px] left-[14px] h-[82px] w-[86px] rounded-t-[56px] rounded-b-[20px] bg-[#23242A]" />
          <div className="absolute bottom-[166px] left-[30px] h-[12px] w-[12px] rounded-full bg-[#1D1F26]" />
          <div className="absolute bottom-[166px] left-[60px] h-[12px] w-[12px] rounded-full bg-[#1D1F26]" />
        </div>

        <div className="absolute bottom-0 left-[176px] h-[360px] w-[176px]">
          <div className="absolute bottom-[230px] left-[60px] h-[52px] w-[52px] rounded-full bg-[#E6BA95]" />
          <div className="absolute bottom-[236px] left-[48px] h-[30px] w-[76px] rounded-full bg-[#8F2E32]" />
          <div className="absolute bottom-[220px] left-[32px] h-[24px] w-[112px] rounded-t-full bg-[#8F2E32]" />
          <div className="absolute bottom-[120px] left-[28px] h-[126px] w-[118px] rounded-t-[56px] bg-white" />
          <div className="absolute bottom-[110px] left-[16px] h-[24px] w-[52px] rotate-[18deg] rounded-full bg-white" />
          <div className="absolute bottom-[110px] right-[12px] h-[24px] w-[52px] -rotate-[16deg] rounded-full bg-white" />
          <div className="absolute bottom-0 left-[58px] h-[132px] w-[24px] rounded-full bg-white" />
          <div className="absolute bottom-0 left-[92px] h-[132px] w-[24px] rounded-full bg-white" />
          <div className="absolute bottom-[204px] left-[72px] h-[18px] w-[26px] rounded-full bg-[#693326]" />
          <div className="absolute bottom-[190px] left-[78px] h-[20px] w-[16px] rounded-b-full bg-[#693326]" />
        </div>

        <div className="absolute right-4 bottom-6 w-[270px] rounded-[2rem] border border-white/25 bg-white/92 p-4 shadow-[0_24px_50px_rgba(0,0,0,0.16)]">
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

          <div className="mt-4 rounded-[1.4rem] border border-[#E3C58E] bg-[#FFF6E5] p-4">
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
