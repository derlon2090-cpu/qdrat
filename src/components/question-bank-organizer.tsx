"use client";

import { useMemo, useState } from "react";
import { BookOpenText, Calculator } from "lucide-react";

import { EMPTY_SECTION_MESSAGE, quantitativeSections, verbalSections } from "@/data/manual-question-bank";

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
  const [track, setTrack] = useState<TrackId>("verbal");

  const currentSections = useMemo(
    () => (track === "verbal" ? verbalSections : quantitativeSections),
    [track],
  );

  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2">
        <EmptySectionCard
          title="اللفظي"
          description="تم تفريغ الأقسام القديمة، وسيتم إدخال القطع والأسئلة اللفظية يدويًا واحدة واحدة."
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
          {EMPTY_SECTION_MESSAGE}. تم تجهيز النظام الآن ليقرأ من بيانات يدوية ثابتة فقط، وعند إضافة أي قسم أو قطعة جديدة ستظهر مباشرة بدون PDF أو استخراج تلقائي.
        </p>

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
            لا يوجد محتوى معروض حاليًا داخل هذا القسم.
          </div>
        )}
      </div>
    </div>
  );
}
