import {
  verbalReadingOnlyQuestions,
  type VerbalPracticeQuestion,
} from "./verbal-mixed-bank";

export type ImportedLocalVerbalPassageQuestion = {
  id: string;
  text: string;
  options: string[];
  correctAnswer: string;
  explanations: Record<string, string>;
};

export type ImportedLocalVerbalPassage = {
  id: string;
  slug: string;
  source: string;
  title: string;
  keywords: string[];
  pieceNumber: number;
  passage: string;
  questions: ImportedLocalVerbalPassageQuestion[];
};

type ImportedPassageDefinition = {
  source: string;
  title: string;
  slug: string;
  keywords: string[];
  passage: string;
};

const importedPassageDefinitions: ImportedPassageDefinition[] = [
  {
    source: "قطعة سالك",
    title: "قطعة سالك",
    slug: "salk-vaccine",
    keywords: ["قطعة سالك", "سالك", "اللقاح", "شلل الأطفال"],
    passage:
      "في مستهل عام 1945م أعلن سالك عن اكتشافه لقاحًا تحت التجريب، وكانت الفيروسات التي يحتوي عليها قد قُتلت. وقد تم حقنه لعدد من الأطفال ضد مرض شلل الأطفال، وأوضح أن اللقاح لا خطر منه. وبدأ بنفسه فأعطاه لأولاده وزوجته تأكيدًا على جديته ودوره في سلامة الإنسان. ثم دخل اللقاح بعد ذلك مرحلة التجريب المجتمعي، فأُعطي لطلاب المدارس في عام 1954م، ثم أُعلن عن سلامته وقدرته العالية في الوقاية. وأنتجت أكثر من مئة دولة الأمصال لذلك، ونال سالك شكرًا كبيرًا من الرئيس دوايت أيزنهاور والميدالية الذهبية للكونجرس مقابل مساهمته الكبيرة في حقل الطب، كما رفض الجوائز النقدية وعاد إلى معمله ليعمل على تحسين هذا اللقاح.",
  },
  {
    source: "قطعة أمريكا واليابان",
    title: "قطعة أمريكا واليابان",
    slug: "america-japan-work-civilization",
    keywords: ["قطعة أمريكا واليابان", "أمريكا واليابان", "حضارة العمل", "اليابان"],
    passage:
      "حضارة العصر المدهشة هي حضارة العمل والمهارة والتقنية أكثر مما هي حضارة العلم والثقافة، فلا يعجب الكاتب ذلك الحنين الشرقي العبثي الذي يظن أن المجتمع الأمريكي قد حقق حضارته بالعلم وحده، بل يرى أن العمل والمهارة في الأداء كانا أقوى أثرًا. كما أن نتائج الاستطلاعات التي تجرى على الشعوب الأمريكية تدل على أن كثيرًا منهم لا يعرفون كثيرًا عن البلدان الأخرى أو المشاهير أو الأحداث الكبرى التي قد تمر بجانبهم مباشرة. وليس اليابانيون الذين يعشقون التفوق التقني المدهش وحققوا هذا الازدهار الاقتصادي الباذخ بعيدين عن ذلك؛ إذ يعانون كذلك محدودية الثقافة أو العمق العلمي، لكنهم غزوا العالم بالعمل والانضباط في السلوك والمهارة في الأداء والإخلاص في الجهد.",
  },
  {
    source: "قطعة اصبر على ما يشيعه عنك مبغضوك",
    title: "قطعة اصبر على ما يشيعه عنك مبغضوك",
    slug: "ignore-haters-and-reform-yourself",
    keywords: ["اصبر على ما يشيعه عنك مبغضوك", "المبغضون", "ظهور الحق"],
    passage:
      "اصبر على ما يشيعه عنك مبغضوك، ثم انظر فيما يقولون؛ فإن كان حقًا فأصلح نفسك، وإن كان باطلًا فلا تشك في أن الله يظهر الحق ولو بعد حين. والمعنى أن الإنسان لا يرفض كل ما يقوله خصومه، بل يتأمله؛ فما كان فيه حق نفعه في إصلاح نفسه، وما كان كذبًا وباطلًا فإن الحق سيظهر عاجلًا أو آجلًا.",
  },
  {
    source: "قطعة لبن الشجر",
    title: "قطعة لبن الشجر",
    slug: "tree-latex",
    keywords: ["لبن الشجر", "المطاط", "الأشجار"],
    passage:
      "لبن الشجر هو سائل حليبي طبيعي تفرزه الأشجار، ينشأ في النباتات لحمايتها ضد الحشرات ولسد الجروح التي قد تصيب جذوع الأشجار. ويستخرج غالبًا من شجرة المطاط، ويعد المصدر الرئيس للمطاط الطبيعي، ويستخدم في صناعات عدة مثل الدهانات والملابس. ويُفهم من ذلك أن الشجر يفرز هذا السائل دفاعًا عن نفسه ولمعالجة ما يصيبه.",
  },
  {
    source: "قطعة مهرجان الثقافات والشعوب",
    title: "قطعة مهرجان الثقافات والشعوب",
    slug: "festival-of-cultures-and-peoples",
    keywords: ["مهرجان الثقافات والشعوب", "الجامعة الإسلامية", "التراث الإنساني"],
    passage:
      "تنظم الجامعة الإسلامية مهرجان الثقافات والشعوب في نسخته الحادية عشرة بمشاركة أكثر من 88 جنسية من طلاب الجامعة، ويستمر عشرة أيام. ويعد المهرجان ظاهرة ثقافية فريدة تنظمها الجامعة سنويًا، ويعرض من خلاله الطلاب أبرز ثقافات بلدانهم وتراثها وأزيائها وتقاليدها عبر أركان مخصصة لكل دولة. كما يتيح المهرجان فرصة للتعارف والحوار والتعايش ونشر السلام والمحبة بين الشعوب والثقافات، وهو يقام منذ عقد من الزمن.",
  },
  {
    source: "قطعة صاعد بن أحمد التغلبي",
    title: "قطعة صاعد بن أحمد التغلبي",
    slug: "saaed-bin-ahmad-altaghalabi",
    keywords: ["صاعد بن أحمد التغلبي", "طبقات الأمم", "صاعد الأندلسي"],
    passage:
      "كان صاعد بن أحمد التغلبي في الأربعين من عمره حين أنجز كتابه \"طبقات الأمم\" وهو الكتاب الرابع والأخير من أعماله، إذ توفي بعد سنتين من تأليفه عام 462هـ. وله ثلاثة كتب مفقودة في علم الرصد والملل والنحل والتاريخ. وقد توجه إلى طليطلة طلبًا للعلم سنة 438هـ، وعاش في كنف أميرها، وتولى القضاء فيها. وفي كتابه \"طبقات الأمم\" حاول استكمال ما بدأه أستاذه ابن حزم حول دور الأندلس في إنتاج العلوم والتعريف بأهم الشخصيات الفكرية وتاريخ العلوم وتطور الأفكار واتصال الثقافات.",
  },
  {
    source: "قطعة غربان نيوزلندا",
    title: "قطعة غربان نيوزلندا",
    slug: "new-zealand-crows",
    keywords: ["غربان نيوزلندا", "الطيور", "التكامل"],
    passage:
      "غربان نيوزلندا من أغرب ما رآه علماء الأحياء؛ إذ يوجد اختلاف بين مناقير الإناث والذكور. فالذكور تنقر الشجرة بمنقارها الحاد لتصل إلى الديدان، ثم تأتي الأنثى بمنقارها الطويل المعقوف لتلتقطها. ويكشف هذا السلوك صورة من صور التكامل بين الذكر والأنثى في الحصول على الغذاء.",
  },
  {
    source: "قطعة الوقود البيولوجي من الطحالب",
    title: "قطعة الوقود البيولوجي من الطحالب",
    slug: "biofuel-from-algae",
    keywords: ["الوقود البيولوجي", "الطحالب", "الطاقة"],
    passage:
      "من الممكن استخراج الوقود البيولوجي ليحل محل الوقود التقليدي من الطحالب، لكن التجارب ما زالت في بدايتها. وهذا يدل على أن إنتاج الطاقة من الطحالب ممكن من حيث الأصل، إلا أنه يحتاج إلى وقت وتجارب وتطوير قبل أن يصبح معتمدًا على نطاق واسع.",
  },
  {
    source: "قطعة النظام الغذائي",
    title: "قطعة النظام الغذائي",
    slug: "healthy-diet-mindset",
    keywords: ["النظام الغذائي", "الغذاء الصحي", "اختيار الطعام"],
    passage:
      "حين تفكر في البدء في نظام غذائي للتقليل من الوزن الزائد، فكر في ذلك على أنه سلوك تجاه الأكل، بدلًا من التفكير في إشباع رغبة ملحة تعود بعد إشباعها. وفكر في الأكل على أنه وسيلة تساعد جسمك لكي يعمل، وأكثر من الأطعمة الصحية لتعيش حياة صحية. فالفكرة ليست مجرد تقليل الطعام، وإنما حسن اختيار الطعام والنظر إليه بوصفه أسلوب حياة.",
  },
  {
    source: "قطعة البيئة والثورة الصناعية",
    title: "قطعة البيئة والثورة الصناعية",
    slug: "environment-and-industrial-revolution",
    keywords: ["البيئة والثورة الصناعية", "الثورة الصناعية", "التلوث"],
    passage:
      "الحال المستقر للنظام البيئي الأرضي لم يدم؛ فمع تفجر الثورة الصناعية في مطالع القرن التاسع عشر ثم ازدهارها في القرن العشرين، وما رافقها من إنتاج صناعي وتجاري كثيف وانفجار سكاني واستهلاك متزايد للموارد، ظهر اختلال واضح في النظام البيئي ينذر بعواقب وخيمة. وتبدو ضريبة الثورة الصناعية جلية في المشكلات البيئية العالمية اليوم، إلى جانب الظواهر الطبيعية مثل الأعاصير والزلازل والفيضانات والسيول. ومع ذلك يتزايد الوعي الإنساني بالخطر من خلال المؤتمرات والندوات والدعوات البيئية.",
  },
  {
    source: "قطعة الزعفران",
    title: "قطعة الزعفران",
    slug: "saffron",
    keywords: ["الزعفران", "الكاروتين", "السرطان"],
    passage:
      "الزعفران يستخدم في الطب التقليدي كمنشط، وفي اليابان يوضع في كبسولات للمساعدة على النوم، كما تستعمله الأبحاث الحديثة في الحماية من السرطان وفقدان الذاكرة وأمراض القلب. ويحتوي الزعفران مادة برتقالية غامقة تذوب في الماء تسمى الكاروتين، ولها تأثير مضاد للأكسدة ومضاد للأورام، وقد دلت بعض الأبحاث على أنها تساعد خلايا المناعة على القضاء على الخلايا السرطانية.",
  },
];

const knownPassageSources = new Set(
  importedPassageDefinitions.map((definition) => definition.source),
);

const fallbackQuestionMarkers = [
  "أفضل عنوان",
  "أنسب عنوان",
  "يفهم من النص",
  "نفهم من النص",
  "حسب النص",
  "معنى",
  "العلاقة",
  "علاقة",
  "ما الكلمة",
  "الضمير",
  "يمكن استبدال",
  "تشير",
  "تدل",
  "يعبر النص",
  "جملة",
];

function buildQuestionExplanations(question: VerbalPracticeQuestion) {
  return Object.fromEntries(
    question.options.map((option) => [
      option,
      option === question.correctAnswer
        ? question.explanation
        : "هذا الخيار غير صحيح وفق المعنى والسياق المعتمدين لهذا السؤال.",
    ]),
  );
}

function mapReadingQuestion(
  question: VerbalPracticeQuestion,
  index: number,
): ImportedLocalVerbalPassageQuestion {
  return {
    id: `${question.id}-reading-${index + 1}`,
    text: question.prompt,
    options: question.options,
    correctAnswer: question.correctAnswer,
    explanations: buildQuestionExplanations(question),
  };
}

function normalizeSpaces(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function deriveFallbackTitle(question: VerbalPracticeQuestion, index: number) {
  const condensed = normalizeSpaces(question.prompt);
  const leadingText = condensed.slice(0, 44).trim();
  const prefix = question.source.startsWith("المراجعة")
    ? `قطعة لفظية ${String(index + 1).padStart(3, "0")}`
    : "قطعة لفظية";
  return leadingText ? `${prefix}: ${leadingText}${condensed.length > 44 ? "..." : ""}` : prefix;
}

function splitPromptIntoPassageAndQuestion(prompt: string) {
  const condensed = normalizeSpaces(prompt);

  for (const marker of fallbackQuestionMarkers) {
    const markerIndex = condensed.indexOf(marker);
    if (markerIndex > 18) {
      return {
        passageText: condensed.slice(0, markerIndex).trim(),
        questionText: condensed.slice(markerIndex).trim(),
      };
    }
  }

  return {
    passageText: condensed,
    questionText: "اختر الإجابة الصحيحة اعتمادًا على النص.",
  };
}

const readingQuestionsBySource = verbalReadingOnlyQuestions.reduce(
  (map, question) => {
    const items = map.get(question.source) ?? [];
    items.push(question);
    map.set(question.source, items);
    return map;
  },
  new Map<string, VerbalPracticeQuestion[]>(),
);

const groupedImportedPassages: ImportedLocalVerbalPassage[] = importedPassageDefinitions
  .map((definition, definitionIndex) => {
    const questions = readingQuestionsBySource.get(definition.source) ?? [];
    if (!questions.length) return null;

    return {
      id: `imported-passage-${definition.slug}`,
      slug: definition.slug,
      source: definition.source,
      title: definition.title,
      keywords: definition.keywords,
      pieceNumber: definitionIndex + 1,
      passage: definition.passage,
      questions: questions.map(mapReadingQuestion),
    } satisfies ImportedLocalVerbalPassage;
  })
  .filter((passage): passage is ImportedLocalVerbalPassage => Boolean(passage));

const uncoveredReadingQuestions = verbalReadingOnlyQuestions.filter(
  (question) => !knownPassageSources.has(question.source),
);

const derivedSingleQuestionPassages: ImportedLocalVerbalPassage[] =
  uncoveredReadingQuestions.map((question, index) => {
    const splitPrompt = splitPromptIntoPassageAndQuestion(question.prompt);
    const title = deriveFallbackTitle(question, index);

    return {
      id: `derived-reading-passage-${question.id}`,
      slug: `derived-reading-${question.id}`,
      source: question.source,
      title,
      keywords: [question.source, title],
      pieceNumber: groupedImportedPassages.length + index + 1,
      passage: splitPrompt.passageText,
      questions: [
        {
          id: `${question.id}-derived-question`,
          text: splitPrompt.questionText,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanations: buildQuestionExplanations(question),
        },
      ],
    };
  });

export const importedLocalVerbalPassages: ImportedLocalVerbalPassage[] = [
  ...groupedImportedPassages,
  ...derivedSingleQuestionPassages,
];
