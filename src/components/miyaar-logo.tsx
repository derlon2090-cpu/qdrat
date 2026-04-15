import Link from "next/link";

import { cn } from "@/lib/utils";

export function MiyaarLogo({
  className,
  href = "/",
}: {
  className?: string;
  href?: string;
}) {
  return (
    <Link href={href} className={cn("inline-flex items-center gap-3", className)}>
      <span className="inline-flex h-14 w-14 items-center justify-center rounded-[1.15rem] shadow-soft">
        <svg viewBox="0 0 64 64" className="h-full w-full">
          <defs>
            <linearGradient id="miyaarBrand" x1="12%" y1="10%" x2="86%" y2="86%">
              <stop offset="0%" stopColor="#7c72ff" />
              <stop offset="48%" stopColor="#1e2a55" />
              <stop offset="100%" stopColor="#d2a85a" />
            </linearGradient>
          </defs>
          <rect x="4" y="4" width="56" height="56" rx="18" fill="url(#miyaarBrand)" />
          <path
            d="M17 44V18M17 18H45M45 18V47M29 47H45"
            fill="none"
            stroke="#ffffff"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="4.5"
          />
          <circle cx="36.5" cy="27.5" r="8" fill="none" stroke="#f3d48f" strokeWidth="3.5" />
        </svg>
      </span>
      <span className="flex flex-col">
        <strong className="display-font text-[1.4rem] font-extrabold tracking-tight text-slate-950">
          معيار
        </strong>
        <small className="text-xs text-slate-500">قياس ذكي للتفوق</small>
      </span>
    </Link>
  );
}
