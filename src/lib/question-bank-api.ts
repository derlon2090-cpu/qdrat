import {
  EMPTY_SECTION_MESSAGE,
  verbalReadingKeywords,
} from "@/data/manual-question-bank";
import {
  findLocalVerbalPassageByIdOrSlug,
  localVerbalPassages,
  type LocalVerbalPassage,
} from "@/data/verbal-passages-local";
import { quantitativeSections, verbalSections } from "@/data/question-bank-sections";
import {
  getVerbalQuestionCategory,
  verbalMixedPracticeQuestions,
  verbalReadingOnlyQuestions,
} from "@/data/verbal-mixed-bank";

export type BankItem = {
  id: string;
  title: string;
  count: number;
  level: string;
  type: string;
  tag: string;
};

export type SearchItem = {
  id: string;
  text: string;
  section: string;
  type: string;
  difficulty: string;
  skill: string;
  state: string;
  href: string;
  kind?: "question" | "passage" | "keyword";
  title?: string;
  excerpt?: string;
  keywords?: string[];
  pieceNumber?: number | null;
  questionCount?: number;
  needsReview?: boolean;
};

export type PassageQuestion = {
  id: string;
  order: number;
  text: string;
  options: string[];
  correctAnswer: string;
  explanations: Record<string, string>;
};

export type PassageDetail = {
  id: string;
  pieceNumber: number | null;
  title: string;
  text: string;
  difficulty: string;
  sourceName: string | null;
  rawPageFrom: number | null;
  rawPageTo: number | null;
  parsingConfidence: number;
  needsReview: boolean;
  questions: PassageQuestion[];
};

export type ReadingPassageSummary = {
  id: string;
  title: string;
  sourceName: string | null;
  pieceNumber: number | null;
  questionCount: number;
  href: string;
};

export type ReadingKeywordDirectoryItem = {
  id: string;
  title: string;
  href: string | null;
  excerpt: string;
  kind: "passage" | "keyword";
  status: "linked" | "pending";
  questionCount: number;
  passageText: string | null;
  questionTitles: string[];
};

type SearchFilters = {
  query?: string;
  section?: string;
  type?: string;
  difficulty?: string;
  skill?: string;
  state?: string;
  limit?: number;
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

function mapPassageToSummary(passage: LocalVerbalPassage): ReadingPassageSummary {
  return {
    id: passage.id,
    title: passage.title,
    sourceName: passage.source,
    pieceNumber: passage.pieceNumber,
    questionCount: passage.questions.length,
    href: `/verbal/reading?passage=${encodeURIComponent(passage.slug)}`,
  };
}

function mapPassageToDetail(passage: LocalVerbalPassage): PassageDetail {
  return {
    id: passage.id,
    pieceNumber: passage.pieceNumber,
    title: passage.title,
    text: passage.passage,
    difficulty: "غير محدد",
    sourceName: passage.source,
    rawPageFrom: null,
    rawPageTo: null,
    parsingConfidence: 1,
    needsReview: false,
    questions: passage.questions.map((question, index) => ({
      id: question.id,
      order: index + 1,
      text: question.text,
      options: question.options,
      correctAnswer: question.correctAnswer,
      explanations: question.explanations,
    })),
  };
}

function getKeywordHaystack(keyword: (typeof verbalReadingKeywords)[number]) {
  return [keyword.title, ...(keyword.aliases ?? [])].join(" ");
}

function resolveKeywordPassage(keyword: (typeof verbalReadingKeywords)[number]) {
  if (keyword.passageId) {
    return localVerbalPassages.find((passage) => passage.id === keyword.passageId) ?? null;
  }

  const keywordTerms = [keyword.title, ...(keyword.aliases ?? [])].map(normalizeArabic);

  return (
    localVerbalPassages.find((passage) => {
      const normalizedTitle = normalizeArabic(passage.title);
      return keywordTerms.some(
        (term) => term && (term === normalizedTitle || term.includes(normalizedTitle) || normalizedTitle.includes(term)),
      );
    }) ?? null
  );
}

function mapKeywordToDirectoryItem(
  keyword: (typeof verbalReadingKeywords)[number],
  query = "",
): ReadingKeywordDirectoryItem {
  const linkedPassage = resolveKeywordPassage(keyword);

  return {
    id: keyword.id,
    title: keyword.title,
    href: linkedPassage ? `/verbal/reading?passage=${encodeURIComponent(linkedPassage.slug)}` : null,
    excerpt: linkedPassage
      ? createSnippet(linkedPassage.passage, query || keyword.title)
      : "عنوان محفوظ داخل دليل الاستيعاب المقروء، وسيتم ربط نص القطعة وأسئلتها به عند إضافته يدويًا.",
    kind: linkedPassage ? "passage" : "keyword",
    status: linkedPassage ? "linked" : "pending",
    questionCount: linkedPassage?.questions.length ?? 0,
    passageText: linkedPassage?.passage ?? null,
    questionTitles: linkedPassage?.questions.map((question) => question.text) ?? [],
  };
}

function mapReadingQuestionsToSearchItems() {
  return localVerbalPassages.flatMap((passage) =>
    passage.questions.map((question, index) => ({
      id: question.id,
      text: question.text,
      title: question.text,
      excerpt: createSnippet(passage.passage, question.text),
      section: "الاستيعاب المقروء",
      type: "الاستيعاب المقروء",
      difficulty: "غير محدد",
      skill: passage.title,
      state: "جاهزة",
      href: `/verbal/reading?passage=${encodeURIComponent(passage.slug)}`,
      kind: "question" as const,
      pieceNumber: passage.pieceNumber,
      needsReview: false,
    })),
  );
}

function mapVerbalPracticeQuestionsToSearchItems() {
  return verbalMixedPracticeQuestions
    .filter(
      (question) =>
        question.categoryId !== "reading_comprehension" &&
        question.categoryId !== "short_reading",
    )
    .map((question, index) => {
    const category = getVerbalQuestionCategory(question.categoryId);

    return {
      id: question.id,
      text: question.prompt,
      title: question.prompt,
      excerpt: question.explanation,
      keywords: question.keywords ?? [],
      section: "لفظي",
      type: category.title,
      difficulty: "جاهزة",
      skill: category.title,
      state: question.source,
      href: `/verbal/practice?category=${question.categoryId}&question=${question.id}`,
      kind: "question" as const,
      pieceNumber: index + 1,
      needsReview: false,
    };
    });
}

export function getReadingPassageSummariesSync(): ReadingPassageSummary[] {
  return localVerbalPassages.map(mapPassageToSummary);
}

export function getPassageDetailSync(passageId: string | number) {
  const passage = findLocalVerbalPassageByIdOrSlug(passageId);
  return passage ? mapPassageToDetail(passage) : null;
}

export function getReadingKeywordDirectory(filters: {
  query?: string;
  limit?: number;
  minQueryLength?: number;
} = {}) {
  const query = filters.query?.trim() ?? "";
  const limit = Math.min(Math.max(Number(filters.limit ?? 24), 1), 200);
  const minQueryLength = Math.max(Number(filters.minQueryLength ?? 0), 0);
  const normalizedQueryLength = normalizeArabic(query).replace(/\s+/g, "").length;

  if (query && normalizedQueryLength < minQueryLength) {
    return [];
  }

  return verbalReadingKeywords
    .filter((keyword) => !query || fuzzyMatch(getKeywordHaystack(keyword), query))
    .map((keyword) => mapKeywordToDirectoryItem(keyword, query))
    .slice(0, limit);
}

export async function getBankItems(filters: SearchFilters = {}) {
  const query = filters.query?.trim() ?? "";
  const type = filters.type?.trim() ?? "الكل";

  const sectionCounts = new Map<string, number>([
    ["verbal_reading_comprehension", localVerbalPassages.length || verbalReadingOnlyQuestions.length],
    ["verbal_analogy", verbalMixedPracticeQuestions.filter((question) => question.categoryId === "analogy").length],
    [
      "verbal_sentence_completion",
      verbalMixedPracticeQuestions.filter((question) => question.categoryId === "sentence_completion").length,
    ],
    [
      "verbal_contextual_error",
      verbalMixedPracticeQuestions.filter((question) => question.categoryId === "contextual_error").length,
    ],
    ["verbal_odd_word", verbalMixedPracticeQuestions.filter((question) => question.categoryId === "odd_word").length],
  ]);

  const items: BankItem[] = [...verbalSections, ...quantitativeSections].map((section) => ({
    id: section.id,
    title: section.title,
    count: sectionCounts.get(section.id) ?? 0,
    level: (sectionCounts.get(section.id) ?? 0) > 0 ? "جاهز الآن" : EMPTY_SECTION_MESSAGE,
    type: section.id.startsWith("verbal_") ? "لفظي" : "كمي",
    tag: section.description,
  }));

  return items.filter((item) => {
    const matchesType = type === "الكل" || item.type === type;
    const matchesQuery = !query || fuzzyMatch(`${item.title} ${item.tag}`, query);
    return matchesType && matchesQuery;
  });
}

export async function getQuestionItems(filters: SearchFilters = {}) {
  const query = filters.query?.trim() ?? "";
  const section = filters.section?.trim() ?? "الكل";
  const type = filters.type?.trim() ?? "الكل";
  const limit = Math.min(Math.max(Number(filters.limit ?? 24), 1), 80);

  const mixedVerbalItems = mapVerbalPracticeQuestionsToSearchItems();
  const questionItems = [...mapReadingQuestionsToSearchItems(), ...mixedVerbalItems].filter((item) => {
    const keywordText = "keywords" in item && Array.isArray(item.keywords) ? item.keywords.join(" ") : "";
    const matchesQuery = !query || fuzzyMatch(`${item.text} ${item.skill} ${item.excerpt ?? ""} ${keywordText}`, query);
    const matchesSection = section === "الكل" || item.section === section;
    const matchesType = type === "الكل" || item.type === type;
    return matchesQuery && matchesSection && matchesType;
  });

  const passageItems = !query
    ? []
    : localVerbalPassages
        .filter((passage) => fuzzyMatch(`${passage.title} ${passage.passage}`, query))
        .map((passage) => ({
          id: passage.id,
          text: passage.title,
          title: passage.title,
          excerpt: createSnippet(passage.passage, query),
          section: "الاستيعاب المقروء",
          type: "الاستيعاب المقروء",
          difficulty: "غير محدد",
          skill: passage.title,
          state: "جاهزة",
          href: `/verbal/reading?passage=${encodeURIComponent(passage.slug)}`,
          kind: "passage" as const,
          pieceNumber: passage.pieceNumber,
          questionCount: passage.questions.length,
          needsReview: false,
        }));

  const passageHrefSet = new Set(passageItems.map((item) => item.href));
  const keywordItems = !query
    ? []
    : getReadingKeywordDirectory({ query, limit }).flatMap((item) => {
        if (!item.href || passageHrefSet.has(item.href)) {
          return [];
        }

        return [
          {
            id: item.id,
            text: item.title,
            title: item.title,
            excerpt: item.excerpt,
            section: "الاستيعاب المقروء",
            type: "الاستيعاب المقروء",
            difficulty: "جاهزة",
            skill: item.title,
            state: "مرتبطة",
            href: item.href,
            kind: "passage" as const,
            pieceNumber: null,
            questionCount: item.questionCount || undefined,
            needsReview: false,
          },
        ];
      });

  return [...passageItems, ...keywordItems, ...questionItems].slice(0, limit);
}

export async function getReadingPassageSummaries(): Promise<ReadingPassageSummary[]> {
  return getReadingPassageSummariesSync();
}

export async function getPassageDetail(passageId: string | number) {
  return getPassageDetailSync(passageId);
}
