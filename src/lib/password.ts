import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const PASSWORD_SALT_BYTES = 16;
const PASSWORD_KEY_LENGTH = 64;
const ZERO_WIDTH_CHARACTERS = /[\u200B-\u200D\u2060\uFEFF]/g;
const ARABIC_INDIC_DIGITS = "\u0660\u0661\u0662\u0663\u0664\u0665\u0666\u0667\u0668\u0669";
const EXTENDED_ARABIC_INDIC_DIGITS = "\u06F0\u06F1\u06F2\u06F3\u06F4\u06F5\u06F6\u06F7\u06F8\u06F9";

function convertDigitsToAscii(value: string) {
  return Array.from(value)
    .map((character) => {
      const arabicIndicIndex = ARABIC_INDIC_DIGITS.indexOf(character);
      if (arabicIndicIndex >= 0) {
        return String(arabicIndicIndex);
      }

      const extendedArabicIndicIndex = EXTENDED_ARABIC_INDIC_DIGITS.indexOf(character);
      if (extendedArabicIndicIndex >= 0) {
        return String(extendedArabicIndicIndex);
      }

      return character;
    })
    .join("");
}

function derivePasswordHash(password: string, salt: string) {
  return scryptSync(password, salt, PASSWORD_KEY_LENGTH).toString("hex");
}

function getPasswordCandidates(password: string) {
  const rawValue = password ?? "";
  const normalizedValue = normalizePasswordInput(rawValue);
  const trimmedRawValue = rawValue.trim();
  const trimmedNormalizedValue = normalizePasswordInput(trimmedRawValue);

  return [rawValue, normalizedValue, trimmedRawValue, trimmedNormalizedValue].filter(
    (candidate, index, allCandidates) => allCandidates.indexOf(candidate) === index,
  );
}

export function normalizePasswordInput(password: string) {
  return convertDigitsToAscii(password ?? "")
    .normalize("NFKC")
    .replace(ZERO_WIDTH_CHARACTERS, "")
    .trim();
}

export function isCurrentPasswordHash(storedHash: string | null | undefined) {
  if (!storedHash) return false;

  const [salt, existingHash, extra] = storedHash.split(":");
  return (
    !extra &&
    /^[0-9a-f]{32}$/i.test(salt ?? "") &&
    /^[0-9a-f]{128}$/i.test(existingHash ?? "")
  );
}

export function hashPassword(password: string) {
  const normalizedPassword = normalizePasswordInput(password);
  const salt = randomBytes(PASSWORD_SALT_BYTES).toString("hex");
  const derived = derivePasswordHash(normalizedPassword, salt);
  return `${salt}:${derived}`;
}

export function resolveVerifiedPasswordCandidate(password: string, storedHash: string | null | undefined) {
  if (!storedHash) return null;

  const candidates = getPasswordCandidates(password);

  if (!isCurrentPasswordHash(storedHash)) {
    return candidates.find((candidate) => candidate === storedHash) ?? null;
  }

  const [salt, existingHash] = storedHash.split(":");
  if (!salt || !existingHash) return null;

  const existingBuffer = Buffer.from(existingHash, "hex");
  if (!existingBuffer.length) return null;

  for (const candidate of candidates) {
    const incomingHash = derivePasswordHash(candidate, salt);
    const incomingBuffer = Buffer.from(incomingHash, "hex");

    if (incomingBuffer.length !== existingBuffer.length) {
      continue;
    }

    if (timingSafeEqual(incomingBuffer, existingBuffer)) {
      return candidate;
    }
  }

  return null;
}

export function verifyPassword(password: string, storedHash: string | null | undefined) {
  return resolveVerifiedPasswordCandidate(password, storedHash) !== null;
}
