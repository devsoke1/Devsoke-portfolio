import "server-only";

import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import crypto from "node:crypto";

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

const EXTENSION_MAP: Record<AllowedMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

export function getMaxFileSizeMB(): number {
  const envVal = process.env.MEDIA_MAX_FILE_SIZE_MB;
  if (envVal) {
    const parsed = parseInt(envVal, 10);
    if (!isNaN(parsed) && parsed > 0) {
      return parsed;
    }
  }
  return 8; // Default: 8 MB
}

export function getMaxFileSizeBytes(): number {
  return getMaxFileSizeMB() * 1024 * 1024;
}

export function getMediaStorageDir(): string {
  const customDir = process.env.MEDIA_STORAGE_DIR?.trim();
  if (customDir) {
    return path.resolve(customDir);
  }
  // Default persistent location outside repository
  return path.resolve(path.join(os.homedir(), ".devsoke", "media"));
}

export function resolveStoragePath(storageKey: string): string {
  const baseDir = getMediaStorageDir();
  // Normalize and clean key
  const normalizedKey = storageKey.replace(/\\/g, "/").replace(/^\/+/, "");
  const targetPath = path.resolve(baseDir, normalizedKey);

  // Security: Ensure targetPath is strictly within baseDir
  const relative = path.relative(baseDir, targetPath);
  if (relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Invalid storage key: path traversal detected");
  }

  return targetPath;
}

/**
 * Validates binary magic bytes to verify genuine image content
 */
export function validateImageMagicBytes(buffer: Buffer, mimeType: string): boolean {
  if (buffer.length < 12) return false;

  if (mimeType === "image/jpeg") {
    // JPEG starts with FF D8 FF
    return buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff;
  }

  if (mimeType === "image/png") {
    // PNG starts with 89 50 4E 47 0D 0A 1A 0A
    return (
      buffer[0] === 0x89 &&
      buffer[1] === 0x50 &&
      buffer[2] === 0x4e &&
      buffer[3] === 0x47 &&
      buffer[4] === 0x0d &&
      buffer[5] === 0x0a &&
      buffer[6] === 0x1a &&
      buffer[7] === 0x0a
    );
  }

  if (mimeType === "image/webp") {
    // WebP: RIFF at 0..3 and WEBP at 8..11
    const riff = buffer.toString("ascii", 0, 4);
    const webp = buffer.toString("ascii", 8, 12);
    return riff === "RIFF" && webp === "WEBP";
  }

  return false;
}

/**
 * Extract image dimensions without third-party dependencies
 */
export function extractImageDimensions(
  buffer: Buffer,
  mimeType: string
): { width: number | null; height: number | null } {
  try {
    if (mimeType === "image/png" && buffer.length >= 24) {
      // PNG IHDR chunk stores width at 16..19, height at 20..23 (Big Endian)
      const width = buffer.readUInt32BE(16);
      const height = buffer.readUInt32BE(20);
      return { width, height };
    }

    if (mimeType === "image/jpeg") {
      let offset = 2;
      while (offset < buffer.length - 8) {
        if (buffer[offset] !== 0xff) {
          offset++;
          continue;
        }
        const marker = buffer[offset + 1];
        // SOF0 (0xC0) to SOF2 (0xC2) contain image dimensions
        if (marker === 0xc0 || marker === 0xc1 || marker === 0xc2) {
          const height = buffer.readUInt16BE(offset + 5);
          const width = buffer.readUInt16BE(offset + 7);
          return { width, height };
        }
        const segmentLength = buffer.readUInt16BE(offset + 2);
        offset += 2 + segmentLength;
      }
    }

    if (mimeType === "image/webp" && buffer.length >= 30) {
      const type = buffer.toString("ascii", 12, 16);
      if (type === "VP8 " && buffer.length >= 30) {
        // Lossy VP8
        const width = buffer.readUInt16LE(26) & 0x3fff;
        const height = buffer.readUInt16LE(28) & 0x3fff;
        return { width, height };
      } else if (type === "VP8L" && buffer.length >= 25) {
        // Lossless VP8L
        const b1 = buffer[21];
        const b2 = buffer[22];
        const b3 = buffer[23];
        const b4 = buffer[24];
        const width = 1 + (((b2 & 0x3f) << 8) | b1);
        const height = 1 + (((b4 & 0x0f) << 10) | (b3 << 2) | ((b2 & 0xc0) >> 6));
        return { width, height };
      } else if (type === "VP8X" && buffer.length >= 30) {
        // Extended VP8X
        const width = 1 + buffer.readUIntLE(24, 3);
        const height = 1 + buffer.readUIntLE(27, 3);
        return { width, height };
      }
    }
  } catch {
    // If header parsing fails, dimensions remain null safely
  }

  return { width: null, height: null };
}

export type SavedFileInfo = {
  storageKey: string;
  originalFilename: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
};

/**
 * Validates and saves an uploaded image buffer to persistent storage
 */
export async function saveUploadedFile(
  buffer: Buffer,
  originalFilename: string,
  declaredMimeType: string
): Promise<SavedFileInfo> {
  const maxBytes = getMaxFileSizeBytes();
  if (buffer.length === 0) {
    throw new Error("File is empty.");
  }
  if (buffer.length > maxBytes) {
    throw new Error(
      `File exceeds the ${getMaxFileSizeMB()} MB maximum allowed limit.`
    );
  }

  const mimeType = declaredMimeType.toLowerCase().trim() as AllowedMimeType;
  if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
    throw new Error(
      `Unsupported file format (${declaredMimeType}). Only JPEG, PNG, and WebP images are permitted.`
    );
  }

  const isValidMagic = validateImageMagicBytes(buffer, mimeType);
  if (!isValidMagic) {
    throw new Error("Invalid or corrupted image content.");
  }

  // Generate safe storage key: YYYY/MM/<random-id>.<ext>
  const now = new Date();
  const year = now.getFullYear().toString();
  const month = (now.getMonth() + 1).toString().padStart(2, "0");
  const ext = EXTENSION_MAP[mimeType] || "bin";
  const randomId = crypto.randomBytes(16).toString("hex");
  const storageKey = `${year}/${month}/${randomId}.${ext}`;

  const targetPath = resolveStoragePath(storageKey);
  const targetDir = path.dirname(targetPath);

  // Ensure directory exists
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Write file
  fs.writeFileSync(targetPath, buffer);

  // Extract dimensions
  const { width, height } = extractImageDimensions(buffer, mimeType);

  // Sanitize original filename for metadata display
  const sanitizedOriginalFilename = path
    .basename(originalFilename)
    .replace(/[^\w.\-\s]/g, "")
    .trim() || `image.${ext}`;

  return {
    storageKey,
    originalFilename: sanitizedOriginalFilename,
    mimeType,
    size: buffer.length,
    width,
    height,
  };
}

/**
 * Deletes a physical file from storage
 */
export async function deletePhysicalFile(storageKey: string): Promise<boolean> {
  try {
    const targetPath = resolveStoragePath(storageKey);
    if (fs.existsSync(targetPath)) {
      fs.unlinkSync(targetPath);
      return true;
    }
  } catch (error) {
    console.error(`Failed to delete physical file for key "${storageKey}":`, error);
  }
  return false;
}

