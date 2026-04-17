"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BookOpenText, Calculator, Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import { EMPTY_SECTION_MESSAGE, quantitativeSections, verbalSections } from "@/data/manual-question-bank";
import { getReadingKeywordDirectory } from "@/lib/question-bank-api";

type TrackId = "verbal" | "quant";

function EmptySectionCard({
  title,
  description,
  active,
  onClick,
  icon: Icon,
}: {
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
  icon: typeof BookOpenText;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[1.9rem] border p-6 text-right transition-all ${
        active
          ? "border-transparent bg-[linear-gradient(135deg,#102955,#123B7A_55%,#2f5fa7)] text-white shadow-[0_24px_50px_rgba(18,59,122,0.22)]"
          : "border-slate-200/80 bg-white/88 text-slate-900 shadow-sm hover:-translate-y-0.5 hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="display-font text-2xl font-bold">{title}</div>
          <div className={`mt-3 text-sm leading-7 ${active ? "text-white/80" : "text-slate-500"}`}>{description}</div>
        </div>
        <div className={`flex h-14 w-14 items-center justify-center rounded-[1.3rem] ${active ? "bg-white/10" : "bg-[#fff7ed]"}`}>
          <Icon className={`h-7 w-7 ${active ? "text-white" : "text-[#C99A43]"}`} />
        </div>
      </div>
    </button>
  );
}

export function QuestionBankOrganizer() {
  const searchParams = useSearchParams();
  const [track, setTrack] = useState<TrackId>(searchParams.get("track") === "quant" ? "quant" : "verbal");
  const [keywordQuery, setKeywordQuery] = useState(searchParams.get("keyword") ?? "");
  const deferredKeywordQuery = useDeferredValue(keywordQuery);

  useEffect(() => {
    setTrack(searchParams.get("track") === "quant" ? "quant" : "verbal");
    setKeywordQuery(searchParams.get("keyword") ?? "");
  }, [searchParams]);

  const currentSections = useMemo(
    () => (track === "verbal" ? verbalSections : quantitativeSections),
    [track],
  );

  const verbalKeywordResults = useMemo(
    () =>
      getReadingKeywordDirectory({
        query: deferredKeywordQuery,
        limit: deferredKeywordQuery.trim() ? 18 : 12,
      }),
    [deferredKeywordQuery],
  );

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        <EmptySectionCard
          title="اللفظي"
          description="تم تفريغ الأقسام القديمة، وسيتم إدخال القطع والأسئلة اللفظية يدويًا واحدة واحدة مع دعم البحث بالكلمات المفتاحية."
          active={track === "verbal"}
          onClick={() => setTrack("verbal")}
          icon={BookOpenText}
        />
        <EmptySectionCard
          title="الكمي"
          description="تم تفريغ القسم الكمي بالكامل، وسيتم إدخال الأبواب والأسئلة الجديدة يدويًا لاحقًا."
          active={track === "quant"}
          onClick={() => setTrack("quant")}
          icon={Calculator}
        />
      </div>

      <div className="rounded-[2.2rem] border border-[#E8D8B3] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,247,244,0.96))] p-8 shadow-soft">
        <div className="display-font text-2xl font-bold text-slate-950">
          {track === "verbal" ? "القسم اللفظي" : "القسم الكمي"}
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-8 text-slate-600">
          {EMPTY_SECTION_MESSAGE}. تم تجهيز النظام الآن ليقرأ من بيانات يدوية ثابتة فقط، وعند إضافة أي قسم أو قطعة
          جديدة ستظهر مباشرة بدون PDF أو استخراج تلقائي.
        </p>

        {track === "verbal" ? (
          <div id="verbal-reading-search" className="mt-8 space-y-5 rounded-[1.9rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="display-font text-xl font-bold text-slate-950">بحث القطع اللفظية بالكلمات المفتاحية</div>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
                  أدخل اسم القطعة أو جزءًا منه، وسيظهر لك عنوان القطعة مباشرة. عند ربط القطعة لاحقًا بنصها وأسئلتها
                  ستفتح مباشرة من نفس النتيجة.
                </p>
              </div>
              <div className="rounded-full bg-[#123B7A]/8 px-4 py-2 text-sm font-semibold text-[#123B7A]">
                {getReadingKeywordDirectory({ limit: 200 }).length} عنوانًا مسجلًا
              </div>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                value={keywordQuery}
                onChange={(event) => setKeywordQuery(event.target.value)}
                placeholder="ابحث بعنوان القطعة، مثل: التوحد، التواضع، الإمام مالك..."
                className="h-14 pr-12 text-base"
              />
            </div>

            {verbalKeywordResults.length ? (
              <div className="grid gap-3 lg:grid-cols-2">
                {verbalKeywordResults.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5 transition hover:border-[#C99A43]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="display-font text-lg font-bold text-slate-950">{item.title}</div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.status === "linked"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {item.status === "linked" ? "مرتبطة بقطعة كاملة" : "عنوان محفوظ بانتظار الإضافة"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-500">{item.excerpt}</p>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-xs text-slate-500">
                        {item.questionCount ? `${item.questionCount} أسئلة مرتبطة` : "سيظهر النص والأسئلة عند إضافتها"}
                      </div>
                      {item.href ? (
                        <Link
                          href={item.href}
                          className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#123B7A]"
                        >
                          افتح القطعة
                        </Link>
                      ) : (
                        <span className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-500">
                          بانتظار ربط القطعة
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/80 p-6 text-center text-sm text-slate-500">
                لا توجد عناوين مطابقة الآن. جرّب جزءًا أقصر من اسم القطعة.
              </div>
            )}
          </div>
        ) : null}

        {currentSections.length ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {currentSections.map((section) => (
              <div key={section.id} className="rounded-[1.6rem] border border-slate-200 bg-white p-5 text-right shadow-sm">
                <div className="display-font text-lg font-bold text-slate-900">{section.title}</div>
                <div className="mt-2 text-sm leading-7 text-slate-500">{section.description}</div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-6 rounded-[1.7rem] border border-dashed border-slate-300 bg-white/70 p-8 text-center text-sm text-slate-500">
            {track === "verbal"
              ? "لا يوجد محتوى أسئلة ظاهر الآن داخل القسم اللفظي، لكن دليل العناوين الجاهز للبحث أصبح متاحًا بالأعلى."
              : "لا يوجد محتوى معروض حاليًا داخل هذا القسم."}
          </div>
        )}
      </div>
    </div>
  );
}
