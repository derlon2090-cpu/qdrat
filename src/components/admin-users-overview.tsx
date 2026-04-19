"use client";

import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Database, Loader2, ShieldCheck, Users } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import type { UserAccountOverview } from "@/lib/user-accounts";

type ApiResponse = {
  ok?: boolean;
  items?: UserAccountOverview[];
  message?: string;
};

function formatDate(value: string | null) {
  if (!value) return "—";

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleString("ar-SA");
}

function formatPlanStatus(item: UserAccountOverview) {
  const plan = item.planName ?? "بدون باقة";
  const subscription = item.subscriptionStatus ?? "غير محدد";
  return `${plan} / ${subscription}`;
}

export function AdminUsersOverview() {
  const [items, setItems] = useState<UserAccountOverview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  useEffect(() => {
    let active = true;

    fetch("/api/admin/users", {
      cache: "no-store",
    })
      .then(async (response) => {
        const payload = (await response.json()) as ApiResponse;

        if (!response.ok || !payload.ok) {
          throw new Error(payload.message ?? "تعذر تحميل بيانات المستخدمين.");
        }

        if (active) {
          setItems(Array.isArray(payload.items) ? payload.items : []);
          setMessage("");
        }
      })
      .catch((error) => {
        if (!active) return;
        setItems([]);
        setMessage(error instanceof Error ? error.message : "تعذر تحميل بيانات المستخدمين.");
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    const totalUsers = items.length;
    const activeUsers = items.filter((item) => item.isActive).length;
    const subscribedUsers = items.filter((item) => item.subscriptionStatus === "active").length;
    const totalMistakes = items.reduce((sum, item) => sum + item.totalMistakes, 0);

    return [
      {
        label: "إجمالي المستخدمين",
        value: totalUsers,
        icon: Users,
        iconWrap: "bg-[#eef4ff]",
        iconColor: "text-[#123B7A]",
      },
      {
        label: "الحسابات النشطة",
        value: activeUsers,
        icon: ShieldCheck,
        iconWrap: "bg-[#edfdf3]",
        iconColor: "text-[#15803d]",
      },
      {
        label: "الاشتراكات الفعالة",
        value: subscribedUsers,
        icon: Database,
        iconWrap: "bg-[#fff7ed]",
        iconColor: "text-[#d97706]",
      },
      {
        label: "إجمالي الأخطاء المحفوظة",
        value: totalMistakes,
        icon: AlertTriangle,
        iconWrap: "bg-[#fff1f2]",
        iconColor: "text-[#dc2626]",
      },
    ];
  }, [items]);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex min-h-[240px] flex-col items-center justify-center gap-4 p-10 text-center">
          <Loader2 className="h-7 w-7 animate-spin text-[#123B7A]" />
          <div className="text-sm leading-7 text-slate-500">جارٍ تحميل بيانات المستخدمين من قاعدة البيانات...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <Card key={item.label}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <span className={`flex h-11 w-11 items-center justify-center rounded-2xl ${item.iconWrap}`}>
                    <Icon className={`h-5 w-5 ${item.iconColor}`} />
                  </span>
                  <div className="text-sm text-slate-500">{item.label}</div>
                </div>
                <div className="display-font mt-5 text-3xl font-bold text-slate-950">{item.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardContent className="space-y-5 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <div className="text-sm text-slate-500">Accounts Overview</div>
              <h2 className="display-font mt-2 text-2xl font-bold text-slate-950">جدول المستخدمين والباقات والجلسات</h2>
              <p className="mt-3 max-w-3xl text-sm leading-8 text-slate-600">
                هذا الجدول يقرأ من العرض الموحّد داخل قاعدة البيانات، ويجمع بيانات الحساب، الخطة، الاشتراك، الجلسات، وملخص الأخطاء لكل مستخدم.
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-500 ring-1 ring-slate-200">
              {items.length} مستخدم
            </div>
          </div>

          {message ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-7 text-rose-700">
              {message}
            </div>
          ) : null}

          <div className="overflow-x-auto">
            <table className="min-w-[1120px] border-separate border-spacing-y-3">
              <thead>
                <tr className="text-right text-sm text-slate-500">
                  <th className="px-4 pb-2 font-medium">المستخدم</th>
                  <th className="px-4 pb-2 font-medium">التواصل</th>
                  <th className="px-4 pb-2 font-medium">الدور</th>
                  <th className="px-4 pb-2 font-medium">الباقة / الاشتراك</th>
                  <th className="px-4 pb-2 font-medium">النتيجة والخطة</th>
                  <th className="px-4 pb-2 font-medium">الأخطاء</th>
                  <th className="px-4 pb-2 font-medium">الجلسات</th>
                  <th className="px-4 pb-2 font-medium">آخر دخول</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.userId} className="rounded-[1.35rem] bg-slate-50/85 text-right shadow-sm ring-1 ring-slate-200">
                    <td className="rounded-r-[1.35rem] px-4 py-4 align-top">
                      <div className="font-semibold text-slate-950">{item.fullName}</div>
                      <div className="mt-1 text-xs text-slate-500">{item.userId}</div>
                      <div className="mt-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            item.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {item.isActive ? "نشط" : "غير نشط"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 align-top text-sm leading-7 text-slate-600">
                      <div>{item.email ?? "—"}</div>
                      <div>{item.phone ?? "—"}</div>
                    </td>
                    <td className="px-4 py-4 align-top">
                      <span className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-semibold text-[#123B7A]">
                        {item.role}
                      </span>
                    </td>
                    <td className="px-4 py-4 align-top text-sm leading-7 text-slate-600">
                      <div className="font-semibold text-slate-900">{formatPlanStatus(item)}</div>
                      <div>من: {formatDate(item.subscriptionStartsAt)}</div>
                      <div>إلى: {formatDate(item.subscriptionEndsAt)}</div>
                    </td>
                    <td className="px-4 py-4 align-top text-sm leading-7 text-slate-600">
                      <div>الهدف: {item.targetScore ?? "—"}</div>
                      <div>المستوى: {item.currentLevel ?? "—"}</div>
                      <div>الدقائق اليومية: {item.dailyMinutes ?? "—"}</div>
                      <div>النتيجة الكلية: {item.overallScore ?? "—"}</div>
                    </td>
                    <td className="px-4 py-4 align-top text-sm leading-7 text-slate-600">
                      <div>الإجمالي: {item.totalMistakes}</div>
                      <div>كمي: {item.quantitativeMistakes}</div>
                      <div>لفظي: {item.verbalMistakes}</div>
                    </td>
                    <td className="px-4 py-4 align-top text-sm leading-7 text-slate-600">
                      <div>الجلسات النشطة: {item.activeSessions}</div>
                      <div>آخر نشاط: {formatDate(item.lastSessionSeenAt)}</div>
                    </td>
                    <td className="rounded-l-[1.35rem] px-4 py-4 align-top text-sm leading-7 text-slate-600">
                      <div>آخر دخول: {formatDate(item.lastLoginAt)}</div>
                      <div>أنشئ: {formatDate(item.userCreatedAt)}</div>
                      <div>تحديث: {formatDate(item.userUpdatedAt)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!items.length && !message ? (
            <div className="rounded-[1.3rem] border border-dashed border-slate-300 bg-slate-50/70 px-5 py-5 text-center text-sm leading-7 text-slate-500">
              لا توجد حسابات معروضة حاليًا داخل هذا الجدول.
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
