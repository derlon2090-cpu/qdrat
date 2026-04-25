import { NotebookText } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { SummaryLibrary } from "@/components/summary-library";
import { getInitialAuthUser } from "@/lib/server-auth";

export default async function SummariesLibraryPage() {
  const initialAuthUser = await getInitialAuthUser();

  return (
    <PageShell
      eyebrow="مكتبة PDF"
      title="مكتبتك الخاصة لرفع ملفات PDF وفتحها مع الملاحظات والحل"
      description="ارفع ملفاتك الدراسية بصيغة PDF، ثم افتح كل ملف صفحة صفحة، وأخفِ الإجابات، وأضف ملاحظاتك ومساحات الحل، واكتب بالقلم مع حفظ كل شيء داخل حسابك."
      icon={NotebookText}
      iconWrap="bg-[#eef4ff]"
      iconColor="text-[#123B7A]"
      accentClass="shadow-[0_20px_45px_rgba(18,59,122,0.16)]"
      ctaLabel="عودة إلى مركز الملخصات"
      ctaHref="/summaries"
      headerVariant="student"
      initialAuthUser={initialAuthUser}
    >
      <SummaryLibrary initialAuthUser={initialAuthUser} />
    </PageShell>
  );
}
