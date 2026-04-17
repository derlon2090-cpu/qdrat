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
select id, 1, 'أفضل عنوان لعموم النص هو:', 'مشتقات الزيت', 'أنواع الزيوت', 'اكتشاف الزيت وخواصه', 'صناعة الزيت وآثارها', 'C', 'لأن النص يعرض اكتشاف الزيت وخصائصه وأثره في الصناعة والحياة الحديثة بشكل عام.' from upserted
union all
select id, 2, 'تعتبر كلمة "بترول" في الفقرة (4):', 'اسم لبعض مشتقات الزيت الثقيلة', 'أشمل من كلمة زيت', 'مرادفة لكلمة زيت', 'اسم لمشتق من مشتقات الزيت', 'C', 'لأن النص استعمل البترول بوصفه مرادفًا للزيت عند الحديث عن استخراجه ومشتقاته.' from upserted
union all
select id, 3, 'معنى كلمة "سمة" الواردة في الفقرة (2) هي:', 'نظرة', 'حاجة', 'أساس', 'خاصية', 'C', 'لأن المقصود أن الزيت صار علامة أساسية يقوم عليها هذا العصر.' from upserted
union all
select id, 4, 'وفقًا لمنطوق الفقرة (1)، أي التواريخ الآتية أقرب لتاريخ حفر أول بئر للزيت؟', '1920', '1900', '1851', '1820', 'C', 'لأن النص ذكر أن الحفر كان قبل نهاية النصف الأول من القرن التاسع عشر، وأقرب اختيار لذلك هو 1851.' from upserted
union all
select id, 5, 'المقصود بـ "الأساليب الاقتصادية" في الفقرة (1) هو:', 'الأسهل استعمالًا', 'المتوفرة اقتصاديًا', 'المجدية ماليًا', 'المتقدمة تقنيًا', 'D', 'لأن المقصود وسائل الاستخراج التي تجعل الانتفاع بالزيت واسعًا وممكنًا على مستوى عملي وتقني.' from upserted;

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
select id, 1, 'كم عدد فوائد الأشجار التي ذكرت في النص؟', '5 فوائد', '4 فوائد', '3 فوائد', 'فائدتين', 'B', 'لأن النص ذكر الغذاء والألياف والعقاقير والأخشاب، وهي أربع فوائد صريحة.' from upserted;

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
select id, 1, 'يتنقل سكان القرى إلى المدن بسبب / سبب هجرة الفقراء إلى المدن هو:', 'تدني حالة الأراضي الزراعية', 'ارتفاع أجور المدن', 'زيادة الأمطار', 'كثرة الأشجار', 'A', 'لأن تدهور الأراضي الزراعية يقلل الإنتاجية ويدفع السكان إلى مغادرتها.' from upserted
union all
select id, 2, 'تحدثت الفقرة (2) بشكل مفصل عن:', 'الأسباب التي أدت إلى التصحر', 'العوامل الطبيعية التي أدت للتصحر', 'طرق علاج التصحر', 'فوائد الأراضي الجافة', 'A', 'لأن الفقرة الثانية فصلت الرعي الجائر والزراعة الخاطئة والتحضر بوصفها أسبابًا مباشرة.' from upserted
union all
select id, 3, 'كم سببًا للتصحر ورد بالنص؟', '4 أسباب', '3 أسباب', 'سببين', '5 أسباب', 'B', 'لأن النص ذكر ثلاثة أسباب واضحة: الرعي الجائر، والزراعة الخاطئة، والتحضر.' from upserted
union all
select id, 4, 'أسباب حدوث التصحر:', 'عوامل اجتماعية', 'عوامل مناخية وجزئية', 'استنزاف الموارد الطبيعية', 'أسباب غير معروفة', 'C', 'لأن الأسباب المذكورة كلها تؤدي إلى إنهاك الأرض واستنزاف عناصرها الطبيعية.' from upserted
union all
select id, 5, 'أي من الآتي يمكن أن يعتبر عاملًا مسببًا للتصحر؟', 'استثمار المزارع', 'تدهور الأراضي', 'المدن الجديدة', 'زيادة الغابات', 'B', 'لأن تدهور الأراضي يؤدي مباشرة إلى انخفاض الإنتاجية وظهور التصحر.' from upserted;

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
select id, 1, 'وفقًا للنص فإن السبب في زيادة السمنة؟', 'الفقر', 'التقنية', 'غلاء الأسعار', 'قلة النوم', 'B', 'لأن النص ربط السمنة بالجلوس الطويل أمام التلفاز والحاسب، وهو من آثار التطور التقني.' from upserted
union all
select id, 2, 'عدد غير المصابين بالسمنة في أمريكا؟', '77%', '66%', '25%', '50%', 'B', 'لأن ثلث السكان مصابون، وبالتالي يكون غير المصابين قرابة الثلثين أي 66%.' from upserted
union all
select id, 3, 'الطاقة المستهلكة تعني:', 'السعرات الحرارية', 'المشي فقط', 'الفيتامينات', 'الأطعمة الجاهزة', 'A', 'لأن النص يقصد بالطاقة المستهلكة ما يحرقه الجسم من سعرات نتيجة النشاط.' from upserted
union all
select id, 4, 'السمنة لدى الشباب:', 'متوازنة', 'متنامية', 'متناقصة', 'ثابتة', 'B', 'لأن النص صرح بأن السمنة لدى الشباب متزايدة.' from upserted
union all
select id, 5, 'يرجع النص أسباب الإصابة بالسمنة في الدول المتقدمة إلى:', 'التطور التقني', 'العوامل الوراثية', 'المناخ', 'التعليم', 'A', 'لأن السبب المذكور هو الجلوس الطويل أمام التلفاز والحاسب، وهو أثر مباشر للتقنية.' from upserted
union all
select id, 6, 'العلاقة بين (السمنة) و(زيادة الوزن):', 'إطنابية', 'ترادف', 'تتابعية', 'من العموم إلى الخصوص', 'B', 'لأن النص جمع بين المصطلحين في سياق متقارب يدل على علاقة ترادف في هذا الموضع.' from upserted;

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
    'قطعة القمر',
    'قطعه القمر',
    array['قطعة القمر', 'القمر'],
    'قطعه القمر القمر',
    $$القمر هو الجرم السماوي الأقرب إلى الأرض، وهو تابع لها، يدور حولها دورة كاملة كل 27 يومًا تقريبًا، كما يدور حول نفسه في المدة نفسها، ولذلك نرى وجهًا واحدًا منه دائمًا. ويُعد القمر مصدرًا مهمًا للضوء ليلًا، حيث يعكس ضوء الشمس الساقط عليه.

وقد حاول الإنسان منذ القدم معرفة طبيعة القمر، حتى تمكن في العصر الحديث من الوصول إليه، حيث أرسلت المركبات الفضائية ورواد الفضاء لاستكشاف سطحه، فتبين أنه يخلو من الهواء والماء، وأن سطحه مليء بالفوهات والحفر.$$,
    $$القمر هو الجرم السماوي الاقرب الى الارض وهو تابع لها يدور حولها دوره كامله كل 27 يوما تقريبا كما يدور حول نفسه في المده نفسها ولذلك نرى وجها واحدا منه دائما ويعد القمر مصدرا مهما للضوء ليلا حيث يعكس ضوء الشمس الساقط عليه وقد حاول الانسان منذ القدم معرفه طبيعه القمر حتى تمكن في العصر الحديث من الوصول اليه حيث ارسلت المركبات الفضائيه ورواد الفضاء لاستكشاف سطحه فتبين انه يخلو من الهواء والماء وان سطحه مليء بالفوهات والحفر$$,
    encode(digest('قطعه القمر', 'sha256'), 'hex'),
    encode(digest($$القمر هو الجرم السماوي الاقرب الى الارض وهو تابع لها يدور حولها دوره كامله كل 27 يوما تقريبا كما يدور حول نفسه في المده نفسها ولذلك نرى وجها واحدا منه دائما ويعد القمر مصدرا مهما للضوء ليلا حيث يعكس ضوء الشمس الساقط عليه وقد حاول الانسان منذ القدم معرفه طبيعه القمر حتى تمكن في العصر الحديث من الوصول اليه حيث ارسلت المركبات الفضائيه ورواد الفضاء لاستكشاف سطحه فتبين انه يخلو من الهواء والماء وان سطحه مليء بالفوهات والحفر$$, 'sha256'), 'hex'),
    'published',
    'seed-moon',
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
select id, 1, 'القمر:', 'نجم', 'كوكب', 'تابع للأرض', 'جرم مستقل', 'C', 'لأن النص ذكر صراحة أن القمر تابع للأرض ويدور حولها.' from upserted
union all
select id, 2, 'لماذا نرى وجهًا واحدًا للقمر؟', 'لأنه لا يدور', 'لأنه يدور حول نفسه فقط', 'لأن مدة دورانه حول نفسه تساوي دورانه حول الأرض', 'لأنه قريب من الأرض', 'C', 'لأن القمر يتم دورته حول نفسه في المدة نفسها التي يتم فيها دورته حول الأرض، لذلك يظهر لنا الوجه نفسه دائمًا.' from upserted
union all
select id, 3, 'سطح القمر:', 'مليء بالماء', 'مليء بالأشجار', 'مليء بالفوهات', 'أملس', 'C', 'لأن النص أوضح أن سطح القمر مليء بالفوهات والحفر.' from upserted;

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
    'قطعة إنفلونزا (2)',
    'قطعه انفلونزا 2',
    array['قطعة إنفلونزا (2)', 'إنفلونزا (2)', 'إنفلونزا'],
    'قطعه انفلونزا 2 انفلونزا 2 انفلونزا',
    $$الإنفلونزا مرض فيروسي يصيب الجهاز التنفسي، وينتقل من شخص إلى آخر عن طريق الرذاذ المتطاير أثناء السعال أو العطاس. وتظهر أعراضه في صورة ارتفاع في درجة الحرارة، وسعال، وآلام في الجسم.

وتكمن خطورة المرض في سرعة انتشاره، خاصة في الأماكن المزدحمة، ولذلك ينصح الأطباء باتباع وسائل الوقاية مثل غسل اليدين، وتغطية الفم عند العطاس، والابتعاد عن المصابين.$$,
    $$الانفلونزا مرض فيروسي يصيب الجهاز التنفسي وينتقل من شخص الى اخر عن طريق الرذاذ المتطاير اثناء السعال او العطاس وتظهر اعراضه في صوره ارتفاع في درجه الحراره وسعال والام في الجسم وتكمن خطوره المرض في سرعه انتشاره خاصه في الاماكن المزدحمه ولذلك ينصح الاطباء باتباع وسائل الوقايه مثل غسل اليدين وتغطيه الفم عند العطاس والابتعاد عن المصابين$$,
    encode(digest('قطعه انفلونزا 2', 'sha256'), 'hex'),
    encode(digest($$الانفلونزا مرض فيروسي يصيب الجهاز التنفسي وينتقل من شخص الى اخر عن طريق الرذاذ المتطاير اثناء السعال او العطاس وتظهر اعراضه في صوره ارتفاع في درجه الحراره وسعال والام في الجسم وتكمن خطوره المرض في سرعه انتشاره خاصه في الاماكن المزدحمه ولذلك ينصح الاطباء باتباع وسائل الوقايه مثل غسل اليدين وتغطيه الفم عند العطاس والابتعاد عن المصابين$$, 'sha256'), 'hex'),
    'published',
    'seed-influenza-2',
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
select id, 1, 'تنتقل الإنفلونزا عن طريق:', 'الطعام', 'الماء', 'الرذاذ', 'الهواء فقط', 'C', 'لأن النص ذكر أنها تنتقل عن طريق الرذاذ المتطاير أثناء السعال أو العطاس.' from upserted
union all
select id, 2, 'من أعراض الإنفلونزا:', 'ألم في الأسنان', 'ارتفاع الحرارة', 'تساقط الشعر', 'فقدان البصر', 'B', 'لأن النص عدّ ارتفاع درجة الحرارة من الأعراض الأساسية للإنفلونزا.' from upserted
union all
select id, 3, 'الوقاية تكون:', 'النوم فقط', 'الأكل', 'غسل اليدين', 'اللعب', 'C', 'لأن الأطباء ينصحون بغسل اليدين ضمن وسائل الوقاية الواردة في النص.' from upserted;

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
    'قطعة حمض الخليك',
    'قطعه حمض الخليك',
    array['قطعة حمض الخليك', 'حمض الخليك'],
    'قطعه حمض الخليك حمض الخليك',
    $$يُعد حمض الخليك من الأحماض العضوية المعروفة، وهو المكوّن الأساسي للخل، ويستخدم في العديد من الصناعات الغذائية، كما يدخل في بعض التفاعلات الكيميائية المهمة.

ويتميز هذا الحمض برائحته النفاذة، وقدرته على إذابة بعض المواد، ويُستخدم أيضًا في حفظ الأطعمة، لما له من خصائص مضادة للبكتيريا.$$,
    $$يعد حمض الخليك من الاحماض العضويه المعروفه وهو المكون الاساسي للخل ويستخدم في العديد من الصناعات الغذائيه كما يدخل في بعض التفاعلات الكيميائيه المهمه ويتميز هذا الحمض برائحته النفاذه وقدرته على اذابه بعض المواد ويستخدم ايضا في حفظ الاطعمه لما له من خصائص مضاده للبكتيريا$$,
    encode(digest('قطعه حمض الخليك', 'sha256'), 'hex'),
    encode(digest($$يعد حمض الخليك من الاحماض العضويه المعروفه وهو المكون الاساسي للخل ويستخدم في العديد من الصناعات الغذائيه كما يدخل في بعض التفاعلات الكيميائيه المهمه ويتميز هذا الحمض برائحته النفاذه وقدرته على اذابه بعض المواد ويستخدم ايضا في حفظ الاطعمه لما له من خصائص مضاده للبكتيريا$$, 'sha256'), 'hex'),
    'published',
    'seed-acetic-acid',
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
select id, 1, 'حمض الخليك يوجد في:', 'الماء', 'الخل', 'الهواء', 'الزيت', 'B', 'لأن النص نص على أن حمض الخليك هو المكوّن الأساسي للخل.' from upserted
union all
select id, 2, 'يستخدم في:', 'البناء', 'الطيران', 'حفظ الأطعمة', 'الزراعة', 'C', 'لأن النص ذكر استخدامه في حفظ الأطعمة بسبب خصائصه المضادة للبكتيريا.' from upserted
union all
select id, 3, 'من صفاته:', 'عديم الرائحة', 'رائحته نفاذة', 'لونه أزرق', 'لا يذيب المواد', 'B', 'لأن النص وصف حمض الخليك بأن له رائحة نفاذة.' from upserted;

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
    'قطعة النجاح (1)',
    'قطعه النجاح 1',
    array['قطعة النجاح (1)', 'النجاح (1)', 'النجاح'],
    'قطعه النجاح 1 النجاح 1 النجاح',
    $$النجاح لا يأتي صدفة، بل هو نتيجة جهد وعمل متواصل، وتخطيط سليم. فالإنسان الناجح هو الذي يحدد أهدافه ويسعى لتحقيقها بإصرار وعزيمة.

كما أن الفشل لا يعني النهاية، بل هو بداية جديدة للتعلم واكتساب الخبرات، ومن خلاله يستطيع الإنسان تصحيح أخطائه والمضي قدمًا نحو النجاح.$$,
    $$النجاح لا ياتي صدفه بل هو نتيجه جهد وعمل متواصل وتخطيط سليم فالانسان الناجح هو الذي يحدد اهدافه ويسعى لتحقيقها باصرار وعزيمه كما ان الفشل لا يعني النهايه بل هو بدايه جديده للتعلم واكتساب الخبرات ومن خلاله يستطيع الانسان تصحيح اخطائه والمضي قدما نحو النجاح$$,
    encode(digest('قطعه النجاح 1', 'sha256'), 'hex'),
    encode(digest($$النجاح لا ياتي صدفه بل هو نتيجه جهد وعمل متواصل وتخطيط سليم فالانسان الناجح هو الذي يحدد اهدافه ويسعى لتحقيقها باصرار وعزيمه كما ان الفشل لا يعني النهايه بل هو بدايه جديده للتعلم واكتساب الخبرات ومن خلاله يستطيع الانسان تصحيح اخطائه والمضي قدما نحو النجاح$$, 'sha256'), 'hex'),
    'published',
    'seed-success-1',
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
select id, 1, 'النجاح يأتي من:', 'الحظ', 'الصدفة', 'الجهد', 'اللعب', 'C', 'لأن النص أكد أن النجاح نتيجة جهد وعمل متواصل وليس صدفة.' from upserted
union all
select id, 2, 'الفشل:', 'نهاية', 'بداية للتعلم', 'لا فائدة منه', 'ضعف', 'B', 'لأن النص وصف الفشل بأنه بداية جديدة للتعلم واكتساب الخبرات.' from upserted
union all
select id, 3, 'الإنسان الناجح:', 'لا يعمل', 'يخطط', 'ينام', 'يتجاهل', 'B', 'لأن الإنسان الناجح في النص يحدد أهدافه ويسير إليها بتخطيط سليم.' from upserted;

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
    'قطعة فيتش وأينبه',
    'قطعه فيتش واينبه',
    array['قطعة فيتش وأينبه', 'فيتش وأينبه'],
    'قطعه فيتش واينبه فيتش واينبه',
    $$يتناول النص قصة فيتش وأينبه اللذين تعاونا معًا لتحقيق هدف مشترك، حيث عملا بروح الفريق الواحد، وتغلبا على الصعوبات التي واجهتهما في طريقهما.

وقد أثبتت هذه القصة أن التعاون والعمل الجماعي من أهم أسباب النجاح، وأن الفرد لا يستطيع تحقيق الإنجازات الكبيرة بمفرده.$$,
    $$يتناول النص قصه فيتش واينبه اللذين تعاونا معا لتحقيق هدف مشترك حيث عملا بروح الفريق الواحد وتغلبا على الصعوبات التي واجهتهما في طريقهما وقد اثبتت هذه القصه ان التعاون والعمل الجماعي من اهم اسباب النجاح وان الفرد لا يستطيع تحقيق الانجازات الكبيره بمفرده$$,
    encode(digest('قطعه فيتش واينبه', 'sha256'), 'hex'),
    encode(digest($$يتناول النص قصه فيتش واينبه اللذين تعاونا معا لتحقيق هدف مشترك حيث عملا بروح الفريق الواحد وتغلبا على الصعوبات التي واجهتهما في طريقهما وقد اثبتت هذه القصه ان التعاون والعمل الجماعي من اهم اسباب النجاح وان الفرد لا يستطيع تحقيق الانجازات الكبيره بمفرده$$, 'sha256'), 'hex'),
    'published',
    'seed-vitch-einbeh',
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
select id, 1, 'الفكرة الرئيسية:', 'العمل الفردي', 'التعاون', 'الفشل', 'الكسل', 'B', 'لأن النص كله يدور حول قيمة التعاون والعمل الجماعي في تحقيق الهدف.' from upserted
union all
select id, 2, 'التعاون يؤدي إلى:', 'الفشل', 'النجاح', 'التعب', 'النوم', 'B', 'لأن النص أثبت أن التعاون من أهم أسباب النجاح.' from upserted
union all
select id, 3, 'الفرد وحده:', 'ينجح دائمًا', 'لا يحتاج أحد', 'قد لا يحقق إنجازًا كبيرًا', 'أفضل', 'C', 'لأن النص نص على أن الإنجازات الكبيرة لا تتحقق عادة بمفرد الإنسان وحده.' from upserted;

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
    'قطعة دودة القز وصناعة الحرير',
    'قطعه دوده القز وصناعه الحرير',
    array['قطعة دودة القز وصناعة الحرير', 'دودة القز وصناعة الحرير', 'الحرير'],
    'قطعه دوده القز وصناعه الحرير دوده القز وصناعه الحرير الحرير',
    $$تُعد دودة القز من الكائنات الحية التي تُستخدم في إنتاج الحرير، حيث تتغذى على أوراق التوت، ثم تقوم بإفراز خيوط حريرية تلتف حول نفسها لتكوّن شرنقة.

ويُستخرج الحرير من هذه الشرانق بعد معالجتها، ويُعد من أجود أنواع الأقمشة، وقد اشتهرت بعض الدول بإنتاجه منذ القدم.$$,
    $$تعد دوده القز من الكائنات الحيه التي تستخدم في انتاج الحرير حيث تتغذى على اوراق التوت ثم تقوم بافراز خيوط حريريه تلتف حول نفسها لتكون شرنقه ويستخرج الحرير من هذه الشرانق بعد معالجتها ويعد من اجود انواع الاقمشه وقد اشتهرت بعض الدول بانتاجه منذ القدم$$,
    encode(digest('قطعه دوده القز وصناعه الحرير', 'sha256'), 'hex'),
    encode(digest($$تعد دوده القز من الكائنات الحيه التي تستخدم في انتاج الحرير حيث تتغذى على اوراق التوت ثم تقوم بافراز خيوط حريريه تلتف حول نفسها لتكون شرنقه ويستخرج الحرير من هذه الشرانق بعد معالجتها ويعد من اجود انواع الاقمشه وقد اشتهرت بعض الدول بانتاجه منذ القدم$$, 'sha256'), 'hex'),
    'published',
    'seed-silkworm-silk',
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
select id, 1, 'دودة القز تنتج:', 'القطن', 'الحرير', 'الصوف', 'البلاستيك', 'B', 'لأن النص بيّن أن دودة القز تستخدم في إنتاج الحرير.' from upserted
union all
select id, 2, 'تتغذى على:', 'القمح', 'التوت', 'الشعير', 'الأرز', 'B', 'لأن النص نص على أنها تتغذى على أوراق التوت.' from upserted
union all
select id, 3, 'الحرير:', 'رخيص', 'رديء', 'فاخر', 'بلا فائدة', 'C', 'لأن النص وصف الحرير بأنه من أجود أنواع الأقمشة.' from upserted;

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
    'قطعة التمركز',
    'قطعه التمركز',
    array['قطعة التمركز', 'التمركز'],
    'قطعه التمركز التمركز',
    $$(1) من طبيعة الإنسان (التمركز) وهذه الطبيعة جعلته يتوهم أن الأرض هي مركز الوجود، ثم اتضح له أنها ليست سوى نقطة صغيرة في هذا الكون المذهل، وقد دفعته هذه الفكرة إلى قياس الأشياء على نفسه، فأصبح يبالغ في تقدير ذاته، ولا يرى لنفسه حدودًا، وهذا التمركز يوجد على مستوى الفرد الواحد، وعلى مستويات أخرى متعددة.

(2) بعد ذلك تتسع دائرة التمركز لتأتي دائرة الأسرة، ثم القرية، ثم القبيلة، ثم المدينة، ثم الإقليم، ثم الدولة، ثم العالم، ثم الأقرب فالأقرب من المجتمعات كدائرة العالم العربي، ومن النادر أن يتخلص الإنسان من الدوائر المحيطة به، دوائر التمركز هذه متداخلة ومتداخلة كذلك تحجب الحقائق، وتضع العقل، وترشد الجهل، وتقف عقبات متتالية في طريق التقدم والازدهار.

(3) التمركز يؤدي إلى الانغلاق عن الآخرين، ويؤدي إلى التعصب، والتأكيد لاستسلام العقل للكسل، إذ لم يعد الفرد قادرًا على فهم أو تقبل ثقافة غير ثقافته.$$,
    $$(1) من طبيعه الانسان التمركز وهذه الطبيعه جعلته يتوهم ان الارض هي مركز الوجود ثم اتضح له انها ليست سوى نقطه صغيره في هذا الكون المذهل وقد دفعته هذه الفكره الى قياس الاشياء على نفسه فاصبح يبالغ في تقدير ذاته ولا يرى لنفسه حدودا وهذا التمركز يوجد على مستوى الفرد الواحد وعلى مستويات اخرى متعدده (2) بعد ذلك تتسع دائره التمركز لتاتي دائره الاسره ثم القريه ثم القبيله ثم المدينه ثم الاقليم ثم الدوله ثم العالم ثم الاقرب فالاقرب من المجتمعات كدائره العالم العربي ومن النادر ان يتخلص الانسان من الدوائر المحيطه به دوائر التمركز هذه متداخله ومتداخله كذلك تحجب الحقائق وتضع العقل وترشد الجهل وتقف عقبات متتاليه في طريق التقدم والازدهار (3) التمركز يؤدي الى الانغلاق عن الاخرين ويؤدي الى التعصب والتاكيد لاستسلام العقل للكسل اذ لم يعد الفرد قادرا على فهم او تقبل ثقافه غير ثقافته$$,
    encode(digest('قطعه التمركز', 'sha256'), 'hex'),
    encode(digest($$(1) من طبيعه الانسان التمركز وهذه الطبيعه جعلته يتوهم ان الارض هي مركز الوجود ثم اتضح له انها ليست سوى نقطه صغيره في هذا الكون المذهل وقد دفعته هذه الفكره الى قياس الاشياء على نفسه فاصبح يبالغ في تقدير ذاته ولا يرى لنفسه حدودا وهذا التمركز يوجد على مستوى الفرد الواحد وعلى مستويات اخرى متعدده (2) بعد ذلك تتسع دائره التمركز لتاتي دائره الاسره ثم القريه ثم القبيله ثم المدينه ثم الاقليم ثم الدوله ثم العالم ثم الاقرب فالاقرب من المجتمعات كدائره العالم العربي ومن النادر ان يتخلص الانسان من الدوائر المحيطه به دوائر التمركز هذه متداخله ومتداخله كذلك تحجب الحقائق وتضع العقل وترشد الجهل وتقف عقبات متتاليه في طريق التقدم والازدهار (3) التمركز يؤدي الى الانغلاق عن الاخرين ويؤدي الى التعصب والتاكيد لاستسلام العقل للكسل اذ لم يعد الفرد قادرا على فهم او تقبل ثقافه غير ثقافته$$, 'sha256'), 'hex'),
    'published',
    'seed-centrism',
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
select id, 1, '(66) وفقًا لما جاء في الفقرة (1) فإن الإنسان:', 'غير مهم', 'يبالغ في تقدير ذاته', 'لا يرى نفسه', 'لا يفهم العالم', 'B', 'لأن الفقرة الأولى صرحت بأن الإنسان يبالغ في تقدير ذاته ويقيس الأشياء على نفسه.' from upserted
union all
select id, 2, '(67) وفقًا لما جاء في الفقرة (2) فإن دوائر التمركز:', 'عشوائية', 'تصاعدية', 'تنازلية', 'ثابتة', 'B', 'لأن النص يعرضها في تدرج متسع يبدأ من الفرد ثم الأسرة ثم المجتمع فالأوسع.' from upserted
union all
select id, 3, '(68) أي الآتي صحيح وفقًا لما ورد في النص:', 'التمركز يقود للتقدم', 'التمركز يعزز التعايش والتراحم', 'التمركز يسبب التعصب', 'التمركز يزيد الإنتاج', 'C', 'لأن الفقرة الثالثة نصت صراحة على أن التمركز يؤدي إلى التعصب.' from upserted
union all
select id, 4, '(69) وفقًا للفقرة (2) فإن دوائر التمركز تبدأ بـ:', 'الأسرة', 'الفرد', 'المجتمع', 'الدولة', 'B', 'لأن الفقرة الأولى قررت أن التمركز يوجد أولًا على مستوى الفرد الواحد.' from upserted
union all
select id, 5, '(70) يُستنتج من الفقرة (3) أن التمركز:', 'يؤدي إلى الانفتاح', 'يؤدي إلى الانغلاق', 'يزيد الثقافة', 'يعزز الحوار', 'B', 'لأن الفقرة الثالثة بدأت بعبارة: التمركز يؤدي إلى الانغلاق عن الآخرين.' from upserted
union all
select id, 6, '(71) يُفهم من الفقرة (1) أن الإنسان:', 'يحدد نفسه بدقة', 'يضع نفسه معيارًا للأشياء', 'يقلل من شأنه', 'لا يهتم بالعالم', 'B', 'لأن النص قال إن هذه الفكرة دفعته إلى قياس الأشياء على نفسه.' from upserted
union all
select id, 7, '(72) المنغلقين الذين حققوا الوصول إلى الكمال:', 'موجودون دائمًا', 'موجودون أحيانًا', 'نادر وجودهم', 'غير موجودين', 'C', 'لأن النص يلمح إلى أن التمركز والانغلاق يحجبان الحقائق ويعوقان التقدم، مما يجعل بلوغ الكمال نادرًا جدًا.' from upserted
union all
select id, 8, '(73) الانغلاق عكس الانفتاح، نستنتج أن الكمال عند المنفتحين:', 'غير موجود', 'قليل', 'له أهمية', 'موجود كثير', 'D', 'لأن النص يذم الانغلاق ويجعله عائقًا، فيُفهم أن الانفتاح أقرب إلى بلوغ الكمال والاكتمال.' from upserted
union all
select id, 9, '(60) الانغلاق يؤدي إلى:', 'الحفاظ على التقاليد', 'الإهمال والدعة', 'التقدم', 'الاستقرار', 'B', 'لأن الفقرة الثالثة ربطت الانغلاق باستسلام العقل للكسل والجمود.' from upserted
union all
select id, 10, '(61) المنغلقين الذين حققوا الوصول إلى الكمال:', 'موجود غالبًا', 'نادر الوجود', 'يجعله موجود', 'غير موجود', 'B', 'لأن الانغلاق بحسب النص يحجب الحقائق ويعطل العقل، لذلك فالوصول للكمال معه نادر.' from upserted
union all
select id, 11, '(62) وفقًا لما ورد في الفقرة (2) فإن البعد عن ابتغاء الكمال:', 'يؤدي إلى الجمود', 'يؤدي إلى التطور', 'يؤدي إلى التقدم', 'يزيد الإنتاج', 'A', 'لأن دوائر التمركز تقف عقبات في طريق التقدم والازدهار، وهذا يقود إلى الجمود.' from upserted
union all
select id, 12, '(63) توضح الفقرة (1) أنه عندما يرى الإنسان مميزاته:', 'يتواضع', 'لا يرى سيئاته', 'يسعى لتطوير نفسه', 'يطلب المساعدة', 'B', 'لأن المبالغة في تقدير الذات تعني غياب رؤية العيوب والحدود الحقيقية للنفس.' from upserted
union all
select id, 13, '(64) أنسب عنوان للنص:', 'التمركز الثقافي', 'تمركز الأسرة', 'مفهوم تمركز الإنسان', 'مزايا التمركز', 'C', 'لأن النص كله يشرح معنى التمركز ودوائره وآثاره على الإنسان والمجتمع.' from upserted
union all
select id, 14, '(65) يُفهم من الفقرة (3) أن تمركز الإنسان:', 'إيجابي', 'سلبي', 'محايد', 'ضروري', 'B', 'لأن النص يربطه بالانغلاق والتعصب والكسل، وكلها آثار سلبية.' from upserted
union all
select id, 15, '(56) الانغلاق في نهاية الفقرة (3) يؤدي إلى:', 'التنافر', 'الجمود والركود', 'التفاهم', 'التقدم', 'B', 'لأن الانغلاق يستسلم معه العقل للكسل ولا يعود قادرًا على الفهم والتقبل، وهذا يفضي إلى الجمود.' from upserted
union all
select id, 16, '(57) أي الآتي صحيح وفقًا للنص:', 'التمركز من سمات الشعوب المتقدمة', 'التمركز من طبيعة الإنسان ويمكن التحكم فيه', 'التدرج سمة الشعوب المتحضرة', 'التمركز يؤدي إلى الازدهار', 'B', 'لأن النص وصف التمركز بأنه من طبيعة الإنسان، كما أشار إلى ندرة التخلص منه لا استحالته التامة.' from upserted
union all
select id, 17, '(58) وفقًا للفقرة (2) فإن دوائر التمركز:', 'فردية فقط', 'مجتمعية فقط', 'فردية ومجتمعية', 'متفرقة', 'C', 'لأنها تبدأ بالفرد ثم تتسع إلى الأسرة والقبيلة والدولة والمجتمعات الأوسع.' from upserted
union all
select id, 18, '(59) وفقًا لما جاء في الفقرة (1) يرى الإنسان أن حقوقه:', 'تقل عن الآخرين', 'تساوي واجباته', 'تفوق واجباته', 'تعادل حقوق الآخرين', 'C', 'لأن المبالغة في تقدير الذات والتمركز حول النفس تدل على تعظيم الحقوق وتهميش الحدود والواجبات.' from upserted;

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
    'قطعة قصيرة',
    'قطعه قصيره',
    array['قطعة قصيرة', 'قطعة قصيرة حذف', 'النص القصير'],
    'قطعه قصيره قطعه قصيره حذف النص القصير',
    $$إن في الحياة الدنيا أناس لم يحصلوا إلا على ما يستحقون$$,
    $$ان في الحياه الدنيا اناس لم يحصلوا الا على ما يستحقون$$,
    encode(digest('قطعه قصيره', 'sha256'), 'hex'),
    encode(digest($$ان في الحياه الدنيا اناس لم يحصلوا الا على ما يستحقون$$, 'sha256'), 'hex'),
    'published',
    'seed-short-piece',
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
select id, 1, 'ما الذي يمكن حذفه من النص دون أن يتغير المعنى؟', 'إن - في', 'لم - إلا', 'حصلوا - على', 'يستحقون - ما', 'A', 'لأن حذف (إن) و(في) لا يغيّر المعنى الأساسي للجملة، بينما حذف غيرهما يخل بالبنية أو المعنى.' from upserted;
