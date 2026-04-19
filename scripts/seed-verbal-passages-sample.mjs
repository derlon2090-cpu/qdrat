import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";

import { neon } from "@neondatabase/serverless";

function normalizeArabicText(value) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[ً-ْ]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function stripWrappingQuotes(value) {
  return String(value ?? "").replace(/^['"]|['"]$/g, "").trim();
}

async function readDatabaseUrl() {
  const envPath = path.join(process.cwd(), ".env.local");
  const content = await readFile(envPath, "utf8");
  const match = content.match(/^DATABASE_URL=(.*)$/m);
  const url = match ? stripWrappingQuotes(match[1]) : "";

  if (!url) {
    throw new Error("DATABASE_URL is missing in .env.local");
  }

  return url;
}

async function ensureUniqueSlug(sql, desiredSlug, currentId = null) {
  const baseSlug = desiredSlug.trim() || "passage";
  let candidate = baseSlug;
  let counter = 2;

  while (true) {
    const rows = await sql`
      select id::text
      from app_verbal_passages
      where slug = ${candidate}
        and (${currentId}::uuid is null or id <> ${currentId}::uuid)
      limit 1
    `;

    if (!rows[0]) {
      return candidate;
    }

    candidate = `${baseSlug}-${counter}`;
    counter += 1;
  }
}

async function upsertPassage(sql, row) {
  const normalizedTitle = normalizeArabicText(row.title);
  const normalizedPassageText = normalizeArabicText(row.passage_text);
  const keywords = Array.from(
    new Set(
      [row.title, row.slug.replace(/-/g, " "), ...(row.keywords ?? [])]
        .map((item) => String(item ?? "").trim())
        .filter(Boolean),
    ),
  );
  const keywordSearch = normalizeArabicText(keywords.join(" "));
  const titleHash = sha256(normalizedTitle);
  const passageHash = sha256(normalizedPassageText);

  const existingRows = await sql`
    select id::text, slug
    from app_verbal_passages
    where title_hash = ${titleHash}
      and passage_hash = ${passageHash}
    limit 1
  `;

  const existingId = existingRows[0]?.id ?? null;
  const safeSlug = await ensureUniqueSlug(sql, row.slug, existingId);

  const savedRows = await sql`
    insert into app_verbal_passages (
      slug,
      title,
      normalized_title,
      keywords,
      keyword_search,
      passage_text,
      normalized_passage_text,
      title_hash,
      passage_hash,
      status,
      external_source_id,
      version,
      raw_payload
    )
    values (
      ${safeSlug},
      ${row.title},
      ${normalizedTitle},
      ${keywords}::text[],
      ${keywordSearch},
      ${row.passage_text},
      ${normalizedPassageText},
      ${titleHash},
      ${passageHash},
      ${row.status === "draft" ? "draft" : "published"}::app_publish_status,
      ${row.external_source_id ?? `sample-json-${safeSlug}`},
      ${Number.isInteger(row.version) && row.version > 0 ? row.version : 1},
      ${JSON.stringify({
        source: "sample-json",
        keywords,
      })}::jsonb
    )
    on conflict (title_hash, passage_hash)
    do update set
      slug = excluded.slug,
      title = excluded.title,
      normalized_title = excluded.normalized_title,
      keywords = excluded.keywords,
      keyword_search = excluded.keyword_search,
      passage_text = excluded.passage_text,
      normalized_passage_text = excluded.normalized_passage_text,
      status = excluded.status,
      external_source_id = excluded.external_source_id,
      version = excluded.version,
      raw_payload = excluded.raw_payload,
      updated_at = now()
    returning id::text, slug, title
  `;

  const saved = savedRows[0];
  if (!saved?.id) {
    throw new Error(`Failed to save passage: ${row.title}`);
  }

  await sql`delete from app_verbal_passage_questions where passage_id = ${saved.id}::uuid`;

  const questions = Array.isArray(row.questions) ? row.questions : [];
  for (const [index, question] of questions.entries()) {
    await sql`
      insert into app_verbal_passage_questions (
        passage_id,
        question_order,
        question_text,
        option_a,
        option_b,
        option_c,
        option_d,
        correct_option,
        explanation
      )
      values (
        ${saved.id}::uuid,
        ${index + 1},
        ${question.question_text},
        ${question.option_a},
        ${question.option_b},
        ${question.option_c},
        ${question.option_d},
        ${question.correct_option},
        ${question.explanation ?? null}
      )
    `;
  }

  return {
    id: saved.id,
    slug: saved.slug,
    title: saved.title,
    questionCount: questions.length,
  };
}

async function main() {
  const databaseUrl = await readDatabaseUrl();
  const sql = neon(databaseUrl);
  const dataPath = path.join(process.cwd(), "data", "verbal-passages.sample.json");
  const rows = JSON.parse(await readFile(dataPath, "utf8"));

  if (!Array.isArray(rows) || rows.length === 0) {
    throw new Error("No sample verbal passages found.");
  }

  const results = [];
  for (const row of rows) {
    results.push(await upsertPassage(sql, row));
  }

  const countRows = await sql`select count(*)::int as count from app_verbal_passages`;
  const questionCountRows = await sql`select count(*)::int as count from app_verbal_passage_questions`;

  console.log(
    JSON.stringify(
      {
        ok: true,
        importedPassages: results.length,
        totalPassagesInDatabase: countRows[0]?.count ?? 0,
        totalQuestionsInDatabase: questionCountRows[0]?.count ?? 0,
        passages: results.map((item) => ({
          title: item.title,
          slug: item.slug,
          questionCount: item.questionCount,
        })),
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
