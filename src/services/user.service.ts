import { api } from "./api";
import type { UserProfile, SavedAddress, PaymentMethodCard } from "../types";

export const UserService = {
  // Get currently logged-in user profile with addresses & payment cards
  getUserProfile: async (): Promise<UserProfile> => {
    const { data } = await api.get<{ message: string; data: UserProfile }>(
      "/users/me"
    );
    return data.data;
  },

  // Update profile details
  updateUserProfile: async (
    profileData: Partial<UserProfile>
  ): Promise<UserProfile> => {
    const { data } = await api.put<{ message: string; data: UserProfile }>(
      "/users/me",
      profileData
    );
    return data.data;
  },

  // Change password
  changePassword: async (
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> => {
    const { data } = await api.put<{ message: string }>(
      "/users/me/password",
      { currentPassword, newPassword }
    );
    return data;
  },

  // Add saved delivery address
  addAddress: async (
    address: Omit<SavedAddress, "id">
  ): Promise<SavedAddress[]> => {
    const { data } = await api.post<{ message: string; data: SavedAddress[] }>(
      "/users/me/addresses",
      address
    );
    return data.data;
  },

  // Delete saved delivery address
  deleteAddress: async (addressId: string): Promise<SavedAddress[]> => {
    const { data } = await api.delete<{
      message: string;
      data: SavedAddress[];
    }>(`/users/me/addresses/${addressId}`);
    return data.data;
  },

  // Add saved payment card
  addCard: async (
    card: Omit<PaymentMethodCard, "id">
  ): Promise<PaymentMethodCard[]> => {
    const { data } = await api.post<{
      message: string;
      data: PaymentMethodCard[];
    }>("/users/me/cards", card);
    return data.data;
  },

  // Delete saved payment card
  deleteCard: async (cardId: string): Promise<PaymentMethodCard[]> => {
    const { data } = await api.delete<{
      message: string;
      data: PaymentMethodCard[];
    }>(`/users/me/cards/${cardId}`);
    return data.data;
  },
};

