const heroStats = [
  { label: "سؤال تدريبي", value: "25,000+" },
  { label: "اختبار محاكي", value: "120+" },
  { label: "خطة يومية", value: "تكيفية" },
  { label: "لوحة تقدم", value: "فورية" },
];

const features = [
  {
    title: "بنوك أسئلة مرتبة",
    text: "تصنيف حسب المهارة، الصعوبة، ونسبة التكرار حتى يصل الطالب للتدريب المناسب بسرعة.",
  },
  {
    title: "خطة ذكية تتغير",
    text: "المسار اليومي يتبدل حسب الأداء الحقيقي، وقت الاختبار، ونوع الأخطاء المتكررة.",
  },
  {
    title: "اختبارات تحاكي الواقع",
    text: "مؤقت، انتقال سريع، مراجعة قبل التسليم، وتقرير يشرح الأداء بدل مجرد رقم.",
  },
  {
    title: "تجربة عربية راقية",
    text: "واجهة RTL واضحة، مساحات مريحة، وتسلسل بصري يركز الطالب على التقدم لا على التشتيت.",
  },
];

const platformSections = [
  {
    title: "بنوك الأسئلة",
    text: "بحث وفلترة وتخصيص حسب النوع والمهارة والصعوبة والتكرار.",
  },
  {
    title: "قسم القطع",
    text: "عرض القطعة مرة واحدة مع ربط عدة أسئلة بها ومراجعة تفسيرية بعد الحل.",
  },
  {
    title: "الاختبار المحاكي",
    text: "تجربة قريبة من الاختبار الحقيقي بزمن، مراجعة، وتقرير نهائي واضح.",
  },
  {
    title: "لوحة الطالب",
    text: "تقدم، نقاط ضعف، توصيات، وخطة هذا الأسبوع في مكان واحد.",
  },
  {
    title: "المراجعة الذكية",
    text: "ترتيب تلقائي للأخطاء المتكررة والأسئلة المحفوظة والأسئلة المشابهة.",
  },
  {
    title: "لوحة الإدارة",
    text: "إدارة الأسئلة والقطع والبنوك والمستخدمين بدون تعقيد في البنية.",
  },
];

const banks = [
  {
    id: 1,
    title: "لفظي — تناظر لفظي",
    count: 1840,
    level: "متوسط",
    type: "لفظي",
    tag: "إدراك العلاقة",
  },
  {
    id: 2,
    title: "لفظي — إكمال الجمل",
    count: 1260,
    level: "سهل",
    type: "لفظي",
    tag: "السياق",
  },
  {
    id: 3,
    title: "قطع — استيعاب المقروء",
    count: 920,
    level: "متقدم",
    type: "قطع",
    tag: "الفكرة العامة",
  },
  {
    id: 4,
    title: "لفظي — الخطأ السياقي",
    count: 780,
    level: "متوسط",
    type: "لفظي",
    tag: "تحليل المعنى",
  },
  {
    id: 5,
    title: "قطع — تحليل العلاقات",
    count: 530,
    level: "متقدم",
    type: "قطع",
    tag: "الاستنتاج",
  },
  {
    id: 6,
    title: "لفظي — المفردة الشاذة",
    count: 1110,
    level: "سهل",
    type: "لفظي",
    tag: "التصنيف",
  },
];

const benefits = [
  "ربط القطعة بجدول مستقل بدل تكرار نصها داخل كل سؤال.",
  "تحليل سبب الخطأ: فهم، سرعة، تشتت، أو ضعف في مهارة محددة.",
  "تقسيم اللفظي إلى مهارات دقيقة تفيد في الخطط والتقارير.",
  "اختبارات مخصصة ينشئها الطالب حسب النوع والمدة والمستوى.",
  "مراجعة تفسيرية تشرح الإجابة الصحيحة والخاطئة بشكل تعليمي.",
];

const weeklyPlan = [
  { day: "اليوم 1", title: "إكمال جمل + سرعة", progress: 80 },
  { day: "اليوم 2", title: "قطعة قصيرة + استنتاج", progress: 55 },
  { day: "اليوم 3", title: "مراجعة أخطاء متكررة", progress: 30 },
  { day: "اليوم 4", title: "اختبار محاكي مصغر", progress: 12 },
];

const roadmap = [
  "الصفحة الرئيسية وتجربة التسجيل",
  "بنوك اللفظي والقطع",
  "صفحة القطعة المرتبطة بعدة أسئلة",
  "الاختبار المحاكي بالمؤقت",
  "النتائج والمراجعة وحفظ الأسئلة",
  "لوحة الطالب ولوحة الإدارة",
];

const techStack = [
  "Next.js للتطبيق والصفحات والتوسع المستقبلي",
  "Tailwind CSS + shadcn/ui لواجهة مرنة وسريعة البناء",
  "Neon PostgreSQL لعلاقات الأسئلة والقطع والمحاولات",
  "Clerk أو Supabase Auth لتسجيل الدخول وإدارة الحسابات",
  "PostHog للتحليلات وتتبع التفاعل داخل المنصة",
  "PostgreSQL Full Text Search للبحث داخل البنوك والمحتوى",
];

const statsGrid = document.getElementById("stats-grid");
const featureGrid = document.getElementById("feature-grid");
const sectionGrid = document.getElementById("section-grid");
const benefitList = document.getElementById("benefit-list");
const bankList = document.getElementById("bank-list");
const weekList = document.getElementById("week-list");
const roadmapList = document.getElementById("roadmap-list");
const stackGrid = document.getElementById("stack-grid");
const bankSearch = document.getElementById("bank-search");
const filterTabs = Array.from(document.querySelectorAll(".tab-button"));

let activeType = "الكل";

function renderStats() {
  statsGrid.innerHTML = heroStats
    .map(
      (item) => `
        <article class="stat-card reveal">
          <span>${item.label}</span>
          <strong>${item.value}</strong>
        </article>
      `,
    )
    .join("");
}

function renderFeatures() {
  featureGrid.innerHTML = features
    .map(
      (item, index) => `
        <article class="feature-card reveal" style="transition-delay:${index * 60}ms">
          <span class="card-icon">${index + 1}</span>
          <h3>${item.title}</h3>
          <p>${item.text}</p>
        </article>
      `,
    )
    .join("");
}

function renderSections() {
  sectionGrid.innerHTML = platformSections
    .map(
      (item, index) => `
        <article class="section-card reveal" style="transition-delay:${index * 40}ms">
          <span class="card-icon">${index + 1}</span>
          <h3>${item.title}</h3>
          <p>${item.text}</p>
        </article>
      `,
    )
    .join("");
}

function renderBenefits() {
  benefitList.innerHTML = benefits.map((item) => `<li>${item}</li>`).join("");
}

function renderWeeklyPlan() {
  weekList.innerHTML = weeklyPlan
    .map(
      (item) => `
        <article class="week-item">
          <div class="week-top">
            <div>
              <div class="week-label">${item.day}</div>
              <div class="week-title">${item.title}</div>
            </div>
            <strong>${item.progress}%</strong>
          </div>
          <div class="progress-track">
            <span class="progress-fill" style="width:${item.progress}%"></span>
          </div>
        </article>
      `,
    )
    .join("");
}

function renderRoadmap() {
  roadmapList.innerHTML = roadmap
    .map(
      (item, index) => `
        <article class="roadmap-item">
          <span class="roadmap-step">${index + 1}</span>
          <strong>${item}</strong>
        </article>
      `,
    )
    .join("");
}

function renderTechStack() {
  stackGrid.innerHTML = techStack
    .map((item) => `<div class="stack-tile">${item}</div>`)
    .join("");
}

function filterBanks() {
  const query = bankSearch.value.trim();

  return banks.filter((bank) => {
    const matchesType = activeType === "الكل" || bank.type === activeType;

    if (!query) {
      return matchesType;
    }

    const haystack = `${bank.title} ${bank.level} ${bank.type} ${bank.tag}`;
    return matchesType && haystack.includes(query);
  });
}

function renderBanks() {
  const filtered = filterBanks();

  if (!filtered.length) {
    bankList.innerHTML = `
      <div class="empty-state">
        لا توجد نتائج مطابقة للبحث الحالي. جرّب كلمة أخرى أو غيّر نوع البنك.
      </div>
    `;
    return;
  }

  bankList.innerHTML = filtered
    .map(
      (bank) => `
        <article class="bank-card">
          <div>
            <h3 class="bank-title">
              <span>${bank.title}</span>
              <span class="pill pill-dark">${bank.type}</span>
              <span class="pill pill-outline">${bank.level}</span>
              <span class="pill pill-soft">${bank.tag}</span>
            </h3>
            <p class="bank-description">
              بنك جاهز للتدريب السريع، الاختبار المخصص، أو إضافته مباشرة إلى مسار الطالب اليومي.
            </p>
          </div>

          <div class="bank-meta">
            <div class="bank-count">
              <strong>${bank.count.toLocaleString("en-US")}</strong>
              <span>سؤال</span>
            </div>
            <a class="bank-button" href="#cta">استعراض</a>
          </div>
        </article>
      `,
    )
    .join("");
}

function bindFilters() {
  filterTabs.forEach((button) => {
    button.addEventListener("click", () => {
      activeType = button.dataset.type || "الكل";

      filterTabs.forEach((item) => item.classList.remove("is-active"));
      button.classList.add("is-active");

      renderBanks();
    });
  });

  bankSearch.addEventListener("input", renderBanks);
}

function setupReveal() {
  const nodes = Array.from(document.querySelectorAll(".reveal"));

  if (!("IntersectionObserver" in window)) {
    nodes.forEach((node) => node.classList.add("is-visible"));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.14 },
  );

  nodes.forEach((node) => observer.observe(node));
}

function init() {
  renderStats();
  renderFeatures();
  renderSections();
  renderBenefits();
  renderWeeklyPlan();
  renderRoadmap();
  renderTechStack();
  renderBanks();
  bindFilters();
  setupReveal();
}

init();
