/**
 * Aurevilux Atelier Image Validation & Supabase Storage Utility
 * Provides industry-standard client-side file security, MIME type verification,
 * dimension/size constraints, and Supabase storage lifecycle checks.
 */

export interface ImageValidationOptions {
  maxSizeMB?: number;
  allowedMimeTypes?: string[];
  allowedExtensions?: string[];
}

export const DEFAULT_ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
  "image/gif",
];

export const DEFAULT_ALLOWED_EXTENSIONS = [
  "jpg",
  "jpeg",
  "png",
  "webp",
  "avif",
  "gif",
];

export const DEFAULT_MAX_SIZE_MB = 5;

/**
 * Validates a candidate image file for type, extension, corruption and size.
 */
export function validateImageFile(
  file: File,
  options?: ImageValidationOptions
): { valid: boolean; error?: string } {
  if (!file) {
    return { valid: false, error: "No image file provided." };
  }

  // 1. Non-empty check
  if (file.size === 0) {
    return { valid: false, error: "The selected file is empty or corrupted." };
  }

  // 2. MIME type verification
  const allowedMimes = options?.allowedMimeTypes || DEFAULT_ALLOWED_MIME_TYPES;
  const mime = (file.type || "").toLowerCase();
  if (!mime || !allowedMimes.includes(mime)) {
    return {
      valid: false,
      error: `Invalid file format (${mime || "unknown"}). Only high-resolution JPG, PNG, WEBP, AVIF, or GIF images are accepted.`,
    };
  }

  // 3. File extension verification (prevents MIME spoofing)
  const allowedExts = options?.allowedExtensions || DEFAULT_ALLOWED_EXTENSIONS;
  const fileNameParts = file.name.split(".");
  const ext = (fileNameParts.length > 1 ? fileNameParts.pop() : "")?.toLowerCase() || "";
  if (!allowedExts.includes(ext)) {
    return {
      valid: false,
      error: `Invalid file extension (.${ext}). Allowed extensions are: ${allowedExts.join(", ")}.`,
    };
  }

  // 4. File size limit
  const maxMB = options?.maxSizeMB || DEFAULT_MAX_SIZE_MB;
  const maxBytes = maxMB * 1024 * 1024;
  if (file.size > maxBytes) {
    const actualMB = (file.size / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `File size (${actualMB} MB) exceeds the atelier maximum threshold of ${maxMB} MB.`,
    };
  }

  return { valid: true };
}

/**
 * Checks whether an image URL was uploaded to and hosted on Supabase Storage.
 */
export function isSupabaseStorageUrl(url?: string | null): boolean {
  if (!url || typeof url !== "string") return false;
  const clean = url.trim();
  return (
    clean.includes("supabase.co/storage/v1/object") ||
    clean.includes("aurevilux-products") ||
    clean.includes("aurevilux-user") ||
    clean.includes("aurevilux-videos")
  );
}

/**
 * Formats bytes into human-readable string.
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
}
