"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

import type { AuthSessionUser } from "@/lib/auth-shared";
import type { UserMistakeRecord } from "@/lib/user-mistakes";

type SessionStatus = "loading" | "authenticated" | "unauthenticated";

export function QuestionBankMistakesPanel({
  sessionStatus,
  user,
}: {
  sessionStatus: SessionStatus;
  user: AuthSessionUser | null;
}) {
  const [items, setItems] = useState<UserMistakeRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (sessionStatus !== "authenticated" || !user) return;

    let active = true;
    setIsLoading(true);
    setMessage("");

    fetch("/api/mistakes", {
      cache: "no-store",
    })
      .then(async (response) => {
        const payload = (await response.json()) as {
          ok?: boolean;
          items?: UserMistakeRecord[];
          message?: string;
        };

        if (!response.ok || !payload.ok) {
          throw new Error(payload.message ?? "تعذر تحميل قائمة الأخطاء.");
        }

        if (active) {
          setItems(Array.isArray(payload.items) ? payload.items : []);
        }
      })
      .catch((error) => {
        if (!active) return;
        setMessage(error instanceof Error ? error.message : "تعذر تحميل قائمة الأخطاء.");
      })
      .finally(() => {
        if (active) {
          setIsLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [sessionStatus, user]);

  const grouped = useMemo(() => {
    return {
      quantitative: items.filter((item) => item.section === "quantitative"),
      verbal: items.filter((item) => item.section === "verbal"),
    };
  }, [items]);

  async function handleRemove(mistakeId: number) {
    setRemovingId(mistakeId);
    setMessage("");

    try {
      const response = await fetch(`/api/mistakes/${mistakeId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json()) as { message?: string };
        throw new Error(payload.message ?? "تعذر حذف السؤال من الأخطاء.");
      }

      setItems((previous) => previous.filter((item) => item.id !== mistakeId));
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "تعذر حذف السؤال من الأخطاء.");
    } finally {
      setRemovingId(null);
    }
  }

  if (sessionStatus === "loading") {
    return (
      <div className="rounded-[1.9rem] border border-slate-200 bg-white p-8 text-center shadow-sm">
        <Loader2 className="mx-auto h-6 w-6 animate-spin text-[#123B7A]" />
        <p className="mt-3 text-sm text-slate-500">جارٍ تجهيز قائمة الأخطاء الخاصة بحسابك...</p>
      </div>
    );
  }

  if (sessionStatus !== "authenticated" || !user) {
    return (
      <div className="rounded-[1.9rem] border border-[#E8D8B3] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,247,244,0.96))] p-8 shadow-soft">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-[1.2rem] bg-amber-50 text-[#C99A43]">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="display-font text-2xl font-bold text-slate-950">يجب إنشاء حساب وتسجيل الدخول للوصول إلى قائمة الأخطاء</h2>
            <p className="mt-3 max-w-2xl text-sm leading-8 text-slate-600">
              لن يتم حفظ الأسئلة الخاطئة لغير المسجلين. بعد تسجيل الدخول سيحتفظ النظام بأخطاء الكمي واللفظي لكل حساب بشكل مستقل،
              ويحذف السؤال تلقائيًا بعد حله صحيح 5 مرات.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href="/login?next=/question-bank?track=mistakes"
                className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white"
              >
                تسجيل الدخول
              </Link>
              <Link
                href="/register?next=/question-bank?track=mistakes"
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700"
              >
                إنشاء حساب
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[1.9rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="display-font text-2xl font-bold text-slate-950">الأخطاء</div>
        <p className="mt-3 max-w-3xl text-sm leading-8 text-slate-600">
          كل سؤال أخطأت فيه يُحفظ هنا داخل حسابك. إذا حللته صحيح 5 مرات يُحذف تلقائيًا، ويمكنك أيضًا حذفه يدويًا متى أردت.
        </p>
        {message ? <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{message}</div> : null}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <MistakesSection
          title="أخطاء الكمي"
          items={grouped.quantitative}
          removingId={removingId}
          onRemove={handleRemove}
          isLoading={isLoading}
          emptyMessage="لا توجد أسئلة كمي محفوظة في الأخطاء حاليًا."
        />
        <MistakesSection
          title="أخطاء اللفظي"
          items={grouped.verbal}
          removingId={removingId}
          onRemove={handleRemove}
          isLoading={isLoading}
          emptyMessage="لا توجد أسئلة لفظي محفوظة في الأخطاء حاليًا."
        />
      </div>
    </div>
  );
}

function MistakesSection({
  title,
  items,
  removingId,
  onRemove,
  isLoading,
  emptyMessage,
}: {
  title: string;
  items: UserMistakeRecord[];
  removingId: number | null;
  onRemove: (mistakeId: number) => void;
  isLoading: boolean;
  emptyMessage: string;
}) {
  return (
    <section className="rounded-[1.9rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h3 className="display-font text-xl font-bold text-slate-950">{title}</h3>
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {items.length} سؤال
        </span>
      </div>

      {isLoading ? (
        <div className="mt-5 rounded-[1.3rem] border border-dashed border-slate-300 bg-slate-50/70 p-5 text-center text-sm text-slate-500">
          جارٍ تحميل القائمة...
        </div>
      ) : items.length ? (
        <div className="mt-5 space-y-3">
          {items.map((item) => {
            const passageTitle =
              typeof item.metadata?.passageTitle === "string" ? item.metadata.passageTitle : null;

            return (
              <article key={item.id} className="rounded-[1.4rem] border border-slate-200 bg-slate-50/70 p-4">
                <div className="text-sm font-semibold text-[#123B7A]">{item.questionTypeLabel}</div>
                <h4 className="mt-2 text-base font-bold leading-8 text-slate-950">{item.questionText}</h4>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
                  <span className="rounded-full bg-white px-3 py-1">{item.sourceBank}</span>
                  {passageTitle ? <span className="rounded-full bg-white px-3 py-1">{passageTitle}</span> : null}
                  <span className="rounded-full bg-white px-3 py-1">
                    تم حله صحيح {item.correctCount} من {item.removalThreshold}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap gap-3">
                  {item.questionHref ? (
                    <Link
                      href={item.questionHref}
                      className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white"
                    >
                      حل السؤال
                    </Link>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => onRemove(item.id)}
                    disabled={removingId === item.id}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 disabled:opacity-60"
                  >
                    {removingId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                    حذف من الأخطاء
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <div className="mt-5 rounded-[1.3rem] border border-dashed border-slate-300 bg-slate-50/70 p-5 text-center text-sm text-slate-500">
          {emptyMessage}
        </div>
      )}
    </section>
  );
}
