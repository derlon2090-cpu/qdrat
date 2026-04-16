# Miyaar Database

هذا المجلد يحتوي على بنية قاعدة البيانات الأساسية لمنصة **معيار** على Neon/PostgreSQL.

## الملفات

- `schema.sql`
  يبني الجداول والأنواع والفهارس الأساسية للمستخدمين والباقات والاشتراكات وبنوك الأسئلة والقطع والأسئلة والمحاولات والخطط.

## كيف تشغله على Neon

1. أضف `DATABASE_URL` في `.env.local`.
2. افتح SQL Editor داخل Neon.
3. انسخ محتوى `schema.sql` ونفّذه.

## لماذا هذه البنية

- تدعم **اللفظي** و**الكمي** في نفس المنصة.
- تفصل **القطع** عن **الأسئلة** حتى لا يتكرر النص ملايين المرات.
- تدعم بنوك ضخمة جدًا عبر:
  - `bigserial` للكيانات الكبيرة
  - فهارس فلترة
  - `pg_trgm` للبحث التقريبي
  - `GIN` full-text search داخل نص السؤال
- تدعم الاشتراكات والباقات والخطط اليومية والمراجعة الذكية.

## الجداول الأساسية

- `app_users`
- `app_student_profiles`
- `app_subscription_plans`
- `app_user_subscriptions`
- `app_question_banks`
- `app_passages`
- `app_questions`
- `app_question_choices`
- `app_attempts`
- `app_attempt_answers`
- `app_review_queue`
- `app_study_plans`
- `app_study_plan_tasks`

## ملاحظة

هذه البنية جاهزة كبداية قوية جدًا، والخطوة التالية الأفضل هي إضافة:

- seed data للباقات
- seed data لبنوك أولية
- migration لاحقة لربط Auth الفعلي
- API routes لقراءة البيانات من Neon بدل البيانات الثابتة الحالية
