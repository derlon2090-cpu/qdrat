import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  BarChart3,
  BookCopy,
  BriefcaseBusiness,
  ClipboardList,
  Coins,
  FileHeart,
  FileText,
  Files,
  House,
  NotebookPen,
  ShieldCheck,
  Trophy,
  UserRound,
} from "lucide-react";

export type SiteNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  accent: string;
  iconWrap: string;
  description?: string;
};

export const publicTopNavItems: SiteNavItem[] = [
  {
    href: "/",
    label: "الرئيسية",
    icon: House,
    accent: "text-[#123B7A]",
    iconWrap: "bg-[#eef4ff]",
  },
  {
    href: "/diagnostic",
    label: "التشخيص",
    icon: ClipboardList,
    accent: "text-[#2563eb]",
    iconWrap: "bg-[#eff6ff]",
  },
  {
    href: "/question-bank",
    label: "بنك الأسئلة",
    icon: BriefcaseBusiness,
    accent: "text-[#d97706]",
    iconWrap: "bg-[#fff7ed]",
  },
  {
    href: "/summaries",
    label: "الملخصات",
    icon: FileText,
    accent: "text-[#123B7A]",
    iconWrap: "bg-[#eef4ff]",
  },
  {
    href: "/paper-models",
    label: "النماذج",
    icon: Files,
    accent: "text-[#0f766e]",
    iconWrap: "bg-[#ecfeff]",
  },
  {
    href: "/pricing",
    label: "الأسعار",
    icon: Coins,
    accent: "text-[#b7791f]",
    iconWrap: "bg-[#fff8e5]",
  },
];

export const studentTopNavItems: SiteNavItem[] = [
  {
    href: "/dashboard",
    label: "لوحتي",
    icon: House,
    accent: "text-[#123B7A]",
    iconWrap: "bg-[#eef4ff]",
  },
  {
    href: "/my-plan",
    label: "الخطة اليومية",
    icon: NotebookPen,
    accent: "text-[#2f855a]",
    iconWrap: "bg-[#edfdf3]",
  },
  {
    href: "/question-bank",
    label: "بنك الأسئلة",
    icon: BriefcaseBusiness,
    accent: "text-[#d97706]",
    iconWrap: "bg-[#fff7ed]",
  },
  {
    href: "/challenge",
    label: "تحدي الشهر",
    icon: Trophy,
    accent: "text-[#b7791f]",
    iconWrap: "bg-[#fff8e5]",
  },
  {
    href: "/summaries",
    label: "الملخصات",
    icon: FileText,
    accent: "text-[#123B7A]",
    iconWrap: "bg-[#eef4ff]",
  },
  {
    href: "/paper-models",
    label: "النماذج",
    icon: Files,
    accent: "text-[#0f766e]",
    iconWrap: "bg-[#ecfeff]",
  },
  {
    href: "/statistics",
    label: "الإحصائيات",
    icon: BarChart3,
    accent: "text-[#7c3aed]",
    iconWrap: "bg-[#f5f3ff]",
  },
  {
    href: "/account",
    label: "الإعدادات",
    icon: UserRound,
    accent: "text-[#475569]",
    iconWrap: "bg-[#f8fafc]",
  },
];

export const studentSidebarItems: SiteNavItem[] = [
  {
    href: "/dashboard",
    label: "لوحة الطالب",
    icon: House,
    accent: "text-[#123B7A]",
    iconWrap: "bg-[#eef4ff]",
    description: "خطة اليوم وتقدمك",
  },
  {
    href: "/my-plan",
    label: "الخطة اليومية",
    icon: NotebookPen,
    accent: "text-[#2f855a]",
    iconWrap: "bg-[#edfdf3]",
    description: "مهامك الذكية",
  },
  {
    href: "/question-bank",
    label: "بنك الأسئلة",
    icon: BriefcaseBusiness,
    accent: "text-[#d97706]",
    iconWrap: "bg-[#fff7ed]",
    description: "تدريب كمي ولفظي",
  },
  {
    href: "/question-bank?track=mistakes",
    label: "الأخطاء",
    icon: AlertTriangle,
    accent: "text-[#dc2626]",
    iconWrap: "bg-[#fff1f2]",
    description: "أسئلتك المتكررة",
  },
  {
    href: "/dashboard#progress",
    label: "المراجعة",
    icon: ClipboardList,
    accent: "text-[#2563eb]",
    iconWrap: "bg-[#eff6ff]",
    description: "الكمي واللفظي",
  },
  {
    href: "/challenge",
    label: "تحدي الشهر",
    icon: Trophy,
    accent: "text-[#b7791f]",
    iconWrap: "bg-[#fff8e5]",
    description: "XP ولوحة الأبطال",
  },
  {
    href: "/summaries",
    label: "الملخصات",
    icon: FileText,
    accent: "text-[#123B7A]",
    iconWrap: "bg-[#eef4ff]",
    description: "ملفاتك وملاحظاتك",
  },
  {
    href: "/paper-models",
    label: "النماذج",
    icon: Files,
    accent: "text-[#0f766e]",
    iconWrap: "bg-[#ecfeff]",
    description: "نماذج التدريب",
  },
  {
    href: "/account",
    label: "الإعدادات",
    icon: UserRound,
    accent: "text-[#475569]",
    iconWrap: "bg-[#f8fafc]",
    description: "الحساب وتفضيلاتك",
  },
];

export const publicFooterLinks = [
  { href: "/", label: "الرئيسية" },
  { href: "/diagnostic", label: "التشخيص" },
  { href: "/question-bank", label: "بنك الأسئلة" },
  { href: "/summaries", label: "الملخصات" },
  { href: "/paper-models", label: "النماذج" },
  { href: "/pricing", label: "الأسعار" },
  { href: "/faq", label: "الأسئلة الشائعة" },
  { href: "/contact", label: "تواصل معنا" },
];

export const studentFooterLinks = [
  { href: "/dashboard", label: "لوحتي" },
  { href: "/my-plan", label: "الخطة اليومية" },
  { href: "/question-bank", label: "بنك الأسئلة" },
  { href: "/question-bank?track=mistakes", label: "الأخطاء" },
  { href: "/dashboard#progress", label: "المراجعة" },
  { href: "/challenge", label: "تحدي الشهر" },
  { href: "/summaries", label: "الملخصات" },
  { href: "/paper-models", label: "النماذج" },
  { href: "/account", label: "الإعدادات" },
  { href: "/faq", label: "الدعم" },
];

export const publicFeatureCards = [
  {
    href: "/updates",
    label: "الإصدارات",
    icon: BookCopy,
    accent: "text-[#7c3aed]",
    iconWrap: "bg-[#f5f3ff]",
    description: "جديد المنصة",
  },
  {
    href: "/wall-of-love",
    label: "آراء الطلاب",
    icon: FileHeart,
    accent: "text-[#db2777]",
    iconWrap: "bg-[#fdf2f8]",
    description: "تجارب واقعية",
  },
  {
    href: "/golden-guarantee",
    label: "الضمان الذهبي",
    icon: ShieldCheck,
    accent: "text-[#b7791f]",
    iconWrap: "bg-[#fff8e5]",
    description: "الثقة والاشتراك",
  },
];

export const topNavItems = publicTopNavItems;
export const productSidebarItems = studentSidebarItems;
