"use client";

import { FormEvent, useState } from "react";
import {
  AlertTriangle,
  Bot,
  BookOpen,
  CreditCard,
  HelpCircle,
  Headphones,
  Info,
  MessageSquareText,
  Paperclip,
  Send,
  UserRound,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";

type AssistantMessage = {
  id: string;
  role: "assistant" | "user";
  text: string;
  time: string;
};

type SupportTopic = {
  id: string;
  title: string;
  subtitle: string;
  icon: typeof Bot;
  tone: string;
  prompt: string;
};

const platformTopics: SupportTopic[] = [
  {
    id: "technical",
    title: "المشاكل التقنية",
    subtitle: "أخطاء الموقع أو التحميل",
    icon: Bot,
    tone: "bg-[#eef4ff] text-[#2563eb]",
    prompt: "أواجه مشكلة في الموقع",
  },
  {
    id: "login",
    title: "تسجيل الدخول والحساب",
    subtitle: "مشاكل تسجيل الدخول أو كلمة المرور",
    icon: UserRound,
    tone: "bg-[#edfdf3] text-[#18b46b]",
    prompt: "لا أستطيع تسجيل الدخول",
  },
  {
    id: "billing",
    title: "الدفع والاشتراكات",
    subtitle: "مشكلة في الدفع أو الاشتراك",
    icon: CreditCard,
    tone: "bg-[#f6efff] text-[#7c3aed]",
    prompt: "مشكلة في الدفع",
  },
  {
    id: "plan",
    title: "الخطة والدراسة",
    subtitle: "الخطط الدراسية والمحتوى",
    icon: BookOpen,
    tone: "bg-[#fff4e7] text-[#f97316]",
    prompt: "استفسار عن الخطة",
  },
  {
    id: "questions",
    title: "الأسئلة والاختبارات",
    subtitle: "استفسارات حول الأسئلة والاختبارات",
    icon: HelpCircle,
    tone: "bg-[#ecfeff] text-[#0891b2]",
    prompt: "مشكلة في الاختبارات",
  },
];

const quickActions = [
  { label: "أواجه مشكلة في الموقع", icon: AlertTriangle, tone: "text-rose-500" },
  { label: "لا أستطيع تسجيل الدخول", icon: UserRound, tone: "text-emerald-600" },
  { label: "مشكلة في الدفع", icon: CreditCard, tone: "text-violet-600" },
  { label: "استفسار عن الخطة", icon: BookOpen, tone: "text-orange-500" },
  { label: "مشكلة في الاختبارات", icon: HelpCircle, tone: "text-cyan-600" },
  { label: "أخرى", icon: MessageSquareText, tone: "text-slate-400" },
];

const platformWords = [
  "معيار",
  "منصة",
  "الموقع",
  "الحساب",
  "الدخول",
  "كلمة",
  "المرور",
  "اشتراك",
  "الدفع",
  "الخطة",
  "الدراسة",
  "الأسئلة",
  "الاختبار",
  "النماذج",
  "الملخصات",
  "بنك",
  "الأخطاء",
  "الاحصائيات",
  "الإحصائيات",
  "لوحتي",
  "pdf",
  "تحميل",
  "رفع",
  "يتعذر",
  "خطأ",
  "لا يعمل",
];

function nowLabel() {
  return new Intl.DateTimeFormat("ar-SA", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date());
}

function createMessage(role: AssistantMessage["role"], text: string): AssistantMessage {
  return {
    id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
    role,
    text,
    time: nowLabel(),
  };
}

const welcomeMessage: AssistantMessage = {
  id: "assistant-welcome",
  role: "assistant",
  text: "مرحبًا 👋\nكيف يمكنني مساعدتك اليوم؟\nاختر موضوعك أو اكتب سؤالك مباشرة.",
  time: "10:30 ص",
};

function normalize(value: string) {
  return value
    .toLowerCase()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/ى/g, "ي")
    .replace(/[^\u0600-\u06FFa-z0-9\s]/g, " ")
    .trim();
}

function isPlatformQuestion(message: string) {
  const normalized = normalize(message);

  return platformWords.some((word) => normalized.includes(normalize(word)));
}

function getAssistantReply(message: string) {
  const normalized = normalize(message);

  if (!isPlatformQuestion(message) && normalized.length > 2 && normalized !== normalize("أخرى")) {
    return "أقدر أساعدك فقط في مشاكل واستفسارات منصة معيار: تسجيل الدخول، الحساب، الدفع، الخطة، بنك الأسئلة، الاختبارات، الملخصات، والأخطاء التقنية. اكتب مشكلتك داخل المنصة وسأعطيك خطوات واضحة.";
  }

  if (/(دخول|حساب|كلمه|مرور|نسيت|تسجيل)/.test(normalized)) {
    return "لمشاكل تسجيل الدخول: تأكد من البريد وكلمة المرور، جرّب تسجيل الخروج ثم الدخول من جديد، ثم حدّث الصفحة. إذا نسيت كلمة المرور استخدم رابط الاستعادة. إذا استمرت المشكلة اكتب لي الرسالة التي تظهر لك بالضبط.";
  }

  if (/(دفع|اشتراك|فاتوره|بطاقه|الغاء|تجديد)/.test(normalized)) {
    return "في مشاكل الدفع أو الاشتراك: راجع حالة الاشتراك من الإعدادات، تأكد أن البطاقة مفعلة وأن العملية لم تُرفض من البنك، ثم جرّب إدارة الاشتراك. إذا ظهر خصم بدون تفعيل، احتفظ برقم العملية وتواصل مع الدعم من نفس الصفحة.";
  }

  if (/(خطه|دراسه|مهام|يوميه|جدول|تقدم)/.test(normalized)) {
    return "للخطة اليومية: افتح قسم الخطة، اضغط إعادة ضبط الخطة إذا كانت المهام غير مناسبة، وتأكد أن مستوى الخطة وموعد الاختبار صحيحان من الإعدادات. إذا لم تُحفظ المهام، جرّب إعادة المحاولة بعد تحديث الصفحة.";
  }

  if (/(سؤال|اسئله|بنك|اختبار|نموذج|لفظي|كمي|اجابه|شرح)/.test(normalized)) {
    return "للأسئلة والاختبارات: بعد اختيار الإجابة اضغط تأكيد لتظهر النتيجة، واضغط حل الشرح فقط إذا أردت الشرح. تقدمك يُحفظ للحساب المسجل، وإذا دخلت القسم مرة أخرى يفترض أن يبدأ من آخر سؤال غير محلول.";
  }

  if (/(ملخص|ملخصات|pdf|رفع|تحميل|صفحه|ملف)/.test(normalized)) {
    return "للملخصات وملفات PDF: ادخل مركز الملخصات، ارفع الملف، ثم افتحه من المكتبة. إذا لم يظهر الملف أو لم تُحمّل الصفحة، جرّب إعادة التحميل وافتح الملف الأصلي. إذا كان النص العربي غير واضح، اكتب اسم الملف وسنوجهك للحل المناسب.";
  }

  if (/(خطا|مشكله|لا يعمل|يتعذر|تعذر|تحميل|علق|يعلق|بطيء)/.test(normalized)) {
    return "للمشاكل التقنية: حدّث الصفحة أولًا، ثم سجّل الخروج والدخول إن احتجت. إذا بقي الخطأ، اكتب اسم القسم الذي حدث فيه الخطأ ونص الرسالة الظاهر في الشاشة حتى أحدد لك الخطوة التالية.";
  }

  return "اختر موضوعًا من القائمة أو اكتب سؤالك عن منصة معيار. أستطيع مساعدتك في: الحساب، الدخول، الدفع، الخطة، بنك الأسئلة، النماذج، الملخصات، وتتبّع الأخطاء.";
}

export function StudentSupportAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [activeTopic, setActiveTopic] = useState(platformTopics[0].id);
  const [messages, setMessages] = useState<AssistantMessage[]>([welcomeMessage]);

  function submitQuestion(value: string) {
    const nextValue = value.trim();

    if (!nextValue) {
      return;
    }

    setMessages((current) => [
      ...current,
      createMessage("user", nextValue),
      createMessage("assistant", getAssistantReply(nextValue)),
    ]);
    setInput("");
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    submitQuestion(input);
  }

  function chooseTopic(topic: SupportTopic) {
    setActiveTopic(topic.id);
    submitQuestion(topic.prompt);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        dir="rtl"
        className="group flex items-center justify-center gap-4 rounded-full bg-white px-4 py-3 shadow-[0_16px_40px_rgba(37,99,235,0.12)] ring-1 ring-[#e8eefb] transition hover:-translate-y-0.5 hover:shadow-[0_20px_46px_rgba(37,99,235,0.16)] lg:justify-start"
      >
        <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[#2563eb] text-white shadow-[0_16px_32px_rgba(37,99,235,0.35)]">
          <Bot className="h-10 w-10" />
        </span>
        <span className="text-right">
          <span className="block text-base font-black text-[#102247]">مساعدك الذكي</span>
          <span className="mt-1 flex items-center gap-2 text-sm text-[#6d7b92]">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            نحن هنا لمساعدتك
          </span>
        </span>
      </button>

      {isOpen ? (
        <div
          dir="rtl"
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#f8fbff]/82 p-4 backdrop-blur-sm"
        >
          <div className="grid h-[min(780px,calc(100vh-2rem))] w-[min(1280px,calc(100vw-2rem))] overflow-hidden rounded-[1.8rem] border border-[#dfe8f7] bg-white shadow-[0_28px_80px_rgba(15,34,71,0.16)] lg:grid-cols-[320px_minmax(0,1fr)]">
            <aside className="hidden border-l border-[#e8eef8] bg-white/95 p-7 lg:block">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="mb-9 flex h-10 w-10 items-center justify-center rounded-full text-[#102247] transition hover:bg-[#f5f8ff]"
                aria-label="إغلاق المساعد"
              >
                <X className="h-6 w-6" />
              </button>

              <h3 className="text-lg font-black text-[#102247]">الموضوعات الشائعة</h3>

              <div className="mt-6 space-y-3">
                {platformTopics.map((topic) => {
                  const Icon = topic.icon;
                  const isActive = topic.id === activeTopic;

                  return (
                    <button
                      key={topic.id}
                      type="button"
                      onClick={() => chooseTopic(topic)}
                      className={cn(
                        "flex w-full items-center justify-between gap-3 rounded-[1rem] border px-4 py-4 text-right transition",
                        isActive
                          ? "border-[#cbdcff] bg-[#f3f7ff] shadow-[0_12px_26px_rgba(37,99,235,0.08)]"
                          : "border-[#edf2fb] bg-white hover:bg-[#f8fbff]",
                      )}
                    >
                      <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-full", topic.tone)}>
                        <Icon className="h-6 w-6" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-black text-[#102247]">{topic.title}</span>
                        <span className="mt-1 block text-xs leading-5 text-[#7b8aa4]">
                          {topic.subtitle}
                        </span>
                      </span>
                      <span className="text-xl text-[#93a1b8]">‹</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-10 rounded-[1.1rem] bg-[#f7f9fd] p-5 text-center">
                <p className="text-sm font-semibold text-[#7b8aa4]">لم تجد ما تبحث عنه؟</p>
                <a
                  href="/contact?topic=support"
                  className="mt-4 inline-flex items-center gap-2 rounded-[0.9rem] bg-[#eaf1ff] px-5 py-3 text-sm font-black text-[#2563eb]"
                >
                  <Headphones className="h-5 w-5" />
                  تواصل مع الدعم الفني
                </a>
              </div>
            </aside>

            <section className="flex min-w-0 flex-col">
              <header className="flex items-center justify-between border-b border-[#e8eef8] px-6 py-5 lg:px-8">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-[#102247] transition hover:bg-[#f5f8ff] lg:hidden"
                  aria-label="إغلاق المساعد"
                >
                  <X className="h-6 w-6" />
                </button>
                <div className="flex items-center gap-4">
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-[#2563eb] text-white shadow-[0_18px_36px_rgba(37,99,235,0.28)]">
                    <Bot className="h-9 w-9" />
                  </span>
                  <div>
                    <h2 className="text-2xl font-black text-[#102247]">مساعدك الذكي</h2>
                    <p className="mt-1 flex items-center gap-2 text-sm text-[#7b8aa4]">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                      نحن هنا لمساعدتك
                    </p>
                  </div>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto px-5 py-8 lg:px-10">
                <div className="mx-auto max-w-4xl space-y-6">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={cn(
                        "flex gap-3",
                        message.role === "user" ? "justify-start" : "justify-end",
                      )}
                    >
                      {message.role === "assistant" ? (
                        <span className="mt-1 flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#edf4ff] text-[#2563eb]">
                          <Bot className="h-6 w-6" />
                        </span>
                      ) : null}
                      <div>
                        <div
                          className={cn(
                            "max-w-[560px] whitespace-pre-line rounded-[1rem] border px-5 py-4 text-sm leading-8",
                            message.role === "assistant"
                              ? "border-[#cfe0ff] bg-[#f3f7ff] text-[#102247]"
                              : "border-[#dfe8f7] bg-white text-[#102247]",
                          )}
                        >
                          {message.text}
                        </div>
                        <div className="mt-2 text-xs text-[#95a3b8]">{message.time}</div>
                      </div>
                    </div>
                  ))}

                  <div className="pt-2">
                    <p className="mb-4 text-sm font-bold text-[#64748b]">اختر موضوعك</p>
                    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                      {quickActions.map((action) => {
                        const Icon = action.icon;

                        return (
                          <button
                            key={action.label}
                            type="button"
                            onClick={() => submitQuestion(action.label)}
                            className="flex items-center justify-center gap-3 rounded-[0.95rem] border border-[#dce7fb] bg-white px-4 py-4 text-sm font-bold text-[#102247] transition hover:border-[#b9d0ff] hover:bg-[#f8fbff]"
                          >
                            <Icon className={cn("h-5 w-5", action.tone)} />
                            {action.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>

              <footer className="border-t border-[#e8eef8] px-5 py-5 lg:px-8">
                <form
                  onSubmit={handleSubmit}
                  className="mx-auto flex max-w-5xl items-center gap-3 rounded-[1rem] border border-[#d8e4f8] bg-white px-4 py-3"
                >
                  <button
                    type="button"
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[0.8rem] bg-[#f3f6fb] text-[#66758f]"
                    aria-label="إرفاق ملف"
                  >
                    <Paperclip className="h-5 w-5" />
                  </button>
                  <input
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
                    placeholder="اكتب سؤالك هنا..."
                    className="min-w-0 flex-1 bg-transparent text-right text-sm font-semibold text-[#102247] outline-none placeholder:text-[#9aa8bd]"
                  />
                  <button
                    type="submit"
                    className="flex h-11 w-14 shrink-0 items-center justify-center rounded-[0.9rem] bg-[#eef4ff] text-[#2563eb] transition hover:bg-[#2563eb] hover:text-white"
                    aria-label="إرسال السؤال"
                  >
                    <Send className="h-5 w-5" />
                  </button>
                </form>
                <div className="mt-3 flex items-center justify-center gap-2 text-xs text-[#95a3b8]">
                  <Info className="h-4 w-4" />
                  المساعد يرد على مشاكل المنصة فقط
                </div>
              </footer>
            </section>
          </div>
        </div>
      ) : null}
    </>
  );
}
