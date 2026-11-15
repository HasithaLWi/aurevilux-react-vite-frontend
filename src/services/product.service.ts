import { api } from "./api";
import type { Product, ProductReview } from "../types";

export interface ProductFilterParams {
  category?: string;
  department?: string;
  subcategory?: string;
  brand?: string;
  search?: string;
  sort?: "featured" | "price-asc" | "price-desc" | "newest" | "rating";
  limit?: number;
  page?: number;
  inStock?: boolean;
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  includeInactive?: boolean;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductsFetchResult {
  products: Product[];
  pagination: PaginationInfo;
}

export const ProductService = {
  // Get products with pagination metadata
  getPaginatedProducts: async (params?: ProductFilterParams & { q?: string }): Promise<ProductsFetchResult> => {
    const queryParams = {
      ...params,
      q: params?.search || params?.q,
    };
    const { data } = await api.get<{
      message: string;
      data: Product[];
      pagination?: PaginationInfo;
    }>("/products", { params: queryParams });

    return {
      products: data.data || [],
      pagination: data.pagination || {
        page: params?.page || 1,
        limit: params?.limit || 12,
        total: data.data?.length || 0,
        totalPages: Math.ceil((data.data?.length || 0) / (params?.limit || 12)) || 1,
      },
    };
  },

  // Get all products with optional filters
  getProducts: async (params?: ProductFilterParams): Promise<Product[]> => {
    const { data } = await api.get<{ message: string; data: Product[] }>("/products", {
      params,
    });
    return data.data || [];
  },

  // Get product by slug or ID
  getProductBySlug: async (slugOrId: string): Promise<Product> => {
    const { data } = await api.get<{ message: string; data: Product }>(
      `/products/${slugOrId}`
    );
    return data.data;
  },

  // Create new product (Admin / Atelier)
  createProduct: async (productData: Partial<Product>): Promise<Product> => {
    const { data } = await api.post<{ message: string; data: Product }>(
      "/products",
      productData
    );
    return data.data;
  },

  // Update existing product
  updateProduct: async (idOrSlug: string, productData: Partial<Product>): Promise<Product> => {
    const { data } = await api.put<{ message: string; data: Product }>(
      `/products/${idOrSlug}`,
      productData
    );
    return data.data;
  },

  // Toggle active visibility (hide/show in boutique)
  toggleProductActive: async (idOrSlug: string): Promise<Product> => {
    const { data } = await api.patch<{ message: string; data: Product }>(
      `/products/${idOrSlug}/toggle-active`
    );
    return data.data;
  },

  // Soft delete product and purge Supabase images
  deleteProduct: async (idOrSlug: string): Promise<void> => {
    await api.delete(`/products/${idOrSlug}`);
  },

  // Update stock level
  updateStock: async (slug: string, stockCount: number): Promise<Product> => {
    const { data } = await api.patch<{ message: string; data: Product }>(
      `/products/${slug}/stock`,
      { stockCount }
    );
    return data.data;
  },

  // Add review
  addReview: async (
    slug: string,
    review: Omit<ProductReview, "id" | "date">
  ): Promise<Product> => {
    const { data } = await api.post<{ message: string; data: Product }>(
      `/products/${slug}/reviews`,
      review
    );
    return data.data;
  },
};
