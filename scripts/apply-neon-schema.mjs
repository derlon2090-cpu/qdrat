import fs from "node:fs/promises";
import path from "node:path";

import { neon } from "@neondatabase/serverless";

const rootDir = process.cwd();
const envPath = path.join(rootDir, ".env.local");
const databaseDir = path.join(rootDir, "database");

async function loadDatabaseUrl() {
  const envContent = await fs.readFile(envPath, "utf8");
  const match = envContent.match(/^DATABASE_URL="?(.*)"?$/m);

  if (!match?.[1]) {
    throw new Error("DATABASE_URL was not found in .env.local");
  }

  return match[1].trim();
}

function splitStatements(schema) {
  const statements = [];
  let current = "";
  let inSingleQuote = false;
  let inDoubleQuote = false;
  let dollarTag = null;

  for (let index = 0; index < schema.length; index += 1) {
    const char = schema[index];
    const next = schema[index + 1];

    if (!inDoubleQuote && char === "'" && schema[index - 1] !== "\\") {
      inSingleQuote = !inSingleQuote;
      current += char;
      continue;
    }

    if (!inSingleQuote && char === '"' && schema[index - 1] !== "\\") {
      inDoubleQuote = !inDoubleQuote;
      current += char;
      continue;
    }

    if (!inSingleQuote && !inDoubleQuote && char === "$") {
      const rest = schema.slice(index);
      const tagMatch = rest.match(/^\$([A-Za-z0-9_]*)\$/);

      if (tagMatch) {
        const tag = tagMatch[0];
        current += tag;
        index += tag.length - 1;

        if (dollarTag === tag) {
          dollarTag = null;
        } else if (dollarTag === null) {
          dollarTag = tag;
        }

        continue;
      }
    }

    if (!inSingleQuote && !inDoubleQuote && !dollarTag && char === "-" && next === "-") {
      while (index < schema.length && schema[index] !== "\n") {
        current += schema[index];
        index += 1;
      }

      if (index < schema.length) {
        current += "\n";
      }

      continue;
    }

    if (!inSingleQuote && !inDoubleQuote && !dollarTag && char === "/" && next === "*") {
      current += char;
      current += next;
      index += 2;

      while (index < schema.length && !(schema[index] === "*" && schema[index + 1] === "/")) {
        current += schema[index];
        index += 1;
      }

      if (index < schema.length) {
        current += "*/";
        index += 1;
      }

      continue;
    }

    if (!inSingleQuote && !inDoubleQuote && !dollarTag && char === ";") {
      const statement = current.trim();

      if (statement) {
        statements.push(`${statement};`);
      }

      current = "";
      continue;
    }

    current += char;
  }

  const trailing = current.trim();

  if (trailing) {
    statements.push(trailing.endsWith(";") ? trailing : `${trailing};`);
  }

  return statements;
}

async function main() {
  const databaseUrl = await loadDatabaseUrl();
  const sql = neon(databaseUrl);
  const files = ["schema.sql", "seed.sql"];
  let appliedStatements = 0;

  for (const fileName of files) {
    const filePath = path.join(databaseDir, fileName);
    try {
      const content = await fs.readFile(filePath, "utf8");
      const statements = splitStatements(content);

      for (const statement of statements) {
        await sql.query(statement);
      }

      appliedStatements += statements.length;
    } catch (error) {
      if (fileName === "seed.sql") {
        continue;
      }

      throw error;
    }
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
        appliedStatements,
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
