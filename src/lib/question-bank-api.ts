import {
  EMPTY_SECTION_MESSAGE,
  readingPassages,
  quantitativeSections,
  verbalReadingKeywords,
  verbalSections,
} from "@/data/manual-question-bank";

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

function getPassagePieceNumber(passageId: string) {
  const match = passageId.match(/(\d+)$/);
  return match ? Number(match[1]) : null;
}

function mapPassageToSummary(passage: (typeof readingPassages)[number]): ReadingPassageSummary {
  return {
    id: passage.id,
    title: passage.title,
    sourceName: passage.source,
    pieceNumber: getPassagePieceNumber(passage.id),
    questionCount: passage.questions.length,
    href: `/exam?section=verbal_reading&passageId=${passage.id}`,
  };
}

function mapPassageToDetail(passage: (typeof readingPassages)[number]): PassageDetail {
  return {
    id: passage.id,
    pieceNumber: getPassagePieceNumber(passage.id),
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
    return readingPassages.find((passage) => passage.id === keyword.passageId) ?? null;
  }

  const keywordTerms = [keyword.title, ...(keyword.aliases ?? [])].map(normalizeArabic);

  return (
    readingPassages.find((passage) => {
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
    href: linkedPassage ? `/exam?section=verbal_reading&passageId=${linkedPassage.id}` : null,
    excerpt: linkedPassage
      ? createSnippet(linkedPassage.passage, query || keyword.title)
      : "عنوان محفوظ داخل دليل القطع اللفظية، وسيتم ربط نص القطعة وأسئلتها به عند إضافته يدويًا.",
    kind: linkedPassage ? "passage" : "keyword",
    status: linkedPassage ? "linked" : "pending",
    questionCount: linkedPassage?.questions.length ?? 0,
  };
}

function mapReadingQuestionsToSearchItems() {
  return readingPassages.flatMap((passage) =>
    passage.questions.map((question, index) => ({
      id: question.id,
      text: question.text,
      title: question.text,
      excerpt: createSnippet(passage.passage, question.text),
      section: "قطع",
      type: "قطع لفظي",
      difficulty: "غير محدد",
      skill: passage.title,
      state: "جاهزة",
      href: `/exam?section=verbal_reading&passageId=${passage.id}&question=${index}`,
      kind: "question" as const,
      pieceNumber: getPassagePieceNumber(passage.id),
      needsReview: false,
    })),
  );
}

export function getReadingPassageSummariesSync(): ReadingPassageSummary[] {
  return readingPassages.map(mapPassageToSummary);
}

export function getPassageDetailSync(passageId: string | number) {
  const normalizedId = String(passageId);
  const passage = readingPassages.find((item) => item.id === normalizedId);
  return passage ? mapPassageToDetail(passage) : null;
}

export function getReadingKeywordDirectory(filters: { query?: string; limit?: number } = {}) {
  const query = filters.query?.trim() ?? "";
  const limit = Math.min(Math.max(Number(filters.limit ?? 24), 1), 200);

  return verbalReadingKeywords
    .filter((keyword) => !query || fuzzyMatch(getKeywordHaystack(keyword), query))
    .map((keyword) => mapKeywordToDirectoryItem(keyword, query))
    .slice(0, limit);
}

export async function getBankItems(filters: SearchFilters = {}) {
  const query = filters.query?.trim() ?? "";
  const type = filters.type?.trim() ?? "الكل";

  const items: BankItem[] = [...verbalSections, ...quantitativeSections].map((section) => ({
    id: section.id,
    title: section.title,
    count: 0,
    level: EMPTY_SECTION_MESSAGE,
    type: section.href?.includes("verbal") ? "لفظي" : "كمي",
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

  const questionItems = mapReadingQuestionsToSearchItems().filter((item) => {
    const matchesQuery = !query || fuzzyMatch(`${item.text} ${item.skill} ${item.excerpt ?? ""}`, query);
    const matchesSection = section === "الكل" || item.section === section;
    const matchesType = type === "الكل" || item.type === type;
    return matchesQuery && matchesSection && matchesType;
  });

  const passageItems = !query
    ? []
    : readingPassages
        .filter((passage) => fuzzyMatch(`${passage.title} ${passage.passage}`, query))
        .map((passage) => ({
          id: passage.id,
          text: passage.title,
          title: passage.title,
          excerpt: createSnippet(passage.passage, query),
          section: "قطع",
          type: "قطعة كاملة",
          difficulty: "غير محدد",
          skill: passage.title,
          state: "جاهزة",
          href: `/exam?section=verbal_reading&passageId=${passage.id}`,
          kind: "passage" as const,
          pieceNumber: getPassagePieceNumber(passage.id),
          questionCount: passage.questions.length,
          needsReview: false,
        }));

  const passageHrefSet = new Set(passageItems.map((item) => item.href));
  const keywordItems = !query
    ? []
    : getReadingKeywordDirectory({ query, limit }).flatMap((item) => {
        if (item.href && passageHrefSet.has(item.href)) {
          return [];
        }

        return [
          {
            id: item.id,
            text: item.title,
            title: item.title,
            excerpt: item.excerpt,
            section: "قطع",
            type: item.kind === "passage" ? "قطعة لفظية" : "عنوان قطعة",
            difficulty: item.status === "linked" ? "جاهزة" : "بانتظار الإضافة",
            skill: item.title,
            state: item.status === "linked" ? "مرتبطة" : "كلمة مفتاحية",
            href:
              item.href ??
              `/question-bank?track=verbal&keyword=${encodeURIComponent(item.title)}#verbal-reading-search`,
            kind: item.kind,
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
