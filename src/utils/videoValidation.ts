/**
 * Aurevilux Atelier Video Validation & Storage Utility
 * Provides client-side video file verification, MIME type inspection,
 * size checks, and Supabase video bucket lifecycle helpers.
 */

export interface VideoValidationOptions {
  maxSizeMB?: number;
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
}

export const DEFAULT_ALLOWED_VIDEO_MIMES = [
  "video/webm",
  "video/mp4",
  "video/quicktime",
  "video/x-matroska",
  "video/ogg",
  // Also permit high-res preview posters
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
];

export const DEFAULT_ALLOWED_VIDEO_EXTS = [
  "webm",
  "mp4",
  "mov",
  "mkv",
  "ogv",
  "webp",
  "jpg",
  "jpeg",
  "png",
];

export const DEFAULT_MAX_VIDEO_SIZE_MB = 100;

/**
 * Validates candidate video file for format, extension integrity, and size.
 */
export function validateVideoFile(
  file: File,
  options?: VideoValidationOptions
): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: "No video file provided." };
  }

  if (file.size === 0) {
    return { valid: false, error: "The selected video file is empty or corrupted." };
  }

  // 1. Extension check
  const allowedExts = options?.allowedExtensions || DEFAULT_ALLOWED_VIDEO_EXTS;
  const fileNameParts = file.name.split(".");
  const ext = (fileNameParts.length > 1 ? fileNameParts.pop() : "")?.toLowerCase() || "";
  if (!allowedExts.includes(ext)) {
    return {
      valid: false,
      error: `Invalid file extension (.${ext}). Allowed formats are: ${allowedExts.join(", ")}.`,
    };
  }

  // 2. MIME type check (allow if empty on some OS file-pickers provided extension is valid)
  const allowedMimes = options?.allowedMimeTypes || DEFAULT_ALLOWED_VIDEO_MIMES;
  const mime = (file.type || "").toLowerCase();
  if (mime && !allowedMimes.includes(mime)) {
    return {
      valid: false,
      error: `Unsupported MIME type (${mime}). Please provide a WebM, MP4, or HEVC video.`,
    };
  }

  // 3. File size limit
  const maxMB = options?.maxSizeMB || DEFAULT_MAX_VIDEO_SIZE_MB;
  const maxBytes = maxMB * 1024 * 1024;
  if (file.size > maxBytes) {
    const actualMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `Video size (${actualMB} MB) exceeds maximum allowed threshold of ${maxMB} MB.`,
    };
  }

  return { valid: true };
}

/**
 * Checks whether a video URL is hosted on Supabase Storage.
 */
export function isSupabaseStorageUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const clean = url.trim();
  return (
    clean.includes("supabase.co/storage/v1/object") ||
    clean.includes("aurevilux-videos") ||
    clean.includes("aurevilux-products") ||
    clean.includes("aurevilux-user")
  );
}
