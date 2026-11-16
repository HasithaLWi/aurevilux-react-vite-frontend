import { api } from "./api";

export interface FeedbackData {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  role?: string;
  rating: number;
  comment: string;
  isFeatured?: boolean;
  status?: "pending" | "approved" | "archived";
  createdAt?: string;
}

export const FeedbackService = {
  submitFeedback: async (feedback: {
    name: string;
    email: string;
    role?: string;
    rating: number;
    comment: string;
  }): Promise<FeedbackData> => {
    const { data } = await api.post<{ message: string; data: FeedbackData }>(
      "/feedback",
      feedback
    );
    return data.data;
  },

  getFeaturedTestimonials: async (): Promise<FeedbackData[]> => {
    try {
      const { data } = await api.get<{ message: string; data: FeedbackData[] }>(
        "/feedback/testimonials"
      );
      return data.data;
    } catch (err) {
      console.warn("Could not fetch testimonials, fallback:", err);
      return [];
    }
  },

  getAllFeedbackAdmin: async (): Promise<FeedbackData[]> => {
    const { data } = await api.get<{ message: string; data: FeedbackData[] }>(
      "/feedback/admin"
    );
    return data.data;
  },

  toggleFeature: async (id: string): Promise<FeedbackData> => {
    const { data } = await api.patch<{ message: string; data: FeedbackData }>(
      `/feedback/admin/${id}/feature`
    );
    return data.data;
  },

  deleteFeedback: async (id: string): Promise<void> => {
    await api.delete(`/feedback/admin/${id}`);
  },
};
