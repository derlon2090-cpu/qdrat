"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import {
  ArrowLeft,
  Bookmark,
  Flag,
  Info,
  Lightbulb,
  Pin,
  type LucideIcon,
} from "lucide-react";

type PracticeNavigatorStatus = "current" | "correct" | "incorrect" | "unanswered";

export type PracticeNavigatorItem = {
  id: string;
  label: string;
  active: boolean;
  status: PracticeNavigatorStatus;
  onClick: () => void;
};

export type PracticeSidebarMetric = {
  label: string;
  value: string;
  dotClassName?: string;
};

export type PracticeInfoItem = {
  label: string;
  value: string;
};

export type PracticeFooterAction = {
  key: string;
  label: string;
  icon?: LucideIcon;
  onClick?: () => void;
  href?: string;
  disabled?: boolean;
  variant?: "primary" | "secondary";
};

type PracticeSessionShellProps = {
  topBar?: ReactNode;
  sectionLabel: string;
  progressLabel: string;
  progressValue: number;
  timerLabel: string;
  timerTitle?: string;
  prompt: ReactNode;
  metaBadge?: ReactNode;
  options: ReactNode;
  feedback?: ReactNode;
  notices?: ReactNode;
  completion?: ReactNode;
  footerActions: PracticeFooterAction[];
  tip?: ReactNode;
  navigatorItems: PracticeNavigatorItem[];
  navigatorToggleLabel?: string | null;
  onToggleNavigator?: (() => void) | null;
  summaryTitle?: string;
  summaryProgressValue: number;
  summaryMetrics: PracticeSidebarMetric[];
  infoTitle?: string;
  infoItems: PracticeInfoItem[];
  sidebarFooter?: ReactNode;
};

function orderFooterActions(actions: PracticeFooterAction[]) {
  const nextIndex = actions.findIndex((action) => action.key === "next");
  const previousIndex = actions.findIndex((action) => action.key === "previous");

  if (nextIndex < 0 || previousIndex < 0 || previousIndex < nextIndex) {
    return actions;
  }

  const orderedActions = [...actions];
  const [nextAction] = orderedActions.splice(nextIndex, 1);
  orderedActions.splice(previousIndex, 0, nextAction);
  return orderedActions;
}

function getNavigatorClasses(status: PracticeNavigatorStatus, active: boolean) {
  if (status === "correct") {
    return active
      ? "border-emerald-600 bg-emerald-600 text-white shadow-[0_14px_26px_rgba(5,150,105,0.22)]"
      : "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (status === "incorrect") {
    return active
      ? "border-rose-600 bg-rose-600 text-white shadow-[0_14px_26px_rgba(244,63,94,0.18)]"
      : "border-rose-200 bg-rose-50 text-rose-800";
  }

  if (status === "current") {
    return "border-[#1d4ed8] bg-[#1d4ed8] text-white shadow-[0_14px_26px_rgba(29,78,216,0.22)]";
  }

  return active
    ? "border-[#1d4ed8] bg-[#eef4ff] text-[#1d4ed8]"
    : "border-slate-200 bg-white text-slate-700 hover:border-[#cfd8ea] hover:bg-slate-50";
}

function MiniProgressRing({ value }: { value: number }) {
  const normalized = Math.max(0, Math.min(100, Math.round(value)));

  return (
    <div
      className="grid h-24 w-24 place-items-center rounded-full"
      style={{
        background:
          "conic-gradient(#2563eb " +
          `${normalized * 3.6}deg, rgba(226,232,240,0.92) 0deg)`,
      }}
    >
      <div className="grid h-[4.6rem] w-[4.6rem] place-items-center rounded-full bg-white text-center">
        <div className="text-xl font-black text-slate-950">{normalized}%</div>
        <div className="text-[11px] font-semibold text-slate-500">تقدمك</div>
      </div>
    </div>
  );
}

function FooterActionButton({ action }: { action: PracticeFooterAction }) {
  const Icon = action.icon;
  const classes = [
    "inline-flex h-12 items-center justify-center gap-2 rounded-[1rem] border px-4 text-sm font-bold transition",
    action.variant === "primary"
      ? "border-[#1f4b94] bg-[#1f4b94] text-white shadow-[0_12px_24px_rgba(31,75,148,0.22)] hover:bg-[#163b77]"
      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
    action.disabled ? "cursor-not-allowed opacity-55 hover:bg-inherit" : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (action.href) {
    return (
      <Link href={action.href} className={classes}>
        {Icon ? <Icon className="h-4 w-4" /> : null}
        {action.label}
      </Link>
    );
  }

  return (
    <button type="button" onClick={action.onClick} disabled={action.disabled} className={classes}>
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {action.label}
    </button>
  );
}

export function PracticeSessionTopBar({
  reportHref,
  saved,
  pinned,
  onToggleSaved,
  onTogglePinned,
  rightMeta,
  showPinButton = true,
}: {
  reportHref: string;
  saved: boolean;
  pinned: boolean;
  onToggleSaved: () => void;
  onTogglePinned: () => void;
  rightMeta: ReactNode;
  showPinButton?: boolean;
}) {
  return (
    <div
      dir="rtl"
      className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-slate-200 bg-white px-4 py-3 shadow-[0_14px_30px_rgba(15,23,42,0.04)]"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Link
          href={reportHref}
          className="inline-flex h-11 items-center gap-2 rounded-[1rem] border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <Flag className="h-4 w-4" />
          إبلاغ عن خطأ
        </Link>

        <button
          type="button"
          onClick={onToggleSaved}
          className={`inline-flex h-11 items-center gap-2 rounded-[1rem] border px-4 text-sm font-semibold transition ${
            saved
              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
          }`}
        >
          <Bookmark className="h-4 w-4" />
          {saved ? "السؤال محفوظ" : "حفظ السؤال"}
        </button>

        {showPinButton ? (
          <button
            type="button"
            onClick={onTogglePinned}
            className={`inline-flex h-11 items-center gap-2 rounded-[1rem] border px-4 text-sm font-semibold transition ${
              pinned
                ? "border-amber-200 bg-amber-50 text-amber-700"
                : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            <Pin className="h-4 w-4" />
            {pinned ? "تم تثبيت السؤال" : "تثبيت السؤال"}
          </button>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-500">
        {rightMeta}
      </div>
    </div>
  );
}

export function PracticeSessionShell({
  topBar,
  sectionLabel,
  progressLabel,
  progressValue,
  timerLabel,
  timerTitle = "الوقت",
  prompt,
  metaBadge,
  options,
  feedback,
  notices,
  completion,
  footerActions,
  tip,
  navigatorItems,
  navigatorToggleLabel,
  onToggleNavigator,
  summaryTitle = "تقدمك في القسم",
  summaryProgressValue,
  summaryMetrics,
  infoTitle = "معلومات القسم",
  infoItems,
  sidebarFooter,
}: PracticeSessionShellProps) {
  const orderedFooterActions = orderFooterActions(footerActions);

  return (
    <div className="space-y-4">
      {topBar}

      <div className="grid gap-5 xl:[direction:ltr] xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div dir="rtl" className="space-y-4">
          <section className="rounded-[1.9rem] border border-slate-200 bg-white p-5 shadow-[0_18px_38px_rgba(15,23,42,0.05)] sm:p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="text-sm font-semibold text-slate-500">{sectionLabel}</div>
              <div className="flex items-center gap-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-600">
                  <span className="inline-flex h-2 w-2 rounded-full bg-[#1d4ed8]" />
                  {timerTitle}: {timerLabel}
                </div>
                {metaBadge}
              </div>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <div className="text-sm font-semibold text-slate-500">{progressLabel}</div>
              <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-[linear-gradient(90deg,#2563eb,#60a5fa)] transition-all"
                  style={{ width: `${Math.max(0, Math.min(100, progressValue))}%` }}
                />
              </div>
            </div>

            <div className="mt-7 text-center">
              <div className="mx-auto max-w-4xl text-2xl font-black leading-[1.9] text-slate-950 sm:text-[2rem]">
                {prompt}
              </div>
            </div>

            <div className="mt-7 grid gap-4 md:grid-cols-2">{options}</div>

            {feedback ? <div className="mt-5">{feedback}</div> : null}
            {notices ? <div className="mt-5 space-y-4">{notices}</div> : null}
            {completion ? <div className="mt-5">{completion}</div> : null}

            <div className="mt-6 flex flex-wrap items-center gap-3">
              {orderedFooterActions.map((action) => (
                <FooterActionButton key={action.key} action={action} />
              ))}
            </div>
          </section>

          {tip ? (
            <div className="rounded-[1.4rem] border border-[#d7e5ff] bg-[#f4f8ff] px-5 py-4 text-sm leading-8 text-slate-600 shadow-[0_12px_24px_rgba(37,99,235,0.05)]">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[#2563eb]">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-[#1f4b94]">نصيحة لك</div>
                  <div className="mt-1">{tip}</div>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <aside dir="rtl" className="space-y-4">
          <div className="rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-[0_16px_32px_rgba(15,23,42,0.04)]">
            <div className="flex items-center justify-between gap-3">
              <div className="text-lg font-black text-slate-950">تصفح الأسئلة</div>
              <div className="rounded-full bg-[#eef4ff] px-3 py-1 text-xs font-semibold text-[#1d4ed8]">
                {navigatorItems.length} سؤال
              </div>
            </div>

            <div className="mt-4 grid grid-cols-5 gap-2">
              {navigatorItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.onClick}
                  className={`flex h-11 items-center justify-center rounded-[0.95rem] border text-sm font-bold transition ${getNavigatorClasses(
                    item.status,
                    item.active,
                  )}`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {navigatorToggleLabel && onToggleNavigator ? (
              <button
                type="button"
                onClick={onToggleNavigator}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-[1rem] border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
              >
                {navigatorToggleLabel}
                <ArrowLeft className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          <div className="rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-[0_16px_32px_rgba(15,23,42,0.04)]">
            <div className="text-lg font-black text-slate-950">{summaryTitle}</div>
            <div className="mt-4 flex items-center justify-between gap-4">
              <MiniProgressRing value={summaryProgressValue} />
              <div className="flex-1 space-y-3 text-sm">
                {summaryMetrics.map((metric) => (
                  <div key={metric.label} className="flex items-center justify-between gap-3 text-slate-600">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex h-2.5 w-2.5 rounded-full ${metric.dotClassName ?? "bg-slate-300"}`} />
                      <span>{metric.label}</span>
                    </div>
                    <span className="font-bold text-slate-900">{metric.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-[1.6rem] border border-slate-200 bg-white p-4 shadow-[0_16px_32px_rgba(15,23,42,0.04)]">
            <div className="flex items-center gap-2 text-lg font-black text-slate-950">
              <Info className="h-5 w-5 text-[#1d4ed8]" />
              {infoTitle}
            </div>

            <div className="mt-4 space-y-3">
              {infoItems.map((item) => (
                <div key={item.label} className="rounded-[1rem] border border-slate-100 bg-slate-50 px-4 py-3">
                  <div className="text-xs font-semibold text-slate-500">{item.label}</div>
                  <div className="mt-1 text-sm font-bold text-slate-900">{item.value}</div>
                </div>
              ))}
            </div>
          </div>

          {sidebarFooter}
        </aside>
      </div>
    </div>
  );
}
