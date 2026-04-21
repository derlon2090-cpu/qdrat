"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Circle,
  Download,
  Eraser,
  Eye,
  EyeOff,
  Highlighter,
  Loader2,
  MessageSquareOff,
  NotebookPen,
  Paintbrush,
  RotateCcw,
  RotateCw,
  Search,
  Square,
  SquarePen,
} from "lucide-react";

import { SummaryPageSurface } from "@/components/summary-page-surface";
import { StudentAccessCard } from "@/components/student-access-card";
import { useAuthSession } from "@/hooks/use-auth-session";
import type { SummaryDetail, SummaryPageState } from "@/lib/summaries";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type ActiveTool = "navigate" | "pen" | "highlighter" | "eraser";
type SaveState = "idle" | "saving" | "saved" | "error";
type SummaryPageColor = SummaryPageState["pageColor"];

function createEmptyPageState(pageNumber: number): SummaryPageState {
  return {
    pageNumber,
    noteText: "",
    reviewed: false,
    pageColor: null,
    hideRegions: [],
    solutionBoxes: [],
    drawings: [],
    createdAt: null,
    updatedAt: null,
  };
}

function buildPageStateMap(items: SummaryPageState[]) {
  return items.reduce<Record<number, SummaryPageState>>((accumulator, item) => {
    accumulator[item.pageNumber] = item;
    return accumulator;
  }, {});
}

function pageColorClasses(color: SummaryPageColor, selected: boolean) {
  if (selected) {
    return "border-transparent bg-[#102955] text-white shadow-[0_16px_35px_rgba(16,41,85,0.22)]";
  }

  if (color === "red") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  if (color === "yellow") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  if (color === "green") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  return "border-slate-200 bg-white text-slate-700";
}

function noteBadgeText(state: SummaryPageState) {
  if (state.reviewed) {
    return "تمت";
  }

  if (state.noteText.trim()) {
    return "ملاحظة";
  }

  return "جديدة";
}

function BackToSummariesLink({
  centered = false,
  tone = "primary",
}: {
  centered?: boolean;
  tone?: "primary" | "danger";
}) {
  const frameClass =
    tone === "danger"
      ? "border-rose-200 bg-white text-rose-700 shadow-[0_12px_28px_rgba(225,29,72,0.08)] hover:border-rose-300 hover:bg-rose-50/80"
      : "border-[#d7e3f7] bg-white text-[#123B7A] shadow-[0_14px_32px_rgba(18,59,122,0.1)] hover:border-[#123B7A]/30 hover:bg-[#f7faff]";
  const iconClass =
    tone === "danger"
      ? "border-rose-200 bg-rose-50 text-rose-700"
      : "border-[#d7e3f7] bg-[#eef4ff] text-[#123B7A]";
  const subTextClass = tone === "danger" ? "text-rose-600/80" : "text-slate-500";

  return (
    <div className={cn("relative z-20", centered ? "flex justify-center" : "")}>
      <Link
        href="/summaries"
        className={cn(
          "pointer-events-auto group inline-flex w-fit cursor-pointer items-center gap-3 rounded-[1.15rem] border px-4 py-3 text-right transition hover:-translate-y-0.5",
          frameClass,
        )}
        aria-label="الانتقال إلى مكتبة الملخصات"
      >
        <span
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full border transition group-hover:scale-105",
            iconClass,
          )}
        >
          <ArrowRight className="h-4 w-4" />
        </span>
        <span className="flex flex-col leading-6">
          <span className="text-sm font-bold">العودة إلى مكتبة الملخصات</span>
          <span className={cn("text-xs", subTextClass)}>جميع الملخصات المحفوظة</span>
        </span>
      </Link>
    </div>
  );
}

function downloadTextFile(fileName: string, content: string) {
  const blob = new Blob([content], {
    type: "text/markdown;charset=utf-8",
  });
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}

async function fetchSummary(summaryId: string) {
  const response = await fetch(`/api/summaries/${summaryId}`, {
    cache: "no-store",
  });

  const payload = (await response.json()) as {
    ok?: boolean;
    item?: SummaryDetail;
    message?: string;
  };

  if (!response.ok || !payload.item) {
    throw new Error(payload.message || "تعذر تحميل الملخص.");
  }

  return payload.item;
}

export function SummaryWorkspace({ summaryId }: { summaryId: string }) {
  const { status, user } = useAuthSession();
  const [summary, setSummary] = useState<SummaryDetail | null>(null);
  const [pageStates, setPageStates] = useState<Record<number, SummaryPageState>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [pageInput, setPageInput] = useState("1");
  const [hideAnswers, setHideAnswers] = useState(true);
  const [reviewMode, setReviewMode] = useState(false);
  const [hideNotesInReview, setHideNotesInReview] = useState(true);
  const [showOnlyPagesWithNotes, setShowOnlyPagesWithNotes] = useState(false);
  const [noteSearch, setNoteSearch] = useState("");
  const [activeTool, setActiveTool] = useState<ActiveTool>("navigate");
  const [strokeColor, setStrokeColor] = useState("#0f172a");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [redoStrokesByPage, setRedoStrokesByPage] = useState<Record<number, SummaryPageState["drawings"]>>({});
  const noteTextareaRef = useRef<HTMLTextAreaElement | null>(null);
  const pageSaveTimersRef = useRef<Map<number, number>>(new Map());
  const pendingSavesRef = useRef<Map<number, SummaryPageState>>(new Map());
  const lastPageTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (status !== "authenticated") {
      setIsLoading(false);
      return;
    }

    let aborted = false;
    setIsLoading(true);
    setError(null);

    void fetchSummary(summaryId)
      .then((item) => {
        if (aborted) return;
        setSummary(item);
        setPageStates(buildPageStateMap(item.pageStates));
        setCurrentPage(item.lastOpenedPage || 1);
        setPageInput(String(item.lastOpenedPage || 1));
      })
      .catch((nextError) => {
        if (!aborted) {
          setError(nextError instanceof Error ? nextError.message : "تعذر تحميل الملخص.");
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
  }, [status, summaryId]);

  useEffect(() => {
    if (status !== "authenticated" || !user || !summary) {
      return;
    }

    const timerId = window.setTimeout(() => {
      void fetch("/api/student/activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          label: `فتح ملخص ${summary.fileName}`,
          path: `/summaries/${summary.id}`,
          summaryId: summary.id,
          summaryName: summary.fileName,
          summaryPage: currentPage,
        }),
      }).catch(() => undefined);
    }, 300);

    return () => window.clearTimeout(timerId);
  }, [currentPage, status, summary, user]);

  useEffect(() => {
    function handlePageHide() {
      pageSaveTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
      pageSaveTimersRef.current.clear();
      pendingSavesRef.current.forEach((state, pageNumber) => {
        void fetch(`/api/summaries/${summaryId}/pages/${pageNumber}`, {
          method: "PATCH",
          keepalive: true,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            noteText: state.noteText,
            reviewed: state.reviewed,
            pageColor: state.pageColor,
            hideRegions: state.hideRegions,
            solutionBoxes: state.solutionBoxes,
            drawings: state.drawings,
          }),
        }).catch(() => undefined);
      });
    }

    window.addEventListener("pagehide", handlePageHide);
    return () => {
      window.removeEventListener("pagehide", handlePageHide);
      handlePageHide();
    };
  }, [summaryId]);

  const persistSummaryMetrics = useCallback(
    (nextStates: Record<number, SummaryPageState>, nextCurrentPage = currentPage) => {
      setSummary((current) => {
        if (!current) return current;
        const noteCount = Object.values(nextStates).filter((item) => item.noteText.trim().length > 0).length;
        const reviewedPages = Object.values(nextStates).filter((item) => item.reviewed).length;

        return {
          ...current,
          lastOpenedPage: nextCurrentPage,
          noteCount,
          reviewedPages,
          completionRatio: current.pageCount ? Math.round((reviewedPages / current.pageCount) * 100) : 0,
        };
      });
    },
    [currentPage],
  );

  const getPageState = useCallback(
    (pageNumber: number) => pageStates[pageNumber] ?? createEmptyPageState(pageNumber),
    [pageStates],
  );

  const persistPageState = useCallback(
    async (pageNumber: number, state: SummaryPageState) => {
      try {
        setSaveState("saving");
        const response = await fetch(`/api/summaries/${summaryId}/pages/${pageNumber}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            noteText: state.noteText,
            reviewed: state.reviewed,
            pageColor: state.pageColor,
            hideRegions: state.hideRegions,
            solutionBoxes: state.solutionBoxes,
            drawings: state.drawings,
          }),
        });

        const payload = (await response.json()) as {
          ok?: boolean;
          item?: SummaryPageState;
          message?: string;
        };

        if (!response.ok || !payload.item) {
          throw new Error(payload.message || "تعذر حفظ الصفحة.");
        }

        setPageStates((current) => {
          const next = {
            ...current,
            [pageNumber]: payload.item!,
          };
          persistSummaryMetrics(next, pageNumber);
          return next;
        });
        pendingSavesRef.current.delete(pageNumber);
        pageSaveTimersRef.current.delete(pageNumber);
        setSaveState("saved");
      } catch (saveError) {
        setSaveState("error");
        setError(saveError instanceof Error ? saveError.message : "تعذر حفظ تعديلات الصفحة.");
      }
    },
    [persistSummaryMetrics, summaryId],
  );

  const schedulePageSave = useCallback(
    (pageNumber: number, state: SummaryPageState) => {
      const previousTimer = pageSaveTimersRef.current.get(pageNumber);
      if (previousTimer) {
        window.clearTimeout(previousTimer);
      }

      pendingSavesRef.current.set(pageNumber, state);

      const nextTimer = window.setTimeout(() => {
        void persistPageState(pageNumber, state);
      }, 650);

      pageSaveTimersRef.current.set(pageNumber, nextTimer);
    },
    [persistPageState],
  );

  const updatePageState = useCallback(
    (
      pageNumber: number,
      nextState: SummaryPageState,
      options?: {
        clearRedo?: boolean;
      },
    ) => {
      setPageStates((current) => {
        const next = {
          ...current,
          [pageNumber]: nextState,
        };
        persistSummaryMetrics(next, currentPage);
        return next;
      });

      if (options?.clearRedo) {
        setRedoStrokesByPage((current) => ({
          ...current,
          [pageNumber]: [],
        }));
      }

      schedulePageSave(pageNumber, nextState);
    },
    [currentPage, persistSummaryMetrics, schedulePageSave],
  );

  useEffect(() => {
    if (!summary) return;

    setPageInput(String(currentPage));

    if (lastPageTimerRef.current) {
      window.clearTimeout(lastPageTimerRef.current);
    }

    lastPageTimerRef.current = window.setTimeout(() => {
      void fetch(`/api/summaries/${summary.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          lastOpenedPage: currentPage,
        }),
      }).catch(() => undefined);
    }, 450);

    setSummary((current) => (current ? { ...current, lastOpenedPage: currentPage } : current));
  }, [currentPage, summary]);

  const currentState = useMemo(() => getPageState(currentPage), [currentPage, getPageState]);

  const filteredPages = useMemo(() => {
    if (!summary) return [];

    const normalizedQuery = noteSearch.trim().toLowerCase();

    return Array.from({ length: summary.pageCount }, (_, index) => index + 1).filter((pageNumber) => {
      const state = getPageState(pageNumber);

      if (showOnlyPagesWithNotes && !state.noteText.trim()) {
        return false;
      }

      if (normalizedQuery && !state.noteText.toLowerCase().includes(normalizedQuery)) {
        return false;
      }

      return true;
    });
  }, [getPageState, noteSearch, showOnlyPagesWithNotes, summary]);

  function jumpToPage(nextPage: number) {
    if (!summary) return;
    const page = Math.min(Math.max(1, nextPage), summary.pageCount);
    setCurrentPage(page);
  }

  function addSolutionBox() {
    updatePageState(currentPage, {
      ...currentState,
      solutionBoxes: [
        ...currentState.solutionBoxes,
        {
          id: `solution-${Date.now()}`,
          x: 0.08,
          y: 0.18,
          width: 0.32,
          height: 0.2,
          content: "",
        },
      ],
    });
  }

  function addHideRegion(preset: "bottom-right" | "custom" = "bottom-right") {
    updatePageState(currentPage, {
      ...currentState,
      hideRegions: [
        ...currentState.hideRegions,
        {
          id: `hide-${Date.now()}`,
          x: preset === "bottom-right" ? 0.7 : 0.38,
          y: preset === "bottom-right" ? 0.84 : 0.46,
          width: preset === "bottom-right" ? 0.22 : 0.18,
          height: preset === "bottom-right" ? 0.08 : 0.06,
          preset,
        },
      ],
    });
  }

  function toggleReviewed() {
    updatePageState(currentPage, {
      ...currentState,
      reviewed: !currentState.reviewed,
    });
  }

  function setPageColor(nextColor: SummaryPageColor) {
    updatePageState(currentPage, {
      ...currentState,
      pageColor: nextColor,
    });
  }

  function handleUndo() {
    if (!currentState.drawings.length) return;

    const removedStroke = currentState.drawings[currentState.drawings.length - 1];
    setRedoStrokesByPage((current) => ({
      ...current,
      [currentPage]: [removedStroke, ...(current[currentPage] ?? [])],
    }));

    updatePageState(currentPage, {
      ...currentState,
      drawings: currentState.drawings.slice(0, -1),
    });
  }

  function handleRedo() {
    const redoQueue = redoStrokesByPage[currentPage] ?? [];
    if (!redoQueue.length) return;

    const [restoredStroke, ...remaining] = redoQueue;
    setRedoStrokesByPage((current) => ({
      ...current,
      [currentPage]: remaining,
    }));

    updatePageState(
      currentPage,
      {
        ...currentState,
        drawings: [...currentState.drawings, restoredStroke],
      },
      { clearRedo: false },
    );
  }

  function exportNotes() {
    if (!summary) return;

    const pagesWithNotes = Object.values(pageStates)
      .filter((item) => item.noteText.trim().length > 0)
      .sort((first, second) => first.pageNumber - second.pageNumber);

    const content = [
      `# ${summary.fileName}`,
      "",
      `- عدد الصفحات: ${summary.pageCount}`,
      `- عدد الصفحات التي تحتوي على ملاحظات: ${pagesWithNotes.length}`,
      "",
      ...pagesWithNotes.flatMap((item) => [
        `## صفحة ${item.pageNumber}`,
        item.reviewed ? "- الحالة: تمت مراجعتها" : "- الحالة: غير مكتملة",
        item.pageColor ? `- التلوين: ${item.pageColor}` : "- التلوين: بدون",
        "",
        item.noteText.trim(),
        "",
      ]),
    ].join("\n");

    downloadTextFile(
      `${summary.fileName.replace(/\.pdf$/i, "").replace(/[\\/:*?"<>|]+/g, "-")}-notes.md`,
      content,
    );
  }

  if (status === "loading" || isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center gap-3 p-10 text-slate-500">
          <Loader2 className="h-5 w-5 animate-spin" />
          جارٍ تجهيز مساحة الدراسة...
        </CardContent>
      </Card>
    );
  }

  if (status !== "authenticated" || !user) {
    return (
      <StudentAccessCard
        title="هذا الملخص يحتاج تسجيل دخول"
        description="يجب إنشاء حساب وتسجيل الدخول لاستخدام الملخص التفاعلي وحفظ ملاحظاتك ورسوماتك ومساحات الحل داخل مكتبتك."
        next={`/summaries/${summaryId}`}
      />
    );
  }

  if (error && !summary) {
    return (
      <Card className="border border-rose-200 bg-rose-50/80">
        <CardContent className="space-y-4 p-8 text-center">
          <div className="display-font text-2xl font-bold text-rose-700">تعذر فتح الملخص</div>
          <p className="text-sm leading-8 text-rose-700/90">{error}</p>
          <BackToSummariesLink centered tone="danger" />
        </CardContent>
      </Card>
    );
  }

  if (!summary) {
    return null;
  }

  const notePagesCount = Object.values(pageStates).filter((item) => item.noteText.trim().length > 0).length;
  const pageDimension = summary.pageDimensions[currentPage - 1] ?? summary.pageDimensions[0];
  const effectiveHideAnswers = hideAnswers || reviewMode;
  const notesAreTemporarilyHidden = reviewMode && hideNotesInReview;

  return (
    <div className="space-y-6">
      <Card className="relative z-20 border border-[#E8D8B3] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,247,244,0.96))]">
        <CardContent className="flex flex-col gap-5 p-7 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <BackToSummariesLink />
            <div className="mini-pill bg-[#123B7A]/5 text-[#123B7A]">ملخص تفاعلي محفوظ داخل حسابك</div>
            <h2 className="mt-4 display-font text-3xl font-bold text-slate-950">{summary.fileName}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-8 text-slate-600">
              تنقل بين الصفحات، أخفِ الإجابات، اكتب بالقلم، أضف مساحات حل وملاحظات، وكل شيء سيبقى محفوظًا تلقائيًا.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="button" variant="outline" onClick={exportNotes} className="gap-2">
              <Download className="h-4 w-4" />
              تصدير الملاحظات
            </Button>
            <a href={`/api/summaries/${summary.id}/export`}>
              <Button type="button" variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                تنزيل PDF مشروح
              </Button>
            </a>
            <a href={`/api/summaries/${summary.id}/file`} target="_blank" rel="noreferrer">
              <Button variant="outline">عرض الملف الأصلي</Button>
            </a>
          </div>
        </CardContent>
      </Card>

      {error ? (
        <div className="rounded-[1.4rem] border border-rose-200 bg-rose-50 px-5 py-4 text-sm font-semibold text-rose-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[320px,1fr]">
        <Card className="border-white/80 bg-white/95 shadow-soft">
          <CardContent className="space-y-5 p-6">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50/70 p-4">
                <div className="text-xs font-semibold text-slate-500">عدد الصفحات</div>
                <div className="mt-2 display-font text-2xl font-bold text-slate-950">{summary.pageCount}</div>
              </div>
              <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50/70 p-4">
                <div className="text-xs font-semibold text-slate-500">صفحات فيها ملاحظات</div>
                <div className="mt-2 display-font text-2xl font-bold text-slate-950">{notePagesCount}</div>
              </div>
              <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50/70 p-4">
                <div className="text-xs font-semibold text-slate-500">آخر صفحة وصلت لها</div>
                <div className="mt-2 display-font text-2xl font-bold text-slate-950">{summary.lastOpenedPage}</div>
              </div>
              <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50/70 p-4">
                <div className="text-xs font-semibold text-slate-500">حالة الحفظ</div>
                <div className="mt-2 text-sm font-bold text-slate-900">
                  {saveState === "saving"
                    ? "جارٍ الحفظ..."
                    : saveState === "saved"
                      ? "تم الحفظ"
                      : saveState === "error"
                        ? "حدث خطأ"
                        : "جاهز"}
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <div className="display-font text-lg font-bold text-slate-950">التنقل بين الصفحات</div>
                <button
                  type="button"
                  onClick={() => setShowOnlyPagesWithNotes((current) => !current)}
                  className={cn(
                    "rounded-full px-3 py-1 text-xs font-semibold transition",
                    showOnlyPagesWithNotes ? "bg-[#123B7A] text-white" : "bg-slate-100 text-slate-600",
                  )}
                >
                  {showOnlyPagesWithNotes ? "عرض الكل" : "الصفحات ذات الملاحظات فقط"}
                </button>
              </div>

              <div className="relative">
                <Search className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={noteSearch}
                  onChange={(event) => setNoteSearch(event.target.value)}
                  placeholder="ابحث داخل الملاحظات..."
                  className="h-11 pr-10 text-sm"
                />
              </div>

              <div className="mt-4 grid max-h-[360px] grid-cols-3 gap-2 overflow-y-auto pl-1">
                {filteredPages.map((pageNumber) => {
                  const state = getPageState(pageNumber);

                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => jumpToPage(pageNumber)}
                      className={cn(
                        "rounded-[1.1rem] border px-3 py-3 text-center transition",
                        pageColorClasses(state.pageColor, pageNumber === currentPage),
                      )}
                    >
                      <div className="display-font text-lg font-bold">صفحة {pageNumber}</div>
                      <div className="mt-1 flex items-center justify-center gap-1 text-[11px] font-semibold">
                        {state.reviewed ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Circle className="h-3.5 w-3.5" />}
                        <span>{noteBadgeText(state)}</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="relative z-10 border-white/80 bg-white/96 shadow-soft">
            <CardContent className="space-y-5 p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="display-font text-2xl font-bold text-slate-950">الصفحة {currentPage}</div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => jumpToPage(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="gap-2"
                  >
                    <ArrowRight className="h-4 w-4" />
                    السابقة
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => jumpToPage(currentPage + 1)}
                    disabled={currentPage >= summary.pageCount}
                    className="gap-2"
                  >
                    التالية
                    <ArrowLeft className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-[160px,1fr]">
                <div className="flex items-center gap-2">
                  <Input
                    value={pageInput}
                    onChange={(event) => setPageInput(event.target.value.replace(/[^\d]/g, ""))}
                    className="h-11 text-center"
                    inputMode="numeric"
                  />
                  <Button type="button" variant="outline" onClick={() => jumpToPage(Number(pageInput) || 1)}>
                    انتقال
                  </Button>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setHideAnswers((current) => !current)}
                    className="gap-2"
                    disabled={reviewMode}
                  >
                    {effectiveHideAnswers ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    {reviewMode
                      ? "الإجابات مخفية بوضع المراجعة"
                      : effectiveHideAnswers
                        ? "إظهار الإجابات"
                        : "إخفاء الإجابات"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => addHideRegion("bottom-right")} className="gap-2">
                    <SquarePen className="h-4 w-4" />
                    إضافة مربع إخفاء
                  </Button>
                  <Button type="button" variant="outline" onClick={() => addHideRegion("custom")} className="gap-2">
                    <Square className="h-4 w-4" />
                    مربع مخصص
                  </Button>
                  <Button type="button" variant="outline" onClick={addSolutionBox} className="gap-2">
                    <NotebookPen className="h-4 w-4" />
                    إضافة مساحة حل
                  </Button>
                  <Button type="button" variant="outline" onClick={() => noteTextareaRef.current?.focus()} className="gap-2">
                    <NotebookPen className="h-4 w-4" />
                    إضافة ملاحظة
                  </Button>
                  <Button
                    type="button"
                    variant={reviewMode ? "default" : "outline"}
                    onClick={() => setReviewMode((current) => !current)}
                    className="gap-2"
                  >
                    <EyeOff className="h-4 w-4" />
                    مراجعة بدون إجابات
                  </Button>
                  {reviewMode ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setHideNotesInReview((current) => !current)}
                      className="gap-2"
                    >
                      <MessageSquareOff className="h-4 w-4" />
                      {hideNotesInReview ? "إظهار الملاحظات" : "إخفاء الملاحظات"}
                    </Button>
                  ) : null}
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {([
                  ["navigate", "تنقل", Search],
                  ["pen", "قلم", Paintbrush],
                  ["highlighter", "هايلايتر", Highlighter],
                  ["eraser", "ممحاة", Eraser],
                ] as const).map(([toolId, label, Icon]) => (
                  <button
                    key={toolId}
                    type="button"
                    onClick={() => setActiveTool(toolId)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition",
                      activeTool === toolId
                        ? "border-transparent bg-[#123B7A] text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:border-[#123B7A]/20 hover:text-[#123B7A]",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {label}
                  </button>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <div className="text-xs font-semibold text-slate-500">ألوان القلم</div>
                {["#0f172a", "#1d4ed8", "#dc2626", "#16a34a", "#ca8a04", "#7c3aed"].map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setStrokeColor(color)}
                    className={cn(
                      "h-8 w-8 rounded-full border-2 transition",
                      strokeColor === color ? "scale-110 border-slate-900" : "border-white shadow",
                    )}
                    style={{ backgroundColor: color }}
                    aria-label={`لون ${color}`}
                  />
                ))}
                <div className="mr-2 text-xs font-semibold text-slate-500">السماكة</div>
                {[2, 4, 7].map((width) => (
                  <button
                    key={width}
                    type="button"
                    onClick={() => setStrokeWidth(width)}
                    className={cn(
                      "rounded-full border px-3 py-1 text-xs font-semibold transition",
                      strokeWidth === width ? "border-transparent bg-[#123B7A] text-white" : "border-slate-200 bg-white text-slate-700",
                    )}
                  >
                    {width === 2 ? "رفيع" : width === 4 ? "متوسط" : "عريض"}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={handleUndo}
                  className="rounded-full border border-slate-200 bg-white p-2 text-slate-700 transition hover:border-[#123B7A]/20 hover:text-[#123B7A]"
                  aria-label="Undo"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={handleRedo}
                  className="rounded-full border border-slate-200 bg-white p-2 text-slate-700 transition hover:border-[#123B7A]/20 hover:text-[#123B7A]"
                  aria-label="Redo"
                >
                  <RotateCw className="h-4 w-4" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={toggleReviewed}
                  className={cn(
                    "rounded-full border px-4 py-2 text-sm font-semibold transition",
                    currentState.reviewed ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-700",
                  )}
                >
                  {currentState.reviewed ? "تمت مراجعتها" : "تعليم كتمت مراجعتها"}
                </button>
                {([
                  ["red", "صعبة"],
                  ["yellow", "تحتاج مراجعة"],
                  ["green", "ممتازة"],
                ] as const).map(([color, label]) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setPageColor(currentState.pageColor === color ? null : color)}
                    className={cn(
                      "rounded-full border px-4 py-2 text-sm font-semibold transition",
                      currentState.pageColor === color
                        ? color === "red"
                          ? "border-rose-200 bg-rose-50 text-rose-700"
                          : color === "yellow"
                            ? "border-amber-200 bg-amber-50 text-amber-700"
                            : "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 bg-white text-slate-700",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {reviewMode ? (
            <div className="rounded-[1.4rem] border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
              وضع المراجعة مفعل الآن. سيتم إخفاء الإجابات{hideNotesInReview ? " والملاحظات" : ""} حتى تراجع الصفحة من جديد.
            </div>
          ) : null}

          <SummaryPageSurface
            key={`${summary.id}-${currentPage}`}
            summaryId={summary.id}
            pageNumber={currentPage}
            pageState={currentState}
            pageDimension={pageDimension}
            fileUrl={`/api/summaries/${summary.id}/file`}
            hideAnswers={effectiveHideAnswers}
            activeTool={activeTool}
            strokeColor={strokeColor}
            strokeWidth={strokeWidth}
            onChange={(nextState, meta) => updatePageState(currentPage, nextState, meta)}
          />

          <Card className="border-white/80 bg-white/96 shadow-soft">
            <CardContent className="grid gap-6 p-6 lg:grid-cols-[1fr,220px]">
              <div>
                <div className="display-font text-xl font-bold text-slate-950">ملاحظات الصفحة الحالية</div>
                <p className="mt-2 text-sm leading-8 text-slate-500">
                  كل ملاحظة تحفظ تلقائيًا، ويمكنك البحث فيها لاحقًا من شريط الصفحات.
                </p>
                {notesAreTemporarilyHidden ? (
                  <div className="mt-4 rounded-[1.5rem] border border-amber-200 bg-amber-50 px-4 py-6 text-sm font-semibold leading-8 text-amber-800">
                    الملاحظات مخفية مؤقتًا لأن وضع المراجعة مفعل. يمكنك إظهارها من زر
                    الملاحظات أعلى الصفحة متى احتجت.
                  </div>
                ) : (
                  <textarea
                    ref={noteTextareaRef}
                    value={currentState.noteText}
                    onChange={(event) =>
                      updatePageState(currentPage, {
                        ...currentState,
                        noteText: event.target.value,
                      })
                    }
                    className="mt-4 h-44 w-full resize-none rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4 text-sm leading-8 text-slate-800 outline-none transition focus:border-[#C99A43] focus:ring-4 focus:ring-[#f6ead0]"
                    placeholder="دوّن هنا ملاحظتك على هذه الصفحة..."
                  />
                )}
              </div>

              <div className="space-y-3">
                <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50/70 p-4">
                  <div className="text-xs font-semibold text-slate-500">إخفاءات الإجابة</div>
                  <div className="mt-2 display-font text-2xl font-bold text-slate-950">{currentState.hideRegions.length}</div>
                </div>
                <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50/70 p-4">
                  <div className="text-xs font-semibold text-slate-500">مساحات الحل</div>
                  <div className="mt-2 display-font text-2xl font-bold text-slate-950">{currentState.solutionBoxes.length}</div>
                </div>
                <div className="rounded-[1.2rem] border border-slate-200 bg-slate-50/70 p-4">
                  <div className="text-xs font-semibold text-slate-500">الرسومات</div>
                  <div className="mt-2 display-font text-2xl font-bold text-slate-950">{currentState.drawings.length}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
