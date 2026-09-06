import { NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/session";
import { getAdminMediaList } from "@/lib/media/repository";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const media = await getAdminMediaList();

    return NextResponse.json({ success: true, media }, { status: 200 });
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Failed to list media:", err.message);
    return NextResponse.json(
      { success: false, error: "Failed to load media list." },
      { status: 500 }
    );
  }
}

