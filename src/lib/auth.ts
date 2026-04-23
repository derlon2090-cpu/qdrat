import { createHash, randomBytes } from "node:crypto";

import type { NextRequest, NextResponse } from "next/server";

import {
  AUTH_COOKIE_NAME,
  type AuthSessionPayload,
  type AuthSessionUser,
  type UserGender,
} from "@/lib/auth-shared";
import { getSqlClient } from "@/lib/db";
import {
  hashPassword,
  isCurrentPasswordHash,
  normalizePasswordInput,
  resolveVerifiedPasswordCandidate,
} from "@/lib/password";

const SESSION_TTL_DAYS = 30;
const SESSION_TTL_MS = SESSION_TTL_DAYS * 24 * 60 * 60 * 1000;

type DbUserRow = {
  id: string;
  email: string | null;
  phone: string | null;
  full_name: string;
  gender: UserGender | null;
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

function normalizePhoneDigits(value: string) {
  return value.replace(/\D/g, "");
}

function extractSaudiMobileDigits(phoneDigits: string) {
  if (!phoneDigits) return null;

  if (phoneDigits.startsWith("00966")) {
    const remainingDigits = phoneDigits.slice(5);
    return /^5\d{8}$/.test(remainingDigits) ? remainingDigits : null;
  }

  if (phoneDigits.startsWith("966")) {
    const remainingDigits = phoneDigits.slice(3);
    return /^5\d{8}$/.test(remainingDigits) ? remainingDigits : null;
  }

  if (phoneDigits.startsWith("05")) {
    const remainingDigits = phoneDigits.slice(1);
    return /^5\d{8}$/.test(remainingDigits) ? remainingDigits : null;
  }

  return /^5\d{8}$/.test(phoneDigits) ? phoneDigits : null;
}

function normalizeStoredPhone(value: string) {
  const normalizedPhone = normalizePhone(value);
  const saudiMobileDigits = extractSaudiMobileDigits(normalizePhoneDigits(normalizedPhone));
  return saudiMobileDigits ?? normalizedPhone;
}

function buildPhoneLookupVariants(value: string) {
  const exactVariants = new Set<string>();
  const digitVariants = new Set<string>();

  const addVariant = (candidate: string) => {
    const normalizedCandidate = candidate.trim();
    if (!normalizedCandidate) return;

    exactVariants.add(normalizedCandidate);

    const digits = normalizePhoneDigits(normalizedCandidate);
    if (digits) {
      digitVariants.add(digits);
    }
  };

  const normalizedPhone = normalizePhone(value);
  addVariant(value);
  addVariant(normalizedPhone);

  const saudiMobileDigits = extractSaudiMobileDigits(normalizePhoneDigits(normalizedPhone));
  if (saudiMobileDigits) {
    addVariant(saudiMobileDigits);
    addVariant(`0${saudiMobileDigits}`);
    addVariant(`966${saudiMobileDigits}`);
    addVariant(`+966${saudiMobileDigits}`);
    addVariant(`00966${saudiMobileDigits}`);
  }

  return {
    exact: Array.from(exactVariants),
    digits: Array.from(digitVariants),
  };
}

function createPlaceholderEmail(phone: string) {
  const digits = phone.replace(/[^\d]/g, "");
  return `phone-${digits}@miyaar.local`;
}

function mapDbUser(
  row: Pick<DbUserRow, "id" | "email" | "phone" | "full_name" | "gender" | "role">,
): AuthSessionUser {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email?.endsWith("@miyaar.local") ? null : row.email,
    phone: row.phone,
    gender: row.gender,
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

type AuthenticatedSession = {
  user: AuthSessionUser;
  token: string;
  expiresAt: Date;
};

async function createSession(userId: string, request: NextRequest) {
  const sql = getSql();
  const token = randomBytes(32).toString("hex");
  const sessionTokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);

  await sql.query(
    `
      insert into app_user_sessions (
        user_id,
        session_token_hash,
        user_agent,
        ip_address,
        expires_at
      )
      values ($1, $2, $3, $4, $5::timestamptz)
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

function shouldUseSecureCookie(request?: NextRequest) {
  if (!request) {
    return process.env.NODE_ENV === "production";
  }

  const forwardedProto = request.headers
    .get("x-forwarded-proto")
    ?.split(",")[0]
    ?.trim()
    ?.toLowerCase();

  if (forwardedProto) {
    return forwardedProto === "https";
  }

  const hostname = request.nextUrl.hostname.toLowerCase();
  if (hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1") {
    return false;
  }

  return request.nextUrl.protocol === "https:";
}

export function setAuthCookie(
  response: NextResponse,
  token: string,
  expiresAt: Date,
  request?: NextRequest,
) {
  response.cookies.set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCookie(request),
    path: "/",
    maxAge: SESSION_TTL_DAYS * 24 * 60 * 60,
    expires: expiresAt,
  });
}

export function clearAuthCookie(response: NextResponse, request?: NextRequest) {
  response.cookies.set(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: shouldUseSecureCookie(request),
    path: "/",
    maxAge: 0,
    expires: new Date(0),
  });
}

export async function deleteSessionByToken(token: string | null | undefined) {
  if (!token) return;
  const sql = getSql();
  await sql.query(`delete from app_user_sessions where session_token_hash = $1`, [sha256(token)]);
}

async function getAuthenticatedSessionFromRequest(request: NextRequest): Promise<AuthenticatedSession | null> {
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
        u.gender,
        u.role,
        sessions.expires_at
      from app_user_sessions sessions
      inner join app_users u on u.id::text = sessions.user_id::text
      where sessions.session_token_hash = $1
        and sessions.expires_at > now()
        and u.is_active = true
      limit 1
    `,
    [sha256(token)],
  )) as Array<
    Pick<DbUserRow, "id" | "email" | "phone" | "full_name" | "gender" | "role"> & {
      expires_at: string | Date;
    }
  >;

  const row = rows[0];
  if (!row) {
    return null;
  }

  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await sql.query(
    `
      update app_user_sessions
      set
        last_seen_at = now(),
        expires_at = $2::timestamptz
      where session_token_hash = $1
    `,
    [sha256(token), expiresAt.toISOString()],
  );

  return {
    user: mapDbUser(row),
    token,
    expiresAt,
  };
}

export async function getAuthenticatedUserFromRequest(request: NextRequest) {
  const session = await getAuthenticatedSessionFromRequest(request);
  return session?.user ?? null;
}

export async function getSessionContextFromRequest(request: NextRequest) {
  return getAuthenticatedSessionFromRequest(request);
}

export async function buildSessionPayload(request: NextRequest): Promise<AuthSessionPayload> {
  const session = await getAuthenticatedSessionFromRequest(request);

  return {
    authenticated: Boolean(session?.user),
    user: session?.user ?? null,
    expiresAt: session?.expiresAt.toISOString() ?? null,
  };
}

export async function registerUser(input: {
  fullName: string;
  email?: string;
  phone?: string;
  password: string;
  gender?: UserGender | "";
}) {
  const sql = getSql();
  const fullName = input.fullName.trim();
  const email = input.email ? normalizeEmail(input.email) : "";
  const phone = input.phone ? normalizeStoredPhone(input.phone) : "";
  const phoneLookup = buildPhoneLookupVariants(phone);
  const normalizedPassword = normalizePasswordInput(input.password);
  const gender = input.gender === "male" || input.gender === "female" ? input.gender : null;

  if (!fullName) {
    throw new Error("الاسم الكامل مطلوب لإنشاء الحساب.");
  }

  if (!email && !phone) {
    throw new Error("أدخل البريد الإلكتروني أو رقم الجوال على الأقل.");
  }

  if (!gender) {
    throw new Error("اختر الجنس قبل إنشاء الحساب.");
  }

  if (normalizedPassword.length < 6) {
    throw new Error("كلمة المرور يجب أن تكون 6 أحرف على الأقل.");
  }

  const existingRows = (await sql.query(
    `
      select id::text, email, phone, full_name, gender, role, password_hash
      from app_users
      where ($1::text <> '' and lower(email) = $1)
         or (cardinality($2::text[]) > 0 and phone = any($2::text[]))
         or (
           cardinality($3::text[]) > 0
           and regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g') = any($3::text[])
         )
      limit 1
    `,
    [email, phoneLookup.exact, phoneLookup.digits],
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
        gender,
        password_hash,
        role
      )
      values ($1, $2, $3, $4::app_user_gender, $5, 'student')
      returning id::text, email, phone, full_name, gender, role, password_hash
    `,
    [resolvedEmail, phone || null, fullName, gender, hashPassword(normalizedPassword)],
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
  const phoneLookup = buildPhoneLookupVariants(identifier);
  const normalizedPassword = normalizePasswordInput(input.password);

  if (!identifier) {
    throw new Error("أدخل البريد الإلكتروني أو رقم الجوال.");
  }

  const rows = (await sql.query(
    `
      select id::text, email, phone, full_name, gender, role, password_hash
      from app_users
      where lower(email) = $1
         or (cardinality($2::text[]) > 0 and phone = any($2::text[]))
         or (
           cardinality($3::text[]) > 0
           and regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g') = any($3::text[])
         )
      limit 1
    `,
    [normalizedEmail, phoneLookup.exact, phoneLookup.digits],
  )) as DbUserRow[];

  const row = rows[0];
  const verifiedPasswordCandidate = row
    ? resolveVerifiedPasswordCandidate(input.password, row.password_hash)
    : null;

  if (!row || !verifiedPasswordCandidate) {
    throw new Error("بيانات تسجيل الدخول غير صحيحة.");
  }

  const passwordNeedsUpgrade =
    !isCurrentPasswordHash(row.password_hash) ||
    verifiedPasswordCandidate !== normalizedPassword;

  if (passwordNeedsUpgrade) {
    await sql.query(
      `
        update app_users
        set
          last_login_at = now(),
          password_hash = $2
        where id::text = $1
      `,
      [row.id, hashPassword(normalizedPassword)],
    );
  } else {
    await sql.query(
      `
        update app_users
        set last_login_at = now()
        where id::text = $1
      `,
      [row.id],
    );
  }

  return mapDbUser(row);
}

export async function createSessionForUser(userId: string, request: NextRequest) {
  return createSession(userId, request);
}
