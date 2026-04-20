"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { FilePlus2, FileText, Loader2, NotebookText, UploadCloud } from "lucide-react";

import { useAuthSession } from "@/hooks/use-auth-session";
import type { SummaryListItem } from "@/lib/summaries";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} ك.ب`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} م.ب`;
}

function formatRelativeDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "اليوم";
  }

  const diffMs = date.getTime() - Date.now();
  const diffDays = Math.round(diffMs / (24 * 60 * 60 * 1000));

  if (Math.abs(diffDays) < 1) {
    return "اليوم";
  }

  return new Intl.RelativeTimeFormat("ar", { numeric: "auto" }).format(diffDays, "day");
}

async function readSummaries() {
  const response = await fetch("/api/summaries", {
    cache: "no-store",
  });

  const payload = (await response.json()) as {
    ok?: boolean;
    items?: SummaryListItem[];
    message?: string;
  };

  if (!response.ok || !Array.isArray(payload.items)) {
    throw new Error(payload.message || "تعذر جلب الملخصات.");
  }

  return payload.items;
}

export function SummaryLibrary() {
  const { status, user } = useAuthSession();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [items, setItems] = useState<SummaryListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") {
      setIsLoading(false);
      return;
    }

    let aborted = false;
    setIsLoading(true);

    void readSummaries()
      .then((nextItems) => {
        if (!aborted) {
          setItems(nextItems);
        }
      })
      .catch((nextError) => {
        if (!aborted) {
          setError(nextError instanceof Error ? nextError.message : "تعذر جلب الملخصات.");
        }
      })
      .finally(() => {
        if (!aborted) {
          setIsLoading(false);
        }
      });

    return () => {
      aborted = true;
    };
  }, [status]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setMessage(null);
    setError(null);

    try {
      const formData = new FormData();
      formData.set("file", file);

      const response = await fetch("/api/summaries", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        item?: SummaryListItem;
        message?: string;
      };

      if (!response.ok || !payload.item) {
        throw new Error(payload.message || "تعذر رفع الملف.");
      }

      setItems((current) => [payload.item!, ...current.filter((item) => item.id !== payload.item!.id)]);
      setMessage("تم رفع الملخص بنجاح وإضافته إلى مكتبتك.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "تعذر رفع الملف.");
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  }

  if (status === "loading") {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-3 p-10 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          جارٍ تجهيز مكتبة الملخصات...
        </CardContent>
      </Card>
    );
  }

  if (status !== "authenticated" || !user) {
    return (
      <Card className="border border-dashed border-[#d8c7a7] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,241,229,0.9))]">
        <CardContent className="space-y-6 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.4rem] bg-[#fff7ed] text-[#C99A43]">
            <NotebookText className="h-8 w-8" />
          </div>
          <div>
            <h2 className="display-font text-2xl font-bold text-slate-950">قسم الملخصات مرتبط بحسابك</h2>
            <p className="mt-3 text-sm leading-8 text-slate-600">
              يجب إنشاء حساب وتسجيل الدخول لاستخدام قسم الملخصات وحفظ ملفاتك وملاحظاتك.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/login?next=/summaries">
              <Button variant="outline">تسجيل الدخول</Button>
            </Link>
            <Link href="/register?next=/summaries">
              <Button>إنشاء حساب</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border border-[#E8D8B3] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,247,244,0.96))]">
        <CardContent className="flex flex-col gap-5 p-7 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="mini-pill bg-[#123B7A]/5 text-[#123B7A]">مكتبة خاصة مرتبطة بحسابك</div>
            <h2 className="mt-4 display-font text-2xl font-bold text-slate-950">ملخصاتك المحفوظة</h2>
            <p className="mt-3 max-w-2xl text-sm leading-8 text-slate-600">
              ارفع ملفات PDF للمذاكرة، ثم ارجع لها لاحقًا بنفس الصفحة الأخيرة والملاحظات ومساحات الحل والرسم.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
              className="gap-2"
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
              رفع ملخص
            </Button>
          </div>
        </CardContent>
      </Card>

      {message ? (
        <div className="rounded-[1.4rem] border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm font-semibold text-emerald-700">
          {message}
        </div>
      ) : null}

      {error ? (
        <div className="rounded-[1.4rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <Card>
          <CardContent className="flex items-center justify-center gap-3 p-10 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            جارٍ تحميل ملفاتك...
          </CardContent>
        </Card>
      ) : items.length ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden border-white/80 bg-white/96 shadow-soft">
              <CardContent className="space-y-5 p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="display-font truncate text-xl font-bold text-slate-950">{item.fileName}</div>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-slate-500">
                      <span className="rounded-full bg-slate-100 px-3 py-1">{item.pageCount} صفحة</span>
                      <span className="rounded-full bg-slate-100 px-3 py-1">{formatFileSize(item.fileSizeBytes)}</span>
                    </div>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-[#eef4ff] text-[#123B7A]">
                    <FileText className="h-6 w-6" />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50/70 p-4">
                    <div className="text-xs font-semibold text-slate-500">آخر صفحة</div>
                    <div className="mt-2 display-font text-2xl font-bold text-slate-950">{item.lastOpenedPage}</div>
                  </div>
                  <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50/70 p-4">
                    <div className="text-xs font-semibold text-slate-500">عدد الملاحظات</div>
                    <div className="mt-2 display-font text-2xl font-bold text-slate-950">{item.noteCount}</div>
                  </div>
                  <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50/70 p-4">
                    <div className="text-xs font-semibold text-slate-500">الصفحات المراجعة</div>
                    <div className="mt-2 display-font text-2xl font-bold text-slate-950">{item.reviewedPages}</div>
                  </div>
                  <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50/70 p-4">
                    <div className="text-xs font-semibold text-slate-500">آخر استخدام</div>
                    <div className="mt-2 text-base font-bold text-slate-900">{formatRelativeDate(item.lastUsedAt)}</div>
                  </div>
                </div>

                <div className="rounded-[1.2rem] border border-[#E8D8B3] bg-[#fffaf0] px-4 py-3 text-sm font-semibold text-slate-700">
                  حالة الإنجاز: {item.completionRatio}% من الصفحات تم تعليمها كمراجعة مكتملة.
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link href={`/summaries/${item.id}`}>
                    <Button className="gap-2">
                      <FilePlus2 className="h-4 w-4" />
                      افتح الملخص
                    </Button>
                  </Link>
                  <a href={`/api/summaries/${item.id}/file`} target="_blank" rel="noreferrer">
                    <Button variant="outline">عرض الملف الأصلي</Button>
                  </a>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="border border-dashed border-slate-300 bg-white/80">
          <CardContent className="space-y-4 p-10 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-[#fff7ed] text-[#C99A43]">
              <UploadCloud className="h-8 w-8" />
            </div>
            <div className="display-font text-2xl font-bold text-slate-950">ابدأ أول مكتبة ملخصات خاصة بك</div>
            <p className="mx-auto max-w-2xl text-sm leading-8 text-slate-600">
              ارفع PDF مثل بنك أو ملخص أو تجميع، وسيتحول إلى مساحة دراسة تقدر ترجع لها لاحقًا بكل ملاحظاتك.
            </p>
            <div className="flex justify-center">
              <Button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                رفع أول ملخص
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
