import Link from "next/link";
import { notFound } from "next/navigation";

import { Reveal } from "@/components/reveal";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getPassageDetail } from "@/lib/question-bank-api";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/question-bank", label: "بنك الأسئلة" },
  { href: "/diagnostic", label: "التشخيص" },
  { href: "/my-plan", label: "خطتي" },
];

function toArabicChoice(key: string) {
  switch (key.toUpperCase()) {
    case "A":
      return "أ";
    case "B":
      return "ب";
    case "C":
      return "ج";
    case "D":
      return "د";
    default:
      return key;
  }
}

export default async function PassageDetailPage({
  params,
}: {
  params: Promise<{ passageId: string }>;
}) {
  const { passageId } = await params;
  const passage = await getPassageDetail(Number(passageId));

  if (!passage) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <SiteHeader links={navLinks} ctaHref="/question-bank" ctaLabel="ارجع إلى البنوك" />
      <main className="section-shell pt-10 md:pt-14">
        <div className="mx-auto w-[min(calc(100%-2rem),1180px)] space-y-8">
          <Reveal>
            <div className="surface-card p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="max-w-3xl space-y-4">
                  <Badge>عرض القطعة كاملة</Badge>
                  <h1 className="page-heading max-w-none">
                    {passage.pieceNumber ? `قطعة ${passage.pieceNumber}: ` : ""}
                    {passage.title}
                  </h1>
                  <p className="section-copy mb-0 max-w-2xl text-slate-600">
                    تبحث الآن داخل عنوان القطعة نفسها، وتعرض الصفحة النص الكامل مع جميع الأسئلة المرتبطة به في مكان
                    واحد واضح.
                  </p>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.4rem] border border-[#E8D8B3] bg-white/90 p-4 text-right">
                    <div className="text-sm text-slate-500">عدد الأسئلة</div>
                    <div className="display-font mt-2 text-2xl font-bold text-[#123B7A]">{passage.questions.length}</div>
                  </div>
                  <div className="rounded-[1.4rem] border border-[#E8D8B3] bg-white/90 p-4 text-right">
                    <div className="text-sm text-slate-500">حالة التحقق</div>
                    <div className="mt-2 text-sm font-semibold text-slate-800">
                      {passage.needsReview ? "تحتاج مراجعة تحريرية" : "جاهزة مبدئيًا"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/question-bank">
                  <Button>ابحث عن قطعة أخرى</Button>
                </Link>
                <Link href="/diagnostic">
                  <Button variant="outline">ابدأ التشخيص</Button>
                </Link>
              </div>
            </div>
          </Reveal>

          <div className="grid gap-8 lg:grid-cols-[1.08fr,0.92fr]">
            <Reveal>
              <Card>
                <CardContent className="p-7">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm text-slate-500">نص القطعة</p>
                      <h2 className="display-font mt-2 text-2xl font-bold text-slate-950">{passage.title}</h2>
                    </div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      <span className="rounded-full bg-[#123B7A]/10 px-3 py-1 font-semibold text-[#123B7A]">
                        {passage.difficulty}
                      </span>
                      {passage.rawPageFrom ? (
                        <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
                          ص {passage.rawPageFrom}
                          {passage.rawPageTo && passage.rawPageTo !== passage.rawPageFrom ? ` - ${passage.rawPageTo}` : ""}
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="mt-6 whitespace-pre-wrap text-base leading-9 text-slate-900">{passage.text}</div>
                </CardContent>
              </Card>
            </Reveal>

            <Reveal delay={0.05}>
              <div className="surface-dark p-7">
                <p className="text-sm text-white/70">معلومات سريعة</p>
                <div className="mt-5 space-y-4 text-sm text-white/85">
                  <div className="rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
                    <div className="text-white/60">المصدر</div>
                    <div className="mt-2 font-semibold">{passage.sourceName || "مصدر داخلي"}</div>
                  </div>
                  <div className="rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
                    <div className="text-white/60">ثقة الاستخراج</div>
                    <div className="mt-2 font-semibold">{Math.round((passage.parsingConfidence || 0) * 100)}%</div>
                  </div>
                  <div className="rounded-[1.3rem] border border-white/10 bg-white/5 p-4">
                    <div className="text-white/60">ملاحظة</div>
                    <div className="mt-2 leading-7">
                      {passage.needsReview
                        ? "هذه القطعة ما زالت تحت مراجعة آلية/تحريرية، لذلك قد تظهر بعض الأسئلة أو الإجابات بعلامة تحقق منخفضة."
                        : "القطعة منشورة وجاهزة للقراءة مع أسئلتها المرتبطة."}
                    </div>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>

          <Reveal>
            <Card>
              <CardContent className="p-7">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">الأسئلة المرتبطة</p>
                    <h2 className="display-font mt-2 text-2xl font-bold text-slate-950">جميع أسئلة هذه القطعة</h2>
                  </div>
                  <Badge className={passage.needsReview ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}>
                    {passage.needsReview ? "بعض الإجابات قيد التحقق" : "الإجابات المؤكدة فقط"}
                  </Badge>
                </div>

                <div className="mt-6 grid gap-4">
                  {passage.questions.map((question, index) => {
                    const canShowOfficialAnswer =
                      Boolean(question.correctChoiceKey) && !question.needsReview && question.answerConfidence >= 0.8;

                    return (
                      <div
                        key={question.id}
                        className="rounded-[1.7rem] border border-slate-200/80 bg-white/80 p-5 shadow-sm"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-3">
                          <div className="display-font text-lg font-bold text-slate-950">
                            سؤال {question.order || index + 1}
                          </div>
                          <div className="flex flex-wrap gap-2 text-xs">
                            <span className="rounded-full bg-[#123B7A]/10 px-3 py-1 font-semibold text-[#123B7A]">
                              {canShowOfficialAnswer ? "إجابة مؤكدة" : "قيد المراجعة"}
                            </span>
                            <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-600">
                              ثقة {Math.round((question.answerConfidence || 0) * 100)}%
                            </span>
                          </div>
                        </div>

                        <h3 className="mt-3 text-lg font-semibold leading-8 text-slate-950">{question.text}</h3>

                        <div className="mt-4 grid gap-3">
                          {question.choices.map((choice) => {
                            const isVerifiedCorrect = canShowOfficialAnswer && choice.key === question.correctChoiceKey;

                            return (
                              <div
                                key={choice.id}
                                className={`flex items-start gap-3 rounded-[1.3rem] border p-4 ${
                                  isVerifiedCorrect
                                    ? "border-emerald-200 bg-emerald-50/80"
                                    : "border-slate-200 bg-white/85"
                                }`}
                              >
                                <span
                                  className={`flex h-10 w-10 items-center justify-center rounded-xl font-bold ${
                                    isVerifiedCorrect
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-slate-100 text-slate-700"
                                  }`}
                                >
                                  {toArabicChoice(choice.key)}
                                </span>
                                <div className="space-y-2">
                                  <div className="text-sm leading-7 text-slate-700">{choice.text}</div>
                                  {isVerifiedCorrect ? (
                                    <div className="text-xs font-semibold text-emerald-700">الإجابة الصحيحة المؤكدة</div>
                                  ) : null}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {question.explanation ? (
                          <div className="mt-4 rounded-[1.3rem] border border-[#E8D8B3] bg-[#fff9ef] p-4 text-sm leading-8 text-slate-700">
                            <div className="mb-1 font-semibold text-[#123B7A]">الشرح</div>
                            {question.explanation}
                          </div>
                        ) : null}

                        {!canShowOfficialAnswer ? (
                          <div className="mt-4 rounded-[1.2rem] border border-dashed border-amber-300 bg-amber-50/80 p-4 text-sm leading-7 text-amber-800">
                            الإجابة الرسمية لهذا السؤال ما زالت قيد التحقق، لذلك أعرض لك القطعة والأسئلة الآن، لكن لا
                            أعتبر هذا السؤال مؤكدًا نهائيًا بعد.
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </main>
    </div>
  );
}
