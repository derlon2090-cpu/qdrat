"use client";

import { useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";

import { buildPublicApiUrl } from "@/lib/api-base";
import type { VerbalPassageRecord, VerbalPassageSummary } from "@/lib/verbal-passages";
import { VerbalPassageViewer } from "@/components/verbal-passage-viewer";
import { Input } from "@/components/ui/input";

const SEARCH_MIN_CHARS = 3;
const SEARCH_DEBOUNCE_MS = 400;

export function VerbalPassagesBrowser({ mode = "student" }: { mode?: "student" | "admin" }) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [results, setResults] = useState<VerbalPassageSummary[]>([]);
  const [selectedPassage, setSelectedPassage] = useState<VerbalPassageRecord | null>(null);
  const [selectedPassageId, setSelectedPassageId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingPassage, setIsLoadingPassage] = useState(false);
  const [message, setMessage] = useState("اكتب 3 أحرف فأكثر ليبدأ البحث في عنوان القطعة والكلمات المفتاحية.");

  const normalizedLength = useMemo(() => query.replace(/\s+/g, "").length, [query]);
  const selectedResultIndex = useMemo(
    () => results.findIndex((item) => item.id === selectedPassageId),
    [results, selectedPassageId],
  );
  const nextPassage = selectedResultIndex >= 0 ? results[selectedResultIndex + 1] ?? null : null;

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuery(query);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [query]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setMessage("اكتب 3 أحرف فأكثر ليبدأ البحث في عنوان القطعة والكلمات المفتاحية.");
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
  }, [debouncedQuery, mode]);

  useEffect(() => {
    if (!selectedPassageId) return;

    const controller = new AbortController();
    setIsLoadingPassage(true);

    fetch(buildPublicApiUrl(`/api/verbal-passages/${selectedPassageId}`), {
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

  return (
    <div dir="rtl" className="space-y-6">
      <div className="rounded-[2rem] border border-[#E8D8B3] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,247,244,0.96))] p-7 shadow-soft">
        <div className="display-font text-3xl font-bold text-slate-950">بنك القطع اللفظي</div>
        <p className="mt-3 max-w-3xl text-sm leading-8 text-slate-600">
          ابحث عن القطعة بعنوانها أو بالكلمات المفتاحية المرتبطة بها. لا تبدأ النتائج إلا بعد كتابة 3 أحرف فأكثر حتى يبقى البحث أدق وأسرع.
        </p>

        <div className="relative mt-5">
          <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="ابحث عن القطعة"
            className="h-14 pr-12 text-base"
          />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <aside className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="display-font text-xl font-bold text-slate-950">نتائج البحث</div>
          <div className="mt-2 text-sm leading-7 text-slate-500">
            {isSearching
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
                setSelectedPassageId(null);
                setSelectedPassage(null);
              }}
            />
          ) : (
            <div className="rounded-[1.8rem] border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
              اختر قطعة من النتائج لتظهر هنا مع النص والأسئلة والخيارات.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
