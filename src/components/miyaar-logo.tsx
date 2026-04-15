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
      <span className="inline-flex h-14 w-14 items-center justify-center">
        <svg viewBox="0 0 64 64" className="h-full w-full">
          <path
            d="M32 4 60 32 32 60 4 32 32 4Z"
            fill="none"
            stroke="#C9A15B"
            strokeWidth="4.2"
            strokeLinejoin="round"
          />
          <path
            d="M32 14 50 32 32 50 14 32 32 14Z"
            fill="none"
            stroke="#C9A15B"
            strokeWidth="3"
            strokeLinejoin="round"
            opacity="0.9"
          />
          <path
            d="M18 29 31.5 22 46 29 31.5 36 18 29Z"
            fill="#123B7A"
          />
          <path
            d="M24 33.5v5.2c2.8 2.4 5.6 3.5 8.1 3.5 2.6 0 5.5-1.1 8.3-3.5v-5.2"
            fill="none"
            stroke="#123B7A"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M45.5 29v7.5"
            stroke="#123B7A"
            strokeWidth="2.3"
            strokeLinecap="round"
          />
          <circle cx="45.5" cy="39.2" r="1.9" fill="#123B7A" />
          <path
            d="M15 34c4.2 0 7.1 1.2 9.6 4.8 1.8 2.6 4.2 3.7 7.1 3.7"
            fill="none"
            stroke="#123B7A"
            strokeWidth="3.4"
            strokeLinecap="round"
          />
        </svg>
      </span>
      <strong className="display-font text-[1.9rem] font-black tracking-tight text-[#123B7A]">
        معيار
      </strong>
    </Link>
  );
}
