"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { FilePlus2, FileText, Loader2, Trash2, UploadCloud } from "lucide-react";

import type { AuthSessionUser } from "@/lib/auth-shared";
import { useAuthSession } from "@/hooks/use-auth-session";
import type { SummaryListItem } from "@/lib/summaries";
import { StudentAccessCard } from "@/components/student-access-card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ApiPayload = {
  ok?: boolean;
  message?: string;
};

type SummaryUploadSessionPayload = ApiPayload & {
  session?: {
    sessionId: string;
    chunkSizeBytes: number;
    totalChunks: number;
  };
};

type SummaryUploadChunkPayload = ApiPayload & {
  progress?: {
    uploadedChunks: number;
    totalChunks: number;
  };
};

type SummaryUploadCompletePayload = ApiPayload & {
  item?: SummaryListItem;
};

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

function summarizeUnexpectedResponse(response: Response, rawText: string) {
  const normalizedText = rawText.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const lowerText = normalizedText.toLowerCase();

  if (response.status === 413 || lowerText.includes("request entity too large")) {
    return "الخادم رفض الطلب لأن حجمه كبير جدًا. تم التحويل إلى الرفع المجزأ لتجاوز هذا القيد، فحاول مرة أخرى.";
  }

  if (response.status === 403 || lowerText.includes("request forbidden") || lowerText.includes("forbidden")) {
    return "تم رفض الطلب من الخادم أو من طبقة الحماية. أعد تحميل الصفحة وسجل الدخول مجددًا ثم حاول مرة أخرى.";
  }

  if (!normalizedText) {
    return `HTTP ${response.status}`;
  }

  return normalizedText.slice(0, 220);
}

async function readApiPayload<T>(response: Response) {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return (await response.json()) as T;
  }

  const rawText = await response.text();

  return {
    ok: false,
    message: summarizeUnexpectedResponse(response, rawText),
  } as T;
}

async function uploadSummaryFile(
  file: File,
  onProgress: (nextProgress: number) => void,
) {
  const sessionResponse = await fetch("/api/summaries/uploads", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fileName: file.name,
      fileMimeType: file.type || "application/pdf",
      fileSizeBytes: file.size,
    }),
  });

  const sessionPayload = await readApiPayload<SummaryUploadSessionPayload>(sessionResponse);

  if (!sessionResponse.ok || !sessionPayload.session) {
    throw new Error(sessionPayload.message || "تعذر بدء رفع الملف.");
  }

  const { sessionId, chunkSizeBytes, totalChunks } = sessionPayload.session;

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex += 1) {
    const start = chunkIndex * chunkSizeBytes;
    const end = Math.min(file.size, start + chunkSizeBytes);
    const formData = new FormData();
    formData.set("chunk", file.slice(start, end), file.name);
    formData.set("chunkIndex", String(chunkIndex));

    const chunkResponse = await fetch(`/api/summaries/uploads/${sessionId}`, {
      method: "POST",
      body: formData,
    });

    const chunkPayload = await readApiPayload<SummaryUploadChunkPayload>(chunkResponse);

    if (!chunkResponse.ok || !chunkPayload.progress) {
      throw new Error(chunkPayload.message || "تعذر رفع جزء من الملف.");
    }

    const nextProgress = Math.round(
      (chunkPayload.progress.uploadedChunks / chunkPayload.progress.totalChunks) * 100,
    );
    onProgress(Math.min(100, Math.max(0, nextProgress)));
  }

  const finalizeResponse = await fetch(`/api/summaries/uploads/${sessionId}`, {
    method: "PATCH",
  });
  const finalizePayload = await readApiPayload<SummaryUploadCompletePayload>(finalizeResponse);

  if (!finalizeResponse.ok || !finalizePayload.item) {
    throw new Error(finalizePayload.message || "تعذر إكمال رفع الملف.");
  }

  return finalizePayload.item;
}

async function readSummaries() {
  const response = await fetch("/api/summaries", {
    cache: "no-store",
  });

  const payload = await readApiPayload<{
    ok?: boolean;
    items?: SummaryListItem[];
    message?: string;
  }>(response);

  if (!response.ok || !Array.isArray(payload.items)) {
    throw new Error(payload.message || "تعذر جلب الملخصات.");
  }

  return payload.items;
}

async function deleteSummary(summaryId: string) {
  const response = await fetch(`/api/summaries/${summaryId}`, {
    method: "DELETE",
  });

  const payload = await readApiPayload<{
    ok?: boolean;
    message?: string;
  }>(response);

  if (!response.ok) {
    throw new Error(payload.message || "تعذر حذف الملخص.");
  }
}

export function SummaryLibrary({
  initialAuthUser = null,
}: {
  initialAuthUser?: AuthSessionUser | null;
}) {
  const { status, user } = useAuthSession();
  const effectiveUser = status === "authenticated" ? user : status === "loading" ? initialAuthUser : null;
  const isAuthenticated = Boolean(effectiveUser);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [items, setItems] = useState<SummaryListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingSummaryId, setDeletingSummaryId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
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
  }, [isAuthenticated]);

  async function handleFileChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setMessage(null);
    setError(null);

    try {
      const uploadedItem = await uploadSummaryFile(file, setUploadProgress);
      setItems((current) => [uploadedItem, ...current.filter((item) => item.id !== uploadedItem.id)]);
      setMessage("تم رفع الملخص بنجاح وإضافته إلى مكتبتك.");
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "تعذر رفع الملف.");
    } finally {
      setIsUploading(false);
      setUploadProgress(null);
      event.target.value = "";
    }
  }

  async function handleDeleteSummary(item: SummaryListItem) {
    const confirmed = window.confirm(`هل تريد حذف الملخص "${item.fileName}" نهائيًا من مكتبتك؟`);
    if (!confirmed) {
      return;
    }

    setDeletingSummaryId(item.id);
    setMessage(null);
    setError(null);

    try {
      await deleteSummary(item.id);
      setItems((current) => current.filter((entry) => entry.id !== item.id));
      setMessage(`تم حذف الملخص "${item.fileName}" من مكتبتك.`);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "تعذر حذف الملخص.");
    } finally {
      setDeletingSummaryId(null);
    }
  }

  if (status === "loading" && !initialAuthUser) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-3 p-10 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          جارٍ تجهيز مكتبة الملخصات...
        </CardContent>
      </Card>
    );
  }

  if (!isAuthenticated || !effectiveUser) {
    return (
      <StudentAccessCard
        title="قسم الملخصات مرتبط بحسابك"
        description="يجب إنشاء حساب وتسجيل الدخول لاستخدام قسم الملخصات وحفظ ملفاتك وملاحظاتك والرجوع لها لاحقًا من مكتبتك الخاصة."
        next="/summaries/library"
      />
    );
  }

  return (
    <div className="relative isolate z-0 space-y-6">
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

      {isUploading && uploadProgress !== null ? (
        <div className="rounded-[1.4rem] border border-sky-200 bg-sky-50 px-5 py-4 text-sm font-semibold text-sky-700">
          جارٍ رفع الملف على دفعات آمنة... {uploadProgress}%
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
                  <a href={`/summaries/${item.id}`} className={cn(buttonVariants(), "gap-2")}>
                    <FilePlus2 className="h-4 w-4" />
                    افتح الملخص
                  </a>
                  <a
                    href={`/api/summaries/${item.id}/file`}
                    target="_blank"
                    rel="noreferrer"
                    className={buttonVariants({ variant: "outline" })}
                  >
                    عرض الملف الأصلي
                  </a>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDeleteSummary(item)}
                    disabled={deletingSummaryId === item.id}
                    className="gap-2 border-rose-200 text-rose-700 hover:bg-rose-50 hover:text-rose-800"
                  >
                    {deletingSummaryId === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                    حذف الملخص
                  </Button>
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
