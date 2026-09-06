import { NextRequest, NextResponse } from "next/server";
import { getCurrentAdmin } from "@/lib/auth/session";
import { saveUploadedFile } from "@/lib/media/storage";
import { createMediaRecord } from "@/lib/media/repository";
import { revalidateMediaPaths } from "@/lib/media/revalidation";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json(
        { success: false, error: "Authentication required to upload media." },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");
    const alt = formData.get("alt") ? String(formData.get("alt")) : null;

    if (!file || !(file instanceof File)) {
      return NextResponse.json(
        { success: false, error: "No image file provided." },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (buffer.length === 0) {
      return NextResponse.json(
        { success: false, error: "Uploaded file is empty." },
        { status: 400 }
      );
    }

    // Save physical file with security validation
    const savedInfo = await saveUploadedFile(buffer, file.name, file.type);

    // Create database record with compensation on failure
    const mediaItem = await createMediaRecord(savedInfo, alt);

    revalidateMediaPaths();

    return NextResponse.json(
      { success: true, media: mediaItem },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as Error;
    console.error("Upload error:", err.message);
    return NextResponse.json(
      {
        success: false,
        error: err.message || "Failed to process image upload.",
      },
      { status: 400 }
    );
  }
}

