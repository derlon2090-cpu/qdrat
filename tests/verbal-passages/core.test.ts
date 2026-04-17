import assert from "node:assert/strict";

import {
  generatePassageSlug,
  parsePassageImportFile,
  planImportActions,
  searchPassagesLocal,
  type ExistingPassageFingerprint,
} from "../../src/lib/verbal-passages-core";

function runTest(name: string, fn: () => void) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

runTest("should not return results for 1 or 2 chars", () => {
  const passages = [
    {
      id: "1",
      title: "قطعة الزيت",
      keywords: ["الزيت", "قطعة الزيت"],
      passageText: "نص القطعة",
      status: "published" as const,
      questions: [],
    },
  ];

  assert.deepEqual(searchPassagesLocal(passages, "ا"), []);
  assert.deepEqual(searchPassagesLocal(passages, "ال"), []);
});

runTest("should return results for 3+ chars", () => {
  const passages = [
    {
      id: "1",
      title: "قطعة الزيت",
      keywords: ["الزيت", "قطعة الزيت"],
      passageText: "نص القطعة",
      status: "published" as const,
      questions: [],
    },
    {
      id: "2",
      title: "قطعة الأشجار",
      keywords: ["الأشجار", "قطعة الأشجار"],
      passageText: "نص القطعة",
      status: "published" as const,
      questions: [],
    },
  ];

  const results = searchPassagesLocal(passages, "الزي");
  assert.equal(results.length, 1);
  assert.equal(results[0]?.title, "قطعة الزيت");
});

runTest("should link questions to the correct passage", () => {
  const csv = `title,keywords,passage_text,question_text,option_a,option_b,option_c,option_d,correct_option
قطعة الزيت,"الزيت|قطعة الزيت","نص القطعة الأولى","سؤال 1","أ1","ب1","ج1","د1","A"
قطعة الزيت,"الزيت|قطعة الزيت","نص القطعة الأولى","سؤال 2","أ2","ب2","ج2","د2","B"
قطعة الأشجار,"الأشجار|قطعة الأشجار","نص القطعة الثانية","سؤال 3","أ3","ب3","ج3","د3","C"`;

  const parsed = parsePassageImportFile("passages.csv", csv);

  assert.equal(parsed.failedRows.length, 0);
  assert.equal(parsed.records.length, 2);
  assert.equal(parsed.records[0]?.title, "قطعة الزيت");
  assert.equal(parsed.records[0]?.questions.length, 2);
  assert.equal(parsed.records[1]?.title, "قطعة الأشجار");
  assert.equal(parsed.records[1]?.questions.length, 1);
});

runTest("should avoid duplicate insertions", () => {
  const existing: ExistingPassageFingerprint[] = [
    {
      id: "existing-1",
      title: "قطعة الزيت",
      keywords: ["الزيت", "قطعة الزيت"],
      passageText: "نص القطعة هنا",
      status: "published",
      version: 1,
      externalSourceId: "seed-oil",
      questions: [
        {
          questionText: "ما الفكرة الرئيسية؟",
          optionA: "أ",
          optionB: "ب",
          optionC: "ج",
          optionD: "د",
          correctOption: "C",
          explanation: null,
        },
      ],
    },
  ];

  const actions = planImportActions(existing, [
    {
      title: "قطعة الزيت",
      keywords: ["الزيت", "قطعة الزيت"],
      passageText: "نص القطعة هنا",
      status: "published",
      externalSourceId: "seed-oil",
      version: 1,
      questions: [
        {
          questionText: "ما الفكرة الرئيسية؟",
          optionA: "أ",
          optionB: "ب",
          optionC: "ج",
          optionD: "د",
          correctOption: "C",
          explanation: null,
        },
      ],
    },
  ]);

  assert.equal(actions.length, 1);
  assert.equal(actions[0]?.action, "skip");
});

runTest("should preserve an explicit slug when provided", () => {
  const slug = generatePassageSlug({
    slug: "abu-hayyan",
    title: "قطعة أبو حيان",
    externalSourceId: "seed-abu-hayyan",
  });

  assert.equal(slug, "abu-hayyan");
});

runTest("should fall back to source-based slug when explicit slug is missing", () => {
  const slug = generatePassageSlug({
    title: "قطعة الزيت",
    externalSourceId: "sample-json-oil",
  });

  assert.equal(slug, "oil");
});

console.log("All verbal passage unit checks passed.");
