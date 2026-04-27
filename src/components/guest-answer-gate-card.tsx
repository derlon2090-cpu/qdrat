import Link from "next/link";
import { HelpCircle, LockKeyhole } from "lucide-react";

type GuestAnswerGateCardProps = {
  nextHref: string;
  className?: string;
};

export function GuestAnswerGateCard({ nextHref, className = "" }: GuestAnswerGateCardProps) {
  const encodedNext = encodeURIComponent(nextHref);

  return (
    <div
      dir="rtl"
      className={`overflow-hidden rounded-[1.15rem] border border-[#dbe6f6] bg-white shadow-[0_16px_36px_rgba(15,23,42,0.04)] ${className}`}
    >
      <div className="grid items-center gap-4 px-5 py-4 md:grid-cols-[220px_minmax(0,1fr)] md:[direction:ltr]">
        <div
          aria-hidden="true"
          className="relative hidden min-h-[7.5rem] overflow-hidden rounded-[1rem] bg-[linear-gradient(135deg,#f5f8ff,#eef4ff)] md:block"
        >
          <div className="absolute bottom-4 left-6 h-12 w-14 rounded-2xl bg-[#6478ff] shadow-[0_18px_32px_rgba(99,120,255,0.22)]" />
          <div className="absolute bottom-14 left-8 grid h-10 w-10 place-items-center rounded-full bg-[#7f8cff] text-white shadow-lg">
            <LockKeyhole className="h-5 w-5" />
          </div>
          <div className="absolute right-8 top-5 h-16 w-24 rounded-2xl bg-white shadow-[0_18px_38px_rgba(30,64,175,0.08)]">
            <div className="mx-auto mt-4 h-2 w-14 rounded-full bg-[#d8e2ff]" />
            <div className="mx-auto mt-3 h-2 w-10 rounded-full bg-[#d8e2ff]" />
          </div>
          <div className="absolute right-4 top-2 grid h-7 w-7 place-items-center rounded-full bg-[#5f82ff] text-white shadow-lg">
            <HelpCircle className="h-4 w-4" />
          </div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_25%,rgba(96,165,250,0.22),transparent_32%),radial-gradient(circle_at_84%_82%,rgba(99,102,241,0.16),transparent_28%)]" />
        </div>

        <div dir="rtl" className="text-center md:text-right">
          <h3 className="text-xl font-black leading-8 text-slate-950">
            هل تريد الحل الصحيح والشرح المفصل؟
          </h3>
          <p className="mt-2 text-sm font-semibold leading-7 text-slate-500">
            سجّل دخولك لتتمكن من رؤية الحل الصحيح مع الشرح خطوة بخطوة.
          </p>
          <div className="mt-4 flex flex-wrap justify-center gap-3 md:justify-start">
            <Link
              href={`/login?next=${encodedNext}`}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[0.65rem] bg-[#2563eb] px-6 text-sm font-bold text-white shadow-[0_10px_22px_rgba(37,99,235,0.2)] transition hover:bg-[#1d4ed8]"
            >
              <LockKeyhole className="h-4 w-4" />
              سجل الدخول الآن
            </Link>
            <Link
              href={`/register?next=${encodedNext}`}
              className="inline-flex h-11 items-center justify-center rounded-[0.65rem] border border-[#dbe6f6] bg-white px-6 text-sm font-bold text-[#1f4b94] transition hover:bg-slate-50"
            >
              إنشاء حساب جديد
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
