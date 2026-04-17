"use client";

import Link from "next/link";
import { useDeferredValue, useEffect, useState } from "react";
import { Clock3, Search, Sparkles } from "lucide-react";

import { buildPublicApiUrl } from "@/lib/api-base";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type { banks, questionSearchItems } from "@/data/miyaar";
import type { SearchItem } from "@/lib/question-bank-api";

type Bank = (typeof banks)[number];
type Question = SearchItem;

const RECENT_SEARCHES_KEY = "miyaar-recent-question-searches";

const bankFilters = [
  { value: "الكل", label: "الكل" },
  { value: "كمي", label: "كمي" },
  { value: "لفظي", label: "لفظي" },
  { value: "قطع", label: "قطع" },
];

const questionFilters = [
  { value: "الكل", label: "الكل" },
  { value: "كمي", label: "كمي" },
  { value: "لفظي", label: "لفظي" },
  { value: "قطع", label: "قطع" },
  { value: "تناظر", label: "تناظر" },
  { value: "إكمال", label: "إكمال" },
];

const stateFilters = ["الكل", "محفوظ", "خاطئ", "غير محلول"];
const difficultyFilters = ["الكل", "سهل", "متوسط", "متقدم"];

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

function createSnippet(text: string, query: string) {
  if (!query.trim()) return text;

  const normalizedText = normalizeArabic(text);
  const normalizedQuery = normalizeArabic(query);
  const matchIndex = normalizedText.indexOf(normalizedQuery);

  if (matchIndex === -1) return text;

  const start = Math.max(matchIndex - 12, 0);
  const end = Math.min(matchIndex + normalizedQuery.length + 28, text.length);
  const prefix = start > 0 ? "..." : "";
  const suffix = end < text.length ? "..." : "";

  return `${prefix}${text.slice(start, end).trim()}${suffix}`;
}

function getResultLabel(item: Question) {
  return item.title?.trim() || item.text;
}

function getResultHaystack(item: Question) {
  return [getResultLabel(item), item.text, item.excerpt ?? "", item.skill].join(" ");
}

export function BankExplorer({
  items,
  questions,
  ctaHref = "/exam",
}: {
  items: Bank[];
  questions: Question[];
  ctaHref?: string;
}) {
  const [bankQuery, setBankQuery] = useState("");
  const [activeBankType, setActiveBankType] = useState("الكل");
  const [questionQuery, setQuestionQuery] = useState("");
  const [activeQuestionFilter, setActiveQuestionFilter] = useState("الكل");
  const [activeStateFilter, setActiveStateFilter] = useState("الكل");
  const [activeDifficultyFilter, setActiveDifficultyFilter] = useState("الكل");
  const [activeSkillFilter, setActiveSkillFilter] = useState("الكل");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [bankItems, setBankItems] = useState<Bank[]>(items);
  const [searchItems, setSearchItems] = useState<Question[]>(questions);
  const deferredBankQuery = useDeferredValue(bankQuery);
  const deferredQuestionQuery = useDeferredValue(questionQuery);

  useEffect(() => {
    const stored = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!stored) return;

    try {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        setRecentSearches(parsed.filter((value) => typeof value === "string").slice(0, 5));
      }
    } catch {
      window.localStorage.removeItem(RECENT_SEARCHES_KEY);
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();

    if (deferredBankQuery.trim()) {
      params.set("q", deferredBankQuery.trim());
    }

    if (activeBankType !== "الكل") {
      params.set("type", activeBankType);
    }

    fetch(buildPublicApiUrl(`/api/question-bank/banks?${params.toString()}`), {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load banks");
        return response.json() as Promise<{ items?: Bank[] }>;
      })
      .then((payload) => {
        setBankItems(payload.items ?? []);
      })
      .catch(() => {
        setBankItems(items);
      });

    return () => controller.abort();
  }, [activeBankType, deferredBankQuery, items]);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();

    if (deferredQuestionQuery.trim()) {
      params.set("q", deferredQuestionQuery.trim());
    }

    if (activeQuestionFilter !== "الكل") {
      if (activeQuestionFilter === "كمي" || activeQuestionFilter === "لفظي" || activeQuestionFilter === "قطع") {
        params.set("section", activeQuestionFilter);
      } else {
        params.set("type", activeQuestionFilter);
      }
    }

    if (activeDifficultyFilter !== "الكل") {
      params.set("difficulty", activeDifficultyFilter);
    }

    if (activeSkillFilter !== "الكل") {
      params.set("skill", activeSkillFilter);
    }

    if (activeStateFilter !== "الكل") {
      params.set("state", activeStateFilter);
    }

    params.set("limit", "24");

    fetch(buildPublicApiUrl(`/api/question-bank/search?${params.toString()}`), {
      signal: controller.signal,
    })
      .then(async (response) => {
        if (!response.ok) throw new Error("Failed to load questions");
        return response.json() as Promise<{ items?: Question[] }>;
      })
      .then((payload) => {
        setSearchItems(payload.items ?? []);
      })
      .catch(() => {
        setSearchItems(questions);
      });

    return () => controller.abort();
  }, [
    activeDifficultyFilter,
    activeQuestionFilter,
    activeSkillFilter,
    activeStateFilter,
    deferredQuestionQuery,
    questions,
  ]);

  const skills = Array.from(new Set([...questions, ...searchItems].map((question) => question.skill)));
  const filteredBanks = bankItems;
  const filteredQuestions = searchItems;
  const suggestions = deferredQuestionQuery.trim()
    ? searchItems.filter((question) => fuzzyMatch(getResultHaystack(question), deferredQuestionQuery)).slice(0, 5)
    : [];

  function pushRecentSearch(value: string) {
    const trimmed = value.trim();
    if (!trimmed) return;

    const next = [trimmed, ...recentSearches.filter((item) => item !== trimmed)].slice(0, 5);
    setRecentSearches(next);
    window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
  }

  function applySuggestedSearch(value: string) {
    setQuestionQuery(value);
    pushRecentSearch(value);
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden rounded-[2.2rem] border border-[#E8D8B3] bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(248,247,244,0.96))] shadow-soft">
        <CardContent className="space-y-8 p-6 md:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="max-w-2xl space-y-4">
              <Badge className="border-transparent bg-[#123B7A] text-white">بحث السؤال</Badge>
              <h2 className="display-font section-title max-w-none text-right text-slate-950">
                ابحث داخل نص السؤال نفسه بدل الدوران بين البنوك
              </h2>
              <p className="section-copy mb-0 max-w-2xl text-slate-600">
                اكتب كلمة من السؤال، ثم صفِّ النتائج حسب القسم أو الصعوبة أو المهارة، وافتح السؤال مباشرة.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:w-[320px]">
              {[
                ["اقتراحات فورية", "تظهر أثناء الكتابة"],
                ["Recent Searches", "ترجع لآخر ما بحثت عنه"],
              ].map(([title, text]) => (
                <div
                  key={title}
                  className="rounded-[1.4rem] border border-[#E8D8B3] bg-white/80 p-5 text-right"
                >
                  <div className="display-font card-title mb-2 text-[#123B7A]">{title}</div>
                  <div className="card-text text-sm text-slate-500">{text}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.45fr,0.55fr]">
            <div className="space-y-4">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-500">بحث مباشر في نص السؤال</span>
                <div className="relative">
                  <Search className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    value={questionQuery}
                    onChange={(event) => setQuestionQuery(event.target.value)}
                    onBlur={() => pushRecentSearch(questionQuery)}
                    placeholder="مثال: الفكرة العامة، أكمل الجملة، قيمة x..."
                    className="h-14 pr-11 text-base"
                  />
                </div>
              </label>

              {questionQuery.trim() ? (
                <div className="rounded-[1.6rem] border border-slate-200 bg-white/88 p-5">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <Sparkles className="h-4 w-4 text-[#C99A43]" />
                    اقتراحات سريعة
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.length ? (
                      suggestions.map((item) => (
                        <button
                          key={`${item.kind ?? "question"}-${item.id}`}
                          type="button"
                          onMouseDown={() => applySuggestedSearch(getResultLabel(item))}
                          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[#C99A43] hover:text-[#123B7A]"
                        >
                          {getResultLabel(item)}
                        </button>
                      ))
                    ) : (
                      <span className="text-sm text-slate-500">لا توجد اقتراحات مطابقة، جرّب كلمة أقصر.</span>
                    )}
                  </div>
                </div>
              ) : recentSearches.length ? (
                <div className="rounded-[1.6rem] border border-slate-200 bg-white/88 p-5">
                  <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-500">
                    <Clock3 className="h-4 w-4 text-[#123B7A]" />
                    آخر عمليات البحث
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((item) => (
                      <button
                        key={item}
                        type="button"
                        onClick={() => setQuestionQuery(item)}
                        className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-[#C99A43] hover:text-[#123B7A]"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-500">القسم أو النوع</span>
                <select
                  value={activeQuestionFilter}
                  onChange={(event) => setActiveQuestionFilter(event.target.value)}
                  className="h-12 rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-[#C99A43] focus:ring-4 focus:ring-[#f6ead0]"
                >
                  {questionFilters.map((filter) => (
                    <option key={filter.value} value={filter.value}>
                      {filter.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-500">الصعوبة</span>
                <select
                  value={activeDifficultyFilter}
                  onChange={(event) => setActiveDifficultyFilter(event.target.value)}
                  className="h-12 rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-[#C99A43] focus:ring-4 focus:ring-[#f6ead0]"
                >
                  {difficultyFilters.map((filter) => (
                    <option key={filter} value={filter}>
                      {filter}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-500">المهارة</span>
                <select
                  value={activeSkillFilter}
                  onChange={(event) => setActiveSkillFilter(event.target.value)}
                  className="h-12 rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-[#C99A43] focus:ring-4 focus:ring-[#f6ead0]"
                >
                  <option value="الكل">الكل</option>
                  {skills.map((skill) => (
                    <option key={skill} value={skill}>
                      {skill}
                    </option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2">
                <span className="text-sm font-semibold text-slate-500">الحالة</span>
                <select
                  value={activeStateFilter}
                  onChange={(event) => setActiveStateFilter(event.target.value)}
                  className="h-12 rounded-2xl border border-slate-200 bg-white/90 px-4 text-sm font-medium text-slate-800 outline-none transition focus:border-[#C99A43] focus:ring-4 focus:ring-[#f6ead0]"
                >
                  {stateFilters.map((filter) => (
                    <option key={filter} value={filter}>
                      {filter}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-500">
                {filteredQuestions.length} نتيجة قابلة للتدريب الآن
              </div>
              <div className="text-xs text-slate-400">يعرض النص والتصنيف والصعوبة مباشرة</div>
            </div>

            {filteredQuestions.length ? (
              <div className="grid gap-3">
                {filteredQuestions.slice(0, 8).map((question) => (
                  <div
                    key={`${question.kind ?? "question"}-${question.id}`}
                  className="flex flex-col gap-5 rounded-[1.7rem] border border-slate-200/80 bg-white/90 p-6 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className="border-transparent bg-[#123B7A] text-white">
                          {question.section}
                        </Badge>
                        <Badge className="bg-amber-50 text-amber-700">{question.type}</Badge>
                        <Badge className="bg-slate-100 text-slate-700">{question.difficulty}</Badge>
                        <Badge className="bg-emerald-50 text-emerald-700">{question.state}</Badge>
                        {question.questionCount ? (
                          <Badge className="bg-emerald-50 text-emerald-700">
                            {question.questionCount} أسئلة
                          </Badge>
                        ) : null}
                      </div>
                      <h3 className="display-font card-title mb-0 text-xl font-bold leading-9 text-slate-950">
                        {createSnippet(getResultLabel(question), deferredQuestionQuery)}
                      </h3>
                      {question.excerpt ? (
                        <div className="text-sm leading-7 text-slate-500">{question.excerpt}</div>
                      ) : null}
                      <div className="text-sm text-slate-500">
                        {question.kind === "passage"
                          ? `عنوان القطعة${question.pieceNumber ? ` • قطعة ${question.pieceNumber}` : ""}`
                          : `المهارة: ${question.skill}`}
                      </div>
                    </div>
                    <Link href={question.href}>
                      <Button>{question.kind === "passage" ? "افتح القطعة" : "افتح السؤال"}</Button>
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[1.7rem] border border-dashed border-[#D8C69A] bg-[linear-gradient(180deg,#fffdfa,#f8f2e5)] p-8 text-center">
                <div className="display-font text-2xl font-bold text-slate-950">لا توجد نتائج بهذه الفلاتر</div>
                <p className="mt-3 text-sm leading-7 text-slate-500">
                  جرّب كلمة أقصر، أو غيّر القسم أو الصعوبة، أو ارجع إلى آخر عمليات البحث.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[2.2rem]">
        <CardContent className="space-y-6 p-6 md:p-8">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <label className="grid w-full gap-2 md:max-w-md">
              <span className="text-sm font-medium text-slate-500">بحث داخل البنوك</span>
              <Input
                value={bankQuery}
                onChange={(event) => setBankQuery(event.target.value)}
                placeholder="ابحث: تناظر، قطعة، متوسط..."
              />
            </label>
            <div className="flex flex-wrap gap-2">
              {bankFilters.map((filter) => (
                <button
                  key={filter.value}
                  type="button"
                  onClick={() => setActiveBankType(filter.value)}
                  className={`rounded-2xl border px-4 py-2 text-sm font-semibold transition ${
                    activeBankType === filter.value
                      ? "border-transparent bg-[linear-gradient(135deg,#16213f,#25345f)] text-white"
                      : "border-slate-200 bg-white/80 text-slate-700"
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3">
            {filteredBanks.length ? (
              filteredBanks.map((bank) => (
                <div
                  key={bank.id}
                  className="flex flex-col gap-5 rounded-[1.7rem] border border-slate-200/80 bg-white/75 p-6 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="display-font card-title mb-0 text-lg font-bold text-slate-950">{bank.title}</h3>
                      <Badge className="border-transparent bg-slate-950 text-white">{bank.type}</Badge>
                      <Badge className="bg-violet-50 text-violet-700">{bank.level}</Badge>
                      <Badge className="bg-amber-50 text-amber-700">{bank.tag}</Badge>
                    </div>
                    <p className="card-text text-sm text-slate-600">
                      بنك واضح ومباشر للتدريب السريع أو بناء اختبار مخصص أو المتابعة من نفس الصفحة.
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-left md:text-right">
                      <div className="display-font text-2xl font-bold text-slate-950">
                        {bank.count.toLocaleString("en-US")}
                      </div>
                      <div className="text-xs text-slate-500">سؤال</div>
                    </div>
                    <Link href={ctaHref}>
                      <Button>ابدأ التدريب</Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-[1.7rem] border border-dashed border-slate-300 bg-slate-50/80 p-8 text-center text-sm text-slate-500">
                لا توجد نتائج مطابقة للبحث الحالي. جرّب كلمة أخرى أو غيّر نوع البنك.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
