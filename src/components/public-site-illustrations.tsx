"use client";

import { cn } from "@/lib/utils";

export function PublicLaptopIllustration({
  className,
}: {
  className?: string;
}) {
  return (
    <div
      className={cn(
        "relative h-[360px] w-full overflow-hidden rounded-[2.4rem] bg-[radial-gradient(circle_at_38%_22%,rgba(255,255,255,0.95),transparent_38%),linear-gradient(180deg,#f6f9ff_0%,#eef4ff_100%)]",
        className,
      )}
    >
      <div className="absolute inset-x-10 bottom-4 h-28 rounded-[50%] bg-[radial-gradient(circle,rgba(142,168,255,0.22),rgba(142,168,255,0.08)_58%,transparent_76%)]" />
      <svg viewBox="0 0 720 420" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="screenBlue" x1="0%" x2="0%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#f9fbff" />
            <stop offset="100%" stopColor="#eef4ff" />
          </linearGradient>
          <linearGradient id="bodyGray" x1="0%" x2="0%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#c8d3ec" />
            <stop offset="100%" stopColor="#8d9bb8" />
          </linearGradient>
          <linearGradient id="barBlue" x1="0%" x2="0%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#8bb8ff" />
            <stop offset="100%" stopColor="#2f6df2" />
          </linearGradient>
        </defs>

        <ellipse cx="280" cy="320" rx="205" ry="54" fill="#dfe9ff" />
        <ellipse cx="282" cy="330" rx="225" ry="52" fill="#cfdcff" opacity="0.5" />

        <g transform="translate(122 62)">
          <rect x="0" y="0" width="300" height="190" rx="18" fill="#3b4259" />
          <rect x="15" y="15" width="270" height="160" rx="12" fill="url(#screenBlue)" />
          <rect x="118" y="185" width="60" height="8" rx="4" fill="#69748f" />
          <path d="M-28 190H328L284 244H18z" fill="url(#bodyGray)" />
          <path d="M18 244H284L256 262H46z" fill="#b4c2de" />
          <rect x="92" y="214" width="116" height="14" rx="7" fill="#dce6fb" />

          <g transform="translate(36 40)">
            <polyline
              points="0,72 44,48 78,55 126,14 176,34"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="0" cy="72" r="5" fill="#3b82f6" />
            <circle cx="44" cy="48" r="5" fill="#3b82f6" />
            <circle cx="78" cy="55" r="5" fill="#3b82f6" />
            <circle cx="126" cy="14" r="5" fill="#3b82f6" />
            <circle cx="176" cy="34" r="5" fill="#3b82f6" />
            <rect x="198" y="2" width="40" height="40" rx="10" fill="#ffffff" />
            <circle cx="218" cy="22" r="14" fill="#edf4ff" stroke="#3b82f6" strokeWidth="4" />
            <path d="M218 12v10l8 4" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />
          </g>
          <rect x="28" y="123" width="70" height="10" rx="5" fill="#dbe7ff" />
          <rect x="28" y="140" width="122" height="8" rx="4" fill="#e6eefc" />
          <rect x="168" y="124" width="92" height="24" rx="9" fill="#ffffff" />
        </g>

        <g transform="translate(58 248)">
          <rect x="0" y="52" width="18" height="46" rx="9" fill="#7cc1a6" />
          <ellipse cx="9" cy="108" rx="28" ry="6" fill="#cfddff" />
          <path
            d="M10 46C2 31 11 8 33 6C40 -10 63 -9 71 9C86 11 92 29 80 43C72 55 59 60 45 60H25C18 60 13 56 10 46Z"
            fill="#58b293"
          />
        </g>

        <g transform="translate(102 282)">
          <rect x="0" y="24" width="74" height="18" rx="4" fill="#4f74d5" />
          <rect x="8" y="0" width="78" height="28" rx="5" fill="#6d95f7" />
          <rect x="16" y="8" width="54" height="8" rx="3" fill="#d9e7ff" />
          <rect x="18" y="42" width="68" height="14" rx="4" fill="#f4c66b" />
        </g>

        <g transform="translate(510 274)">
          <ellipse cx="40" cy="70" rx="48" ry="10" fill="#dce6ff" />
          <rect x="16" y="10" width="48" height="56" rx="9" fill="#2f6df2" />
          <path d="M16 38C25 32 32 30 40 30C48 30 55 33 64 38" fill="none" stroke="#2148a8" strokeWidth="4" />
          <path d="M31 4C44 -8 64 0 64 18" fill="none" stroke="#2f6df2" strokeWidth="6" strokeLinecap="round" />
          <path d="M18 17C26 7 35 3 46 3" fill="none" stroke="#7da5ff" strokeWidth="6" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}

export function PublicNewsletterIllustration({
  className,
}: {
  className?: string;
}) {
  return (
    <svg viewBox="0 0 240 160" className={cn("h-[150px] w-[220px]", className)} aria-hidden="true">
      <defs>
        <linearGradient id="mailBg" x1="0%" x2="100%" y1="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#e7efff" />
        </linearGradient>
      </defs>
      <path d="M38 72h126c10 0 18 8 18 18v34c0 10-8 18-18 18H58c-11 0-20-9-20-20z" fill="#f8fbff" />
      <path d="M28 64h146l-72 48z" fill="#f0c86d" />
      <path d="M28 64v56l46-31z" fill="#f4d487" />
      <path d="M174 64v56l-46-31z" fill="#e9b95a" />
      <path d="M74 89l29 19 29-19 42 31H32z" fill="#ffd97e" />
      <rect x="90" y="22" width="74" height="56" rx="12" fill="url(#mailBg)" stroke="#d8e4ff" />
      <rect x="104" y="38" width="46" height="8" rx="4" fill="#b9ceff" />
      <rect x="104" y="52" width="34" height="8" rx="4" fill="#d7e4ff" />
      <circle cx="186" cy="38" r="8" fill="#facc15" opacity="0.9" />
      <circle cx="198" cy="62" r="5" fill="#60a5fa" opacity="0.8" />
      <circle cx="28" cy="32" r="6" fill="#facc15" opacity="0.8" />
    </svg>
  );
}
