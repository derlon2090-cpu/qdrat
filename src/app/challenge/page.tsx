import { Trophy } from "lucide-react";

import { PageShell } from "@/components/page-shell";
import { StudentChallengeBoard } from "@/components/student-challenge-board";

export default function ChallengePage() {
  return (
    <PageShell
      eyebrow="تحدي الشهر"
      title="لوحة XP تنافسية بمستويات واضحة ومهام يومية ولوحة أبطال تتحدث تلقائيًا"
      description="اجمع XP من الأسئلة الصحيحة، جلسات الأخطاء، والسلسلة اليومية. تابع ترتيبك اليومي والأسبوعي والشهري، واعرف كم يفصلك عن المركز التالي."
      icon={Trophy}
      iconWrap="bg-[#fff7e8]"
      iconColor="text-[#b7791f]"
      accentClass="shadow-[0_20px_45px_rgba(183,121,31,0.18)]"
      ctaLabel="العودة إلى لوحة الطالب"
      ctaHref="/dashboard"
      headerVariant="student"
    >
      <StudentChallengeBoard />
    </PageShell>
  );
}
