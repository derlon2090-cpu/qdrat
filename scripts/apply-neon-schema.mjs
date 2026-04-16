import fs from "node:fs/promises";
import path from "node:path";

import { neon } from "@neondatabase/serverless";

const rootDir = process.cwd();
const envPath = path.join(rootDir, ".env.local");
const schemaPath = path.join(rootDir, "database", "schema.sql");

async function loadDatabaseUrl() {
  const envContent = await fs.readFile(envPath, "utf8");
  const match = envContent.match(/^DATABASE_URL="?(.*)"?$/m);

  if (!match?.[1]) {
    throw new Error("DATABASE_URL was not found in .env.local");
  }

  return match[1].trim();
}

function splitStatements(schema) {
  return schema
    .split(/;\s*\r?\n/g)
    .map((statement) => statement.trim())
    .filter(Boolean)
    .map((statement) => `${statement};`);
}

async function main() {
  const databaseUrl = await loadDatabaseUrl();
  const schema = await fs.readFile(schemaPath, "utf8");
  const statements = splitStatements(schema);
  const sql = neon(databaseUrl);

  for (const statement of statements) {
    await sql.query(statement);
  }

  const result = await sql.query(
    `select count(*)::int as total_tables
     from information_schema.tables
     where table_schema = 'public'
       and table_name like 'app_%'`,
  );

  console.log(
    JSON.stringify(
      {
        ok: true,
        appliedStatements: statements.length,
        totalAppTables: result[0]?.total_tables ?? 0,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        ok: false,
        message: error instanceof Error ? error.message : String(error),
      },
      null,
      2,
    ),
  );
  process.exit(1);
});
