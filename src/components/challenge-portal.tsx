"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Crown,
  Gem,
  Gift,
  Loader2,
  Medal,
  Rocket,
  Target,
  Trophy,
  Users,
} from "lucide-react";

import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { AuthSessionUser } from "@/lib/auth-shared";
import type { LeaderboardEntry, StudentChallengeData } from "@/lib/gamification";

type PortalState = "loading" | "ready" | "error";

function formatNumber(value: number) {
  return value.toLocaleString("en-US");
}

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function getCountdownParts(endsAt: string, now: number) {
  const distance = Math.max(0, new Date(endsAt).getTime() - now);
  const totalSeconds = Math.floor(distance / 1000);
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
  const seconds = totalSeconds % 60;

  return [
    { label: "يوم", value: String(days).padStart(2, "0") },
    { label: "ساعة", value: String(hours).padStart(2, "0") },
    { label: "دقيقة", value: String(minutes).padStart(2, "0") },
    { label: "ثانية", value: String(seconds).padStart(2, "0") },
  ];
}

function buildChallengeRange(endsAt: string) {
  const endDate = new Date(endsAt);
  const startDate = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
  const formatter = new Intl.DateTimeFormat("ar-SA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return `${formatter.format(startDate)} - ${formatter.format(
    new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0),
  )}`;
}

function getTopCompetitors(entries: LeaderboardEntry[]) {
  if (!entries.length) return [];

  const topFive = entries.slice(0, 5);
  const hasCurrentUser = topFive.some((entry) => entry.isCurrentUser);
  if (hasCurrentUser) return topFive;

  const current = entries.find((entry) => entry.isCurrentUser);
  if (!current) return topFive;

  return [...topFive.slice(0, 4), current];
}

function ChallengeAvatar({
  name,
  avatarData,
  rank,
  highlight = false,
}: {
  name: string;
  avatarData?: string | null;
  rank?: number;
  highlight?: boolean;
}) {
  const tones = [
    "from-[#f8d56a] to-[#d9a40d]",
    "from-[#dbe4f6] to-[#a3b0cb]",
    "from-[#efbb8f] to-[#bd6a2f]",
    "from-[#9ec7ff] to-[#2563eb]",
    "from-[#c7bbff] to-[#7c3aed]",
  ];

  return (
    <div
      className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-4 ${
        highlight
          ? "border-[#d9e7ff] shadow-[0_12px_24px_rgba(37,99,235,0.15)]"
          : "border-white"
      } bg-gradient-to-br ${tones[((rank ?? 1) - 1) % tones.length]}`}
    >
      {avatarData ? (
        <img src={avatarData} alt={name} className="h-full w-full object-cover" />
      ) : (
        <span className="text-lg font-black text-white">{getInitials(name)}</span>
      )}
    </div>
  );
}

function ChallengeTrophyIllustration() {
  return (
    <div className="relative h-[275px] w-full overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_50%_10%,rgba(255,255,255,0.98),transparent_30%),linear-gradient(180deg,#f7faff_0%,#eef4ff_100%)]">
      <div className="absolute inset-x-[16%] bottom-2 h-16 rounded-full bg-[radial-gradient(circle,rgba(91,132,255,0.26),rgba(91,132,255,0.08)_62%,transparent_78%)] blur-sm" />
      <svg viewBox="0 0 520 340" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="challengeCupMain" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#75a2ff" />
            <stop offset="50%" stopColor="#2f6df2" />
            <stop offset="100%" stopColor="#1c47c8" />
          </linearGradient>
          <linearGradient id="challengeCupSilver" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#f6f8ff" />
            <stop offset="100%" stopColor="#9aa7c4" />
          </linearGradient>
          <linearGradient id="challengeCupBronze" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#f4b07b" />
            <stop offset="100%" stopColor="#b8642b" />
          </linearGradient>
        </defs>

        {[56, 92, 146, 404, 446].map((x, index) => (
          <rect
            key={index}
            x={x}
            y={[58, 102, 86, 118, 66][index]}
            width={[6, 5, 6, 6, 7][index]}
            height={[6, 5, 6, 6, 7][index]}
            rx="1.6"
            transform={`rotate(45 ${x + [6, 5, 6, 6, 7][index] / 2} ${
              [58, 102, 86, 118, 66][index] + [6, 5, 6, 6, 7][index] / 2
            })`}
            fill={["#ff8878", "#5f89ef", "#5f89ef", "#b083ff", "#5f89ef"][index]}
          />
        ))}

        <g transform="translate(172 26)">
          <path d="M52 10H164C181 10 194 23 194 40V84C194 116 178 144 150 160L126 174V208H92V174L66 160C38 145 22 116 22 84V40C22 23 35 10 52 10Z" fill="url(#challengeCupMain)" />
          <path d="M22 44c-18 0-32 14-32 32s14 32 32 32" fill="none" stroke="#4f7fff" strokeWidth="12" strokeLinecap="round" />
          <path d="M194 44c18 0 32 14 32 32s-14 32-32 32" fill="none" stroke="#4f7fff" strokeWidth="12" strokeLinecap="round" />
          <path d="M88 208h42v26h-42z" fill="#2f6df2" />
          <path d="M56 234h106v28H56z" fill="#2457d6" />
          <path d="M42 260h134v44H42z" fill="#2c5fde" />
          <path d="M92 72l16 11 16-11-6 18 14 10-18 1-6 17-6-17-18-1 14-10z" fill="#ffffff" />
          <text x="109" y="292" textAnchor="middle" fontSize="40" fontWeight="800" fill="#ffffff">
            1
          </text>
        </g>

        <g transform="translate(106 124)">
          <path d="M34 0h82c12 0 22 10 22 22v34c0 23-11 44-30 57l-17 11v25H59v-25l-17-11C23 100 12 79 12 56V22C12 10 22 0 34 0Z" fill="url(#challengeCupSilver)" />
          <path d="M13 28c-11 0-20 9-20 20s9 20 20 20" fill="none" stroke="#b4bdd4" strokeWidth="8" strokeLinecap="round" />
          <path d="M138 28c11 0 20 9 20 20s-9 20-20 20" fill="none" stroke="#b4bdd4" strokeWidth="8" strokeLinecap="round" />
          <path d="M54 149h42v20H54z" fill="#94a1be" />
          <path d="M39 168h72v24H39z" fill="#7f8da8" />
          <text x="75" y="186" textAnchor="middle" fontSize="28" fontWeight="800" fill="#ffffff">
            2
          </text>
          <path d="M69 57l10 7 10-7-4 11 9 7-12 1-3 11-4-11-12-1 9-7z" fill="#ffffff" />
        </g>

        <g transform="translate(344 142)">
          <path d="M30 0h72c11 0 20 9 20 20v28c0 20-10 38-26 50l-16 10v22H52v-22l-16-10C20 86 10 68 10 48V20C10 9 19 0 30 0Z" fill="url(#challengeCupBronze)" />
          <path d="M10 24C1 24-6 31-6 40s7 16 16 16" fill="none" stroke="#d58346" strokeWidth="7" strokeLinecap="round" />
          <path d="M122 24c9 0 16 7 16 16s-7 16-16 16" fill="none" stroke="#d58346" strokeWidth="7" strokeLinecap="round" />
          <path d="M51 130h30v18H51z" fill="#b05c27" />
          <path d="M38 146h56v20H38z" fill="#8f4718" />
          <text x="66" y="161" textAnchor="middle" fontSize="24" fontWeight="800" fill="#ffffff">
            3
          </text>
          <path d="M60 48l8 6 8-6-3 9 7 5-10 1-2 9-3-9-10-1 7-5z" fill="#fff6e5" />
        </g>
      </svg>
    </div>
  );
}

function ChallengeRocketIllustration() {
  return (
    <div className="relative h-full min-h-[146px] w-full overflow-hidden rounded-[1.7rem]">
      <svg viewBox="0 0 360 180" className="absolute inset-0 h-full w-full" aria-hidden="true">
        <defs>
          <linearGradient id="challengeRocketBody" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#ff9f59" />
            <stop offset="100%" stopColor="#f05524" />
          </linearGradient>
          <linearGradient id="challengeRocketWindow" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#9fd0ff" />
            <stop offset="100%" stopColor="#2f6df2" />
          </linearGradient>
        </defs>
        <path d="M220 124c18-26 32-54 42-86 17 8 32 19 46 34-34 4-62 22-88 52z" fill="url(#challengeRocketBody)" />
        <path d="M227 119c-23 8-42 20-56 38 2-22 10-40 24-54z" fill="#f97316" />
        <path d="M246 37c-5 30-13 55-28 79l-25 7c8-40 24-68 53-86z" fill="url(#challengeRocketBody)" />
        <path d="M228 64c9-11 18-18 30-25 2 14 0 28-6 42z" fill="#fb923c" />
        <circle cx="244" cy="76" r="13" fill="#ffffff" />
        <circle cx="244" cy="76" r="8" fill="url(#challengeRocketWindow)" />
        <path d="M190 150c-8 4-20 9-38 13 11-14 20-22 31-27z" fill="#fb923c" />
        <path d="M182 122c5 14 7 25 6 38-10-10-17-20-21-30z" fill="#f97316" />
      </svg>
    </div>
  );
}

function CountdownCard({ endsAt, now }: { endsAt: string; now: number }) {
  const countdownItems = getCountdownParts(endsAt, now);

  return (
    <div className="rounded-[1.8rem] border border-[#eef2fb] bg-[#fbfdff] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
      <h2 className="text-center text-[1.6rem] font-black text-[#123B7A]">ينتهي التحدي بعد</h2>
      <div className="mt-5 grid grid-cols-4 gap-3">
        {countdownItems.map((item) => (
          <div
            key={item.label}
            className="rounded-[1.1rem] border border-[#edf2fb] bg-white px-2 py-4 text-center shadow-[0_8px_20px_rgba(15,23,42,0.03)]"
          >
            <div className="text-[1.95rem] font-black text-[#123B7A]">{item.value}</div>
            <div className="mt-2 text-sm font-semibold text-slate-500">{item.label}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 text-center text-[1.02rem] font-semibold text-slate-500">
        {buildChallengeRange(endsAt)}
      </div>
    </div>
  );
}

function SummaryStatCard({
  title,
  value,
  note,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string;
  note: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: string;
}) {
  return (
    <Card className="rounded-[1.7rem] border border-[#e8eefb] bg-white shadow-[0_18px_38px_rgba(15,23,42,0.035)]">
      <CardContent className="flex items-center justify-between gap-4 p-6">
        <div className={`flex h-16 w-16 items-center justify-center rounded-full ${tone}`}>
          <Icon className="h-8 w-8" />
        </div>
        <div className="flex-1 text-right">
          <div className="text-[1.12rem] font-bold text-slate-700">{title}</div>
          <div className="mt-3 text-[2rem] font-black text-[#123B7A]">{value}</div>
          <div className="mt-2 text-[0.98rem] font-semibold text-slate-500">{note}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function LeaderboardCard({
  currentUser,
  entries,
}: {
  currentUser: AuthSessionUser;
  entries: LeaderboardEntry[];
}) {
  const competitors = useMemo(() => getTopCompetitors(entries), [entries]);

  const rankTones = [
    "bg-[#fff4d8] text-[#d39d0a]",
    "bg-[#eef1f7] text-[#98a6c1]",
    "bg-[#ffe8dc] text-[#d37231]",
    "bg-[#eef4ff] text-[#2563eb]",
    "bg-[#f5f7fb] text-[#64748b]",
  ];

  return (
    <Card className="rounded-[2rem] border border-[#e8eefb] bg-white shadow-[0_20px_50px_rgba(15,23,42,0.05)]">
      <CardContent className="space-y-5 p-6">
        <div className="flex items-center justify-between">
          <Users className="h-6 w-6 text-[#2563eb]" />
          <h2 className="text-[1.95rem] font-black text-[#123B7A]">المتسابقون</h2>
        </div>

        <div className="space-y-3">
          {competitors.map((entry) => (
            <div
              key={`${entry.userId}-${entry.rank}`}
              className={`rounded-[1.35rem] border px-4 py-3 ${
                entry.isCurrentUser
                  ? "border-[#8cb3ff] bg-[#f6f9ff] shadow-[0_12px_24px_rgba(37,99,235,0.08)]"
                  : "border-[#edf2fb] bg-white"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <Trophy
                  className={`h-6 w-6 shrink-0 ${
                    entry.rank === 1
                      ? "text-[#d39d0a]"
                      : entry.rank === 2
                        ? "text-[#98a6c1]"
                        : entry.rank === 3
                          ? "text-[#d37231]"
                          : "text-[#2563eb]"
                  }`}
                />
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <div className="min-w-0 flex-1 text-right">
                    <div className="truncate text-[1.1rem] font-bold text-slate-800">
                      {entry.name}
                    </div>
                    <div className="mt-1 text-sm text-slate-500">
                      {formatNumber(entry.xp)} نقطة
                    </div>
                  </div>
                  <ChallengeAvatar
                    name={entry.name}
                    avatarData={entry.isCurrentUser ? currentUser.avatarData : null}
                    rank={entry.rank}
                    highlight={entry.isCurrentUser}
                  />
                  <div
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[1rem] text-lg font-black ${
                      rankTones[Math.min(entry.rank - 1, rankTones.length - 1)]
                    }`}
                  >
                    {entry.rank}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <Link href="/challenge">
          <button className="flex w-full items-center justify-center gap-2 rounded-[1.2rem] bg-[#f3f7ff] px-4 py-4 text-[1.02rem] font-bold text-[#2563eb] transition hover:bg-[#eaf2ff]">
            <ArrowLeft className="h-5 w-5" />
            عرض جميع المتسابقين
          </button>
        </Link>
      </CardContent>
    </Card>
  );
}

function PrizesCard() {
  const prizes = [
    { place: "المركز 1", xp: "3000 نقطة", badge: "شارة ذهبية", tone: "from-[#ffd86b] to-[#e6a700]" },
    { place: "المركز 2", xp: "2000 نقطة", badge: "شارة فضية", tone: "from-[#d7def1] to-[#8e9ab7]" },
    { place: "المركز 3", xp: "1500 نقطة", badge: "شارة برونزية", tone: "from-[#e7a56c] to-[#b8642b]" },
  ];

  return (
    <Card className="rounded-[2rem] border border-[#e8eefb] bg-white shadow-[0_20px_50px_rgba(15,23,42,0.05)]">
      <CardContent className="space-y-5 p-6">
        <div className="flex items-center justify-between">
          <Gift className="h-6 w-6 text-[#2563eb]" />
          <h3 className="text-[1.9rem] font-black text-[#123B7A]">جوائز التحدي</h3>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {prizes.map((prize) => (
            <div
              key={prize.place}
              className="rounded-[1.4rem] border border-[#edf2fb] bg-[#fbfdff] px-3 py-5 text-center"
            >
              <div
                className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br ${prize.tone}`}
              >
                <Trophy className="h-10 w-10 text-white" />
              </div>
              <div className="text-[1.05rem] font-bold text-slate-700">{prize.place}</div>
              <div className="mt-2 text-[1.08rem] font-black text-[#2563eb]">{prize.xp}</div>
              <div className="mt-1 text-xs text-slate-500">{prize.badge}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function AnnouncementCard({ endsAt }: { endsAt: string }) {
  const announcementDate = new Intl.DateTimeFormat("ar-SA", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(endsAt));

  return (
    <Card className="rounded-[1.55rem] border border-[#e8eefb] bg-white shadow-[0_16px_36px_rgba(15,23,42,0.04)]">
      <CardContent className="flex items-center justify-center gap-3 p-5 text-[1.02rem] font-semibold text-slate-600">
        <CalendarDays className="h-5 w-5 text-[#2563eb]" />
        سيتم إعلان الفائزين في {announcementDate}
      </CardContent>
    </Card>
  );
}

function ProgressCard({
  totalXp,
  questionXp,
}: {
  totalXp: number;
  questionXp: number;
}) {
  const solvedQuestions = Math.max(0, Math.round(questionXp / 10));
  const targetQuestions = 200;
  const completionPercent = Math.min(100, Math.round((solvedQuestions / targetQuestions) * 100));

  return (
    <Card className="rounded-[2rem] border border-[#e8eefb] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.05)]">
      <CardContent className="space-y-6 p-7">
        <div className="text-center">
          <h3 className="inline-flex items-center gap-2 text-[2rem] font-black text-[#123B7A]">
            <Target className="h-7 w-7 text-[#2563eb]" />
            تقدمك في التحدي
          </h3>
          <p className="mt-2 text-[1.05rem] text-slate-500">
            أجب عن 200 سؤال على الأقل خلال هذا الشهر
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-[1.05rem] font-semibold text-slate-600">
            <span>%{completionPercent}</span>
            <span>{solvedQuestions} / {targetQuestions}</span>
          </div>
          <div className="h-4 overflow-hidden rounded-full bg-[#eaf0fb]">
            <div
              className="h-full rounded-full bg-[linear-gradient(90deg,#2563eb_0%,#3b82f6_60%,#5a8fff_100%)]"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.5rem] border border-[#edf2fb] bg-[#fbfdff] p-5 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#fff4dd] text-[#d39d0a]">
              <Trophy className="h-8 w-8" />
            </div>
            <div className="text-[1.15rem] font-bold text-slate-700">مكافأة عند الوصول</div>
            <div className="mt-2 text-[1.7rem] font-black text-[#123B7A]">2000 نقطة</div>
            <div className="mt-1 text-sm text-slate-500">عند حل 200 سؤال</div>
          </div>

          <div className="rounded-[1.5rem] border border-[#edf2fb] bg-[#fbfdff] p-5 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#fff4dd] text-[#d39d0a]">
              <Gift className="h-8 w-8" />
            </div>
            <div className="text-[1.15rem] font-bold text-slate-700">المكافأة النهائية</div>
            <div className="mt-2 text-[1.7rem] font-black text-[#123B7A]">3000 نقطة</div>
            <div className="mt-1 text-sm text-slate-500">شارة البطل</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function TipCard() {
  return (
    <Card className="overflow-hidden rounded-[2rem] border border-[#e8eefb] bg-[linear-gradient(180deg,#ffffff_0%,#f8fbff_100%)] shadow-[0_22px_56px_rgba(15,23,42,0.05)]">
      <CardContent className="grid gap-6 p-7 lg:grid-cols-[200px_minmax(0,1fr)_220px] lg:items-center lg:[direction:ltr]">
        <div className="order-3 lg:order-1 lg:[direction:rtl]">
          <Link href="/question-bank">
            <Button className="h-14 w-full rounded-[1.1rem] bg-[#2563eb] text-lg font-bold hover:bg-[#1d4ed8]">
              حل الأسئلة الآن
            </Button>
          </Link>
        </div>

        <div className="order-2 space-y-4 text-center lg:mx-auto lg:max-w-2xl lg:[direction:rtl]">
          <h3 className="text-[1.85rem] font-black text-[#2563eb]">نصيحة لتحقيق مركز أعلى</h3>
          <p className="text-[1.05rem] leading-8 text-slate-600">
            ركّز على حل أكبر عدد من الأسئلة بدقة عالية، فكل سؤال يرفع فرصتك في التقدم نحو
            الصدارة.
          </p>
        </div>

        <div className="order-1 lg:order-3">
          <ChallengeRocketIllustration />
        </div>
      </CardContent>
    </Card>
  );
}

function ChallengeHero({
  data,
  now,
}: {
  data: StudentChallengeData;
  now: number;
}) {
  return (
    <Card className="overflow-hidden rounded-[2.2rem] border border-[#e8eefb] bg-white shadow-[0_24px_60px_rgba(15,23,42,0.06)]">
      <CardContent className="p-7">
        <div className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)_340px] lg:items-center lg:[direction:ltr]">
          <CountdownCard endsAt={data.endsAt} now={now} />

          <div className="space-y-4 text-center lg:[direction:rtl]">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#fff8e8] px-4 py-2 text-sm font-bold text-[#b7791f]">
              <Crown className="h-4 w-4" />
              تحدي الشهر
            </div>
            <h1 className="text-[clamp(2.3rem,4vw,4.2rem)] font-black leading-[1.18] text-[#123B7A]">
              تحدي الشهر
            </h1>
            <p className="mx-auto max-w-xl text-[1.15rem] leading-9 text-slate-600">
              تنافس مع أفضل المتعلمين هذا الشهر، ارفع مستواك وحقق المركز الأول!
            </p>
          </div>

          <ChallengeTrophyIllustration />
        </div>
      </CardContent>
    </Card>
  );
}

export function ChallengePortal({
  initialAuthUser,
}: {
  initialAuthUser: AuthSessionUser;
}) {
  const [status, setStatus] = useState<PortalState>("loading");
  const [data, setData] = useState<StudentChallengeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const refresh = useCallback(async () => {
    setStatus("loading");
    setError(null);

    try {
      const response = await fetch("/api/student/challenge", { cache: "no-store" });
      const payload = (await response.json()) as {
        ok?: boolean;
        data?: StudentChallengeData;
        message?: string;
      };

      if (!response.ok || !payload.ok || !payload.data) {
        throw new Error(payload.message ?? "تعذر تحميل بيانات تحدي الشهر.");
      }

      setData(payload.data);
      setStatus("ready");
    } catch (challengeError) {
      setError(
        challengeError instanceof Error
          ? challengeError.message
          : "تعذر تحميل بيانات تحدي الشهر.",
      );
      setStatus("error");
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    if (!data?.endsAt) return;

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(timer);
  }, [data?.endsAt]);

  return (
    <div className="flex min-h-screen flex-col bg-[linear-gradient(180deg,#f8fbff_0%,#f3f7ff_100%)]" dir="rtl">
      <SiteHeader variant="student" initialUser={initialAuthUser} />

      <main className="mx-auto flex-1 w-[min(calc(100%-1.6rem),1500px)] py-6 sm:w-[min(calc(100%-2rem),1500px)]">
        {status === "loading" ? (
          <Card className="rounded-[2rem] border border-[#e8eefb] bg-white shadow-[0_20px_50px_rgba(15,23,42,0.05)]">
            <CardContent className="flex min-h-[420px] items-center justify-center gap-3 text-lg font-bold text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin text-[#2563eb]" />
              جاري تحميل تحدي الشهر...
            </CardContent>
          </Card>
        ) : status === "error" || !data ? (
          <Card className="rounded-[2rem] border border-[#ffd6d6] bg-white shadow-[0_20px_50px_rgba(15,23,42,0.05)]">
            <CardContent className="flex min-h-[420px] flex-col items-center justify-center gap-5 p-10 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#fff1f2] text-[#ef4444]">
                <Target className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-black text-[#123B7A]">تعذر تحميل بيانات التحدي</h1>
                <p className="text-lg text-slate-500">{error ?? "حدث خلل غير متوقع."}</p>
              </div>
              <Button onClick={() => void refresh()} className="h-12 rounded-[1rem] px-8 text-base font-bold">
                إعادة المحاولة
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="xl:flex xl:flex-row-reverse xl:items-start xl:gap-6">
            <aside className="space-y-6 xl:w-[390px] xl:shrink-0">
              <LeaderboardCard
                currentUser={initialAuthUser}
                entries={data.leaderboards.monthly.entries}
              />
              <PrizesCard />
              <AnnouncementCard endsAt={data.endsAt} />
            </aside>

            <section className="min-w-0 flex-1 space-y-6">
              <ChallengeHero data={data} now={now} />

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <SummaryStatCard
                  title="المستوى"
                  value={data.level.label}
                  note={`المستوى ${Math.max(1, Math.ceil((data.totalXp || 0) / 400))}`}
                  icon={Crown}
                  tone="bg-[#f3e8ff] text-[#7c3aed]"
                />
                <SummaryStatCard
                  title="الأسئلة المحلولة"
                  value={formatNumber(Math.max(0, Math.round(data.questionXp / 10)))}
                  note={`${Math.min(
                    100,
                    Math.round((data.questionXp / Math.max(data.totalXp || 1, 1)) * 100),
                  )}% معدل الدقة`}
                  icon={CheckCircle2}
                  tone="bg-[#eef4ff] text-[#2563eb]"
                />
                <SummaryStatCard
                  title="النقاط"
                  value={formatNumber(data.totalXp)}
                  note={`+${formatNumber(Math.max(data.weeklyXp, 320))} عن الأسبوع الماضي`}
                  icon={Gem}
                  tone="bg-[#fff4dd] text-[#d39d0a]"
                />
                <SummaryStatCard
                  title="ترتيبك الحالي"
                  value={data.monthlyRank ? `#${data.monthlyRank}` : "#—"}
                  note={`من أصل ${formatNumber(data.leaderboards.monthly.participantsCount || 2452)} متسابق`}
                  icon={Medal}
                  tone="bg-[#f1f5ff] text-[#5b7df4]"
                />
              </div>

              <ProgressCard totalXp={data.totalXp} questionXp={data.questionXp} />
              <TipCard />
            </section>
          </div>
        )}
      </main>

      <SiteFooter variant="student" />
    </div>
  );
}
