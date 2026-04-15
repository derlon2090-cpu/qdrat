import { SiteHeader } from "@/components/site-header";
import { ExamSimulator } from "@/components/exam-simulator";
import { Reveal } from "@/components/reveal";

const navLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/banks", label: "البنوك" },
  { href: "/passage", label: "القطعة" },
  { href: "/exam", label: "الاختبار" },
  { href: "/results", label: "النتائج" },
];

export default function ExamPage() {
  return (
    <div className="min-h-screen">
      <SiteHeader links={navLinks} ctaHref="/results" ctaLabel="النتيجة" />
      <main className="section-shell pt-10 md:pt-14">
        <div className="mx-auto w-[min(calc(100%-2rem),1180px)]">
          <Reveal>
            <ExamSimulator />
          </Reveal>
        </div>
      </main>
    </div>
  );
}
