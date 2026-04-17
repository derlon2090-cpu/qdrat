import { Reveal } from "@/components/reveal";
import { SiteHeader } from "@/components/site-header";
import { VerbalReadingFromDocument } from "@/components/verbal-reading-from-document";
import { getPassageDetail, getReadingPassageSummaries } from "@/lib/question-bank-api";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/question-bank", label: "بنك الأسئلة" },
  { href: "/diagnostic", label: "التشخيص" },
  { href: "/results", label: "النتائج" },
];

function normalizeSearchParam(value?: string | string[]) {
  if (Array.isArray(value)) return value[0];
  return value;
}

function EmptyExamState({ section }: { section?: string }) {
  return (
    <div className="rounded-[28px] bg-white p-8 shadow-sm ring-1 ring-slate-200">
      <div className="text-sm font-medium text-slate-500">بنك الأسئلة / {section === "quantitative" ? "الكمي" : "اللفظي"}</div>
      <h1 className="mt-4 text-3xl font-bold text-slate-900">لا توجد أسئلة حاليًا، سيتم إضافتها قريبًا</h1>
      <p className="mt-4 max-w-2xl text-lg leading-9 text-slate-600">
        تم إفراغ الأقسام القديمة بالكامل، وأصبح هذا المسار مهيأ لقراءة البيانات اليدوية الجديدة فقط عند إضافتها.
      </p>
    </div>
  );
}

export default async function ExamPage({
  searchParams,
}: {
  searchParams?: Promise<{
    section?: string | string[];
    passageId?: string | string[];
    question?: string | string[];
  }>;
}) {
  const resolvedSearchParams = (searchParams ? await searchParams : {}) ?? {};
  const section = normalizeSearchParam(resolvedSearchParams.section);

  if (section === "verbal_reading") {
    const passages = await getReadingPassageSummaries();
    const requestedPassageId = normalizeSearchParam(resolvedSearchParams.passageId) ?? passages[0]?.id;
    const currentPassage = requestedPassageId ? await getPassageDetail(requestedPassageId) : null;
    const initialQuestionIndex = Math.max(Number(normalizeSearchParam(resolvedSearchParams.question)) || 0, 0);

    return (
      <div className="min-h-screen">
        <SiteHeader links={navLinks} ctaHref="/question-bank" ctaLabel="ارجع إلى البنك" />
        <main className="section-shell pt-10 md:pt-14">
          <div className="mx-auto w-[min(calc(100%-2rem),1400px)]">
            <Reveal>
              <VerbalReadingFromDocument
                currentPassage={currentPassage}
                passages={passages}
                initialQuestionIndex={initialQuestionIndex}
              />
            </Reveal>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <SiteHeader links={navLinks} ctaHref="/question-bank" ctaLabel="ارجع إلى البنك" />
      <main className="section-shell pt-10 md:pt-14">
        <div className="mx-auto w-[min(calc(100%-2rem),1240px)]">
          <Reveal>
            <EmptyExamState section={section} />
          </Reveal>
        </div>
      </main>
    </div>
  );
}
