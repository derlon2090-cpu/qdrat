import { NotebookText } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { SummaryWorkspace } from "@/components/summary-workspace";

export default async function SummaryDetailPage({
  params,
}: {
  params: Promise<{ summaryId: string }>;
}) {
  const { summaryId } = await params;

  return (
    <PageShell
      eyebrow="الملخصات"
      title="عارض تفاعلي للمذاكرة والحل والملاحظات على ملفات PDF"
      description="استخدم القلم والهايلايتر ومساحات الحل وإخفاء الإجابات داخل الملف نفسه، وسيتم حفظ كل شيء تلقائيًا داخل حسابك."
      icon={NotebookText}
      iconWrap="bg-[#eef4ff]"
      iconColor="text-[#123B7A]"
      accentClass="shadow-[0_20px_45px_rgba(18,59,122,0.16)]"
      ctaLabel="العودة إلى المكتبة"
      ctaHref="/summaries"
    >
      <SummaryWorkspace summaryId={summaryId} />
    </PageShell>
  );
}
