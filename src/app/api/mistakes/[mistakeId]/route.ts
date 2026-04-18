import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUserFromRequest } from "@/lib/auth";
import { removeUserMistake } from "@/lib/user-mistakes";

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ mistakeId: string }> },
) {
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

  try {
    const { mistakeId } = await context.params;
    await removeUserMistake(user.id, Number(mistakeId));

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "تعذر حذف السؤال من قائمة الأخطاء.",
      },
      { status: 400 },
    );
  }
}
