insert into app_subscription_plans (slug, plan_name, description, interval, price_sar, sort_order, question_limit, mock_exam_limit, supports_study_plan, supports_diagnostics, is_active)
values
  ('basic', 'الخطة الأساسية', 'تشخيص + بنوك أساسية + مراجعة', 'monthly', 79, 1, 5000, 8, true, true, true),
  ('plus', 'معيار بلس', 'خطة يومية + بنوك أوسع + اختبارات محاكية', 'monthly', 149, 2, 25000, 30, true, true, true),
  ('intensive', 'الخطة المكثفة', 'مسار مكثف قبل الاختبار مع مراجعة مركزة', 'monthly', 249, 3, 100000, 60, true, true, true)
on conflict (slug) do update set
  plan_name = excluded.plan_name,
  description = excluded.description,
  interval = excluded.interval,
  price_sar = excluded.price_sar,
  sort_order = excluded.sort_order,
  question_limit = excluded.question_limit,
  mock_exam_limit = excluded.mock_exam_limit,
  supports_study_plan = excluded.supports_study_plan,
  supports_diagnostics = excluded.supports_diagnostics,
  is_active = excluded.is_active,
  updated_at = now();

insert into app_question_sources (source_slug, source_name, source_type, author_name)
values
  ('miyaar-editorial', 'تحرير معيار', 'editorial', 'Miyaar Team'),
  ('miyaar-import', 'استيراد داخلي', 'import', 'Content Ops')
on conflict (source_slug) do update set
  source_name = excluded.source_name,
  source_type = excluded.source_type,
  author_name = excluded.author_name;

insert into app_skills (section, skill_name, skill_slug, description)
values
  ('verbal', 'التناظر اللفظي', 'verbal-analogy', 'إدراك العلاقات اللفظية الدقيقة'),
  ('verbal', 'إكمال الجمل', 'verbal-sentence-completion', 'فهم السياق وإكمال المعنى'),
  ('verbal', 'الخطأ السياقي', 'verbal-contextual-error', 'التقاط الخطأ في بناء المعنى'),
  ('verbal', 'المفردة الشاذة', 'verbal-odd-word', 'التصنيف والاستبعاد'),
  ('verbal', 'استيعاب المقروء', 'verbal-reading-comprehension', 'استخراج الفكرة العامة والتفاصيل'),
  ('verbal', 'تحليل العلاقات في القطع', 'verbal-passage-relations', 'ربط الفقرات والاستنتاج'),
  ('quantitative', 'النسب والتناسب', 'quant-ratio', 'حل مسائل النسب والتناسب'),
  ('quantitative', 'الجبر', 'quant-algebra', 'المعادلات والمتتابعات الأساسية'),
  ('quantitative', 'الهندسة', 'quant-geometry', 'الأشكال والزوايا والمساحات'),
  ('quantitative', 'المتوسطات والإحصاء', 'quant-statistics', 'المتوسط والوسيط والاحتمال')
on conflict (skill_slug) do update set
  skill_name = excluded.skill_name,
  description = excluded.description;

insert into app_tags (tag_name, tag_slug)
values
  ('الأكثر تدريبًا', 'most-practiced'),
  ('مرشح للمراجعة', 'review-candidate'),
  ('يتكرر كثيرًا', 'high-frequency')
on conflict (tag_slug) do update set
  tag_name = excluded.tag_name;

insert into app_question_banks (
  slug, title, subtitle, section, kind, question_type, description, total_questions, estimated_total_size, search_priority, difficulty, is_published
)
values
  ('verbal-analogy-master', 'بنك التناظر اللفظي الكبير', 'بنك ضخم للتناظر اللفظي', 'verbal', 'question_bank', 'analogy', 'تدريب واسع على العلاقات اللفظية من السهل حتى المتقدم.', 250000, 2500000, 1, 'medium', true),
  ('verbal-sentence-completion-master', 'بنك إكمال الجمل الكبير', 'مسار واسع للسياق وإكمال المعنى', 'verbal', 'question_bank', 'sentence_completion', 'أسئلة مرتبة للسياق وإكمال الجمل على مستويات متعددة.', 320000, 3200000, 2, 'medium', true),
  ('verbal-contextual-error-master', 'بنك الخطأ السياقي الكبير', 'التقاط الخطأ وبناء المعنى', 'verbal', 'question_bank', 'contextual_error', 'أسئلة واسعة لاكتشاف الخطأ في السياق ومعالجة المعنى.', 180000, 1800000, 3, 'medium', true),
  ('verbal-passages-short', 'بنك القطع اللفظية القصيرة', 'قطع سريعة مع عدة أسئلة مرتبطة', 'verbal', 'passage_bank', 'reading_passage', 'قطع قصيرة بكثافة عالية وتفسير بعد الحل.', 450000, 4500000, 1, 'medium', true),
  ('verbal-passages-deep', 'بنك القطع اللفظية العميقة', 'قطع طويلة للاستيعاب والتحليل', 'verbal', 'passage_bank', 'reading_passage', 'قطع متعددة الفقرات لقياس الفكرة العامة والعلاقات والاستنتاج.', 600000, 6000000, 2, 'hard', true),
  ('quant-basics', 'بنك الكمي الأساسي', 'أساسيات الكمي المنظّمة', 'quantitative', 'question_bank', 'quantitative_problem', 'تدريب أساسي على الجبر والنسب والهندسة.', 300000, 3000000, 1, 'easy', true),
  ('quant-speed', 'بنك الكمي للسرعة', 'جلسات سريعة قبل الاختبار', 'quantitative', 'question_bank', 'quantitative_problem', 'أسئلة مختارة لرفع السرعة والدقة تحت الضغط.', 220000, 2200000, 2, 'medium', true)
on conflict (slug) do update set
  title = excluded.title,
  subtitle = excluded.subtitle,
  description = excluded.description,
  total_questions = excluded.total_questions,
  estimated_total_size = excluded.estimated_total_size,
  search_priority = excluded.search_priority,
  difficulty = excluded.difficulty,
  is_published = excluded.is_published,
  updated_at = now();

insert into app_subscription_plan_features (plan_id, feature_key, feature_label, feature_value, is_enabled, sort_order)
select p.id, f.feature_key, f.feature_label, f.feature_value, f.is_enabled, f.sort_order
from app_subscription_plans p
join (
  values
    ('basic', 'diagnostic', 'اختبار تشخيصي', 'متاح', true, 1),
    ('basic', 'question-banks', 'بنوك أسئلة', 'أساسية', true, 2),
    ('basic', 'mock-exams', 'اختبارات محاكية', '8 شهريًا', true, 3),
    ('plus', 'diagnostic', 'اختبار تشخيصي', 'متاح', true, 1),
    ('plus', 'study-plan', 'الخطة اليومية', 'ذكية ومتغيرة', true, 2),
    ('plus', 'question-banks', 'بنوك أسئلة', 'كاملة', true, 3),
    ('plus', 'mock-exams', 'اختبارات محاكية', '30 شهريًا', true, 4),
    ('intensive', 'diagnostic', 'اختبار تشخيصي', 'متاح', true, 1),
    ('intensive', 'study-plan', 'الخطة اليومية', 'مكثفة', true, 2),
    ('intensive', 'question-banks', 'بنوك أسئلة', 'كاملة جدًا', true, 3),
    ('intensive', 'mock-exams', 'اختبارات محاكية', '60 شهريًا', true, 4),
    ('intensive', 'priority-review', 'مراجعة مركزة', 'مدعومة', true, 5)
) as f(plan_slug, feature_key, feature_label, feature_value, is_enabled, sort_order)
  on p.slug = f.plan_slug
on conflict (plan_id, feature_key) do update set
  feature_label = excluded.feature_label,
  feature_value = excluded.feature_value,
  is_enabled = excluded.is_enabled,
  sort_order = excluded.sort_order;
