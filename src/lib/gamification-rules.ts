const RIYADH_OFFSET_MS = 3 * 60 * 60 * 1000;
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const DOUBLE_XP_DAYS = new Set([4, 5]);
const ARABIC_DAY_NAMES = [
  "الأحد",
  "الاثنين",
  "الثلاثاء",
  "الأربعاء",
  "الخميس",
  "الجمعة",
  "السبت",
] as const;

export type XpMultiplierStatus = {
  active: boolean;
  multiplier: number;
  label: string;
  description: string;
  endsAt: string | null;
  nextStartsAt: string | null;
  nextLabel: string | null;
};

function toRiyadhPseudoUtc(referenceDate: Date) {
  return new Date(referenceDate.getTime() + RIYADH_OFFSET_MS);
}

function getRiyadhDay(referenceDate: Date) {
  return toRiyadhPseudoUtc(referenceDate).getUTCDay();
}

function startOfRiyadhDay(referenceDate: Date) {
  const shifted = toRiyadhPseudoUtc(referenceDate);
  return new Date(
    Date.UTC(
      shifted.getUTCFullYear(),
      shifted.getUTCMonth(),
      shifted.getUTCDate(),
    ) - RIYADH_OFFSET_MS,
  );
}

function addDays(baseDate: Date, days: number) {
  return new Date(baseDate.getTime() + days * DAY_IN_MS);
}

function findNextDoubleXpStart(referenceDate: Date) {
  const currentStart = startOfRiyadhDay(referenceDate);

  for (let offset = 1; offset <= 7; offset += 1) {
    const candidate = addDays(currentStart, offset);
    if (DOUBLE_XP_DAYS.has(getRiyadhDay(candidate))) {
      return candidate;
    }
  }

  return addDays(currentStart, 7);
}

export function getXpMultiplierStatus(referenceDate = new Date()): XpMultiplierStatus {
  const active = DOUBLE_XP_DAYS.has(getRiyadhDay(referenceDate));

  if (active) {
    const endsAt = addDays(startOfRiyadhDay(referenceDate), 1);

    return {
      active: true,
      multiplier: 2,
      label: "XP x2",
      description: "النقاط الإيجابية مضاعفة حتى نهاية اليوم.",
      endsAt: endsAt.toISOString(),
      nextStartsAt: null,
      nextLabel: "مضاعف الآن",
    };
  }

  const nextStartsAt = findNextDoubleXpStart(referenceDate);
  const nextDayName = ARABIC_DAY_NAMES[getRiyadhDay(nextStartsAt)];

  return {
    active: false,
    multiplier: 1,
    label: "XP x2",
    description: `يعود مضاعف النقاط يوم ${nextDayName}.`,
    endsAt: null,
    nextStartsAt: nextStartsAt.toISOString(),
    nextLabel: `يبدأ ${nextDayName}`,
  };
}

export function applyActiveXpMultiplier(points: number, referenceDate = new Date()) {
  if (points <= 0) {
    return points;
  }

  return points * getXpMultiplierStatus(referenceDate).multiplier;
}
