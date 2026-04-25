import { cookies } from "next/headers";

import { AUTH_COOKIE_NAME, type AuthSessionUser } from "@/lib/auth-shared";
import { getAuthenticatedUserFromToken } from "@/lib/auth";

export async function getInitialAuthUser(): Promise<AuthSessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_COOKIE_NAME)?.value?.trim();

  if (!token) {
    return null;
  }

  return getAuthenticatedUserFromToken(token);
}
