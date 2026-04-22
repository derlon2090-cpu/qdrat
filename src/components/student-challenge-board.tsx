"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  Crown,
  Loader2,
  Medal,
  Sparkles,
  Swords,
  Target,
  Trophy,
} from "lucide-react";

import { StudentAccessCard } from "@/components/student-access-card";
import {
  StudentPortalErrorCard,
  StudentPortalLoadingCard,
} from "@/components/student-portal-shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useAuthSession } from "@/hooks/use-auth-session";
import type {
  LeaderboardPeriod,
  StudentChallengeAchievement,
  StudentChallengeData,
  StudentChallengeMission,
} from "@/lib/gamification";

type ChallengeStatus = "idle" | "loading" | "ready" | "error";

const periodOptions: Array<{ id: LeaderboardPeriod; label: string }> = [
  { id: "daily", label: "يومي" },
  { id: "weekly", label: "أسبوعي" },
  { id: "monthly", label: "شهري" },
];

function getRankLabel(rank: number | null) {
  if (rank == null) return "لم تدخل الترتيب بعد";
  return `#${rank}`;
}

function formatXp(value: number) {
  return value.toLocaleString("en-US");
}

function getMissionProgressPercent(mission: StudentChallengeMission) {
  if (!mission.target) return 0;
  return Math.max(0, Math.min(100, Math.round((mission.progress / mission.target) * 100)));
}

function AchievementCard({ achievement }: { achievement: StudentChallengeAchievement }) {
  return (
    <article
      className={`rounded-[1.6rem] border p-4 transition ${
        achievement.unlocked
          ? "border-emerald-200 bg-emerald-50/70"
          : "border-slate-200 bg-white"
      }`}
    >
      <div className="flex items-start gap-3">
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-[1rem] text-2xl ${
            achievement.unlocked ? "bg-emerald-100" : "bg-slate-100"
          }`}
        >
          <span aria-hidden="true">{achievement.icon}</span>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="display-font text-lg font-bold text-slate-950">
              {achievement.title}
            </div>
            <Badge
              className={
                achievement.unlocked
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-slate-100 text-slate-600"
              }
            >
              {achievement.unlocked ? "مفتوح" : "قيد العمل"}
            </Badge>
          </div>
          <p className="mt-2 text-sm leading-7 text-slate-600">
            {achievement.description}
          </p>
          <div className="mt-3 text-xs font-semibold text-slate-500">
            {achievement.progressLabel}
          </div>
        </div>
      </div>
    </article>
  );
}

export function StudentChallengeBoard() {
  const router = useRouter();
  const { status, user } = useAuthSession();
  const [challengeStatus, setChallengeStatus] = useState<ChallengeStatus>("idle");
  const [data, setData] = useState<StudentChallengeData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [activePeriod, setActivePeriod] = useState<LeaderboardPeriod>("monthly");
  const [creatingDuelUserId, setCreatingDuelUserId] = useState<string | null>(null);
  const [duelMessage, setDuelMessage] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (status !== "authenticated") {
      setChallengeStatus("idle");
      return;
    }

    setChallengeStatus("loading");
    setError(null);

    try {
      const response = await fetch("/api/student/challenge", {
        cache: "no-store",
      });

      const payload = (await response.json()) as {
        ok?: boolean;
        data?: StudentChallengeData;
        message?: string;
      };

      if (!response.ok || !payload.ok || !payload.data) {
        throw new Error(payload.message ?? "تعذر تحميل بيانات تحدي الشهر.");
      }

      setData(payload.data);
      setChallengeStatus("ready");
    } catch (challengeError) {
      setChallengeStatus("error");
      setError(
        challengeError instanceof Error
          ? challengeError.message
          : "تعذر تحميل بيانات تحدي الشهر.",
      );
    }
  }, [status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    void refresh();
  }, [refresh, status]);

  const activeLeaderboard = useMemo(() => {
    if (!data) return null;
    return data.leaderboards[activePeriod];
  }, [activePeriod, data]);

  const duelRivals = useMemo(() => {
    if (!data) return [];
    return data.leaderboards.monthly.entries.filter((entry) => !entry.isCurrentUser).slice(0, 4);
  }, [data]);

  const createDuel = useCallback(
    async (opponentId: string) => {
      setCreatingDuelUserId(opponentId);
      setDuelMessage(null);

      try {
        const response = await fetch("/api/student/challenge/duels", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            opponentId,
            track: "all",
            questionCount: 10,
          }),
        });

        const payload = (await response.json()) as {
          ok?: boolean;
          data?: {
            duel?: {
              id: number;
              opponentName: string;
              startHref: string;
            };
            isExisting?: boolean;
          };
          message?: string;
        };

        if (!response.ok || !payload.ok || !payload.data?.duel) {
          throw new Error(payload.message ?? "تعذر إنشاء نزال 1v1 الآن.");
        }

        setDuelMessage(
          payload.data.isExisting
            ? `تم فتح النزال الحالي ضد ${payload.data.duel.opponentName}.`
            : `تم إنشاء نزال جديد ضد ${payload.data.duel.opponentName}.`,
        );
        await refresh();
        router.push(payload.data.duel.startHref);
      } catch (duelError) {
        setDuelMessage(
          duelError instanceof Error ? duelError.message : "تعذر إنشاء نزال 1v1 الآن.",
        );
      } finally {
        setCreatingDuelUserId(null);
      }
    },
    [refresh, router],
  );

  if (status === "loading") {
    return <StudentPortalLoadingCard label="جار تجهيز لوحة التحدي..." />;
  }

  if (status !== "authenticated" || !user) {
    return (
      <StudentAccessCard
        title="تحدي الشهر مرتبط بحسابك"
        description="سجل دخولك أولًا حتى يظهر ترتيبك، مستوى XP، المهام اليومية، ولوحة الأبطال داخل المنصة."
        next="/challenge"
      />
    );
  }

  if (challengeStatus === "loading" || challengeStatus === "idle") {
    return <StudentPortalLoadingCard label="جار تحميل بيانات تحدي الشهر..." />;
  }

  if (challengeStatus === "error" || !data || !activeLeaderboard) {
    return (
      <StudentPortalErrorCard
        message={error ?? "تعذر تحميل بيانات تحدي الشهر."}
        onRetry={() => void refresh()}
      />
    );
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden rounded-[2.3rem] border-0 bg-[linear-gradient(135deg,#123B7A_0%,#1D4ED8_46%,#0EA5A4_100%)] shadow-[0_28px_76px_rgba(18,59,122,0.22)]">
        <CardContent className="space-y-8 p-8">
          <div className="grid gap-8 xl:grid-cols-[1.08fr,0.92fr]">
            <div>
              <Badge className="bg-white/12 text-white">تحدي الشهر</Badge>
              <h2 className="mt-4 display-font text-[clamp(2.2rem,4vw,4rem)] font-extrabold text-white">
                نافسك على الصدارة واجمع XP بذكاء
              </h2>
              <p className="mt-3 max-w-3xl text-sm leading-8 text-white/82">
                كل حل صحيح، كل مراجعة أخطاء، وكل جلسة مكتملة ترفع ترتيبك داخل لوحة
                الأبطال. هدفك الآن: تثبيت مستواك، ثم اقتحام الترتيب الأعلى.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/question-bank">
                  <Button className="gap-2 bg-white text-[#123B7A] hover:bg-white/95">
                    <Target className="h-4 w-4" />
                    ابدأ التدريب الآن
                  </Button>
                </Link>
                <Link href="/question-bank?track=mistakes#mistakes-trainer">
                  <Button
                    variant="outline"
                    className="gap-2 border-white/20 bg-white/8 text-white hover:bg-white/14"
                  >
                    <Swords className="h-4 w-4" />
                    تدرب على أخطائك
                  </Button>
                </Link>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-2">
              <div className="rounded-[1.8rem] border border-white/14 bg-white/10 p-5 text-white">
                <div className="text-xs font-semibold tracking-[0.14em] text-white/65">
                  اللقب الحالي
                </div>
                <div className="mt-3 display-font text-3xl font-extrabold">
                  {data.currentTitle}
                </div>
                <div className="mt-2 text-sm text-white/75">
                  {data.monthLabel} • {data.countdownLabel}
                </div>
              </div>

              <div className="rounded-[1.8rem] border border-white/14 bg-white/10 p-5 text-white">
                <div className="text-xs font-semibold tracking-[0.14em] text-white/65">
                  ترتيبك الشهري
                </div>
                <div className="mt-3 display-font text-3xl font-extrabold">
                  {getRankLabel(data.monthlyRank)}
                </div>
                <div className="mt-2 text-sm text-white/75">
                  {data.rankProtection.active
                    ? data.rankProtection.description
                    : data.nextMonthlyRankGap
                    ? `تحتاج ${formatXp(data.nextMonthlyRankGap)} XP لتقترب من المركز الأعلى.`
                    : "أنت في موقع ممتاز، حافظ على نسقك الحالي."}
                </div>
              </div>

              <div className="rounded-[1.8rem] border border-white/14 bg-white/10 p-5 text-white">
                <div className="text-xs font-semibold tracking-[0.14em] text-white/65">
                  إجمالي XP
                </div>
                <div className="mt-3 display-font text-3xl font-extrabold">
                  {formatXp(data.totalXp)}
                </div>
                <div className="mt-2 text-sm text-white/75">
                  سؤال: {formatXp(data.questionXp)} • مكافآت: {formatXp(data.bonusXp)}
                </div>
              </div>

              <div className="rounded-[1.8rem] border border-white/14 bg-white/10 p-5 text-white">
                <div className="text-xs font-semibold tracking-[0.14em] text-white/65">
                  السلسلة اليومية
                </div>
                <div className="mt-3 display-font text-3xl font-extrabold">
                  {data.currentStreak} يوم
                </div>
                <div className="mt-2 text-sm text-white/75">
                  أفضل سلسلة وصلت لها: {data.bestStreak} يوم
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-4">
            <StatCard
              title="مستواك"
              value={data.level.label}
              caption={`التالي: ${data.level.nextLevelLabel ?? "أعلى مستوى"}`}
              icon={Crown}
            />
            <StatCard
              title="XP اليوم"
              value={formatXp(data.dailyXp)}
              caption={`ترتيبك اليوم: ${getRankLabel(data.dailyRank)}`}
              icon={Sparkles}
            />
            <StatCard
              title="XP الأسبوع"
              value={formatXp(data.weeklyXp)}
              caption={`ترتيبك الأسبوعي: ${getRankLabel(data.weeklyRank)}`}
              icon={Medal}
            />
            <StatCard
              title="XP الشهر"
              value={formatXp(data.monthlyXp)}
              caption={`ترتيبك الشهري: ${getRankLabel(data.monthlyRank)}`}
              icon={Trophy}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-[1.7rem] border border-white/14 bg-white/10 p-5 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold tracking-[0.14em] text-white/65">
                    مضاعف النقاط
                  </div>
                  <div className="mt-3 display-font text-3xl font-extrabold">
                    {data.xpMultiplier.active
                      ? `x${data.xpMultiplier.multiplier}`
                      : data.xpMultiplier.nextLabel ?? "x1"}
                  </div>
                  <div className="mt-2 text-sm leading-7 text-white/75">
                    {data.xpMultiplier.description}
                  </div>
                </div>
                <Badge
                  className={
                    data.xpMultiplier.active
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-white/12 text-white"
                  }
                >
                  {data.xpMultiplier.active ? "مفعل الآن" : "قادم قريبًا"}
                </Badge>
              </div>
            </div>

            <div className="rounded-[1.7rem] border border-white/14 bg-white/10 p-5 text-white">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold tracking-[0.14em] text-white/65">
                    حماية المركز
                  </div>
                  <div className="mt-3 display-font text-3xl font-extrabold">
                    {data.rankProtection.active
                      ? `#${data.rankProtection.protectedRank}`
                      : "غير مفعلة"}
                  </div>
                  <div className="mt-2 text-sm leading-7 text-white/75">
                    {data.rankProtection.description}
                  </div>
                </div>
                <Badge
                  className={
                    data.rankProtection.active
                      ? "bg-[#fff7e8] text-[#b7791f]"
                      : "bg-white/12 text-white"
                  }
                >
                  {data.rankProtection.label}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.02fr,0.98fr]">
        <Card className="rounded-[2rem] border border-slate-200 bg-white/96 shadow-soft">
          <CardContent className="space-y-5 p-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="section-eyebrow text-[#123B7A]">لوحة الأبطال</p>
                <h3 className="display-font text-2xl font-bold text-slate-950">
                  الترتيب {activeLeaderboard.label}
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  عدد المشاركين في هذا المسار: {activeLeaderboard.participantsCount}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {periodOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setActivePeriod(option.id)}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                      activePeriod === option.id
                        ? "bg-[#123B7A] text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-[1.6rem] border border-[#dbe6f6] bg-[linear-gradient(180deg,rgba(241,246,255,0.98),rgba(255,255,255,0.98))] p-5">
              <div className="grid gap-4 md:grid-cols-3">
                <InfoCard
                  title="ترتيبك"
                  value={getRankLabel(activeLeaderboard.currentUser.rank)}
                  caption="يتحدث تلقائيًا حسب الفلتر المختار."
                />
                <InfoCard
                  title="XP الحالي"
                  value={formatXp(activeLeaderboard.currentUser.xp)}
                  caption="حصيلتك داخل الفترة الحالية."
                />
                <InfoCard
                  title="المتبقي للمركز التالي"
                  value={
                    activeLeaderboard.currentUser.nextRankGap
                      ? `${formatXp(activeLeaderboard.currentUser.nextRankGap)} XP`
                      : "—"
                  }
                  caption="إذا كان هناك مركز أعلى قريب منك سيظهر هنا."
                />
              </div>
            </div>

            <div className="space-y-3">
              {activeLeaderboard.entries.length ? (
                activeLeaderboard.entries.map((entry) => (
                  <article
                    key={`${activePeriod}-${entry.userId}-${entry.rank}`}
                    className={`rounded-[1.5rem] border p-4 transition ${
                      entry.isCurrentUser
                        ? "border-[#cfe0ff] bg-[#f3f8ff]"
                        : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="display-font text-lg font-bold text-slate-950">
                            {entry.rank <= 3 ? ["🥇", "🥈", "🥉"][entry.rank - 1] : "#"}
                            {entry.rank} — {entry.name}
                          </div>
                          {entry.badgeLabel ? (
                            <Badge className="bg-[#fff7e8] text-[#b7791f]">
                              {entry.badgeLabel}
                            </Badge>
                          ) : null}
                          {entry.isCurrentUser ? (
                            <Badge className="bg-[#eef4ff] text-[#123B7A]">أنت</Badge>
                          ) : null}
                        </div>
                      </div>

                      <div className="text-left">
                        <div className="display-font text-2xl font-bold text-slate-950">
                          {formatXp(entry.xp)}
                        </div>
                        <div className="text-xs font-semibold text-slate-500">XP</div>
                      </div>
                    </div>
                  </article>
                ))
              ) : (
                <div className="rounded-[1.5rem] border border-dashed border-slate-300 bg-slate-50/70 p-6 text-sm leading-8 text-slate-600">
                  ابدأ بحل الأسئلة وجمع XP حتى يظهر ترتيبك داخل لوحة الأبطال.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="rounded-[2rem] border border-slate-200 bg-white/96 shadow-soft">
            <CardContent className="space-y-5 p-8">
              <div>
                <p className="section-eyebrow text-[#123B7A]">نزال 1v1</p>
                <h3 className="display-font text-2xl font-bold text-slate-950">
                  تحدَّ منافسًا على 10 أسئلة
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  يبدأ النزال من تدريب الأخطاء، والفائز يُحسم تلقائيًا بعد إنهاء الطرفين مع XP إضافي.
                </p>
              </div>

              {duelMessage ? (
                <div className="rounded-[1.4rem] border border-[#dbe6f6] bg-[#f3f8ff] p-4 text-sm leading-7 text-[#123B7A]">
                  {duelMessage}
                </div>
              ) : null}

              <div className="grid gap-3">
                {duelRivals.length ? (
                  duelRivals.map((entry) => (
                    <div
                      key={`duel-rival-${entry.userId}`}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-[1.4rem] border border-slate-200 bg-slate-50/70 p-4"
                    >
                      <div>
                        <div className="display-font text-lg font-bold text-slate-950">
                          {entry.name}
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          الترتيب الشهري #{entry.rank} • {formatXp(entry.xp)} XP
                        </div>
                      </div>
                      <Button
                        type="button"
                        onClick={() => void createDuel(entry.userId)}
                        disabled={creatingDuelUserId === entry.userId}
                        className="gap-2"
                      >
                        {creatingDuelUserId === entry.userId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Swords className="h-4 w-4" />
                        )}
                        تحدَّه الآن
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="rounded-[1.4rem] border border-dashed border-slate-300 bg-slate-50/70 p-4 text-sm leading-7 text-slate-500">
                    عندما يظهر لديك منافسون داخل الترتيب الشهري ستستطيع بدء نزال 1v1 مباشرة من هنا.
                  </div>
                )}
              </div>

              {data.duels.length ? (
                <div className="space-y-3 pt-2">
                  <div className="text-sm font-bold text-slate-900">نزالاتك الحالية</div>
                  {data.duels.map((duel) => (
                    <article
                      key={`duel-${duel.id}`}
                      className="rounded-[1.4rem] border border-slate-200 bg-white p-4"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <div className="display-font text-lg font-bold text-slate-950">
                            ضد {duel.opponentName}
                          </div>
                          <div className="mt-2 text-sm leading-7 text-slate-600">
                            {duel.resultLabel} • {duel.questionCount} أسئلة •{" "}
                            {duel.track === "quantitative"
                              ? "الكمي"
                              : duel.track === "verbal"
                                ? "اللفظي"
                                : "الكل"}
                          </div>
                          <div className="mt-1 text-xs font-semibold text-slate-500">
                            {duel.bonusLabel}
                          </div>
                        </div>
                        {duel.canStart ? (
                          <Link href={duel.startHref}>
                            <Button className="gap-2">
                              <Trophy className="h-4 w-4" />
                              ابدأ النزال
                            </Button>
                          </Link>
                        ) : (
                          <Badge
                            className={
                              duel.status === "completed"
                                ? "bg-emerald-100 text-emerald-800"
                                : duel.status === "expired"
                                  ? "bg-slate-100 text-slate-700"
                                  : "bg-[#eef4ff] text-[#123B7A]"
                            }
                          >
                            {duel.status === "completed"
                              ? "مكتمل"
                              : duel.status === "expired"
                                ? "منتهي"
                                : "قيد الانتظار"}
                          </Badge>
                        )}
                      </div>
                    </article>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border border-slate-200 bg-white/96 shadow-soft">
            <CardContent className="space-y-5 p-8">
              <div>
                <p className="section-eyebrow text-[#123B7A]">المهام اليومية</p>
                <h3 className="display-font text-2xl font-bold text-slate-950">
                  XP إضافي كل يوم
                </h3>
                <p className="mt-2 text-sm leading-7 text-slate-500">
                  أنجز المهام القصيرة التالية لتزيد رصيدك اليومي وتثبت السلسلة.
                </p>
              </div>

              <div className="space-y-4">
                {data.missions.map((mission) => (
                  <article
                    key={mission.id}
                    className="rounded-[1.5rem] border border-slate-200 bg-slate-50/70 p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="display-font text-lg font-bold text-slate-950">
                          {mission.title}
                        </div>
                        <p className="mt-2 text-sm leading-7 text-slate-600">
                          {mission.description}
                        </p>
                      </div>
                      <Badge
                        className={
                          mission.claimed || mission.completed
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-[#fff7e8] text-[#b7791f]"
                        }
                      >
                        +{mission.rewardXp} XP
                      </Badge>
                    </div>

                    <div className="mt-4 space-y-2">
                      <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
                        <span>
                          {mission.progress} / {mission.target}
                        </span>
                        <span>
                          {mission.claimed
                            ? "تمت"
                            : mission.completed
                              ? "جاهزة"
                              : "قيد التنفيذ"}
                        </span>
                      </div>
                      <Progress value={getMissionProgressPercent(mission)} />
                    </div>

                    <div className="mt-4">
                      <Link href={mission.href}>
                        <Button variant="outline" className="gap-2">
                          {mission.ctaLabel}
                          <ArrowLeft className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </article>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[2rem] border border-slate-200 bg-white/96 shadow-soft">
            <CardContent className="space-y-5 p-8">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="section-eyebrow text-[#123B7A]">المستويات والإنجازات</p>
                  <h3 className="display-font text-2xl font-bold text-slate-950">
                    تطورك ظاهر أمامك
                  </h3>
                  <p className="mt-2 text-sm leading-7 text-slate-500">
                    XP ليس رقمًا فقط، بل مستوى وشارات وتقدم واضح نحو اللقب الأعلى.
                  </p>
                </div>
                <Badge className="bg-[#eef4ff] text-[#123B7A]">
                  {data.level.label}
                </Badge>
              </div>

              <div className="rounded-[1.5rem] border border-[#dbe6f6] bg-[linear-gradient(180deg,rgba(241,246,255,0.98),rgba(255,255,255,0.98))] p-5">
                <div className="flex items-center justify-between text-sm font-semibold text-slate-600">
                  <span>التقدم داخل المستوى الحالي</span>
                  <span>{data.level.progressPercent}%</span>
                </div>
                <div className="mt-3">
                  <Progress value={data.level.progressPercent} />
                </div>
                <div className="mt-3 text-sm text-slate-600">
                  {data.level.nextLevelLabel
                    ? `المستوى التالي: ${data.level.nextLevelLabel} • يتبقى ${formatXp(data.level.xpToNextLevel)} XP.`
                    : "أنت في أعلى مستوى حاليًا."}
                </div>
              </div>

              <div className="grid gap-4">
                {data.achievements.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  caption,
  icon: Icon,
}: {
  title: string;
  value: string;
  caption: string;
  icon: typeof Trophy;
}) {
  return (
    <div className="rounded-[1.7rem] border border-white/14 bg-white/10 p-5 text-white">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-xs font-semibold tracking-[0.14em] text-white/65">
            {title}
          </div>
          <div className="mt-3 display-font text-3xl font-extrabold">{value}</div>
          <div className="mt-2 text-sm leading-7 text-white/75">{caption}</div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-[1rem] bg-white/12">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function InfoCard({
  title,
  value,
  caption,
}: {
  title: string;
  value: string;
  caption: string;
}) {
  return (
    <div className="rounded-[1.4rem] border border-white/70 bg-white/85 p-4">
      <div className="text-xs font-semibold text-slate-500">{title}</div>
      <div className="mt-3 display-font text-2xl font-bold text-slate-950">{value}</div>
      <div className="mt-2 text-sm leading-7 text-slate-500">{caption}</div>
    </div>
  );
}
