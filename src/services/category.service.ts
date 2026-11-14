import { api } from "./api";
import type { Category } from "../types";

export const CategoryService = {
  // Get all luxury categories
  getCategories: async (department?: string): Promise<Category[]> => {
    const { data } = await api.get<{ message: string; data: Category[] }>(
      "/categories",
      { params: { department } }
    );
    return data.data;
  },

  // Get single category by ID or slug
  getCategoryById: async (idOrSlug: string): Promise<Category> => {
    const { data } = await api.get<{ message: string; data: Category }>(
      `/categories/${idOrSlug}`
    );
    return data.data;
  },

  // Create category
  createCategory: async (categoryData: Partial<Category>): Promise<Category> => {
    const { data } = await api.post<{ message: string; data: Category }>(
      "/categories",
      categoryData
    );
    return data.data;
  },

  // Update category
  updateCategory: async (id: string, categoryData: Partial<Category>): Promise<Category> => {
    const { data } = await api.put<{ message: string; data: Category }>(
      `/categories/${id}`,
      categoryData
    );
    return data.data;
  },

  // Delete category
  deleteCategory: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};
