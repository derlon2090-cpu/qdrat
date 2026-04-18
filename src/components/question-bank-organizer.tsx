"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { BookOpenText, Calculator, Search, TriangleAlert, type LucideIcon } from "lucide-react";

import samplePassagesData from "../../data/verbal-passages.sample.json";
import { QuestionBankMistakesPanel } from "@/components/question-bank-mistakes-panel";
import { Input } from "@/components/ui/input";
import {
  EMPTY_SECTION_MESSAGE,
  verbalReadingKeywords,
} from "@/data/manual-question-bank";
import { quantitativeSections, verbalSections } from "@/data/question-bank-sections";
import { useAuthSession } from "@/hooks/use-auth-session";
import { buildPublicApiUrl } from "@/lib/api-base";
import type { VerbalPassageQuestionRecord, VerbalPassageRecord } from "@/lib/verbal-passages";

type TrackId = "verbal" | "quant" | "mistakes";

const MIN_VERBAL_SEARCH_CHARS = 3;
const VERBAL_SEARCH_DEBOUNCE_MS = 350;

type KeywordDirectoryItem = {
  id: string;
  title: string;
  href: string | null;
  excerpt: string;
  status: "linked" | "pending";
  questionCount: number;
  passageText: string | null;
  questionTitles: string[];
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

function createSnippet(text: string, query: string, maxLength = 170) {
  const cleanText = text.replace(/\s+/g, " ").trim();
  if (!cleanText) return "";

  if (!query.trim()) {
    return cleanText.length > maxLength ? `${cleanText.slice(0, maxLength).trim()}...` : cleanText;
  }

  const normalizedText = normalizeArabic(cleanText);
  const normalizedQuery = normalizeArabic(query);
  const matchIndex = normalizedText.indexOf(normalizedQuery);

  if (matchIndex === -1) {
    return cleanText.length > maxLength ? `${cleanText.slice(0, maxLength).trim()}...` : cleanText;
  }

  const start = Math.max(matchIndex - 36, 0);
  const end = Math.min(matchIndex + normalizedQuery.length + 90, cleanText.length);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < cleanText.length ? "..." : "";

  return `${prefix}${cleanText.slice(start, end).trim()}${suffix}`;
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

        if (passageTerms.some((term) => term.includes(keywordTerm) || keywordTerm.includes(term))) {
          score = Math.max(score, 95);
          continue;
        }

        if (fuzzyMatch([passage.title, ...passage.keywords].join(" "), keyword.title)) {
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
  query = "",
): KeywordDirectoryItem {
  const linkedPassage = resolveKeywordPassage(keyword, passages);

  return {
    id: keyword.id,
    title: keyword.title,
    href: linkedPassage ? `/verbal/reading?passage=${encodeURIComponent(linkedPassage.slug)}` : null,
    excerpt: linkedPassage
      ? createSnippet(linkedPassage.passageText, query || keyword.title)
      : "عنوان محفوظ داخل دليل القطع اللفظية، وسيتم ربط نص القطعة وأسئلتها به عند إضافته يدويًا.",
    status: linkedPassage ? "linked" : "pending",
    questionCount: linkedPassage?.questions.length ?? 0,
    passageText: linkedPassage?.passageText ?? null,
    questionTitles: linkedPassage?.questions.map((question) => question.questionText) ?? [],
  };
}

function mapSampleQuestion(question: SampleQuestionRow, index: number): VerbalPassageQuestionRecord {
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

function mapSamplePassage(row: SamplePassageRow, index: number): VerbalPassageRecord {
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

const fallbackVerbalPassages = (samplePassagesData as SamplePassageRow[]).map(mapSamplePassage);

function mergePassageSources(primary: VerbalPassageRecord[], fallback: VerbalPassageRecord[]) {
  const unique = new Map<string, VerbalPassageRecord>();

  for (const passage of [...primary, ...fallback]) {
    const key = normalizeArabic([passage.slug, passage.title, ...(passage.keywords ?? [])].join(" "));
    if (!unique.has(key)) {
      unique.set(key, passage);
    }
  }

  return Array.from(unique.values());
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
          <div className={`mt-3 text-sm leading-7 ${active ? "text-white/80" : "text-slate-500"}`}>{description}</div>
        </div>
        <div className={`flex h-14 w-14 items-center justify-center rounded-[1.3rem] ${active ? "bg-white/10" : "bg-[#fff7ed]"}`}>
          <Icon className={`h-7 w-7 ${active ? "text-white" : "text-[#C99A43]"}`} />
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
  const [keywordQuery, setKeywordQuery] = useState(searchParams.get("keyword") ?? "");
  const [debouncedKeywordQuery, setDebouncedKeywordQuery] = useState(searchParams.get("keyword") ?? "");
  const [verbalPassages, setVerbalPassages] = useState<VerbalPassageRecord[]>(fallbackVerbalPassages);
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
          throw new Error("تعذر تحميل القطع اللفظية المضافة.");
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
  const showMistakesCard = true;

  const normalizedKeywordLength = useMemo(
    () => keywordQuery.replace(/\s+/g, "").length,
    [keywordQuery],
  );
  const canSearchVerbalKeywords = normalizedKeywordLength >= MIN_VERBAL_SEARCH_CHARS;
  const isDebouncingKeywordQuery = keywordQuery !== debouncedKeywordQuery;

  const verbalKeywordResults = useMemo(
    () =>
      verbalReadingKeywords
        .filter((keyword) => !debouncedKeywordQuery || fuzzyMatch([keyword.title, ...(keyword.aliases ?? [])].join(" "), debouncedKeywordQuery))
        .map((keyword) => mapKeywordToDirectoryItem(keyword, verbalPassages, debouncedKeywordQuery))
        .slice(0, 18),
    [debouncedKeywordQuery, verbalPassages],
  );

  return (
    <div className="space-y-8">
      <div className={`grid gap-4 ${showMistakesCard ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
        <EmptySectionCard
          title="اللفظي"
          description="الأقسام اللفظية أصبحت مرتبة الآن إلى قطع لفظي، تناظر لفظي، إكمال الجمل، الخطأ السياقي، والمفردة الشاذة."
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
          {track === "verbal" ? "القسم اللفظي" : track === "quant" ? "القسم الكمي" : "الأخطاء"}
        </div>
        <p className="mt-3 max-w-3xl text-sm leading-8 text-slate-600">
          {track === "mistakes"
            ? "كل سؤال تخطئ فيه وأنت مسجل الدخول يُحفظ هنا داخل حسابك فقط، ويختفي تلقائيًا بعد 5 حلول صحيحة أو عند حذفه يدويًا."
            : track === "verbal"
              ? "رتبنا بنك اللفظي إلى مسارات واضحة: القطع اللفظية بالبحث بالكلمات المفتاحية، ثم أقسام التدريب اللفظي المتنوعة المبنية من الأسئلة التي أرسلتها."
              : `${EMPTY_SECTION_MESSAGE}. النظام مهيأ الآن للإضافة اليدوية المنظمة، وعند إدخال أي باب أو سؤال جديد سيظهر مباشرة داخل هذا القسم.`}
        </p>

        {track === "mistakes" ? (
          <div className="mt-8">
            <QuestionBankMistakesPanel sessionStatus={authStatus} user={user} />
          </div>
        ) : null}

        {track === "verbal" ? (
          <div id="verbal-reading-search" className="mt-8 space-y-5 rounded-[1.9rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="display-font text-xl font-bold text-slate-950">بحث القطع اللفظية بالكلمات المفتاحية</div>
                <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-500">
                  أدخل 3 أحرف فأكثر من اسم القطعة أو من كلمة مفتاحية مرتبطة بها. القطع المضافة فعليًا تُربط تلقائيًا هنا وتُفتح مباشرة من نفس البطاقة.
                </p>
              </div>
              <div className="rounded-full bg-[#123B7A]/8 px-4 py-2 text-sm font-semibold text-[#123B7A]">
                {verbalReadingKeywords.length} عنوانًا مسجلًا
              </div>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
              <Input
                value={keywordQuery}
                onChange={(event) => setKeywordQuery(event.target.value)}
                placeholder="ابحث بعنوان القطعة، مثل: التوحد، التواضع، الإمام مالك..."
                className="h-14 pr-12 text-base"
              />
            </div>

            {!keywordQuery.trim() ? (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/80 p-6 text-center text-sm text-slate-500">
                اكتب 3 أحرف فأكثر ليبدأ البحث داخل عناوين القطع والكلمات المفتاحية المرتبطة بها.
              </div>
            ) : !canSearchVerbalKeywords ? (
              <div className="rounded-[1.5rem] border border-dashed border-amber-200 bg-amber-50/70 p-6 text-center text-sm text-amber-800">
                لا تظهر النتائج قبل الوصول إلى 3 أحرف. أكمل الكتابة ليصبح البحث أدق وأسرع.
              </div>
            ) : isLoadingVerbalPassages ? (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/80 p-6 text-center text-sm text-slate-500">
                جارٍ تحميل القطع المضافة وربطها بالعناوين المفتاحية...
              </div>
            ) : isDebouncingKeywordQuery ? (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/80 p-6 text-center text-sm text-slate-500">
                جارٍ البحث في عناوين القطع والكلمات المفتاحية...
              </div>
            ) : verbalKeywordResults.length ? (
              <div className="grid gap-3 lg:grid-cols-2">
                {verbalKeywordResults.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-5 transition hover:border-[#C99A43]"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="display-font text-lg font-bold text-slate-950">{item.title}</div>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.status === "linked"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {item.status === "linked" ? "مرتبطة بقطعة كاملة" : "عنوان محفوظ بانتظار الإضافة"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-500">{item.excerpt}</p>

                    {item.passageText ? (
                      <div className="mt-4 rounded-[1.2rem] border border-slate-200 bg-white p-4">
                        <div className="mb-2 text-xs font-semibold text-slate-500">نص القطعة</div>
                        <p className="text-sm leading-8 text-slate-700">{item.passageText}</p>
                      </div>
                    ) : null}

                    {item.questionTitles.length ? (
                      <div className="mt-4 rounded-[1.2rem] border border-slate-200 bg-white p-4">
                        <div className="mb-2 text-xs font-semibold text-slate-500">الأسئلة المرتبطة</div>
                        <div className="space-y-2">
                          {item.questionTitles.map((questionTitle, index) => (
                            <div
                              key={`${item.id}-question-${index + 1}`}
                              className="rounded-xl bg-slate-50 px-3 py-2 text-sm leading-7 text-slate-700"
                            >
                              سؤال {index + 1}: {questionTitle}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="text-xs text-slate-500">
                        {item.questionCount ? `${item.questionCount} أسئلة مرتبطة` : "سيظهر النص والأسئلة عند إضافتها"}
                      </div>
                      {item.href ? (
                        <Link
                          href={item.href}
                          className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#123B7A]"
                        >
                          افتح القطعة
                        </Link>
                      ) : (
                        <span className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-500">
                          بانتظار ربط القطعة
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/80 p-6 text-center text-sm text-slate-500">
                لا توجد عناوين مطابقة الآن. جرّب كلمة مفتاحية أخرى أو جزءًا أوضح من اسم القطعة.
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
                  <div className="display-font text-lg font-bold text-slate-900">{section.title}</div>
                  <div className="mt-2 text-sm leading-7 text-slate-500">{section.description}</div>
                  <div className="mt-4 text-sm font-semibold text-[#123B7A]">افتح القسم</div>
                </Link>
              ) : (
                <div key={section.id} className="rounded-[1.6rem] border border-slate-200 bg-white p-5 text-right shadow-sm">
                  <div className="display-font text-lg font-bold text-slate-900">{section.title}</div>
                  <div className="mt-2 text-sm leading-7 text-slate-500">{section.description}</div>
                </div>
              ),
            )}
          </div>
        ) : track !== "mistakes" ? (
          <div className="mt-6 rounded-[1.7rem] border border-dashed border-slate-300 bg-white/70 p-8 text-center text-sm text-slate-500">
            {track === "verbal"
              ? "إذا لم تختر قسمًا بعد، ابدأ من بطاقات اللفظي بالأعلى أو من بحث القطع اللفظية."
              : "لا يوجد محتوى معروض حاليًا داخل هذا القسم."}
          </div>
        ) : null}
      </div>
    </div>
  );
}
