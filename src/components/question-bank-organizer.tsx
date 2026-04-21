"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  BookOpenText,
  Calculator,
  Search,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";

import samplePassagesData from "../../data/verbal-passages.sample.json";
import { QuestionBankMistakesPanel } from "@/components/question-bank-mistakes-panel";
import { Input } from "@/components/ui/input";
import {
  EMPTY_SECTION_MESSAGE,
  verbalReadingKeywords,
} from "@/data/manual-question-bank";
import {
  quantitativeSections,
  verbalSections,
} from "@/data/question-bank-sections";
import { useAuthSession } from "@/hooks/use-auth-session";
import { buildPublicApiUrl } from "@/lib/api-base";
import { generatePassageSlug } from "@/lib/verbal-passages-core";
import type {
  VerbalPassageQuestionRecord,
  VerbalPassageRecord,
} from "@/lib/verbal-passages";

type TrackId = "verbal" | "quant" | "mistakes";

const MIN_VERBAL_SEARCH_CHARS = 3;
const VERBAL_SEARCH_DEBOUNCE_MS = 350;

type KeywordDirectoryItem = {
  id: string;
  title: string;
  slug: string;
  href: string | null;
  status: "linked" | "pending";
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
  external_source_id?: string | null;
  questions?: SampleQuestionRow[];
};

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

function resolveKeywordPassage(
  keyword: (typeof verbalReadingKeywords)[number],
  passages: VerbalPassageRecord[],
) {
  const keywordTerms = [keyword.title, ...(keyword.aliases ?? [])]
    .map(normalizeArabic)
    .filter(Boolean);

  const rankedMatches = passages
    .map((passage) => {
      const passageTerms = [
        passage.title,
        passage.slug.replace(/-/g, " "),
        ...(passage.keywords ?? []),
      ]
        .map(normalizeArabic)
        .filter(Boolean);

      let score = 0;

      for (const keywordTerm of keywordTerms) {
        if (!keywordTerm) continue;

        if (passageTerms.some((term) => term === keywordTerm)) {
          score = Math.max(score, 120);
          continue;
        }

        if (
          passageTerms.some(
            (term) =>
              term.includes(keywordTerm) || keywordTerm.includes(term),
          )
        ) {
          score = Math.max(score, 95);
          continue;
        }

        if (
          fuzzyMatch(
            [passage.title, ...passage.keywords].join(" "),
            keyword.title,
          )
        ) {
          score = Math.max(score, 70);
        }
      }

      return { passage, score };
    })
    .filter((item) => item.score > 0)
    .sort((left, right) => right.score - left.score);

  return rankedMatches[0]?.passage ?? null;
}

function mapKeywordToDirectoryItem(
  keyword: (typeof verbalReadingKeywords)[number],
  passages: VerbalPassageRecord[],
): KeywordDirectoryItem {
  const linkedPassage = resolveKeywordPassage(keyword, passages);

  return {
    id: keyword.id,
    title: keyword.title,
    slug: linkedPassage?.slug ?? generatePassageSlug({ title: keyword.title }),
    href: linkedPassage
      ? `/verbal/reading?passage=${encodeURIComponent(linkedPassage.slug)}`
      : null,
    status: linkedPassage ? "linked" : "pending",
  };
}

function mapSampleQuestion(
  question: SampleQuestionRow,
  index: number,
): VerbalPassageQuestionRecord {
  return {
    id: `sample-question-${index + 1}-${question.correct_option}`,
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

function mapSamplePassage(
  row: SamplePassageRow,
  index: number,
): VerbalPassageRecord {
  return {
    id: `sample-passage-${index + 1}-${row.slug}`,
    slug: row.slug,
    title: row.title,
    keywords: row.keywords ?? [],
    passageText: row.passage_text,
    status: row.status === "draft" ? "draft" : "published",
    version: 1,
    externalSourceId: row.external_source_id ?? `sample-json-${row.slug}`,
    createdAt: "",
    updatedAt: "",
    questions: (row.questions ?? []).map(mapSampleQuestion),
  };
}

const fallbackVerbalPassages = (samplePassagesData as SamplePassageRow[]).map(
  mapSamplePassage,
);

function mergePassageSources(
  primary: VerbalPassageRecord[],
  fallback: VerbalPassageRecord[],
) {
  const unique = new Map<string, VerbalPassageRecord>();

  for (const passage of [...primary, ...fallback]) {
    const key = normalizeArabic(
      [passage.slug, passage.title, ...(passage.keywords ?? [])].join(" "),
    );
    if (!unique.has(key)) {
      unique.set(key, passage);
    }
  }

  return Array.from(unique.values());
}

function getPassageDirectorySearchText(passage: VerbalPassageRecord) {
  return [
    passage.title,
    passage.slug,
    passage.passageText,
    ...(passage.keywords ?? []),
    ...passage.questions.map((question) => question.questionText),
  ].join(" ");
}

function EmptySectionCard({
  title,
  description,
  active,
  onClick,
  icon: Icon,
}: {
  title: string;
  description: string;
  active: boolean;
  onClick: () => void;
  icon: LucideIcon;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[1.9rem] border p-6 text-right transition-all ${
        active
          ? "border-transparent bg-[linear-gradient(135deg,#102955,#123B7A_55%,#2f5fa7)] text-white shadow-[0_24px_50px_rgba(18,59,122,0.22)]"
          : "border-slate-200/80 bg-white/88 text-slate-900 shadow-sm hover:-translate-y-0.5 hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="display-font text-2xl font-bold">{title}</div>
          <div
            className={`mt-3 text-sm leading-7 ${
              active ? "text-white/80" : "text-slate-500"
            }`}
          >
            {description}
          </div>
        </div>
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-[1.3rem] ${
            active ? "bg-white/10" : "bg-[#fff7ed]"
          }`}
        >
          <Icon
            className={`h-7 w-7 ${active ? "text-white" : "text-[#C99A43]"}`}
          />
        </div>
      </div>
    </button>
  );
}

export function QuestionBankOrganizer() {
  const searchParams = useSearchParams();
  const { status: authStatus, user } = useAuthSession();
  const [track, setTrack] = useState<TrackId>(
    searchParams.get("track") === "quant"
      ? "quant"
      : searchParams.get("track") === "mistakes"
        ? "mistakes"
        : "verbal",
  );
  const [keywordQuery, setKeywordQuery] = useState(
    searchParams.get("keyword") ?? "",
  );
  const [debouncedKeywordQuery, setDebouncedKeywordQuery] = useState(
    searchParams.get("keyword") ?? "",
  );
  const [verbalPassages, setVerbalPassages] = useState<VerbalPassageRecord[]>(
    fallbackVerbalPassages,
  );
  const [isLoadingVerbalPassages, setIsLoadingVerbalPassages] = useState(false);

  useEffect(() => {
    setTrack(
      searchParams.get("track") === "quant"
        ? "quant"
        : searchParams.get("track") === "mistakes"
          ? "mistakes"
          : "verbal",
    );
    setKeywordQuery(searchParams.get("keyword") ?? "");
    setDebouncedKeywordQuery(searchParams.get("keyword") ?? "");
  }, [searchParams]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedKeywordQuery(keywordQuery);
    }, VERBAL_SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [keywordQuery]);

  useEffect(() => {
    if (track !== "verbal") return;

    const controller = new AbortController();
    setIsLoadingVerbalPassages(true);

    fetch(buildPublicApiUrl("/api/verbal-passages?status=published&limit=500"), {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("تعذر تحميل نصوص الاستيعاب المقروء المضافة.");
        }

        return response.json() as Promise<{ items?: VerbalPassageRecord[] }>;
      })
      .then((payload) => {
        const items = Array.isArray(payload.items) ? payload.items : [];
        setVerbalPassages(mergePassageSources(items, fallbackVerbalPassages));
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setVerbalPassages(fallbackVerbalPassages);
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingVerbalPassages(false);
        }
      });

    return () => controller.abort();
  }, [track]);

  const currentSections = useMemo(
    () =>
      track === "verbal"
        ? verbalSections
        : track === "quant"
          ? quantitativeSections
          : [],
    [track],
  );
  const activityPath = useMemo(() => {
    if (track === "mistakes") {
      return "/question-bank?track=mistakes";
    }

    if (track === "quant") {
      return "/question-bank?track=quant";
    }

    return debouncedKeywordQuery
      ? `/question-bank?track=verbal&keyword=${encodeURIComponent(debouncedKeywordQuery)}`
      : "/question-bank?track=verbal";
  }, [debouncedKeywordQuery, track]);
  const activityMeta = useMemo(() => {
    if (track === "mistakes") {
      return {
        label: "متابعة قسم الأخطاء",
        bankLabel: "الأخطاء",
        bankHref: "/question-bank?track=mistakes",
      };
    }

    if (track === "quant") {
      return {
        label: "فتح بنك الكمي",
        bankLabel: "بنك الأسئلة - الكمي",
        bankHref: "/question-bank?track=quant",
      };
    }

    return {
      label: "فتح بنك اللفظي",
      bankLabel: "بنك الأسئلة - اللفظي",
      bankHref: debouncedKeywordQuery
        ? `/question-bank?track=verbal&keyword=${encodeURIComponent(debouncedKeywordQuery)}`
        : "/question-bank?track=verbal",
    };
  }, [debouncedKeywordQuery, track]);

  const showMistakesCard = true;
  const normalizedKeywordLength = useMemo(
    () => normalizeArabic(keywordQuery).replace(/\s+/g, "").length,
    [keywordQuery],
  );
  const canSearchVerbalKeywords =
    normalizedKeywordLength >= MIN_VERBAL_SEARCH_CHARS;
  const isDebouncingKeywordQuery = keywordQuery !== debouncedKeywordQuery;

  useEffect(() => {
    if (authStatus !== "authenticated" || !user) {
      return;
    }

    const timerId = window.setTimeout(() => {
      void fetch("/api/student/activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          label: activityMeta.label,
          path: activityPath,
          bankLabel: activityMeta.bankLabel,
          bankHref: activityMeta.bankHref,
        }),
      }).catch(() => undefined);
    }, 300);

    return () => window.clearTimeout(timerId);
  }, [activityMeta, activityPath, authStatus, user]);

  const verbalKeywordResults = useMemo(
    () => {
      if (!debouncedKeywordQuery.trim()) {
        return [] as KeywordDirectoryItem[];
      }

      const keywordItems = verbalReadingKeywords
        .filter((keyword) =>
          fuzzyMatch(
            [keyword.title, ...(keyword.aliases ?? [])].join(" "),
            debouncedKeywordQuery,
          ),
        )
        .map((keyword) => mapKeywordToDirectoryItem(keyword, verbalPassages));

      const passageItems = verbalPassages
        .filter((passage) =>
          fuzzyMatch(getPassageDirectorySearchText(passage), debouncedKeywordQuery),
        )
        .map((passage) => ({
          id: `passage-${passage.id}`,
          title: passage.title,
          slug: passage.slug,
          href: `/verbal/reading?passage=${encodeURIComponent(passage.slug)}`,
          status: "linked" as const,
        }));

      const merged = new Map<string, KeywordDirectoryItem>();

      for (const item of [...keywordItems, ...passageItems]) {
        const key = normalizeArabic(`${item.slug} ${item.title}`);
        const existing = merged.get(key);

        if (!existing || (existing.status !== "linked" && item.status === "linked")) {
          merged.set(key, item);
        }
      }

      return Array.from(merged.values())
        .sort((left, right) => {
          if (left.status !== right.status) {
            return left.status === "linked" ? -1 : 1;
          }
          return left.title.localeCompare(right.title, "ar");
        })
        .slice(0, 10);
    },
    [debouncedKeywordQuery, verbalPassages],
  );

  return (
    <div className="space-y-8">
      <div
        className={`grid gap-4 ${
          showMistakesCard ? "md:grid-cols-3" : "md:grid-cols-2"
        }`}
      >
        <EmptySectionCard
          title="اللفظي"
          description="الأقسام اللفظية الظاهرة الآن هي فقط: إكمال الجمل، الاستيعاب المقروء، المفردة الشاذة، الخطأ السياقي، والتناظر اللفظي."
          active={track === "verbal"}
          onClick={() => setTrack("verbal")}
          icon={BookOpenText}
        />
        <EmptySectionCard
          title="الكمي"
          description="القسم الكمي ما زال مهيأ للإضافة اليدوية اللاحقة، وسيظهر هنا فور إدخال الأبواب والأسئلة الجديدة."
          active={track === "quant"}
          onClick={() => setTrack("quant")}
          icon={Calculator}
        />
        {showMistakesCard ? (
          <EmptySectionCard
            title="الأخطاء"
            description="قسم خاص بحسابك يجمع أسئلة الكمي واللفظي التي أخطأت فيها، مع حذف تلقائي بعد 5 حلول صحيحة أو حذف يدوي."
            active={track === "mistakes"}
            onClick={() => setTrack("mistakes")}
            icon={TriangleAlert}
          />
        ) : null}
      </div>

      <div className="rounded-[2.2rem] border border-[#E8D8B3] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,247,244,0.96))] p-8 shadow-soft">
        <div className="display-font text-2xl font-bold text-slate-950">
          {track === "verbal"
            ? "القسم اللفظي"
            : track === "quant"
              ? "القسم الكمي"
              : "الأخطاء"}
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-8 text-slate-600">
          {track === "mistakes"
            ? "كل سؤال تخطئ فيه وأنت مسجل الدخول يُحفظ هنا داخل حسابك فقط، ويختفي تلقائيًا بعد 5 حلول صحيحة أو عند حذفه يدويًا."
            : track === "verbal"
              ? "رتبنا بنك اللفظي إلى الأقسام الرسمية فقط، مع إبقاء الاستيعاب المقروء في مساره الخاص وضم الأسئلة القرائية الفرعية تحته بدل إظهارها كأقسام إضافية."
              : `${EMPTY_SECTION_MESSAGE}. النظام مهيأ الآن للإضافة اليدوية المنظمة، وعند إدخال أي باب أو سؤال جديد سيظهر مباشرة داخل هذا القسم.`}
        </p>

        {track === "mistakes" ? (
          <div className="mt-8">
            <QuestionBankMistakesPanel
              sessionStatus={authStatus}
              user={user}
            />
          </div>
        ) : null}

        {track === "verbal" ? (
          <div
            id="verbal-reading-search"
            className="mt-8 space-y-5 rounded-[1.9rem] border border-slate-200 bg-white p-6 shadow-sm"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="display-font text-xl font-bold text-slate-950">
                  بحث الاستيعاب المقروء بالكلمات المفتاحية
                </div>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
                  اكتب 3 أحرف فأكثر ليظهر لك عنوان القطعة فقط مع حالتها،
                  ثم افتحها من بنك الاستيعاب المقروء في صفحتها المخصصة دون
                  بطاقات طويلة أو زحمة.
                </p>
              </div>
              <div className="rounded-full bg-[#123B7A]/8 px-4 py-2 text-sm font-semibold text-[#123B7A]">
                {verbalReadingKeywords.length} عنوانًا مسجلًا
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/verbal/reading"
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:border-[#123B7A] hover:text-[#123B7A]"
              >
                افتح بنك الاستيعاب المقروء
              </Link>
              <Link
                href="/verbal/reading"
                className="rounded-2xl bg-[linear-gradient(135deg,#F5D08A_0%,#E6B85C_40%,#D4A94C_100%)] px-4 py-3 text-sm font-bold text-slate-950 shadow-[0_10px_24px_rgba(201,154,67,0.24)] transition hover:-translate-y-0.5"
              >
                ابدأ نصًا عشوائيًا
              </Link>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                value={keywordQuery}
                onChange={(event) => setKeywordQuery(event.target.value)}
                placeholder="ابحث بعنوان القطعة، مثل: الزيت، التمركز، الإمام مالك..."
                className="h-14 pr-12 text-base"
              />
            </div>

            {!keywordQuery.trim() ? (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/80 p-6 text-center text-sm text-slate-500">
                الصفحة هنا تبقى نظيفة. اكتب 3 أحرف فأكثر لتظهر النتائج
                المطابقة فقط.
              </div>
            ) : !canSearchVerbalKeywords ? (
              <div className="rounded-[1.5rem] border border-dashed border-amber-200 bg-amber-50/70 p-6 text-center text-sm text-amber-800">
                لا تظهر النتائج قبل الوصول إلى 3 أحرف. أكمل الكتابة ليصبح
                البحث أدق وأسرع.
              </div>
            ) : isLoadingVerbalPassages ? (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/80 p-6 text-center text-sm text-slate-500">
                جارٍ تحميل قطع الاستيعاب المقروء المضافة وربطها بالعناوين المفتاحية...
              </div>
            ) : isDebouncingKeywordQuery ? (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/80 p-6 text-center text-sm text-slate-500">
                جارٍ البحث في عناوين الاستيعاب المقروء والكلمات المفتاحية...
              </div>
            ) : verbalKeywordResults.length ? (
              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50/60 p-3">
                <div className="mb-2 px-2 text-xs font-semibold text-slate-500">
                  نتائج مطابقة
                </div>
                <div className="space-y-2">
                  {verbalKeywordResults.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 transition hover:border-[#C99A43]"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="display-font truncate text-base font-bold text-slate-950">
                          {item.title}
                        </div>
                        <div className="mt-1 text-xs font-semibold text-[#123B7A]">
                          /{item.slug}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            item.status === "linked"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.status === "linked" ? "متاحة" : "غير متاحة"}
                        </span>
                        {item.href ? (
                          <Link
                            href={item.href}
                            className="rounded-2xl border border-[#123B7A]/15 bg-white px-4 py-2 text-sm font-semibold text-[#123B7A] transition hover:border-[#123B7A] hover:bg-[#123B7A]/5"
                          >
                            فتح
                          </Link>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/80 p-6 text-center text-sm text-slate-500">
                لا توجد عناوين مطابقة الآن. جرّب كلمة مفتاحية أخرى أو جزءًا
                أوضح من اسم القطعة.
              </div>
            )}
          </div>
        ) : null}

        {track !== "mistakes" && currentSections.length ? (
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {currentSections.map((section) =>
              section.href ? (
                <Link
                  key={section.id}
                  href={section.href}
                  className="rounded-[1.6rem] border border-slate-200 bg-white p-5 text-right shadow-sm transition hover:-translate-y-0.5 hover:border-[#C99A43]"
                >
                  <div className="display-font text-lg font-bold text-slate-900">
                    {section.title}
                  </div>
                  <div className="mt-2 text-sm leading-7 text-slate-500">
                    {section.description}
                  </div>
                  <div className="mt-4 text-sm font-semibold text-[#123B7A]">
                    افتح القسم
                  </div>
                </Link>
              ) : (
                <div
                  key={section.id}
                  className="rounded-[1.6rem] border border-slate-200 bg-white p-5 text-right shadow-sm"
                >
                  <div className="display-font text-lg font-bold text-slate-900">
                    {section.title}
                  </div>
                  <div className="mt-2 text-sm leading-7 text-slate-500">
                    {section.description}
                  </div>
                </div>
              ),
            )}
          </div>
        ) : track !== "mistakes" ? (
          <div className="mt-6 rounded-[1.7rem] border border-dashed border-slate-300 bg-white/70 p-8 text-center text-sm text-slate-500">
            {track === "verbal"
              ? "إذا لم تختر قسمًا بعد، ابدأ من بطاقات اللفظي بالأعلى أو من بنك الاستيعاب المقروء."
              : "لا يوجد محتوى معروض حاليًا داخل هذا القسم."}
          </div>
        ) : null}
      </div>
    </div>
  );
}
