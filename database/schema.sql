create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

create type app_user_role as enum ('student', 'admin', 'editor', 'coach');
create type app_subscription_status as enum ('trial', 'active', 'past_due', 'cancelled', 'expired');
create type app_plan_interval as enum ('monthly', 'quarterly', 'yearly', 'lifetime');
create type app_bank_section as enum ('verbal', 'quantitative', 'mixed');
create type app_bank_kind as enum ('question_bank', 'passage_bank', 'paper_model', 'mock_exam');
create type app_question_type as enum (
  'analogy',
  'sentence_completion',
  'contextual_error',
  'odd_word',
  'reading_passage',
  'quantitative_problem',
  'mixed'
);
create type app_difficulty as enum ('easy', 'medium', 'hard', 'elite');
create type app_attempt_status as enum ('in_progress', 'submitted', 'reviewed');
create type app_answer_state as enum ('answered', 'skipped', 'flagged');
create type app_review_bucket as enum ('saved', 'incorrect', 'weak', 'late');
create type app_task_kind as enum ('diagnostic', 'practice', 'review', 'mock_exam');

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  email varchar(255) not null unique,
  phone varchar(30),
  full_name varchar(160) not null,
  password_hash text,
  role app_user_role not null default 'student',
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

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
);

create table if not exists app_subscription_plans (
  id uuid primary key default gen_random_uuid(),
  slug varchar(100) not null unique,
  plan_name varchar(120) not null,
  description text,
  interval app_plan_interval not null,
  price_sar numeric(10,2) not null,
  question_limit integer,
  mock_exam_limit integer,
  supports_study_plan boolean not null default true,
  supports_diagnostics boolean not null default true,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app_user_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  plan_id uuid not null references app_subscription_plans(id),
  status app_subscription_status not null default 'trial',
  starts_at timestamptz not null default now(),
  ends_at timestamptz,
  auto_renew boolean not null default false,
  external_provider varchar(80),
  external_reference varchar(160),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists idx_user_subscriptions_active
  on app_user_subscriptions (user_id, status)
  where status in ('trial', 'active');

create table if not exists app_skills (
  id bigserial primary key,
  section app_bank_section not null,
  skill_name varchar(160) not null,
  skill_slug varchar(160) not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table if not exists app_tags (
  id bigserial primary key,
  tag_name varchar(120) not null unique,
  tag_slug varchar(120) not null unique,
  created_at timestamptz not null default now()
);

create table if not exists app_question_banks (
  id bigserial primary key,
  slug varchar(160) not null unique,
  title varchar(255) not null,
  subtitle varchar(255),
  section app_bank_section not null,
  kind app_bank_kind not null default 'question_bank',
  question_type app_question_type not null default 'mixed',
  description text,
  total_questions bigint not null default 0,
  difficulty app_difficulty,
  is_published boolean not null default false,
  created_by uuid references app_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_question_banks_section_kind
  on app_question_banks (section, kind, is_published);

create table if not exists app_passages (
  id bigserial primary key,
  bank_id bigint not null references app_question_banks(id) on delete cascade,
  title varchar(255),
  passage_text text not null,
  source_name varchar(160),
  estimated_read_seconds integer,
  difficulty app_difficulty default 'medium',
  created_by uuid references app_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_passages_bank_id on app_passages(bank_id);

create table if not exists app_questions (
  id bigserial primary key,
  bank_id bigint not null references app_question_banks(id) on delete cascade,
  passage_id bigint references app_passages(id) on delete set null,
  skill_id bigint references app_skills(id) on delete set null,
  question_code varchar(80) unique,
  section app_bank_section not null,
  question_type app_question_type not null,
  difficulty app_difficulty not null default 'medium',
  question_text text not null,
  explanation text,
  hint text,
  correct_choice_key varchar(8),
  usage_count bigint not null default 0,
  save_count bigint not null default 0,
  error_count bigint not null default 0,
  average_seconds integer,
  is_published boolean not null default false,
  created_by uuid references app_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_questions_bank_filters
  on app_questions (bank_id, section, question_type, difficulty, skill_id, is_published);

create index if not exists idx_questions_passage_id
  on app_questions (passage_id);

create index if not exists idx_questions_usage
  on app_questions (usage_count desc, error_count desc);

create index if not exists idx_questions_text_trgm
  on app_questions using gin (question_text gin_trgm_ops);

create index if not exists idx_questions_text_search
  on app_questions using gin (to_tsvector('simple', coalesce(question_text, '')));

create table if not exists app_question_choices (
  id bigserial primary key,
  question_id bigint not null references app_questions(id) on delete cascade,
  choice_key varchar(8) not null,
  choice_text text not null,
  is_correct boolean not null default false,
  sort_order smallint not null default 1,
  created_at timestamptz not null default now(),
  unique (question_id, choice_key)
);

create index if not exists idx_question_choices_question
  on app_question_choices(question_id, sort_order);

create table if not exists app_question_tags (
  question_id bigint not null references app_questions(id) on delete cascade,
  tag_id bigint not null references app_tags(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (question_id, tag_id)
);

create table if not exists app_mock_exams (
  id bigserial primary key,
  slug varchar(160) not null unique,
  title varchar(255) not null,
  description text,
  duration_minutes integer not null,
  total_questions integer not null,
  section app_bank_section not null default 'mixed',
  is_published boolean not null default false,
  created_by uuid references app_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app_mock_exam_questions (
  mock_exam_id bigint not null references app_mock_exams(id) on delete cascade,
  question_id bigint not null references app_questions(id) on delete cascade,
  sort_order integer not null,
  primary key (mock_exam_id, question_id)
);

create index if not exists idx_mock_exam_questions_order
  on app_mock_exam_questions (mock_exam_id, sort_order);

create table if not exists app_attempts (
  id bigserial primary key,
  user_id uuid not null references app_users(id) on delete cascade,
  bank_id bigint references app_question_banks(id) on delete set null,
  mock_exam_id bigint references app_mock_exams(id) on delete set null,
  status app_attempt_status not null default 'in_progress',
  started_at timestamptz not null default now(),
  submitted_at timestamptz,
  score numeric(6,2),
  accuracy numeric(6,2),
  total_questions integer,
  total_correct integer,
  total_wrong integer,
  total_skipped integer,
  total_seconds integer,
  created_at timestamptz not null default now()
);

create index if not exists idx_attempts_user_status
  on app_attempts (user_id, status, started_at desc);

create table if not exists app_attempt_answers (
  id bigserial primary key,
  attempt_id bigint not null references app_attempts(id) on delete cascade,
  question_id bigint not null references app_questions(id) on delete cascade,
  selected_choice_key varchar(8),
  is_correct boolean,
  answer_state app_answer_state not null default 'answered',
  confidence_score smallint,
  elapsed_seconds integer,
  answered_at timestamptz not null default now(),
  unique (attempt_id, question_id)
);

create index if not exists idx_attempt_answers_question
  on app_attempt_answers (question_id, is_correct, elapsed_seconds);

create table if not exists app_review_queue (
  id bigserial primary key,
  user_id uuid not null references app_users(id) on delete cascade,
  question_id bigint not null references app_questions(id) on delete cascade,
  bucket app_review_bucket not null,
  reason text,
  last_seen_at timestamptz,
  due_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, question_id, bucket)
);

create index if not exists idx_review_queue_user_bucket
  on app_review_queue (user_id, bucket, due_at nulls first);

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
);

create index if not exists idx_study_plans_user_active
  on app_study_plans (user_id, is_active, created_at desc);

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
);

create index if not exists idx_study_plan_tasks_schedule
  on app_study_plan_tasks (study_plan_id, scheduled_for, is_completed, sort_order);

create table if not exists app_user_saved_searches (
  id bigserial primary key,
  user_id uuid not null references app_users(id) on delete cascade,
  query_text varchar(255) not null,
  filters jsonb not null default '{}'::jsonb,
  last_used_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_saved_searches_user_recent
  on app_user_saved_searches (user_id, last_used_at desc);

create or replace view app_bank_overview as
select
  qb.id,
  qb.slug,
  qb.title,
  qb.section,
  qb.kind,
  qb.question_type,
  qb.is_published,
  count(q.id) as published_questions,
  count(distinct q.passage_id) filter (where q.passage_id is not null) as linked_passages,
  coalesce(sum(q.usage_count), 0) as total_usage,
  coalesce(sum(q.error_count), 0) as total_errors
from app_question_banks qb
left join app_questions q on q.bank_id = qb.id and q.is_published = true
group by qb.id, qb.slug, qb.title, qb.section, qb.kind, qb.question_type, qb.is_published;
