"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BookOpenText,
  Calculator,
  ChevronDown,
  Clock3,
  Filter,
  NotebookPen,
  Search,
  Sparkles,
  Target,
  TriangleAlert,
  type LucideIcon,
} from "lucide-react";

import samplePassagesData from "../../data/verbal-passages.sample.json";
import { QuestionBankMistakesPanel } from "@/components/question-bank-mistakes-panel";
import { Reveal } from "@/components/reveal";
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
import { cn } from "@/lib/utils";

type BankView = "overview" | "verbal" | "quant" | "mistakes";

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

function resolveView(value: string | null): BankView {
  if (value === "quant") return "quant";
  if (value === "verbal") return "verbal";
  if (value === "mistakes") return "mistakes";
  return "overview";
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition",
        active
          ? "border-transparent bg-[#123B7A] text-white shadow-[0_12px_24px_rgba(18,59,122,0.18)]"
          : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50",
      )}
    >
      {!active ? <ChevronDown className="h-3.5 w-3.5" /> : <Filter className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}

function StatCard({
  title,
  value,
  caption,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string;
  caption: string;
  icon: LucideIcon;
  tone: string;
}) {
  return (
    <div className="rounded-[1.35rem] border border-slate-200 bg-white px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-slate-500">{title}</div>
          <div className="mt-2 display-font text-[1.9rem] font-extrabold text-slate-950">{value}</div>
          <div className="mt-1 text-xs text-slate-500">{caption}</div>
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-[1rem]", tone)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function ToolLinkCard({
  title,
  description,
  icon: Icon,
  tone,
  href,
  onClick,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  tone: string;
  href?: string;
  onClick?: () => void;
}) {
  const content = (
    <div className="flex items-center justify-between gap-3 rounded-[1.2rem] border border-slate-200 bg-white px-4 py-3 shadow-[0_8px_18px_rgba(15,23,42,0.035)] transition hover:-translate-y-0.5 hover:border-slate-300">
      <div className="text-right">
        <div className="display-font text-base font-bold text-slate-950">{title}</div>
        <div className="mt-1 text-xs leading-6 text-slate-500">{description}</div>
      </div>
      <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem]", tone)}>
        <Icon className="h-4 w-4" />
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return (
    <button type="button" onClick={onClick} className="w-full text-right">
      {content}
    </button>
  );
}

function PrimarySectionCard({
  title,
  description,
  icon: Icon,
  tone,
  questions,
  solved,
  progress,
  onOpen,
  active,
}: {
  title: string;
  description: string;
  icon: LucideIcon;
  tone: string;
  questions: number;
  solved: number;
  progress: number;
  onOpen: () => void;
  active?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-[1.6rem] border bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)] transition",
        active ? "border-[#c7dafd] bg-[#fbfdff]" : "border-slate-200",
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className={cn("display-font text-[1.65rem] font-bold", active ? "text-[#123B7A]" : "text-slate-950")}>
            {title}
          </div>
          <p className="mt-2 text-sm leading-7 text-slate-500">{description}</p>
        </div>
        <div className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem]", tone)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-[1rem] bg-slate-50 px-3 py-3">
          <div className="text-[11px] font-semibold text-slate-500">عدد الأسئلة</div>
          <div className="mt-1 display-font text-lg font-bold text-slate-950">{questions.toLocaleString("ar-SA")}</div>
        </div>
        <div className="rounded-[1rem] bg-slate-50 px-3 py-3">
          <div className="text-[11px] font-semibold text-slate-500">تم الحل</div>
          <div className="mt-1 display-font text-lg font-bold text-slate-950">{solved.toLocaleString("ar-SA")}</div>
        </div>
        <div className="rounded-[1rem] bg-slate-50 px-3 py-3">
          <div className="text-[11px] font-semibold text-slate-500">النسبة</div>
          <div className="mt-1 display-font text-lg font-bold text-slate-950">{progress}%</div>
        </div>
      </div>

      <button
        type="button"
        onClick={onOpen}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-[1rem] border border-[#d8e3fb] bg-[#f6f9ff] px-4 py-3 text-sm font-bold text-[#123B7A] transition hover:bg-[#edf4ff]"
      >
        دخول القسم
        <ArrowLeft className="h-4 w-4" />
      </button>
    </div>
  );
}

function LatestExamCard({
  title,
  label,
  questions,
  progress,
  href,
}: {
  title: string;
  label: string;
  questions: number;
  progress: number;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-[1.35rem] border border-slate-200 bg-white px-4 py-4 shadow-[0_10px_24px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-slate-300"
    >
      <div className="flex items-center justify-between gap-3">
        <span className="rounded-full bg-[#f4f8ff] px-2.5 py-1 text-[11px] font-bold text-[#2563eb]">{label}</span>
        <span className="text-[11px] font-semibold text-slate-400">{questions} سؤال</span>
      </div>
      <div className="mt-4 display-font text-lg font-bold text-slate-950">{title}</div>
      <div className="mt-3 flex items-center justify-between text-xs font-semibold">
        <span className="text-emerald-600">{progress}% أتقنه</span>
        <span className="text-slate-400">آخر تدريب</span>
      </div>
    </Link>
  );
}

function SectionMiniCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href?: string;
}) {
  const content = (
    <div className="rounded-[1.3rem] border border-slate-200 bg-white p-4 shadow-[0_10px_22px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-slate-300">
      <div className="display-font text-lg font-bold text-slate-950">{title}</div>
      <div className="mt-2 text-sm leading-7 text-slate-500">{description}</div>
      {href ? (
        <div className="mt-4 text-sm font-bold text-[#123B7A]">
          افتح القسم
        </div>
      ) : null}
    </div>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}

export function QuestionBankOrganizer() {
  const searchParams = useSearchParams();
  const { status: authStatus, user } = useAuthSession();

  const [view, setView] = useState<BankView>(resolveView(searchParams.get("track")));
  const [keywordQuery, setKeywordQuery] = useState(searchParams.get("keyword") ?? "");
  const [debouncedKeywordQuery, setDebouncedKeywordQuery] = useState(searchParams.get("keyword") ?? "");
  const [difficultyIndex, setDifficultyIndex] = useState(0);
  const [verbalPassages, setVerbalPassages] = useState<VerbalPassageRecord[]>(fallbackVerbalPassages);
  const [isLoadingVerbalPassages, setIsLoadingVerbalPassages] = useState(false);

  useEffect(() => {
    setView(resolveView(searchParams.get("track")));
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
    const controller = new AbortController();
    setIsLoadingVerbalPassages(true);

    fetch(buildPublicApiUrl("/api/verbal-passages?status=published&limit=500"), {
      cache: "no-store",
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("تعذر تحميل قطع الاستيعاب المقروء المضافة.");
        }

        return response.json() as Promise<{ items?: VerbalPassageRecord[] }>;
      })
      .then((payload) => {
        const items = Array.isArray(payload.items) ? payload.items : [];
        setVerbalPassages(mergePassageSources(items, fallbackVerbalPassages));
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setVerbalPassages(fallbackVerbalPassages);
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoadingVerbalPassages(false);
        }
      });

    return () => controller.abort();
  }, []);

  const verbalKeywordResults = useMemo(() => {
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
  }, [debouncedKeywordQuery, verbalPassages]);

  const normalizedKeywordLength = useMemo(
    () => normalizeArabic(keywordQuery).replace(/\s+/g, "").length,
    [keywordQuery],
  );

  const canSearchVerbalKeywords = normalizedKeywordLength >= MIN_VERBAL_SEARCH_CHARS;
  const isDebouncingKeywordQuery = keywordQuery !== debouncedKeywordQuery;

  const difficultyOptions = ["جميع الصعوبة", "سهل", "متوسط", "صعب"];
  const difficultyLabel = difficultyOptions[difficultyIndex];

  useEffect(() => {
    if (authStatus !== "authenticated" || !user) {
      return;
    }

    const activityPath =
      view === "mistakes"
        ? "/question-bank?track=mistakes"
        : view === "quant"
          ? "/question-bank?track=quant"
          : view === "verbal"
            ? debouncedKeywordQuery
              ? `/question-bank?track=verbal&keyword=${encodeURIComponent(debouncedKeywordQuery)}`
              : "/question-bank?track=verbal"
            : "/question-bank";

    const activityLabel =
      view === "mistakes"
        ? "متابعة قسم الأخطاء"
        : view === "quant"
          ? "فتح بنك الأسئلة الكمي"
          : view === "verbal"
            ? "فتح بنك الأسئلة اللفظي"
            : "زيارة بنك الأسئلة";

    const timerId = window.setTimeout(() => {
      void fetch("/api/student/activity", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          label: activityLabel,
          path: activityPath,
          bankLabel: "بنك الأسئلة",
          bankHref: activityPath,
        }),
      }).catch(() => undefined);
    }, 300);

    return () => window.clearTimeout(timerId);
  }, [authStatus, user, view, debouncedKeywordQuery]);

  const overviewStats = [
    {
      title: "النسبة العامة",
      value: "68%",
      caption: "معدل تقريبي لمسارك الحالي",
      icon: Sparkles,
      tone: "bg-[#f4ecff] text-[#8b5cf6]",
    },
    {
      title: "إجمالي الأسئلة المحفوظة",
      value: "1,248",
      caption: "سؤال قابل للمراجعة",
      icon: NotebookPen,
      tone: "bg-[#fff7ed] text-[#ea580c]",
    },
    {
      title: "الإجابات الصحيحة",
      value: "850",
      caption: "هذا الأسبوع",
      icon: Target,
      tone: "bg-[#eefbf3] text-[#16a34a]",
    },
    {
      title: "الإجابات الخاطئة",
      value: "398",
      caption: "هذا الأسبوع",
      icon: TriangleAlert,
      tone: "bg-[#fff1f2] text-[#ef4444]",
    },
    {
      title: "الأسئلة المحلولة",
      value: "2,450",
      caption: "سؤال في البنك",
      icon: BookOpenText,
      tone: "bg-[#eff6ff] text-[#2563eb]",
    },
  ] as const;

  const latestTests = [
    {
      title: "أكمل الجمل",
      label: "لفظي",
      questions: 20,
      progress: 60,
      href: "/verbal/practice?category=sentence_completion",
    },
    {
      title: "هندسة",
      label: "كمي",
      questions: 20,
      progress: 70,
      href: "/question-bank?track=quant",
    },
    {
      title: "النسبة والتناسب",
      label: "كمي",
      questions: 20,
      progress: 80,
      href: "/question-bank?track=quant",
    },
    {
      title: "فهم المقروء",
      label: "لفظي",
      questions: 20,
      progress: 65,
      href: "/verbal/reading",
    },
  ] as const;

  const renderSearchResults = debouncedKeywordQuery.trim() ? (
    <Reveal>
      <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
        <div className="display-font text-xl font-bold text-slate-950">نتائج البحث داخل القطع اللفظية</div>
        <div className="mt-2 text-sm text-slate-500">
          تظهر النتائج عند كتابة 3 أحرف فأكثر، مع ربط مباشر بصفحة القطعة أو بنك الاستيعاب.
        </div>

        <div className="mt-4">
          {!canSearchVerbalKeywords ? (
            <div className="rounded-[1.2rem] border border-dashed border-amber-200 bg-amber-50/80 p-5 text-sm text-amber-800">
              أكمل إلى 3 أحرف على الأقل حتى تظهر النتائج الدقيقة.
            </div>
          ) : isLoadingVerbalPassages || isDebouncingKeywordQuery ? (
            <div className="rounded-[1.2rem] border border-dashed border-slate-300 bg-slate-50/80 p-5 text-sm text-slate-500">
              جاري مطابقة العناوين والكلمات المفتاحية...
            </div>
          ) : verbalKeywordResults.length ? (
            <div className="space-y-2.5">
              {verbalKeywordResults.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-3 rounded-[1.15rem] border border-slate-200 bg-slate-50/70 px-4 py-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="display-font truncate text-base font-bold text-slate-950">{item.title}</div>
                    <div className="mt-1 text-xs font-semibold text-[#123B7A]">/{item.slug}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "rounded-full px-3 py-1 text-[11px] font-bold",
                        item.status === "linked"
                          ? "bg-emerald-50 text-emerald-700"
                          : "bg-slate-100 text-slate-600",
                      )}
                    >
                      {item.status === "linked" ? "متاحة" : "قريبًا"}
                    </span>
                    {item.href ? (
                      <Link
                        href={item.href}
                        className="rounded-xl border border-[#d8e3fb] bg-white px-4 py-2 text-sm font-bold text-[#123B7A] transition hover:bg-[#f4f8ff]"
                      >
                        فتح
                      </Link>
                    ) : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[1.2rem] border border-dashed border-slate-300 bg-slate-50/80 p-5 text-sm text-slate-500">
              لا توجد نتائج مطابقة الآن. جرّب كلمة أوضح من اسم القطعة.
            </div>
          )}
        </div>
      </div>
    </Reveal>
  ) : null;

  const renderMainSections = () => {
    if (view === "mistakes") {
      return (
        <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="display-font text-2xl font-bold text-slate-950">قسم الأخطاء</div>
              <div className="mt-1 text-sm text-slate-500">راجع أخطاءك وابدأ تدريبًا ذكيًا على الأسئلة غير المتقنة.</div>
            </div>
          </div>
          <QuestionBankMistakesPanel sessionStatus={authStatus} user={user} />
        </div>
      );
    }

    if (view === "verbal") {
      return (
        <div className="space-y-5">
          <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
            <div className="mb-4">
              <div className="display-font text-2xl font-bold text-slate-950">الأقسام اللفظية</div>
              <div className="mt-1 text-sm text-slate-500">أقسام لفظية منظمة وفق التصنيف الرسمي: إكمال الجمل، الاستيعاب المقروء، المفردة الشاذة، الخطأ السياقي، والتناظر اللفظي.</div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              {verbalSections.map((section) => (
                <SectionMiniCard
                  key={section.id}
                  title={section.title}
                  description={section.description}
                  href={section.href}
                />
              ))}
            </div>
          </div>

          {renderSearchResults}
        </div>
      );
    }

    if (view === "quant") {
      return (
        <div className="space-y-5">
          <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
            <div className="mb-4">
              <div className="display-font text-2xl font-bold text-slate-950">الأقسام الكمية</div>
              <div className="mt-1 text-sm text-slate-500">القسم الكمي يشمل الحساب، والهندسة اللفظية، والنسبة والتناسب. التصميم أصبح جاهزًا هنا، ويكفي ربط المحتوى الجديد عند إضافته.</div>
            </div>

            {quantitativeSections.length ? (
              <div className="grid gap-4 lg:grid-cols-2">
                {quantitativeSections.map((section) => (
                  <SectionMiniCard
                    key={section.id}
                    title={section.title}
                    description={section.description}
                    href={section.href}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-[1.3rem] border border-dashed border-slate-300 bg-slate-50/80 p-6 text-sm leading-8 text-slate-600">
                {EMPTY_SECTION_MESSAGE}. عند إضافة أبواب الكمي وأسئلته ستظهر هنا بنفس تصميم الصفحة الحالية.
              </div>
            )}
          </div>

          {renderSearchResults}
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="display-font text-2xl font-bold text-slate-950">الأقسام الرئيسية</div>
              <div className="mt-1 text-sm text-slate-500">اختر القسم المناسب لك وابدأ التدريب مباشرة، وراجع أخطاءك باستمرار.</div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <PrimarySectionCard
              title="الكمي"
              description="قسم أساسي يشمل الحساب، والهندسة اللفظية، والنسبة والتناسب."
              icon={Calculator}
              tone="bg-[#edf4ff] text-[#2563eb]"
              questions={1330}
              solved={616}
              progress={72}
              active={false}
              onOpen={() => setView("quant")}
            />
            <PrimarySectionCard
              title="اللفظي"
              description="قسم أساسي يشمل إكمال الجمل، والفهم القرائي، والمفردات، والتناظر اللفظي."
              icon={BookOpenText}
              tone="bg-[#fff4e8] text-[#f59e0b]"
              questions={1120}
              solved={632}
              progress={65}
              active={false}
              onOpen={() => setView("verbal")}
            />
          </div>
        </div>

        {renderSearchResults}

        <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="display-font text-2xl font-bold text-slate-950">أحدث الاختبارات</div>
            <div className="text-sm text-slate-500">ابدأ من أكثر الأقسام استخدامًا</div>
          </div>

          <div className="grid gap-4 lg:grid-cols-4">
            {latestTests.map((item) => (
              <LatestExamCard key={item.title} {...item} />
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <Reveal>
        <div className="rounded-[1.8rem] border border-slate-200 bg-white p-4 shadow-[0_18px_38px_rgba(15,23,42,0.05)] sm:p-5">
          <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_300px] xl:items-start">
            <div className="order-2 xl:order-1">
              <div className="relative max-w-xl">
                <Search className="pointer-events-none absolute right-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-slate-400" />
                <Input
                  value={keywordQuery}
                  onChange={(event) => setKeywordQuery(event.target.value)}
                  placeholder="ابحث في بنك الأسئلة..."
                  className="h-12 rounded-xl border-slate-200 pr-11"
                />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <FilterChip label="تصفية" active />
                <FilterChip
                  label={
                    view === "overview"
                      ? "جميع الأنواع"
                      : view === "verbal"
                        ? "اللفظي"
                        : view === "quant"
                          ? "الكمي"
                          : "الأخطاء"
                  }
                  onClick={() =>
                    setView((current) =>
                      current === "overview"
                        ? "verbal"
                        : current === "verbal"
                          ? "quant"
                          : current === "quant"
                            ? "mistakes"
                            : "overview",
                    )
                  }
                />
                <FilterChip
                  label={
                    view === "overview"
                      ? "جميع الأقسام"
                      : view === "verbal"
                        ? "الأقسام اللفظية"
                        : view === "quant"
                          ? "الأقسام الكمية"
                          : "أسئلة الأخطاء"
                  }
                />
                <FilterChip
                  label={difficultyLabel}
                  onClick={() =>
                    setDifficultyIndex((current) =>
                      current === difficultyOptions.length - 1 ? 0 : current + 1,
                    )
                  }
                />
              </div>
            </div>

            <div className="order-1 rounded-[1.55rem] border border-[#e6eefb] bg-[#fbfdff] p-5 xl:order-2">
              <div className="flex items-start justify-between gap-4">
                <div className="text-right">
                  <div className="display-font text-[2rem] font-bold text-slate-950">بنك الأسئلة</div>
                  <div className="mt-2 text-sm leading-7 text-slate-500">
                    اختر القسم المناسب لك، وراجع أخطاءك باستمرار.
                  </div>
                </div>
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[1rem] bg-[#eef4ff] text-[#2563eb]">
                  <BookOpenText className="h-5 w-5" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {overviewStats.map((item) => (
            <StatCard
              key={item.title}
              title={item.title}
              value={item.value}
              caption={item.caption}
              icon={item.icon}
              tone={item.tone}
            />
          ))}
        </div>
      </Reveal>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_270px]">
        <Reveal>
          <div className="space-y-5">{renderMainSections()}</div>
        </Reveal>

        <Reveal>
          <aside className="space-y-5">
            <div className="rounded-[1.7rem] border border-slate-200 bg-white p-5 shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
              <div className="display-font text-xl font-bold text-slate-950">أدوات بنك الأسئلة</div>
              <div className="mt-4 space-y-3">
                <ToolLinkCard
                  title="الأخطاء"
                  description="راجع أسئلتك الخاطئة وتعلّم منها"
                  icon={TriangleAlert}
                  tone="bg-[#fff1f2] text-[#ef4444]"
                  onClick={() => setView("mistakes")}
                />
                <ToolLinkCard
                  title="المحفوظة"
                  description="ملخصاتك وملفاتك المرتبطة بالمذاكرة"
                  icon={NotebookPen}
                  tone="bg-[#eefbf3] text-[#16a34a]"
                  href="/summaries"
                />
                <ToolLinkCard
                  title="الاختبارات المجمعة"
                  description="اختبارات جاهزة تجمع أهم أسئلتك"
                  icon={Sparkles}
                  tone="bg-[#f4ecff] text-[#8b5cf6]"
                  href="/exam"
                />
                <ToolLinkCard
                  title="محاكاة الاختبار"
                  description="تدرّب على نماذج محاكية فعلية"
                  icon={Clock3}
                  tone="bg-[#edf4ff] text-[#2563eb]"
                  href="/paper-models"
                />
              </div>

              <Link
                href="/exam"
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-[1rem] border border-[#d8e3fb] bg-[#f6f9ff] px-4 py-3 text-sm font-bold text-[#123B7A] transition hover:bg-[#edf4ff]"
              >
                عرض جميع الأدوات
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>

            <div className="rounded-[1.7rem] border border-slate-200 bg-white p-4 shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
              <Link
                href="/verbal/reading"
                className="flex w-full items-center justify-center gap-2 rounded-[1rem] border border-[#d8e3fb] bg-[#f6f9ff] px-4 py-3 text-sm font-bold text-[#123B7A] transition hover:bg-[#edf4ff]"
              >
                عرض جميع الاختبارات
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </div>
          </aside>
        </Reveal>
      </div>
    </div>
  );
}
