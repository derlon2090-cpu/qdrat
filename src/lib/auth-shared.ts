export type UserGender = "male" | "female";

export type AuthSessionUser = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  gender: UserGender | null;
  role: "student" | "admin" | "editor" | "coach";
};

export type AuthSessionPayload = {
  authenticated: boolean;
  user: AuthSessionUser | null;
  expiresAt?: string | null;
};

export const AUTH_COOKIE_NAME = "miyaar_session";
