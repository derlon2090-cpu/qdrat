import { getSqlClient } from "@/lib/db";

export type UserAccountOverview = {
  userId: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  role: "student" | "admin" | "editor" | "coach";
  isActive: boolean;
  lastLoginAt: string | null;
  userCreatedAt: string;
  userUpdatedAt: string;
  targetScore: number | null;
  examDate: string | null;
  dailyMinutes: number | null;
  currentLevel: string | null;
  verbalScore: number | null;
  quantitativeScore: number | null;
  overallScore: number | null;
  planName: string | null;
  subscriptionStatus: string | null;
  subscriptionStartsAt: string | null;
  subscriptionEndsAt: string | null;
  activeSessions: number;
  lastSessionSeenAt: string | null;
  totalMistakes: number;
  quantitativeMistakes: number;
  verbalMistakes: number;
};

type UserAccountOverviewRow = {
  user_id: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  role: UserAccountOverview["role"];
  is_active: boolean;
  last_login_at: string | null;
  user_created_at: string;
  user_updated_at: string;
  target_score: number | null;
  exam_date: string | null;
  daily_minutes: number | null;
  current_level: string | null;
  verbal_score: number | null;
  quantitative_score: number | null;
  overall_score: number | null;
  plan_name: string | null;
  subscription_status: string | null;
  subscription_starts_at: string | null;
  subscription_ends_at: string | null;
  active_sessions: number;
  last_session_seen_at: string | null;
  total_mistakes: number;
  quantitative_mistakes: number;
  verbal_mistakes: number;
};

function getSql() {
  return getSqlClient();
}

function mapUserAccount(row: UserAccountOverviewRow): UserAccountOverview {
  return {
    userId: row.user_id,
    fullName: row.full_name,
    email: row.email,
    phone: row.phone,
    role: row.role,
    isActive: row.is_active,
    lastLoginAt: row.last_login_at,
    userCreatedAt: row.user_created_at,
    userUpdatedAt: row.user_updated_at,
    targetScore: row.target_score,
    examDate: row.exam_date,
    dailyMinutes: row.daily_minutes,
    currentLevel: row.current_level,
    verbalScore: row.verbal_score,
    quantitativeScore: row.quantitative_score,
    overallScore: row.overall_score,
    planName: row.plan_name,
    subscriptionStatus: row.subscription_status,
    subscriptionStartsAt: row.subscription_starts_at,
    subscriptionEndsAt: row.subscription_ends_at,
    activeSessions: row.active_sessions,
    lastSessionSeenAt: row.last_session_seen_at,
    totalMistakes: row.total_mistakes,
    quantitativeMistakes: row.quantitative_mistakes,
    verbalMistakes: row.verbal_mistakes,
  };
}

export async function listUserAccountsOverview() {
  const sql = getSql();
  const rows = (await sql.query(`
    select
      user_id::text,
      full_name,
      email,
      phone,
      role,
      is_active,
      last_login_at::text,
      user_created_at::text,
      user_updated_at::text,
      target_score,
      exam_date::text,
      daily_minutes,
      current_level::text,
      verbal_score,
      quantitative_score,
      overall_score,
      plan_name,
      subscription_status::text,
      subscription_starts_at::text,
      subscription_ends_at::text,
      active_sessions,
      last_session_seen_at::text,
      total_mistakes,
      quantitative_mistakes,
      verbal_mistakes
    from app_user_accounts_overview
    order by user_created_at desc
  `)) as UserAccountOverviewRow[];

  return rows.map(mapUserAccount);
}
