import { api } from "./api";

export interface CourierPartner {
  _id?: string;
  id?: string;
  name: string;
  code: string;
  serviceType: string;
  trackingUrlTemplate?: string;
  supportContact?: string;
  logo?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const CourierService = {
  // Retrieve list of active or all courier partners
  getAllCouriers: async (includeInactive: boolean = true): Promise<CourierPartner[]> => {
    try {
      const { data } = await api.get<{ message: string; data: CourierPartner[] }>(
        `/couriers${includeInactive ? "?includeInactive=true" : ""}`
      );
      return data.data;
    } catch (err) {
      console.warn("Could not fetch couriers, using fallback:", err);
      return [
        {
          _id: "mock-1",
          name: "DHL Express Elite",
          code: "DHL",
          serviceType: "Next-Day Air Concierge",
          trackingUrlTemplate: "https://www.dhl.com/en/express/tracking.html?AWB={TRACKING}",
          isActive: true,
        },
        {
          _id: "mock-2",
          name: "Ferrari Logistics",
          code: "FERRARI",
          serviceType: "Armored Vault Transit",
          trackingUrlTemplate: "https://www.ferrarigroup.net/track?awb={TRACKING}",
          isActive: true,
        },
        {
          _id: "mock-3",
          name: "FedEx Private Luxe",
          code: "FEDEX",
          serviceType: "Priority White-Glove",
          trackingUrlTemplate: "https://www.fedex.com/fedextrack/?trknbr={TRACKING}",
          isActive: true,
        },
      ];
    }
  },

  // Create a new courier partner
  createCourier: async (courierData: Partial<CourierPartner>): Promise<CourierPartner> => {
    const { data } = await api.post<{ message: string; data: CourierPartner }>(
      "/couriers",
      courierData
    );
    return data.data;
  },

  // Update an existing courier partner
  updateCourier: async (id: string, courierData: Partial<CourierPartner>): Promise<CourierPartner> => {
    const { data } = await api.put<{ message: string; data: CourierPartner }>(
      `/couriers/${id}`,
      courierData
    );
    return data.data;
  },

  // Toggle active status
  toggleActive: async (id: string): Promise<CourierPartner> => {
    const { data } = await api.patch<{ message: string; data: CourierPartner }>(
      `/couriers/${id}/toggle-active`
    );
    return data.data;
  },

  // Delete a courier partner
  deleteCourier: async (id: string): Promise<void> => {
    await api.delete(`/couriers/${id}`);
  },

  // Generates clickable live courier tracking URL
  getTrackingUrl: (template: string, trackingNumber: string): string => {
    if (!template || !trackingNumber) return "";
    return template.replace("{TRACKING}", encodeURIComponent(trackingNumber.trim()));
  },
};
