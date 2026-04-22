import { NotebookText } from "lucide-react";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { SummaryWorkspace } from "@/components/summary-workspace";

export default async function SummaryDetailPage({
  params,
}: {
  params: Promise<{ summaryId: string }>;
}) {
  const { summaryId } = await params;

  return (
    <div className="min-h-screen">
      <SiteHeader />
      <main className="relative z-0 section-shell pt-8 md:pt-10">
        <div className="mx-auto w-[min(calc(100%-2rem),1180px)] space-y-6">
          <section className="overflow-hidden rounded-[2.3rem] border border-white/80 bg-white/95 shadow-soft">
            <div className="flex flex-col gap-6 p-8 md:flex-row md:items-center md:justify-between md:p-10">
              <div className="max-w-4xl">
                <p className="section-eyebrow text-[#123B7A]">الملخصات</p>
                <h1 className="page-heading">عارض تفاعلي للمذاكرة والحل والملاحظات على ملفات PDF</h1>
                <p className="section-copy mb-0 max-w-4xl">
                  استخدم القلم والهايلايتر ومساحات الحل وإخفاء الإجابات داخل الملف نفسه، وسيتم حفظ كل شيء تلقائيًا داخل حسابك.
                </p>
              </div>

              <div className="page-shell-icon flex h-20 w-20 shrink-0 items-center justify-center rounded-[1.8rem] border border-white/70 bg-[#eef4ff] shadow-[0_20px_45px_rgba(18,59,122,0.16)]">
                <NotebookText className="h-9 w-9 text-[#123B7A]" />
              </div>
            </div>
          </section>

          <SummaryWorkspace summaryId={summaryId} />
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
