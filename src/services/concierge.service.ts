import { api } from "./api";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ConciergeChatResponse {
  reply: string;
  provider: "gemini" | "groq";
  model: string;
}

export interface ConciergeStatusResponse {
  name: string;
  title: string;
  enabled: boolean;
  activeProvider: "gemini" | "groq";
  welcomeMessage: string;
  providers: {
    gemini: { configured: boolean; model: string };
    groq: { configured: boolean; model: string };
  };
}

export const ConciergeService = {
  sendMessage: async (
    message: string,
    history: ChatMessage[] = []
  ): Promise<ConciergeChatResponse> => {
    const { data } = await api.post<{ success: boolean; data: ConciergeChatResponse }>(
      "/concierge/chat",
      { message, history }
    );
    return data.data;
  },

  getStatus: async (): Promise<ConciergeStatusResponse> => {
    const { data } = await api.get<{ success: boolean; data: ConciergeStatusResponse }>(
      "/concierge/status"
    );
    return data.data;
  },
};
