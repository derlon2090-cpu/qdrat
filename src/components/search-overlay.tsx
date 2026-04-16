"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { questionSearchItems } from "@/data/miyaar";

const RECENT_SEARCHES_KEY = "miyaar-global-searches";

function normalizeArabic(value: string) {
  return value
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[ً-ْ]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function fuzzyMatch(text: string, query: string) {
  const normalizedText = normalizeArabic(text);
  const normalizedQuery = normalizeArabic(query);

  if (!normalizedQuery) return true;
  if (normalizedText.includes(normalizedQuery)) return true;

  let pointer = 0;
  for (const character of normalizedText) {
    if (character === normalizedQuery[pointer]) pointer += 1;
    if (pointer === normalizedQuery.length) return true;
  }

  return false;
}

export function SearchOverlay() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const deferredQuery = useDeferredValue(query);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }

      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    const stored = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setRecentSearches(parsed.filter((item) => typeof item === "string").slice(0, 5));
      }
    } catch {
      window.localStorage.removeItem(RECENT_SEARCHES_KEY);
    }
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const results = useMemo(() => {
    if (!deferredQuery.trim()) return [];
    return questionSearchItems.filter((item) => fuzzyMatch(item.text, deferredQuery)).slice(0, 8);
  }, [deferredQuery]);

  const suggestions = useMemo(() => {
    if (!deferredQuery.trim()) return [];
    return questionSearchItems.filter((item) => fuzzyMatch(item.text, deferredQuery)).slice(0, 4);
  }, [deferredQuery]);

  function saveRecentSearch(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;

    const next = [trimmed, ...recentSearches.filter((item) => item !== trimmed)].slice(0, 5);
    setRecentSearches(next);
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
  }

  function closeSearch() {
    setOpen(false);
  }

  return (
    <>
      <div className="fixed bottom-6 left-6 z-50">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="search-btn group"
          aria-label="افتح البحث"
        >
          <Search className="h-5 w-5 text-[#123B7A] transition group-hover:scale-110" />
        </button>
      </div>

      {open ? (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm">
          <div className="mx-auto flex min-h-screen w-[min(calc(100%-2rem),760px)] items-start justify-center pt-24">
            <div className="w-full rounded-[1.8rem] border border-white/60 bg-white/96 p-4 shadow-[0_24px_80px_rgba(0,0,0,0.18)]">
              <div className="mb-4 flex items-center justify-between gap-4">
                <div>
                  <div className="display-font text-2xl font-bold text-slate-950">ابحث عن أي سؤال مباشرة</div>
                  <div className="mt-1 text-sm text-slate-500">
                    مثال: النسبة والتناسب، القطع، التناظر...
                  </div>
                </div>
                <button
                  type="button"
                  onClick={closeSearch}
                  className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 transition hover:bg-slate-100"
                  aria-label="إغلاق البحث"
                >
                  <X className="h-5 w-5 text-slate-600" />
                </button>
              </div>

              <div className="relative">
                <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <Input
                  autoFocus
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onBlur={() => saveRecentSearch(query)}
                  placeholder="ابحث عن سؤال..."
                  className="h-14 pr-12 text-base"
                />
              </div>

              {!query.trim() && recentSearches.length ? (
                <div className="mt-4">
                  <div className="mb-3 text-sm font-semibold text-slate-500">آخر عمليات البحث</div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setQuery(item)}
                        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[#C99A43] hover:text-[#123B7A]"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {query.trim() ? (
                <>
                  <div className="mt-4">
                    <div className="mb-3 text-sm font-semibold text-slate-500">اقتراحات أثناء الكتابة</div>
                    <div className="flex flex-wrap gap-2">
                      {suggestions.length ? (
                        suggestions.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            onMouseDown={() => {
                              setQuery(item.text);
                              saveRecentSearch(item.text);
                            }}
                            className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[#C99A43] hover:text-[#123B7A]"
                          >
                            {item.text}
                          </button>
                        ))
                      ) : (
                        <span className="text-sm text-slate-500">لا توجد اقتراحات مطابقة.</span>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 space-y-3">
                    <div className="text-sm font-semibold text-slate-500">نتائج مباشرة</div>
                    {results.length ? (
                      results.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-col gap-4 rounded-[1.4rem] border border-slate-200 bg-white p-4 md:flex-row md:items-center md:justify-between"
                        >
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2 text-xs">
                              <span className="rounded-full bg-[#123B7A] px-3 py-1 font-semibold text-white">
                                {item.section}
                              </span>
                              <span className="rounded-full bg-amber-50 px-3 py-1 font-semibold text-amber-700">
                                {item.type}
                              </span>
                              <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-700">
                                {item.difficulty}
                              </span>
                            </div>
                            <div className="text-base leading-8 text-slate-900">{item.text}</div>
                          </div>
                          <Link
                            href={item.href}
                            onClick={() => {
                              saveRecentSearch(query || item.text);
                              closeSearch();
                            }}
                          >
                            <Button>افتح السؤال</Button>
                          </Link>
                        </div>
                      ))
                    ) : (
                      <div className="rounded-[1.4rem] border border-dashed border-slate-300 bg-slate-50/80 p-6 text-center text-sm text-slate-500">
                        لا توجد نتائج مطابقة الآن. جرّب كلمة أقصر أو صياغة مختلفة.
                      </div>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
