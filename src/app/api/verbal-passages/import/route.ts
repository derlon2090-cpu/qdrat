import { NextRequest, NextResponse } from "next/server";

import { importPassages } from "@/lib/verbal-passages";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const preview = formData.get("preview") === "1";

    if (!(file instanceof File)) {
      return NextResponse.json(
        {
          ok: false,
          message: "أرفق ملف JSON أو CSV أولًا.",
        },
        { status: 400 },
      );
    }

    const summary = await importPassages(file.name, await file.text(), { preview });

    return NextResponse.json({
      ok: true,
      preview,
      summary,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "تعذر استيراد ملف القطع اللفظية.",
      },
      { status: 500 },
    );
  }
}
