# Miyaar Database

هذا المجلد يحتوي على السكيمة الرسمية لقاعدة بيانات منصة **مِعيار** على Neon / PostgreSQL.

## الملفات

- `schema.sql`
  يبني الجداول والأنواع والفهارس والقيود والمشاهدات الأساسية للمشروع.
- `seed.sql`
  يضيف بيانات أولية للباقات وبعض بنوك المحتوى والقطع اللفظية التجريبية.

## التشغيل على Neon

1. أضف `DATABASE_URL` داخل `.env.local` محليًا، وداخل متغيرات البيئة في Vercel للإنتاج.
2. افتح SQL Editor في Neon.
3. نفّذ `schema.sql`.
4. بعد اكتمال السكيمة، نفّذ `seed.sql` إذا كنت تريد بيانات أولية.

## ما الذي تشملُه السكيمة الآن

السكيمة الرسمية أصبحت تغطي الجداول التي كان جزء منها يُنشأ وقت التشغيل من داخل التطبيق، ومنها:

- الحسابات والجلسات:
  - `app_users`
  - `app_user_sessions`
  - `app_user_accounts_overview`
- ملف الطالب والخطة:
  - `app_student_profiles`
  - `app_study_plans`
  - `app_study_plan_tasks`
- التقدّم والأخطاء:
  - `app_user_question_progress`
  - `app_user_mistakes`
- بنوك الأسئلة والمحتوى:
  - `app_question_banks`
  - `app_passages`
  - `app_questions`
  - `app_question_choices`
  - `app_verbal_passages`
  - `app_verbal_passage_questions`
- الملخصات:
  - `app_user_summaries`
  - `app_user_summary_page_states`
  - `app_user_summary_upload_sessions`
  - `app_user_summary_upload_chunks`

## ملاحظات مهمة

- السكيمة **idempotent** قدر الإمكان:
  - تستخدم `create table if not exists`
  - وتستخدم `alter table ... add column if not exists`
  - وتستخدم `create index if not exists`
- تم تضمين:
  - قيود تحقق للأعداد والحالات المهمة
  - Triggers موحدة لتحديث `updated_at`
  - فهارس مساعدة للبحث والتصفية والأداء

## ترتيب النشر

عند تجهيز بيئة جديدة:

1. طبّق `schema.sql`
2. أضف متغيرات البيئة
3. انشر التطبيق
4. اختياريًا طبّق `seed.sql`

بهذا لن يعتمد التطبيق على إنشاء الجداول عند أول تشغيل، وستكون قاعدة البيانات مرتبة وجاهزة من البداية.
