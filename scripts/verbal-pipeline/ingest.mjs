import path from "path";
import {
  ensurePipelineDirs,
  extractPdfAsRaw,
  getRawOutputPath,
  listPdfFiles,
  toSlug,
  writeJson,
} from "./shared.mjs";

async function main() {
  await ensurePipelineDirs();
  const files = await listPdfFiles();

  if (!files.length) {
    console.log("No PDF files found in data/raw.");
    return;
  }

  for (const file of files) {
    const slug = toSlug(file);
    const raw = await extractPdfAsRaw(file);
    const outputPath = getRawOutputPath(slug);

    await writeJson(outputPath, raw);

    console.log(
      JSON.stringify(
        {
          ok: true,
          stage: "ingest",
          source: path.basename(file),
          slug,
          totalPages: raw.totalPages,
          outputPath,
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
