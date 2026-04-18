export type AuthSessionUser = {
  id: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  role: "student" | "admin" | "editor" | "coach";
};

export type AuthSessionPayload = {
  authenticated: boolean;
  user: AuthSessionUser | null;
};

export const AUTH_COOKIE_NAME = "miyaar_session";
