import { neon } from "@neondatabase/serverless";
import {
  ensurePipelineDirs,
  getDatabaseUrl,
  getNormalizedOutputPath,
  getReportOutputPath,
  listPdfFiles,
  readJson,
  toSlug,
} from "./shared.mjs";

const REVIEW_BATCH_SIZE = 100;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRetry(task, attempts = 3) {
  let lastError = null;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await task();
    } catch (error) {
      lastError = error;
      if (attempt === attempts) {
        break;
      }

      await sleep(300 * attempt);
    }
  }

  throw lastError;
}

async function publishSource(sql, slug, normalized, report) {
  const source = normalized.source;

  const sourceRows = await withRetry(() => sql`
    insert into app_question_sources (
      source_slug,
      source_name,
      source_type,
      file_name,
      storage_path,
      notes,
      metadata
    )
    values (
      ${slug},
      ${source.title},
      ${source.sourceType},
      ${source.fileName},
      ${source.sourcePath},
      ${`Imported via verbal pipeline on ${new Date().toISOString()}`},
      ${JSON.stringify({
        totalPages: normalized.config.totalPages,
        totalPassages: normalized.passages.length,
        reviewQueueCount: report.summary.reviewQueueCount,
      })}
    )
    on conflict (source_slug) do update set
      source_name = excluded.source_name,
      source_type = excluded.source_type,
      file_name = excluded.file_name,
      storage_path = excluded.storage_path,
      notes = excluded.notes,
      metadata = excluded.metadata
    returning id
  `);

  return sourceRows[0].id;
}

async function recreateBank(sql, slug, totalQuestions) {
  const bankSlug = `${slug}-passages`;

  await withRetry(() => sql`delete from app_questions where question_code like ${`${slug}-p%`}`);
  await withRetry(() => sql`delete from app_question_banks where slug = ${bankSlug}`);

  const rows = await withRetry(() => sql`
    insert into app_question_banks (
      slug,
      title,
      subtitle,
      section,
      kind,
      question_type,
      description,
      total_questions,
      estimated_total_size,
      difficulty,
      is_published,
      search_priority
    )
    values (
      ${bankSlug},
      ${"بنك القطع اللفظية المستوردة"},
      ${"عينة منظّمة من ملف PDF مع تقرير تحقق ومراجعة"},
      ${"verbal"},
      ${"passage_bank"},
      ${"reading_passage"},
      ${"تم توليد هذا البنك عبر pipeline لاستخراج القطع وأسئلة الاستيعاب من ملفات PDF."},
      ${totalQuestions},
      ${totalQuestions},
      ${"medium"},
      ${true},
      ${10}
    )
    returning id
  `);

  return rows[0].id;
}

async function insertReviewItems(sql, items) {
  if (!items.length) {
    return;
  }

  for (let index = 0; index < items.length; index += REVIEW_BATCH_SIZE) {
    const chunk = items.slice(index, index + REVIEW_BATCH_SIZE);

    await withRetry(() =>
      sql.transaction(
        chunk.map((item) => sql`
          insert into app_extraction_reviews (
            source_id,
            passage_id,
            question_id,
            issue_type,
            issue_details,
            confidence_score,
            status
          )
          values (
            ${item.sourceId},
            ${item.passageId},
            ${item.questionId},
            ${item.issueType},
            ${item.issueDetails},
            ${item.confidenceScore},
            ${"pending"}
          )
        `),
      ),
    );
  }
}

async function main() {
  await ensurePipelineDirs();
  const databaseUrl = await getDatabaseUrl();

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is missing. Add it to .env.local before running publish.");
  }

  const files = await listPdfFiles();
  if (!files.length) {
    console.log("No PDF files found in data/raw.");
    return;
  }

  const sql = neon(databaseUrl);

  for (const file of files) {
    const slug = toSlug(file);
    const normalized = await readJson(getNormalizedOutputPath(slug));
    const report = await readJson(getReportOutputPath(slug));

    const sourceId = await publishSource(sql, slug, normalized, report);
    const bankId = await recreateBank(
      sql,
      slug,
      normalized.passages.reduce((sum, passage) => sum + passage.questions.length, 0),
    );
    const pendingReviews = [];

    for (const passage of normalized.passages) {
      const passageRows = await withRetry(() => sql`
        insert into app_passages (
          bank_id,
          source_id,
          piece_number,
          piece_title,
          title,
          passage_text,
          source_name,
          estimated_read_seconds,
          difficulty,
          raw_page_from,
          raw_page_to,
          parsing_confidence,
          needs_review,
          raw_payload
        )
        values (
          ${bankId},
          ${sourceId},
          ${passage.pieceNumber},
          ${passage.pieceTitle},
          ${passage.pieceTitle},
          ${passage.passageText},
          ${normalized.source.fileName},
          ${passage.estimatedReadSeconds},
          ${passage.difficulty},
          ${passage.rawPageFrom},
          ${passage.rawPageTo},
          ${passage.parsingConfidence},
          ${passage.needsReview},
          ${JSON.stringify({ category: passage.category })}
        )
        returning id
      `);

      const passageId = passageRows[0].id;
      const pendingChoiceStatements = [];

      for (const [questionIndex, question] of passage.questions.entries()) {
        const correctChoice = question.options.find((option) => option.isCorrect)?.optionKey ?? null;
        const questionCode = `${slug}-p${passage.pieceNumber ?? "x"}-q${questionIndex + 1}`;

        const questionRows = await withRetry(() => sql`
          insert into app_questions (
            bank_id,
            passage_id,
            source_id,
            question_code,
            section,
            question_type,
            difficulty,
            question_order,
            question_text,
            explanation,
            correct_choice_key,
            answer_source,
            answer_confidence,
            needs_review,
            is_published,
            raw_payload
          )
          values (
            ${bankId},
            ${passageId},
            ${sourceId},
            ${questionCode},
            ${"verbal"},
            ${"reading_passage"},
            ${"medium"},
            ${question.questionOrder},
            ${question.questionText},
            ${question.explanation},
            ${correctChoice},
            ${question.answerSource},
            ${question.answerConfidence},
            ${question.needsReview},
            ${true},
            ${JSON.stringify({ pieceTitle: passage.pieceTitle })}
          )
          on conflict (question_code) do update set
            bank_id = excluded.bank_id,
            passage_id = excluded.passage_id,
            source_id = excluded.source_id,
            section = excluded.section,
            question_type = excluded.question_type,
            difficulty = excluded.difficulty,
            question_order = excluded.question_order,
            question_text = excluded.question_text,
            explanation = excluded.explanation,
            correct_choice_key = excluded.correct_choice_key,
            answer_source = excluded.answer_source,
            answer_confidence = excluded.answer_confidence,
            needs_review = excluded.needs_review,
            is_published = excluded.is_published,
            raw_payload = excluded.raw_payload
          returning id
        `);

        const questionId = questionRows[0].id;

        for (const option of question.options) {
          pendingChoiceStatements.push(sql`
            insert into app_question_choices (
              question_id,
              choice_key,
              choice_text,
              is_correct,
              sort_order,
              color_hint
            )
            values (
              ${questionId},
              ${option.optionKey},
              ${option.optionText},
              ${option.isCorrect},
              ${option.displayOrder},
              ${option.colorHint}
            )
            on conflict (question_id, choice_key) do update set
              choice_text = excluded.choice_text,
              is_correct = excluded.is_correct,
              sort_order = excluded.sort_order,
              color_hint = excluded.color_hint
          `);
        }

        for (const item of report.reviewItems.filter(
          (item) => item.questionOrder === question.questionOrder && item.pieceNumber === passage.pieceNumber,
        )) {
          pendingReviews.push({
            sourceId,
            passageId,
            questionId,
            issueType: item.issueType,
            issueDetails: item.issueDetails,
            confidenceScore: item.confidence ?? 0,
          });
        }
      }

      if (pendingChoiceStatements.length) {
        await withRetry(() => sql.transaction(pendingChoiceStatements));
      }
    }

    await insertReviewItems(sql, pendingReviews);

    console.log(
      JSON.stringify(
        {
          ok: true,
          stage: "publish",
          slug,
          bankSlug: `${slug}-passages`,
          sourceId,
          totalPassages: normalized.passages.length,
          totalQuestions: normalized.passages.reduce((sum, passage) => sum + passage.questions.length, 0),
          reviewQueueCount: report.summary.reviewQueueCount,
        },
        null,
        2,
      ),
    );
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
