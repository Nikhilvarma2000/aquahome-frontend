import { Product } from "@/types";
import api from "./api";

export const productService = {
  async getProducts(): Promise<Product[]> {
    try {
      const response = await api.get("products");
      return response.data;
    } catch (error) {
      console.error("Get products error:", error);
      throw error;
    }
  },

  async addProduct(product: Partial<Product>): Promise<Product> {
    try {
      const response = await api.post("admin/products", product);
      return response.data;
    } catch (error) {
      console.error("Add product error:", error);
      throw error;
    }
  },

  async updateProduct(
    id: number | undefined,
    product: Partial<Product>
  ): Promise<Product> {
    if (!id) {
      throw new Error("Product ID is undefined");
    }
    try {
      const response = await api.put(`admin/products/${id}`, product);
      return response.data;
    } catch (error) {
      console.error("Update product error:", error);
      throw error;
    }
  },

  async deleteProduct(id: number | undefined): Promise<void> {
    if (!id) {
      throw new Error("Product ID is undefined");
    }
    try {
      await api.delete(`admin/products/${id}`);
    } catch (error) {
      console.error("Delete product error:", error);
      throw error;
    }
  },

  async toggleProductStatus(id: number, isActive: boolean): Promise<Product> {
    if (!id) {
      throw new Error("Product ID is undefined");
    }
    try {
      const response = await api.patch(`admin/products/${id}/toggle-status`, {
        isActive, // ✅ send the updated status in body!
      });
      return response.data;
    } catch (error) {
      console.error("Toggle product status error:", error);
      throw error;
    }
  },
};
