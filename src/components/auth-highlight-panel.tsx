import { FileText, Sparkles, Target, TriangleAlert, Trophy, Zap } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

type AuthHighlightMode = "login" | "register";

const authPanelContent: Record<
  AuthHighlightMode,
  {
    badge: string;
    title: string;
    description: string;
    stats: Array<{ label: string; value: string }>;
    bullets: Array<{ icon: typeof Zap; title: string; description: string }>;
  }
> = {
  login: {
    badge: "دخول فوري",
    title: "ادخل مباشرة وابدأ من آخر نقطة وصلت لها",
    description:
      "صفحة الدخول يجب أن تقودك إلى الفعل فورًا: أكمل خطتك، راجع أخطاءك، وارجع إلى ملخصاتك بدون لف طويل أو انتظار مشتت.",
    stats: [
      { label: "خطة اليوم", value: "جاهزة" },
      { label: "الأخطاء", value: "مربوطة بحسابك" },
      { label: "الملخصات", value: "محفوظة تلقائيًا" },
    ],
    bullets: [
      {
        icon: Target,
        title: "أكمل من آخر نقطة",
        description: "ارجع إلى آخر تدريب أو مهمة أو ملخص توقفت عنده مباشرة بعد تسجيل الدخول.",
      },
      {
        icon: TriangleAlert,
        title: "راجع أخطاءك بسهولة",
        description: "كل سؤال تخطئ فيه يبقى مربوطًا بحسابك حتى تتم مراجعته وإتقانه.",
      },
      {
        icon: FileText,
        title: "ملخصاتك معك دائمًا",
        description: "الملفات والملاحظات والصفحة الأخيرة التي وصلت لها تبقى محفوظة داخل المنصة.",
      },
    ],
  },
  register: {
    badge: "بداية مرتبة",
    title: "أنشئ حسابك وابدأ بخطة أوضح ومسار أكاديمي منظم",
    description:
      "من أول لحظة سيكون لديك حساب يحفظ تقدمك، أخطاءك، ومهامك اليومية حتى تكون تجربتك داخل المنصة عملية ومستمرة.",
    stats: [
      { label: "حفظ التقدم", value: "تلقائي" },
      { label: "مراجعة الأخطاء", value: "ذكية" },
      { label: "التحدي الشهري", value: "XP" },
    ],
    bullets: [
      {
        icon: Sparkles,
        title: "لوحة طالب جاهزة",
        description: "واجهة واضحة فيها الخطة اليومية، التقدم، ونقطة البداية المناسبة لك.",
      },
      {
        icon: Trophy,
        title: "نظام تحدي وتحفيز",
        description: "اجمع XP، ارفع ترتيبك، وادخل التحدي الشهري بخطوات فعلية داخل التدريب.",
      },
      {
        icon: Zap,
        title: "ابدأ بدون تعقيد",
        description: "أنشئ الحساب مرة واحدة ثم افتح الأقسام الرئيسية من لوحة بطاقات واضحة وسريعة.",
      },
    ],
  },
};

export function AuthHighlightPanel({ mode }: { mode: AuthHighlightMode }) {
  const content = authPanelContent[mode];

  return (
    <Card className="overflow-hidden rounded-[2.2rem] border-0 bg-[linear-gradient(145deg,#123B7A_0%,#12356b_48%,#0EA5A4_100%)] text-white shadow-[0_28px_70px_rgba(18,59,122,0.22)]">
      <CardContent className="relative space-y-7 p-8 md:p-10">
        <div className="absolute inset-0 opacity-20" aria-hidden>
          <div className="h-full w-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.24),transparent_26%),radial-gradient(circle_at_20%_20%,rgba(245,208,138,0.18),transparent_24%)]" />
        </div>

        <div className="relative">
          <Badge className="border-white/10 bg-white/12 text-white">{content.badge}</Badge>
          <h2 className="mt-4 display-font text-[clamp(2rem,4vw,3.2rem)] font-extrabold leading-[1.25] text-white">
            {content.title}
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-8 text-white/80 md:text-base">
            {content.description}
          </p>
        </div>

        <div className="relative grid gap-3 sm:grid-cols-3">
          {content.stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[1.35rem] border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-sm"
            >
              <div className="text-xs font-semibold tracking-[0.14em] text-white/60">{stat.label}</div>
              <div className="mt-3 display-font text-2xl font-bold text-white">{stat.value}</div>
            </div>
          ))}
        </div>

        <div className="relative space-y-3">
          {content.bullets.map((item) => {
            const Icon = item.icon;

            return (
              <div
                key={item.title}
                className="flex items-start gap-3 rounded-[1.4rem] border border-white/12 bg-white/8 px-4 py-4 backdrop-blur-sm"
              >
                <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-[1rem] bg-white/14 text-white">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="display-font text-lg font-bold text-white">{item.title}</div>
                  <div className="mt-1 text-sm leading-7 text-white/76">{item.description}</div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
