"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Clock3, Mail, Phone, Settings2, ShieldCheck, UserRound } from "lucide-react";

import { StudentAccessCard } from "@/components/student-access-card";
import { StudentAchievementsPanel } from "@/components/student-achievements-panel";
import {
  StudentPortalErrorCard,
  StudentPortalLoadingCard,
  formatDaysLeft,
  formatPortalDate,
  planTypeLabels,
} from "@/components/student-portal-shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAuthSession } from "@/hooks/use-auth-session";
import { useStudentPortal } from "@/hooks/use-student-portal";

function formatGender(value: "male" | "female" | null) {
  if (value === "male") return "ذكر";
  if (value === "female") return "أنثى";
  return "غير محدد";
}

export function StudentAccount() {
  const router = useRouter();
  const { status, user } = useAuthSession();
  const { status: portalStatus, data, error, refresh } = useStudentPortal(status === "authenticated");

  useEffect(() => {
    if (portalStatus === "ready" && data && !data.onboardingCompleted) {
      router.replace("/onboarding");
    }
  }, [data, portalStatus, router]);

  if (status === "loading") {
    return <StudentPortalLoadingCard label="جارٍ تجهيز بيانات الحساب..." />;
  }

  if (status !== "authenticated" || !user) {
    return (
      <StudentAccessCard
        title="إدارة الحساب تحتاج تسجيل دخول"
        description="سجل دخولك أولًا حتى ترى بياناتك، وخطتك الحالية، وآخر إعدادات مرتبطة بحسابك داخل المنصة."
        next="/account"
      />
    );
  }

  if (portalStatus === "loading" || portalStatus === "idle") {
    return <StudentPortalLoadingCard label="جارٍ تحميل بيانات الحساب..." />;
  }

  if (portalStatus === "error" || !data) {
    return <StudentPortalErrorCard message={error ?? "تعذر تحميل بيانات الحساب."} onRetry={() => void refresh()} />;
  }

  return (
    <div className="space-y-6">
      <Card className="surface-dark border-0">
        <CardContent className="space-y-5 p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <Badge className="bg-white/10 text-white">الحساب</Badge>
              <h2 className="mt-4 display-font text-4xl font-bold text-white">بياناتك وخطتك في مكان واحد</h2>
              <p className="mt-3 max-w-3xl text-sm leading-8 text-white/78">
                هذه الصفحة تجمع معلومات الحساب الأساسية مع إعدادات الخطة الحالية، حتى تراجع وضعك بسرعة وتعدل ما
                تحتاجه بدون تشتيت.
              </p>
            </div>
            <Link href="/onboarding">
              <Button>تعديل الإعدادات</Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.02fr,0.98fr]">
        <Card className="rounded-[2rem] border-white/80 bg-white/96 shadow-soft">
          <CardContent className="space-y-6 p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[1.1rem] bg-[#eef4ff] text-[#123B7A]">
                <UserRound className="h-6 w-6" />
              </div>
              <div>
                <p className="section-eyebrow text-[#123B7A]">بيانات الحساب</p>
                <h3 className="display-font text-2xl font-bold text-slate-950">معلوماتك الأساسية</h3>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4">
                <div className="text-xs font-semibold text-slate-500">الاسم</div>
                <div className="mt-2 font-bold text-slate-950">{user.fullName}</div>
              </div>
              <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4">
                <div className="text-xs font-semibold text-slate-500">الدور</div>
                <div className="mt-2 font-bold text-slate-950">طالب</div>
              </div>
              <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <Mail className="h-4 w-4" />
                  البريد
                </div>
                <div className="mt-2 font-bold text-slate-950">{user.email ?? "غير مضاف"}</div>
              </div>
              <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <Phone className="h-4 w-4" />
                  الجوال
                </div>
                <div className="mt-2 font-bold text-slate-950">{user.phone ?? "غير مضاف"}</div>
              </div>
              <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4">
                <div className="text-xs font-semibold text-slate-500">الجنس</div>
                <div className="mt-2 font-bold text-slate-950">{formatGender(user.gender)}</div>
              </div>
              <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4">
                <div className="text-xs font-semibold text-slate-500">آخر نشاط مسجل</div>
                <div className="mt-2 font-bold text-slate-950">{data.lastActivityLabel ?? "بداية جديدة"}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[2rem] border-white/80 bg-white/96 shadow-soft">
          <CardContent className="space-y-6 p-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-[1.1rem] bg-[#edfdf3] text-[#2f855a]">
                <Settings2 className="h-6 w-6" />
              </div>
              <div>
                <p className="section-eyebrow text-[#123B7A]">إعدادات الخطة</p>
                <h3 className="display-font text-2xl font-bold text-slate-950">الوضع الحالي</h3>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4">
                <div className="text-xs font-semibold text-slate-500">نوع الخطة</div>
                <div className="mt-2 display-font text-2xl font-bold text-slate-950">{planTypeLabels[data.planType]}</div>
              </div>
              <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <Clock3 className="h-4 w-4" />
                  الوقت اليومي
                </div>
                <div className="mt-2 display-font text-2xl font-bold text-slate-950">{data.dailyStudyHours} س</div>
              </div>
              <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4">
                <div className="text-xs font-semibold text-slate-500">موعد الاختبار</div>
                <div className="mt-2 font-bold text-slate-950">{formatPortalDate(data.examDate)}</div>
              </div>
              <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4">
                <div className="text-xs font-semibold text-slate-500">المتبقي على الاختبار</div>
                <div className="mt-2 display-font text-2xl font-bold text-slate-950">{formatDaysLeft(data.daysLeft)}</div>
              </div>
              <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4">
                <div className="text-xs font-semibold text-slate-500">المقاطع المتبقية كمي</div>
                <div className="mt-2 display-font text-2xl font-bold text-slate-950">{data.quantRemainingSections ?? "—"}</div>
              </div>
              <div className="rounded-[1.4rem] border border-slate-200 bg-slate-50/80 p-4">
                <div className="text-xs font-semibold text-slate-500">المقاطع المتبقية لفظي</div>
                <div className="mt-2 display-font text-2xl font-bold text-slate-950">{data.verbalRemainingSections ?? "—"}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <StudentAchievementsPanel data={data} sectionId="student-achievements" compact />

      <Card className="rounded-[2rem] border-white/80 bg-white/96 shadow-soft">
        <CardContent className="space-y-5 p-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-[1.1rem] bg-[#fff8e5] text-[#b7791f]">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="section-eyebrow text-[#123B7A]">إدارة سريعة</p>
              <h3 className="display-font text-2xl font-bold text-slate-950">ما الذي تريد فعله الآن؟</h3>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-4">
            <Link href="/onboarding">
              <Button variant="outline" className="w-full">تعديل الخطة</Button>
            </Link>
            <Link href="/my-plan">
              <Button variant="outline" className="w-full">فتح خطتي</Button>
            </Link>
            <Link href="/statistics">
              <Button variant="outline" className="w-full">عرض الإحصائيات</Button>
            </Link>
            <Link href="/pricing">
              <Button className="w-full">مراجعة الاشتراك</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
