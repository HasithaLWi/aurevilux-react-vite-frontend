import { api } from "./api";
import {
  validateImageFile,
  isSupabaseStorageUrl,
  type ImageValidationOptions,
} from "../utils/imageValidation";
import {
  validateVideoFile,
  type VideoValidationOptions,
} from "../utils/videoValidation";

export interface SupabaseUploadResponse {
  message: string;
  data: {
    url?: string;
    publicUrl: string;
    path: string;
    fullPath?: string;
    bucket: string;
    fileName: string;
    size: number;
    mimeType?: string;
  };
}

export const UploadService = {
  // Upload single image directly to Supabase cloud storage via backend,
  // optionally purging any previous Supabase image URL passed in previousUrl
  uploadSingle: async (
    file: File,
    folder: string = "products",
    bucket?: string,
    previousUrl?: string
  ): Promise<SupabaseUploadResponse["data"]> => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("folder", folder);
    if (bucket) {
      formData.append("bucket", bucket);
    }
    if (previousUrl && isSupabaseStorageUrl(previousUrl)) {
      formData.append("previousUrl", previousUrl);
    }

    const { data } = await api.post<SupabaseUploadResponse>(
      "/upload/single",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const result = data.data;
    if (result && !result.publicUrl && (result as any).url) {
      result.publicUrl = (result as any).url;
    }

    return result;
  },

  // High-level safe image upload with client-side validation and atomic replacement
  uploadAndReplace: async (
    file: File,
    options: {
      folder?: string;
      bucket?: string;
      previousUrl?: string;
      validation?: ImageValidationOptions;
    } = {}
  ): Promise<SupabaseUploadResponse["data"]> => {
    const {
      folder = "products",
      bucket = "aurevilux-products",
      previousUrl,
      validation,
    } = options;

    const valResult = validateImageFile(file, validation);
    if (!valResult.valid) {
      throw new Error(valResult.error || "Selected file failed image validation.");
    }

    return await UploadService.uploadSingle(file, folder, bucket, previousUrl);
  },

  // Upload user profile avatar specifically to the aurevilux-user bucket
  uploadAvatar: async (file: File, previousUrl?: string): Promise<string> => {
    const res = await UploadService.uploadAndReplace(file, {
      folder: "avatars",
      bucket: "aurevilux-user",
      previousUrl,
      validation: { maxSizeMB: 5 },
    });
    return res.publicUrl || (res as any).url || "";
  },

  // Upload single video directly to Supabase video bucket (aurevilux-videos) via backend
  uploadVideo: async (
    file: File,
    folder: string = "videos",
    bucket: string = "aurevilux-videos",
    previousUrl?: string
  ): Promise<SupabaseUploadResponse["data"]> => {
    const formData = new FormData();
    formData.append("video", file);
    formData.append("folder", folder);
    formData.append("bucket", bucket);
    if (previousUrl && isSupabaseStorageUrl(previousUrl)) {
      formData.append("previousUrl", previousUrl);
    }

    const { data } = await api.post<SupabaseUploadResponse>(
      "/upload/video",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    const result = data.data;
    if (result && !result.publicUrl && (result as any).url) {
      result.publicUrl = (result as any).url;
    }

    return result;
  },

  // High-level safe video upload with client-side validation and automatic replacement
  uploadVideoAndReplace: async (
    file: File,
    options: {
      folder?: string;
      bucket?: string;
      previousUrl?: string;
      validation?: VideoValidationOptions;
    } = {}
  ): Promise<SupabaseUploadResponse["data"]> => {
    const {
      folder = "videos",
      bucket = "aurevilux-videos",
      previousUrl,
      validation,
    } = options;

    const valResult = validateVideoFile(file, validation);
    if (!valResult.valid) {
      throw new Error(valResult.error || "Selected file failed video validation.");
    }

    return await UploadService.uploadVideo(file, folder, bucket, previousUrl);
  },

  // Delete image or video from Supabase cloud storage if it exists on Supabase
  deleteImage: async (urlOrPath: string): Promise<void> => {
    if (!urlOrPath || !isSupabaseStorageUrl(urlOrPath)) {
      return; // Not a Supabase storage asset; skip safely
    }
    await api.delete("/upload", {
      data: { url: urlOrPath },
    });
  },

  // Alias for deleting video
  deleteVideo: async (urlOrPath: string): Promise<void> => {
    return UploadService.deleteImage(urlOrPath);
  },
};
