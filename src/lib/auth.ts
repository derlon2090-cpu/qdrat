import { createHash, randomBytes } from "node:crypto";

import type { NextRequest, NextResponse } from "next/server";

import { AUTH_COOKIE_NAME, type AuthSessionPayload, type AuthSessionUser } from "@/lib/auth-shared";
import { getSqlClient } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/password";

const SESSION_TTL_DAYS = 30;

type DbUserRow = {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string;
  role: AuthSessionUser["role"];
  password_hash: string | null;
};

function getSql() {
  return getSqlClient();
}

function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

function normalizePhone(value: string) {
  const cleaned = value.replace(/[^\d+]/g, "").trim();
  if (!cleaned) return "";
  if (cleaned.startsWith("+")) {
    return `+${cleaned.slice(1).replace(/\D/g, "")}`;
  }
  return cleaned.replace(/\D/g, "");
}

function createPlaceholderEmail(phone: string) {
  const digits = phone.replace(/[^\d]/g, "");
  return `phone-${digits}@miyaar.local`;
}

function mapDbUser(row: Pick<DbUserRow, "id" | "email" | "phone" | "full_name" | "role">): AuthSessionUser {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email?.endsWith("@miyaar.local") ? null : row.email,
    phone: row.phone,
    role: row.role,
  };
}

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? null;
  }

  return request.headers.get("x-real-ip");
}

async function createSession(userId: string, request: NextRequest) {
  const sql = getSql();
  const token = randomBytes(32).toString("hex");
  const sessionTokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_DAYS * 24 * 60 * 60 * 1000);

  await sql.query(
    `
      insert into app_user_sessions (
        user_id,
        session_token_hash,
        user_agent,
        ip_address,
        expires_at
      )
      values ($1::uuid, $2, $3, $4, $5::timestamptz)
    `,
    [
      userId,
      sessionTokenHash,
      request.headers.get("user-agent"),
      getClientIp(request),
      expiresAt.toISOString(),
    ],
  );

  return {
    token,
    expiresAt,
  };
}

export function setAuthCookie(response: NextResponse, token: string, expiresAt: Date) {
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export function clearAuthCookie(response: NextResponse) {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}

export async function deleteSessionByToken(token: string | null | undefined) {
  if (!token) return;
  const sql = getSql();
  await sql.query(`delete from app_user_sessions where session_token_hash = $1`, [sha256(token)]);
}

export async function getAuthenticatedUserFromRequest(request: NextRequest) {
  const token = request.cookies.get(AUTH_COOKIE_NAME)?.value?.trim();
  if (!token) return null;

  const sql = getSql();
  const rows = (await sql.query(
    `
      select
        u.id::text,
        u.email,
        u.phone,
        u.full_name,
        u.role
      from app_user_sessions sessions
      inner join app_users u on u.id = sessions.user_id
      where sessions.session_token_hash = $1
        and sessions.expires_at > now()
        and u.is_active = true
      limit 1
    `,
    [sha256(token)],
  )) as Array<Pick<DbUserRow, "id" | "email" | "phone" | "full_name" | "role">>;

  const row = rows[0];
  if (!row) {
    return null;
  }

  await sql.query(
    `
      update app_user_sessions
      set last_seen_at = now()
      where session_token_hash = $1
    `,
    [sha256(token)],
  );

  return mapDbUser(row);
}

export async function buildSessionPayload(request: NextRequest): Promise<AuthSessionPayload> {
  const user = await getAuthenticatedUserFromRequest(request);

  return {
    authenticated: Boolean(user),
    user,
  };
}

export async function registerUser(input: {
  fullName: string;
  email?: string;
  phone?: string;
  password: string;
}) {
  const sql = getSql();
  const fullName = input.fullName.trim();
  const email = input.email ? normalizeEmail(input.email) : "";
  const phone = input.phone ? normalizePhone(input.phone) : "";

  if (!fullName) {
    throw new Error("الاسم الكامل مطلوب لإنشاء الحساب.");
  }

  if (!email && !phone) {
    throw new Error("أدخل البريد الإلكتروني أو رقم الجوال على الأقل.");
  }

  if (input.password.trim().length < 6) {
    throw new Error("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
  }

  const existingRows = (await sql.query(
    `
      select id::text, email, phone, full_name, role, password_hash
      from app_users
      where ($1::text <> '' and lower(email) = $1)
         or ($2::text <> '' and phone = $2)
      limit 1
    `,
    [email, phone],
  )) as DbUserRow[];

  if (existingRows[0]) {
    throw new Error("يوجد حساب مسجل مسبقًا بهذا البريد أو رقم الجوال.");
  }

  const resolvedEmail = email || createPlaceholderEmail(phone);
  const insertedRows = (await sql.query(
    `
      insert into app_users (
        email,
        phone,
        full_name,
        password_hash,
        role
      )
      values ($1, $2, $3, $4, 'student')
      returning id::text, email, phone, full_name, role, password_hash
    `,
    [resolvedEmail, phone || null, fullName, hashPassword(input.password)],
  )) as DbUserRow[];

  const row = insertedRows[0];
  if (!row) {
    throw new Error("تعذر إنشاء الحساب حاليًا.");
  }

  return mapDbUser(row);
}

export async function authenticateUser(input: { identifier: string; password: string }) {
  const sql = getSql();
  const identifier = input.identifier.trim();
  const normalizedEmail = normalizeEmail(identifier);
  const normalizedPhone = normalizePhone(identifier);

  if (!identifier) {
    throw new Error("أدخل البريد الإلكتروني أو رقم الجوال.");
  }

  const rows = (await sql.query(
    `
      select id::text, email, phone, full_name, role, password_hash
      from app_users
      where lower(email) = $1
         or phone = $2
      limit 1
    `,
    [normalizedEmail, normalizedPhone],
  )) as DbUserRow[];

  const row = rows[0];
  if (!row || !verifyPassword(input.password, row.password_hash)) {
    throw new Error("بيانات تسجيل الدخول غير صحيحة.");
  }

  await sql.query(
    `
      update app_users
      set last_login_at = now()
      where id = $1::uuid
    `,
    [row.id],
  );

  return mapDbUser(row);
}

export async function createSessionForUser(userId: string, request: NextRequest) {
  return createSession(userId, request);
}
