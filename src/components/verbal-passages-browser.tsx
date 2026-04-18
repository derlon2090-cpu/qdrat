"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowUpLeft, Dice5, Search } from "lucide-react";

import samplePassagesData from "../../data/verbal-passages.sample.json";
import { VerbalPassageViewer } from "@/components/verbal-passage-viewer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { buildPublicApiUrl } from "@/lib/api-base";
import { normalizeArabicText, searchPassagesLocal } from "@/lib/verbal-passages-core";
import type {
  VerbalPassageQuestionRecord,
  VerbalPassageRecord,
  VerbalPassageSummary,
} from "@/lib/verbal-passages";

const SEARCH_MIN_CHARS = 3;
const SEARCH_DEBOUNCE_MS = 400;

type PassageDirectoryItem = Pick<
  VerbalPassageSummary,
  "id" | "slug" | "title" | "status" | "version" | "externalSourceId" | "excerpt"
>;

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

function createExcerpt(text: string, maxLength = 160) {
  const cleanText = text.replace(/\s+/g, " ").trim();
  if (cleanText.length <= maxLength) return cleanText;
  return `${cleanText.slice(0, maxLength).trim()}...`;
}

function buildPassageHref(pathname: string, searchParams: URLSearchParams, slug: string) {
  const nextParams = new URLSearchParams(searchParams.toString());
  nextParams.set("passage", slug);
  return `${pathname}?${nextParams.toString()}`;
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

const fallbackPassages = (samplePassagesData as SamplePassageRow[]).map(mapSamplePassage);

function mergePassageSources(primary: VerbalPassageRecord[], fallback: VerbalPassageRecord[]) {
  const unique = new Map<string, VerbalPassageRecord>();

  for (const passage of [...primary, ...fallback]) {
    const key = passage.slug.trim().toLowerCase();
    if (!unique.has(key)) {
      unique.set(key, passage);
    }
  }

  return Array.from(unique.values()).sort((left, right) => left.title.localeCompare(right.title, "ar"));
}

function mapDirectoryItem(passage: VerbalPassageRecord): PassageDirectoryItem {
  return {
    id: passage.id,
    slug: passage.slug,
    title: passage.title,
    status: passage.status,
    version: passage.version,
    externalSourceId: passage.externalSourceId,
    excerpt: createExcerpt(passage.passageText),
  };
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

  const availablePassages = useMemo(
    () => visiblePassages.map((passage) => mapDirectoryItem(passage)),
    [visiblePassages],
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

  const normalizedQueryLength = useMemo(
    () => normalizeArabicText(query).replace(/\s+/g, "").length,
    [query],
  );

  const canSearch = useMemo(
    () => normalizeArabicText(debouncedQuery).replace(/\s+/g, "").length >= SEARCH_MIN_CHARS,
    [debouncedQuery],
  );

  const searchMatches = useMemo(() => {
    if (!canSearch) return [] as PassageDirectoryItem[];

    const matchedSlugs = searchPassagesLocal(visiblePassages, debouncedQuery, SEARCH_MIN_CHARS).map(
      (passage) => passage.slug?.trim().toLowerCase() ?? "",
    );

    return matchedSlugs
      .map((slug) => visiblePassages.find((passage) => passage.slug === slug))
      .filter((passage): passage is VerbalPassageRecord => Boolean(passage))
      .map((passage) => mapDirectoryItem(passage));
  }, [canSearch, debouncedQuery, visiblePassages]);

  const sidebarItems = canSearch ? searchMatches : availablePassages;

  const selectPassage = useCallback(
    (slug: string) => {
      if (!slug) return;

      setCurrentPassageSlug(slug);
      setHasInitializedSelection(true);

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

      selectPassage(randomPassage.slug);
      setStatusMessage(`تم فتح قطعة عشوائية: ${randomPassage.title}`);
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
    if (isLoadingDirectory) return "جاري تحميل القطع...";
    if (!canSearch && normalizedQueryLength > 0 && normalizedQueryLength < SEARCH_MIN_CHARS) {
      return `يبدأ البحث بعد ${SEARCH_MIN_CHARS} أحرف، ويمكنك الآن استخدام القائمة الجانبية دون تغيير القطعة الحالية.`;
    }
    if (canSearch) {
      return searchMatches.length ? `${searchMatches.length} نتيجة مطابقة` : "لا توجد نتائج مطابقة الآن.";
    }
    return `${availablePassages.length} قطعة متاحة`;
  }, [availablePassages.length, canSearch, isLoadingDirectory, normalizedQueryLength, searchMatches.length]);

  const emptyStateMessage = useMemo(() => {
    if (!availablePassages.length) {
      return "لا توجد قطع لفظية متاحة الآن.";
    }

    if (canSearch) {
      return "لم نعثر على قطعة مطابقة لعبارة البحث الحالية. جرّب عنوانًا آخر أو استخدم الزر الذهبي لفتح قطعة عشوائية.";
    }

    if (normalizedQueryLength > 0 && normalizedQueryLength < SEARCH_MIN_CHARS) {
      return `اكتب ${SEARCH_MIN_CHARS} أحرف فأكثر لبدء البحث، أو اختر من القائمة الجانبية مباشرة.`;
    }

    return "القائمة الجانبية تعرض عناوين القطع فقط، أما عرض القطعة الحالية فيبقى مستقلًا في المساحة الرئيسية.";
  }, [availablePassages.length, canSearch, normalizedQueryLength]);

  return (
    <div dir="rtl" className="space-y-6">
      <div className="rounded-[2rem] border border-[#E8D8B3] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,247,244,0.96))] p-7 shadow-soft">
        <div className="display-font text-3xl font-bold text-slate-950">بنك القطع اللفظي</div>
        <p className="mt-3 max-w-3xl text-sm leading-8 text-slate-600">
          افتح القطعة مباشرة بالمفتاح الموجود في الرابط، أو ابدأ بقطعة عشوائية واحدة ثابتة، أو استخدم البحث
          للوصول إلى قطعة أخرى بدون أن تتغير القطعة الحالية تلقائيًا أثناء الكتابة.
        </p>

        <div className="mt-5 grid gap-3 xl:grid-cols-[minmax(0,1fr)_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="ابحث عن القطعة بالعنوان أو الـ slug أو الكلمات المفتاحية"
              className="h-14 rounded-[1.7rem] border-[#E8D8B3] pr-12 text-base shadow-[0_10px_24px_rgba(18,59,122,0.05)]"
            />
          </div>

          <Button
            type="button"
            onClick={() => openRandomPassage({ excludeCurrent: true })}
            disabled={isLoadingDirectory || !availablePassages.length}
            className="h-14 rounded-[1.7rem] bg-[linear-gradient(135deg,#F5D08A_0%,#E6B85C_40%,#D4A94C_100%)] px-7 text-base font-bold text-slate-950 shadow-[0_12px_30px_rgba(201,154,67,0.28)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_34px_rgba(201,154,67,0.34)] disabled:translate-y-0 disabled:opacity-60"
          >
            <Dice5 className="ml-2 h-5 w-5" />
            {currentPassage ? "ابدأ قطعة عشوائية أخرى" : "ابدأ قطعة عشوائية"}
          </Button>
        </div>

        <div className="mt-3 text-sm leading-7 text-slate-500">
          {statusMessage ||
            "البحث هنا أداة وصول فقط؛ لن يغيّر القطعة الحالية إلا عند الضغط على نتيجة أو عند اختيار الزر العشوائي."}
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)] xl:items-start">
        <aside className="order-2 rounded-[1.8rem] border border-slate-200 bg-white p-5 shadow-sm xl:order-1 xl:sticky xl:top-24">
          <div className="display-font text-xl font-bold text-slate-950">
            {canSearch ? "نتائج البحث" : "قائمة القطع"}
          </div>
          <div className="mt-2 text-sm leading-7 text-slate-500">{resultCaption}</div>

          <div className="mt-5 max-h-[70vh] space-y-3 overflow-y-auto pl-1">
            {sidebarItems.map((item) => (
              <article
                key={item.id}
                className={`rounded-[1.35rem] border p-4 transition ${
                  currentPassageSlug === item.slug
                    ? "border-[#123B7A] bg-[#123B7A]/5"
                    : "border-slate-200 bg-slate-50/70"
                }`}
              >
                <div className="display-font text-base font-bold text-slate-950">{item.title}</div>
                <div className="mt-1 text-xs font-semibold text-[#123B7A]">/{item.slug}</div>
                <div className="mt-2 line-clamp-3 text-sm leading-7 text-slate-500">{item.excerpt}</div>

                <div className="mt-4 flex items-center justify-between gap-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      item.status === "published" ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
                    }`}
                  >
                    {item.status === "published" ? "منشورة" : "مسودة"}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      selectPassage(item.slug);
                      setStatusMessage(`تم فتح قطعة: ${item.title}`);
                    }}
                    className="inline-flex items-center gap-2 rounded-2xl border border-[#123B7A]/15 bg-white px-4 py-2 text-sm font-semibold text-[#123B7A] transition hover:border-[#123B7A] hover:bg-[#123B7A]/5"
                  >
                    فتح
                    <ArrowUpLeft className="h-4 w-4" />
                  </button>
                </div>
              </article>
            ))}

            {!sidebarItems.length ? (
              <div className="rounded-[1.35rem] border border-dashed border-slate-300 bg-slate-50/80 p-5 text-sm leading-7 text-slate-500">
                {emptyStateMessage}
              </div>
            ) : null}
          </div>
        </aside>

        <section className="order-1 min-w-0 xl:order-2">
          {currentPassage ? (
            <VerbalPassageViewer
              passage={currentPassage}
              mode={mode}
              nextPassageTitle={nextPassage?.title ?? null}
              onOpenNextPassage={nextPassage ? () => selectPassage(nextPassage.slug) : null}
            />
          ) : (
            <div className="rounded-[1.8rem] border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 shadow-sm">
              يتم هنا عرض القطعة الحالية فقط. إذا فتحت الصفحة بمفتاح صحيح فستظهر مباشرة، وإذا دخلت بدون مفتاح
              فسيتم بدء قطعة عشوائية واحدة، ويمكنك تغييرها يدويًا من القائمة الجانبية.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
