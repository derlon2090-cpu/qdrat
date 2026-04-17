export type ManualReadingQuestion = {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanations: Record<string, string>;
};

export type ManualReadingPassage = {
  id: string;
  source: string;
  title: string;
  passage: string;
  questions: ManualReadingQuestion[];
};

export type ManualSection = {
  id: string;
  title: string;
  description: string;
  href?: string;
};

export const EMPTY_SECTION_MESSAGE = "لا توجد أسئلة حاليًا، سيتم إضافتها قريبًا";

export const readingPassages: ManualReadingPassage[] = [];

export const verbalSections: ManualSection[] = [];

export const quantitativeSections: ManualSection[] = [];
