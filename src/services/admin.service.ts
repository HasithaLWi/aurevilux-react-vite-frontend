import { api } from "./api";
import type {
  BrandApp,
  WebsiteFeedback,
  NewsletterSubscriber,
  CustomerRecord,
} from "../types";

export interface AnalyticsData {
  totalRevenue: number;
  todayRevenue: number;
  ordersCount: number;
  todayOrdersCount: number;
  pendingOrdersCount: number;
  productsCount: number;
  lowStockCount: number;
  customersCount: number;
  conversionRate: number;
}

export interface ReviewModerationItem {
  reviewId: string;
  productId: string;
  productName: string;
  productBrand: string;
  name: string;
  rating: number;
  comment: string;
  date: string;
}

export interface StaffRosterResponse {
  staff: Array<{
    _id: string;
    id?: string;
    name: string;
    email: string;
    username: string;
    roles: string[];
    isActive: boolean;
    avatarUrl?: string;
    createdAt: string;
  }>;
  invites: Array<{
    _id: string;
    email: string;
    role: string;
    token: string;
    invitedBy: string;
    expiresAt: string;
    used: boolean;
  }>;
}

export const AdminService = {
  // Get dashboard performance metrics
  getAnalytics: async (): Promise<AnalyticsData> => {
    const { data } = await api.get<{ message: string; data: AnalyticsData }>(
      "/admin/analytics"
    );
    return data.data;
  },

  // Get brand partnership submissions
  getBrandApplications: async (): Promise<BrandApp[]> => {
    const { data } = await api.get<{ message: string; data: BrandApp[] }>(
      "/admin/brand-applications"
    );
    return data.data;
  },

  // Review & decision on brand application
  updateBrandApplication: async (
    id: string,
    status: "Approved" | "Rejected",
    notes?: string
  ): Promise<BrandApp> => {
    const { data } = await api.patch<{ message: string; data: BrandApp }>(
      `/admin/brand-applications/${id}/status`,
      { status, notes }
    );
    return data.data;
  },

  // Product reviews moderation
  getReviewsForModeration: async (): Promise<ReviewModerationItem[]> => {
    const { data } = await api.get<{
      message: string;
      data: ReviewModerationItem[];
    }>("/admin/reviews");
    return data.data;
  },

  deleteReview: async (reviewId: string): Promise<void> => {
    await api.delete(`/admin/reviews/${reviewId}`);
  },

  // Website & Boutique Feedback (for Testimonials featuring)
  getAllFeedback: async (): Promise<WebsiteFeedback[]> => {
    const { data } = await api.get<{ message: string; data: WebsiteFeedback[] }>(
      "/feedback/admin"
    );
    return data.data;
  },

  toggleFeatureFeedback: async (id: string): Promise<WebsiteFeedback> => {
    const { data } = await api.patch<{ message: string; data: WebsiteFeedback }>(
      `/feedback/admin/${id}/feature`
    );
    return data.data;
  },

  deleteFeedback: async (id: string): Promise<void> => {
    await api.delete(`/feedback/admin/${id}`);
  },

  // Staff & RBAC Management
  getStaffRoster: async (): Promise<StaffRosterResponse> => {
    const { data } = await api.get<{ message: string; data: StaffRosterResponse }>(
      "/admin/staff"
    );
    return data.data;
  },

  inviteStaff: async (email: string, role: string) => {
    const { data } = await api.post<{
      message: string;
      data: { email: string; role: string; token: string; inviteUrl: string };
    }>("/admin/staff/invite", { email, role });
    return data;
  },

  updateStaff: async (id: string, updates: any) => {
    const { data } = await api.patch<{ message: string; data: any }>(
      `/admin/staff/${id}`,
      updates
    );
    return data.data;
  },

  deleteStaff: async (id: string) => {
    const { data } = await api.delete<{ message: string }>(`/admin/staff/${id}`);
    return data;
  },

  toggleStaffActive: async (id: string) => {
    const { data } = await api.patch<{ message: string; data: any }>(
      `/admin/staff/${id}/toggle-active`
    );
    return data.data;
  },

  // Staff Approval Queue
  getPendingStaffApprovals: async (): Promise<any[]> => {
    const { data } = await api.get<{ data: any[] }>("/admin/staff/pending-approvals");
    return data.data;
  },

  approveStaff: async (id: string): Promise<any> => {
    const { data } = await api.patch<{ message: string; data: any }>(
      `/admin/staff/${id}/approve`
    );
    return data.data;
  },

  rejectStaff: async (id: string): Promise<any> => {
    const { data } = await api.patch<{ message: string; data: any }>(
      `/admin/staff/${id}/reject`
    );
    return data.data;
  },

  revokeInvite: async (id: string): Promise<void> => {
    await api.delete(`/admin/invites/${id}`);
  },

  // Customers Directory
  getCustomers: async (): Promise<CustomerRecord[]> => {
    const { data } = await api.get<{ message: string; data: CustomerRecord[] }>(
      "/admin/customers"
    );
    return data.data;
  },

  toggleCustomerActive: async (id: string): Promise<any> => {
    const { data } = await api.patch<{ message: string; data: any }>(
      `/admin/customers/${id}/toggle-active`
    );
    return data.data;
  },

  // Newsletter
  getNewsletterSubscribers: async (): Promise<NewsletterSubscriber[]> => {
    const { data } = await api.get<{ message: string; data: NewsletterSubscriber[] }>(
      "/newsletter/admin/subscribers"
    );
    return data.data;
  },

  toggleNewsletterSubscriber: async (id: string): Promise<NewsletterSubscriber> => {
    const { data } = await api.patch<{ message: string; data: NewsletterSubscriber }>(
      `/newsletter/admin/subscribers/${id}/status`
    );
    return data.data;
  },

  deleteNewsletterSubscriber: async (id: string): Promise<void> => {
    await api.delete(`/newsletter/admin/subscribers/${id}`);
  },

  unsubscribeNewsletter: async (email: string): Promise<{ message: string }> => {
    const { data } = await api.post<{ message: string }>("/newsletter/unsubscribe", { email });
    return data;
  },

  broadcastNewsletter: async (subject: string, content: string) => {
    const { data } = await api.post<{ message: string; recipientsCount: number }>(
      "/newsletter/admin/broadcast",
      { subject, content }
    );
    return data;
  },
};
