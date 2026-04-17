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

with upserted as (
  insert into app_verbal_passages (
    title,
    normalized_title,
    keywords,
    keyword_search,
    passage_text,
    normalized_passage_text,
    title_hash,
    passage_hash,
    status,
    external_source_id,
    version
  )
  values (
    'قطعة الزيت',
    'قطعه الزيت',
    array['قطعة الزيت', 'الزيت'],
    'قطعه الزيت الزيت',
    $$عرف الإنسان الزيت من قديم الزمان واستعمله في احتياجاته كالبناء والطلاء، وتعبيد الطرق، ومداواة الجروح، ولكن افتقار الإنسان إلى الأساليب الاقتصادية التي تمكنه من استخراج الزيت على نطاق واسع قلّل فرص الانتفاع به، وجعل طرق الاستفادة منه محدودة. وقبل نهاية النصف الأول من القرن التاسع عشر حُفر أول بئر لاستخراج الزيت من باطن الأرض، وكانت هذه إشارة البدء للتنقيب عن الزيت.

وبعدها أصبح الزيت سمة هذا العصر ودعامته للصناعة، فقد أحدث الوقود البترولي السائل تغيرًا جذريًا في حياة البشر، إذ مكنهم من صنع محركات الاحتراق الداخلي وتطويرها، ومهد الطريق أمام تحسين صناعات السيارات والطائرات والآلات وتسخيرها لخدمة الإنسان، ورفع مستوى معيشته. كما يمتاز الوقود البترولي عن غيره من أنواع الوقود كالفحم والحطب بأنه يحترق بسهولة احتراقًا يكاد يكون كاملًا دون أن يخلف رمادًا، فضلًا عن سهولة تخزينه ونقله. والوقود البترولي إما غاز وإما سائل، ويمكن تقسيم السوائل منه إلى بنزين وكيروسين وزيت وغاز وديزل ونحو ذلك.

أما البنزين الناتج عن عملية تقطير الزيت الخام، فلا يكاد يفي بالطلب المتزايد عليه، لأن نسبة البنزين في الزيت الخام ضئيلة. ويستعمل الكيروسين للإنارة وفي أغراض التدفئة والطهو. يضاف إلى ذلك أن ظهور الطائرات النفاثة في عالم الطيران أدى إلى زيادة كبيرة في استهلاك الكيروسين. ويعد الإسفلت من أهم المواد العازلة في صناعة الكهرباء عامة، فهو مادة مثالية لعزل الأسلاك الكهربائية المطمورة لأنه يصد الماء والرطوبة من الوصول إلى الأسلاك النحاسية، وكذا يستعمل في الأشرطة العازلة، ويسهم الإسفلت بنصيب فاعل في صنع مواد الطلاء، وفي أحذية الألعاب الرياضية.

ومع الزمن اتسعت صناعة البترول ومنتجاته الكيمياوية، فأصبح يصنع منها الآن عدد لا يحصى من المواد، ولا تزال المختبرات العلمية تدرس إمكان إنتاج المزيد من المواد الجديدة التي لم تعرف من قبل، وقد تطورت علوم الكيمياء تطورًا ملحوظًا بعد ارتكازها على البترول في ابتكار مواد جديدة.$$,
    $$عرف الانسان الزيت من قديم الزمان واستعمله في احتياجاته كالبناء والطلاء وتعبيد الطرق ومداواه الجروح ولكن افتقار الانسان الى الاساليب الاقتصاديه التي تمكنه من استخراج الزيت على نطاق واسع قلل فرص الانتفاع به وجعل طرق الاستفاده منه محدوده وقبل نهايه النصف الاول من القرن التاسع عشر حفر اول بئر لاستخراج الزيت من باطن الارض وكانت هذه اشاره البدء للتنقيب عن الزيت وبعدها اصبح الزيت سمه هذا العصر ودعامته للصناعه فقد احدث الوقود البترولي السائل تغيرا جذريا في حياه البشر اذ مكنهم من صنع محركات الاحتراق الداخلي وتطويرها ومهد الطريق امام تحسين صناعات السيارات والطائرات والالات وتسخيرها لخدمه الانسان ورفع مستوى معيشته كما يمتاز الوقود البترولي عن غيره من انواع الوقود كالفحم والحطب بانه يحترق بسهوله احتراقا يكاد يكون كاملا دون ان يخلف رمادا فضلا عن سهوله تخزينه ونقله والوقود البترولي اما غاز واما سائل ويمكن تقسيم السوائل منه الى بنزين وكيروسين وزيت وغاز وديزل ونحو ذلك اما البنزين الناتج عن عمليه تقطير الزيت الخام فلا يكاد يفي بالطلب المتزايد عليه لان نسبه البنزين في الزيت الخام ضئيله ويستعمل الكيروسين للاناره وفي اغراض التدفئه والطهو يضاف الى ذلك ان ظهور الطائرات النفاثه في عالم الطيران ادى الى زياده كبيره في استهلاك الكيروسين ويعد الاسفلت من اهم المواد العازله في صناعه الكهرباء عامه فهو ماده مثاليه لعزل الاسلاك الكهربائيه المطموره لانه يصد الماء والرطوبه من الوصول الى الاسلاك النحاسيه وكذا يستعمل في الاشرطه العازله ويسهم الاسفلت بنصيب فاعل في صنع مواد الطلاء وفي احذيه الالعاب الرياضيه ومع الزمن اتسعت صناعه البترول ومنتجاته الكيمياويه فاصبح يصنع منها الان عدد لا يحصى من المواد ولا تزال المختبرات العلميه تدرس امكان انتاج المزيد من المواد الجديده التي لم تعرف من قبل وقد تطورت علوم الكيمياء تطورا ملحوظا بعد ارتكازها على البترول في ابتكار مواد جديده$$,
    encode(digest('قطعه الزيت', 'sha256'), 'hex'),
    encode(digest($$عرف الانسان الزيت من قديم الزمان واستعمله في احتياجاته كالبناء والطلاء وتعبيد الطرق ومداواه الجروح ولكن افتقار الانسان الى الاساليب الاقتصاديه التي تمكنه من استخراج الزيت على نطاق واسع قلل فرص الانتفاع به وجعل طرق الاستفاده منه محدوده وقبل نهايه النصف الاول من القرن التاسع عشر حفر اول بئر لاستخراج الزيت من باطن الارض وكانت هذه اشاره البدء للتنقيب عن الزيت وبعدها اصبح الزيت سمه هذا العصر ودعامته للصناعه فقد احدث الوقود البترولي السائل تغيرا جذريا في حياه البشر اذ مكنهم من صنع محركات الاحتراق الداخلي وتطويرها ومهد الطريق امام تحسين صناعات السيارات والطائرات والالات وتسخيرها لخدمه الانسان ورفع مستوى معيشته كما يمتاز الوقود البترولي عن غيره من انواع الوقود كالفحم والحطب بانه يحترق بسهوله احتراقا يكاد يكون كاملا دون ان يخلف رمادا فضلا عن سهوله تخزينه ونقله والوقود البترولي اما غاز واما سائل ويمكن تقسيم السوائل منه الى بنزين وكيروسين وزيت وغاز وديزل ونحو ذلك اما البنزين الناتج عن عمليه تقطير الزيت الخام فلا يكاد يفي بالطلب المتزايد عليه لان نسبه البنزين في الزيت الخام ضئيله ويستعمل الكيروسين للاناره وفي اغراض التدفئه والطهو يضاف الى ذلك ان ظهور الطائرات النفاثه في عالم الطيران ادى الى زياده كبيره في استهلاك الكيروسين ويعد الاسفلت من اهم المواد العازله في صناعه الكهرباء عامه فهو ماده مثاليه لعزل الاسلاك الكهربائيه المطموره لانه يصد الماء والرطوبه من الوصول الى الاسلاك النحاسيه وكذا يستعمل في الاشرطه العازله ويسهم الاسفلت بنصيب فاعل في صنع مواد الطلاء وفي احذيه الالعاب الرياضيه ومع الزمن اتسعت صناعه البترول ومنتجاته الكيمياويه فاصبح يصنع منها الان عدد لا يحصى من المواد ولا تزال المختبرات العلميه تدرس امكان انتاج المزيد من المواد الجديده التي لم تعرف من قبل وقد تطورت علوم الكيمياء تطورا ملحوظا بعد ارتكازها على البترول في ابتكار مواد جديده$$, 'sha256'), 'hex'),
    'published',
    'seed-oil',
    1
  )
  on conflict (title_hash, passage_hash) do update set
    keywords = excluded.keywords,
    keyword_search = excluded.keyword_search,
    status = excluded.status,
    external_source_id = excluded.external_source_id,
    version = excluded.version,
    updated_at = now()
  returning id
),
deleted as (
  delete from app_verbal_passage_questions where passage_id in (select id from upserted)
)
insert into app_verbal_passage_questions (
  passage_id, question_order, question_text, option_a, option_b, option_c, option_d, correct_option, explanation
)
select id, 1, 'أفضل عنوان لعموم النص هو:', 'مشتقات الزيت', 'أنواع الزيوت', 'اكتشاف الزيت وخواصه', 'صناعة الزيت وآثارها', 'C', null from upserted
union all
select id, 2, 'تعتبر كلمة "بترول" في الفقرة (4):', 'اسم لبعض مشتقات الزيت الثقيلة', 'أشمل من كلمة زيت', 'مرادفة لكلمة زيت', 'اسم لمشتق من مشتقات الزيت', 'C', null from upserted
union all
select id, 3, 'معنى كلمة "سمة" الواردة في الفقرة (2) هي:', 'نظرة', 'حاجة', 'أساس', 'خاصية', 'C', null from upserted
union all
select id, 4, 'وفقًا لمنطوق الفقرة (1)، أي التواريخ الآتية أقرب لتاريخ حفر أول بئر للزيت؟', '1920', '1900', '1851', '1820', 'C', null from upserted
union all
select id, 5, 'المقصود بـ "الأساليب الاقتصادية" في الفقرة (1) هو:', 'الأسهل استعمالًا', 'المتوفرة اقتصاديًا', 'المجدية ماليًا', 'المتقدمة تقنيًا', 'D', null from upserted;

with upserted as (
  insert into app_verbal_passages (
    title,
    normalized_title,
    keywords,
    keyword_search,
    passage_text,
    normalized_passage_text,
    title_hash,
    passage_hash,
    status,
    external_source_id,
    version
  )
  values (
    'قطعة الأشجار',
    'قطعه الاشجار',
    array['قطعة الأشجار', 'الأشجار'],
    'قطعه الاشجار الاشجار',
    $$الناس لم تعرف مدى أهمية الأشجار، فنحن نأخذ منها الغذاء والألياف والعقاقير، ولا ننسى الأخشاب.$$,
    $$الناس لم تعرف مدى اهميه الاشجار فنحن ناخذ منها الغذاء والالياف والعقاقير ولا ننسى الاخشاب$$,
    encode(digest('قطعه الاشجار', 'sha256'), 'hex'),
    encode(digest($$الناس لم تعرف مدى اهميه الاشجار فنحن ناخذ منها الغذاء والالياف والعقاقير ولا ننسى الاخشاب$$, 'sha256'), 'hex'),
    'published',
    'seed-trees',
    1
  )
  on conflict (title_hash, passage_hash) do update set
    keywords = excluded.keywords,
    keyword_search = excluded.keyword_search,
    status = excluded.status,
    external_source_id = excluded.external_source_id,
    version = excluded.version,
    updated_at = now()
  returning id
),
deleted as (
  delete from app_verbal_passage_questions where passage_id in (select id from upserted)
)
insert into app_verbal_passage_questions (
  passage_id, question_order, question_text, option_a, option_b, option_c, option_d, correct_option, explanation
)
select id, 1, 'كم عدد فوائد الأشجار التي ذكرت في النص؟', '5 فوائد', '4 فوائد', '3 فوائد', 'فائدتين', 'B', null from upserted;

with upserted as (
  insert into app_verbal_passages (
    title,
    normalized_title,
    keywords,
    keyword_search,
    passage_text,
    normalized_passage_text,
    title_hash,
    passage_hash,
    status,
    external_source_id,
    version
  )
  values (
    'قطعة التصحر',
    'قطعه التصحر',
    array['قطعة التصحر', 'التصحر'],
    'قطعه التصحر التصحر',
    $$يعبّر مفهوم التصحر عن العملية التي تؤدي إلى تقليل الإنتاجية البيولوجية للأراضي الجافة، وهي الأراضي القاحلة أو شبه القاحلة نتيجةً لأسباب طبيعية أو بشرية.

ومن أبرز أسباب التصحر: الرعي الجائر الذي أدى إلى قلة نمو النباتات، والزراعة الخاطئة، فهناك بعض المزارعين الذين يجهلون استخدام الأرض بالطريقة الفعالة، مما يقودهم إلى تجريد الأرض من مكوناتها قبل تركها والذهاب إلى قطعة أرض أخرى، والتحضر الذي نتج عنه تقليل المناطق التي تنمو بها النباتات مما يقود إلى التصحر بعدما تدهورت إنتاجية الأراضي.$$,
    $$يعبر مفهوم التصحر عن العمليه التي تؤدي الى تقليل الانتاجيه البيولوجيه للاراضي الجافه وهي الاراضي القاحله او شبه القاحله نتيجه لاسباب طبيعيه او بشريه ومن ابرز اسباب التصحر الرعي الجائر الذي ادى الى قله نمو النباتات والزراعه الخاطئه فهناك بعض المزارعين الذين يجهلون استخدام الارض بالطريقه الفعاله مما يقودهم الى تجريد الارض من مكوناتها قبل تركها والذهاب الى قطعه ارض اخرى والتحضر الذي نتج عنه تقليل المناطق التي تنمو بها النباتات مما يقود الى التصحر بعدما تدهورت انتاجيه الاراضي$$,
    encode(digest('قطعه التصحر', 'sha256'), 'hex'),
    encode(digest($$يعبر مفهوم التصحر عن العمليه التي تؤدي الى تقليل الانتاجيه البيولوجيه للاراضي الجافه وهي الاراضي القاحله او شبه القاحله نتيجه لاسباب طبيعيه او بشريه ومن ابرز اسباب التصحر الرعي الجائر الذي ادى الى قله نمو النباتات والزراعه الخاطئه فهناك بعض المزارعين الذين يجهلون استخدام الارض بالطريقه الفعاله مما يقودهم الى تجريد الارض من مكوناتها قبل تركها والذهاب الى قطعه ارض اخرى والتحضر الذي نتج عنه تقليل المناطق التي تنمو بها النباتات مما يقود الى التصحر بعدما تدهورت انتاجيه الاراضي$$, 'sha256'), 'hex'),
    'published',
    'seed-desertification',
    1
  )
  on conflict (title_hash, passage_hash) do update set
    keywords = excluded.keywords,
    keyword_search = excluded.keyword_search,
    status = excluded.status,
    external_source_id = excluded.external_source_id,
    version = excluded.version,
    updated_at = now()
  returning id
),
deleted as (
  delete from app_verbal_passage_questions where passage_id in (select id from upserted)
)
insert into app_verbal_passage_questions (
  passage_id, question_order, question_text, option_a, option_b, option_c, option_d, correct_option, explanation
)
select id, 1, 'يتنقل سكان القرى إلى المدن بسبب / سبب هجرة الفقراء إلى المدن هو:', 'تدني حالة الأراضي الزراعية', 'ارتفاع أجور المدن', 'زيادة الأمطار', 'كثرة الأشجار', 'A', null from upserted
union all
select id, 2, 'تحدثت الفقرة (2) بشكل مفصل عن:', 'الأسباب التي أدت إلى التصحر', 'العوامل الطبيعية التي أدت للتصحر', 'طرق علاج التصحر', 'فوائد الأراضي الجافة', 'A', null from upserted
union all
select id, 3, 'كم سببًا للتصحر ورد بالنص؟', '4 أسباب', '3 أسباب', 'سببين', '5 أسباب', 'B', null from upserted
union all
select id, 4, 'أسباب حدوث التصحر:', 'عوامل اجتماعية', 'عوامل مناخية وجزئية', 'استنزاف الموارد الطبيعية', 'أسباب غير معروفة', 'C', null from upserted
union all
select id, 5, 'أي من الآتي يمكن أن يعتبر عاملًا مسببًا للتصحر؟', 'استثمار المزارع', 'تدهور الأراضي', 'المدن الجديدة', 'زيادة الغابات', 'B', null from upserted;

with upserted as (
  insert into app_verbal_passages (
    title,
    normalized_title,
    keywords,
    keyword_search,
    passage_text,
    normalized_passage_text,
    title_hash,
    passage_hash,
    status,
    external_source_id,
    version
  )
  values (
    'قطعة السمنة في الدول المتقدمة',
    'قطعه السمنه في الدول المتقدمه',
    array['قطعة السمنة في الدول المتقدمة', 'السمنة في الدول المتقدمة', 'السمنة'],
    'قطعه السمنه في الدول المتقدمه السمنه في الدول المتقدمه السمنه',
    $$تُعرّف السمنة بأنها تلك الحالة الطبية التي تتراكم فيها الدهون الزائدة بالجسم إلى درجة تتسبب معها في وقوع آثار سلبية على الصحة، مؤدية بذلك إلى انخفاض متوسط عمر الفرد المأمول، ولها علاقة بمشاكل صحية أخرى. وقد تفاقمت تلك المشكلة في عديد من الدول، فالسمنة لدى الشباب متزايدة. ففي الولايات المتحدة ثلث سكانها مصابون بالسمنة أو زيادة الوزن، وفي كندا 25% مصابون بالسمنة، ويصاب بها نسبة كبيرة من الشباب. وقد تكون أبرز أسباب الإصابة بها هي الجلوس الطويل أمام التلفاز والحاسب، والشباب المصابون بالسمنة سيظل أغلبهم مصابًا بها حتى يصلون إلى سن الرجولة. وسبب السمنة هو أن الطاقة المأخوذة من الطعام الذي يأكله الناس لا يتساوى مع الطاقة المستهلكة التي يقومون بها.$$,
    $$تعرف السمنه بانها تلك الحاله الطبيه التي تتراكم فيها الدهون الزائده بالجسم الى درجه تتسبب معها في وقوع اثار سلبيه على الصحه مؤديه بذلك الى انخفاض متوسط عمر الفرد المامول ولها علاقه بمشاكل صحيه اخرى وقد تفاقمت تلك المشكله في عديد من الدول فالسمنه لدى الشباب متزايده ففي الولايات المتحده ثلث سكانها مصابون بالسمنه او زياده الوزن وفي كندا 25 مصابون بالسمنه ويصاب بها نسبه كبيره من الشباب وقد تكون ابرز اسباب الاصابه بها هي الجلوس الطويل امام التلفاز والحاسب والشباب المصابون بالسمنه سيظل اغلبهم مصابا بها حتى يصلون الى سن الرجوله وسبب السمنه هو ان الطاقه الماخوذه من الطعام الذي ياكله الناس لا يتساوى مع الطاقه المستهلكه التي يقومون بها$$,
    encode(digest('قطعه السمنه في الدول المتقدمه', 'sha256'), 'hex'),
    encode(digest($$تعرف السمنه بانها تلك الحاله الطبيه التي تتراكم فيها الدهون الزائده بالجسم الى درجه تتسبب معها في وقوع اثار سلبيه على الصحه مؤديه بذلك الى انخفاض متوسط عمر الفرد المامول ولها علاقه بمشاكل صحيه اخرى وقد تفاقمت تلك المشكله في عديد من الدول فالسمنه لدى الشباب متزايده ففي الولايات المتحده ثلث سكانها مصابون بالسمنه او زياده الوزن وفي كندا 25 مصابون بالسمنه ويصاب بها نسبه كبيره من الشباب وقد تكون ابرز اسباب الاصابه بها هي الجلوس الطويل امام التلفاز والحاسب والشباب المصابون بالسمنه سيظل اغلبهم مصابا بها حتى يصلون الى سن الرجوله وسبب السمنه هو ان الطاقه الماخوذه من الطعام الذي ياكله الناس لا يتساوى مع الطاقه المستهلكه التي يقومون بها$$, 'sha256'), 'hex'),
    'published',
    'seed-obesity-advanced',
    1
  )
  on conflict (title_hash, passage_hash) do update set
    keywords = excluded.keywords,
    keyword_search = excluded.keyword_search,
    status = excluded.status,
    external_source_id = excluded.external_source_id,
    version = excluded.version,
    updated_at = now()
  returning id
),
deleted as (
  delete from app_verbal_passage_questions where passage_id in (select id from upserted)
)
insert into app_verbal_passage_questions (
  passage_id, question_order, question_text, option_a, option_b, option_c, option_d, correct_option, explanation
)
select id, 1, 'وفقًا للنص فإن السبب في زيادة السمنة؟', 'الفقر', 'التقنية', 'غلاء الأسعار', 'قلة النوم', 'B', null from upserted
union all
select id, 2, 'عدد غير المصابين بالسمنة في أمريكا؟', '77%', '66%', '25%', '50%', 'B', null from upserted
union all
select id, 3, 'الطاقة المستهلكة تعني:', 'السعرات الحرارية', 'المشي فقط', 'الفيتامينات', 'الأطعمة الجاهزة', 'A', null from upserted
union all
select id, 4, 'السمنة لدى الشباب:', 'متوازنة', 'متنامية', 'متناقصة', 'ثابتة', 'B', null from upserted
union all
select id, 5, 'يرجع النص أسباب الإصابة بالسمنة في الدول المتقدمة إلى:', 'التطور التقني', 'العوامل الوراثية', 'المناخ', 'التعليم', 'A', null from upserted
union all
select id, 6, 'العلاقة بين (السمنة) و(زيادة الوزن):', 'إطنابية', 'ترادف', 'تتابعية', 'من العموم إلى الخصوص', 'B', null from upserted;
