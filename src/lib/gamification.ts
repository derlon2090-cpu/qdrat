import { getSqlClient } from "@/lib/db";
import {
  applyActiveXpMultiplier,
  getXpMultiplierStatus,
  type XpMultiplierStatus,
} from "@/lib/gamification-rules";
import {
  resolveMistakeTrainingQuestions,
  type UserMistakeTrainingQuestion,
} from "@/lib/mistake-training";
import {
  ensureUserQuestionProgressSchema,
  getUserQuestionProgressTotals,
} from "@/lib/user-question-progress";
import { ensureUserMistakesSchema } from "@/lib/user-mistakes";
import { listUserMistakes } from "@/lib/user-mistakes";

export type LeaderboardPeriod = "daily" | "weekly" | "monthly";
export type GamificationEventType =
  | "streak_bonus"
  | "comeback_bonus"
  | "mistake_review"
  | "challenge_complete"
  | "high_score_bonus"
  | "exam_abandon"
  | "daily_mission"
  | "duel_win";

export type DuelTrack = "all" | "verbal" | "quantitative";

export type StudentLevelSummary = {
  id: string;
  label: string;
  minXp: number;
  maxXp: number | null;
  progressPercent: number;
  nextLevelLabel: string | null;
  xpToNextLevel: number;
};

export type StudentChallengeMission = {
  id: string;
  title: string;
  description: string;
  progress: number;
  target: number;
  rewardXp: number;
  completed: boolean;
  claimed: boolean;
  ctaLabel: string;
  href: string;
};

export type StudentChallengeAchievement = {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  progressLabel: string;
};

export type LeaderboardEntry = {
  userId: string;
  name: string;
  rank: number;
  xp: number;
  isCurrentUser: boolean;
  badgeLabel: string | null;
};

export type RankProtectionSummary = {
  active: boolean;
  protectedRank: number | null;
  label: string;
  description: string;
  defenseGap: number | null;
};

export type StudentChallengeDuel = {
  id: number;
  status: "active" | "completed" | "expired";
  role: "challenger" | "opponent";
  opponentUserId: string;
  opponentName: string;
  track: DuelTrack;
  questionCount: number;
  createdAt: string;
  expiresAt: string | null;
  myPercent: number | null;
  opponentPercent: number | null;
  myDurationMs: number | null;
  opponentDurationMs: number | null;
  winnerUserId: string | null;
  winnerName: string | null;
  canStart: boolean;
  startHref: string;
  resultLabel: string;
  bonusLabel: string;
};

export type LeaderboardBucket = {
  period: LeaderboardPeriod;
  label: string;
  participantsCount: number;
  currentUser: {
    rank: number | null;
    xp: number;
    nextRankGap: number | null;
    defenseGap: number | null;
  };
  entries: LeaderboardEntry[];
};

export type StudentChallengeData = {
  totalXp: number;
  questionXp: number;
  bonusXp: number;
  currentTitle: string;
  level: StudentLevelSummary;
  monthLabel: string;
  countdownLabel: string;
  endsAt: string;
  dailyXp: number;
  weeklyXp: number;
  monthlyXp: number;
  dailyRank: number | null;
  weeklyRank: number | null;
  monthlyRank: number | null;
  nextMonthlyRankGap: number | null;
  currentStreak: number;
  bestStreak: number;
  xpMultiplier: XpMultiplierStatus;
  rankProtection: RankProtectionSummary;
  duels: StudentChallengeDuel[];
  missions: StudentChallengeMission[];
  achievements: StudentChallengeAchievement[];
  leaderboards: Record<LeaderboardPeriod, LeaderboardBucket>;
};

export type TrainingSessionOutcomeInput = {
  sessionKey: string;
  mode: "standard" | "challenge" | "speed" | "bedtime" | "worst10";
  track: "all" | "verbal" | "quantitative";
  questionCount: number;
  percent: number;
  passed: boolean;
  abandoned?: boolean;
  duelId?: number | null;
  durationMs?: number | null;
};

export type AwardedXpEvent = {
  eventType: GamificationEventType;
  title: string;
  points: number;
};

const DAILY_STREAK_XP = 5;
const COMEBACK_BONUS_XP = 25;
const MISTAKE_REVIEW_XP = 15;
const CHALLENGE_COMPLETE_XP = 50;
const HIGH_SCORE_BONUS_XP = 30;
const EXAM_ABANDON_XP = -10;
const DUEL_WIN_BONUS_XP = 40;

const DAILY_MISSION_DEFINITIONS = [
  {
    id: "solve-10-questions",
    title: "حل 10 أسئلة",
    description: "أنهِ عشر أسئلة صحيحة أو محلولة اليوم حتى تحافظ على رتم التدريب اليومي.",
    target: 10,
    rewardXp: 20,
    href: "/question-bank",
    ctaLabel: "ابدأ حل الأسئلة",
  },
  {
    id: "review-5-mistakes",
    title: "راجع 5 أخطاء",
    description: "ارجع إلى أخطائك المتكررة، ومرّن نفسك على خمس منها على الأقل اليوم.",
    target: 5,
    rewardXp: 20,
    href: "/question-bank?track=mistakes#mistakes-trainer",
    ctaLabel: "ابدأ مراجعة الأخطاء",
  },
  {
    id: "earn-120-xp",
    title: "اجمع 120 XP",
    description: "ارفع إنجازك اليومي حتى تصل إلى 120 XP في يوم واحد.",
    target: 120,
    rewardXp: 30,
    href: "/challenge",
    ctaLabel: "تابع التحدي",
  },
] as const;

const LEVELS = [
  { id: "beginner", label: "مبتدئ", minXp: 0, maxXp: 999 },
  { id: "intermediate", label: "متوسط", minXp: 1000, maxXp: 4999 },
  { id: "advanced", label: "متقدم", minXp: 5000, maxXp: 9999 },
  { id: "expert", label: "خبير", minXp: 10000, maxXp: null },
] as const;

function getSql() {
  return getSqlClient();
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function addDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function toDayKey(date: Date) {
  return startOfDay(date).toISOString().slice(0, 10);
}

function diffInDays(left: Date, right: Date) {
  const leftMidnight = startOfDay(left).getTime();
  const rightMidnight = startOfDay(right).getTime();
  return Math.round((leftMidnight - rightMidnight) / (24 * 60 * 60 * 1000));
}

function getLeaderboardLabel(period: LeaderboardPeriod) {
  if (period === "daily") return "اليوم";
  if (period === "weekly") return "آخر 7 أيام";
  return "هذا الشهر";
}

function getPeriodWindow(period: LeaderboardPeriod, reference = new Date()) {
  const today = startOfDay(reference);

  if (period === "daily") {
    return {
      start: today,
      end: addDays(today, 1),
      label: "اليوم",
    };
  }

  if (period === "weekly") {
    return {
      start: addDays(today, -6),
      end: addDays(today, 1),
      label: "آخر 7 أيام",
    };
  }

  const monthStart = new Date(reference.getFullYear(), reference.getMonth(), 1);
  return {
    start: monthStart,
    end: addMonths(monthStart, 1),
    label: "هذا الشهر",
  };
}

function getMonthLabel(reference = new Date()) {
  return new Intl.DateTimeFormat("ar-SA", {
    month: "long",
    year: "numeric",
  }).format(reference);
}

function getMonthCountdown(reference = new Date()) {
  const monthEnd = addMonths(new Date(reference.getFullYear(), reference.getMonth(), 1), 1);
  const diffMs = monthEnd.getTime() - reference.getTime();
  const hours = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60)));
  const days = Math.floor(hours / 24);

  if (days > 1) {
    return {
      endsAt: monthEnd.toISOString(),
      countdownLabel: `باقي ${days} يوم على نهاية تحدي الشهر`,
    };
  }

  if (hours > 1) {
    return {
      endsAt: monthEnd.toISOString(),
      countdownLabel: `باقي ${hours} ساعة على نهاية تحدي الشهر`,
    };
  }

  return {
    endsAt: monthEnd.toISOString(),
    countdownLabel: "ينتهي تحدي الشهر اليوم",
  };
}

function describeLevel(totalXp: number): StudentLevelSummary {
  const normalizedXp = Math.max(0, Math.round(totalXp));
  const current =
    [...LEVELS].reverse().find((level) => normalizedXp >= level.minXp) ?? LEVELS[0];
  const next = LEVELS.find((level) => level.minXp > normalizedXp) ?? null;
  const span = next ? Math.max(1, next.minXp - current.minXp) : 1;
  const progressWithinLevel = next
    ? clamp(Math.round(((normalizedXp - current.minXp) / span) * 100), 0, 100)
    : 100;

  return {
    id: current.id,
    label: current.label,
    minXp: current.minXp,
    maxXp: current.maxXp,
    progressPercent: progressWithinLevel,
    nextLevelLabel: next?.label ?? null,
    xpToNextLevel: next ? Math.max(0, next.minXp - normalizedXp) : 0,
  };
}

function getCurrentTitle(monthlyRank: number | null, level: StudentLevelSummary) {
  if (monthlyRank === 1) return "خبير القدرات";
  if (monthlyRank != null && monthlyRank <= 10) return "النخبة";
  return level.label;
}

function getRankBadge(rank: number) {
  if (rank === 1) return "🥇 خبير القدرات";
  if (rank === 2) return "🥈 منافس قوي";
  if (rank === 3) return "🥉 ضمن القمة";
  if (rank <= 10) return "Top 10";
  return null;
}

function describeRankProtection(
  monthlyRank: number | null,
  defenseGap: number | null,
): RankProtectionSummary {
  if (monthlyRank == null || monthlyRank > 3) {
    return {
      active: false,
      protectedRank: null,
      label: "خارج الحماية",
      description: "ادخل المراكز الثلاثة الأولى حتى تتفعل حماية المركز تلقائيًا.",
      defenseGap: null,
    };
  }

  const rankLabel =
    monthlyRank === 1
      ? "حماية الصدارة"
      : monthlyRank === 2
        ? "حماية الوصافة"
        : "حماية المركز الثالث";

  return {
    active: true,
    protectedRank: monthlyRank,
    label: rankLabel,
    description:
      defenseGap != null && defenseGap > 0
        ? `تفوقك الحالي عن المركز التالي هو ${defenseGap.toLocaleString("en-US")} XP.`
        : "الفارق مع المركز التالي حساس جدًا، حاول رفع رصيدك اليوم.",
    defenseGap,
  };
}

function normalizeDuelTrack(track: string | null | undefined): DuelTrack {
  if (track === "verbal" || track === "quantitative") {
    return track;
  }

  return "all";
}

function buildDuelQuestionSnapshot(
  duelId: number,
  question: UserMistakeTrainingQuestion,
  index: number,
): UserMistakeTrainingQuestion {
  return {
    ...question,
    id: `duel-${duelId}-question-${index + 1}`,
    mistakeId: -1 * (index + 1),
    questionKey: `duel:${duelId}:${index + 1}:${question.questionKey}`,
    masteryState: "training",
    masteryPercent: 0,
    priorityScore: Math.max(1, question.priorityScore),
    incorrectCount: 0,
    correctCount: 0,
    removalThreshold: 99,
    trainingAttemptsCount: 0,
    trainingCorrectCount: 0,
  };
}

function pickDuelQuestions(
  questions: UserMistakeTrainingQuestion[],
  track: DuelTrack,
  questionCount: number,
) {
  const filteredQuestions = questions.filter((question) => {
    if (track === "all") return true;
    return question.section === track;
  });
  const pool = filteredQuestions.length ? filteredQuestions : questions;

  return [...pool]
    .sort((left, right) => {
      const masteryDelta = left.masteryState === right.masteryState
        ? 0
        : left.masteryState === "incorrect"
          ? -1
          : right.masteryState === "incorrect"
            ? 1
            : left.masteryState === "training"
              ? -1
              : 1;

      if (masteryDelta !== 0) return masteryDelta;
      if (right.priorityScore !== left.priorityScore) {
        return right.priorityScore - left.priorityScore;
      }
      if (right.incorrectCount !== left.incorrectCount) {
        return right.incorrectCount - left.incorrectCount;
      }
      return left.questionText.localeCompare(right.questionText, "ar");
    })
    .slice(0, Math.max(1, questionCount));
}

function buildDuelStartHref(duelId: number) {
  return `/question-bank?track=mistakes&duelId=${duelId}&duelStart=1#mistakes-trainer`;
}

function getDuelResultLabel(input: {
  status: "active" | "completed" | "expired";
  myPercent: number | null;
  opponentPercent: number | null;
  winnerUserId: string | null;
  currentUserId: string;
}) {
  if (input.status === "expired") {
    return "انتهت مهلة النزال";
  }

  if (input.status === "active") {
    return input.myPercent == null ? "دورك لتبدأ" : "بانتظار إنهاء الخصم";
  }

  if (!input.winnerUserId) {
    return "انتهى النزال بالتعادل";
  }

  return input.winnerUserId === input.currentUserId ? "فزت بالنزال" : "خسرت النزال";
}

async function getBonusXpTotal(userId: string) {
  const sql = getSql();
  const rows = (await sql.query(
    `
      select coalesce(sum(points), 0)::int as total_bonus_xp
      from app_user_gamification_events
      where user_id = $1::uuid
    `,
    [userId],
  )) as Array<{ total_bonus_xp: number }>;

  return rows[0]?.total_bonus_xp ?? 0;
}

async function getLatestActivityBefore(userId: string, referenceDate: Date) {
  const sql = getSql();
  const dayStart = startOfDay(referenceDate).toISOString();
  const rows = (await sql.query(
    `
      with activity_feed as (
        select coalesce(last_attempt_at, first_solved_at) as activity_at
        from app_user_question_progress
        where user_id = $1::uuid
          and coalesce(last_attempt_at, first_solved_at) is not null
          and coalesce(last_attempt_at, first_solved_at) < $2::timestamptz
        union all
        select created_at as activity_at
        from app_user_gamification_events
        where user_id = $1::uuid
          and created_at < $2::timestamptz
        union all
        select last_trained_at as activity_at
        from app_user_mistakes
        where user_id = $1::uuid
          and last_trained_at is not null
          and last_trained_at < $2::timestamptz
      )
      select max(activity_at)::text as last_activity_at
      from activity_feed
    `,
    [userId, dayStart],
  )) as Array<{ last_activity_at: string | null }>;

  return rows[0]?.last_activity_at ? new Date(rows[0].last_activity_at) : null;
}

async function hasActivityToday(userId: string, referenceDate = new Date()) {
  const sql = getSql();
  const start = startOfDay(referenceDate).toISOString();
  const end = addDays(startOfDay(referenceDate), 1).toISOString();
  const rows = (await sql.query(
    `
      select exists(
        select 1
        from (
          select coalesce(last_attempt_at, first_solved_at) as activity_at
          from app_user_question_progress
          where user_id = $1::uuid
            and coalesce(last_attempt_at, first_solved_at) >= $2::timestamptz
            and coalesce(last_attempt_at, first_solved_at) < $3::timestamptz
          union all
          select last_trained_at as activity_at
          from app_user_mistakes
          where user_id = $1::uuid
            and last_trained_at >= $2::timestamptz
            and last_trained_at < $3::timestamptz
          union all
          select created_at as activity_at
          from app_user_gamification_events
          where user_id = $1::uuid
            and created_at >= $2::timestamptz
            and created_at < $3::timestamptz
        ) activity
      ) as has_activity
    `,
    [userId, start, end],
  )) as Array<{ has_activity: boolean }>;

  return Boolean(rows[0]?.has_activity);
}

async function listActivityDays(userId: string) {
  const sql = getSql();
  const rows = (await sql.query(
    `
      with activity_days as (
        select distinct coalesce(last_attempt_at, first_solved_at)::date as activity_day
        from app_user_question_progress
        where user_id = $1::uuid
          and coalesce(last_attempt_at, first_solved_at) is not null
        union
        select distinct created_at::date as activity_day
        from app_user_gamification_events
        where user_id = $1::uuid
        union
        select distinct last_trained_at::date as activity_day
        from app_user_mistakes
        where user_id = $1::uuid
          and last_trained_at is not null
      )
      select activity_day::text
      from activity_days
      where activity_day is not null
      order by activity_day desc
    `,
    [userId],
  )) as Array<{ activity_day: string }>;

  return rows.map((row) => row.activity_day);
}

function calculateStreaks(activityDays: string[], reference = new Date()) {
  if (!activityDays.length) {
    return {
      currentStreak: 0,
      bestStreak: 0,
    };
  }

  const uniqueDays = Array.from(new Set(activityDays)).sort();
  let bestStreak = 1;
  let running = 1;

  for (let index = 1; index < uniqueDays.length; index += 1) {
    const current = new Date(`${uniqueDays[index]}T00:00:00`);
    const previous = new Date(`${uniqueDays[index - 1]}T00:00:00`);
    if (diffInDays(current, previous) === 1) {
      running += 1;
    } else {
      running = 1;
    }

    bestStreak = Math.max(bestStreak, running);
  }

  const todayKey = toDayKey(reference);
  let currentStreak = 0;

  if (uniqueDays.includes(todayKey)) {
    currentStreak = 1;
    let pointer = new Date(`${todayKey}T00:00:00`);

    while (true) {
      pointer = addDays(pointer, -1);
      const pointerKey = toDayKey(pointer);
      if (!uniqueDays.includes(pointerKey)) break;
      currentStreak += 1;
    }
  }

  return {
    currentStreak,
    bestStreak,
  };
}

async function awardXpEvent(input: {
  userId: string;
  eventType: GamificationEventType;
  title: string;
  points: number;
  uniqueKey?: string | null;
  metadata?: Record<string, unknown>;
}) {
  await ensureGamificationSchema();
  const sql = getSql();
  const sqlParams = [
    input.userId,
    input.eventType,
    input.title,
    input.points,
    input.uniqueKey ?? null,
    JSON.stringify(input.metadata ?? {}),
  ];

  const rows = (await sql.query(
    input.uniqueKey
      ? `
          insert into app_user_gamification_events (
            user_id,
            event_type,
            title,
            points,
            unique_key,
            metadata
          )
          select
            $1::uuid,
            $2,
            $3,
            $4,
            $5,
            $6::jsonb
          where not exists (
            select 1
            from app_user_gamification_events
            where user_id = $1::uuid
              and unique_key = $5
          )
          returning id
        `
      : `
          insert into app_user_gamification_events (
            user_id,
            event_type,
            title,
            points,
            unique_key,
            metadata
          )
          values (
            $1::uuid,
            $2,
            $3,
            $4,
            null,
            $6::jsonb
          )
          returning id
        `,
    sqlParams,
  )) as Array<{ id: number }>;

  return rows[0]
    ? {
        awarded: true,
        event: {
          eventType: input.eventType,
          title: input.title,
          points: input.points,
        } satisfies AwardedXpEvent,
      }
    : {
        awarded: false,
        event: null,
      };
}

async function getMissionProgress(userId: string, referenceDate = new Date()) {
  const sql = getSql();
  const start = startOfDay(referenceDate).toISOString();
  const end = addDays(startOfDay(referenceDate), 1).toISOString();
  const dayKey = toDayKey(referenceDate);
  const rows = (await sql.query(
    `
      with attempted as (
        select
          count(*)::int as attempted_count
        from app_user_question_progress
        where user_id = $1::uuid
          and last_attempt_at >= $2::timestamptz
          and last_attempt_at < $3::timestamptz
      ),
      solved as (
        select
          coalesce(sum(xp_earned), 0)::int as solved_xp
        from app_user_question_progress
        where user_id = $1::uuid
          and first_solved_at >= $2::timestamptz
          and first_solved_at < $3::timestamptz
      ),
      reviewed as (
        select count(*)::int as reviewed_count
        from app_user_mistakes
        where user_id = $1::uuid
          and last_trained_at >= $2::timestamptz
          and last_trained_at < $3::timestamptz
      ),
      extra as (
        select coalesce(sum(points), 0)::int as extra_xp
        from app_user_gamification_events
        where user_id = $1::uuid
          and created_at >= $2::timestamptz
          and created_at < $3::timestamptz
          and event_type <> 'daily_mission'
      )
      select
        attempted.attempted_count,
        reviewed.reviewed_count,
        solved.solved_xp + extra.extra_xp as raw_xp
      from attempted, solved, reviewed, extra
    `,
    [userId, start, end],
  )) as Array<{
    attempted_count: number;
    reviewed_count: number;
    raw_xp: number;
  }>;

  const progress = rows[0] ?? {
    attempted_count: 0,
    reviewed_count: 0,
    raw_xp: 0,
  };

  const rewardRows = (await sql.query(
    `
      select unique_key
      from app_user_gamification_events
      where user_id = $1::uuid
        and unique_key = any($2::text[])
    `,
    [
      userId,
      DAILY_MISSION_DEFINITIONS.map((mission) => `mission:${mission.id}:${dayKey}`),
    ],
  )) as Array<{ unique_key: string }>;

  const claimedKeys = new Set(rewardRows.map((row) => row.unique_key));

  return DAILY_MISSION_DEFINITIONS.map((mission) => {
    let value = 0;
    if (mission.id === "solve-10-questions") {
      value = progress.attempted_count;
    } else if (mission.id === "review-5-mistakes") {
      value = progress.reviewed_count;
    } else {
      value = progress.raw_xp;
    }

    return {
      id: mission.id,
      title: mission.title,
      description: mission.description,
      progress: value,
      target: mission.target,
      rewardXp: mission.rewardXp,
      completed: value >= mission.target,
      claimed: claimedKeys.has(`mission:${mission.id}:${dayKey}`),
      href: mission.href,
      ctaLabel: mission.ctaLabel,
    } satisfies StudentChallengeMission;
  });
}

async function syncDailyMissionRewards(userId: string, referenceDate = new Date()) {
  const dayKey = toDayKey(referenceDate);
  const missions = await getMissionProgress(userId, referenceDate);
  const awarded: AwardedXpEvent[] = [];

  for (const mission of missions) {
    if (!mission.completed || mission.claimed) {
      continue;
    }

    const result = await awardXpEvent({
      userId,
      eventType: "daily_mission",
      title: `مهمة يومية مكتملة: ${mission.title}`,
      points: applyActiveXpMultiplier(mission.rewardXp, referenceDate),
      uniqueKey: `mission:${mission.id}:${dayKey}`,
      metadata: {
        missionId: mission.id,
        progress: mission.progress,
        target: mission.target,
      },
    });

    if (result.awarded && result.event) {
      awarded.push(result.event);
    }
  }

  return awarded;
}

export async function syncDailyGamificationBonuses(userId: string, referenceDate = new Date()) {
  await ensureGamificationSchema();
  const hasTodayActivity = await hasActivityToday(userId, referenceDate);
  if (!hasTodayActivity) {
    return {
      awarded: [] as AwardedXpEvent[],
      missions: await getMissionProgress(userId, referenceDate),
    };
  }

  const dayKey = toDayKey(referenceDate);
  const awarded: AwardedXpEvent[] = [];
  const streakResult = await awardXpEvent({
    userId,
    eventType: "streak_bonus",
    title: "مكافأة السلسلة اليومية",
    points: applyActiveXpMultiplier(DAILY_STREAK_XP, referenceDate),
    uniqueKey: `streak:${dayKey}`,
    metadata: { dayKey },
  });

  if (streakResult.awarded && streakResult.event) {
    awarded.push(streakResult.event);
  }

  const previousActivity = await getLatestActivityBefore(userId, referenceDate);
  if (previousActivity && diffInDays(referenceDate, previousActivity) >= 7) {
    const comebackResult = await awardXpEvent({
      userId,
      eventType: "comeback_bonus",
      title: "عودة قوية بعد انقطاع",
      points: applyActiveXpMultiplier(COMEBACK_BONUS_XP, referenceDate),
      uniqueKey: `comeback:${dayKey}`,
      metadata: {
        gapDays: diffInDays(referenceDate, previousActivity),
      },
    });

    if (comebackResult.awarded && comebackResult.event) {
      awarded.push(comebackResult.event);
    }
  }

  awarded.push(...(await syncDailyMissionRewards(userId, referenceDate)));

  return {
    awarded,
    missions: await getMissionProgress(userId, referenceDate),
  };
}

async function getPeriodRankings(
  period: LeaderboardPeriod,
  userId: string,
  limit = 12,
) {
  const sql = getSql();
  const { start, end, label } = getPeriodWindow(period);
  const rows = (await sql.query(
    `
      with question_scores as (
        select
          user_id,
          coalesce(sum(xp_earned), 0)::int as xp,
          min(first_solved_at) as first_activity_at
        from app_user_question_progress
        where is_solved = true
          and first_solved_at >= $1::timestamptz
          and first_solved_at < $2::timestamptz
        group by user_id
      ),
      bonus_scores as (
        select
          user_id,
          coalesce(sum(points), 0)::int as xp,
          min(created_at) as first_activity_at
        from app_user_gamification_events
        where created_at >= $1::timestamptz
          and created_at < $2::timestamptz
        group by user_id
      ),
      combined as (
        select
          user_id,
          sum(xp)::int as xp,
          min(first_activity_at) as first_activity_at
        from (
          select * from question_scores
          union all
          select * from bonus_scores
        ) scores
        group by user_id
      ),
      ranked as (
        select
          u.id::text as user_id,
          u.full_name,
          c.xp,
          row_number() over (
            order by c.xp desc, c.first_activity_at asc nulls last, u.full_name asc
          ) as rank
        from combined c
        inner join app_users u on u.id = c.user_id
        where c.xp <> 0
      ),
      focus as (
        select rank
        from ranked
        where user_id = $3::uuid
      ),
      participant_count as (
        select count(*)::int as total_count
        from ranked
      )
      select
        ranked.user_id,
        ranked.full_name,
        ranked.xp,
        ranked.rank,
        participant_count.total_count
      from ranked, participant_count
      where ranked.rank <= $4
         or ranked.user_id = $3::uuid
         or ranked.rank = greatest(coalesce((select rank from focus), 2) - 1, 1)
      order by ranked.rank asc
    `,
    [start.toISOString(), end.toISOString(), userId, limit],
  )) as Array<{
    user_id: string;
    full_name: string;
    xp: number;
    rank: number;
    total_count: number;
  }>;

  const participantCount = rows[0]?.total_count ?? 0;
  const currentRow = rows.find((row) => row.user_id === userId) ?? null;
  const higherRow = currentRow
    ? rows.find((row) => row.rank === currentRow.rank - 1) ?? null
    : null;
  const lowerRow = currentRow
    ? rows.find((row) => row.rank === currentRow.rank + 1) ?? null
    : null;

  const visibleEntries = rows
    .filter((row) => row.rank <= limit)
    .map((row) => ({
      userId: row.user_id,
      name: row.full_name,
      rank: row.rank,
      xp: row.xp,
      isCurrentUser: row.user_id === userId,
      badgeLabel: getRankBadge(row.rank),
    })) satisfies LeaderboardEntry[];

  return {
    period,
    label,
    participantsCount: participantCount,
    currentUser: {
      rank: currentRow?.rank ?? null,
      xp: currentRow?.xp ?? 0,
      nextRankGap: currentRow && higherRow ? Math.max(1, higherRow.xp - currentRow.xp + 1) : null,
      defenseGap: currentRow && lowerRow ? Math.max(0, currentRow.xp - lowerRow.xp) : null,
    },
    entries: visibleEntries,
  } satisfies LeaderboardBucket;
}

type ChallengeDuelRow = {
  id: number;
  challenger_id: string;
  challenger_name: string;
  opponent_id: string;
  opponent_name: string;
  status: "active" | "completed" | "expired";
  track: DuelTrack;
  question_count: number;
  questions: UserMistakeTrainingQuestion[];
  challenger_percent: number | null;
  opponent_percent: number | null;
  challenger_duration_ms: number | null;
  opponent_duration_ms: number | null;
  winner_user_id: string | null;
  winner_name: string | null;
  created_at: string;
  expires_at: string | null;
};

function mapChallengeDuelRow(
  row: ChallengeDuelRow,
  currentUserId: string,
): StudentChallengeDuel {
  const isChallenger = row.challenger_id === currentUserId;
  const myPercent = isChallenger ? row.challenger_percent : row.opponent_percent;
  const opponentPercent = isChallenger ? row.opponent_percent : row.challenger_percent;
  const myDurationMs = isChallenger ? row.challenger_duration_ms : row.opponent_duration_ms;
  const opponentDurationMs = isChallenger ? row.opponent_duration_ms : row.challenger_duration_ms;

  return {
    id: row.id,
    status: row.status,
    role: isChallenger ? "challenger" : "opponent",
    opponentUserId: isChallenger ? row.opponent_id : row.challenger_id,
    opponentName: isChallenger ? row.opponent_name : row.challenger_name,
    track: normalizeDuelTrack(row.track),
    questionCount: row.question_count,
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    myPercent,
    opponentPercent,
    myDurationMs,
    opponentDurationMs,
    winnerUserId: row.winner_user_id,
    winnerName: row.winner_name,
    canStart: row.status === "active" && myPercent == null,
    startHref: buildDuelStartHref(row.id),
    resultLabel: getDuelResultLabel({
      status: row.status,
      myPercent,
      opponentPercent,
      winnerUserId: row.winner_user_id,
      currentUserId,
    }),
    bonusLabel: `الفائز يحصل على ${applyActiveXpMultiplier(DUEL_WIN_BONUS_XP).toLocaleString("en-US")} XP`,
  };
}

async function syncExpiredDuels() {
  const sql = getSql();
  await sql.query(`
    update app_user_challenge_duels
    set
      status = 'expired',
      updated_at = now()
    where status = 'active'
      and expires_at is not null
      and expires_at < now()
      and challenger_percent is null
      and opponent_percent is null
  `);

  const completedRows = (await sql.query(
    `
      update app_user_challenge_duels
      set
        status = 'completed',
        winner_user_id = case
          when challenger_percent is not null and opponent_percent is null then challenger_id
          when opponent_percent is not null and challenger_percent is null then opponent_id
          else winner_user_id
        end,
        updated_at = now()
      where status = 'active'
        and expires_at is not null
        and expires_at < now()
        and (
          (challenger_percent is not null and opponent_percent is null)
          or
          (opponent_percent is not null and challenger_percent is null)
        )
      returning id, winner_user_id::text
    `,
  )) as Array<{ id: number; winner_user_id: string | null }>;

  for (const row of completedRows) {
    if (!row.winner_user_id) continue;

    await awardXpEvent({
      userId: row.winner_user_id,
      eventType: "duel_win",
      title: "فوز في نزال 1v1",
      points: applyActiveXpMultiplier(DUEL_WIN_BONUS_XP),
      uniqueKey: `duel:win:${row.id}`,
      metadata: {
        duelId: row.id,
        result: "forfeit",
      },
    });
  }
}

async function fetchChallengeDuelRow(duelId: number) {
  const sql = getSql();
  const rows = (await sql.query(
    `
      select
        d.id,
        d.challenger_id::text,
        challenger.full_name as challenger_name,
        d.opponent_id::text,
        opponent.full_name as opponent_name,
        d.status::text,
        d.track::text,
        d.question_count,
        d.questions,
        d.challenger_percent,
        d.opponent_percent,
        d.challenger_duration_ms,
        d.opponent_duration_ms,
        d.winner_user_id::text,
        winner.full_name as winner_name,
        d.created_at::text,
        d.expires_at::text
      from app_user_challenge_duels d
      inner join app_users challenger on challenger.id = d.challenger_id
      inner join app_users opponent on opponent.id = d.opponent_id
      left join app_users winner on winner.id = d.winner_user_id
      where d.id = $1
      limit 1
    `,
    [duelId],
  )) as ChallengeDuelRow[];

  return rows[0] ?? null;
}

export async function listStudentChallengeDuels(userId: string) {
  await ensureGamificationSchema();
  await syncExpiredDuels();
  const sql = getSql();
  const rows = (await sql.query(
    `
      select
        d.id,
        d.challenger_id::text,
        challenger.full_name as challenger_name,
        d.opponent_id::text,
        opponent.full_name as opponent_name,
        d.status::text,
        d.track::text,
        d.question_count,
        d.questions,
        d.challenger_percent,
        d.opponent_percent,
        d.challenger_duration_ms,
        d.opponent_duration_ms,
        d.winner_user_id::text,
        winner.full_name as winner_name,
        d.created_at::text,
        d.expires_at::text
      from app_user_challenge_duels d
      inner join app_users challenger on challenger.id = d.challenger_id
      inner join app_users opponent on opponent.id = d.opponent_id
      left join app_users winner on winner.id = d.winner_user_id
      where d.challenger_id = $1::uuid
         or d.opponent_id = $1::uuid
      order by
        case d.status
          when 'active' then 0
          when 'completed' then 1
          else 2
        end asc,
        d.created_at desc
      limit 8
    `,
    [userId],
  )) as ChallengeDuelRow[];

  return rows.map((row) => mapChallengeDuelRow(row, userId));
}

export async function createStudentChallengeDuel(input: {
  challengerId: string;
  opponentId: string;
  track?: DuelTrack;
  questionCount?: number;
}) {
  await ensureGamificationSchema();
  await syncExpiredDuels();
  const sql = getSql();

  if (input.challengerId === input.opponentId) {
    throw new Error("لا يمكنك إنشاء نزال ضد نفسك.");
  }

  const normalizedTrack = normalizeDuelTrack(input.track);
  const normalizedQuestionCount = Math.min(20, Math.max(10, input.questionCount ?? 10));

  const existingRows = (await sql.query(
    `
      select id
      from app_user_challenge_duels
      where status = 'active'
        and expires_at > now()
        and (
          (challenger_id = $1::uuid and opponent_id = $2::uuid)
          or
          (challenger_id = $2::uuid and opponent_id = $1::uuid)
        )
      order by created_at desc
      limit 1
    `,
    [input.challengerId, input.opponentId],
  )) as Array<{ id: number }>;

  if (existingRows[0]?.id) {
    const existingDuel = await fetchChallengeDuelRow(existingRows[0].id);
    if (!existingDuel) {
      throw new Error("تعذر استعادة النزال الحالي.");
    }

    return {
      duel: mapChallengeDuelRow(existingDuel, input.challengerId),
      isExisting: true,
    };
  }

  const rivalRows = (await sql.query(
    `
      select id::text, full_name
      from app_users
      where id = $1::uuid
        and is_active = true
      limit 1
    `,
    [input.opponentId],
  )) as Array<{ id: string; full_name: string }>;

  if (!rivalRows[0]) {
    throw new Error("تعذر العثور على المنافس المحدد.");
  }

  const challengerMistakes = await listUserMistakes(input.challengerId);
  const resolved = await resolveMistakeTrainingQuestions(challengerMistakes);
  const selectedQuestions = pickDuelQuestions(
    resolved.questions,
    normalizedTrack,
    normalizedQuestionCount,
  );

  if (!selectedQuestions.length) {
    throw new Error("لا توجد أسئلة قابلة لبناء نزال 1v1 من أخطائك الحالية.");
  }

  const insertedRows = (await sql.query(
    `
      insert into app_user_challenge_duels (
        challenger_id,
        opponent_id,
        status,
        track,
        question_count,
        questions,
        expires_at
      )
      values (
        $1::uuid,
        $2::uuid,
        'active',
        $3,
        $4,
        '[]'::jsonb,
        now() + interval '3 days'
      )
      returning id
    `,
    [input.challengerId, input.opponentId, normalizedTrack, normalizedQuestionCount],
  )) as Array<{ id: number }>;

  const duelId = insertedRows[0]?.id;

  if (!duelId) {
    throw new Error("تعذر إنشاء النزال الآن.");
  }

  const duelQuestions = selectedQuestions.map((question, index) =>
    buildDuelQuestionSnapshot(duelId, question, index),
  );

  await sql.query(
    `
      update app_user_challenge_duels
      set
        questions = $2::jsonb,
        updated_at = now()
      where id = $1
    `,
    [duelId, JSON.stringify(duelQuestions)],
  );

  const duel = await fetchChallengeDuelRow(duelId);

  if (!duel) {
    throw new Error("تم إنشاء النزال لكن تعذر تحميل بياناته.");
  }

  return {
    duel: mapChallengeDuelRow(duel, input.challengerId),
    isExisting: false,
  };
}

export async function getStudentChallengeDuelForUser(userId: string, duelId: number) {
  await ensureGamificationSchema();
  await syncExpiredDuels();

  const duel = await fetchChallengeDuelRow(duelId);

  if (!duel || (duel.challenger_id !== userId && duel.opponent_id !== userId)) {
    throw new Error("النزال المطلوب غير متاح لهذا الحساب.");
  }

  return {
    duel: mapChallengeDuelRow(duel, userId),
    questions: Array.isArray(duel.questions) ? duel.questions : [],
  };
}

async function finalizeChallengeDuelIfReady(duelId: number, referenceDate = new Date()) {
  const sql = getSql();
  const duel = await fetchChallengeDuelRow(duelId);

  if (!duel) {
    throw new Error("تعذر العثور على النزال المطلوب.");
  }

  if (duel.status !== "active") {
    return duel;
  }

  if (duel.challenger_percent == null || duel.opponent_percent == null) {
    return duel;
  }

  let winnerUserId: string | null = null;

  if (duel.challenger_percent > duel.opponent_percent) {
    winnerUserId = duel.challenger_id;
  } else if (duel.opponent_percent > duel.challenger_percent) {
    winnerUserId = duel.opponent_id;
  } else if (
    duel.challenger_duration_ms != null &&
    duel.opponent_duration_ms != null &&
    duel.challenger_duration_ms !== duel.opponent_duration_ms
  ) {
    winnerUserId =
      duel.challenger_duration_ms < duel.opponent_duration_ms
        ? duel.challenger_id
        : duel.opponent_id;
  }

  await sql.query(
    `
      update app_user_challenge_duels
      set
        status = 'completed',
        winner_user_id = $2::uuid,
        updated_at = now()
      where id = $1
    `,
    [duelId, winnerUserId],
  );

  if (winnerUserId) {
    await awardXpEvent({
      userId: winnerUserId,
      eventType: "duel_win",
      title: "فوز في نزال 1v1",
      points: applyActiveXpMultiplier(DUEL_WIN_BONUS_XP, referenceDate),
      uniqueKey: `duel:win:${duelId}`,
      metadata: {
        duelId,
        challengerPercent: duel.challenger_percent,
        opponentPercent: duel.opponent_percent,
      },
    });
  }

  const finalized = await fetchChallengeDuelRow(duelId);
  if (!finalized) {
    throw new Error("تعذر تحديث حالة النزال.");
  }

  return finalized;
}

export async function recordChallengeDuelSubmission(input: {
  userId: string;
  duelId: number;
  percent: number;
  durationMs?: number | null;
}) {
  await ensureGamificationSchema();
  await syncExpiredDuels();
  const sql = getSql();
  const duel = await fetchChallengeDuelRow(input.duelId);

  if (!duel || (duel.challenger_id !== input.userId && duel.opponent_id !== input.userId)) {
    throw new Error("تعذر العثور على النزال المطلوب.");
  }

  if (duel.status !== "active") {
    return mapChallengeDuelRow(duel, input.userId);
  }

  const isChallenger = duel.challenger_id === input.userId;
  const alreadySubmitted = isChallenger
    ? duel.challenger_percent != null
    : duel.opponent_percent != null;

  if (!alreadySubmitted) {
    await sql.query(
      isChallenger
        ? `
            update app_user_challenge_duels
            set
              challenger_percent = $2,
              challenger_duration_ms = $3,
              challenger_completed_at = now(),
              updated_at = now()
            where id = $1
          `
        : `
            update app_user_challenge_duels
            set
              opponent_percent = $2,
              opponent_duration_ms = $3,
              opponent_completed_at = now(),
              updated_at = now()
            where id = $1
          `,
      [input.duelId, input.percent, input.durationMs ?? null],
    );
  }

  const finalized = await finalizeChallengeDuelIfReady(input.duelId);
  return mapChallengeDuelRow(finalized, input.userId);
}

function buildAchievements(input: {
  totalXp: number;
  solvedQuestionsCount: number;
  currentStreak: number;
  bestStreak: number;
  activeMistakesCount: number;
  masteredMistakesCount: number;
}) {
  return [
    {
      id: "xp-1000",
      title: "أول 1000 XP",
      description: "أكملت أول ألف نقطة داخل المنصة.",
      icon: "🏅",
      unlocked: input.totalXp >= 1000,
      progressLabel: `${Math.min(input.totalXp, 1000)} / 1000 XP`,
    },
    {
      id: "solve-100",
      title: "100 سؤال صحيح",
      description: "وصلت إلى مئة سؤال محفوظ في سجل التقدم.",
      icon: "📘",
      unlocked: input.solvedQuestionsCount >= 100,
      progressLabel: `${input.solvedQuestionsCount} / 100`,
    },
    {
      id: "streak-10",
      title: "10 أيام متواصلة",
      description: "حافظت على سلسلة مذاكرة ممتدة لعشرة أيام.",
      icon: "🔥",
      unlocked: input.bestStreak >= 10,
      progressLabel: `${input.currentStreak} يوم حاليًا / أفضلها ${input.bestStreak}`,
    },
    {
      id: "mistakes-mastered",
      title: "إتقان الأخطاء",
      description: "حوّلت مجموعة من أسئلة الأخطاء إلى حالة الإتقان.",
      icon: "✅",
      unlocked: input.masteredMistakesCount >= 25,
      progressLabel: `${input.masteredMistakesCount} متقن / ${input.activeMistakesCount} يحتاج مراجعة`,
    },
  ] satisfies StudentChallengeAchievement[];
}

export async function ensureGamificationSchema() {
  await ensureUserQuestionProgressSchema();
  await ensureUserMistakesSchema();
  const sql = getSql();

  await sql.query(`
    create table if not exists app_user_gamification_events (
      id bigserial primary key,
      user_id uuid not null references app_users(id) on delete cascade,
      event_type varchar(40) not null,
      title varchar(180) not null,
      points integer not null,
      unique_key varchar(255),
      metadata jsonb not null default '{}'::jsonb,
      created_at timestamptz not null default now()
    )
  `);

  await sql.query(`
    alter table app_user_gamification_events
      add column if not exists event_type varchar(40),
      add column if not exists title varchar(180),
      add column if not exists points integer not null default 0,
      add column if not exists unique_key varchar(255),
      add column if not exists metadata jsonb not null default '{}'::jsonb,
      add column if not exists created_at timestamptz not null default now()
  `);

  await sql.query(`
    create unique index if not exists idx_app_user_gamification_events_user_unique
      on app_user_gamification_events (user_id, unique_key)
      where unique_key is not null
  `);

  await sql.query(`
    create index if not exists idx_app_user_gamification_events_user_created
      on app_user_gamification_events (user_id, created_at desc)
  `);

  await sql.query(`
    create index if not exists idx_app_user_gamification_events_type_created
      on app_user_gamification_events (event_type, created_at desc)
  `);

  await sql.query(`
    create table if not exists app_user_challenge_duels (
      id bigserial primary key,
      challenger_id uuid not null references app_users(id) on delete cascade,
      opponent_id uuid not null references app_users(id) on delete cascade,
      status varchar(20) not null default 'active',
      track varchar(20) not null default 'all',
      question_count integer not null default 10,
      questions jsonb not null default '[]'::jsonb,
      challenger_percent integer,
      opponent_percent integer,
      challenger_duration_ms integer,
      opponent_duration_ms integer,
      challenger_completed_at timestamptz,
      opponent_completed_at timestamptz,
      winner_user_id uuid references app_users(id) on delete set null,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now(),
      expires_at timestamptz
    )
  `);

  await sql.query(`
    alter table app_user_challenge_duels
      add column if not exists status varchar(20) not null default 'active',
      add column if not exists track varchar(20) not null default 'all',
      add column if not exists question_count integer not null default 10,
      add column if not exists questions jsonb not null default '[]'::jsonb,
      add column if not exists challenger_percent integer,
      add column if not exists opponent_percent integer,
      add column if not exists challenger_duration_ms integer,
      add column if not exists opponent_duration_ms integer,
      add column if not exists challenger_completed_at timestamptz,
      add column if not exists opponent_completed_at timestamptz,
      add column if not exists winner_user_id uuid references app_users(id) on delete set null,
      add column if not exists created_at timestamptz not null default now(),
      add column if not exists updated_at timestamptz not null default now(),
      add column if not exists expires_at timestamptz
  `);

  await sql.query(`
    create index if not exists idx_app_user_challenge_duels_challenger
      on app_user_challenge_duels (challenger_id, created_at desc)
  `);

  await sql.query(`
    create index if not exists idx_app_user_challenge_duels_opponent
      on app_user_challenge_duels (opponent_id, created_at desc)
  `);

  await sql.query(`
    create index if not exists idx_app_user_challenge_duels_status
      on app_user_challenge_duels (status, expires_at desc, created_at desc)
  `);
}

export async function recordTrainingSessionOutcome(
  userId: string,
  input: TrainingSessionOutcomeInput,
) {
  await ensureGamificationSchema();
  const awarded: AwardedXpEvent[] = [];
  const referenceDate = new Date();
  let duel: StudentChallengeDuel | null = null;

  if (input.abandoned) {
    if (input.mode === "challenge") {
      const result = await awardXpEvent({
        userId,
        eventType: "exam_abandon",
        title: "إنهاء التحدي قبل الإكمال",
        points: EXAM_ABANDON_XP,
        uniqueKey: `session:abandon:${input.sessionKey}`,
        metadata: {
          mode: input.mode,
          track: input.track,
          questionCount: input.questionCount,
        },
      });

      if (result.awarded && result.event) {
        awarded.push(result.event);
      }
    }

    return {
      awarded,
      totalAwarded: awarded.reduce((sum, item) => sum + item.points, 0),
      duel,
    };
  }

  const baseResult = await awardXpEvent({
    userId,
    eventType: input.mode === "challenge" ? "challenge_complete" : "mistake_review",
    title:
      input.mode === "challenge"
        ? "إنهاء تحدي الأخطاء"
        : "مراجعة أخطاء مكتملة",
    points: applyActiveXpMultiplier(
      input.mode === "challenge" ? CHALLENGE_COMPLETE_XP : MISTAKE_REVIEW_XP,
      referenceDate,
    ),
    uniqueKey: `session:complete:${input.sessionKey}`,
    metadata: {
      mode: input.mode,
      track: input.track,
      questionCount: input.questionCount,
      percent: input.percent,
    },
  });

  if (baseResult.awarded && baseResult.event) {
    awarded.push(baseResult.event);
  }

  if (input.passed && input.percent >= 90) {
    const bonusResult = await awardXpEvent({
      userId,
      eventType: "high_score_bonus",
      title: "مكافأة 90%+",
      points: applyActiveXpMultiplier(HIGH_SCORE_BONUS_XP, referenceDate),
      uniqueKey: `session:bonus:${input.sessionKey}`,
      metadata: {
        mode: input.mode,
        track: input.track,
        percent: input.percent,
      },
    });

    if (bonusResult.awarded && bonusResult.event) {
      awarded.push(bonusResult.event);
    }
  }

  const bonusSync = await syncDailyGamificationBonuses(userId);
  awarded.push(...bonusSync.awarded);

  if (input.duelId && input.mode === "challenge") {
    duel = await recordChallengeDuelSubmission({
      userId,
      duelId: input.duelId,
      percent: input.percent,
      durationMs: input.durationMs ?? null,
    });
  }

  return {
    awarded,
    totalAwarded: awarded.reduce((sum, item) => sum + item.points, 0),
    duel,
  };
}

export async function syncGamificationAfterQuestionSolve(userId: string) {
  return syncDailyGamificationBonuses(userId);
}

export async function getStudentChallengeData(
  userId: string,
  options: {
    includeLeaderboards?: boolean;
    solvedQuestionsCount?: number;
    questionXp?: number;
    activeMistakesCount?: number;
    masteredMistakesCount?: number;
  } = {},
) {
  await ensureGamificationSchema();
  await syncDailyGamificationBonuses(userId);

  const questionProgress =
    options.questionXp != null || options.solvedQuestionsCount != null
      ? {
          totalXp: options.questionXp ?? 0,
          solvedQuestionsCount: options.solvedQuestionsCount ?? 0,
        }
      : await getUserQuestionProgressTotals(userId);

  const bonusXp = await getBonusXpTotal(userId);
  const totalXp = questionProgress.totalXp + bonusXp;
  const level = describeLevel(totalXp);
  const { currentStreak, bestStreak } = calculateStreaks(await listActivityDays(userId));
  const missions = await getMissionProgress(userId);
  const xpMultiplier = getXpMultiplierStatus();

  const [daily, weekly, monthly, duels] = await Promise.all([
    getPeriodRankings("daily", userId),
    getPeriodRankings("weekly", userId),
    getPeriodRankings("monthly", userId),
    listStudentChallengeDuels(userId),
  ]);

  const { endsAt, countdownLabel } = getMonthCountdown();
  const activeMistakesCount = options.activeMistakesCount ?? 0;
  const masteredMistakesCount = options.masteredMistakesCount ?? 0;
  const rankProtection = describeRankProtection(
    monthly.currentUser.rank,
    monthly.currentUser.defenseGap,
  );

  return {
    totalXp,
    questionXp: questionProgress.totalXp,
    bonusXp,
    currentTitle: getCurrentTitle(monthly.currentUser.rank, level),
    level,
    monthLabel: getMonthLabel(),
    countdownLabel,
    endsAt,
    dailyXp: daily.currentUser.xp,
    weeklyXp: weekly.currentUser.xp,
    monthlyXp: monthly.currentUser.xp,
    dailyRank: daily.currentUser.rank,
    weeklyRank: weekly.currentUser.rank,
    monthlyRank: monthly.currentUser.rank,
    nextMonthlyRankGap: monthly.currentUser.nextRankGap,
    currentStreak,
    bestStreak,
    xpMultiplier,
    rankProtection,
    duels,
    missions,
    achievements: buildAchievements({
      totalXp,
      solvedQuestionsCount: questionProgress.solvedQuestionsCount,
      currentStreak,
      bestStreak,
      activeMistakesCount,
      masteredMistakesCount,
    }),
    leaderboards:
      options.includeLeaderboards === false
        ? {
            daily: { ...daily, entries: [] },
            weekly: { ...weekly, entries: [] },
            monthly: { ...monthly, entries: [] },
          }
        : {
            daily,
            weekly,
            monthly,
          },
  } satisfies StudentChallengeData;
}
