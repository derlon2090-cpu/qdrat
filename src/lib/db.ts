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

let cachedDatabaseUrlFromFile: string | undefined;

function stripWrappingQuotes(value: string) {
  return value.replace(/^["']|["']$/g, "").trim();
}

function readDatabaseUrlFromEnvFiles() {
  if (cachedDatabaseUrlFromFile) {
    return cachedDatabaseUrlFromFile;
  }

  const candidateFiles = [
    join(/* turbopackIgnore: true */ process.cwd(), ".env.local"),
    join(/* turbopackIgnore: true */ process.cwd(), ".env"),
  ];

  for (const filePath of candidateFiles) {
    if (!existsSync(filePath)) continue;

    const content = readFileSync(filePath, "utf8");
    const lines = content.split(/\r?\n/);

    for (const line of lines) {
      const trimmedLine = line.trim();
      if (!trimmedLine || trimmedLine.startsWith("#")) continue;

      const separatorIndex = trimmedLine.indexOf("=");
      if (separatorIndex === -1) continue;

      const key = trimmedLine.slice(0, separatorIndex).trim();
      if (!DATABASE_ENV_KEYS.includes(key as (typeof DATABASE_ENV_KEYS)[number])) continue;

      const value = stripWrappingQuotes(trimmedLine.slice(separatorIndex + 1));
      if (value) {
        cachedDatabaseUrlFromFile = value;
        return value;
      }
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
      "تعذر العثور على رابط قاعدة البيانات. أضف DATABASE_URL أو POSTGRES_URL داخل .env.local ثم أعد تشغيل الخادم إذا لزم.",
    );
  }

  return neon(databaseUrl);
}

export async function getDatabaseHealth(): Promise<DatabaseHealth> {
  const databaseUrl = getDatabaseUrl();

  if (!databaseUrl) {
    return {
      configured: false,
      connected: false,
      message: "رابط قاعدة البيانات غير موجود بعد. أضف DATABASE_URL أو POSTGRES_URL داخل .env.local لتفعيل الربط.",
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
