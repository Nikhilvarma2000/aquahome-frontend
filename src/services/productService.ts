import { Product } from "@/types";
import api from "./api";

export const productService = {
    async getProducts(): Promise<Product[]> {
        try {
            const response = await api.get('/customer/orders');
            return response.data;
          } catch (error) {
            console.error('Get orders error:', error);
            throw error;
          }
    }
};