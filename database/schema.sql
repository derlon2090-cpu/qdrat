create extension if not exists pgcrypto;
create extension if not exists pg_trgm;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_user_role') then
    create type app_user_role as enum ('student', 'admin', 'editor', 'coach');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_subscription_status') then
    create type app_subscription_status as enum ('trial', 'active', 'past_due', 'cancelled', 'expired');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_plan_interval') then
    create type app_plan_interval as enum ('monthly', 'quarterly', 'yearly', 'lifetime');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_bank_section') then
    create type app_bank_section as enum ('verbal', 'quantitative', 'mixed');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_bank_kind') then
    create type app_bank_kind as enum ('question_bank', 'passage_bank', 'paper_model', 'mock_exam');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_question_type') then
    create type app_question_type as enum (
      'analogy',
      'sentence_completion',
      'contextual_error',
      'odd_word',
      'reading_passage',
      'quantitative_problem',
      'mixed'
    );
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_difficulty') then
    create type app_difficulty as enum ('easy', 'medium', 'hard', 'elite');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_attempt_status') then
    create type app_attempt_status as enum ('in_progress', 'submitted', 'reviewed');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_answer_state') then
    create type app_answer_state as enum ('answered', 'skipped', 'flagged');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_review_bucket') then
    create type app_review_bucket as enum ('saved', 'incorrect', 'weak', 'late');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_task_kind') then
    create type app_task_kind as enum ('diagnostic', 'practice', 'review', 'mock_exam');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_publish_status') then
    create type app_publish_status as enum ('draft', 'published');
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'app_user_gender') then
    create type app_user_gender as enum ('male', 'female');
  end if;
end
$$;

create table if not exists app_users (
  id uuid primary key default gen_random_uuid(),
  email varchar(255) not null unique,
  username varchar(60) unique,
  phone varchar(30),
  full_name varchar(160) not null,
  gender app_user_gender,
  password_hash text,
  role app_user_role not null default 'student',
  is_active boolean not null default true,
  last_login_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table app_users
  add column if not exists gender app_user_gender;

create table if not exists app_user_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  session_token_hash varchar(64) not null unique,
  user_agent text,
  ip_address varchar(120),
  expires_at timestamptz not null,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create index if not exists idx_app_user_sessions_user_id
  on app_user_sessions (user_id, expires_at desc);

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
  sort_order smallint not null default 1,
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

create table if not exists app_subscription_plan_features (
  id bigserial primary key,
  plan_id uuid not null references app_subscription_plans(id) on delete cascade,
  feature_key varchar(80) not null,
  feature_label varchar(160) not null,
  feature_value varchar(255),
  is_enabled boolean not null default true,
  sort_order smallint not null default 1,
  created_at timestamptz not null default now(),
  unique (plan_id, feature_key)
);

create index if not exists idx_plan_features_plan_sort
  on app_subscription_plan_features (plan_id, sort_order);

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

create table if not exists app_question_sources (
  id bigserial primary key,
  source_slug varchar(160) not null unique,
  source_name varchar(255) not null,
  source_type varchar(80),
  file_name varchar(255),
  storage_path text,
  author_name varchar(160),
  notes text,
  uploaded_at timestamptz not null default now(),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists app_import_batches (
  id bigserial primary key,
  source_id bigint references app_question_sources(id) on delete set null,
  batch_name varchar(255) not null,
  imported_by uuid references app_users(id),
  section app_bank_section,
  total_rows integer not null default 0,
  inserted_rows integer not null default 0,
  rejected_rows integer not null default 0,
  notes text,
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
  source_id bigint references app_question_sources(id) on delete set null,
  piece_number integer,
  piece_title varchar(255),
  title varchar(255),
  passage_text text not null,
  source_name varchar(160),
  estimated_read_seconds integer,
  difficulty app_difficulty default 'medium',
  raw_page_from integer,
  raw_page_to integer,
  parsing_confidence numeric(5,2),
  needs_review boolean not null default false,
  raw_payload jsonb not null default '{}'::jsonb,
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
  source_id bigint references app_question_sources(id) on delete set null,
  import_batch_id bigint references app_import_batches(id) on delete set null,
  question_code varchar(80) unique,
  section app_bank_section not null,
  question_type app_question_type not null,
  difficulty app_difficulty not null default 'medium',
  question_order integer not null default 1,
  question_text text not null,
  explanation text,
  hint text,
  correct_choice_key varchar(8),
  answer_source varchar(40),
  answer_confidence numeric(5,2),
  needs_review boolean not null default false,
  raw_payload jsonb not null default '{}'::jsonb,
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
  color_hint varchar(80),
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

create table if not exists app_user_mistakes (
  id bigserial primary key,
  user_id uuid not null references app_users(id) on delete cascade,
  question_key varchar(255) not null,
  question_id bigint references app_questions(id) on delete set null,
  section app_bank_section not null,
  source_bank varchar(255) not null,
  question_type_label varchar(120) not null,
  question_text text not null,
  question_href text,
  correct_count integer not null default 0,
  removal_threshold integer not null default 5,
  mastery_state varchar(20) not null default 'incorrect',
  incorrect_count integer not null default 1,
  training_attempts_count integer not null default 0,
  training_correct_count integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  last_incorrect_at timestamptz,
  last_correct_at timestamptz,
  last_trained_at timestamptz,
  mastered_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, question_key)
);

create index if not exists idx_app_user_mistakes_user_section
  on app_user_mistakes (user_id, section, updated_at desc);

create index if not exists idx_app_user_mistakes_question_key
  on app_user_mistakes (question_key);

create index if not exists idx_app_user_mistakes_user_state
  on app_user_mistakes (user_id, mastery_state, updated_at desc);

create table if not exists app_user_question_progress (
  id bigserial primary key,
  user_id uuid not null references app_users(id) on delete cascade,
  question_key varchar(255) not null,
  question_id bigint,
  section app_bank_section not null,
  source_bank varchar(180) not null,
  category_id varchar(80),
  category_title varchar(180),
  question_type_label varchar(180) not null,
  question_text text not null,
  question_href text,
  selected_answer text,
  correct_answer text,
  attempts_count integer not null default 0,
  correct_attempts_count integer not null default 0,
  is_solved boolean not null default false,
  xp_earned integer not null default 0,
  metadata jsonb not null default '{}'::jsonb,
  first_solved_at timestamptz,
  last_attempt_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, question_key)
);

create index if not exists idx_app_user_question_progress_user_solved
  on app_user_question_progress (user_id, is_solved, updated_at desc);

create index if not exists idx_app_user_question_progress_user_category
  on app_user_question_progress (user_id, section, category_id);

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

create table if not exists app_extraction_reviews (
  id bigserial primary key,
  source_id bigint references app_question_sources(id) on delete cascade,
  passage_id bigint references app_passages(id) on delete cascade,
  question_id bigint references app_questions(id) on delete cascade,
  issue_type varchar(80) not null,
  issue_details text,
  confidence_score numeric(5,2),
  status varchar(30) not null default 'pending',
  review_notes text,
  reviewed_by uuid references app_users(id) on delete set null,
  reviewed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists idx_extraction_reviews_status
  on app_extraction_reviews (status, issue_type, created_at desc);

create index if not exists idx_extraction_reviews_source
  on app_extraction_reviews (source_id, passage_id, question_id);

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

alter table if exists app_users
  add column if not exists username varchar(60);

create unique index if not exists idx_app_users_username
  on app_users (username)
  where username is not null;

create unique index if not exists idx_app_users_phone
  on app_users (phone)
  where phone is not null;

alter table if exists app_subscription_plans
  add column if not exists sort_order smallint not null default 1;

alter table if exists app_question_banks
  add column if not exists search_priority smallint not null default 1,
  add column if not exists estimated_total_size bigint not null default 0;

alter table if exists app_question_sources
  add column if not exists file_name varchar(255),
  add column if not exists storage_path text,
  add column if not exists notes text,
  add column if not exists uploaded_at timestamptz not null default now();

alter table if exists app_passages
  add column if not exists source_id bigint references app_question_sources(id) on delete set null,
  add column if not exists piece_number integer,
  add column if not exists piece_title varchar(255),
  add column if not exists raw_page_from integer,
  add column if not exists raw_page_to integer,
  add column if not exists parsing_confidence numeric(5,2),
  add column if not exists needs_review boolean not null default false,
  add column if not exists raw_payload jsonb not null default '{}'::jsonb;

alter table if exists app_questions
  add column if not exists source_id bigint references app_question_sources(id) on delete set null,
  add column if not exists import_batch_id bigint references app_import_batches(id) on delete set null,
  add column if not exists question_order integer not null default 1,
  add column if not exists answer_source varchar(40),
  add column if not exists answer_confidence numeric(5,2),
  add column if not exists needs_review boolean not null default false,
  add column if not exists raw_payload jsonb not null default '{}'::jsonb;

alter table if exists app_question_choices
  add column if not exists color_hint varchar(80);

alter table if exists app_student_profiles
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
  add column if not exists last_opened_path text;

alter table if exists app_user_question_progress
  add column if not exists question_id bigint,
  add column if not exists category_id varchar(80),
  add column if not exists category_title varchar(180),
  add column if not exists selected_answer text,
  add column if not exists correct_answer text,
  add column if not exists attempts_count integer not null default 0,
  add column if not exists correct_attempts_count integer not null default 0,
  add column if not exists is_solved boolean not null default false,
  add column if not exists xp_earned integer not null default 0,
  add column if not exists metadata jsonb not null default '{}'::jsonb,
  add column if not exists first_solved_at timestamptz,
  add column if not exists last_attempt_at timestamptz,
  add column if not exists updated_at timestamptz not null default now();

alter table if exists app_user_mistakes
  add column if not exists mastery_state varchar(20) not null default 'incorrect',
  add column if not exists incorrect_count integer not null default 1,
  add column if not exists training_attempts_count integer not null default 0,
  add column if not exists training_correct_count integer not null default 0,
  add column if not exists last_incorrect_at timestamptz,
  add column if not exists last_correct_at timestamptz,
  add column if not exists last_trained_at timestamptz,
  add column if not exists mastered_at timestamptz;

create table if not exists app_verbal_passages (
  id uuid primary key default gen_random_uuid(),
  slug varchar(180),
  title varchar(255) not null,
  normalized_title text not null,
  keywords text[] not null default '{}'::text[],
  keyword_search text not null default '',
  passage_text text not null,
  normalized_passage_text text not null,
  title_hash varchar(64) not null,
  passage_hash varchar(64) not null,
  status app_publish_status not null default 'draft',
  external_source_id varchar(160),
  version integer not null default 1,
  raw_payload jsonb not null default '{}'::jsonb,
  created_by uuid references app_users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (title_hash, passage_hash)
);

alter table app_verbal_passages
  add column if not exists slug varchar(180);

update app_verbal_passages
set slug = coalesce(
  nullif(trim(slug), ''),
  nullif(lower(regexp_replace(coalesce(external_source_id, ''), '[^a-z0-9]+', '-', 'g')), ''),
  'passage-' || substr(id::text, 1, 8)
)
where slug is null
   or length(trim(slug)) = 0;

create index if not exists idx_app_verbal_passages_status
  on app_verbal_passages (status, updated_at desc);

create unique index if not exists idx_app_verbal_passages_slug_unique
  on app_verbal_passages (slug);

create index if not exists idx_app_verbal_passages_title_trgm
  on app_verbal_passages using gin (normalized_title gin_trgm_ops);

create index if not exists idx_app_verbal_passages_keywords_trgm
  on app_verbal_passages using gin (keyword_search gin_trgm_ops);

create table if not exists app_verbal_passage_questions (
  id uuid primary key default gen_random_uuid(),
  passage_id uuid not null references app_verbal_passages(id) on delete cascade,
  question_order integer not null default 1,
  question_text text not null,
  option_a text not null,
  option_b text not null,
  option_c text not null,
  option_d text not null,
  correct_option varchar(1) not null,
  explanation text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (passage_id, question_order)
);

create index if not exists idx_app_verbal_passage_questions_passage
  on app_verbal_passage_questions (passage_id, question_order);

create table if not exists app_user_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  file_name varchar(255) not null,
  file_mime_type varchar(120) not null default 'application/pdf',
  file_size_bytes integer not null default 0,
  file_data_base64 text not null,
  page_count integer not null default 1,
  page_dimensions jsonb not null default '[]'::jsonb,
  last_opened_page integer not null default 1,
  last_used_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_app_user_summaries_user_last_used
  on app_user_summaries (user_id, last_used_at desc);

create table if not exists app_user_summary_page_states (
  id uuid primary key default gen_random_uuid(),
  summary_id uuid not null references app_user_summaries(id) on delete cascade,
  user_id uuid not null references app_users(id) on delete cascade,
  page_number integer not null,
  note_text text not null default '',
  reviewed boolean not null default false,
  page_color varchar(20),
  hide_regions jsonb not null default '[]'::jsonb,
  solution_boxes jsonb not null default '[]'::jsonb,
  drawings jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (summary_id, page_number)
);

create index if not exists idx_app_user_summary_page_states_summary_page
  on app_user_summary_page_states (summary_id, page_number);

create index if not exists idx_app_user_summary_page_states_user_updated
  on app_user_summary_page_states (user_id, updated_at desc);

create table if not exists app_user_summary_upload_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references app_users(id) on delete cascade,
  file_name varchar(255) not null,
  file_mime_type varchar(120) not null default 'application/pdf',
  file_size_bytes integer not null default 0,
  total_chunks integer not null,
  status varchar(20) not null default 'uploading',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists app_user_summary_upload_chunks (
  session_id uuid not null references app_user_summary_upload_sessions(id) on delete cascade,
  chunk_index integer not null,
  chunk_data_base64 text not null,
  created_at timestamptz not null default now(),
  primary key (session_id, chunk_index)
);

create index if not exists idx_app_user_summary_upload_sessions_user_created
  on app_user_summary_upload_sessions (user_id, created_at desc);

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'chk_app_users_email_not_blank') then
    alter table app_users
      add constraint chk_app_users_email_not_blank check (length(trim(email)) > 3);
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'chk_app_user_mistakes_counts_nonnegative') then
    alter table app_user_mistakes
      add constraint chk_app_user_mistakes_counts_nonnegative check (
        correct_count >= 0
        and incorrect_count >= 0
        and training_attempts_count >= 0
        and training_correct_count >= 0
        and removal_threshold > 0
        and training_correct_count <= training_attempts_count
      );
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'chk_app_user_mistakes_mastery_state') then
    alter table app_user_mistakes
      add constraint chk_app_user_mistakes_mastery_state check (
        mastery_state in ('incorrect', 'training', 'mastered')
      );
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'chk_app_user_question_progress_counts_nonnegative') then
    alter table app_user_question_progress
      add constraint chk_app_user_question_progress_counts_nonnegative check (
        attempts_count >= 0
        and correct_attempts_count >= 0
        and correct_attempts_count <= attempts_count
        and xp_earned >= 0
      );
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'chk_app_subscription_plans_price_nonnegative') then
    alter table app_subscription_plans
      add constraint chk_app_subscription_plans_price_nonnegative check (price_sar >= 0);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'chk_app_subscription_plans_limits_nonnegative') then
    alter table app_subscription_plans
      add constraint chk_app_subscription_plans_limits_nonnegative check (
        coalesce(question_limit, 0) >= 0 and coalesce(mock_exam_limit, 0) >= 0
      );
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'chk_app_question_banks_total_questions_nonnegative') then
    alter table app_question_banks
      add constraint chk_app_question_banks_total_questions_nonnegative check (total_questions >= 0);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'chk_app_question_banks_estimated_total_size_nonnegative') then
    alter table app_question_banks
      add constraint chk_app_question_banks_estimated_total_size_nonnegative check (estimated_total_size >= 0);
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'chk_app_questions_usage_nonnegative') then
    alter table app_questions
      add constraint chk_app_questions_usage_nonnegative check (
        usage_count >= 0 and save_count >= 0 and error_count >= 0
      );
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'chk_app_passages_page_bounds') then
    alter table app_passages
      add constraint chk_app_passages_page_bounds check (
        coalesce(raw_page_from, 0) >= 0 and coalesce(raw_page_to, 0) >= coalesce(raw_page_from, 0)
      );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'chk_app_questions_answer_confidence_range') then
    alter table app_questions
      add constraint chk_app_questions_answer_confidence_range check (
        answer_confidence is null or (answer_confidence >= 0 and answer_confidence <= 1)
      );
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'chk_app_study_plan_tasks_numbers_nonnegative') then
    alter table app_study_plan_tasks
      add constraint chk_app_study_plan_tasks_numbers_nonnegative check (
        coalesce(estimated_minutes, 0) >= 0 and coalesce(target_questions, 0) >= 0
      );
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'chk_app_user_summary_upload_sessions_numbers_nonnegative') then
    alter table app_user_summary_upload_sessions
      add constraint chk_app_user_summary_upload_sessions_numbers_nonnegative check (
        file_size_bytes >= 0 and total_chunks > 0
      );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'chk_app_user_summary_upload_sessions_status') then
    alter table app_user_summary_upload_sessions
      add constraint chk_app_user_summary_upload_sessions_status check (
        status in ('uploading', 'completed', 'cancelled')
      );
  end if;

  if not exists (select 1 from pg_constraint where conname = 'chk_app_user_summary_upload_chunks_index_nonnegative') then
    alter table app_user_summary_upload_chunks
      add constraint chk_app_user_summary_upload_chunks_index_nonnegative check (chunk_index >= 0);
  end if;
end
$$;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'chk_app_verbal_passages_version_positive') then
    alter table app_verbal_passages
      add constraint chk_app_verbal_passages_version_positive check (version > 0);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'chk_app_verbal_passages_title_not_blank') then
    alter table app_verbal_passages
      add constraint chk_app_verbal_passages_title_not_blank check (length(trim(title)) > 0);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'chk_app_verbal_passages_slug_not_blank') then
    alter table app_verbal_passages
      add constraint chk_app_verbal_passages_slug_not_blank check (length(trim(slug)) > 0);
  end if;

  if not exists (select 1 from pg_constraint where conname = 'chk_app_verbal_passage_questions_correct_option') then
    alter table app_verbal_passage_questions
      add constraint chk_app_verbal_passage_questions_correct_option check (correct_option in ('A', 'B', 'C', 'D'));
  end if;
end
$$;

create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_app_users_updated_at on app_users;
create trigger trg_app_users_updated_at before update on app_users
for each row execute function set_updated_at();

drop trigger if exists trg_app_user_mistakes_updated_at on app_user_mistakes;
create trigger trg_app_user_mistakes_updated_at before update on app_user_mistakes
for each row execute function set_updated_at();

drop trigger if exists trg_app_user_question_progress_updated_at on app_user_question_progress;
create trigger trg_app_user_question_progress_updated_at before update on app_user_question_progress
for each row execute function set_updated_at();

drop trigger if exists trg_app_student_profiles_updated_at on app_student_profiles;
create trigger trg_app_student_profiles_updated_at before update on app_student_profiles
for each row execute function set_updated_at();

drop trigger if exists trg_app_subscription_plans_updated_at on app_subscription_plans;
create trigger trg_app_subscription_plans_updated_at before update on app_subscription_plans
for each row execute function set_updated_at();

drop trigger if exists trg_app_user_subscriptions_updated_at on app_user_subscriptions;
create trigger trg_app_user_subscriptions_updated_at before update on app_user_subscriptions
for each row execute function set_updated_at();

drop trigger if exists trg_app_question_banks_updated_at on app_question_banks;
create trigger trg_app_question_banks_updated_at before update on app_question_banks
for each row execute function set_updated_at();

drop trigger if exists trg_app_passages_updated_at on app_passages;
create trigger trg_app_passages_updated_at before update on app_passages
for each row execute function set_updated_at();

drop trigger if exists trg_app_questions_updated_at on app_questions;
create trigger trg_app_questions_updated_at before update on app_questions
for each row execute function set_updated_at();

drop trigger if exists trg_app_mock_exams_updated_at on app_mock_exams;
create trigger trg_app_mock_exams_updated_at before update on app_mock_exams
for each row execute function set_updated_at();

drop trigger if exists trg_app_study_plans_updated_at on app_study_plans;
create trigger trg_app_study_plans_updated_at before update on app_study_plans
for each row execute function set_updated_at();

drop trigger if exists trg_app_verbal_passages_updated_at on app_verbal_passages;
create trigger trg_app_verbal_passages_updated_at before update on app_verbal_passages
for each row execute function set_updated_at();

drop trigger if exists trg_app_verbal_passage_questions_updated_at on app_verbal_passage_questions;
create trigger trg_app_verbal_passage_questions_updated_at before update on app_verbal_passage_questions
for each row execute function set_updated_at();

drop trigger if exists trg_app_user_summaries_updated_at on app_user_summaries;
create trigger trg_app_user_summaries_updated_at before update on app_user_summaries
for each row execute function set_updated_at();

drop trigger if exists trg_app_user_summary_page_states_updated_at on app_user_summary_page_states;
create trigger trg_app_user_summary_page_states_updated_at before update on app_user_summary_page_states
for each row execute function set_updated_at();

drop trigger if exists trg_app_user_summary_upload_sessions_updated_at on app_user_summary_upload_sessions;
create trigger trg_app_user_summary_upload_sessions_updated_at before update on app_user_summary_upload_sessions
for each row execute function set_updated_at();

drop view if exists app_user_accounts_overview;

create view app_user_accounts_overview as
select
  u.id as user_id,
  u.full_name,
  case
    when u.email like '%@miyaar.local' then null
    else u.email
  end as email,
  u.phone,
  u.gender,
  u.role,
  u.is_active,
  u.last_login_at,
  u.created_at as user_created_at,
  u.updated_at as user_updated_at,
  sp.target_score,
  sp.exam_date,
  sp.daily_minutes,
  sp.current_level,
  sp.verbal_score,
  sp.quantitative_score,
  sp.overall_score,
  subscription.plan_name,
  subscription.subscription_status,
  subscription.subscription_starts_at,
  subscription.subscription_ends_at,
  coalesce(session_stats.active_sessions, 0) as active_sessions,
  session_stats.last_seen_at as last_session_seen_at,
  coalesce(mistake_stats.total_mistakes, 0) as total_mistakes,
  coalesce(mistake_stats.quantitative_mistakes, 0) as quantitative_mistakes,
  coalesce(mistake_stats.verbal_mistakes, 0) as verbal_mistakes
from app_users u
left join app_student_profiles sp on sp.user_id = u.id
left join lateral (
  select
    plans.plan_name,
    subscriptions.status as subscription_status,
    subscriptions.starts_at as subscription_starts_at,
    subscriptions.ends_at as subscription_ends_at
  from app_user_subscriptions subscriptions
  inner join app_subscription_plans plans on plans.id = subscriptions.plan_id
  where subscriptions.user_id = u.id
  order by
    case
      when subscriptions.status in ('active', 'trial') then 0
      else 1
    end,
    coalesce(subscriptions.ends_at, subscriptions.starts_at) desc nulls last,
    subscriptions.created_at desc
  limit 1
) subscription on true
left join lateral (
  select
    count(*)::integer as active_sessions,
    max(last_seen_at) as last_seen_at
  from app_user_sessions sessions
  where sessions.user_id = u.id
    and sessions.expires_at > now()
) session_stats on true
left join lateral (
  select
    count(*)::integer as total_mistakes,
    count(*) filter (where section = 'quantitative')::integer as quantitative_mistakes,
    count(*) filter (where section = 'verbal')::integer as verbal_mistakes
  from app_user_mistakes mistakes
  where mistakes.user_id = u.id
) mistake_stats on true;

create table if not exists app_user_gamification_events (
  id bigserial primary key,
  user_id uuid not null references app_users(id) on delete cascade,
  event_type varchar(40) not null,
  title varchar(180) not null,
  points integer not null,
  unique_key varchar(255),
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists idx_app_user_gamification_events_unique_key
  on app_user_gamification_events (user_id, unique_key)
  where unique_key is not null;

create index if not exists idx_app_user_gamification_events_user_created
  on app_user_gamification_events (user_id, created_at desc);

create index if not exists idx_app_user_gamification_events_type_created
  on app_user_gamification_events (event_type, created_at desc);

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
);

create index if not exists idx_app_user_challenge_duels_challenger
  on app_user_challenge_duels (challenger_id, created_at desc);

create index if not exists idx_app_user_challenge_duels_opponent
  on app_user_challenge_duels (opponent_id, created_at desc);

create index if not exists idx_app_user_challenge_duels_status
  on app_user_challenge_duels (status, expires_at desc, created_at desc);
