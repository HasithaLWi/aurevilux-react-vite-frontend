import { api } from "./api";

export interface NewsletterSubscribeResponse {
  message: string;
  data?: {
    _id: string;
    email: string;
    isActive: boolean;
    subscribedAt: string;
  };
}

export const NewsletterService = {
  subscribe: async (email: string): Promise<NewsletterSubscribeResponse> => {
    const { data } = await api.post<NewsletterSubscribeResponse>("/newsletter/subscribe", {
      email,
    });
    return data;
  },

  unsubscribe: async (email: string): Promise<{ message: string }> => {
    const { data } = await api.post<{ message: string }>("/newsletter/unsubscribe", {
      email,
    });
    return data;
  },
};
