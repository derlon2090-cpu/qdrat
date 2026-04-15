import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  Clock3,
  Database,
  FileText,
  Filter,
  LayoutDashboard,
  Medal,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  Target,
  Trophy,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";

const banks = [
  {
    id: 1,
    title: "لفظي — تناظر لفظي",
    count: 1840,
    level: "متوسط",
    type: "لفظي",
    tag: "إدراك العلاقة",
  },
  {
    id: 2,
    title: "لفظي — إكمال الجمل",
    count: 1260,
    level: "سهل",
    type: "لفظي",
    tag: "السياق",
  },
  {
    id: 3,
    title: "قطع — استيعاب المقروء",
    count: 920,
    level: "متقدم",
    type: "قطع",
    tag: "الفكرة العامة",
  },
  {
    id: 4,
    title: "لفظي — الخطأ السياقي",
    count: 780,
    level: "متوسط",
    type: "لفظي",
    tag: "تحليل المعنى",
  },
  {
    id: 5,
    title: "قطع — تحليل العلاقات",
    count: 530,
    level: "متقدم",
    type: "قطع",
    tag: "الاستنتاج",
  },
  {
    id: 6,
    title: "لفظي — المفردة الشاذة",
    count: 1110,
    level: "سهل",
    type: "لفظي",
    tag: "التصنيف",
  },
];

const heroStats = [
  { label: "سؤال تدريبي", value: "25,000+", icon: Database },
  { label: "اختبار محاكي", value: "120+", icon: FileText },
  { label: "خطة يومية", value: "تكيفية", icon: Target },
  { label: "لوحة تقدم", value: "فورية", icon: BarChart3 },
];

const coreFeatures = [
  {
    title: "بنوك أسئلة مرتبة",
    text: "تصنيف حسب المهارة، الصعوبة، ونسبة التكرار حتى يصل الطالب للتدريب المناسب بسرعة.",
    icon: Database,
  },
  {
    title: "خطة ذكية تتغير",
    text: "المسار اليومي يتبدل حسب الأداء الحقيقي، وقت الاختبار، ونوع الأخطاء المتكررة.",
    icon: Brain,
  },
  {
    title: "اختبارات تحاكي الواقع",
    text: "مؤقت، انتقال سريع، مراجعة قبل التسليم، وتقرير يشرح الأداء بدل مجرد رقم.",
    icon: Clock3,
  },
  {
    title: "تجربة عربية راقية",
    text: "واجهة RTL واضحة، مساحات مريحة، وتسلسل بصري يركز الطالب على التقدم لا على التشتيت.",
    icon: Sparkles,
  },
];

const platformSections = [
  {
    title: "بنوك الأسئلة",
    text: "بحث وفلترة وتخصيص حسب النوع والمهارة والصعوبة والتكرار.",
    icon: Filter,
  },
  {
    title: "قسم القطع",
    text: "عرض القطعة مرة واحدة مع ربط عدة أسئلة بها ومراجعة تفسيرية بعد الحل.",
    icon: BookOpen,
  },
  {
    title: "الاختبار المحاكي",
    text: "تجربة قريبة من الاختبار الحقيقي بزمن، مراجعة، وتقرير نهائي واضح.",
    icon: Trophy,
  },
  {
    title: "لوحة الطالب",
    text: "تقدم، نقاط ضعف، توصيات، وخطة هذا الأسبوع في مكان واحد.",
    icon: LayoutDashboard,
  },
  {
    title: "المراجعة الذكية",
    text: "ترتيب تلقائي للأخطاء المتكررة والأسئلة المحفوظة والأسئلة المشابهة.",
    icon: ShieldCheck,
  },
  {
    title: "لوحة الإدارة",
    text: "إدارة الأسئلة والقطع والبنوك والمستخدمين بدون تعقيد في البنية.",
    icon: Users,
  },
];

const smartAdvantages = [
  "ربط القطعة بجدول مستقل بدل تكرار نصها داخل كل سؤال.",
  "تحليل سبب الخطأ: فهم، سرعة، تشتت، أو ضعف في مهارة محددة.",
  "تقسيم اللفظي إلى مهارات دقيقة تفيد في الخطط والتقارير.",
  "اختبارات مخصصة ينشئها الطالب حسب النوع والمدة والمستوى.",
  "مراجعة تفسيرية تشرح الإجابة الصحيحة والخاطئة بشكل تعليمي.",
];

const roadmap = [
  "الصفحة الرئيسية وتجربة التسجيل",
  "بنوك اللفظي والقطع",
  "صفحة القطعة المرتبطة بعدة أسئلة",
  "الاختبار المحاكي بالمؤقت",
  "النتائج والمراجعة وحفظ الأسئلة",
  "لوحة الطالب ولوحة الإدارة",
];

const techStack = [
  "Next.js للتطبيق والصفحات والتوسع المستقبلي",
  "Tailwind CSS + shadcn/ui لواجهة مرنة وسريعة البناء",
  "Neon PostgreSQL لعلاقات الأسئلة والقطع والمحاولات",
  "Clerk أو Supabase Auth لتسجيل الدخول وإدارة الحسابات",
  "PostHog للتحليلات وتتبع التفاعل داخل المنصة",
  "PostgreSQL Full Text Search للبحث داخل البنوك والمحتوى",
];

function MiyaarLogo({ className = "" }) {
  return (
    <div className={`flex items-center gap-3 ${className}`} dir="rtl">
      <div className="relative h-12 w-12 overflow-hidden rounded-[20px] bg-[linear-gradient(145deg,#0f172a,#1e293b_55%,#b8924f)] shadow-[0_18px_35px_rgba(15,23,42,0.22)]">
        <div className="absolute inset-[5px] rounded-[16px] border border-white/15" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="relative h-7 w-7">
            <div className="absolute right-0 top-0 h-7 w-1.5 rounded-full bg-white" />
            <div className="absolute right-0 top-0 h-1.5 w-7 rounded-full bg-white" />
            <div className="absolute bottom-0 left-0 h-1.5 w-5 rounded-full bg-[#f5d58b]" />
            <div className="absolute bottom-0 left-0 h-5 w-1.5 rounded-full bg-[#f5d58b]" />
            <div className="absolute right-2 top-2 h-3.5 w-3.5 rounded-full border-2 border-white/80" />
          </div>
        </div>
      </div>
      <div>
        <div className="text-2xl font-black tracking-tight text-slate-950">معيار</div>
        <div className="text-xs text-slate-500">قياس ذكي للتفوق</div>
      </div>
    </div>
  );
}

function SectionTitle({
  badge,
  title,
  text,
}: {
  badge: string;
  title: string;
  text: string;
}) {
  return (
    <div className="mx-auto max-w-3xl text-center" dir="rtl">
      <Badge className="rounded-full border border-[#d7c08a] bg-[#fff6dd] px-4 py-1 text-sm text-[#7a5a1f]">
        {badge}
      </Badge>
      <h2 className="mt-4 text-3xl font-black tracking-tight text-slate-950 md:text-4xl">
        {title}
      </h2>
      <p className="mt-3 text-base leading-8 text-slate-600 md:text-lg">{text}</p>
    </div>
  );
}

export default function MiyaarPlatformPrototype() {
  const [query, setQuery] = useState("");
  const [tab, setTab] = useState("all");

  const filteredBanks = useMemo(() => {
    const normalizedQuery = query.trim();

    return banks.filter((bank) => {
      const matchesTab = tab === "all" || bank.type === tab;

      if (!normalizedQuery) {
        return matchesTab;
      }

      const haystack = `${bank.title} ${bank.level} ${bank.type} ${bank.tag}`;
      return matchesTab && haystack.includes(normalizedQuery);
    });
  }, [query, tab]);

  return (
    <div
      className="min-h-screen bg-[linear-gradient(180deg,#f8f5ee_0%,#fffdf9_35%,#f2efe7_100%)] text-slate-900"
      dir="rtl"
      style={{ fontFamily: "'IBM Plex Sans Arabic', 'Cairo', sans-serif" }}
    >
      <div className="absolute inset-x-0 top-0 -z-10 h-[560px] bg-[radial-gradient(circle_at_top_right,rgba(184,146,79,0.24),transparent_28%),radial-gradient(circle_at_top_left,rgba(15,23,42,0.16),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.72),transparent)]" />

      <header className="sticky top-0 z-40 border-b border-white/60 bg-[#fffcf5]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 md:px-6">
          <MiyaarLogo />
          <nav className="hidden items-center gap-7 text-sm font-medium text-slate-600 md:flex">
            <a href="#features" className="transition hover:text-slate-950">
              المزايا
            </a>
            <a href="#banks" className="transition hover:text-slate-950">
              بنوك الأسئلة
            </a>
            <a href="#journey" className="transition hover:text-slate-950">
              رحلة الطالب
            </a>
            <a href="#build" className="transition hover:text-slate-950">
              البناء
            </a>
          </nav>
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="rounded-2xl text-slate-700">
              تسجيل الدخول
            </Button>
            <Button className="rounded-2xl bg-slate-950 px-5 text-white hover:bg-slate-800">
              ابدأ الآن
            </Button>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 md:grid-cols-[1.05fr,0.95fr] md:px-6 md:py-20">
          <div className="flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge className="rounded-full border border-[#e8d8aa] bg-[#fff7e2] px-4 py-1.5 text-sm text-[#7a5a1f]">
                منصة قدرات عربية حديثة للفظي والقطع
              </Badge>
              <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-slate-950 md:text-6xl">
                ابنِ درجتك مع
                <span className="bg-[linear-gradient(135deg,#0f172a,#38557a,#b8924f)] bg-clip-text text-transparent">
                  {" "}
                  معيار{" "}
                </span>
                داخل تجربة أسرع، أهدأ، وأذكى.
              </h1>
              <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">
                معيار ليست مجرد منصة أسئلة. هي منظومة تدريب عربية راقية تجمع البنوك
                الضخمة، القطع المترابطة، الاختبارات المحاكية، والخطة اليومية الذكية
                داخل واجهة واضحة تشجع الطالب على الاستمرار.
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Button className="rounded-2xl bg-slate-950 px-6 py-6 text-base text-white hover:bg-slate-800">
                  ابدأ مجانًا
                </Button>
                <Button
                  variant="outline"
                  className="rounded-2xl border-slate-300 bg-white/70 px-6 py-6 text-base"
                >
                  شاهد التجربة
                </Button>
              </div>
              <div className="mt-8 grid max-w-2xl grid-cols-2 gap-4 md:grid-cols-4">
                {heroStats.map((item) => {
                  const Icon = item.icon;

                  return (
                    <Card
                      key={item.label}
                      className="rounded-[28px] border border-white/70 bg-white/80 shadow-[0_16px_40px_rgba(148,163,184,0.12)] backdrop-blur"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Icon className="h-4 w-4 text-[#8b6a2f]" />
                          <span className="text-xs">{item.label}</span>
                        </div>
                        <div className="mt-2 text-2xl font-black">{item.value}</div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="absolute -left-4 -top-4 rounded-[28px] border border-[#ecd9a8] bg-[#fff9e7]/90 px-4 py-3 shadow-lg backdrop-blur">
              <div className="flex items-center gap-2 text-sm font-semibold text-[#7a5a1f]">
                <Sparkles className="h-4 w-4" />
                توصية ذكية لليوم
              </div>
              <div className="mt-1 text-sm text-slate-600">
                12 سؤال لفظي + قطعة قصيرة + اختبار سرعة 10 دقائق
              </div>
            </div>

            <Card className="overflow-hidden rounded-[36px] border-0 bg-[linear-gradient(145deg,#0f172a,#16253d_56%,#243b57)] text-white shadow-[0_30px_80px_rgba(15,23,42,0.28)]">
              <CardContent className="p-0">
                <div className="border-b border-white/10 px-6 py-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-lg font-bold">لوحة معيار الذكية</div>
                      <div className="mt-1 text-sm text-slate-300">
                        تجربة مركزة مصممة للطالب السعودي
                      </div>
                    </div>
                    <Badge className="rounded-full border border-white/15 bg-white/10 text-white">
                      MVP
                    </Badge>
                  </div>
                </div>

                <div className="grid gap-4 p-5 md:grid-cols-2">
                  <div className="rounded-[28px] bg-white/5 p-5">
                    <div className="flex items-center gap-2 text-sm text-slate-300">
                      <LayoutDashboard className="h-4 w-4" />
                      مستوى الإتقان الحالي
                    </div>
                    <div className="mt-3 text-4xl font-black">78%</div>
                    <Progress value={78} className="mt-4 h-2 bg-white/10" />
                    <div className="mt-4 text-sm text-slate-300">
                      أقوى مهارة: التناظر اللفظي. أضعف مهارة: استنتاج الفكرة العامة
                      في القطع.
                    </div>
                  </div>

                  <div className="rounded-[28px] bg-[linear-gradient(145deg,#b8924f,#d5b36f)] p-5 text-slate-950">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <Trophy className="h-4 w-4" />
                      هدف الأسبوع
                    </div>
                    <div className="mt-3 text-2xl font-black">
                      رفع سرعة الحل بنسبة 15%
                    </div>
                    <div className="mt-2 text-sm text-slate-800/85">
                      3 جلسات تدريب + اختبار محاكي مساء الجمعة
                    </div>
                    <Button className="mt-5 rounded-2xl bg-slate-950 text-white hover:bg-slate-800">
                      ابدأ جلسة اليوم
                    </Button>
                  </div>

                  <div className="rounded-[28px] bg-white/5 p-5 md:col-span-2">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-sm text-slate-300">
                          <Medal className="h-4 w-4" />
                          توصيات مبنية على أدائك
                        </div>
                        <div className="mt-1 text-sm text-slate-400">
                          انتقل بين مسارات مناسبة للحظة الحالية
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Badge className="rounded-full bg-white/10 text-white">
                          قطع
                        </Badge>
                        <Badge className="rounded-full bg-white/10 text-white">
                          سرعة
                        </Badge>
                        <Badge className="rounded-full bg-white/10 text-white">
                          مراجعة
                        </Badge>
                      </div>
                    </div>
                    <div className="mt-4 grid gap-3 md:grid-cols-3">
                      {[
                        "قطعة قصيرة مع 4 أسئلة استنتاج",
                        "15 سؤال إكمال جمل بزمن محدد",
                        "مراجعة الأخطاء المتكررة آخر 7 أيام",
                      ].map((item) => (
                        <div
                          key={item}
                          className="rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </section>

        <section id="features" className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-16">
          <SectionTitle
            badge="القيمة"
            title="ما الذي يجعل معيار أقوى من المنصات التقليدية؟"
            text="بدل واجهة مزدحمة أو تدريب عام للجميع، معيار يبني تجربة أهدأ وأكثر دقة: محتوى منظم، تحليل أخطاء، وخطة تتشكل حسب مستوى الطالب."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {coreFeatures.map((feature, index) => {
              const Icon = feature.icon;

              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.3 }}
                  transition={{ duration: 0.45, delay: index * 0.05 }}
                >
                  <Card className="h-full rounded-[32px] border border-white/80 bg-white/80 shadow-[0_14px_38px_rgba(148,163,184,0.12)] transition hover:-translate-y-1 hover:shadow-[0_24px_50px_rgba(148,163,184,0.2)]">
                    <CardContent className="p-6">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,#fff6dc,#ebd2a0)] text-[#7a5a1f]">
                        <Icon className="h-6 w-6" />
                      </div>
                      <h3 className="mt-5 text-xl font-black">{feature.title}</h3>
                      <p className="mt-3 text-sm leading-7 text-slate-600">
                        {feature.text}
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-14">
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {platformSections.map((section) => {
              const Icon = section.icon;

              return (
                <Card
                  key={section.title}
                  className="rounded-[30px] border border-[#ebe7dc] bg-[#fffdfa] shadow-sm"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white">
                        <Icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-black">{section.title}</h3>
                    </div>
                    <p className="mt-4 text-sm leading-7 text-slate-600">{section.text}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section id="banks" className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-16">
          <div className="grid gap-8 lg:grid-cols-[1.2fr,0.8fr]">
            <div>
              <SectionTitle
                badge="البنوك"
                title="إدارة ضخمة ومرتبة لأسئلة القدرات"
                text="فلترة سريعة، تصنيف حسب المهارة، وربط أسئلة القطع بالنص الأصلي لتقليل التكرار وتحسين الأداء داخل التجربة."
              />

              <div className="mt-8 rounded-[32px] border border-slate-200/80 bg-white/85 p-4 shadow-[0_16px_40px_rgba(148,163,184,0.1)] backdrop-blur">
                <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div className="relative w-full md:max-w-md">
                    <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                    <Input
                      value={query}
                      onChange={(event) => setQuery(event.target.value)}
                      placeholder="ابحث: قطعة، تناظر، صعب..."
                      className="rounded-2xl border-slate-200 pr-10"
                    />
                  </div>

                  <div className="flex gap-2">
                    {[
                      ["all", "الكل"],
                      ["لفظي", "لفظي"],
                      ["قطع", "قطع"],
                    ].map(([value, label]) => (
                      <Button
                        key={value}
                        variant={tab === value ? "default" : "outline"}
                        onClick={() => setTab(value)}
                        className={
                          tab === value
                            ? "rounded-2xl bg-slate-950 text-white hover:bg-slate-800"
                            : "rounded-2xl"
                        }
                      >
                        {label}
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="mt-5 grid gap-3">
                  {filteredBanks.map((bank) => (
                    <div
                      key={bank.id}
                      className="flex flex-col gap-4 rounded-[28px] border border-slate-200/90 p-4 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-lg font-black">{bank.title}</h3>
                          <Badge className="rounded-full bg-slate-950 text-white">
                            {bank.type}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="rounded-full border-[#d7c08a] text-[#7a5a1f]"
                          >
                            {bank.level}
                          </Badge>
                          <Badge
                            variant="outline"
                            className="rounded-full border-slate-200 bg-slate-50"
                          >
                            {bank.tag}
                          </Badge>
                        </div>
                        <div className="mt-2 text-sm text-slate-600">
                          بنك جاهز للتدريب السريع، الاختبار المخصص، أو إضافته مباشرة إلى
                          مسار الطالب اليومي.
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="text-left md:text-right">
                          <div className="text-2xl font-black">
                            {bank.count.toLocaleString("en-US")}
                          </div>
                          <div className="text-xs text-slate-500">سؤال</div>
                        </div>
                        <Button className="rounded-2xl bg-slate-950 text-white hover:bg-slate-800">
                          استعراض
                          <ArrowLeft className="mr-2 h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}

                  {!filteredBanks.length ? (
                    <div className="rounded-[28px] border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-sm text-slate-500">
                      لا توجد نتائج مطابقة للبحث الحالي.
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <Card className="rounded-[32px] border-0 bg-[linear-gradient(145deg,#0f172a,#18263d_60%,#304764)] text-white shadow-xl">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 text-sm text-slate-300">
                    <BookOpen className="h-4 w-4" />
                    بنية السؤال المقترحة
                  </div>
                  <div className="mt-5 space-y-3 text-sm text-slate-200">
                    <div className="rounded-2xl bg-white/5 p-4">
                      `Question` → نص السؤال + النوع + المهارة + الصعوبة
                    </div>
                    <div className="rounded-2xl bg-white/5 p-4">
                      `Passage` → القطعة النصية مرة واحدة وترتبط بعدة أسئلة
                    </div>
                    <div className="rounded-2xl bg-white/5 p-4">
                      `Choices` → الاختيارات + الإجابة الصحيحة + التفسير
                    </div>
                    <div className="rounded-2xl bg-white/5 p-4">
                      `Attempts` → إجابات الطالب + الزمن + الثقة + المراجعة
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-[32px] border-0 shadow-sm">
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <Brain className="h-4 w-4" />
                    لماذا هذه البنية أقوى؟
                  </div>
                  <ul className="mt-4 space-y-3 text-sm leading-7 text-slate-700">
                    {smartAdvantages.map((item) => (
                      <li key={item} className="flex gap-2">
                        <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-emerald-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section id="journey" className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-16">
          <SectionTitle
            badge="رحلة الطالب"
            title="واجهة متابعة تصنع عادة يومية لا مجرد استخدام عابر"
            text="الهدف هنا ليس استعراض المحتوى فقط، بل تحويل المذاكرة إلى مسار واضح: هدف أسبوعي، تقدم محسوس، ومراجعة ذكية بدون ازدحام."
          />

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            <Card className="rounded-[32px] border-0 shadow-sm md:col-span-2">
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xl font-black">مسار هذا الأسبوع</div>
                    <div className="mt-1 text-sm text-slate-500">
                      خطة تكيفية مبنية على نتائج الطالب الحالية
                    </div>
                  </div>
                  <Badge className="rounded-full border border-[#e6d19e] bg-[#fff4d7] px-4 py-1 text-[#7a5a1f]">
                    Adaptive Plan
                  </Badge>
                </div>

                <div className="mt-6 space-y-4">
                  {[
                    ["اليوم 1", "إكمال جمل + سرعة", 80],
                    ["اليوم 2", "قطعة قصيرة + استنتاج", 55],
                    ["اليوم 3", "مراجعة أخطاء متكررة", 30],
                    ["اليوم 4", "اختبار محاكي مصغر", 12],
                  ].map(([day, title, value]) => (
                    <div
                      key={day}
                      className="rounded-[28px] border border-slate-200 p-4"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <div className="text-sm text-slate-500">{day}</div>
                          <div className="font-bold">{title}</div>
                        </div>
                        <div className="w-40">
                          <Progress value={Number(value)} className="h-2" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[32px] border-0 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Star className="h-4 w-4" />
                  ملخص سريع
                </div>
                <div className="mt-5 space-y-5">
                  <div>
                    <div className="text-3xl font-black">+12</div>
                    <div className="text-sm text-slate-500">
                      درجة تقديرية هذا الشهر
                    </div>
                  </div>
                  <div>
                    <div className="text-3xl font-black">91%</div>
                    <div className="text-sm text-slate-500">أفضل أداء في التناظر</div>
                  </div>
                  <div>
                    <div className="text-3xl font-black">37</div>
                    <div className="text-sm text-slate-500">
                      سؤال محفوظ للمراجعة
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section id="build" className="mx-auto max-w-7xl px-4 py-8 md:px-6 md:py-16">
          <div className="grid gap-8 lg:grid-cols-2">
            <div>
              <SectionTitle
                badge="خطة البناء"
                title="كيف يتحول هذا النموذج إلى منتج فعلي؟"
                text="أفضل نسخة أولى لا تبدأ بكل شيء. تبدأ ببنية واضحة، تجربة أساسية قوية، ثم تتوسع على مراحل محسوبة."
              />

              <div className="mt-8 grid gap-3">
                {roadmap.map((item, index) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-[28px] border border-slate-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 font-black text-white">
                      {index + 1}
                    </div>
                    <div className="font-medium">{item}</div>
                  </div>
                ))}
              </div>
            </div>

            <Card className="rounded-[32px] border-0 bg-[linear-gradient(180deg,#fffaf0,#ffffff)] shadow-sm">
              <CardContent className="p-6">
                <div className="text-2xl font-black">الستاك المقترح لمعيار</div>
                <div className="mt-6 grid gap-3 text-sm">
                  {techStack.map((item) => (
                    <div
                      key={item}
                      className="rounded-2xl border border-[#eee4cf] bg-white p-4 shadow-sm"
                    >
                      {item}
                    </div>
                  ))}
                </div>

                <div className="mt-6 rounded-[28px] border border-[#ead5a4] bg-[#fff6df] p-4 text-sm leading-7 text-slate-700">
                  البداية الأذكى هنا: بنك أسئلة + اختبار محاكي + نتائج ومراجعة +
                  لوحة طالب بسيطة. بعد ذلك نضيف التوصيات الذكية، الاشتراكات،
                  التنافس، والتطبيق لاحقًا.
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
}
