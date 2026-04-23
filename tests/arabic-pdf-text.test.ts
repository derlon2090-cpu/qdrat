import assert from "node:assert/strict";

import { normalizeExtractedArabicPdfText } from "../src/lib/arabic-pdf-text";

assert.equal(
  normalizeExtractedArabicPdfText("الأمانة خلق وفلاح"),
  "الأمانة خلق وفلاح",
);

assert.equal(
  normalizeExtractedArabicPdfText("حالفو قلخ ةنامألا"),
  "الأمانة خلق وفلاح",
);

assert.equal(
  normalizeExtractedArabicPdfText("ا ل أ م ا ن ة خلق وفلاح"),
  "الأمانة خلق وفلاح",
);

assert.equal(
  normalizeExtractedArabicPdfText("\u202bالأمانة خلق وفلاح\u202c"),
  "الأمانة خلق وفلاح",
);

console.log("Arabic PDF text normalization tests passed.");
