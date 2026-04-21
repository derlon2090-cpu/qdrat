export type QuestionBankSectionItem = {
  id: string;
  title: string;
  description: string;
  href?: string;
};

export const verbalSections: QuestionBankSectionItem[] = [
  {
    id: "verbal_passages",
    title: "قطع لفظي",
    description: "بنك القطع اللفظية مع النص نفسه وأسئلته المرتبطة به.",
    href: "/verbal/reading",
  },
  {
    id: "verbal_reading_comprehension",
    title: "فهم المقروء",
    description: "أسئلة الفكرة والعنوان والاستنتاج وما يفهم من النص أو الفقرة.",
    href: "/verbal/practice?category=reading_comprehension",
  },
  {
    id: "verbal_vocabulary",
    title: "المفردات",
    description: "معاني الكلمات والمرادف والضد والمقصود باللفظ داخل السياق.",
    href: "/verbal/practice?category=vocabulary",
  },
  {
    id: "verbal_linguistic_semantics",
    title: "الدلالة اللغوية",
    description: "الضمائر والعلاقات بين الجمل وما تفيده الكلمات والتراكيب.",
    href: "/verbal/practice?category=linguistic_semantics",
  },
  {
    id: "verbal_text_type",
    title: "تصنيف النص",
    description: "تمييز نوع النص مثل الحكمة والنصيحة والمقالة والقالب الفني.",
    href: "/verbal/practice?category=text_type",
  },
  {
    id: "verbal_analogy",
    title: "تناظر لفظي",
    description: "أسئلة العلاقات اللفظية والتشابه بين الأزواج.",
    href: "/verbal/practice?category=analogy",
  },
  {
    id: "verbal_sentence_completion",
    title: "إكمال الجمل",
    description: "جمل ناقصة تحتاج إلى اختيار ما يتم المعنى الصحيح.",
    href: "/verbal/practice?category=sentence_completion",
  },
  {
    id: "verbal_contextual_error",
    title: "الخطأ السياقي",
    description: "تحديد الكلمة أو العبارة غير المنسجمة مع المعنى المقصود.",
    href: "/verbal/practice?category=contextual_error",
  },
  {
    id: "verbal_odd_word",
    title: "المفردة الشاذة",
    description: "اختيار الكلمة المختلفة عن بقية المجموعة.",
    href: "/verbal/practice?category=odd_word",
  },
];

export const quantitativeSections: QuestionBankSectionItem[] = [];
