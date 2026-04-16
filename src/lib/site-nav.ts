import type { LucideIcon } from "lucide-react";
import {
  BookCopy,
  BriefcaseBusiness,
  ClipboardList,
  Coins,
  FileHeart,
  Files,
  House,
  NotebookPen,
  ShieldCheck,
} from "lucide-react";

export type SiteNavItem = {
  href: string;
  label: string;
  icon: LucideIcon;
  accent: string;
  iconWrap: string;
  description?: string;
};

export const topNavItems: SiteNavItem[] = [
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
    href: "/my-plan",
    label: "خطتي",
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

export const productSidebarItems: SiteNavItem[] = [
  {
    href: "/diagnostic",
    label: "التشخيص",
    icon: ClipboardList,
    accent: "text-[#2563eb]",
    iconWrap: "bg-[#eff6ff]",
    description: "بداية الطالب",
  },
  {
    href: "/my-plan",
    label: "خطتي",
    icon: NotebookPen,
    accent: "text-[#2f855a]",
    iconWrap: "bg-[#edfdf3]",
    description: "الخطة اليومية",
  },
  {
    href: "/question-bank",
    label: "بنك الأسئلة",
    icon: BriefcaseBusiness,
    accent: "text-[#d97706]",
    iconWrap: "bg-[#fff7ed]",
    description: "تدريب وبحث",
  },
  {
    href: "/updates",
    label: "إصدارات",
    icon: BookCopy,
    accent: "text-[#7c3aed]",
    iconWrap: "bg-[#f5f3ff]",
    description: "جديد المنصة",
  },
  {
    href: "/paper-models",
    label: "نماذج الورقي",
    icon: Files,
    accent: "text-[#0f766e]",
    iconWrap: "bg-[#ecfeff]",
    description: "ملفات وتجميعات",
  },
  {
    href: "/wall-of-love",
    label: "جدار الحب",
    icon: FileHeart,
    accent: "text-[#db2777]",
    iconWrap: "bg-[#fdf2f8]",
    description: "آراء وتجارب",
  },
  {
    href: "/golden-guarantee",
    label: "الضمان الذهبي",
    icon: ShieldCheck,
    accent: "text-[#b7791f]",
    iconWrap: "bg-[#fff8e5]",
    description: "الثقة والتحويل",
  },
];

