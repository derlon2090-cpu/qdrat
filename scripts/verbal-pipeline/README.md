# Verbal PDF Pipeline

This pipeline processes large Arabic verbal reading-comprehension banks in five stages:

1. `npm run ingest`
   - Reads PDF files from `data/raw`
   - Extracts page-level lines using `pdf2json`
   - Writes raw JSON into `data/parsed/*.raw.json`

2. `npm run parse`
   - Detects passages (`قطعة`) and linked questions
   - Normalizes choices into a reusable JSON structure
   - Flags low-confidence items for manual review

3. `npm run validate`
   - Enforces structural rules such as exactly four options
   - Produces `data/reports/*.report.json`
   - Updates `data/reports/latest-verbal-report.json`

4. `npm run publish`
   - Publishes normalized passages/questions/options/reviews into Neon PostgreSQL
   - Requires `DATABASE_URL` in `.env.local`

The current default parses the first `20` passages per source.
Override it per run:

```powershell
$env:MAX_PASSAGES='12'; npm run parse
```
