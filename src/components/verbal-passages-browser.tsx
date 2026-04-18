"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Dice5, Search } from "lucide-react";

import samplePassagesData from "../../data/verbal-passages.sample.json";
import { buildPublicApiUrl } from "@/lib/api-base";
import { searchPassagesLocal, normalizeArabicText } from "@/lib/verbal-passages-core";
import type {
  VerbalPassageQuestionRecord,
  VerbalPassageRecord,
  VerbalPassageSummary,
} from "@/lib/verbal-passages";
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

type SampleQuestionRow = {
  question_text: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: "A" | "B" | "C" | "D";
  explanation?: string | null;
};

type SamplePassageRow = {
  title: string;
  slug: string;
  keywords?: string[];
  passage_text: string;
  status?: string;
  version?: number;
  external_source_id?: string | null;
  questions?: SampleQuestionRow[];
};

function createExcerpt(text: string, maxLength = 220) {
  const cleanText = text.replace(/\s+/g, " ").trim();
  if (cleanText.length <= maxLength) return cleanText;
  return `${cleanText.slice(0, maxLength).trim()}...`;
}

function mapSampleQuestion(
  question: SampleQuestionRow,
  index: number,
  slug: string,
): VerbalPassageQuestionRecord {
  return {
    id: `sample-${slug}-question-${index + 1}`,
    questionOrder: index + 1,
    questionText: question.question_text,
    optionA: question.option_a,
    optionB: question.option_b,
    optionC: question.option_c,
    optionD: question.option_d,
    correctOption: question.correct_option,
    explanation: question.explanation ?? null,
  };
}

function mapSamplePassage(row: SamplePassageRow, index: number): VerbalPassageRecord {
  return {
    id: `sample-passage-${index + 1}-${row.slug}`,
    slug: row.slug,
    title: row.title,
    keywords: row.keywords ?? [],
    passageText: row.passage_text,
    status: row.status === "draft" ? "draft" : "published",
    version: typeof row.version === "number" && row.version > 0 ? row.version : 1,
    externalSourceId: row.external_source_id ?? `sample-json-${row.slug}`,
    createdAt: "",
    updatedAt: "",
    questions: (row.questions ?? []).map((question, questionIndex) =>
      mapSampleQuestion(question, questionIndex, row.slug),
    ),
  };
}

const fallbackPassageRecords = (samplePassagesData as SamplePassageRow[]).map(mapSamplePassage);

function mergePassageSources(primary: VerbalPassageRecord[], fallback: VerbalPassageRecord[]) {
  const unique = new Map<string, VerbalPassageRecord>();

  for (const passage of [...primary, ...fallback]) {
    const key =
      passage.slug.trim().toLowerCase() ||
      normalizeArabicText([passage.title, ...(passage.keywords ?? [])].join(" "));

    if (!unique.has(key)) {
      unique.set(key, passage);
    }
  }

  return Array.from(unique.values()).sort((left, right) => left.title.localeCompare(right.title, "ar"));
}

function mapDirectoryItem(item: ListedPassageItem): PassageDirectoryItem {
  return {
    id: item.id,
    slug: item.slug,
    title: item.title,
    status: item.status,
    version: item.version,
    externalSourceId: item.externalSourceId,
    excerpt: createExcerpt(item.passageText),
  };
}

function clearPassageParam(pathname: string, searchParams: URLSearchParams) {
  const nextParams = new URLSearchParams(searchParams.toString());
  nextParams.delete("passage");
  return nextParams.toString() ? `${pathname}?${nextParams.toString()}` : pathname;
}

export function VerbalPassagesBrowser({ mode = "student" }: { mode?: "student" | "admin" }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [passageRecords, setPassageRecords] = useState<VerbalPassageRecord[]>(fallbackPassageRecords);
  const [selectedPassageId, setSelectedPassageId] = useState<string | null>(null);
  const [isLoadingDirectory, setIsLoadingDirectory] = useState(false);
  const [syncMessage, setSyncMessage] = useState("");
  const [hasAutoOpenedRandom, setHasAutoOpenedRandom] = useState(false);

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
        setPassageRecords(mergePassageSources(items, fallbackPassageRecords));
        setSyncMessage("");
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setPassageRecords(fallbackPassageRecords);
        setSyncMessage("تعذر مزامنة القاعدة الآن، لذا نعرض القطع المضافة داخل المشروع مباشرة.");
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

  const availablePassages = useMemo(
    () => visiblePassages.map((item) => mapDirectoryItem(item)),
    [visiblePassages],
  );

  const normalizedQueryLength = useMemo(
    () => normalizeArabicText(query).replace(/\s+/g, "").length,
    [query],
  );

  const searchMatches = useMemo(() => {
    if (normalizeArabicText(debouncedQuery).replace(/\s+/g, "").length < SEARCH_MIN_CHARS) {
      return [] as PassageDirectoryItem[];
    }

    const matchedIds = searchPassagesLocal(visiblePassages, debouncedQuery, SEARCH_MIN_CHARS).map(
      (item) => item.id,
    );

    return matchedIds
      .map((id) => visiblePassages.find((passage) => passage.id === id))
      .filter((item): item is VerbalPassageRecord => Boolean(item))
      .map((item) => mapDirectoryItem(item));
  }, [debouncedQuery, visiblePassages]);

  const showSearchMatches = useMemo(
    () => normalizeArabicText(debouncedQuery).replace(/\s+/g, "").length >= SEARCH_MIN_CHARS,
    [debouncedQuery],
  );

  const sidebarItems = showSearchMatches ? searchMatches : availablePassages;
  const selectedPassage = visiblePassages.find((item) => item.id === selectedPassageId) ?? null;
  const selectedPassageIndex = visiblePassages.findIndex((item) => item.id === selectedPassageId);
  const nextPassage = selectedPassageIndex >= 0 ? visiblePassages[selectedPassageIndex + 1] ?? null : null;
  const isWaitingForDebounce = query !== debouncedQuery;

  const openRandomPassage = useCallback(
    (options?: { excludeCurrent?: boolean; clearSearch?: boolean }) => {
      if (!visiblePassages.length) return;

      const candidates =
        options?.excludeCurrent && visiblePassages.length > 1 && selectedPassageId
          ? visiblePassages.filter((item) => item.id !== selectedPassageId)
          : visiblePassages;

      const randomPassage = candidates[Math.floor(Math.random() * candidates.length)];
      if (!randomPassage) return;

      if (options?.clearSearch) {
        setQuery("");
        setDebouncedQuery("");
      }

      setSelectedPassageId(randomPassage.id);
      setHasAutoOpenedRandom(true);
    },
    [selectedPassageId, visiblePassages],
  );

  useEffect(() => {
    if (!visiblePassages.length) return;

    if (requestedSlug) {
      const matchedPassage = visiblePassages.find((item) => item.slug === requestedSlug);

      if (matchedPassage) {
        if (matchedPassage.id !== selectedPassageId) {
          setSelectedPassageId(matchedPassage.id);
          setHasAutoOpenedRandom(true);
        }
        return;
      }

      if (!selectedPassageId) {
        openRandomPassage();
        setSyncMessage("لم نجد القطعة المطلوبة بهذا المفتاح، فتم فتح قطعة عشوائية بدلًا منها.");
      }
      return;
    }

    if (!selectedPassageId && !hasAutoOpenedRandom) {
      openRandomPassage();
    }
  }, [
    hasAutoOpenedRandom,
    openRandomPassage,
    requestedSlug,
    selectedPassageId,
    visiblePassages,
  ]);

  useEffect(() => {
    if (!selectedPassage?.slug) return;
    if (requestedSlug === selectedPassage.slug) return;

    const nextParams = new URLSearchParams(searchParams.toString());
    nextParams.set("passage", selectedPassage.slug);
    router.replace(`${pathname}?${nextParams.toString()}`, { scroll: false });
  }, [pathname, requestedSlug, router, searchParams, selectedPassage?.slug]);

  const resultCaption = useMemo(() => {
    if (isLoadingDirectory) return "جاري تحميل القطع...";
    if (isWaitingForDebounce && normalizedQueryLength >= SEARCH_MIN_CHARS) return "جاري تجهيز نتائج البحث...";
    if (!showSearchMatches && normalizedQueryLength > 0 && normalizedQueryLength < SEARCH_MIN_CHARS) {
      return `يبدأ البحث بعد ${SEARCH_MIN_CHARS} أحرف، ويمكنك الآن الاختيار من العناوين الجاهزة.`;
    }
    if (showSearchMatches) {
      return searchMatches.length ? `${searchMatches.length} نتيجة` : "لا توجد نتائج مطابقة حاليًا.";
    }
    return `${availablePassages.length} عنوانًا متاحًا`;
  }, [
    availablePassages.length,
    isLoadingDirectory,
    isWaitingForDebounce,
    normalizedQueryLength,
    searchMatches.length,
    showSearchMatches,
  ]);

  const emptyStateMessage = useMemo(() => {
    if (!availablePassages.length) {
      return "لا توجد قطع لفظية متاحة الآن.";
    }

    if (showSearchMatches) {
      return "لا توجد قطع مطابقة لهذه الكلمة المفتاحية الآن. جرّب عنوانًا آخر أو ابدأ بقطعة عشوائية.";
    }

    if (normalizedQueryLength > 0 && normalizedQueryLength < SEARCH_MIN_CHARS) {
      return `اكتب ${SEARCH_MIN_CHARS} أحرف فأكثر لبدء البحث، أو اختر مباشرة من قائمة العناوين المتاحة.`;
    }

    return "اختر قطعة من القائمة لتظهر هنا مع النص والأسئلة، أو ابدأ مباشرة بقطعة عشوائية.";
  }, [availablePassages.length, normalizedQueryLength, showSearchMatches]);

  return (
    <div dir="rtl" className="space-y-6">
      <div className="rounded-[2rem] border border-[#E8D8B3] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,247,244,0.96))] p-7 shadow-soft">
        <div className="display-font text-3xl font-bold text-slate-950">بنك القطع اللفظي</div>
        <p className="mt-3 max-w-3xl text-sm leading-8 text-slate-600">
          كل قطعة مرتبطة بعنوان مفتاحي ثابت، ويمكن فتحها مباشرة من الرابط أو بدء قطعة عشوائية عند الدخول إلى
          القسم. ويبدأ البحث بعد كتابة 3 أحرف فأكثر حتى تبقى النتائج أدق وأسرع.
        </p>

        <div className="mt-5 grid gap-3 lg:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ابحث عن القطعة"
              className="h-14 rounded-[1.7rem] border-[#E8D8B3] pr-12 text-base shadow-[0_10px_24px_rgba(18,59,122,0.05)]"
            />
          </div>

          <Button
            type="button"
            onClick={() => openRandomPassage({ excludeCurrent: true, clearSearch: true })}
            disabled={isLoadingDirectory || !availablePassages.length}
            className="h-14 rounded-[1.7rem] bg-[linear-gradient(135deg,#F5D08A_0%,#E6B85C_40%,#D4A94C_100%)] px-7 text-base font-bold text-slate-950 shadow-[0_12px_30px_rgba(201,154,67,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(201,154,67,0.34)] disabled:translate-y-0 disabled:opacity-60"
          >
            <Dice5 className="ml-2 h-5 w-5" />
            {selectedPassageId ? "ابدأ قطعة عشوائية أخرى" : "ابدأ قطعة عشوائية"}
          </Button>
        </div>

        <div className="mt-3 text-sm leading-7 text-slate-500">
          {syncMessage || "إذا ما تبي تختار يدويًا، اضغط الزر الذهبي وابدأ مباشرة بقطعة عشوائية من بنك القطع اللفظي."}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <aside className="rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="display-font text-xl font-bold text-slate-950">
            {showSearchMatches ? "نتائج البحث" : "العناوين المتاحة"}
          </div>
          <div className="mt-2 text-sm leading-7 text-slate-500">{resultCaption}</div>

          <div className="mt-5 space-y-3">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedPassageId(item.id);
                  setHasAutoOpenedRandom(true);
                }}
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

            {!sidebarItems.length ? (
              <div className="rounded-[1.35rem] border border-dashed border-slate-300 bg-slate-50/80 p-5 text-sm leading-7 text-slate-500">
                {emptyStateMessage}
              </div>
            ) : null}
          </div>
        </aside>

        <section>
          {selectedPassage ? (
            <VerbalPassageViewer
              passage={selectedPassage}
              mode={mode}
              nextPassageTitle={nextPassage?.title ?? null}
              onOpenNextPassage={nextPassage ? () => setSelectedPassageId(nextPassage.id) : null}
              onBackToResults={() => {
                router.replace(clearPassageParam(pathname, new URLSearchParams(searchParams.toString())), {
                  scroll: false,
                });
                setSelectedPassageId(null);
              }}
            />
          ) : (
            <div className="rounded-[1.8rem] border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
              اختر قطعة من القائمة لتظهر هنا مع النص والأسئلة والخيارات، أو ابدأ الآن بقطعة عشوائية من الزر
              الذهبي.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
