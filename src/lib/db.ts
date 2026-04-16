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

function getDatabaseUrl() {
  return process.env.DATABASE_URL?.trim();
}

export async function getDatabaseHealth(): Promise<DatabaseHealth> {
  const databaseUrl = getDatabaseUrl();

  if (!databaseUrl) {
    return {
      configured: false,
      connected: false,
      message: "DATABASE_URL غير موجودة بعد. أضف رابط Neon داخل .env.local لتفعيل الربط.",
    };
  }

  try {
    const sql = neon(databaseUrl);
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
