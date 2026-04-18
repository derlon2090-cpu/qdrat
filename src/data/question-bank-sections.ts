export type QuestionBankSectionItem = {
  id: string;
  title: string;
  description: string;
  href?: string;
};

export const verbalSections: QuestionBankSectionItem[] = [
  {
    id: "verbal_passages",
    title: "القطع اللفظي",
    description: "بنك القطع اللفظية مع البحث بالكلمات المفتاحية وفتح القطعة نفسها مع أسئلتها.",
    href: "/verbal/reading",
  },
  {
    id: "verbal_analogy",
    title: "تناظر لفظي",
    description: "أسئلة العلاقات اللفظية والترادف والتقابل مرتبة في مسار تدريب مستقل.",
    href: "/verbal/practice?category=analogy",
  },
  {
    id: "verbal_sentence_completion",
    title: "إكمال الجمل",
    description: "جمل ناقصة من البنوك المرسلة، مع تصحيح بعد التأكيد وشرح مختصر.",
    href: "/verbal/practice?category=sentence_completion",
  },
  {
    id: "verbal_contextual_error",
    title: "الخطأ السياقي",
    description: "تحديد الكلمة غير المنسجمة مع معنى الجملة داخل قسم مستقل وواضح.",
    href: "/verbal/practice?category=contextual_error",
  },
  {
    id: "verbal_odd_word",
    title: "المفردة الشاذة",
    description: "أسئلة اختيار الكلمة المختلفة عن المجموعة مع شرح سبب الاختيار الصحيح.",
    href: "/verbal/practice?category=odd_word",
  },
  {
    id: "verbal_short_reading",
    title: "استيعاب النصوص القصيرة",
    description: "أسئلة فهم النصوص القصيرة والعلاقات والمعاني والاستنتاجات داخل مسار لفظي مستقل.",
    href: "/verbal/practice?category=short_reading",
  },
];

export const quantitativeSections: QuestionBankSectionItem[] = [];
