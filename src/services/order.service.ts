import { api } from "./api";
import type { Order } from "../types";

export interface CreateOrderPayload {
  orderNumber?: string;
  items: Array<{
    name: string;
    brand?: string;
    price: number;
    quantity: number;
    selectedColor?: string;
    selectedSize?: string;
    image?: string;
  }>;
  total: number;
  itemsCount: number;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  carrier?: string;
  paymentMethod?: string;
}

export const OrderService = {
  // Create a new luxury order
  createOrder: async (payload: CreateOrderPayload): Promise<Order> => {
    const { data } = await api.post<{ message: string; data: Order }>(
      "/orders",
      payload
    );
    return data.data;
  },

  // Get current user's order history
  getMyOrders: async (): Promise<Order[]> => {
    const { data } = await api.get<{ message: string; data: Order[] }>(
      "/orders/me"
    );
    return data.data;
  },

  // Get single order by ID or orderNumber
  getOrderById: async (orderId: string): Promise<Order> => {
    const { data } = await api.get<{ message: string; data: Order }>(
      `/orders/${orderId}`
    );
    return data.data;
  },

  // Admin: Get all orders across the atelier
  getAllOrdersAdmin: async (status?: string): Promise<Order[]> => {
    const { data } = await api.get<{ message: string; data: Order[] }>(
      "/orders/admin/all",
      { params: status ? { status } : {} }
    );
    return data.data;
  },

  // Admin: Update order status
  updateOrderStatus: async (
    orderId: string,
    status: string,
    notes?: string
  ): Promise<Order> => {
    const { data } = await api.patch<{ message: string; data: Order }>(
      `/orders/${orderId}/status`,
      { status, notes }
    );
    return data.data;
  },

  // Customer: Cancel an existing order (allowed before processing)
  cancelOrder: async (
    orderId: string,
    reason?: string
  ): Promise<Order> => {
    const { data } = await api.patch<{ message: string; data: Order }>(
      `/orders/${orderId}/cancel`,
      { reason }
    );
    return data.data;
  },

  // Admin: Update tracking & white-glove courier
  updateTracking: async (
    orderId: string,
    carrier: string,
    trackingNumber: string,
    estimatedDelivery?: string
  ): Promise<Order> => {
    const { data } = await api.patch<{ message: string; data: Order }>(
      `/orders/${orderId}/tracking`,
      { carrier, trackingNumber, estimatedDelivery }
    );
    return data.data;
  },
};

