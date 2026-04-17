import { BookOpenText } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { VerbalPassagesBrowser } from "@/components/verbal-passages-browser";

export default function VerbalPassagesPage() {
  return (
    <PageShell
      eyebrow="verbal_passages"
      title="بنك القطع اللفظي"
      description="ابحث بعنوان القطعة أو بالكلمات المفتاحية، ثم افتح النص الكامل والأسئلة المرتبطة به داخل واجهة الطالب."
      icon={BookOpenText}
      iconWrap="bg-[#eef4ff]"
      iconColor="text-[#123B7A]"
      accentClass="shadow-[0_20px_45px_rgba(18,59,122,0.14)]"
      ctaLabel="افتح بنك الأسئلة"
      ctaHref="/question-bank"
    >
      <VerbalPassagesBrowser mode="student" />
    </PageShell>
  );
}
