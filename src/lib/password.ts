import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const PASSWORD_SALT_BYTES = 16;
const PASSWORD_KEY_LENGTH = 64;

export function hashPassword(password: string) {
  const salt = randomBytes(PASSWORD_SALT_BYTES).toString("hex");
  const derived = scryptSync(password, salt, PASSWORD_KEY_LENGTH).toString("hex");
  return `${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string | null | undefined) {
  if (!storedHash) return false;

  const [salt, existingHash] = storedHash.split(":");
  if (!salt || !existingHash) return false;

  const incomingHash = scryptSync(password, salt, PASSWORD_KEY_LENGTH).toString("hex");
  const incomingBuffer = Buffer.from(incomingHash, "hex");
  const existingBuffer = Buffer.from(existingHash, "hex");

  if (incomingBuffer.length !== existingBuffer.length) return false;
  return timingSafeEqual(incomingBuffer, existingBuffer);
}
