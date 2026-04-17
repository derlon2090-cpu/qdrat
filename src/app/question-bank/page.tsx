import { BriefcaseBusiness } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { QuestionBankOrganizer } from "@/components/question-bank-organizer";

export default function QuestionBankPage() {
  return (
    <PageShell
      eyebrow="بنك الأسئلة"
      title="ابدأ من كمي أو لفظي، ثم ادخل إلى باب واضح وتدريب مباشر"
      description="رتبنا هذه الصفحة لتكون أقرب لمسار الطالب الحقيقي: اختيار القسم أولًا، ثم الباب الداخلي، ثم التدريب مع تصحيح سريع بعد الإجابة. البحث ما زال موجودًا، لكنه لم يعد يشتت البداية."
      icon={BriefcaseBusiness}
      iconWrap="bg-[#fff7ed]"
      iconColor="text-[#d97706]"
      accentClass="shadow-[0_20px_45px_rgba(217,119,6,0.16)]"
      ctaLabel="ابدأ من اللفظي"
      ctaHref="/question-bank"
    >
      <QuestionBankOrganizer />
    </PageShell>
  );
}
