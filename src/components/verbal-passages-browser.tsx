"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowUpLeft, Dice5, Search } from "lucide-react";

import { VerbalPassageViewer } from "@/components/verbal-passage-viewer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { verbalReadingKeywords } from "@/data/manual-question-bank";
import { localVerbalPassages } from "@/data/verbal-passages-local";
import { buildPublicApiUrl } from "@/lib/api-base";
import {
  generatePassageSlug,
  normalizeArabicText,
} from "@/lib/verbal-passages-core";
import type {
  VerbalPassageQuestionRecord,
  VerbalPassageRecord,
} from "@/lib/verbal-passages";

const SEARCH_MIN_CHARS = 3;
const SEARCH_DEBOUNCE_MS = 400;

type SearchAvailability = "available" | "unavailable";

type SearchCatalogItem = {
  id: string;
  title: string;
  slug: string;
  availability: SearchAvailability;
  linkedPassageSlug: string | null;
  keywords: string[];
  excerpt: string;
};

function createExcerpt(text: string, maxLength = 120) {
  const cleanText = text.replace(/\s+/g, " ").trim();
  if (cleanText.length <= maxLength) return cleanText;
  return `${cleanText.slice(0, maxLength).trim()}...`;
}

function buildPassageHref(pathname: string, searchParams: URLSearchParams, slug: string) {
  const nextParams = new URLSearchParams(searchParams.toString());
  nextParams.set("passage", slug);
  return `${pathname}?${nextParams.toString()}`;
}

function mapLocalQuestion(
  question: (typeof localVerbalPassages)[number]["questions"][number],
  index: number,
  slug: string,
): VerbalPassageQuestionRecord {
  const [optionA, optionB, optionC, optionD] = question.options;
  const correctOption = (
    question.correctAnswer === optionA
      ? "A"
      : question.correctAnswer === optionB
        ? "B"
        : question.correctAnswer === optionC
          ? "C"
          : "D"
  ) as VerbalPassageQuestionRecord["correctOption"];

  return {
    id: question.id || `local-${slug}-question-${index + 1}`,
    questionOrder: index + 1,
    questionText: question.text,
    optionA,
    optionB,
    optionC,
    optionD,
    correctOption,
    explanation: question.explanations[question.correctAnswer] ?? null,
  };
}

function mapLocalPassage(
  passage: (typeof localVerbalPassages)[number],
  index: number,
): VerbalPassageRecord {
  return {
    id: passage.id || `local-passage-${index + 1}-${passage.slug}`,
    slug: passage.slug,
    title: passage.title,
    keywords: passage.keywords ?? [],
    passageText: passage.passage,
    status: "published",
    version: 1,
    externalSourceId: `local-${passage.slug}`,
    createdAt: "",
    updatedAt: "",
    questions: passage.questions.map((question, questionIndex) =>
      mapLocalQuestion(question, questionIndex, passage.slug),
    ),
  };
}

const fallbackPassages = localVerbalPassages.map(mapLocalPassage);

function mergePassageSources(primary: VerbalPassageRecord[], fallback: VerbalPassageRecord[]) {
  const unique = new Map<string, VerbalPassageRecord>();

  for (const passage of [...primary, ...fallback]) {
    const key = [
      normalizeArabicText(passage.title),
      normalizeArabicText(passage.passageText.slice(0, 240)),
    ].join("::");
    if (!unique.has(key)) {
      unique.set(key, passage);
    }
  }

  return Array.from(unique.values()).sort((left, right) => left.title.localeCompare(right.title, "ar"));
}

function resolveKeywordPassage(title: string, passages: VerbalPassageRecord[]) {
  const normalizedTitle = normalizeArabicText(title);

  const ranked = passages
    .map((passage) => {
      const normalizedSlug = normalizeArabicText(passage.slug.replace(/[-_]+/g, " "));
      const normalizedPassageTitle = normalizeArabicText(passage.title);
      const normalizedKeywords = (passage.keywords ?? []).map((keyword) => normalizeArabicText(keyword));

      let score = 0;

      if (normalizedPassageTitle === normalizedTitle) score = Math.max(score, 110);
      if (normalizedKeywords.includes(normalizedTitle)) score = Math.max(score, 105);
      if (normalizedPassageTitle.includes(normalizedTitle)) score = Math.max(score, 92);
      if (normalizedKeywords.some((keyword) => keyword.includes(normalizedTitle))) score = Math.max(score, 88);
      if (normalizedSlug === normalizedTitle || normalizedSlug.includes(normalizedTitle)) score = Math.max(score, 82);

      return { passage, score };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score || left.passage.title.localeCompare(right.passage.title, "ar"));

  return ranked[0]?.passage ?? null;
}

function getSearchScore(item: SearchCatalogItem, query: string) {
  const normalizedQuery = normalizeArabicText(query);
  if (!normalizedQuery || normalizedQuery.length < SEARCH_MIN_CHARS) return 0;

  const normalizedTitle = normalizeArabicText(item.title);
  const normalizedSlug = normalizeArabicText(item.slug.replace(/[-_]+/g, " "));
  const normalizedKeywords = item.keywords.map((keyword) => normalizeArabicText(keyword));

  if (normalizedTitle === normalizedQuery) return 100;
  if (normalizedSlug === normalizedQuery) return 95;
  if (normalizedKeywords.includes(normalizedQuery)) return 92;
  if (normalizedTitle.startsWith(normalizedQuery)) return 88;
  if (normalizedSlug.startsWith(normalizedQuery)) return 84;
  if (normalizedKeywords.some((keyword) => keyword.startsWith(normalizedQuery))) return 80;
  if (normalizedTitle.includes(normalizedQuery)) return 76;
  if (normalizedSlug.includes(normalizedQuery)) return 74;
  if (normalizedKeywords.some((keyword) => keyword.includes(normalizedQuery))) return 70;
  return 0;
}

export function VerbalPassagesBrowser({ mode = "student" }: { mode?: "student" | "admin" }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [passageRecords, setPassageRecords] = useState<VerbalPassageRecord[]>(fallbackPassages);
  const [currentPassageSlug, setCurrentPassageSlug] = useState<string | null>(null);
  const [isLoadingDirectory, setIsLoadingDirectory] = useState(false);
  const [hasInitializedSelection, setHasInitializedSelection] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const requestedSlug = searchParams.get("passage")?.trim().toLowerCase() ?? "";

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
      buildPublicApiUrl(`/api/verbal-passages?status=${mode === "admin" ? "all" : "published"}&limit=500`),
      {
        cache: "no-store",
        signal: controller.signal,
      },
    )
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("تعذر مزامنة بنك القطع من القاعدة.");
        }

        return response.json() as Promise<{ items?: VerbalPassageRecord[] }>;
      })
      .then((payload) => {
        const items = Array.isArray(payload.items) ? payload.items : [];
        setPassageRecords(mergePassageSources(items, fallbackPassages));
        setStatusMessage("");
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setPassageRecords(fallbackPassages);
        setStatusMessage("تعذر مزامنة القاعدة الآن، لذلك نعرض القطع المضافة داخل المشروع مباشرة.");
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingDirectory(false);
        }
      });

    return () => controller.abort();
  }, [mode]);

  const visiblePassages = useMemo(
    () => passageRecords.filter((passage) => mode === "admin" || passage.status === "published"),
    [mode, passageRecords],
  );

  const currentPassage = useMemo(
    () => visiblePassages.find((passage) => passage.slug === currentPassageSlug) ?? null,
    [currentPassageSlug, visiblePassages],
  );

  const currentPassageIndex = useMemo(
    () => visiblePassages.findIndex((passage) => passage.slug === currentPassageSlug),
    [currentPassageSlug, visiblePassages],
  );

  const nextPassage = currentPassageIndex >= 0 ? visiblePassages[currentPassageIndex + 1] ?? null : null;

  const searchCatalog = useMemo(() => {
    const items = verbalReadingKeywords.map((keyword) => {
      const linkedPassage = resolveKeywordPassage(keyword.title, visiblePassages);
      return {
        id: keyword.id,
        title: keyword.title,
        slug: linkedPassage?.slug ?? generatePassageSlug({ title: keyword.title }),
        availability: linkedPassage ? "available" : "unavailable",
        linkedPassageSlug: linkedPassage?.slug ?? null,
        keywords: [keyword.title, ...(keyword.aliases ?? []), linkedPassage?.title ?? "", ...(linkedPassage?.keywords ?? [])].filter(Boolean),
        excerpt: linkedPassage ? createExcerpt(linkedPassage.passageText) : "غير متاحة حاليًا داخل البنك.",
      } satisfies SearchCatalogItem;
    });

    const knownKeys = new Set(items.map((item) => `${normalizeArabicText(item.title)}::${item.slug}`));

    for (const passage of visiblePassages) {
      const key = `${normalizeArabicText(passage.title)}::${passage.slug}`;
      if (knownKeys.has(key)) continue;

      items.push({
        id: `available-${passage.id}`,
        title: passage.title,
        slug: passage.slug,
        availability: "available",
        linkedPassageSlug: passage.slug,
        keywords: [passage.title, passage.slug, ...(passage.keywords ?? [])],
        excerpt: createExcerpt(passage.passageText),
      });
    }

    return items;
  }, [visiblePassages]);

  const normalizedQueryLength = useMemo(
    () => normalizeArabicText(query).replace(/\s+/g, "").length,
    [query],
  );

  const canSearch = useMemo(
    () => normalizeArabicText(debouncedQuery).replace(/\s+/g, "").length >= SEARCH_MIN_CHARS,
    [debouncedQuery],
  );

  const searchResults = useMemo(() => {
    if (!canSearch) return [] as SearchCatalogItem[];

    return searchCatalog
      .map((item) => ({
        item,
        score: getSearchScore(item, debouncedQuery),
      }))
      .filter((entry) => entry.score > 0)
      .sort((left, right) => {
        if (right.score !== left.score) return right.score - left.score;
        if (left.item.availability !== right.item.availability) {
          return left.item.availability === "available" ? -1 : 1;
        }
        return left.item.title.localeCompare(right.item.title, "ar");
      })
      .map((entry) => entry.item)
      .slice(0, 10);
  }, [canSearch, debouncedQuery, searchCatalog]);

  const selectPassage = useCallback(
    (slug: string, options?: { clearSearch?: boolean; message?: string }) => {
      if (!slug) return;

      setCurrentPassageSlug(slug);
      setHasInitializedSelection(true);

      if (options?.clearSearch) {
        setQuery("");
        setDebouncedQuery("");
      }

      if (options?.message) {
        setStatusMessage(options.message);
      }

      const nextHref = buildPassageHref(pathname, new URLSearchParams(searchParams.toString()), slug);
      router.replace(nextHref, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const openRandomPassage = useCallback(
    (options?: { excludeCurrent?: boolean }) => {
      if (!visiblePassages.length) return;

      const candidates =
        options?.excludeCurrent && currentPassageSlug && visiblePassages.length > 1
          ? visiblePassages.filter((passage) => passage.slug !== currentPassageSlug)
          : visiblePassages;

      const randomPassage = candidates[Math.floor(Math.random() * candidates.length)];
      if (!randomPassage) return;

      selectPassage(randomPassage.slug, {
        clearSearch: true,
        message: `تم فتح قطعة عشوائية: ${randomPassage.title}`,
      });
    },
    [currentPassageSlug, selectPassage, visiblePassages],
  );

  useEffect(() => {
    if (!visiblePassages.length) return;

    if (requestedSlug) {
      const matchedPassage = visiblePassages.find((passage) => passage.slug === requestedSlug);

      if (matchedPassage) {
        if (currentPassageSlug !== matchedPassage.slug) {
          setCurrentPassageSlug(matchedPassage.slug);
        }
        setHasInitializedSelection(true);
        return;
      }

      const fallbackPassage =
        visiblePassages.find((passage) => passage.slug === currentPassageSlug) ??
        visiblePassages[Math.floor(Math.random() * visiblePassages.length)];

      if (fallbackPassage) {
        setCurrentPassageSlug(fallbackPassage.slug);
        setHasInitializedSelection(true);
        setStatusMessage("لم نجد القطعة المطلوبة بهذا المفتاح، فتم فتح قطعة متاحة بدلًا منها.");

        if (fallbackPassage.slug !== requestedSlug) {
          const nextHref = buildPassageHref(pathname, new URLSearchParams(searchParams.toString()), fallbackPassage.slug);
          router.replace(nextHref, { scroll: false });
        }
      }
      return;
    }

    if (!hasInitializedSelection) {
      const randomPassage = visiblePassages[Math.floor(Math.random() * visiblePassages.length)];
      if (randomPassage) {
        setCurrentPassageSlug(randomPassage.slug);
        setHasInitializedSelection(true);
        const nextHref = buildPassageHref(pathname, new URLSearchParams(searchParams.toString()), randomPassage.slug);
        router.replace(nextHref, { scroll: false });
      }
    }
  }, [
    currentPassageSlug,
    hasInitializedSelection,
    pathname,
    requestedSlug,
    router,
    searchParams,
    visiblePassages,
  ]);

  const resultCaption = useMemo(() => {
    if (isLoadingDirectory) return "جاري تجهيز الدليل...";
    if (normalizedQueryLength > 0 && normalizedQueryLength < SEARCH_MIN_CHARS) {
      return `اكتب ${SEARCH_MIN_CHARS} أحرف فأكثر ليظهر لك البحث.`;
    }
    if (canSearch) {
      return searchResults.length ? `${searchResults.length} نتيجة مطابقة` : "لا توجد نتائج مطابقة.";
    }
    return "";
  }, [canSearch, isLoadingDirectory, normalizedQueryLength, searchResults.length]);

  const showSearchPanel = useMemo(
    () => Boolean(query.trim()) || canSearch,
    [canSearch, query],
  );

  return (
    <div dir="rtl" className="space-y-6">
      <div className="rounded-[2rem] border border-[#E8D8B3] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,247,244,0.96))] p-7 shadow-soft">
        <div className="display-font text-3xl font-bold text-slate-950">بنك القطع اللفظي</div>
        <p className="mt-3 max-w-3xl text-sm leading-8 text-slate-600">
          ابحث عن القطعة بالعنوان أو بالاسم المفتاحي، أو ابدأ مباشرة بقطعة عشوائية. لا نعرض جميع القطع هنا حتى
          تبقى الصفحة خفيفة وواضحة مع زيادة عدد القطع لاحقًا.
        </p>

        <div className="mt-5 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div className="relative">
            <Search className="pointer-events-none absolute right-4 top-7 z-10 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ابحث عن القطعة"
              className="h-14 rounded-[1.7rem] border-[#E8D8B3] pr-12 text-base shadow-[0_10px_24px_rgba(18,59,122,0.05)]"
            />

            {showSearchPanel ? (
              <div className="absolute inset-x-0 top-full z-20 mt-2 rounded-[1.5rem] border border-slate-200 bg-white p-3 shadow-[0_20px_40px_rgba(15,23,42,0.12)]">
                {resultCaption ? (
                  <div className="px-2 pb-2 text-sm leading-7 text-slate-500">{resultCaption}</div>
                ) : null}

                {canSearch ? (
                  searchResults.length ? (
                    <div className="max-h-[360px] space-y-2 overflow-y-auto pl-1">
                      {searchResults.map((item) => (
                        <div
                          key={item.id}
                          className="flex flex-wrap items-center justify-between gap-3 rounded-[1.2rem] border border-slate-200 bg-slate-50/60 px-4 py-3"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="display-font truncate text-base font-bold text-slate-950">{item.title}</div>
                            <div className="mt-1 text-xs font-semibold text-[#123B7A]">/{item.slug}</div>
                          </div>

                          <div className="flex items-center gap-2">
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                item.availability === "available"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : "bg-slate-100 text-slate-600"
                              }`}
                            >
                              {item.availability === "available" ? "متاحة" : "غير متاحة"}
                            </span>

                            {item.availability === "available" && item.linkedPassageSlug ? (
                              <button
                                type="button"
                                onClick={() =>
                                  selectPassage(item.linkedPassageSlug as string, {
                                    clearSearch: true,
                                    message: `تم فتح قطعة: ${item.title}`,
                                  })
                                }
                                className="inline-flex items-center gap-2 rounded-2xl border border-[#123B7A]/15 bg-white px-4 py-2 text-sm font-semibold text-[#123B7A] transition hover:border-[#123B7A] hover:bg-[#123B7A]/5"
                              >
                                فتح
                                <ArrowUpLeft className="h-4 w-4" />
                              </button>
                            ) : null}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-[1.2rem] border border-dashed border-slate-300 bg-slate-50/80 px-4 py-4 text-sm leading-7 text-slate-500">
                      لا توجد نتائج مطابقة لعبارة البحث الحالية.
                    </div>
                  )
                ) : normalizedQueryLength > 0 ? (
                  <div className="rounded-[1.2rem] border border-dashed border-slate-300 bg-slate-50/80 px-4 py-4 text-sm leading-7 text-slate-500">
                    اكتب {SEARCH_MIN_CHARS} أحرف فأكثر لبدء البحث.
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <Button
            type="button"
            onClick={() => openRandomPassage({ excludeCurrent: true })}
            disabled={isLoadingDirectory || !visiblePassages.length}
            className="h-14 rounded-[1.7rem] bg-[linear-gradient(135deg,#F5D08A_0%,#E6B85C_40%,#D4A94C_100%)] px-7 text-base font-bold text-slate-950 shadow-[0_12px_30px_rgba(201,154,67,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(201,154,67,0.34)] disabled:translate-y-0 disabled:opacity-60"
          >
            <Dice5 className="ml-2 h-5 w-5" />
            {currentPassage ? "ابدأ قطعة عشوائية أخرى" : "ابدأ قطعة عشوائية"}
          </Button>
        </div>

        <div className="mt-3 text-sm leading-7 text-slate-500">
          {statusMessage || "النتائج لا تظهر إلا بعد البحث، أما فتح القطعة العشوائية فيبقى متاحًا دائمًا."}
        </div>
      </div>

      <section className="min-w-0">
        {currentPassage ? (
          <VerbalPassageViewer
            passage={currentPassage}
            mode={mode}
            nextPassageTitle={nextPassage?.title ?? null}
            onOpenNextPassage={nextPassage ? () => selectPassage(nextPassage.slug, { message: `تم فتح قطعة: ${nextPassage.title}` }) : null}
          />
        ) : (
          <div className="rounded-[1.8rem] border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
            يتم هنا عرض القطعة الحالية فقط. إذا فتحت الصفحة بمفتاح صحيح فستظهر مباشرة، وإذا دخلت بدون مفتاح
            فسيتم بدء قطعة عشوائية واحدة.
          </div>
        )}
      </section>
    </div>
  );
}
