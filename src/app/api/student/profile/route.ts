import { NextRequest, NextResponse } from "next/server";

import { getAuthenticatedUserFromRequest, updateUserProfile } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          message: "يجب تسجيل الدخول أولًا للوصول إلى إعدادات الحساب.",
        },
        { status: 401 },
      );
    }

    return NextResponse.json({ ok: true, user });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "تعذر قراءة بيانات الحساب.",
      },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthenticatedUserFromRequest(request);

    if (!user) {
      return NextResponse.json(
        {
          ok: false,
          message: "يجب تسجيل الدخول أولًا لتحديث إعدادات الحساب.",
        },
        { status: 401 },
      );
    }

    const payload = (await request.json()) as {
      fullName?: string;
      email?: string | null;
      phone?: string | null;
      gender?: "male" | "female" | null;
      avatarData?: string | null;
    };

    const updatedUser = await updateUserProfile({
      userId: user.id,
      fullName: payload.fullName,
      email: payload.email,
      phone: payload.phone,
      gender: payload.gender,
      avatarData: payload.avatarData,
    });

    return NextResponse.json({ ok: true, user: updatedUser });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "تعذر حفظ تحديثات الحساب.",
      },
      { status: 500 },
    );
  }
}
