import { NextRequest, NextResponse } from "next/server";
import fs from "node:fs";
import { getMediaById } from "@/lib/media/repository";
import { resolveStoragePath } from "@/lib/media/storage";

export const dynamic = "force-dynamic";

type MediaRouteProps = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: NextRequest, { params }: MediaRouteProps) {
  try {
    const { id } = await params;

    if (!id || typeof id !== "string") {
      return new NextResponse("Not Found", { status: 404 });
    }

    const media = await getMediaById(id);
    if (!media) {
      return new NextResponse("Not Found", { status: 404 });
    }

    let filePath: string;
    try {
      filePath = resolveStoragePath(media.storageKey);
    } catch {
      // Path traversal or invalid key blocked
      return new NextResponse("Not Found", { status: 404 });
    }

    if (!fs.existsSync(filePath)) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const fileBuffer = fs.readFileSync(filePath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": media.mimeType,
        "Content-Length": fileBuffer.length.toString(),
        "Cache-Control": "public, max-age=31536000, immutable",
        "Content-Disposition": `inline; filename="${encodeURIComponent(
          media.originalFilename
        )}"`,
      },
    });
  } catch (error) {
    console.error("Failed to serve media file:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

