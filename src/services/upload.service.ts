import { api } from "./api";

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
  // Upload single image directly to Supabase cloud storage via backend
  uploadSingle: async (
    file: File,
    folder: string = "products",
    bucket?: string
  ): Promise<SupabaseUploadResponse["data"]> => {
    const formData = new FormData();
    formData.append("image", file);
    formData.append("folder", folder);
    if (bucket) {
      formData.append("bucket", bucket);
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

  // Upload user profile avatar specifically to the aurevilux-user bucket
  uploadAvatar: async (file: File): Promise<string> => {
    const res = await UploadService.uploadSingle(file, "avatars", "aurevilux-user");
    return res.publicUrl || (res as any).url || "";
  },

  // Delete image from Supabase cloud storage
  deleteImage: async (urlOrPath: string): Promise<void> => {
    await api.delete("/upload", {
      data: { url: urlOrPath },
    });
  },
};

