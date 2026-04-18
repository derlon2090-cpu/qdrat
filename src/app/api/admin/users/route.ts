import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import { listUserAccountsOverview } from "@/lib/user-accounts";

const ALLOWED_ROLES = new Set(["admin", "editor", "coach"]);

export async function GET(request: NextRequest) {
  const user = await getAuthenticatedUserFromRequest(request);

  if (!user) {
    return NextResponse.json(
      {
        ok: false,
        message: "يجب تسجيل الدخول أولًا.",
      },
      { status: 401 },
    );
  }

  if (!ALLOWED_ROLES.has(user.role)) {
    return NextResponse.json(
      {
        ok: false,
        message: "ليس لديك صلاحية الوصول إلى بيانات المستخدمين.",
      },
      { status: 403 },
    );
  }

  try {
    const items = await listUserAccountsOverview();
    return NextResponse.json({
      ok: true,
      items,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "تعذر تحميل بيانات المستخدمين.",
      },
      { status: 500 },
    );
  }
}
