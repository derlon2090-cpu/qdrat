"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Dice5, Search } from "lucide-react";

import { buildPublicApiUrl } from "@/lib/api-base";
import type { VerbalPassageRecord, VerbalPassageSummary } from "@/lib/verbal-passages";
import { VerbalPassageViewer } from "@/components/verbal-passage-viewer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SEARCH_MIN_CHARS = 3;
const SEARCH_DEBOUNCE_MS = 400;

type PassageDirectoryItem = Pick<
  VerbalPassageSummary,
  "id" | "slug" | "title" | "status" | "version" | "externalSourceId" | "excerpt"
>;

type ListedPassageItem = VerbalPassageRecord & {
  questionCount?: number;
};

function createExcerpt(text: string, maxLength = 220) {
  const cleanText = text.replace(/\s+/g, " ").trim();
  if (cleanText.length <= maxLength) return cleanText;
  return `${cleanText.slice(0, maxLength).trim()}...`;
}

function mapListedItems(items: ListedPassageItem[]) {
  return items.map(
    (item) =>
      ({
        id: item.id,
        slug: item.slug,
        title: item.title,
        status: item.status,
        version: item.version,
        externalSourceId: item.externalSourceId,
        excerpt: createExcerpt(item.passageText),
      }) satisfies PassageDirectoryItem,
  );
}

export function VerbalPassagesBrowser({ mode = "student" }: { mode?: "student" | "admin" }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<VerbalPassageSummary[]>([]);
  const [availablePassages, setAvailablePassages] = useState<PassageDirectoryItem[]>([]);
  const [selectedPassage, setSelectedPassage] = useState<VerbalPassageRecord | null>(null);
  const [selectedPassageId, setSelectedPassageId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingDirectory, setIsLoadingDirectory] = useState(false);
  const [isLoadingPassage, setIsLoadingPassage] = useState(false);
  const [message, setMessage] = useState("اكتب 3 أحرف فأكثر ليبدأ البحث في عنوان القطعة والكلمات المفتاحية.");

  const requestedSlug = searchParams.get("passage")?.trim().toLowerCase() ?? "";

  const normalizedLength = useMemo(() => query.replace(/\s+/g, "").length, [query]);
  const navigablePassages = useMemo(
    () => (results.length ? results : availablePassages),
    [availablePassages, results],
  );
  const selectedResultIndex = useMemo(
    () => navigablePassages.findIndex((item) => item.id === selectedPassageId),
    [navigablePassages, selectedPassageId],
  );
  const nextPassage = selectedResultIndex >= 0 ? navigablePassages[selectedResultIndex + 1] ?? null : null;

  const openRandomPassage = useCallback(
    (options?: { excludeCurrent?: boolean; clearSearch?: boolean }) => {
      if (!availablePassages.length) return;

      const candidates =
        options?.excludeCurrent && availablePassages.length > 1 && selectedPassageId
          ? availablePassages.filter((item) => item.id !== selectedPassageId)
          : availablePassages;
      const randomPassage = candidates[Math.floor(Math.random() * candidates.length)];

      if (!randomPassage) return;

      if (options?.clearSearch) {
        setQuery("");
        setDebouncedQuery("");
        setResults([]);
      }

      setSelectedPassageId(randomPassage.id);
      setMessage("تم فتح قطعة عشوائية لتبدأ التدريب مباشرة.");
    },
    [availablePassages, selectedPassageId],
  );

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    const controller = new AbortController();
    setIsLoadingDirectory(true);

    fetch(
      buildPublicApiUrl(`/api/verbal-passages?status=${mode === "admin" ? "all" : "published"}&limit=200`),
      {
        cache: "no-store",
        signal: controller.signal,
      },
    )
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("تعذر تحميل دليل القطع اللفظية.");
        }
        return response.json() as Promise<{ items?: ListedPassageItem[] }>;
      })
      .then((payload) => {
        const items = mapListedItems(payload.items ?? []);
        setAvailablePassages(items);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setAvailablePassages([]);
        setMessage(error instanceof Error ? error.message : "تعذر تحميل دليل القطع اللفظية.");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingDirectory(false);
        }
      });

    return () => controller.abort();
  }, [mode]);

  useEffect(() => {
    if (!availablePassages.length) return;

    if (requestedSlug) {
      const matchedPassage = availablePassages.find((item) => item.slug === requestedSlug);
      if (matchedPassage) {
        if (matchedPassage.id !== selectedPassageId) {
          setSelectedPassageId(matchedPassage.id);
          setMessage("");
        }
        return;
      }

      const randomPassage = availablePassages[Math.floor(Math.random() * availablePassages.length)];
      if (randomPassage && randomPassage.id !== selectedPassageId) {
        setSelectedPassageId(randomPassage.id);
        setMessage("لم نجد القطعة المطلوبة بهذا المفتاح، فتم فتح قطعة عشوائية بدلًا منها.");
      }
      return;
    }

    if (!selectedPassageId && !query.trim()) {
      openRandomPassage();
    }
  }, [availablePassages, openRandomPassage, query, requestedSlug, selectedPassageId]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      if (!selectedPassageId) {
        setMessage("اكتب 3 أحرف فأكثر ليبدأ البحث في عنوان القطعة والكلمات المفتاحية.");
      }
      return;
    }

    if (debouncedQuery.replace(/\s+/g, "").length < SEARCH_MIN_CHARS) {
      setResults([]);
      setMessage("لا تظهر أي نتائج قبل الوصول إلى 3 أحرف.");
      return;
    }

    const controller = new AbortController();
    setIsSearching(true);
    setMessage("جاري البحث في بنك القطع اللفظي...");

    fetch(
      buildPublicApiUrl(
        `/api/verbal-passages/search?q=${encodeURIComponent(debouncedQuery)}&includeDraft=${mode === "admin" ? "1" : "0"}`,
      ),
      { signal: controller.signal },
    )
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("تعذر تنفيذ البحث.");
        }
        return response.json() as Promise<{ items?: VerbalPassageSummary[] }>;
      })
      .then((payload) => {
        const items = payload.items ?? [];
        setResults(items);
        setMessage(items.length ? "" : "لا توجد قطع مطابقة لهذه الكلمة المفتاحية.");
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setResults([]);
        setMessage(error instanceof Error ? error.message : "تعذر تنفيذ البحث في القطع اللفظية.");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsSearching(false);
        }
      });

    return () => controller.abort();
  }, [debouncedQuery, mode, selectedPassageId]);

  useEffect(() => {
    if (!selectedPassageId) return;

    const controller = new AbortController();
    setIsLoadingPassage(true);

    fetch(buildPublicApiUrl(`/api/verbal-passages/${selectedPassageId}`), {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("تعذر تحميل تفاصيل القطعة.");
        }
        return response.json() as Promise<{ item?: VerbalPassageRecord }>;
      })
      .then((payload) => {
        setSelectedPassage(payload.item ?? null);
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        setSelectedPassage(null);
        setMessage(error instanceof Error ? error.message : "تعذر تحميل تفاصيل القطعة.");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingPassage(false);
        }
      });

    return () => controller.abort();
  }, [selectedPassageId]);

  useEffect(() => {
    if (!selectedPassage?.slug) return;
    if (requestedSlug === selectedPassage.slug) return;

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("passage", selectedPassage.slug);
    router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
  }, [pathname, requestedSlug, router, searchParams, selectedPassage?.slug]);

  return (
    <div dir="rtl" className="space-y-6">
      <div className="rounded-[2rem] border border-[#E8D8B3] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,247,244,0.96))] p-7 shadow-soft">
        <div className="display-font text-3xl font-bold text-slate-950">بنك القطع اللفظي</div>
        <p className="mt-3 max-w-3xl text-sm leading-8 text-slate-600">
          كل قطعة مرتبطة باسم مفتاحي ثابت، ويمكن فتحها مباشرة من الرابط أو بدء قطعة عشوائية تلقائيًا عند الدخول
          إلى القسم. ويبدأ البحث بعد كتابة 3 أحرف فأكثر حتى تبقى النتائج أدق وأسرع.
        </p>

        <div className="mt-5 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ابحث عن القطعة"
              className="h-14 pr-12 text-base"
            />
          </div>

          <Button
            type="button"
            onClick={() => openRandomPassage({ excludeCurrent: true, clearSearch: true })}
            disabled={isLoadingDirectory || !availablePassages.length}
            className="h-14 rounded-2xl bg-[linear-gradient(135deg,#F5D08A_0%,#E6B85C_40%,#D4A94C_100%)] px-6 text-base font-bold text-slate-950 shadow-[0_12px_30px_rgba(201,154,67,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(201,154,67,0.34)] disabled:translate-y-0 disabled:opacity-60"
          >
            <Dice5 className="ml-2 h-5 w-5" />
            {selectedPassageId ? "ابدأ قطعة عشوائية أخرى" : "ابدأ قطعة عشوائية"}
          </Button>
        </div>

        <div className="mt-3 text-sm leading-7 text-slate-500">
          إذا ما تبي تختار يدويًا، اضغط الزر الذهبي وابدأ مباشرة بقطعة عشوائية من بنك القطع اللفظي.
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <aside className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="display-font text-xl font-bold text-slate-950">نتائج البحث</div>
          <div className="mt-2 text-sm leading-7 text-slate-500">
            {isLoadingDirectory
              ? "جاري تحميل دليل القطع..."
              : isSearching
                ? "جاري البحث..."
                : normalizedLength < SEARCH_MIN_CHARS
                  ? "لا تظهر النتائج قبل 3 أحرف."
                  : `${results.length} نتيجة`}
          </div>

          <div className="mt-5 space-y-3">
            {results.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelectedPassageId(item.id)}
                className={`w-full rounded-[1.35rem] border p-4 text-right transition ${
                  selectedPassageId === item.id
                    ? "border-[#123B7A] bg-[#123B7A]/5"
                    : "border-slate-200 bg-slate-50/70 hover:border-[#C99A43]"
                }`}
              >
                <div className="display-font text-base font-bold text-slate-950">{item.title}</div>
                <div className="mt-1 text-xs font-semibold text-[#123B7A]">/{item.slug}</div>
                <div className="mt-2 text-sm leading-7 text-slate-500">{item.excerpt}</div>
                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-[#123B7A]/8 px-3 py-1 font-semibold text-[#123B7A]">
                    النسخة {item.version}
                  </span>
                  <span
                    className={`rounded-full px-3 py-1 font-semibold ${
                      item.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {item.status === "published" ? "منشورة" : "مسودة"}
                  </span>
                </div>
              </button>
            ))}

            {!results.length ? (
              <div className="rounded-[1.35rem] border border-dashed border-slate-300 bg-slate-50/80 p-5 text-sm leading-7 text-slate-500">
                {message}
              </div>
            ) : null}
          </div>
        </aside>

        <section>
          {isLoadingPassage ? (
            <div className="rounded-[1.8rem] border border-slate-200 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
              جاري تحميل القطعة...
            </div>
          ) : selectedPassage ? (
            <VerbalPassageViewer
              passage={selectedPassage}
              mode={mode}
              nextPassageTitle={nextPassage?.title ?? null}
              onOpenNextPassage={nextPassage ? () => setSelectedPassageId(nextPassage.id) : null}
              onBackToResults={() => {
                const nextParams = new URLSearchParams(searchParams.toString());
                nextParams.delete("passage");
                router.replace(
                  nextParams.toString() ? `${pathname}?${nextParams.toString()}` : pathname,
                  { scroll: false },
                );
                setSelectedPassageId(null);
                setSelectedPassage(null);
              }}
            />
          ) : (
            <div className="rounded-[1.8rem] border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
              اختر قطعة من النتائج لتظهر هنا مع النص والأسئلة والخيارات، أو ابدأ من الرابط المباشر باستخدام
              المفتاح الخاص بالقطعة.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
