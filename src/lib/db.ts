import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { neon } from "@neondatabase/serverless";

export type DatabaseHealth = {
  configured: boolean;
  connected: boolean;
  message: string;
  database?: string;
  user?: string;
  host?: string;
  checkedAt?: string;
};

const DATABASE_ENV_KEYS = [
  "DATABASE_URL",
  "POSTGRES_URL",
  "POSTGRES_URL_NON_POOLING",
  "POSTGRES_URL_NO_SSL",
  "POSTGRES_PRISMA_URL",
  "NEON_DATABASE_URL",
] as const;

const ENV_FILE_CANDIDATES = [
  ".env.local",
  ".env.development.local",
  ".env.production.local",
  ".env",
  ".env.development",
  ".env.production",
] as const;

let cachedDatabaseUrlFromFile: string | undefined;
const ensuredUuidColumns = new Set<string>();

function stripWrappingQuotes(value: string) {
  return value.replace(/^["']|["']$/g, "").replace(/\s+/g, "").trim();
}

function readDatabaseUrlFromEnvFiles() {
  if (cachedDatabaseUrlFromFile) {
    return cachedDatabaseUrlFromFile;
  }

  for (const fileName of ENV_FILE_CANDIDATES) {
    const filePath = join(/* turbopackIgnore: true */ process.cwd(), fileName);
    if (!existsSync(filePath)) continue;

    const content = readFileSync(filePath, "utf8");
    const lines = content.split(/\r?\n/);

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith("#")) continue;

      const normalizedLine = trimmedLine.startsWith("export ") ? trimmedLine.slice(7).trim() : trimmedLine;
      const separatorIndex = normalizedLine.indexOf("=");
      if (separatorIndex === -1) continue;

      const key = normalizedLine.slice(0, separatorIndex).trim();
      if (!DATABASE_ENV_KEYS.includes(key as (typeof DATABASE_ENV_KEYS)[number])) continue;

      const value = stripWrappingQuotes(normalizedLine.slice(separatorIndex + 1));
      if (!value) continue;

      cachedDatabaseUrlFromFile = value;
      return value;
    }
  }

  return null;
}

export function getDatabaseUrl() {
  for (const key of DATABASE_ENV_KEYS) {
    const value = process.env[key]?.trim();
    if (value) {
      return stripWrappingQuotes(value);
    }
  }

  return readDatabaseUrlFromEnvFiles();
}

export function getSqlClient() {
  const databaseUrl = getDatabaseUrl();

  if (!databaseUrl) {
    throw new Error(
      "تعذر العثور على رابط قاعدة البيانات. أضف DATABASE_URL أو POSTGRES_URL أو POSTGRES_URL_NON_POOLING داخل ملفات البيئة ثم أعد تشغيل الخادم إذا لزم.",
    );
  }

  return neon(databaseUrl);
}

function assertSqlIdentifier(identifier: string) {
  if (!/^[a-z_][a-z0-9_]*$/i.test(identifier)) {
    throw new Error(`Invalid SQL identifier: ${identifier}`);
  }

  return identifier;
}

type EnsureUuidColumnOptions = {
  nullable?: boolean;
};

export async function ensureColumnIsUuid(
  tableName: string,
  columnName: string,
  options: EnsureUuidColumnOptions = {},
) {
  const safeTableName = assertSqlIdentifier(tableName);
  const safeColumnName = assertSqlIdentifier(columnName);
  const cacheKey = `${safeTableName}.${safeColumnName}.${options.nullable !== false ? "nullable" : "required"}`;

  if (ensuredUuidColumns.has(cacheKey)) {
    return;
  }

  const sql = getSqlClient();
  const columnRows = (await sql.query(
    `
      select
        data_type,
        udt_name,
        is_nullable,
        column_default
      from information_schema.columns
      where table_schema = 'public'
        and table_name = $1
        and column_name = $2
      limit 1
    `,
    [safeTableName, safeColumnName],
  )) as Array<{
    data_type: string;
    udt_name: string;
    is_nullable: "YES" | "NO";
    column_default: string | null;
  }>;

  const column = columnRows[0];

  if (!column) {
    return;
  }

  const isUuid = column.data_type === "uuid" || column.udt_name === "uuid";

  if (!isUuid) {
    await sql.query(`
      alter table ${safeTableName}
      alter column ${safeColumnName} drop default,
      alter column ${safeColumnName} type uuid
      using nullif(trim(${safeColumnName}::text), '')::uuid
    `);

    if (column.column_default) {
      await sql.query(`
        alter table ${safeTableName}
        alter column ${safeColumnName} set default ${column.column_default}
      `);
    }
  }

  if (options.nullable === false) {
    await sql.query(`
      alter table ${safeTableName}
      alter column ${safeColumnName} set not null
    `);
  }

  ensuredUuidColumns.add(cacheKey);
}

export async function getDatabaseHealth(): Promise<DatabaseHealth> {
  const databaseUrl = getDatabaseUrl();

  if (!databaseUrl) {
    return {
      configured: false,
      connected: false,
      message:
        "رابط قاعدة البيانات غير موجود بعد. أضف DATABASE_URL أو POSTGRES_URL أو POSTGRES_URL_NON_POOLING داخل ملفات البيئة لتفعيل الربط.",
    };
  }

  try {
    const sql = getSqlClient();
    const rows = (await sql`
      select current_database() as database, current_user as db_user, now()::text as checked_at
    `) as Array<{
      database: string;
      db_user: string;
      checked_at: string;
    }>;

    const [row] = rows;

    return {
      configured: true,
      connected: true,
      message: "تم الوصول إلى قاعدة بيانات Neon بنجاح.",
      database: row?.database,
      user: row?.db_user,
      host: new URL(databaseUrl).host,
      checkedAt: row?.checked_at,
    };
  } catch (error) {
    return {
      configured: true,
      connected: false,
      message:
        error instanceof Error
          ? `تعذر الاتصال بقاعدة البيانات: ${error.message}`
          : "تعذر الاتصال بقاعدة البيانات لسبب غير معروف.",
    };
  }
}
