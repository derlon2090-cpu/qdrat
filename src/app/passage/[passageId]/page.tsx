import { notFound } from "next/navigation";

import { Reveal } from "@/components/reveal";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getPassageDetail } from "@/lib/question-bank-api";
import { getInitialAuthUser } from "@/lib/server-auth";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/question-bank", label: "بنك الأسئلة" },
  { href: "/diagnostic", label: "التشخيص" },
];

export default async function PassageDetailPage({
  params,
}: {
  params: Promise<{ passageId: string }>;
}) {
  const initialAuthUser = await getInitialAuthUser();
  const { passageId } = await params;
  const passage = await getPassageDetail(passageId);

  if (!passage) {
    notFound();
  }

  return (
    <div className="min-h-screen">
      <SiteHeader
        variant={initialAuthUser ? "student" : "public"}
        links={initialAuthUser ? undefined : navLinks}
        ctaHref="/question-bank"
        ctaLabel="ارجع إلى البنك"
        initialUser={initialAuthUser}
      />
      <main className="section-shell pt-10 md:pt-14">
        <div className="mx-auto w-[min(calc(100%-2rem),1180px)] space-y-8">
          <Reveal>
            <Card>
              <CardContent className="p-7">
                <Badge>عرض القطعة كاملة</Badge>
                <h1 className="page-heading mt-4 max-w-none">{passage.title}</h1>
                <p className="mt-4 whitespace-pre-wrap text-lg leading-9 text-slate-800">
                  {passage.text}
                </p>
              </CardContent>
            </Card>
          </Reveal>

          <Reveal>
            <Card>
              <CardContent className="p-7">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm text-slate-500">أسئلة القطعة</p>
                    <h2 className="display-font mt-2 text-2xl font-bold text-slate-950">
                      الأسئلة المخزنة يدويًا
                    </h2>
                  </div>
                  <Badge className="bg-slate-100 text-slate-700">
                    {passage.questions.length} أسئلة
                  </Badge>
                </div>

                <div className="mt-6 grid gap-4">
                  {passage.questions.map((question, index) => (
                    <div
                      key={question.id}
                      className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="display-font text-lg font-bold text-slate-950">
                        سؤال {question.order || index + 1}
                      </div>
                      <div className="mt-3 text-lg leading-8 text-slate-900">{question.text}</div>
                      <div className="mt-4 grid gap-3">
                        {question.options.map((option) => (
                          <div
                            key={option}
                            className={`rounded-[1.2rem] border p-4 text-sm leading-7 ${
                              option === question.correctAnswer
                                ? "border-emerald-200 bg-emerald-50 text-emerald-900"
                                : "border-slate-200 bg-slate-50 text-slate-700"
                            }`}
                          >
                            <div className="font-semibold">{option}</div>
                            <div className="mt-2">
                              {question.explanations[option] || "لا يوجد شرح لهذا الخيار حاليًا."}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </Reveal>
        </div>
      </main>
    </div>
  );
}
