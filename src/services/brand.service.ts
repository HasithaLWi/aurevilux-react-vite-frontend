import { api } from "./api";
import type { Brand, BrandApp } from "../types";

export const BrandService = {
  // Get all registered luxury fashion houses
  getBrands: async (includeInactive: boolean = false): Promise<Brand[]> => {
    const { data } = await api.get<{ message: string; data: Brand[] }>("/brands", {
      params: { includeInactive },
    });
    return data.data;
  },

  // Get single brand house with story and collections
  getBrandById: async (idOrSlug: string): Promise<Brand> => {
    const { data } = await api.get<{ message: string; data: Brand }>(
      `/brands/${idOrSlug}`
    );
    return data.data;
  },

  // Create brand
  createBrand: async (brandData: Partial<Brand>): Promise<Brand> => {
    const { data } = await api.post<{ message: string; data: Brand }>("/brands", brandData);
    return data.data;
  },

  // Update brand
  updateBrand: async (id: string, brandData: Partial<Brand>): Promise<Brand> => {
    const { data } = await api.put<{ message: string; data: Brand }>(
      `/brands/${id}`,
      brandData
    );
    return data.data;
  },

  // Toggle active state
  toggleBrandActive: async (id: string): Promise<Brand> => {
    const { data } = await api.patch<{ message: string; data: Brand }>(
      `/brands/${id}/toggle-active`
    );
    return data.data;
  },

  // Delete brand (soft delete & purge Supabase logos)
  deleteBrand: async (id: string): Promise<void> => {
    await api.delete(`/brands/${id}`);
  },

  // Submit brand partnership application
  applyBrand: async (
    applicationData: Omit<BrandApp, "id" | "appliedDate" | "status">
  ): Promise<BrandApp> => {
    const { data } = await api.post<{ message: string; data: BrandApp }>(
      "/brands/apply",
      applicationData
    );
    return data.data;
  },
};
