import { NotebookText } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { SummaryLibrary } from "@/components/summary-library";

export default function SummariesPage() {
  return (
    <PageShell
      eyebrow="الملخصات"
      title="مكتبة PDF خاصة بك للمذاكرة والملاحظات والحل داخل الموقع"
      description="ارفع ملفاتك الدراسية بصيغة PDF، ثم افتح كل ملف صفحة صفحة، أخفِ الإجابات، أضف ملاحظات ومساحات حل، واكتب بالقلم مع حفظ كل شيء داخل حسابك."
      icon={NotebookText}
      iconWrap="bg-[#eef4ff]"
      iconColor="text-[#123B7A]"
      accentClass="shadow-[0_20px_45px_rgba(18,59,122,0.16)]"
      ctaLabel="ابدأ الآن"
      ctaHref="/summaries"
    >
      <SummaryLibrary />
    </PageShell>
  );
}
