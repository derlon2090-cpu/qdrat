export type QuestionBankSectionItem = {
  id: string;
  title: string;
  description: string;
  href?: string;
};

export const verbalSections: QuestionBankSectionItem[] = [
  {
    id: "verbal_sentence_completion",
    title: "إكمال الجمل",
    description: "جمل ناقصة تحتاج إلى اختيار ما يتم المعنى الصحيح ويكمل السياق.",
    href: "/verbal/practice?category=sentence_completion",
  },
  {
    id: "verbal_reading_comprehension",
    title: "الاستيعاب المقروء",
    description: "القطعة مع أسئلتها المرتبطة بها، مثل الفكرة العامة والعنوان والاستنتاج وما يفهم من النص.",
    href: "/verbal/reading",
  },
  {
    id: "verbal_odd_word",
    title: "المفردة الشاذة",
    description: "اختيار الكلمة المختلفة عن بقية المجموعة بعد تحديد الرابط بين الكلمات المتشابهة.",
    href: "/verbal/practice?category=odd_word",
  },
  {
    id: "verbal_contextual_error",
    title: "الخطأ السياقي",
    description: "تحديد الكلمة أو العبارة غير المنسجمة مع المعنى المقصود.",
    href: "/verbal/practice?category=contextual_error",
  },
  {
    id: "verbal_analogy",
    title: "التناظر اللفظي",
    description: "أسئلة العلاقات اللفظية بين زوجين، ثم اختيار الزوج الذي يحمل العلاقة نفسها.",
    href: "/verbal/practice?category=analogy",
  },
];

export const quantitativeSections: QuestionBankSectionItem[] = [];
