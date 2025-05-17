import api from "./api";
import {
  CustomerDashboardData,
  Order,
  Subscription,
  ServiceRequest,
  WaterQualityData,
  User,
} from "../types";

export const customerService = {
  // Get customer dashboard data
  async getDashboardData(): Promise<CustomerDashboardData> {
    return {
      user: await this.getUser(),
      activeSubscriptions: (await this.getSubscriptions()).filter(
        (subscription) => subscription.status === "active"
      ),
      activeServiceRequests: (await this.getServiceRequests()).filter(
        (serviceRequest) =>
          serviceRequest.status !== "completed" &&
          serviceRequest.status !== "cancelled"
      ),
      pendingOrders: (await this.getOrders()).filter(
        (order) => order.status === "pending"
      ),
    };
  },

  async getUser(): Promise<User> {
    try {
      const response = await api.get("/profile");
      return response.data;
    } catch (error) {
      console.error("Get User error:", error);
      throw error;
    }
  },

  async getOrders(): Promise<Order[]> {
    try {
      const response = await api.get("/orders/customer");
      return response.data;
    } catch (error) {
      console.error("Get orders error:", error);
      throw error;
    }
  },

  async getOrderById(orderId: number): Promise<Order> {
    try {
      const response = await api.get(`/orders/${orderId}`);
      return response.data;
    } catch (error) {
      console.error("Get order by id error:", error);
      throw error;
    }
  },

  async placeOrder(orderData: {
    product_id: number;
    franchise_id: number;
    shipping_address: string;
    billing_address: string;
    rental_duration: number;
    notes: string;
  }): Promise<Order> {
    try {
      const response = await api.post("/orders", orderData);
      return response.data;
    } catch (error) {
      console.error("Place order error:", error);
      throw error;
    }
  },

  async cancelOrder(orderId: number): Promise<{ message: string }> {
    try {
      const response = await api.post(`/orders/${orderId}/cancel`);
      return response.data;
    } catch (error) {
      console.error("Cancel order error:", error);
      throw error;
    }
  },

  async getSubscriptions(): Promise<Subscription[]> {
    try {
      const response = await api.get("/subscriptions/customer");
      return response.data;
    } catch (error) {
      console.error("Get subscriptions error:", error);
      throw error;
    }
  },

  async getSubscriptionById(subscriptionId: string): Promise<Subscription> {
    try {
      const response = await api.get(`/subscriptions/${subscriptionId}`);
      return response.data;
    } catch (error) {
      console.error("Get subscription by id error:", error);
      throw error;
    }
  },

  async cancelSubscription(
    subscriptionId: string
  ): Promise<{ message: string }> {
    try {
      const response = await api.post(
        `/customer/subscriptions/${subscriptionId}/cancel`
      );
      return response.data;
    } catch (error) {
      console.error("Cancel subscription error:", error);
      throw error;
    }
  },

  async pauseSubscription(
    subscriptionId: string,
    resumeDate?: string
  ): Promise<Subscription> {
    try {
      const response = await api.post(
        `/customer/subscriptions/${subscriptionId}/pause`,
        { resumeDate }
      );
      return response.data;
    } catch (error) {
      console.error("Pause subscription error:", error);
      throw error;
    }
  },

  async resumeSubscription(subscriptionId: string): Promise<Subscription> {
    try {
      const response = await api.post(
        `/customer/subscriptions/${subscriptionId}/resume`
      );
      return response.data;
    } catch (error) {
      console.error("Resume subscription error:", error);
      throw error;
    }
  },

  async getServiceRequests(): Promise<ServiceRequest[]> {
    try {
      const response = await api.get("/services");
      return response.data;
    } catch (error) {
      console.error("Get service requests error:", error);
      throw error;
    }
  },

  async getServiceRequestById(
    serviceRequestId: string
  ): Promise<ServiceRequest> {
    try {
      const response = await api.get(
        `/customer/service-requests/${serviceRequestId}`
      );
      return response.data;
    } catch (error) {
      console.error("Get service request by id error:", error);
      throw error;
    }
  },

  async createServiceRequest(
    serviceData: Partial<ServiceRequest>
  ): Promise<ServiceRequest> {
    try {
      const response = await api.post(
        "/customer/service-requests",
        serviceData
      );
      return response.data;
    } catch (error) {
      console.error("Create service request error:", error);
      throw error;
    }
  },

  async cancelServiceRequest(
    serviceRequestId: string
  ): Promise<{ message: string }> {
    try {
      const response = await api.post(
        `/customer/service-requests/${serviceRequestId}/cancel`
      );
      return response.data;
    } catch (error) {
      console.error("Cancel service request error:", error);
      throw error;
    }
  },

  async submitServiceFeedback(
    serviceRequestId: string,
    feedback: string,
    rating: number
  ): Promise<ServiceRequest> {
    try {
      const response = await api.post(
        `/customer/service-requests/${serviceRequestId}/feedback`,
        { feedback, rating }
      );
      return response.data;
    } catch (error) {
      console.error("Submit service feedback error:", error);
      throw error;
    }
  },

  async getWaterQualityData(subscriptionId: string): Promise<WaterQualityData> {
    try {
      const response = await api.get(
        `/customer/subscriptions/${subscriptionId}/water-quality`
      );
      return response.data;
    } catch (error) {
      console.error("Get water quality data error:", error);
      throw error;
    }
  },

  // Generate Initial Payment Razorpay Order
  async generateInitialPaymentOrder(orderId: number) {
    const response = await api.post("/payments/generate-order", {
      order_id: orderId,
    });
    return response.data;
  },

  //  Generate Monthly Subscription Razorpay Order
  async generateMonthlyPayment(subscriptionId: number) {
    const response = await api.post("/payments/generate-monthly", {
      subscription_id: subscriptionId,
    });
    return response.data;
  },

  //  Verify Payment After Success
  async verifyPayment(data: {
    payment_id: string;
    order_id: string;
    signature: string;
    aquahome_order_id?: number;
    subscription_id?: number;
  }) {
    const response = await api.post("/payments/verify", data);
    return response.data;
  },

  //  Get Payment History for Logged-in User
  async getPaymentHistory() {
    const response = await api.get("/payments");
    return response.data;
  },

  //  Get Payment By ID
  async getPaymentById(id: number) {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },
};
