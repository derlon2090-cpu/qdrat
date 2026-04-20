import { getSqlClient } from "@/lib/db";

const DEFAULT_QUANT_SECTIONS = 18;
const DEFAULT_VERBAL_SECTIONS = 12;
const DEFAULT_DAILY_MINUTES = 120;
const PLAN_GENERATION_DAYS = 14;

export type StudentPlanType = "light" | "medium" | "intensive";
export type PlanPressure = "comfortable" | "balanced" | "compressed" | "needs_more_time";

export type StudentPortalTask = {
  id: number;
  title: string;
  description: string | null;
  taskKind: "diagnostic" | "practice" | "review" | "mock_exam";
  scheduledFor: string;
  estimatedMinutes: number | null;
  targetQuestions: number | null;
  isCompleted: boolean;
};

export type StudentPortalResumeItem = {
  id: string;
  title: string;
  subtitle: string;
  href: string;
  ctaLabel: string;
};

export type StudentPortalData = {
  userId: string;
  fullName: string;
  onboardingCompleted: boolean;
  examDate: string | null;
  daysLeft: number | null;
  dailyStudyHours: number;
  quantRemainingSections: number | null;
  verbalRemainingSections: number | null;
  planType: StudentPlanType;
  planPressure: PlanPressure;
  progressPercent: number;
  quantProgressPercent: number;
  verbalProgressPercent: number;
  totalMistakes: number;
  quantitativeMistakes: number;
  verbalMistakes: number;
  summariesCount: number;
  lastActivityAt: string | null;
  lastActivityLabel: string | null;
  todayTasks: StudentPortalTask[];
  upcomingTasks: StudentPortalTask[];
  weeklyGoal: {
    quantSections: number;
    verbalSections: number;
    targetQuestions: number;
    mistakesReview: number;
  };
  resumeItems: StudentPortalResumeItem[];
  recommendations: string[];
};

type StudentPortalRow = {
  user_id: string;
  full_name: string;
  onboarding_completed: boolean | null;
  exam_date: string | null;
  daily_minutes: number | null;
  plan_type: string | null;
  quant_remaining_sections: number | null;
  verbal_remaining_sections: number | null;
  current_level: string | null;
  quantitative_score: number | null;
  verbal_score: number | null;
  overall_score: number | null;
  last_activity_at: string | null;
  last_activity_label: string | null;
  last_opened_summary_id: string | null;
  last_opened_summary_name: string | null;
  last_opened_summary_page: number | null;
  last_opened_bank_href: string | null;
  last_opened_bank_label: string | null;
};

type StudyTaskRow = {
  id: number;
  title: string;
  description: string | null;
  task_kind: StudentPortalTask["taskKind"];
  scheduled_for: string;
  estimated_minutes: number | null;
  target_questions: number | null;
  is_completed: boolean;
};

type OnboardingInput = {
  examDate: string | null;
  daysLeft: number | null;
  quantRemainingSections: number | null;
  verbalRemainingSections: number | null;
  dailyStudyHours: number | null;
  planType: StudentPlanType;
};

type StudentActivityInput = {
  label: string;
  path: string;
  bankLabel?: string | null;
  bankHref?: string | null;
  summaryId?: string | null;
  summaryName?: string | null;
  summaryPage?: number | null;
};

function getSql() {
  return getSqlClient();
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function toPlanType(value: string | null | undefined): StudentPlanType {
  if (value === "light" || value === "medium" || value === "intensive") {
    return value;
  }

  return "medium";
}

function addDays(base: Date, days: number) {
  const next = new Date(base);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDateOnly(date: Date) {
  return date.toISOString().slice(0, 10);
}

function normalizeNullableInteger(value: number | null | undefined) {
  if (value == null || Number.isNaN(value)) return null;
  return Math.max(0, Math.round(value));
}

function toDailyMinutes(hours: number | null | undefined) {
  if (hours == null || Number.isNaN(hours)) {
    return DEFAULT_DAILY_MINUTES;
  }

  return clamp(Math.round(hours * 60), 30, 12 * 60);
}

function inferRemainingSections(
  explicitValue: number | null,
  score: number | null,
  fallbackTotal: number,
) {
  if (explicitValue != null) {
    return clamp(explicitValue, 0, fallbackTotal);
  }

  if (score != null) {
    const inferred = Math.round(fallbackTotal * (1 - clamp(score, 0, 100) / 100));
    return clamp(inferred, 1, fallbackTotal);
  }

  return fallbackTotal;
}

function calculateDaysLeft(examDate: string | null) {
  if (!examDate) return null;

  const exam = new Date(`${examDate}T00:00:00`);
  if (Number.isNaN(exam.getTime())) return null;

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diffMs = exam.getTime() - startOfToday.getTime();

  return Math.max(0, Math.ceil(diffMs / (24 * 60 * 60 * 1000)));
}

function calculatePressure(
  dailyMinutes: number,
  quantRemainingSections: number,
  verbalRemainingSections: number,
  daysLeft: number | null,
) {
  const targetDays = Math.max(daysLeft ?? 30, 1);
  const totalSections = quantRemainingSections + verbalRemainingSections;
  const requiredMinutes =
    totalSections * 35 / targetDays +
    Math.max(15, Math.round(totalSections * 4 / targetDays));

  if (requiredMinutes <= dailyMinutes * 0.8) return "comfortable";
  if (requiredMinutes <= dailyMinutes * 1.05) return "balanced";
  if (requiredMinutes <= dailyMinutes * 1.3) return "compressed";
  return "needs_more_time";
}

function buildRecommendationSet(input: {
  daysLeft: number | null;
  totalMistakes: number;
  summariesCount: number;
  planPressure: PlanPressure;
  planType: StudentPlanType;
}) {
  const recommendations: string[] = [];

  if ((input.daysLeft ?? 30) <= 10) {
    recommendations.push("اقترب الاختبار، لذا الأولوية الآن للمراجعة والأخطاء والنماذج القصيرة بدل فتح محتوى جديد.");
  } else {
    recommendations.push("ابدأ اليوم بالمهمة الأعلى أثرًا ثم انقل بقية الوقت إلى الأخطاء والملخصات حتى يبقى التقدم ثابتًا.");
  }

  if (input.totalMistakes > 0) {
    recommendations.push(`لديك ${input.totalMistakes} سؤالًا في الأخطاء، ومراجعتها يوميًا ستقلل التكرار أسرع من حل جديد فقط.`);
  }

  if (input.summariesCount > 0) {
    recommendations.push("ارجع إلى آخر ملخص حفظته وأكمل من نفس الصفحة حتى لا تضيع ملاحظاتك بين الملفات.");
  }

  if (input.planPressure === "needs_more_time") {
    recommendations.push("الخطة الحالية مضغوطة جدًا. زد وقتك اليومي أو قلل المهام الجديدة حتى لا تتراكم عليك المراجعات.");
  } else if (input.planPressure === "comfortable") {
    recommendations.push("الخطة الحالية مريحة، ويمكنك إضافة نموذج قصير إضافي هذا الأسبوع إذا أردت رفع الإيقاع.");
  } else if (input.planType === "intensive") {
    recommendations.push("أنت على خطة مكثفة، فاحرص على جلسة مراجعة خفيفة يومية حتى لا يتحول الإنجاز إلى نسيان سريع.");
  }

  return recommendations.slice(0, 4);
}

function createTaskDefinition(
  title: string,
  description: string,
  taskKind: StudentPortalTask["taskKind"],
  estimatedMinutes: number,
  targetQuestions: number | null = null,
) {
  return {
    title,
    description,
    taskKind,
    estimatedMinutes,
    targetQuestions,
  };
}

function buildPlanTasks(input: {
  quantRemainingSections: number;
  verbalRemainingSections: number;
  dailyMinutes: number;
  daysLeft: number | null;
  planType: StudentPlanType;
  totalMistakes: number;
  summariesCount: number;
}) {
  const totalDays = Math.max(Math.min(input.daysLeft ?? 30, PLAN_GENERATION_DAYS), 7);
  const quantDaily = Math.max(1, Math.ceil(input.quantRemainingSections / totalDays));
  const verbalDaily = Math.max(1, Math.ceil(input.verbalRemainingSections / totalDays));
  const dailyQuestionsBase = input.planType === "light" ? 12 : input.planType === "intensive" ? 24 : 18;
  const mistakesTarget = Math.max(5, Math.min(15, input.totalMistakes || 5));
  const tasks: Array<{
    scheduledFor: string;
    sortOrder: number;
    title: string;
    description: string;
    taskKind: StudentPortalTask["taskKind"];
    estimatedMinutes: number;
    targetQuestions: number | null;
  }> = [];

  for (let dayIndex = 0; dayIndex < totalDays; dayIndex += 1) {
    const scheduledFor = formatDateOnly(addDays(new Date(), dayIndex));
    const isReviewPhase = (input.daysLeft ?? 30) <= 10;
    const dailyTasks = isReviewPhase
      ? [
          createTaskDefinition(
            `مراجعة ${mistakesTarget} أسئلة من الأخطاء`,
            "راجع الأخطاء المتكررة أولًا ثم ثبّت التفسير الصحيح لكل سؤال.",
            "review",
            35,
            mistakesTarget,
          ),
          createTaskDefinition(
            dayIndex % 2 === 0 ? "حل نموذج قصير" : "مراجعة نموذج سابق",
            "مرحلة المراجعة النهائية تفضّل النماذج القصيرة والمراجعة السريعة بدل فتح أبواب جديدة.",
            "mock_exam",
            45,
            20,
          ),
          createTaskDefinition(
            `مراجعة ${Math.max(1, verbalDaily)} مقطع لفظي`,
            "ثبت الكلمات والأنماط التي ظهرت معك كثيرًا في اللفظي.",
            "review",
            30,
          ),
        ]
      : [
          createTaskDefinition(
            `حل ${dailyQuestionsBase + quantDaily * 3} سؤال كمي`,
            `التركيز اليوم على ${quantDaily} مقطع/مقاطع كمي مع حل أسئلة تطبيقية قصيرة.`,
            "practice",
            Math.min(input.dailyMinutes, 55),
            dailyQuestionsBase + quantDaily * 3,
          ),
          createTaskDefinition(
            `مراجعة ${verbalDaily} مقطع لفظي`,
            "تابع اللفظي بالمقاطع المتبقية أو بالمراجعة إذا لم تحدد عدد المقاطع.",
            "review",
            35,
          ),
          createTaskDefinition(
            `مراجعة ${mistakesTarget} أسئلة من الأخطاء`,
            "حافظ على دورة يومية ثابتة لتقليل الأخطاء المتكررة.",
            "review",
            25,
            mistakesTarget,
          ),
          createTaskDefinition(
            input.summariesCount > 0 ? "استكمال ملخص محفوظ" : "إضافة ملخص أو مراجعة سريعة",
            input.summariesCount > 0
              ? "افتح آخر ملخص كنت تعمل عليه وأكمل منه بدل البدء من جديد."
              : "إذا لم يكن لديك ملخصات محفوظة، خصص وقتًا قصيرًا لمراجعة صفحة أو ورقة تدريبية.",
            "practice",
            20,
          ),
        ];

    if (!isReviewPhase && dayIndex % 4 === 3) {
      dailyTasks.push(
        createTaskDefinition(
          "حل نموذج قصير",
          "اختبر ثبات مستواك كل عدة أيام بدل الانتظار إلى نهاية الأسبوع.",
          "mock_exam",
          40,
          20,
        ),
      );
    }

    dailyTasks.forEach((task, index) => {
      tasks.push({
        scheduledFor,
        sortOrder: index + 1,
        ...task,
      });
    });
  }

  return tasks;
}

async function ensureStudentPortalSchema() {
  const sql = getSql();

  await sql.query(`
    create table if not exists app_student_profiles (
      user_id uuid primary key references app_users(id) on delete cascade,
      target_score smallint,
      exam_date date,
      daily_minutes smallint,
      current_level app_difficulty default 'medium',
      verbal_score numeric(5,2),
      quantitative_score numeric(5,2),
      overall_score numeric(5,2),
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);

  await sql.query(`
    alter table app_student_profiles
      add column if not exists onboarding_completed boolean not null default false,
      add column if not exists plan_type varchar(20) not null default 'medium',
      add column if not exists quant_remaining_sections integer,
      add column if not exists verbal_remaining_sections integer,
      add column if not exists last_activity_at timestamptz,
      add column if not exists last_activity_label varchar(160),
      add column if not exists last_opened_summary_id uuid,
      add column if not exists last_opened_summary_name varchar(255),
      add column if not exists last_opened_summary_page integer,
      add column if not exists last_opened_bank_href text,
      add column if not exists last_opened_bank_label varchar(160),
      add column if not exists last_opened_path text
  `);

  await sql.query(`
    create table if not exists app_study_plans (
      id bigserial primary key,
      user_id uuid not null references app_users(id) on delete cascade,
      title varchar(160) not null,
      target_exam_date date,
      focus_section app_bank_section default 'mixed',
      is_active boolean not null default true,
      generated_from_diagnostic boolean not null default true,
      created_at timestamptz not null default now(),
      updated_at timestamptz not null default now()
    )
  `);

  await sql.query(`
    create table if not exists app_study_plan_tasks (
      id bigserial primary key,
      study_plan_id bigint not null references app_study_plans(id) on delete cascade,
      bank_id bigint references app_question_banks(id) on delete set null,
      task_kind app_task_kind not null,
      title varchar(255) not null,
      description text,
      scheduled_for date not null,
      estimated_minutes integer,
      target_questions integer,
      sort_order integer not null default 1,
      is_completed boolean not null default false,
      completed_at timestamptz,
      created_at timestamptz not null default now()
    )
  `);
}

async function getMistakeStats(userId: string) {
  const sql = getSql();
  const rows = (await sql.query(
    `
      select
        count(*)::int as total_mistakes,
        count(*) filter (where section = 'quantitative')::int as quantitative_mistakes,
        count(*) filter (where section = 'verbal')::int as verbal_mistakes
      from app_user_mistakes
      where user_id = $1::uuid
    `,
    [userId],
  )) as Array<{
    total_mistakes: number;
    quantitative_mistakes: number;
    verbal_mistakes: number;
  }>;

  return (
    rows[0] ?? {
      total_mistakes: 0,
      quantitative_mistakes: 0,
      verbal_mistakes: 0,
    }
  );
}

async function getSummaryStats(userId: string) {
  const sql = getSql();
  const rows = (await sql.query(
    `
      select
        count(*)::int as total_summaries,
        (
          select file_name
          from app_user_summaries latest
          where latest.user_id = $1::uuid
          order by latest.last_used_at desc, latest.updated_at desc
          limit 1
        ) as latest_summary_name,
        (
          select id::text
          from app_user_summaries latest
          where latest.user_id = $1::uuid
          order by latest.last_used_at desc, latest.updated_at desc
          limit 1
        ) as latest_summary_id,
        (
          select last_opened_page
          from app_user_summaries latest
          where latest.user_id = $1::uuid
          order by latest.last_used_at desc, latest.updated_at desc
          limit 1
        ) as latest_summary_page
    `,
    [userId],
  )) as Array<{
    total_summaries: number;
    latest_summary_name: string | null;
    latest_summary_id: string | null;
    latest_summary_page: number | null;
  }>;

  return (
    rows[0] ?? {
      total_summaries: 0,
      latest_summary_name: null,
      latest_summary_id: null,
      latest_summary_page: null,
    }
  );
}

async function getOrCreateActivePlan(userId: string, examDate: string | null) {
  const sql = getSql();
  const existingRows = (await sql.query(
    `
      select id
      from app_study_plans
      where user_id = $1::uuid
        and is_active = true
      order by updated_at desc, created_at desc
      limit 1
    `,
    [userId],
  )) as Array<{ id: number }>;

  if (existingRows[0]) {
    await sql.query(
      `
        update app_study_plans
        set target_exam_date = $2::date
        where id = $1::bigint
      `,
      [existingRows[0].id, examDate],
    );
    return existingRows[0].id;
  }

  const insertedRows = (await sql.query(
    `
      insert into app_study_plans (
        user_id,
        title,
        target_exam_date,
        focus_section,
        is_active,
        generated_from_diagnostic
      )
      values ($1::uuid, 'الخطة الذكية', $2::date, 'mixed', true, true)
      returning id
    `,
    [userId, examDate],
  )) as Array<{ id: number }>;

  return insertedRows[0]?.id;
}

async function replaceUpcomingTasks(userId: string, tasks: ReturnType<typeof buildPlanTasks>, examDate: string | null) {
  const sql = getSql();
  const planId = await getOrCreateActivePlan(userId, examDate);

  await sql.query(
    `
      delete from app_study_plan_tasks
      where study_plan_id = $1::bigint
        and scheduled_for >= current_date
        and is_completed = false
    `,
    [planId],
  );

  for (const task of tasks) {
    await sql.query(
      `
        insert into app_study_plan_tasks (
          study_plan_id,
          task_kind,
          title,
          description,
          scheduled_for,
          estimated_minutes,
          target_questions,
          sort_order,
          is_completed
        )
        values (
          $1::bigint,
          $2::app_task_kind,
          $3,
          $4,
          $5::date,
          $6,
          $7,
          $8,
          false
        )
      `,
      [
        planId,
        task.taskKind,
        task.title,
        task.description,
        task.scheduledFor,
        task.estimatedMinutes,
        task.targetQuestions,
        task.sortOrder,
      ],
    );
  }
}

async function listPlanTasks(userId: string) {
  const sql = getSql();
  const rows = (await sql.query(
    `
      select
        tasks.id,
        tasks.title,
        tasks.description,
        tasks.task_kind,
        tasks.scheduled_for::text,
        tasks.estimated_minutes,
        tasks.target_questions,
        tasks.is_completed
      from app_study_plan_tasks tasks
      inner join app_study_plans plans on plans.id = tasks.study_plan_id
      where plans.user_id = $1::uuid
        and plans.is_active = true
        and tasks.scheduled_for between current_date and current_date + interval '14 days'
      order by tasks.scheduled_for asc, tasks.sort_order asc, tasks.id asc
    `,
    [userId],
  )) as StudyTaskRow[];

  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    description: row.description,
    taskKind: row.task_kind,
    scheduledFor: row.scheduled_for,
    estimatedMinutes: row.estimated_minutes,
    targetQuestions: row.target_questions,
    isCompleted: row.is_completed,
  }));
}

function mapPortalData(
  row: StudentPortalRow | null,
  tasks: StudentPortalTask[],
  mistakes: Awaited<ReturnType<typeof getMistakeStats>>,
  summaries: Awaited<ReturnType<typeof getSummaryStats>>,
) {
  const planType = toPlanType(row?.plan_type);
  const quantRemainingSections = inferRemainingSections(
    normalizeNullableInteger(row?.quant_remaining_sections),
    row?.quantitative_score ?? null,
    DEFAULT_QUANT_SECTIONS,
  );
  const verbalRemainingSections = inferRemainingSections(
    normalizeNullableInteger(row?.verbal_remaining_sections),
    row?.verbal_score ?? null,
    DEFAULT_VERBAL_SECTIONS,
  );
  const daysLeft = calculateDaysLeft(row?.exam_date ?? null);
  const dailyMinutes = row?.daily_minutes ?? DEFAULT_DAILY_MINUTES;
  const planPressure = calculatePressure(dailyMinutes, quantRemainingSections, verbalRemainingSections, daysLeft);
  const quantProgressPercent = Math.round(
    ((DEFAULT_QUANT_SECTIONS - quantRemainingSections) / DEFAULT_QUANT_SECTIONS) * 100,
  );
  const verbalProgressPercent = Math.round(
    ((DEFAULT_VERBAL_SECTIONS - verbalRemainingSections) / DEFAULT_VERBAL_SECTIONS) * 100,
  );
  const progressPercent = Math.round((quantProgressPercent + verbalProgressPercent) / 2);

  const today = formatDateOnly(new Date());
  const todayTasks = tasks.filter((task) => task.scheduledFor === today);
  const upcomingTasks = tasks.filter((task) => task.scheduledFor > today).slice(0, 8);

  const weeklyGoal = {
    quantSections: Math.max(1, Math.ceil(quantRemainingSections / 3)),
    verbalSections: Math.max(1, Math.ceil(verbalRemainingSections / 3)),
    targetQuestions: todayTasks.reduce((sum, task) => sum + (task.targetQuestions ?? 0), 0) * 3 || 90,
    mistakesReview: Math.max(5, Math.min(15, mistakes.total_mistakes || 5)),
  };

  const resumeItems: StudentPortalResumeItem[] = [];

  if (summaries.latest_summary_id && summaries.latest_summary_name) {
    resumeItems.push({
      id: `summary-${summaries.latest_summary_id}`,
      title: summaries.latest_summary_name,
      subtitle: `آخر صفحة وصلت لها: ${summaries.latest_summary_page ?? 1}`,
      href: `/summaries/${summaries.latest_summary_id}`,
      ctaLabel: "استكمل الملخص",
    });
  }

  if (row?.last_opened_bank_href && row.last_opened_bank_label) {
    resumeItems.push({
      id: "question-bank",
      title: row.last_opened_bank_label,
      subtitle: "آخر بنك كنت تتدرب عليه",
      href: row.last_opened_bank_href,
      ctaLabel: "استكمل التدريب",
    });
  }

  if (!resumeItems.length) {
    resumeItems.push({
      id: "default-bank",
      title: "بنك الأسئلة",
      subtitle: "ابدأ أو أكمل التدريب من آخر مسار مناسب لك",
      href: "/question-bank",
      ctaLabel: "ابدأ الآن",
    });
  }

  return {
    userId: row?.user_id ?? "",
    fullName: row?.full_name ?? "",
    onboardingCompleted: Boolean(row?.onboarding_completed),
    examDate: row?.exam_date ?? null,
    daysLeft,
    dailyStudyHours: Math.max(0.5, Math.round((dailyMinutes / 60) * 10) / 10),
    quantRemainingSections: row?.quant_remaining_sections ?? null,
    verbalRemainingSections: row?.verbal_remaining_sections ?? null,
    planType,
    planPressure,
    progressPercent: clamp(progressPercent, 0, 100),
    quantProgressPercent: clamp(quantProgressPercent, 0, 100),
    verbalProgressPercent: clamp(verbalProgressPercent, 0, 100),
    totalMistakes: mistakes.total_mistakes,
    quantitativeMistakes: mistakes.quantitative_mistakes,
    verbalMistakes: mistakes.verbal_mistakes,
    summariesCount: summaries.total_summaries,
    lastActivityAt: row?.last_activity_at ?? null,
    lastActivityLabel: row?.last_activity_label ?? null,
    todayTasks,
    upcomingTasks,
    weeklyGoal,
    resumeItems,
    recommendations: buildRecommendationSet({
      daysLeft,
      totalMistakes: mistakes.total_mistakes,
      summariesCount: summaries.total_summaries,
      planPressure,
      planType,
    }),
  } satisfies StudentPortalData;
}

async function readPortalRow(userId: string) {
  const sql = getSql();
  const rows = (await sql.query(
    `
      select
        u.id::text as user_id,
        u.full_name,
        sp.onboarding_completed,
        sp.exam_date::text,
        sp.daily_minutes,
        sp.plan_type,
        sp.quant_remaining_sections,
        sp.verbal_remaining_sections,
        sp.current_level::text,
        sp.quantitative_score,
        sp.verbal_score,
        sp.overall_score,
        sp.last_activity_at::text,
        sp.last_activity_label,
        sp.last_opened_summary_id::text,
        sp.last_opened_summary_name,
        sp.last_opened_summary_page,
        sp.last_opened_bank_href,
        sp.last_opened_bank_label
      from app_users u
      left join app_student_profiles sp on sp.user_id = u.id
      where u.id = $1::uuid
      limit 1
    `,
    [userId],
  )) as StudentPortalRow[];

  return rows[0] ?? null;
}

export async function getStudentPortalData(userId: string) {
  await ensureStudentPortalSchema();

  const portalRow = await readPortalRow(userId);
  if (!portalRow) {
    throw new Error("تعذر العثور على ملف الطالب.");
  }

  const mistakes = await getMistakeStats(userId);
  const summaries = await getSummaryStats(userId);

  if (portalRow.onboarding_completed) {
    const tasks = await listPlanTasks(userId);
    if (!tasks.length) {
      await rebuildStudentPlan(userId);
    }
  }

  const nextTasks = await listPlanTasks(userId);
  return mapPortalData(portalRow, nextTasks, mistakes, summaries);
}

export async function saveStudentOnboarding(userId: string, input: OnboardingInput) {
  await ensureStudentPortalSchema();

  const sql = getSql();
  const dailyMinutes = toDailyMinutes(input.dailyStudyHours);
  const computedExamDate =
    input.examDate ||
    (input.daysLeft != null ? formatDateOnly(addDays(new Date(), Math.max(input.daysLeft, 0))) : null);

  const quantRemainingSections = normalizeNullableInteger(input.quantRemainingSections);
  const verbalRemainingSections = normalizeNullableInteger(input.verbalRemainingSections);

  await sql.query(
    `
      insert into app_student_profiles (
        user_id,
        exam_date,
        daily_minutes,
        plan_type,
        quant_remaining_sections,
        verbal_remaining_sections,
        onboarding_completed,
        last_activity_at,
        last_activity_label
      )
      values (
        $1::uuid,
        $2::date,
        $3,
        $4,
        $5,
        $6,
        true,
        now(),
        'تم إعداد الخطة الذكية'
      )
      on conflict (user_id)
      do update set
        exam_date = excluded.exam_date,
        daily_minutes = excluded.daily_minutes,
        plan_type = excluded.plan_type,
        quant_remaining_sections = excluded.quant_remaining_sections,
        verbal_remaining_sections = excluded.verbal_remaining_sections,
        onboarding_completed = true,
        last_activity_at = now(),
        last_activity_label = 'تم تحديث إعدادات الخطة'
    `,
    [
      userId,
      computedExamDate,
      dailyMinutes,
      input.planType,
      quantRemainingSections,
      verbalRemainingSections,
    ],
  );

  const mistakes = await getMistakeStats(userId);
  const summaries = await getSummaryStats(userId);
  const row = await readPortalRow(userId);

  if (!row) {
    throw new Error("تعذر حفظ بيانات الإعداد الأولي.");
  }

  const generatedTasks = buildPlanTasks({
    quantRemainingSections: inferRemainingSections(
      quantRemainingSections,
      row.quantitative_score ?? null,
      DEFAULT_QUANT_SECTIONS,
    ),
    verbalRemainingSections: inferRemainingSections(
      verbalRemainingSections,
      row.verbal_score ?? null,
      DEFAULT_VERBAL_SECTIONS,
    ),
    dailyMinutes,
    daysLeft: calculateDaysLeft(computedExamDate),
    planType: input.planType,
    totalMistakes: mistakes.total_mistakes,
    summariesCount: summaries.total_summaries,
  });

  await replaceUpcomingTasks(userId, generatedTasks, computedExamDate);
  return getStudentPortalData(userId);
}

export async function rebuildStudentPlan(userId: string) {
  await ensureStudentPortalSchema();
  const row = await readPortalRow(userId);
  if (!row) {
    throw new Error("تعذر العثور على بيانات الطالب لإعادة بناء الخطة.");
  }

  const mistakes = await getMistakeStats(userId);
  const summaries = await getSummaryStats(userId);
  const dailyMinutes = row.daily_minutes ?? DEFAULT_DAILY_MINUTES;
  const generatedTasks = buildPlanTasks({
    quantRemainingSections: inferRemainingSections(
      row.quant_remaining_sections,
      row.quantitative_score ?? null,
      DEFAULT_QUANT_SECTIONS,
    ),
    verbalRemainingSections: inferRemainingSections(
      row.verbal_remaining_sections,
      row.verbal_score ?? null,
      DEFAULT_VERBAL_SECTIONS,
    ),
    dailyMinutes,
    daysLeft: calculateDaysLeft(row.exam_date),
    planType: toPlanType(row.plan_type),
    totalMistakes: mistakes.total_mistakes,
    summariesCount: summaries.total_summaries,
  });

  await replaceUpcomingTasks(userId, generatedTasks, row.exam_date);
  await getSql().query(
    `
      update app_student_profiles
      set last_activity_at = now(),
          last_activity_label = 'أعيد ضبط الخطة'
      where user_id = $1::uuid
    `,
    [userId],
  );

  return getStudentPortalData(userId);
}

export async function postponeTodayTasks(userId: string) {
  await ensureStudentPortalSchema();
  const sql = getSql();

  await sql.query(
    `
      update app_study_plan_tasks tasks
      set scheduled_for = current_date + interval '1 day'
      from app_study_plans plans
      where plans.id = tasks.study_plan_id
        and plans.user_id = $1::uuid
        and plans.is_active = true
        and tasks.scheduled_for = current_date
        and tasks.is_completed = false
    `,
    [userId],
  );

  await sql.query(
    `
      update app_student_profiles
      set last_activity_at = now(),
          last_activity_label = 'تم تأجيل مهام اليوم'
      where user_id = $1::uuid
    `,
    [userId],
  );

  return getStudentPortalData(userId);
}

export async function setStudentTaskCompletion(userId: string, taskId: number, completed: boolean) {
  await ensureStudentPortalSchema();
  const sql = getSql();

  const rows = (await sql.query(
    `
      update app_study_plan_tasks tasks
      set
        is_completed = $3::boolean,
        completed_at = case when $3::boolean then now() else null end
      from app_study_plans plans
      where plans.id = tasks.study_plan_id
        and plans.user_id = $1::uuid
        and plans.is_active = true
        and tasks.id = $2::bigint
      returning tasks.id
    `,
    [userId, taskId, completed],
  )) as Array<{ id: number }>;

  if (!rows[0]) {
    throw new Error("تعذر تحديث حالة المهمة.");
  }

  await sql.query(
    `
      update app_student_profiles
      set last_activity_at = now(),
          last_activity_label = $2
      where user_id = $1::uuid
    `,
    [userId, completed ? "اكتملت مهمة من الخطة" : "أعيدت مهمة إلى غير منجزة"],
  );

  return getStudentPortalData(userId);
}

export async function recordStudentActivity(userId: string, input: StudentActivityInput) {
  await ensureStudentPortalSchema();
  const sql = getSql();

  await sql.query(
    `
      insert into app_student_profiles (
        user_id,
        onboarding_completed,
        last_activity_at,
        last_activity_label,
        last_opened_summary_id,
        last_opened_summary_name,
        last_opened_summary_page,
        last_opened_bank_href,
        last_opened_bank_label,
        last_opened_path
      )
      values (
        $1::uuid,
        false,
        now(),
        $2,
        $3::uuid,
        $4,
        $5,
        $6,
        $7,
        $8
      )
      on conflict (user_id)
      do update set
        last_activity_at = now(),
        last_activity_label = excluded.last_activity_label,
        last_opened_summary_id = coalesce(excluded.last_opened_summary_id, app_student_profiles.last_opened_summary_id),
        last_opened_summary_name = coalesce(excluded.last_opened_summary_name, app_student_profiles.last_opened_summary_name),
        last_opened_summary_page = coalesce(excluded.last_opened_summary_page, app_student_profiles.last_opened_summary_page),
        last_opened_bank_href = coalesce(excluded.last_opened_bank_href, app_student_profiles.last_opened_bank_href),
        last_opened_bank_label = coalesce(excluded.last_opened_bank_label, app_student_profiles.last_opened_bank_label),
        last_opened_path = excluded.last_opened_path
    `,
    [
      userId,
      input.label,
      input.summaryId,
      input.summaryName,
      input.summaryPage,
      input.bankHref,
      input.bankLabel,
      input.path,
    ],
  );
}
